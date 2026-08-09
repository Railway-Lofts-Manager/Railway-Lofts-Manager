import useBreedingSeasons from "../hooks/useBreedingSeasons";
import hospitalStore, { HOSPITAL_AREAS } from "../data/HospitalStore";
import "./LifetimeTimeline.css";

function normaliseRing(value) {
  return String(value || "").trim().toUpperCase();
}

function formatDate(value) {
  if (!value) return "Date not recorded";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function currentAssignments() {
  try {
    return JSON.parse(localStorage.getItem("loft-commander-boxes") || "{}") || {};
  } catch {
    return {};
  }
}

function breedingEvents(seasons, bird) {
  const events = [];
  const birdRing = normaliseRing(bird?.ringNumber);
  const assignments = currentAssignments();

  seasons.forEach((season) => {
    Object.values(season.loftRecords || {}).forEach((boxRecord) => {
      const assignment = assignments[boxRecord.id] || {};

      (boxRecord.entries || []).forEach((entry) => {
        const cock = normaliseRing(entry.cockRingNumber || assignment.cock);
        const hen = normaliseRing(entry.henRingNumber || assignment.hen);
        const youngster = normaliseRing(entry.ringNumber);
        const isParent = birdRing === cock || birdRing === hen;
        const isYoungster =
          youngster === birdRing ||
          (entry.youngBirdId && entry.youngBirdId === bird?.birdId);

        if (isYoungster && entry.laidDate) {
          events.push({
            id: `laid-${entry.id}`,
            date: entry.laidDate,
            type: "breeding",
            icon: "🥚",
            title: "Egg laid",
            description: `Breeding season ${season.year}, nest box ${boxRecord.boxNumber}.`,
          });
        }

        if (isYoungster && entry.hatchDate) {
          events.push({
            id: `hatched-${entry.id}`,
            date: entry.hatchDate,
            type: "birth",
            icon: "◆",
            title: "Young bird hatched",
            description: `Sire ${cock || "not recorded"} • Dam ${hen || "not recorded"}.`,
          });
        }

        if (isYoungster && entry.ringedDate) {
          events.push({
            id: `ringed-${entry.id}`,
            date: entry.ringedDate,
            type: "identity",
            icon: "◉",
            title: "Ring fitted",
            description: youngster || birdRing,
          });
        }

        if (isParent && (entry.laidDate || entry.hatchDate)) {
          const mate = birdRing === cock ? hen : cock;
          events.push({
            id: `parent-${entry.id}`,
            date: entry.hatchDate || entry.laidDate,
            type: "breeding",
            icon: "◇",
            title: entry.hatchDate ? "Youngster hatched" : "Breeding entry recorded",
            description: `${birdRing === cock ? "Sire" : "Dam"} with ${mate || "mate not recorded"}${youngster ? ` • Youngster ${youngster}` : ""}.`,
          });
        }
      });
    });
  });

  return events;
}

function movementEvents(bird) {
  return (bird?.loftHistory || []).map((movement, index, movements) => ({
    id: movement.id || `movement-${index}`,
    date: movement.date,
    type: "movement",
    icon: "⌂",
    title: index === 0 ? "Initial loft assignment" : "Loft movement",
    description: `${
      movement.fromLoftName ||
      (index > 0 ? movements[index - 1].loftName : "Initial assignment")
    } → ${movement.loftName || "Loft not recorded"}${movement.reason ? ` • ${movement.reason}` : ""}`,
  }));
}

function strayHistoryEvents(bird) {
  const hospital = hospitalStore.getState();
  const stray = hospital.strays.find(
    (record) =>
      record.strayId === bird?.formerStrayId ||
      record.transferredBirdId === bird?.birdId,
  );

  if (!stray) return [];

  const events = [];

  (stray.visits || []).forEach((visit, index) => {
    const area = HOSPITAL_AREAS.find((record) => record.id === visit.areaId);

    events.push({
      id: `stray-arrival-${stray.strayId}-${visit.admissionId || index}`,
      date: visit.arrivalDate,
      type: "health",
      icon: "🏥",
      title: index === 0 ? "First recorded stray visit" : `Returning stray visit ${index + 1}`,
      description: `${stray.strayId} • ${area?.name || "Hospital/Quarantine"}, Box ${visit.boxNumber || "not recorded"}${visit.condition ? ` • ${visit.condition}` : ""}`,
    });

    if (visit.outcome) {
      events.push({
        id: `stray-outcome-${stray.strayId}-${visit.admissionId || index}`,
        date: visit.departureDate || visit.arrivalDate,
        type: "health",
        icon: "✓",
        title: "Stray visit outcome",
        description: `${visit.outcome}${visit.notes ? ` • ${visit.notes}` : ""}`,
      });
    }
  });

  if (stray.transferredBirdId === bird?.birdId || bird?.formerStrayId === stray.strayId) {
    events.push({
      id: `stray-transfer-${stray.strayId}`,
      date: stray.transferredAt || bird?.createdAt,
      type: "identity",
      icon: "LC",
      title: "Transferred into loft ownership",
      description: `${stray.strayId} became permanent Loft Commander bird ${bird?.birdId || stray.transferredBirdId}. All previous stray visits remain linked.`,
    });
  }

  return events;
}

export default function LifetimeTimeline({ bird }) {
  const seasons = useBreedingSeasons();
  const linkedBreedingEvents = breedingEvents(seasons, bird);
  const ringFittedEvent = linkedBreedingEvents.find(
    (event) => event.id.startsWith("ringed-"),
  );

  const events = [
    ...linkedBreedingEvents,
    ...movementEvents(bird),
    ...strayHistoryEvents(bird),
  ];

  if (bird?.createdAt) {
    events.push({
      id: "bird-register-created",
      date: ringFittedEvent?.date || bird.createdAt,
      type: "identity",
      icon: "LC",
      title: ringFittedEvent
        ? "Permanent Bird ID assigned"
        : "Bird record created",
      description: `Permanent Bird ID ${bird.birdId || "not recorded"}.`,
    });
  }

  const uniqueEvents = Array.from(
    new Map(events.map((event) => [event.id, event])).values(),
  ).sort((a, b) => {
    const dateOrder = String(a.date || "").localeCompare(String(b.date || ""));

    if (dateOrder !== 0) return dateOrder;

    const eventOrder = (event) => {
      if (event.id === "bird-register-created") return 1;
      if (event.id.startsWith("ringed-")) return 2;
      if (event.type === "movement") return 3;
      return 0;
    };

    return eventOrder(a) - eventOrder(b);
  });

  return (
    <div className="profile-section lifetime-timeline">
      <div className="profile-section-heading command-section-heading">
        <div>
          <p className="profile-label">Complete life story</p>
          <h3>Lifetime Timeline</h3>
        </div>
        <span className="timeline-event-count">
          {uniqueEvents.length} {uniqueEvents.length === 1 ? "event" : "events"}
        </span>
      </div>

      {uniqueEvents.length === 0 ? (
        <div className="timeline-empty">
          <span>◷</span>
          <h4>No life events recorded yet</h4>
          <p>Birth, ringing, loft movements and breeding events will appear here automatically.</p>
        </div>
      ) : (
        <div className="timeline-list">
          {uniqueEvents.map((event, index) => (
            <article className={`timeline-event timeline-${event.type}`} key={event.id}>
              <div className="timeline-rail">
                <span>{event.icon}</span>
                {index < uniqueEvents.length - 1 && <i />}
              </div>
              <div className="timeline-event-card">
                <small>{formatDate(event.date)}</small>
                <h4>{event.title}</h4>
                <p>{event.description}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
