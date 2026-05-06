# MalariaAI Backend

FastAPI inference server for the UCS321 malaria cell detection CNN.

## Run
```powershell
pip install -r requirements.txt
Copy-Item "..\best_model.h5" ".\model\best_model.h5"
uvicorn app:app --host 0.0.0.0 --port 5000
```

Health check: `http://localhost:5000/health`
