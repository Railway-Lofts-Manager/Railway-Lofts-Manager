import { useEffect, useMemo, useState } from 'react'
import './App.css'
import BoxForm from "./components/BoxForm";
import BirdForm from "./components/BirdForm";
import BirdRegister from "./components/BirdRegister";
import CommandCentre from "./components/CommandCentre";
import BreedingCentre from "./components/BreedingCentre";
import LoftView from "./components/LoftView";
import lofts from './data/lofts'
import LoftConfiguration from './components/LoftConfiguration'
import Dashboard from "./components/Dashboard";
import RaceCentre from "./components/RaceCentre";
import HealthCentre from "./components/HealthCentre";
import SeasonPlanner from "./components/SeasonPlanner";
import ReportsAnalytics from "./components/ReportsAnalytics";
import ArchiveCentre from "./components/ArchiveCentre";
import Sidebar from "./components/Sidebar";
import BirdProfile from "./components/BirdProfile";
import birdStore from "./data/BirdStore";

const emptyBird = {
  birdId: '',
  ringNumber: '',
  name: '',
  sex: 'Cock',

  colour: '',
  breed: '',
  family: '',

  year: String(new Date().getFullYear()),

  status: 'Racing',

  loft: '',
  section: '',
  nestBox: '',

  fatherId: '',
  motherId: '',

  archiveSource: '',
  originalOwner: '',

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

function loadLegacyBirds() {
  try {
    const currentSaved = localStorage.getItem('loft-commander-birds')

    if (currentSaved) {
      const parsed = JSON.parse(currentSaved)
      return Array.isArray(parsed) ? parsed : []
    }

    const oldSaved = localStorage.getItem('railway-lofts-birds')

    if (oldSaved) {
      const parsed = JSON.parse(oldSaved)
      return Array.isArray(parsed) ? parsed : []
    }

    return starterBirds
  } catch {
    return starterBirds
  }
}

function initialiseBirdStore() {
  const storedBirds = birdStore.getBirds()

  if (storedBirds.length > 0) {
    return storedBirds
  }

  const legacyBirds = loadLegacyBirds()

  if (legacyBirds.length > 0) {
    birdStore.importBirds(legacyBirds)
  }

  return birdStore.getBirds()
}

function loadBoxes() {
  try {
    const saved = localStorage.getItem('loft-commander-boxes')
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function generateBirdId(existingBirds) {
  const prefix = "LC";

  const numbers = existingBirds.map((bird) => {
    if (!bird.birdId) return 0;

    const match = bird.birdId.match(/^LC-(\d+)$/);

    return match ? Number(match[1]) : 0;
  });

  const nextNumber =
    numbers.length > 0
      ? Math.max(...numbers) + 1
      : 1;

  return `${prefix}-${String(nextNumber).padStart(6, "0")}`;
}

function App() {
  const [activePage, setActivePage] = useState('Command Centre')
  const [birds, setBirds] = useState(initialiseBirdStore)
  const [boxAssignments, setBoxAssignments] = useState(loadBoxes)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyBird)
  const [error, setError] = useState('')

  const [selectedLoft, setSelectedLoft] = useState(lofts[0])
  const [selectedBox, setSelectedBox] = useState(null)
  const [selectedBird, setSelectedBird] = useState(null)

  useEffect(() => {
    const unsubscribe = birdStore.subscribe((updatedBirds) => {
      setBirds(updatedBirds)

      setSelectedBird((currentSelectedBird) => {
        if (!currentSelectedBird) {
          return null
        }

        return (
          updatedBirds.find(
            (bird) => bird.id === currentSelectedBird.id,
          ) || null
        )
      })
    })

    setBirds(birdStore.getBirds())

    return unsubscribe
  }, [])

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
        String(bird.ringNumber || '').toUpperCase() === ringNumber &&
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
      birdId:
        form.birdId ||
        generateBirdId(birds),
      ringNumber,
      id:
        editingId ||
        globalThis.crypto?.randomUUID?.() ||
        `bird-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }

    if (editingId) {
      const existingBird = birds.find(
        (bird) => bird.id === editingId,
      )

      if (!existingBird) {
        setError('The bird could not be found.')
        return
      }

      birdStore.updateBird(
        existingBird.ringNumber,
        savedBird,
      )
    } else {
      const added = birdStore.addBird(savedBird)

      if (!added) {
        setError(
          'That ring number is already in the register.',
        )
        return
      }
    }

    setFormOpen(false)
  }

  function deleteBird(bird) {
    const confirmed = window.confirm(
      `Delete ${bird.ringNumber} from the register?`,
    )

    if (confirmed) {
      birdStore.deleteBird(bird.ringNumber)
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

  function openBirdProfile(bird) {
    setSelectedBird(bird)
    setActivePage('Bird Profile')
  }

  function updateBird(updatedBird) {
    const existingBird = birds.find(
      (bird) => bird.id === updatedBird.id,
    )

    if (!existingBird) {
      return
    }

    birdStore.updateBird(
      existingBird.ringNumber,
      updatedBird,
    )
  }

  function closeBirdProfile() {
    setSelectedBird(null)
    setActivePage('Bird Register')
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

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
            openBirdProfile={openBirdProfile}
          />
        )}

        {activePage === 'Bird Profile' && (
          <BirdProfile
            bird={selectedBird}
            onBack={closeBirdProfile}
            onUpdateBird={updateBird}
          />
        )}

        {activePage === 'Loft Configuration' && (
          <LoftConfiguration />
        )}

        {activePage === 'Breeding Centre' && (
          <BreedingCentre
            lofts={lofts}
            assignments={boxAssignments}
            openLoft={openLoft}
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

        {activePage === 'Dashboard' && (
          <Dashboard birds={birds} />
        )}

        {activePage === 'Race Centre' && (
          <RaceCentre />
        )}

        {activePage === 'Health Centre' && (
          <HealthCentre />
        )}

        {activePage === 'Season Planner' && (
          <SeasonPlanner />
        )}

        {activePage === 'Reports & Analytics' && (
          <ReportsAnalytics />
        )}

        {activePage === 'Archive Centre' && (
          <ArchiveCentre />
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
          lofts={lofts}
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

export default App