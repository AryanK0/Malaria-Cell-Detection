from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import base64
from io import BytesIO
import json
import os
import random
import time
import urllib.error
import urllib.request

import numpy as np
from PIL import Image

try:
    from .lite_model import LiteMalariaModel
except ImportError:
    from lite_model import LiteMalariaModel

try:
    import cv2
except ImportError:
    cv2 = None

try:
    import tensorflow as tf
except ImportError:
    tf = None

app = FastAPI(title="Malaria Cell Detection")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "best_model.h5")
IMG_SIZE = (128, 128)
RESAMPLE_BILINEAR = getattr(Image, "Resampling", Image).BILINEAR
SAMPLE_DIRS = (
    os.path.join(os.path.dirname(BASE_DIR), "frontend", "public", "samples"),
    os.path.join(os.path.dirname(BASE_DIR), "frontend", "dist", "samples"),
)
SAMPLE_EXTENSIONS = {".png", ".jpg", ".jpeg"}


def read_setting(name, default=""):
    value = os.getenv(name)
    if value:
        return value.strip()

    for env_path in (os.path.join(BASE_DIR, ".env"), os.path.join(os.path.dirname(BASE_DIR), ".env")):
        if not os.path.exists(env_path):
            continue
        with open(env_path, "r", encoding="utf-8") as env_file:
            for line in env_file:
                clean = line.strip()
                if not clean or clean.startswith("#") or "=" not in clean:
                    continue
                key, raw_value = clean.split("=", 1)
                if key.strip() == name:
                    return raw_value.strip().strip('"').strip("'")

    return default


def normalize_gemini_model(model_name):
    aliases = {
        "latest": "gemini-2.5-flash",
        "gemini-latest": "gemini-2.5-flash",
        "gemini-flash-latest": "gemini-2.5-flash",
    }
    return aliases.get(model_name.strip(), model_name.strip())


GEMINI_API_KEY = read_setting("GEMINI_API_KEY")
GEMINI_MODEL = normalize_gemini_model(read_setting("GEMINI_MODEL", "gemini-2.5-flash"))
GEMINI_TIMEOUT = float(read_setting("GEMINI_TIMEOUT", "4"))

model = None
gradcam_model = None
lite_model = None


@app.on_event("startup")
def load_model():
    global model, gradcam_model, lite_model
    
    # Search for the model in multiple common locations
    possible_paths = [
        MODEL_PATH,
        os.path.join(BASE_DIR, "model", "best_model.keras"),
        os.path.join(os.path.dirname(BASE_DIR), "best_model.h5"),
        os.path.join(os.path.dirname(BASE_DIR), "best_model.keras"),
    ]
    
    found_path = None
    for path in possible_paths:
        if os.path.exists(path):
            found_path = path
            break
            
    if not found_path:
        print(f"Warning: Model not found in any of {possible_paths}")
        return

    try:
        if tf is not None and not os.getenv("VERCEL"):
            print(f"Loading TensorFlow model from {found_path}...")
            model = tf.keras.models.load_model(found_path, compile=False)
            conv_layers = [layer.name for layer in model.layers if isinstance(layer, tf.keras.layers.Conv2D)]
            if conv_layers:
                gradcam_model = tf.keras.models.Model(
                    inputs=model.inputs,
                    outputs=[model.get_layer(conv_layers[-1]).output, model.outputs[0]],
                )
            dummy = np.zeros((1, IMG_SIZE[1], IMG_SIZE[0], 3), dtype=np.float32)
            model(tf.convert_to_tensor(dummy), training=False)
            print("TensorFlow model loaded successfully.")
            return

        print(f"Loading Lite model from {found_path}...")
        lite_model = LiteMalariaModel(found_path)
        print("Lite model loaded successfully.")
    except Exception as e:
        print(f"Error loading model from {found_path}: {e}")



def encode_png(image_array):
    image = Image.fromarray(image_array.astype(np.uint8))
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def predict_uninfected_probability(input_batch):
    if model is None:
        raise RuntimeError("TensorFlow model is not loaded.")
    prediction = model(tf.convert_to_tensor(input_batch), training=False).numpy()
    return float(prediction[0][0])


