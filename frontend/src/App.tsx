import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:8000'

type Shift = {
  id: number
  title: string
  date: string
  start_time: string
  end_time: string
  notes: string
}

function App() {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')
  const [shifts, setShifts] = useState<Shift[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadShifts()
  }, [])

  async function loadShifts() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}/api/shifts`)

      if (!response.ok) {
        throw new Error('Could not load shifts.')
      }

      const data: Shift[] = await response.json()
      setShifts(data)
    } catch {
      setError('Could not connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setTitle('')
    setDate('')
    setStartTime('')
    setEndTime('')
    setNotes('')
    setEditingId(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (endTime <= startTime) {
      alert('End time must be after start time.')
      return
    }

    const shiftData = {
      title: title,
      date: date,
      start_time: startTime,
      end_time: endTime,
      notes: notes,
    }

    const isEditing = editingId !== null
    const url = isEditing
      ? `${API_URL}/api/shifts/${editingId}`
      : `${API_URL}/api/shifts`

    try {
      setError('')

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shiftData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Could not save shift.')
      }

      const savedShift: Shift = await response.json()

      if (isEditing) {
        setShifts(
          shifts.map((shift) =>
            shift.id === savedShift.id ? savedShift : shift,
          ),
        )
      } else {
        setShifts([...shifts, savedShift])
      }

      resetForm()
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message)
      } else {
        setError('Could not save shift.')
      }
    }
  }

  function editShift(shift: Shift) {
    setTitle(shift.title)
    setDate(shift.date)
    setStartTime(shift.start_time.slice(0, 5))
    setEndTime(shift.end_time.slice(0, 5))
    setNotes(shift.notes)
    setEditingId(shift.id)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  async function deleteShift(shiftId: number) {
    const shouldDelete = window.confirm(
      'Are you sure you want to delete this shift?',
    )

    if (!shouldDelete) {
      return
    }

    try {
      setError('')

      const response = await fetch(`${API_URL}/api/shifts/${shiftId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Could not delete shift.')
      }

      setShifts(shifts.filter((shift) => shift.id !== shiftId))

      if (editingId === shiftId) {
        resetForm()
      }
    } catch {
      setError('Could not delete shift.')
    }
  }

  function formatTime(value: string) {
    return value.slice(0, 5)
  }

  return (
    <main className="app">
      <header>
        <h1>ShiftFlow</h1>
        <p>Work shift management made simple.</p>
      </header>

      {error && <p className="error-message">{error}</p>}

      <div className="dashboard">
        <section className="card">
          <h2>{editingId === null ? 'Add a shift' : 'Edit shift'}</h2>

          <form className="shift-form" onSubmit={handleSubmit}>
            <label htmlFor="title">Shift title</label>
            <input
              id="title"
              type="text"
              placeholder="Morning shift"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />

            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />

            <label htmlFor="start-time">Start time</label>
            <input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              required
            />

            <label htmlFor="end-time">End time</label>
            <input
              id="end-time"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              required
            />

            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              placeholder="Optional details"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />

            <div className="form-buttons">
              <button className="submit-button" type="submit">
                {editingId === null ? 'Add shift' : 'Save changes'}
              </button>

              {editingId !== null && (
                <button
                  className="cancel-button"
                  type="button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card">
          <h2>Upcoming shifts</h2>

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

                    <div className="shift-actions">
                      <button
                        className="edit-button"
                        type="button"
                        onClick={() => editShift(shift)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        type="button"
                        onClick={() => deleteShift(shift.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p>{shift.date}</p>
                  <p className="shift-time">
                    {formatTime(shift.start_time)}–
                    {formatTime(shift.end_time)}
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