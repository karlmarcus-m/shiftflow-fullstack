import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Shift = {
  id: number
  title: string
  date: string
  startTime: string
  endTime: string
  notes: string
}

function App() {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')
  const [shifts, setShifts] = useState<Shift[]>([])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (endTime <= startTime) {
      alert('End time must be after start time.')
      return
    }

    const newShift: Shift = {
      id: Date.now(),
      title: title,
      date: date,
      startTime: startTime,
      endTime: endTime,
      notes: notes,
    }

    setShifts([...shifts, newShift])

    setTitle('')
    setDate('')
    setStartTime('')
    setEndTime('')
    setNotes('')
  }

  function deleteShift(id: number) {
    const updatedShifts = shifts.filter((shift) => shift.id !== id)
    setShifts(updatedShifts)
  }

  return (
    <main className="app">
      <header>
        <h1>ShiftFlow</h1>
        <p>Work shift management made simple.</p>
      </header>

      <div className="dashboard">
        <section className="card">
          <h2>Add a shift</h2>

          <form className="shift-form" onSubmit={handleSubmit}>
            <label htmlFor="title">Shift title</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Morning shift"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />

            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />

            <label htmlFor="start-time">Start time</label>
            <input
              id="start-time"
              name="start-time"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              required
            />

            <label htmlFor="end-time">End time</label>
            <input
              id="end-time"
              name="end-time"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              required
            />

            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Optional details"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />

            <button type="submit">Add shift</button>
          </form>
        </section>

        <section className="card">
          <h2>Upcoming shifts</h2>

          {shifts.length === 0 ? (
            <p>No shifts added yet.</p>
          ) : (
            <div className="shift-list">
              {shifts.map((shift) => (
                <article className="shift-item" key={shift.id}>
                  <div className="shift-header">
                    <h3>{shift.title}</h3>

                    <button
                      className="delete-button"
                      type="button"
                      onClick={() => deleteShift(shift.id)}
                    >
                      Delete
                    </button>
                  </div>

                  <p>{shift.date}</p>

                  <p className="shift-time">
                    {shift.startTime}–{shift.endTime}
                  </p>

                  {shift.notes && (
                    <p className="shift-notes">{shift.notes}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App