def build_gradcam(input_batch, original_resized, predicted_label):
    if gradcam_model is None or tf is None or cv2 is None:
        return original_resized

    with tf.GradientTape() as tape:
        conv_outputs, predictions = gradcam_model(tf.convert_to_tensor(input_batch), training=False)
        uninfected_score = predictions[:, 0]
        class_score = 1 - uninfected_score if predicted_label == "Parasitized" else uninfected_score

    gradients = tape.gradient(class_score, conv_outputs)
    if gradients is None:
        return original_resized

    pooled_gradients = tf.reduce_mean(gradients, axis=(0, 1, 2))
    conv_outputs = conv_outputs[0]
    heatmap = tf.reduce_sum(conv_outputs * pooled_gradients, axis=-1)
    heatmap = np.maximum(heatmap.numpy(), 0)

    max_value = np.max(heatmap)
    if max_value > 0:
        heatmap = heatmap / max_value

    heatmap = cv2.resize(heatmap, IMG_SIZE)
    heatmap = np.uint8(255 * heatmap)
    heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)
    return cv2.addWeighted(original_resized, 0.6, heatmap_color, 0.4, 0)


def local_interpretation(label, confidence, probability_parasitized, probability_uninfected):
    confidence_pct = confidence * 100
    parasitized_pct = probability_parasitized * 100
    uninfected_pct = probability_uninfected * 100
    strength = "high" if confidence >= 0.85 else "moderate" if confidence >= 0.7 else "low"

    if label == "Parasitized":
        return (
            "Likely parasite signal inside the cell.\n"
            f"Evidence: {parasitized_pct:.1f}% parasitized probability; inspect heatmap focus over stained inclusions or ring-like dots.\n"
            f"Advice: {strength} confidence ({confidence_pct:.1f}%). Use as screening support and recheck blur, debris, or overlapping cells."
        )

    return (
        "Likely clean red blood cell.\n"
        f"Evidence: {uninfected_pct:.1f}% uninfected probability; check that heatmap focus stays on the cell body without dark parasite-like inclusions.\n"
        f"Advice: {strength} confidence ({confidence_pct:.1f}%). Recheck if the image is blurry, cropped, or heavily stained."
    )


def extract_gemini_text(payload):
    for candidate in payload.get("candidates", []):
        content = candidate.get("content", {})
        parts = content.get("parts", [])
        text = "\n".join(part.get("text", "") for part in parts if part.get("text"))
        if text.strip():
            lines = [line.strip(" -") for line in text.splitlines() if line.strip(" -")]
            return "\n".join(lines).strip()
    return ""


def require_useful_ai_text(text):
    if len(text.split()) < 12:
        raise ValueError("Gemini returned too little text.")
    return "\n".join(text.splitlines()[:3])


def gemini_interpretation(raw_image_b64, mime_type, label, confidence, probability_parasitized, probability_uninfected):
    fallback = local_interpretation(label, confidence, probability_parasitized, probability_uninfected)

    if not GEMINI_API_KEY:
        return {
            "source": "local",
            "text": fallback,
            "available": False,
            "message": "Set GEMINI_API_KEY on the backend to enable live Gemini image interpretation.",
        }

    prompt = (
        "You are supporting an educational malaria cell detection demo. "
        "A CNN has already analyzed this single-cell microscopy image. "
        f"CNN label: {label}. "
        f"Confidence: {confidence * 100:.1f}%. "
        f"Parasitized probability: {probability_parasitized * 100:.1f}%. "
        f"Uninfected probability: {probability_uninfected * 100:.1f}%. "
        "Analyze the image itself and reply with exactly 3 short plain-text lines: "
        "Line 1 says what seems to be happening. "
        "Line 2 says which visible signs support or weaken the prediction. "
        "Line 3 gives one crisp next-check advice. Keep the whole reply under 65 words. "
        "Use simple student-project language. "
        "Do not use markdown and do not claim a clinical diagnosis."
    )

    request_body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": raw_image_b64,
                        }
                    },
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 130,
        },
    }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    data = json.dumps(request_body).encode("utf-8")
    request = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")

    try:
        with urllib.request.urlopen(request, timeout=GEMINI_TIMEOUT) as response:
            payload = json.loads(response.read().decode("utf-8"))
        text = extract_gemini_text(payload)
        if not text:
            raise ValueError("Gemini returned no text.")
        text = require_useful_ai_text(text)
        return {"source": "gemini", "text": text, "available": True, "model": GEMINI_MODEL}
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
        return {
            "source": "local",
            "text": fallback,
            "available": False,
            "message": f"Gemini interpretation unavailable: {exc}",
        }


