from datetime import date, time

from sqlalchemy import Date, String, Time
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class ShiftModel(Base):
    __tablename__ = "shifts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    date: Mapped[date] = mapped_column(Date)
    start_time: Mapped[time] = mapped_column(Time)
    end_time: Mapped[time] = mapped_column(Time)
    notes: Mapped[str] = mapped_column(String(500), default="")