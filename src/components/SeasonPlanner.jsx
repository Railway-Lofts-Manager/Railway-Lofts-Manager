import { useState } from "react";
import plannerStore from "../data/PlannerStore";
import healthcareStore from "../data/HealthcareStore";
import raceStore from "../data/RaceStore";
import breedingSeasonStore from "../data/BreedingSeasonStore";
import loftStore from "../data/LoftStore";
import { getFeedPlannerCalendarTasks } from "../data/FeedPlannerCalendarService";
import { getAdaptivePlannerSummaries } from "../data/AdaptivePlannerStore";
import "./SeasonPlanner.css";

const VIEWS = ["Schedule", "Day", "3 Days", "Week", "Month"];
const FEED_TEAMS = [
  {id:"widowhood-cocks",icon:"🐦",name:"Widowhood cocks"}, {id:"widowhood-hens",icon:"🕊️",name:"Widowhood hens"},
  {id:"roundabout-team",icon:"🔄",name:"Roundabout team"}, {id:"young-birds",icon:"🐣",name:"Young birds"},
  {id:"stock-birds",icon:"🏠",name:"Stock birds"}, {id:"breeding-pairs",icon:"🪺",name:"Breeding pairs"},
  {id:"custom",icon:"＋",name:"Custom planner"},
];
function iso(date) {
  return date.toISOString().slice(0, 10);
}
function fromIso(value) {
  return new Date(`${value}T12:00:00`);
}
function addDays(value, days) {
  const date = typeof value === "string" ? fromIso(value) : new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}
function startOfWeek(value) {
  const date = new Date(value);
  const day = date.getDay();
  return addDays(date, day === 0 ? -6 : 1 - day);
}
function monthGrid(value) {
  const first = new Date(value.getFullYear(), value.getMonth(), 1, 12);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}
