import './App.css'
function App() {
  return (
    <main className="app">
      <header>
        <h1>ShiftFlow</h1>
        <p>Work shift management made simple.</p>
      </header>

      <div className="dashboard">
        <section className="card">
          <h2>Add a shift</h2>

          <form className="shift-form">
            <label htmlFor="title">Shift title</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Morning shift"
              required
            />

            <label htmlFor="date">Date</label>
            <input id="date" name="date" type="date" required />

            <label htmlFor="start-time">Start time</label>
            <input
              id="start-time"
              name="start-time"
              type="time"
              required
            />

            <label htmlFor="end-time">End time</label>
            <input
              id="end-time"
              name="end-time"
              type="time"
              required
            />

            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Optional details"
            />

            <button type="button">Add shift</button>
          </form>
        </section>

        <section className="card">
          <h2>Upcoming shifts</h2>
          <p>No shifts added yet.</p>
        </section>
      </div>
    </main>
  )
}

export default App