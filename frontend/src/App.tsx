import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Shift = {
  id: number
  title: string
  date: string
  start_time: string
  end_time: string
  notes: string
}

const API_URL = 'http://127.0.0.1:8000'

function App() {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadShifts() {
      try {
        const response = await fetch(`${API_URL}/api/shifts`)

        if (!response.ok) {
          throw new Error('Could not load shifts')
        }

        const data: Shift[] = await response.json()
        setShifts(data)
      } catch {
        setError('Could not connect to the backend.')
      } finally {
        setLoading(false)
      }
    }

    loadShifts()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (endTime <= startTime) {
      setError('End time must be after start time.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/shifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          date: date,
          start_time: startTime,
          end_time: endTime,
          notes: notes,
        }),
      })

      if (!response.ok) {
        throw new Error('Could not create shift')
      }

      const newShift: Shift = await response.json()
      setShifts([...shifts, newShift])

      setTitle('')
      setDate('')
      setStartTime('')
      setEndTime('')
      setNotes('')
    } catch {
      setError('Could not create the shift.')
    }
  }

  async function deleteShift(id: number) {
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/shifts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Could not delete shift')
      }

      const updatedShifts = shifts.filter((shift) => shift.id !== id)
      setShifts(updatedShifts)
    } catch {
      setError('Could not delete the shift.')
    }
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

          {error && <p className="error-message">{error}</p>}

          {loading ? (
            <p>Loading shifts...</p>
          ) : shifts.length === 0 ? (
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
                    {shift.start_time}–{shift.end_time}
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