function longDate(value) {
  return value.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
function shortDate(value) {
  return value.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function SeasonPlanner({ onOpenFeedPlanner }) {
  const [refresh, setRefresh] = useState(0);
  const [view, setView] = useState("Month");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [eventFilter, setEventFilter] = useState("All");
  const [form, setForm] = useState({
    title: "",
    date: iso(new Date()),
    category: "General",
    session: "Any time",
    notes: "",
  });
  const configuredLofts = loftStore.getLofts();
  const savedFeedPlanners = getAdaptivePlannerSummaries();

  const allTasks = [
    ...plannerStore.getTasks().map((task) => ({ ...task, source: "Planner" })),
    ...healthcareStore.getPlannerTasks(),
    ...getFeedPlannerCalendarTasks(),
    ...raceStore
      .getRaces()
      .filter((race) => race.raceDate)
      .map((race) => ({
        id: race.id,
        date: race.raceDate,
        source: "Race Centre",
        category: "Race",
        title: `Race — ${race.racePoint}`,
        detail: `${race.miles} miles, ${race.yards} yards`,
        session: "All day",
        status:
          race.status === "Completed"
            ? "Completed"
            : race.status === "Cancelled"
              ? "Missed"
              : "Pending",
        race,
      })),
    ...breedingSeasonStore.getSeasons().flatMap((season) =>
      Object.values(season.loftRecords || {}).flatMap((boxRecord) =>
        (boxRecord.entries || [])
          .filter((entry) => entry.expectedHatchDate)
          .map((entry) => {
            const loftName =
              configuredLofts.find((loft) => loft.id === boxRecord.loftId)
                ?.name || "Breeding Loft";
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
    "Feed & Drink": "Feed Planner",
    "Manual Events": "Planner",
  }[eventFilter];

  const tasks =
    eventFilter === "All"
      ? allTasks
      : allTasks.filter((task) => task.source === filterSource);

  function tasksForDate(date) {
    const value = iso(date);
    return tasks.filter((task) => task.date === value);
  }
  function change(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }
  function openAddTask(date = currentDate) {
    setForm({
      title: "",
      date: iso(date),
      category: "General",
      session: "Any time",
      notes: "",
    });
    setShowForm(true);
  }
  function saveManualTask(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    plannerStore.addTask({ ...form, title: form.title.trim() });
    setShowForm(false);
    setRefresh((value) => value + 1);
  }

  function updateStatus(task, status) {
    if (task.source === "Healthcare")
      healthcareStore.updateAdministration(task.campaignId, task.id, {
        status,
        completedAt: new Date().toISOString(),
      });
    else if (task.source === "Race Centre")
      raceStore.saveRace({
        ...task.race,
        status: status === "Missed" ? "Cancelled" : status,
      });
    else
      plannerStore.updateTask(task.id, {
        status,
        completedAt: new Date().toISOString(),
      });
    setSelectedTask(null);
    setRefresh((value) => value + 1);
  }

  function reschedule(task) {
    const date = window.prompt("New date:", task.date);
    if (!date) return;
    const updates = { date, status: "Pending", rescheduledFrom: task.date };
    if (task.source === "Healthcare")
      healthcareStore.updateAdministration(task.campaignId, task.id, updates);
    else if (task.source === "Race Centre")
      raceStore.saveRace({ ...task.race, raceDate: date, status: "Upcoming" });
    else plannerStore.updateTask(task.id, updates);
    setSelectedTask(null);
    setCurrentDate(fromIso(date));
    setRefresh((value) => value + 1);
  }

  function move(direction) {
    if (view === "Month")
      setCurrentDate(
        (date) =>
          new Date(date.getFullYear(), date.getMonth() + direction, 1, 12),
      );
    else if (view === "Week")
      setCurrentDate((date) => addDays(date, direction * 7));
    else if (view === "3 Days")
      setCurrentDate((date) => addDays(date, direction * 3));
    else setCurrentDate((date) => addDays(date, direction));
  }

  function periodTitle() {
    if (view === "Month")
      return currentDate.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      });
    if (view === "Week") {
      const start = startOfWeek(currentDate);
      return `${shortDate(start)} – ${shortDate(addDays(start, 6))}`;
    }
    if (view === "3 Days")
      return `${shortDate(currentDate)} – ${shortDate(addDays(currentDate, 2))}`;
    if (view === "Schedule") return "Upcoming schedule";
    return longDate(currentDate);
  }

  function TaskChip({ task }) {
    if (task.source === "Feed Planner") {
      return (
        <div className="calendar-feed-tile" onClick={(event) => event.stopPropagation()}>
          <button
            className="calendar-task calendar-feed"
            onClick={() => setSelectedTask(task)}
            title={`View ${task.title} instructions`}
          >
            {task.title}
          </button>
          <button
            className="calendar-feed-quick-link"
            onClick={() => onOpenFeedPlanner?.(task.feedPlan.teamId)}
          >
            Open Feed Planner →
          </button>
        </div>
      );
    }
    return (
      <button
        className={`calendar-task calendar-${task.status.toLowerCase()} ${task.source === "Healthcare" ? "calendar-health" : ""} ${task.source === "Feed Planner" ? "calendar-feed" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedTask(task);
        }}
        title={task.title}
      >
        <span>
          {task.session === "Morning"
            ? "AM"
            : task.session === "Evening"
              ? "PM"
              : ""}
        </span>
        {task.title}
      </button>
    );
  }

  function MonthView() {
    return (
      <div className="calendar-month">
        <div className="calendar-weekdays">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <strong key={day}>{day}</strong>
          ))}
        </div>
        <div className="calendar-month-grid">
          {monthGrid(currentDate).map((date) => (
            <div
              className={`calendar-day ${date.getMonth() !== currentDate.getMonth() ? "outside" : ""} ${iso(date) === iso(new Date()) ? "today" : ""}`}
              key={iso(date)}
              onClick={() => openAddTask(date)}
              role="button"
              tabIndex="0"
            >
              <span>{date.getDate()}</span>
              <div>
                {tasksForDate(date)
                  .slice(0, 4)
                  .map((task) => (
                    <TaskChip
                      key={`${task.source}-${task.campaignId || "manual"}-${task.id}`}
                      task={task}
                    />
                  ))}
                {tasksForDate(date).length > 4 && (
                  <small>+{tasksForDate(date).length - 4} more</small>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ColumnView({ days }) {
    const start = days === 7 ? startOfWeek(currentDate) : currentDate;
    const dates = Array.from({ length: days }, (_, index) =>
      addDays(start, index),
    );
    return (
      <div className={`calendar-columns columns-${days}`}>
        {dates.map((date) => (
          <section
            className={iso(date) === iso(new Date()) ? "today" : ""}
            key={iso(date)}
          >
            <button
              className="calendar-column-heading"
              onClick={() => openAddTask(date)}
            >
              <span>
                {date.toLocaleDateString("en-GB", { weekday: "short" })}
              </span>
              <strong>{date.getDate()}</strong>
              <small>
                {date.toLocaleDateString("en-GB", { month: "short" })}
              </small>
            </button>
            <div className="calendar-column-tasks">
              {tasksForDate(date).length ? (
                tasksForDate(date).map((task) => (
                  <TaskChip
                    key={`${task.source}-${task.campaignId || "manual"}-${task.id}`}
                    task={task}
                  />
                ))
              ) : (
                <button
                  className="calendar-add-empty"
                  onClick={() => openAddTask(date)}
                >
                  + Add task
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
    );
  }

  function ScheduleView() {
    const upcoming = tasks.filter((task) => task.date >= iso(new Date()));
    return (
      <div className="calendar-schedule">
        {upcoming.length ? (
          upcoming.map((task) => (
            <article
              key={`${task.source}-${task.campaignId || "manual"}-${task.id}`}
            >
              <div>
                <strong>{longDate(fromIso(task.date))}</strong>
                <span>{task.session || "Any time"}</span>
              </div>
              <button onClick={() => setSelectedTask(task)}>
                <small>
                  {task.source === "Healthcare"
                    ? "Health & Strays"
                    : task.category}
                </small>
                <b>{task.title}</b>
                <span>{task.detail || task.notes || "No details"}</span>
              </button>
              <em
                className={`schedule-status status-${task.status.toLowerCase()}`}
              >
                {task.status}
              </em>
            </article>
          ))
        ) : (
          <div className="planner-empty">
            <h3>No upcoming tasks</h3>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="season-planner" data-refresh={refresh}>
      <header className="planner-header">
        <div>
          <p className="page-kicker">Season organisation</p>
          <h2>📅 Season Planner</h2>
          <p>Treatments and live Feed & Drink plans appear automatically.</p>
        </div>
        <button className="primary-button" onClick={() => openAddTask()}>
          + Add Task
        </button>
      </header>
      <div className="calendar-toolbar">
        <div className="calendar-navigation">
          <button onClick={() => setCurrentDate(new Date())}>Today</button>
          <button aria-label="Previous" onClick={() => move(-1)}>
            ‹
          </button>
          <button aria-label="Next" onClick={() => move(1)}>
            ›
          </button>
          <h3>{periodTitle()}</h3>
        </div>
        <div className="calendar-view-switcher">
          {VIEWS.map((option) => (
            <button
              className={view === option ? "active" : ""}
              key={option}
              onClick={() => setView(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <nav
        className="calendar-event-filters"
        aria-label="Filter planner events"
      >
        {[
          "All",
          "Feed & Drink",
          "Treatments",
          "Races",
          "Breeding",
          "Manual Events",
        ].map((option) => {
          const source = {
            "Feed & Drink": "Feed Planner",
            Treatments: "Healthcare",
            Races: "Race Centre",
            Breeding: "Breeding",
            "Manual Events": "Planner",
          }[option];
          const count =
            option === "All"
              ? allTasks.length
              : allTasks.filter((task) => task.source === source).length;
          return (
            <button
              className={`${eventFilter === option ? "active" : ""} filter-${option.toLowerCase().replace(/\s+/g, "-")}`}
              key={option}
              onClick={() => setEventFilter(option)}
            >
              {option} <span>{count}</span>
            </button>
          );
        })}
      </nav>
      {eventFilter === "Feed & Drink" && (
        <section className="season-feed-quick-links">
          <div><p className="page-kicker">Team planners</p><h3>Open a Feed Planner</h3></div>
          <div className="season-feed-quick-grid">
            {FEED_TEAMS.map((team) => (
              <button key={team.id} onClick={() => onOpenFeedPlanner?.(team.id)}>
                <span>{team.icon}</span><strong>{team.name}</strong>
                <small>{savedFeedPlanners[team.id] ? "Open saved planner →" : "Create planner →"}</small>
              </button>
            ))}
          </div>
        </section>
      )}
      <div className="calendar-surface">
        {view === "Schedule" && <ScheduleView />}
        {view === "Day" && <ColumnView days={1} />}
        {view === "3 Days" && <ColumnView days={3} />}
        {view === "Week" && <ColumnView days={7} />}
        {view === "Month" && <MonthView />}
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={saveManualTask}>
            <header>
              <h3>Add Planner Task</h3>
              <button
                type="button"
                className="close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </header>
            <div className="form-grid">
              <label className="full">
                Task title
                <input
                  name="title"
                  value={form.title}
                  onChange={change}
                  autoFocus
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={change}
                />
              </label>
              <label>
                Category
                <select name="category" value={form.category} onChange={change}>
                  <option>General</option>
                  <option>Breeding</option>
                  <option>Racing</option>
                  <option>Training</option>
                  <option>Health</option>
                  <option>Vaccination</option>
                  <option>Loft Management</option>
                </select>
              </label>
              <label>
                Time / Session
                <select name="session" value={form.session} onChange={change}>
                  <option>Any time</option>
                  <option>Morning</option>
                  <option>Evening</option>
                  <option>Morning and evening</option>
                </select>
              </label>
              <label className="full">
                Notes
                <textarea
                  rows="3"
                  name="notes"
                  value={form.notes}
                  onChange={change}
                />
              </label>
            </div>
            <footer>
              <button
                type="button"
                className="neutral-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button className="primary-button">Save Task</button>
            </footer>
          </form>
        </div>
      )}

      {selectedTask && (
        <div className="modal-backdrop">
          <section className="modal planner-task-modal">
            <header>
              <div>
                <p>
                  {selectedTask.source === "Healthcare"
                    ? "Health & Strays"
                    : selectedTask.source}
                </p>
                <h3>{selectedTask.title}</h3>
              </div>
              <button className="close" onClick={() => setSelectedTask(null)}>
                ×
              </button>
            </header>
            <div className="planner-task-detail">
              <strong>
                {longDate(fromIso(selectedTask.date))} •{" "}
                {selectedTask.session || "Any time"}
              </strong>
              <p>
                {selectedTask.detail ||
                  selectedTask.notes ||
                  "No additional details."}
              </p>
              {selectedTask.feedPlan && (
                <div className="calendar-feed-detail">
                  <section>
                    <h4>
                      Feed — {selectedTask.feedPlan.totalFeedCups} full egg cups
                    </h4>
                    {selectedTask.feedPlan.feed.length ? (
                      <ol>
                        {selectedTask.feedPlan.feed.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ol>
                    ) : (
                      <p>No analysed feed selected.</p>
                    )}
                  </section>
                  {selectedTask.feedPlan.feedSupplements.length > 0 && (
                    <section>
                      <h4>On the feed</h4>
                      {selectedTask.feedPlan.feedSupplements.map((item) => (
                        <p key={item.productId}>
                          <strong>{item.name}:</strong> {item.instructions}
                          <small>Why: {item.why}</small>
                        </p>
                      ))}
                    </section>
                  )}
                  <section>
                    <h4>Minerals / grit</h4>
                    <p>
                      <strong>{selectedTask.feedPlan.minerals.name}:</strong>{" "}
                      {selectedTask.feedPlan.minerals.instructions}
                      <small>Why: {selectedTask.feedPlan.minerals.why}</small>
                    </p>
                  </section>
                  <section>
                    <h4>Drinking water</h4>
                    <p>
                      <strong>{selectedTask.feedPlan.water.name}:</strong>{" "}
                      {selectedTask.feedPlan.water.instructions}
                      <small>Why: {selectedTask.feedPlan.water.why}</small>
                    </p>
                  </section>
                  <p className="calendar-feed-condition">
                    {selectedTask.feedPlan.conditionNote}
                  </p>
                </div>
              )}
              <span
                className={`schedule-status status-${selectedTask.status.toLowerCase()}`}
              >
                {selectedTask.status}
              </span>
            </div>
            <footer>
              {!["Breeding", "Feed Planner"].includes(selectedTask.source) &&
                selectedTask.status === "Pending" && (
                  <>
                    <button
                      className="secondary-button"
                      onClick={() => updateStatus(selectedTask, "Completed")}
                    >
                      Complete
                    </button>
                    <button
                      className="neutral-button"
                      onClick={() => updateStatus(selectedTask, "Missed")}
                    >
                      Mark Missed
                    </button>
                  </>
                )}
              {!["Breeding", "Feed Planner"].includes(selectedTask.source) && (
                <button
                  className="primary-button"
                  onClick={() => reschedule(selectedTask)}
                >
                  Reschedule
                </button>
              )}
              {selectedTask.source === "Feed Planner" && (
                <button
                  className="primary-button"
                  onClick={() => onOpenFeedPlanner?.(selectedTask.feedPlan.teamId)}
                >
                  Open {selectedTask.title.replace("Feed & Drink — ", "")} Feed Planner
                </button>
              )}
              <button
                className="neutral-button"
                onClick={() => setSelectedTask(null)}
              >
                Close
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
