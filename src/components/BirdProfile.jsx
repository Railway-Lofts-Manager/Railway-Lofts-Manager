import { useRef, useState } from "react";
import "../pages/BirdProfile.css";

const tabs = [
  { id: "overview", label: "Overview", icon: "⌂" },
  { id: "pedigree", label: "Pedigree", icon: "♜" },
  { id: "racing", label: "Race Record", icon: "★" },
  { id: "breeding", label: "Breeding", icon: "◇" },
  { id: "training", label: "Training", icon: "➤" },
  { id: "health", label: "Health", icon: "✚" },
  { id: "photos", label: "Photos", icon: "▣" },
  { id: "documents", label: "Documents", icon: "▤" },
  { id: "notes", label: "Notes", icon: "✎" },
  { id: "timeline", label: "Timeline", icon: "◷" },
  { id: "archive", label: "Archive", icon: "▰" },
];

export default function BirdProfile({
  bird,
  onBack,
  onUpdateBird,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [photo, setPhoto] = useState(bird?.photo || null);
const fileInputRef = useRef(null);

const openPhotoPicker = () => {
  fileInputRef.current?.click();
};

const handlePhotoSelected = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

reader.onload = () => {
    setPhoto(reader.result);

    onUpdateBird?.({
        ...bird,
        photo: reader.result,
    });
};

  reader.readAsDataURL(file);
};
  if (!bird) {
    return (
      <section className="panel bird-profile-empty">
        <div className="empty-profile-emblem">LC</div>
        <h2>No bird selected</h2>
        <p>Return to the Bird Register and select a bird.</p>

        <button type="button" className="primary" onClick={onBack}>
          ← Back to Bird Register
        </button>
      </section>
    );
  }

  const displayValue = (value, fallback = "Not recorded") => {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }

    return value;
  };

  const statusClass = String(bird.status || "unknown")
    .toLowerCase()
    .replaceAll(" ", "-");

  const birdInitials = String(bird.name || bird.ringNumber || "LC")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase();

  const ringYear =
    bird.year ||
    String(bird.ringNumber || "").match(/\d{2}/)?.[0] ||
    "—";

  const openParentProfile = (parentId) => {
    if (!parentId) return;
    console.log("Open parent profile:", parentId);
  };

  const quickStats = [
    {
      label: "Race Entries",
      value: bird.raceEntries ?? bird.races ?? 0,
      detail: "Lifetime races",
    },
    {
      label: "Prize Wins",
      value: bird.prizeWins ?? bird.wins ?? 0,
      detail: "Recorded prizes",
    },
    {
      label: "Youngsters",
      value: bird.youngsters ?? bird.youngBirds ?? 0,
      detail: "Young birds bred",
    },
    {
      label: "Training Miles",
      value: bird.trainingMiles ?? 0,
      detail: "Recorded distance",
    },
  ];

  const informationItems = [
    ["Bird ID", bird.birdId],
    ["Ring Number", bird.ringNumber],
    ["Name", bird.name],
    ["Year", bird.year],
    ["Breed", bird.breed],
    ["Sex", bird.sex],
    ["Colour", bird.colour],
    ["Status", bird.status],
    ["Current Loft", bird.loft],
    ["Loft Section", bird.section],
    ["Nest Box", bird.nestBox],
    ["Date of Birth", bird.dateOfBirth || bird.hatchDate],
  ];

  return (
    <div className="bird-profile command-profile">
      <nav className="profile-breadcrumbs" aria-label="Breadcrumb">
        <button type="button" onClick={onBack}>
          Bird Register
        </button>

        <span>/</span>
        <span>Bird Profile</span>
        <span>/</span>

        <strong>{displayValue(bird.ringNumber, "Unknown bird")}</strong>
      </nav>

      <section className="command-hero">
        <div className="command-hero-bar">
          <button
            type="button"
            className="command-back-button"
            onClick={onBack}
          >
            <span>←</span>
            Bird Register
          </button>

          <div className="command-system-status">
            <span className="system-status-light" />
            PROFILE ACTIVE
          </div>
        </div>

        <div className="command-hero-layout">
          <div className="command-photo-panel">
          <div
  className="command-photo-frame"
  onClick={openPhotoPicker}
  style={{ cursor: "pointer" }}
>
            {photo ? (
                <img
                src={photo}
                  alt={bird.name || bird.ringNumber || "Pigeon"}
                />
              ) : (
                <div className="command-photo-placeholder">
                  <span className="photo-placeholder-wings">◆</span>
                  <strong>{birdInitials}</strong>
                  <small>Bird photograph</small>
                  <small>+ Add Photograph</small>
                </div>
              )}

              <div className="photo-frame-corner corner-top-left" />
              <div className="photo-frame-corner corner-top-right" />
              <div className="photo-frame-corner corner-bottom-left" />
              <div className="photo-frame-corner corner-bottom-right" />
            </div>

            <>
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    style={{ display: "none" }}
    onChange={handlePhotoSelected}
  />

</>
          </div>

          <div className="command-identity-panel">
            <div className="command-profile-heading">
              <p className="command-eyebrow">
                LOFT COMMANDER • OFFICIAL BIRD RECORD
              </p>

              <div className="command-title-row">
                <div>
                  <h1>{displayValue(bird.ringNumber, "RING NOT RECORDED")}</h1>

                  {bird.name && (
                    <h2>
                      <span>Call Sign</span>
                      “{bird.name}”
                    </h2>
                  )}
                </div>

                <span className={`command-status status-${statusClass}`}>
                  {bird.status || "Unknown"}
                </span>
              </div>
            </div>

            <div className="command-classification">
              <div>
                <span>Colour</span>
                <strong>{displayValue(bird.colour)}</strong>
              </div>

              <div>
                <span>Sex</span>
                <strong>{displayValue(bird.sex)}</strong>
              </div>

              <div>
                <span>Breed</span>
                <strong>{displayValue(bird.breed)}</strong>
              </div>

              <div>
                <span>Year</span>
                <strong>{ringYear}</strong>
              </div>
            </div>

            <div className="command-location-strip">
              <div>
                <span>Current Assignment</span>
                <strong>
                  {displayValue(bird.loft)}
                  {bird.section ? ` • ${bird.section}` : ""}
                </strong>
              </div>

              <div>
                <span>Nest Box</span>
                <strong>{displayValue(bird.nestBox)}</strong>
              </div>

              <div>
                <span>Permanent Bird ID</span>
                <strong>{displayValue(bird.birdId)}</strong>
              </div>
            </div>

            <div className="command-actions">
              <button type="button" className="command-primary-action">
                Edit Bird Profile
              </button>

              <button type="button" className="command-secondary-action">
                Print Record
              </button>

              <button type="button" className="command-secondary-action">
                Export Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="command-stat-grid">
        {quickStats.map((stat) => (
          <article className="command-stat-card" key={stat.label}>
            <div className="command-stat-topline">
              <span>{stat.label}</span>
              <small>LIVE RECORD</small>
            </div>

            <strong>{stat.value}</strong>
            <p>{stat.detail}</p>
          </article>
        ))}
      </section>


<div className="command-dossier-layout">
</div>
      <section className="profile-tab-navigation command-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`profile-tab-button ${
              activeTab === tab.id ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="command-tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </section>

      <section className="profile-content panel command-content-panel">
        {activeTab === "overview" && (
          <div className="profile-section">
            <SectionHeading
              label="Command summary"
              title="Bird Overview"
              rightContent={
                <span className={`command-status status-${statusClass}`}>
                  {bird.status || "Unknown"}
                </span>
              }
            />

            <div className="command-overview-layout">
              <div className="command-information-panel">
                <div className="command-panel-title">
                  <div>
                    <p>IDENTIFICATION</p>
                    <h4>Official Bird Information</h4>
                  </div>

                  <span>LC-01</span>
                </div>

                <div className="profile-information-grid">
                  {informationItems.map(([label, value]) => (
                    <div className="profile-information-item" key={label}>
                      <span>{label}</span>
                      <strong>{displayValue(value)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="command-side-column">
                <div className="command-side-card">
                  <div className="command-side-heading">
                    <span>◆</span>

                    <div>
                      <p>CURRENT STATUS</p>
                      <h4>Operational Record</h4>
                    </div>
                  </div>

                  <dl className="command-record-list">
                    <div>
                      <dt>Register status</dt>
                      <dd>{bird.archived ? "Archived" : "Active"}</dd>
                    </div>

                    <div>
                      <dt>Current role</dt>
                      <dd>{displayValue(bird.status)}</dd>
                    </div>

                    <div>
                      <dt>Assigned loft</dt>
                      <dd>{displayValue(bird.loft)}</dd>
                    </div>

                    <div>
                      <dt>Last updated</dt>
                      <dd>{displayValue(bird.updatedAt)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="command-side-card honours-card">
                  <div className="command-side-heading">
                    <span>★</span>

                    <div>
                      <p>HONOURS BOARD</p>
                      <h4>Career Achievements</h4>
                    </div>
                  </div>

                  <div className="command-honours-number">
                    {bird.honours ?? bird.prizeWins ?? bird.wins ?? 0}
                  </div>

                  <p className="command-honours-caption">
                    Recorded wins, prizes and special achievements.
                  </p>

                  <button type="button" className="command-inline-action">
                    View honours record →
                  </button>
                </div>
              </aside>
            </div>

            <div className="command-notes-panel">
              <div className="command-notes-heading">
                <div>
                  <p>LOFT NOTES</p>
                  <h4>Latest Information</h4>
                </div>

                <button type="button">+ Add Note</button>
              </div>

              <p>
                {bird.notes ||
                  "No notes have been recorded for this bird. Use this area to build a permanent diary throughout the bird’s lifetime."}
              </p>
            </div>
          </div>
        )}

        {activeTab === "pedigree" && (
          <div className="profile-section">
            <SectionHeading
              label="Bloodline intelligence"
              title="Pedigree Command"
            />

            <div className="pedigree-parent-grid">
              <ParentCard
                title="Sire / Father"
                parentId={bird.fatherId}
                parentName={bird.fatherName}
                parentBreed={bird.fatherBreed}
                onOpen={openParentProfile}
              />

              <ParentCard
                title="Dam / Mother"
                parentId={bird.motherId}
                parentName={bird.motherName}
                parentBreed={bird.motherBreed}
                onOpen={openParentProfile}
              />
            </div>

            <CommandPlaceholder
              icon="♜"
              title="Full Pedigree Intelligence"
              message="Parents, grandparents and great-grandparents will appear here as a linked family tree."
              detail="Pedigree certificates, historic loft notes and supporting documents will also connect to the bird’s permanent profile."
            />
          </div>
        )}

        {activeTab === "racing" && (
          <ProfilePlaceholder
            icon="★"
            title="Race Record"
            label="Performance command"
            message="No race results have been connected to this bird yet."
            detail="Race points, dates, distances, velocities, positions, prizes, honours and lifetime performance will appear here."
            buttonText="+ Add Race Result"
          />
        )}

        {activeTab === "breeding" && (
          <ProfilePlaceholder
            icon="◇"
            title="Breeding Record"
            label="Breeding command"
            message="No breeding records have been connected to this bird yet."
            detail="Mates, eggs, fertility, hatch results, foster records and every youngster bred will appear here."
            buttonText="+ Add Breeding Record"
          />
        )}

        {activeTab === "training" && (
          <ProfilePlaceholder
            icon="➤"
            title="Training Record"
            label="Flight preparation"
            message="No training records have been connected to this bird yet."
            detail="Training locations, distances, liberation times, arrivals and trapping performance will appear here."
            buttonText="+ Add Training Record"
          />
        )}

        {activeTab === "health" && (
          <ProfilePlaceholder
            icon="✚"
            title="Hospital Record"
            label="Health command"
            message="No health records have been connected to this bird yet."
            detail="Vaccinations, treatments, illnesses, quarantine periods and recovery notes will appear here."
            buttonText="+ Add Health Record"
          />
        )}

        {activeTab === "photos" && (
          <ProfilePlaceholder
            icon="▣"
            title="Photo Gallery"
            label="Visual archive"
            message="No photographs have been attached to this bird."
            detail="Profile photographs, race condition photographs and other important images will be stored here."
            buttonText="+ Add Photograph"
          />
        )}

        {activeTab === "documents" && (
          <ProfilePlaceholder
            icon="▤"
            title="Document Archive"
            label="Historical intelligence"
            message="No documents have been attached to this bird."
            detail="Pedigree certificates, handwritten records, vaccination paperwork and supporting documents will be preserved here."
            buttonText="+ Add Document"
          />
        )}

        {activeTab === "notes" && (
          <div className="profile-section">
            <SectionHeading
              label="Chronological diary"
              title="Commander’s Notes"
              rightContent={
                <button type="button" className="command-primary-action">
                  + Add Note
                </button>
              }
            />

            <div className="command-notes-panel large-notes-panel">
              <div className="command-notes-heading">
                <div>
                  <p>CURRENT ENTRY</p>
                  <h4>Existing Notes</h4>
                </div>

                <span>Permanent record</span>
              </div>

              <p>
                {bird.notes ||
                  "No notes have been recorded for this bird. New timestamped entries will be added without removing earlier notes."}
              </p>
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <ProfilePlaceholder
            icon="◷"
            title="Lifetime Timeline"
            label="Complete life story"
            message="There are no timeline events recorded yet."
            detail="Breeding, health, training, racing and loft movement events will appear here in date order."
          />
        )}

        {activeTab === "archive" && (
          <div className="profile-section">
            <SectionHeading
              label="Permanent lifetime record"
              title="Archive Control"
            />

            <div className="archive-warning command-archive-warning">
              <div className="archive-warning-icon">▰</div>

              <div>
                <p className="profile-label">ARCHIVE PROTOCOL</p>

                <h4>
                  {bird.archived
                    ? "This bird is currently archived"
                    : "Move this bird into the permanent archive"}
                </h4>

                <p>
                  Archiving removes a bird from active working lists while
                  preserving its complete lifetime history. Birds are never
                  permanently deleted from Loft Commander.
                </p>

                <button type="button" className="command-primary-action">
                  {bird.archived
                    ? "Restore to Active Register"
                    : "Archive Bird Record"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeading({ label, title, rightContent }) {
  return (
    <div className="profile-section-heading command-section-heading">
      <div>
        <p className="profile-label">{label}</p>
        <h3>{title}</h3>
      </div>

      {rightContent}
    </div>
  );
}

function ParentCard({
  title,
  parentId,
  parentName,
  parentBreed,
  onOpen,
}) {
  return (
    <button
      type="button"
      className="pedigree-parent-card command-parent-card"
      onClick={() => onOpen(parentId)}
      disabled={!parentId}
    >
      <div className="parent-card-header">
        <span>{title}</span>
        <small>{parentId ? "LINKED RECORD" : "NOT RECORDED"}</small>
      </div>

      <strong>{parentId || "Unknown"}</strong>

      <p>{parentName || "No name recorded"}</p>

      <small>{parentBreed || "Breed not recorded"}</small>
    </button>
  );
}

function CommandPlaceholder({ icon, title, message, detail }) {
  return (
    <div className="profile-placeholder command-placeholder">
      <div className="command-placeholder-icon">{icon}</div>
      <h4>{title}</h4>
      <strong>{message}</strong>
      <p>{detail}</p>
    </div>
  );
}

function ProfilePlaceholder({
  icon,
  title,
  label,
  message,
  detail,
  buttonText,
}) {
  return (
    <div className="profile-section">
      <SectionHeading
        label={label}
        title={title}
        rightContent={
          buttonText ? (
            <button type="button" className="command-primary-action">
              {buttonText}
            </button>
          ) : null
        }
      />

      <CommandPlaceholder
        icon={icon}
        title={title}
        message={message}
        detail={detail}
      />
    </div>
  );
}