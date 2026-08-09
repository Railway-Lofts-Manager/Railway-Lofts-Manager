import { useState } from "react";
import plannerStore from "../data/PlannerStore";
import healthcareStore from "../data/HealthcareStore";
import raceStore from "../data/RaceStore";
import breedingSeasonStore from "../data/BreedingSeasonStore";
import loftStore from "../data/LoftStore";
import "./SeasonPlanner.css";

const VIEWS = ["Schedule", "Day", "3 Days", "Week", "Month"];
function iso(date) { return date.toISOString().slice(0, 10); }
function fromIso(value) { return new Date(`${value}T12:00:00`); }
function addDays(value, days) { const date = typeof value === "string" ? fromIso(value) : new Date(value); date.setDate(date.getDate() + days); return date; }
function startOfWeek(value) { const date = new Date(value); const day = date.getDay(); return addDays(date, day === 0 ? -6 : 1 - day); }
function monthGrid(value) { const first = new Date(value.getFullYear(), value.getMonth(), 1, 12); const start = startOfWeek(first); return Array.from({ length: 42 }, (_, index) => addDays(start, index)); }
function longDate(value) { return value.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
function shortDate(value) { return value.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }

export default function SeasonPlanner() {
  const [refresh, setRefresh] = useState(0);
  const [view, setView] = useState("Month");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [eventFilter, setEventFilter] = useState("All");
  const [form, setForm] = useState({ title: "", date: iso(new Date()), category: "General", session: "Any time", notes: "" });
  const configuredLofts = loftStore.getLofts();

  const allTasks = [
    ...plannerStore.getTasks().map((task) => ({ ...task, source: "Planner" })),
    ...healthcareStore.getPlannerTasks(),
    ...raceStore.getRaces().filter((race) => race.raceDate).map((race) => ({
      id: race.id,
      date: race.raceDate,
      source: "Race Centre",
      category: "Race",
      title: `Race — ${race.racePoint}`,
      detail: `${race.miles} miles, ${race.yards} yards`,
      session: "All day",
      status: race.status === "Completed" ? "Completed" : race.status === "Cancelled" ? "Missed" : "Pending",
      race,
    })),
    ...breedingSeasonStore.getSeasons().flatMap((season) =>
      Object.values(season.loftRecords || {}).flatMap((boxRecord) =>
        (boxRecord.entries || []).filter((entry) => entry.expectedHatchDate).map((entry) => {
          const loftName = configuredLofts.find((loft) => loft.id === boxRecord.loftId)?.name || "Breeding Loft";
          return {
          id: `hatch-${entry.id}`,
          date: entry.expectedHatchDate,
          source: "Breeding",
          category: "Breeding",
          title: `Expected hatch — ${loftName}, Box ${boxRecord.boxNumber}`,
          detail: `Breeding season ${season.year}${entry.cockRingNumber || entry.henRingNumber ? ` • ${[entry.cockRingNumber, entry.henRingNumber].filter(Boolean).join(" × ")}` : ""}`,
          session: "Any time",
          status: entry.hatchDate ? "Completed" : "Pending",
          };
        }),
      ),
    ),
  ].sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const filterSource = {
    Treatments: "Healthcare",
    Races: "Race Centre",
    Breeding: "Breeding",
    "Manual Events": "Planner",
  }[eventFilter];

  const tasks = eventFilter === "All"
    ? allTasks
    : allTasks.filter((task) => task.source === filterSource);

  function tasksForDate(date) { const value = iso(date); return tasks.filter((task) => task.date === value); }
  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function openAddTask(date = currentDate) { setForm({ title: "", date: iso(date), category: "General", session: "Any time", notes: "" }); setShowForm(true); }
  function saveManualTask(event) { event.preventDefault(); if (!form.title.trim()) return; plannerStore.addTask({ ...form, title: form.title.trim() }); setShowForm(false); setRefresh((value) => value + 1); }

  function updateStatus(task, status) {
    if (task.source === "Healthcare") healthcareStore.updateAdministration(task.campaignId, task.id, { status, completedAt: new Date().toISOString() });
    else if (task.source === "Race Centre") raceStore.saveRace({ ...task.race, status: status === "Missed" ? "Cancelled" : status });
    else plannerStore.updateTask(task.id, { status, completedAt: new Date().toISOString() });
    setSelectedTask(null); setRefresh((value) => value + 1);
  }

  function reschedule(task) {
    const date = window.prompt("New date:", task.date);
    if (!date) return;
    const updates = { date, status: "Pending", rescheduledFrom: task.date };
    if (task.source === "Healthcare") healthcareStore.updateAdministration(task.campaignId, task.id, updates);
    else if (task.source === "Race Centre") raceStore.saveRace({ ...task.race, raceDate: date, status: "Upcoming" });
    else plannerStore.updateTask(task.id, updates);
    setSelectedTask(null); setCurrentDate(fromIso(date)); setRefresh((value) => value + 1);
  }

  function move(direction) {
    if (view === "Month") setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + direction, 1, 12));
    else if (view === "Week") setCurrentDate((date) => addDays(date, direction * 7));
    else if (view === "3 Days") setCurrentDate((date) => addDays(date, direction * 3));
    else setCurrentDate((date) => addDays(date, direction));
  }

  function periodTitle() {
    if (view === "Month") return currentDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    if (view === "Week") { const start = startOfWeek(currentDate); return `${shortDate(start)} – ${shortDate(addDays(start, 6))}`; }
    if (view === "3 Days") return `${shortDate(currentDate)} – ${shortDate(addDays(currentDate, 2))}`;
    if (view === "Schedule") return "Upcoming schedule";
    return longDate(currentDate);
  }

  function TaskChip({ task }) {
    return <button className={`calendar-task calendar-${task.status.toLowerCase()} ${task.source === "Healthcare" ? "calendar-health" : ""}`} onClick={(event) => { event.stopPropagation(); setSelectedTask(task); }} title={task.title}><span>{task.session === "Morning" ? "AM" : task.session === "Evening" ? "PM" : ""}</span>{task.title}</button>;
  }

  function MonthView() {
    return <div className="calendar-month"><div className="calendar-weekdays">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => <strong key={day}>{day}</strong>)}</div><div className="calendar-month-grid">{monthGrid(currentDate).map((date) => <div className={`calendar-day ${date.getMonth() !== currentDate.getMonth() ? "outside" : ""} ${iso(date) === iso(new Date()) ? "today" : ""}`} key={iso(date)} onClick={() => openAddTask(date)} role="button" tabIndex="0"><span>{date.getDate()}</span><div>{tasksForDate(date).slice(0, 4).map((task) => <TaskChip key={`${task.source}-${task.campaignId || "manual"}-${task.id}`} task={task} />)}{tasksForDate(date).length > 4 && <small>+{tasksForDate(date).length - 4} more</small>}</div></div>)}</div></div>;
  }

  function ColumnView({ days }) {
    const start = days === 7 ? startOfWeek(currentDate) : currentDate;
    const dates = Array.from({ length: days }, (_, index) => addDays(start, index));
    return <div className={`calendar-columns columns-${days}`}>{dates.map((date) => <section className={iso(date) === iso(new Date()) ? "today" : ""} key={iso(date)}><button className="calendar-column-heading" onClick={() => openAddTask(date)}><span>{date.toLocaleDateString("en-GB", { weekday: "short" })}</span><strong>{date.getDate()}</strong><small>{date.toLocaleDateString("en-GB", { month: "short" })}</small></button><div className="calendar-column-tasks">{tasksForDate(date).length ? tasksForDate(date).map((task) => <TaskChip key={`${task.source}-${task.campaignId || "manual"}-${task.id}`} task={task} />) : <button className="calendar-add-empty" onClick={() => openAddTask(date)}>+ Add task</button>}</div></section>)}</div>;
  }

  function ScheduleView() {
    const upcoming = tasks.filter((task) => task.date >= iso(new Date()));
    return <div className="calendar-schedule">{upcoming.length ? upcoming.map((task) => <article key={`${task.source}-${task.campaignId || "manual"}-${task.id}`}><div><strong>{longDate(fromIso(task.date))}</strong><span>{task.session || "Any time"}</span></div><button onClick={() => setSelectedTask(task)}><small>{task.source === "Healthcare" ? "Health & Strays" : task.category}</small><b>{task.title}</b><span>{task.detail || task.notes || "No details"}</span></button><em className={`schedule-status status-${task.status.toLowerCase()}`}>{task.status}</em></article>) : <div className="planner-empty"><h3>No upcoming tasks</h3></div>}</div>;
  }

  return (
    <section className="season-planner" data-refresh={refresh}>
      <header className="planner-header"><div><p className="page-kicker">Season organisation</p><h2>📅 Season Planner</h2><p>Treatments from Health & Strays appear automatically.</p></div><button className="primary-button" onClick={() => openAddTask()}>+ Add Task</button></header>
      <div className="calendar-toolbar"><div className="calendar-navigation"><button onClick={() => setCurrentDate(new Date())}>Today</button><button aria-label="Previous" onClick={() => move(-1)}>‹</button><button aria-label="Next" onClick={() => move(1)}>›</button><h3>{periodTitle()}</h3></div><div className="calendar-view-switcher">{VIEWS.map((option) => <button className={view === option ? "active" : ""} key={option} onClick={() => setView(option)}>{option}</button>)}</div></div>
      <nav className="calendar-event-filters" aria-label="Filter planner events">{["All","Treatments","Races","Breeding","Manual Events"].map((option) => { const source = { Treatments:"Healthcare",Races:"Race Centre",Breeding:"Breeding","Manual Events":"Planner" }[option]; const count = option === "All" ? allTasks.length : allTasks.filter((task) => task.source === source).length; return <button className={`${eventFilter === option ? "active" : ""} filter-${option.toLowerCase().replace(/\s+/g,"-")}`} key={option} onClick={() => setEventFilter(option)}>{option} <span>{count}</span></button>; })}</nav>
      <div className="calendar-surface">{view === "Schedule" && <ScheduleView />}{view === "Day" && <ColumnView days={1} />}{view === "3 Days" && <ColumnView days={3} />}{view === "Week" && <ColumnView days={7} />}{view === "Month" && <MonthView />}</div>

      {showForm && <div className="modal-backdrop"><form className="modal" onSubmit={saveManualTask}><header><h3>Add Planner Task</h3><button type="button" className="close" onClick={() => setShowForm(false)}>×</button></header><div className="form-grid"><label className="full">Task title<input name="title" value={form.title} onChange={change} autoFocus /></label><label>Date<input type="date" name="date" value={form.date} onChange={change} /></label><label>Category<select name="category" value={form.category} onChange={change}><option>General</option><option>Breeding</option><option>Racing</option><option>Training</option><option>Health</option><option>Vaccination</option><option>Loft Management</option></select></label><label>Time / Session<select name="session" value={form.session} onChange={change}><option>Any time</option><option>Morning</option><option>Evening</option><option>Morning and evening</option></select></label><label className="full">Notes<textarea rows="3" name="notes" value={form.notes} onChange={change} /></label></div><footer><button type="button" className="neutral-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button">Save Task</button></footer></form></div>}

      {selectedTask && <div className="modal-backdrop"><section className="modal planner-task-modal"><header><div><p>{selectedTask.source === "Healthcare" ? "Health & Strays" : selectedTask.source}</p><h3>{selectedTask.title}</h3></div><button className="close" onClick={() => setSelectedTask(null)}>×</button></header><div className="planner-task-detail"><strong>{longDate(fromIso(selectedTask.date))} • {selectedTask.session || "Any time"}</strong><p>{selectedTask.detail || selectedTask.notes || "No additional details."}</p><span className={`schedule-status status-${selectedTask.status.toLowerCase()}`}>{selectedTask.status}</span></div><footer>{selectedTask.source !== "Breeding" && selectedTask.status === "Pending" && <><button className="secondary-button" onClick={() => updateStatus(selectedTask, "Completed")}>Complete</button><button className="neutral-button" onClick={() => updateStatus(selectedTask, "Missed")}>Mark Missed</button></>}{selectedTask.source !== "Breeding" && <button className="primary-button" onClick={() => reschedule(selectedTask)}>Reschedule</button>}<button className="neutral-button" onClick={() => setSelectedTask(null)}>Close</button></footer></section></div>}
    </section>
  );
}
