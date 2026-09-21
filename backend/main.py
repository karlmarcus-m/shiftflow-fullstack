from datetime import date, time

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import ShiftModel


app = FastAPI(
    title="ShiftFlow API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


class ShiftCreate(BaseModel):
    title: str
    date: date
    start_time: time
    end_time: time
    notes: str = ""


class Shift(ShiftCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/shifts", response_model=list[Shift])
def get_shifts(database: Session = Depends(get_db)):
    statement = select(ShiftModel).order_by(
        ShiftModel.date,
        ShiftModel.start_time,
    )

    return database.scalars(statement).all()


@app.post(
    "/api/shifts",
    response_model=Shift,
    status_code=status.HTTP_201_CREATED,
)
def create_shift(
    shift: ShiftCreate,
    database: Session = Depends(get_db),
):
    if shift.end_time <= shift.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time",
        )

    new_shift = ShiftModel(
        title=shift.title,
        date=shift.date,
        start_time=shift.start_time,
        end_time=shift.end_time,
        notes=shift.notes,
    )

    database.add(new_shift)
    database.commit()
    database.refresh(new_shift)

    return new_shift


@app.put("/api/shifts/{shift_id}", response_model=Shift)
def update_shift(
    shift_id: int,
    updated_shift: ShiftCreate,
    database: Session = Depends(get_db),
):
    if updated_shift.end_time <= updated_shift.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time",
        )

    shift = database.get(ShiftModel, shift_id)

    if shift is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found",
        )

    shift.title = updated_shift.title
    shift.date = updated_shift.date
    shift.start_time = updated_shift.start_time
    shift.end_time = updated_shift.end_time
    shift.notes = updated_shift.notes

    database.commit()
    database.refresh(shift)

    return shift


@app.delete(
    "/api/shifts/{shift_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_shift(
    shift_id: int,
    database: Session = Depends(get_db),
):
    shift = database.get(ShiftModel, shift_id)

    if shift is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found",
        )

    database.delete(shift)
    database.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)