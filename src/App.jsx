import { useEffect, useMemo, useState } from 'react'
import './App.css'

const menuItems = [
  'Command Centre',
  'Bird Register',
  'Loft View',
  'Breeding Centre',
  'Race Centre',
  'Health Centre',
  'Season Planner',
  'Reports & Analytics',
]

const lofts = [
  {
    id: 'race-loft',
    name: 'Race Loft',
    colour: '#2f8f5b',
    boxes: 16,
  },
  {
    id: 'graham-land-1',
    name: 'Graham Land 1',
    colour: '#d2a11e',
    boxes: 12,
  },
  {
    id: 'graham-land-2',
    name: 'Graham Land 2',
    colour: '#d8751b',
    boxes: 12,
  },
  {
    id: 'graham-land-3',
    name: 'Graham Land 3',
    colour: '#2b6ed1',
    boxes: 12,
  },
  {
    id: 'jeans-section',
    name: "Jean's Section",
    colour: '#7a4cc2',
    boxes: 12,
  },
]

const emptyBird = {
  ringNumber: '',
  name: '',
  sex: 'Cock',
  colour: '',
  year: '2026',
  status: 'Racing',
  loft: '',
  family: '',
  notes: '',
}

const starterBirds = [
  {
    id: 'sample-1',
    ringNumber: 'GB24R12345',
    name: '',
    sex: 'Cock',
    colour: 'Blue',
    year: '2024',
    status: 'Racing',
    loft: 'Race Loft',
    family: 'Van den Bulck',
    notes: '',
  },
  {
    id: 'sample-2',
    ringNumber: 'GB23R67890',
    name: '',
    sex: 'Hen',
    colour: 'Blue Chequer',
    year: '2023',
    status: 'Stock',
    loft: 'Graham Land 1',
    family: 'Heremans-Ceusters',
    notes: '',
  },
]

function loadBirds() {
  try {
    const newSaved = localStorage.getItem('loft-commander-birds')

    if (newSaved) {
      return JSON.parse(newSaved)
    }

    const oldSaved = localStorage.getItem('railway-lofts-birds')

    if (oldSaved) {
      return JSON.parse(oldSaved)
    }

    return starterBirds
  } catch {
    return starterBirds
  }
}

