from fastapi import FastAPI


app = FastAPI(title="ShiftFlow API")


@app.get("/health")
def health_check():
    return {"status": "ok"}