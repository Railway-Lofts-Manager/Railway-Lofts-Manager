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
import SetupPage from "./components/Setup/SetupPage";
import Dashboard from "./components/Dashboard";
import RaceCentre from "./components/RaceCentre";
import HealthCentre from "./components/HealthCentre";
import SeasonPlanner from "./components/SeasonPlanner";
import ReportsAnalytics from "./components/ReportsAnalytics";
import ArchiveCentre from "./components/ArchiveCentre";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import BirdProfile from "./components/BirdProfile";
import ImportWizard from "./components/Import/ImportWizard";
import RingRegister from "./components/Rings/RingRegister";
import birdStore from "./data/BirdStore";
import getInitialPage from "./data/InitialPage";
import migrateBirdLoftIds from "./data/BirdLoftMigration";
import breedingSeasonStore from "./data/BreedingSeasonStore";
import settingsStore from "./data/SettingsStore";
import { exportBirdRegister } from "./data/BirdExportService";
import hospitalStore from "./data/HospitalStore";

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
loftId: '',
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

    return []
  } catch {
   return []
  }
}

function initialiseBirdStore() {
  const storedBirds = birdStore.getBirds();

  if (storedBirds.length === 0) {
    const legacyBirds = loadLegacyBirds();

    if (legacyBirds.length > 0) {
      birdStore.importBirds(legacyBirds);
    }
  }

  migrateBirdLoftIds();

  return birdStore.getBirds();
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
 const [activePage, setActivePage] = useState(getInitialPage)
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
const [showImportCentre, setShowImportCentre] = useState(false)

  useEffect(() => {
    const unsubscribe = birdStore.subscribe((updatedBirds) => {
      setBirds(updatedBirds)

      setSelectedBird((currentSelectedBird) => {
        if (!currentSelectedBird) {
          return null
        }

        return (
        updatedBirds.find(
  (bird) => bird.birdId === currentSelectedBird.birdId,
) || null
        )
      })
    })

    setBirds(birdStore.getBirds())

    return unsubscribe
  }, [])

  useEffect(() => {
    const activeHospitalBirdIds = new Set(
      hospitalStore
        .getState()
        .admissions
        .filter((admission) => admission.status === "Active")
        .map((admission) => admission.birdId)
        .filter(Boolean),
    );

    let repaired = false;

    birdStore.getBirds().forEach((bird) => {
      if (bird.status !== "Hospital" || activeHospitalBirdIds.has(bird.birdId)) {
        return;
      }

      const assignedLoft = lofts.find(
        (loft) => loft.id === bird.loftId || loft.name === bird.loft,
      );

      const repairedStatus =
        assignedLoft?.type === "young-bird"
          ? "Young Bird"
          : assignedLoft?.type === "breeding"
            ? "Stock"
            : "Racing";

      const hasRealLoft =
        bird.loft && bird.loft !== "Hospital / Quarantine";

      birdStore.updateBird(bird.ringNumber, {
        status: repairedStatus,
        loftId: hasRealLoft ? bird.loftId || "" : "",
        loft: hasRealLoft ? bird.loft : "",
        section: hasRealLoft ? bird.section || bird.loft : "",
      });
      repaired = true;
    });

    if (repaired) setBirds(birdStore.getBirds());
  }, []);

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
      (bird) => bird.ageCategory === 'Young Bird',
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
    setEditingId(bird.birdId)
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
        bird.birdId !== editingId
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
        (bird) => bird.birdId === editingId,
      )

      if (!existingBird) {
        setError('The bird could not be found.')
        return
      }

      birdStore.updateBird(
        existingBird.ringNumber,
        savedBird,
      )

      const movedOutOfHospital =
        existingBird.loft === "Hospital / Quarantine" &&
        savedBird.loft &&
        savedBird.loft !== "Hospital / Quarantine";

      if (movedOutOfHospital) {
        hospitalStore.completeActiveAdmissionForBird(
          existingBird.birdId,
          savedBird.loft,
        );
      }
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

  function rolloverBreedingSeason(nextYear) {
    const nextSeason = breedingSeasonStore.rolloverSeason(
      nextYear,
      boxAssignments,
    )

    settingsStore.updateSettings({ season: nextSeason.year })
    setBoxAssignments({})
    setSelectedBox(null)

    return nextSeason
  }

  function openBirdProfile(bird) {
    setSelectedBird(bird)
    setActivePage('Bird Profile')
  }

  function updateBird(updatedBird) {
    const existingBird = birds.find(
      (bird) =>
        bird.birdId === updatedBird.birdId ||
        (updatedBird.id && bird.id === updatedBird.id),
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

function openImportWizard() {
  setShowImportCentre(true);
  setActivePage("Import Centre");
}
function closeImportWizard() {
  setShowImportCentre(false);
  setActivePage("Bird Register");
}

function exportBirds() {
  exportBirdRegister(birds);
}
  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">
     <Topbar activePage={activePage} />

        {activePage === 'Command Centre' && (
          <CommandCentre
            counts={counts}
            boxAssignments={boxAssignments}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'Bird Register' && !showImportCentre && (
          <BirdRegister
            birds={filteredBirds}
            counts={counts}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            openNewBird={openNewBird}
            openImportWizard={openImportWizard}
            exportBirds={exportBirds}
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
  onEditBird={openEditBird}
/>
        )}
        
        {activePage === "Import Centre" && (
  <ImportWizard
    onCancel={closeImportWizard}
    existingBirds={birds}
    onImportComplete={() => {
      setBirds(birdStore.getBirds());
      closeImportWizard();
    }}
  />
)}

        {activePage === 'Loft Configuration' && (
          <LoftConfiguration onOpenHealthcare={() => setActivePage('Health & Strays')} />
        )}

{activePage === 'Setup' && (
  <SetupPage
    onOpenLoftConfiguration={() =>
      setActivePage('Loft Configuration')
    }
    onComplete={() =>
      setActivePage('Command Centre')
    }
  />
)}

        {activePage === 'Breeding Centre' && (
          <BreedingCentre
            lofts={lofts}
            assignments={boxAssignments}
            openLoft={openLoft}
            onSeasonRollover={rolloverBreedingSeason}
          />
        )}

        {activePage === 'Ring Register' && (
          <RingRegister />
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

        {activePage === 'Health & Strays' && (
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
