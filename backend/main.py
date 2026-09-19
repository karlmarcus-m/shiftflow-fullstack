from datetime import date, time

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(title="ShiftFlow API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)


class ShiftCreate(BaseModel):
    title: str = Field(min_length=2, max_length=100)
    date: date
    start_time: time
    end_time: time
    notes: str = Field(default="", max_length=500)


class Shift(ShiftCreate):
    id: int


shifts: list[Shift] = []


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/shifts", response_model=list[Shift])
def get_shifts():
    return shifts


@app.post(
    "/api/shifts",
    response_model=Shift,
    status_code=status.HTTP_201_CREATED,
)
def create_shift(shift_data: ShiftCreate):
    if shift_data.end_time <= shift_data.start_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time",
        )

    new_id = max((shift.id for shift in shifts), default=0) + 1

    new_shift = Shift(
        id=new_id,
        **shift_data.model_dump(),
    )

    shifts.append(new_shift)

    return new_shift


@app.delete(
    "/api/shifts/{shift_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_shift(shift_id: int):
    for shift in shifts:
        if shift.id == shift_id:
            shifts.remove(shift)
            return

    raise HTTPException(
        status_code=404,
        detail="Shift not found",
    )