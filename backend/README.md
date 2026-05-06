# Malaria Cell AI Backend

FastAPI inference server for the malaria cell detection CNN.

## Run
```powershell
pip install -r requirements.txt
Copy-Item "..\best_model.h5" ".\model\best_model.h5"
uvicorn app:app --host 0.0.0.0 --port 5000
```

Optional Gemini interpretation:
```powershell
$env:GEMINI_API_KEY="your_api_key"
$env:GEMINI_MODEL="gemini-2.5-flash"
```

You can also create `backend/.env`:
```text
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Health check: `http://localhost:5000/health`