function loadBoxes() {
  try {
    const saved = localStorage.getItem('loft-commander-boxes')
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function App() {
  const [activePage, setActivePage] = useState('Command Centre')
  const [birds, setBirds] = useState(loadBirds)
  const [boxAssignments, setBoxAssignments] = useState(loadBoxes)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyBird)
  const [error, setError] = useState('')

  const [selectedLoft, setSelectedLoft] = useState(lofts[0])
  const [selectedBox, setSelectedBox] = useState(null)

  useEffect(() => {
    localStorage.setItem(
      'loft-commander-birds',
      JSON.stringify(birds),
    )
  }, [birds])

  useEffect(() => {
    localStorage.setItem(
      'loft-commander-boxes',
      JSON.stringify(boxAssignments),
    )
  }, [boxAssignments])

  const filteredBirds = useMemo(() => {
    const term = search.trim().toLowerCase()

    return birds.filter((bird) => {
      const matchesText =
        !term ||
        Object.values(bird).some((value) =>
          String(value).toLowerCase().includes(term),
        )

      const matchesStatus =
        statusFilter === 'All' ||
        bird.status === statusFilter

      return matchesText && matchesStatus
    })
  }, [birds, search, statusFilter])

  const counts = {
    total: birds.length,
    racing: birds.filter(
      (bird) => bird.status === 'Racing',
    ).length,
    young: birds.filter(
      (bird) => bird.status === 'Young Bird',
    ).length,
    stock: birds.filter(
      (bird) => bird.status === 'Stock',
    ).length,
  }

  function openNewBird() {
    setEditingId(null)

    setForm({
      ...emptyBird,
      year: String(new Date().getFullYear()),
    })

    setError('')
    setFormOpen(true)
  }

  function openEditBird(bird) {
    setEditingId(bird.id)
    setForm({ ...bird })
    setError('')
    setFormOpen(true)
  }

  function saveBird(event) {
    event.preventDefault()

    const ringNumber = form.ringNumber
      .trim()
      .toUpperCase()

    if (!ringNumber) {
      setError('Please enter the ring number.')
      return
    }

    const duplicate = birds.some(
      (bird) =>
        bird.ringNumber.toUpperCase() === ringNumber &&
        bird.id !== editingId,
    )

    if (duplicate) {
      setError(
        'That ring number is already in the register.',
      )
      return
    }

    const savedBird = {
      ...form,
      ringNumber,
      id: editingId || crypto.randomUUID(),
    }

    setBirds((current) =>
      editingId
        ? current.map((bird) =>
            bird.id === editingId ? savedBird : bird,
          )
        : [savedBird, ...current],
    )

    setFormOpen(false)
  }

  function deleteBird(bird) {
    const confirmed = window.confirm(
      `Delete ${bird.ringNumber} from the register?`,
    )

    if (confirmed) {
      setBirds((current) =>
        current.filter(
          (item) => item.id !== bird.id,
        ),
      )
    }
  }

  function openLoft(loft) {
    setSelectedLoft(loft)
    setActivePage('Loft View')
  }

  function saveBox(event) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)
    const key = `${selectedLoft.id}-${selectedBox}`

    const assignment = {
      cock: data.get('cock'),
      hen: data.get('hen'),
      eggs: Number(data.get('eggs') || 0),
      youngsters: Number(
        data.get('youngsters') || 0,
      ),
    }

    setBoxAssignments((current) => ({
      ...current,
      [key]: assignment,
    }))

    setSelectedBox(null)
  }

  function clearBox() {
    const key = `${selectedLoft.id}-${selectedBox}`

    setBoxAssignments((current) => {
      const updated = { ...current }
      delete updated[key]
      return updated
    })

    setSelectedBox(null)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">LC</span>

          <div>
            <h1>Loft Commander</h1>
            <p>The Railway Lofts, Church Lane</p>
          </div>
        </div>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item}
              className={
                activePage === item ? 'active' : ''
              }
              onClick={() => setActivePage(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <p className="version">
          Loft Commander
          <br />
          Version 1.1
        </p>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              Welcome back, Shane
            </p>

            <h2>{activePage}</h2>
          </div>

          <div className="season">
            <span>Season</span>
            <strong>
              {new Date().getFullYear()}
            </strong>
          </div>
        </header>

        {activePage === 'Command Centre' && (
          <CommandCentre
            counts={counts}
            boxAssignments={boxAssignments}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'Bird Register' && (
          <BirdRegister
            birds={filteredBirds}
            counts={counts}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            openNewBird={openNewBird}
            openEditBird={openEditBird}
            deleteBird={deleteBird}
          />
        )}

        {activePage === 'Loft View' && (
          <LoftView
            lofts={lofts}
            selectedLoft={selectedLoft}
            setSelectedLoft={setSelectedLoft}
            assignments={boxAssignments}
            setSelectedBox={setSelectedBox}
          />
        )}

        {activePage === 'Breeding Centre' && (
          <BreedingCentre
            lofts={lofts}
            assignments={boxAssignments}
            openLoft={openLoft}
          />
        )}

        {![
          'Command Centre',
          'Bird Register',
          'Loft View',
          'Breeding Centre',
        ].includes(activePage) && (
          <section className="panel empty-module">
            <h3>{activePage}</h3>

            <p>
              This section is ready for the next
              build stage.
            </p>
          </section>
        )}
      </main>

      {formOpen && (
        <BirdForm
          form={form}
          setForm={setForm}
          editing={Boolean(editingId)}
          error={error}
          onSave={saveBird}
          onClose={() => setFormOpen(false)}
        />
      )}

      {selectedBox !== null && (
        <BoxForm
          loft={selectedLoft}
          boxNumber={selectedBox}
          birds={birds}
          assignment={
            boxAssignments[
              `${selectedLoft.id}-${selectedBox}`
            ]
          }
          onSave={saveBox}
          onClear={clearBox}
          onClose={() => setSelectedBox(null)}
        />
      )}
    </div>
  )
}

function CommandCentre({
  counts,
  boxAssignments,
  setActivePage,
}) {
  const assignments = Object.values(boxAssignments)

  const eggs = assignments.reduce(
    (total, assignment) =>
      total + Number(assignment.eggs || 0),
    0,
  )

  const youngsters = assignments.reduce(
    (total, assignment) =>
      total + Number(assignment.youngsters || 0),
    0,
  )

  const cards = [
    ['Birds in Loft', counts.total, 'B'],
    ['Eggs', eggs, 'E'],
    ['Youngsters', youngsters, 'Y'],
    ['Health Alerts', 1, 'H'],
  ]

  return (
    <>
      <section className="stat-grid">
        {cards.map(([title, value, icon]) => (
          <article
            className="stat-card"
            key={title}
          >
            <span className="stat-icon">
              {icon}
            </span>

            <div>
              <p>{title}</p>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="CommandCentre-grid">
        <article className="panel">
          <h3>Today's Priorities</h3>

          <ul className="task-list">
            <li>Check all drinkers</li>
            <li>Record morning feed</li>
            <li>Inspect breeding boxes</li>
            <li>Review birds under treatment</li>
          </ul>
        </article>

        <article className="panel">
          <h3>Next Race</h3>

          <div className="highlight">
            <div>
              <strong>Kingdown</strong>
              <span>Saturday</span>
            </div>

            <span className="flag">🏁</span>
          </div>

          <button
            className="primary wide"
            onClick={() =>
              setActivePage('Race Centre')
            }
          >
            Open Race Centre
          </button>
        </article>

        <article className="panel">
          <h3>Quick Start</h3>

          <p className="muted">
            Your bird register and loft planner are
            ready.
          </p>

          <button
            className="primary wide"
            onClick={() =>
              setActivePage('Bird Register')
            }
          >
            Open Bird Register
          </button>

          <br />
          <br />

          <button
            className="secondary wide"
            onClick={() =>
              setActivePage('Loft View')
            }
          >
            Open Loft View
          </button>
        </article>
      </section>
    </>
  )
}

function BirdRegister({
  birds,
  counts,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  openNewBird,
  openEditBird,
  deleteBird,
}) {
  return (
    <>
      <section className="register-toolbar">
        <div>
          <h3>Master Bird Register</h3>

          <p>
            {counts.total} bird
            {counts.total === 1 ? '' : 's'} saved
            on this computer
          </p>
        </div>

        <button
          className="primary"
          onClick={openNewBird}
        >
          + Add Bird
        </button>
      </section>

      <section className="filters">
        <input
          aria-label="Search birds"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search ring, name, colour, loft or family..."
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option>All</option>
          <option>Racing</option>
          <option>Stock</option>
          <option>Young Bird</option>
          <option>Retired</option>
        </select>
      </section>

      <section className="panel table-panel">
        {birds.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ring number</th>
                  <th>Name</th>
                  <th>Sex</th>
                  <th>Colour</th>
                  <th>Status</th>
                  <th>Loft</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {birds.map((bird) => (
                  <tr key={bird.id}>
                    <td data-label="Ring number">
                      <strong>
                        {bird.ringNumber}
                      </strong>

                      <small>{bird.year}</small>
                    </td>

                    <td data-label="Name">
                      {bird.name || '—'}
                    </td>

                    <td data-label="Sex">
                      {bird.sex}
                    </td>

                    <td data-label="Colour">
                      {bird.colour || '—'}
                    </td>

                    <td data-label="Status">
                      <span
                        className={`status status-${bird.status
                          .toLowerCase()
                          .replace(' ', '-')}`}
                      >
                        {bird.status}
                      </span>
                    </td>

                    <td data-label="Loft">
                      {bird.loft || '—'}
                    </td>

                    <td className="actions">
                      <button
                        onClick={() =>
                          openEditBird(bird)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="danger"
                        onClick={() =>
                          deleteBird(bird)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span>LC</span>
            <h3>No birds found</h3>

            <p>
              Change the search or add your first
              pigeon.
            </p>

            <button
              className="primary"
              onClick={openNewBird}
            >
              + Add Bird
            </button>
          </div>
        )}
      </section>
    </>
  )
}

function LoftView({
  lofts,
  selectedLoft,
  setSelectedLoft,
  assignments,
  setSelectedBox,
}) {
  const occupiedBoxes = Object.keys(
    assignments,
  ).filter((key) =>
    key.startsWith(`${selectedLoft.id}-`),
  ).length

  return (
    <>
      <section
        className="panel"
        style={{ marginBottom: '16px' }}
      >
        <h3>Select Loft</h3>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '15px',
          }}
        >
          {lofts.map((loft) => (
            <button
              key={loft.id}
              className={
                selectedLoft.id === loft.id
                  ? 'primary'
                  : 'secondary'
              }
              onClick={() =>
                setSelectedLoft(loft)
              }
              style={{
                borderLeft: `8px solid ${loft.colour}`,
              }}
            >
              {loft.name}
            </button>
          ))}
        </div>
      </section>

      <section
        className="panel"
        style={{ marginBottom: '16px' }}
      >
        <h3>{selectedLoft.name}</h3>

        <p className="muted">
          {occupiedBoxes} occupied boxes ·{' '}
          {selectedLoft.boxes - occupiedBoxes}{' '}
          empty boxes
        </p>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
        }}
      >
        {Array.from(
          { length: selectedLoft.boxes },
          (_, index) => {
            const boxNumber = index + 1

            const assignment =
              assignments[
                `${selectedLoft.id}-${boxNumber}`
              ]

            return (
              <button
                key={boxNumber}
                className="panel"
                onClick={() =>
                  setSelectedBox(boxNumber)
                }
                style={{
                  minHeight: '160px',
                  textAlign: 'left',
                  borderLeft: `8px solid ${selectedLoft.colour}`,
                }}
              >
                <h3>Box {boxNumber}</h3>

                {assignment ? (
                  <>
                    <p>
                      <strong>Cock:</strong>{' '}
                      {assignment.cock ||
                        'Not selected'}
                    </p>

                    <p>
                      <strong>Hen:</strong>{' '}
                      {assignment.hen ||
                        'Not selected'}
                    </p>

                    <p>
                      Eggs: {assignment.eggs}
                      <br />
                      Youngsters:{' '}
                      {assignment.youngsters}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="muted">
                      Empty nest box
                    </p>

                    <strong>+ Assign Pair</strong>
                  </>
                )}
              </button>
            )
          },
        )}
      </section>
    </>
  )
}

function BreedingCentre({
  lofts,
  assignments,
  openLoft,
}) {
  return (
    <>
      <section
        className="register-toolbar"
        style={{ marginBottom: '16px' }}
      >
        <div>
          <h3>Breeding Locations</h3>

          <p>
            Select a loft to open its nest box
            planner.
          </p>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        {lofts.map((loft) => {
          const occupied = Object.keys(
            assignments,
          ).filter((key) =>
            key.startsWith(`${loft.id}-`),
          ).length

          return (
            <button
              key={loft.id}
              className="panel"
              onClick={() => openLoft(loft)}
              style={{
                minHeight: '130px',
                textAlign: 'left',
                borderLeft: `10px solid ${loft.colour}`,
              }}
            >
              <h3>{loft.name}</h3>

              <p className="muted">
                {occupied} occupied nest boxes
              </p>

              <strong>Open Loft →</strong>
            </button>
          )
        })}
      </section>
    </>
  )
}

function BirdForm({
  form,
  setForm,
  editing,
  error,
  onSave,
  onClose,
}) {
  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) =>
        event.target === event.currentTarget &&
        onClose()
      }
    >
      <form
        className="modal"
        onSubmit={onSave}
      >
        <header>
          <div>
            <p className="eyebrow">
              Bird Register
            </p>

            <h3>
              {editing
                ? 'Edit bird'
                : 'Add a new bird'}
            </h3>
          </div>

          <button
            type="button"
            className="close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        <div className="form-grid">
          <label className="full">
            Ring number *
            <input
              name="ringNumber"
              value={form.ringNumber}
              onChange={update}
              placeholder="Example: GB26R12345"
              autoFocus
            />
          </label>

          <label>
            Earned name
            <input
              name="name"
              value={form.name}
              onChange={update}
              placeholder="Optional"
            />
          </label>

          <label>
            Year
            <input
              name="year"
              value={form.year}
              onChange={update}
              inputMode="numeric"
            />
          </label>

          <label>
            Sex
            <select
              name="sex"
              value={form.sex}
              onChange={update}
            >
              <option>Cock</option>
              <option>Hen</option>
              <option>Unknown</option>
            </select>
          </label>

          <label>
            Colour
            <input
              name="colour"
              value={form.colour}
              onChange={update}
              placeholder="Blue, Chequer..."
            />
          </label>

          <label>
            Status
            <select
              name="status"
              value={form.status}
              onChange={update}
            >
              <option>Racing</option>
              <option>Stock</option>
              <option>Young Bird</option>
              <option>Retired</option>
            </select>
          </label>

          <label>
            Current loft
            <select
              name="loft"
              value={form.loft}
              onChange={update}
            >
              <option value="">
                Select a loft
              </option>

              {lofts.map((loft) => (
                <option key={loft.id}>
                  {loft.name}
                </option>
              ))}
            </select>
          </label>

          <label className="full">
            Family / bloodline
            <input
              name="family"
              value={form.family}
              onChange={update}
            />
          </label>

          <label className="full">
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={update}
              rows="3"
            />
          </label>
        </div>

        <footer>
          <button
            type="button"
            className="secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="primary"
            type="submit"
          >
            {editing
              ? 'Save Changes'
              : 'Add Bird'}
          </button>
        </footer>
      </form>
    </div>
  )
}

function BoxForm({
  loft,
  boxNumber,
  birds,
  assignment,
  onSave,
  onClear,
  onClose,
}) {
  const cocks = birds.filter(
    (bird) => bird.sex === 'Cock',
  )

  const hens = birds.filter(
    (bird) => bird.sex === 'Hen',
  )

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) =>
        event.target === event.currentTarget &&
        onClose()
      }
    >
      <form
        className="modal"
        onSubmit={onSave}
      >
        <header>
          <div>
            <p className="eyebrow">
              {loft.name}
            </p>

            <h3>Nest Box {boxNumber}</h3>
          </div>

          <button
            type="button"
            className="close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="form-grid">
          <label className="full">
            Cock
            <select
              name="cock"
              defaultValue={
                assignment?.cock || ''
              }
            >
              <option value="">
                Select cock
              </option>

              {cocks.map((bird) => (
                <option
                  key={bird.id}
                  value={bird.ringNumber}
                >
                  {bird.ringNumber}
                </option>
              ))}
            </select>
          </label>

          <label className="full">
            Hen
            <select
              name="hen"
              defaultValue={
                assignment?.hen || ''
              }
            >
              <option value="">
                Select hen
              </option>

              {hens.map((bird) => (
                <option
                  key={bird.id}
                  value={bird.ringNumber}
                >
                  {bird.ringNumber}
                </option>
              ))}
            </select>
          </label>

          <label>
            Eggs
            <input
              name="eggs"
              type="number"
              min="0"
              max="4"
              defaultValue={
                assignment?.eggs || 0
              }
            />
          </label>

          <label>
            Youngsters
            <input
              name="youngsters"
              type="number"
              min="0"
              max="4"
              defaultValue={
                assignment?.youngsters || 0
              }
            />
          </label>
        </div>

        <footer>
          {assignment && (
            <button
              type="button"
              className="danger"
              onClick={onClear}
            >
              Clear Box
            </button>
          )}

          <button
            type="button"
            className="secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="primary"
            type="submit"
          >
            Save Box
          </button>
        </footer>
      </form>
    </div>
  )
}

export default App