def analyze_image_bytes(raw):
    started_at = time.perf_counter()
    pil_image = Image.open(BytesIO(raw)).convert("RGB")
    image_resized = pil_image.resize(IMG_SIZE, RESAMPLE_BILINEAR)
    original_resized = np.array(image_resized)
    input_array = original_resized.astype(np.float32) / 255.0

    if model is not None:
        input_batch = np.expand_dims(input_array, axis=0)
        probability_uninfected = predict_uninfected_probability(input_batch)
        probability_parasitized = 1 - probability_uninfected
        label = "Uninfected" if probability_uninfected >= 0.5 else "Parasitized"
        gradcam_overlay = build_gradcam(input_batch, original_resized, label)
    elif lite_model is not None:
        probability_uninfected, features = lite_model.predict(input_array)
        probability_parasitized = 1 - probability_uninfected
        label = "Uninfected" if probability_uninfected >= 0.5 else "Parasitized"
        gradcam_overlay = lite_model.build_overlay(original_resized, features)
    else:
        raise RuntimeError("Model is not loaded.")

    probability_parasitized = 1 - probability_uninfected
    confidence = max(probability_uninfected, probability_parasitized)

    ai_insight = {
        "source": "local",
        "text": local_interpretation(label, confidence, probability_parasitized, probability_uninfected),
        "available": False,
        "message": "Fast local advice returned with prediction. Gemini can refine it in the background.",
    }

    return {
        "label": label,
        "confidence": round(confidence, 4),
        "probability_parasitized": round(probability_parasitized, 4),
        "probability_uninfected": round(probability_uninfected, 4),
        "original_b64": encode_png(original_resized),
        "gradcam_b64": encode_png(gradcam_overlay),
        "ai_insight": ai_insight,
        "gemini_available": bool(GEMINI_API_KEY),
        "latency_ms": round((time.perf_counter() - started_at) * 1000),
    }


def sample_label(filename):
    lower = filename.lower()
    if "para" in lower:
        return "Parasitized"
    if "uninf" in lower or "healthy" in lower:
        return "Uninfected"
    return "Cell"


def list_public_samples(limit=4):
    samples_by_name = {}
    for sample_dir in SAMPLE_DIRS:
        if not os.path.isdir(sample_dir):
            continue
        for filename in os.listdir(sample_dir):
            stem, extension = os.path.splitext(filename)
            if extension.lower() not in SAMPLE_EXTENSIONS:
                continue
            samples_by_name[filename] = {
                "name": stem.replace("_", " ").title(),
                "src": f"/samples/{filename}",
                "expected": sample_label(filename),
            }

    samples = list(samples_by_name.values())
    random.shuffle(samples)
    return samples[: max(1, min(limit, len(samples)))]


@app.get("/")
def home():
    return {"message": "Malaria Detection is running"}

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None or lite_model is not None,
        "runtime": "tensorflow" if model is not None else "lite" if lite_model is not None else "none",
        "gemini_enabled": bool(GEMINI_API_KEY),
        "gemini_model": GEMINI_MODEL if GEMINI_API_KEY else None,
    }


@app.get("/samples")
def samples(limit: int = 4):
    return {"samples": list_public_samples(limit)}


@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    if model is None and lite_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Copy best_model.h5 into backend/model/")

    if image.content_type not in {"image/png", "image/jpeg"}:
        raise HTTPException(status_code=400, detail="File must be PNG or JPG")

    try:
        raw = await image.read()
        return await asyncio.to_thread(analyze_image_bytes, raw)
    except HTTPException:
        raise
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": "Prediction failed", "detail": str(exc)},
        )


@app.post("/interpret")
async def interpret(
    image: UploadFile = File(...),
    label: str = Form(...),
    confidence: float = Form(...),
    probability_parasitized: float = Form(...),
    probability_uninfected: float = Form(...),
):
    if image.content_type not in {"image/png", "image/jpeg"}:
        raise HTTPException(status_code=400, detail="File must be PNG or JPG")

    try:
        raw = await image.read()
        raw_image_b64 = base64.b64encode(raw).decode("utf-8")
        ai_insight = await asyncio.to_thread(
            gemini_interpretation,
            raw_image_b64=raw_image_b64,
            mime_type=image.content_type,
            label=label,
            confidence=confidence,
            probability_parasitized=probability_parasitized,
            probability_uninfected=probability_uninfected,
        )

        return {"ai_insight": ai_insight}
    except HTTPException:
        raise
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": "Interpretation failed", "detail": str(exc)},
        )
