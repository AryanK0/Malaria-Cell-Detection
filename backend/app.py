from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tensorflow as tf
import numpy as np
import cv2
import base64
import os
from io import BytesIO
from PIL import Image

app = FastAPI(title="Malaria Cell Detection")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "best_model.h5")
IMG_SIZE = (128, 128)
model = None


@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)


def encode_png(image_array):
    image = Image.fromarray(image_array.astype(np.uint8))
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def build_gradcam(input_batch, original_resized, probability):
    last_conv = [l.name for l in model.layers if isinstance(l, tf.keras.layers.Conv2D)][-1]
    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[model.get_layer(last_conv).output, model.output],
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(input_batch)
        class_score = predictions[:, 0] if probability > 0.5 else 1 - predictions[:, 0]

    gradients = tape.gradient(class_score, conv_outputs)
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


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Copy best_model.h5 into backend/model/")

    if image.content_type not in {"image/png", "image/jpeg"}:
        raise HTTPException(status_code=400, detail="File must be PNG or JPG")

    try:
        raw = await image.read()
        pil_image = Image.open(BytesIO(raw)).convert("RGB")
        image_resized = pil_image.resize(IMG_SIZE)
        original_resized = np.array(image_resized)
        input_array = original_resized.astype(np.float32) / 255.0
        input_batch = np.expand_dims(input_array, axis=0)

        prediction = model.predict(input_batch, verbose=0)
        probability = float(prediction[0][0])
        label = "Parasitized" if probability > 0.5 else "Uninfected"
        confidence = probability if probability > 0.5 else 1 - probability
        gradcam_overlay = build_gradcam(input_batch, original_resized, probability)

        return {
            "label": label,
            "confidence": round(confidence, 4),
            "probability_parasitized": round(probability, 4),
            "probability_uninfected": round(1 - probability, 4),
            "original_b64": encode_png(original_resized),
            "gradcam_b64": encode_png(gradcam_overlay),
        }
    except HTTPException:
        raise
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": "Prediction failed", "detail": str(exc)},
        )
