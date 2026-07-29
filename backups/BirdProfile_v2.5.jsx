/* Loft Commander Bird Profile v2.5 - based on latest upload */

import { useState } from "react";

export default function BirdProfile({ bird, onBack }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!bird) {
    return (
      <section className="panel bird-profile-empty">
        <h2>No bird selected</h2>
        <p>Please return to the Bird Register and select a bird.</p>

        <button className="primary" onClick={onBack}>
          ← Back to Bird Register
        </button>
      </section>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "pedigree", label: "Pedigree" },
    { id: "racing", label: "Race Record" },
    { id: "breeding", label: "Breeding" },
    { id: "training", label: "Training" },
    { id: "health", label: "Health" },
    { id: "photos", label: "Photos" },
    { id: "documents", label: "Documents" },
    { id: "notes", label: "Notes" },
    { id: "timeline", label: "Timeline" },
    { id: "archive", label: "Archive" },
  ];

  const statusClass = bird.status
    ? bird.status.toLowerCase().replaceAll(" ", "-")
    : "unknown";

  const displayValue = (value) => {
    if (value === undefined || value === null || value === "") {
      return "—";
    }

    return value;
  };

  const openParentProfile = (parentId) => {
    if (!parentId) return;

    // Parent profile linking will be connected when pedigree navigation is built.
    console.log("Open parent profile:", parentId);
  };

  return (
    <div className="bird-profile">
      <nav className="profile-breadcrumbs" aria-label="Breadcrumb">
        <button type="button" onClick={onBack}>
          Bird Register
        </button>

        <span>›</span>

        <strong>{bird.ringNumber}</strong>
      </nav>

      <section className="profile-hero">
        <div className="profile-hero-top">

  <button
    type="button"
    className="primary"
    onClick={onBack}
  >
    ← Back to Bird Register
  </button>

</div>

        <div className="profile-title-area">
          <div>
            <p className="profile-label">Bird Profile</p>

            <h2>{bird.ringNumber}</h2>

            {bird.name && <h3>“{bird.name}”</h3>}

            <p className="profile-description">
              {displayValue(bird.colour)} {displayValue(bird.sex)}
              <span> • </span>
              {bird.breed || "Unknown Breed"}
            </p>
          </div>

          <div className="profile-id-card">
            <span>Bird ID</span>
            <strong>{displayValue(bird.birdId)}</strong>
          </div>
        </div>
      </section>

      <section className="profile-tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`profile-tab-button ${
              activeTab === tab.id ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </section>

      <section className="profile-content panel">
        {activeTab === "overview" && (
          <div className="profile-section">
            <div className="profile-section-heading">
              <div>
                <p className="profile-label">Lifetime record</p>
                <h3>Overview</h3>
              </div>

              <span className={`status status-${statusClass}`}>
                {bird.status || "Unknown"}
              </span>
            </div>

            <div className="profile-information-grid">
              <div className="profile-information-item">
                <span>Bird ID</span>
                <strong>{displayValue(bird.birdId)}</strong>
              </div>

              <div className="profile-information-item">
                <span>Ring Number</span>
                <strong>{displayValue(bird.ringNumber)}</strong>
              </div>

              <div className="profile-information-item">
                <span>Name</span>
                <strong>{displayValue(bird.name)}</strong>
              </div>

              <div className="profile-information-item">
                <span>Year</span>
                <strong>{displayValue(bird.year)}</strong>
              </div>

              <div className="profile-information-item">
                <span>Breed</span>
                <strong>{displayValue(bird.breed)}</strong>
              </div>

              <div className="profile-information-item">
                <span>Sex</span>
                <strong>{displayValue(bird.sex)}</strong>
              </div>

              <div className="profile-information-item">
                <span>Colour</span>
                <strong>{displayValue(bird.colour)}</strong>
              </div>

              <div className="profile-information-item">
                <span>Status</span>
                <strong>{displayValue(bird.status)}</strong>
              </div>

              <div className="profile-information-item">
                <span>Current Loft</span>
                <strong>{displayValue(bird.loft)}</strong>
              </div>

              <div className="profile-information-item">
                <span>Nest Box</span>
                <strong>{displayValue(bird.nestBox)}</strong>
              </div>

              <div className="profile-information-item">
                <span>Date of Birth</span>
                <strong>
                  {displayValue(bird.dateOfBirth || bird.hatchDate)}
                </strong>
              </div>

              <div className="profile-information-item">
                <span>Archive Status</span>
                <strong>{bird.archived ? "Archived" : "Active"}</strong>
              </div>
            </div>

            <div className="profile-notes-preview">
              <h4>Current Notes</h4>
              <p>{bird.notes || "No notes have been recorded for this bird."}</p>
            </div>
          </div>
        )}

        {activeTab === "pedigree" && (
          <div className="profile-section">
            <div className="profile-section-heading">
              <div>
                <p className="profile-label">Family history</p>
                <h3>Pedigree</h3>
              </div>
            </div>

            <div className="pedigree-parent-grid">
              <button
                type="button"
                className="pedigree-parent-card"
                onClick={() => openParentProfile(bird.fatherId)}
                disabled={!bird.fatherId}
              >
                <span>Sire / Father</span>
                <strong>{bird.fatherId || "Unknown"}</strong>
                <small>
                  {bird.fatherId
                    ? "Profile linking coming next"
                    : "No father recorded"}
                </small>
              </button>

              <button
                type="button"
                className="pedigree-parent-card"
                onClick={() => openParentProfile(bird.motherId)}
                disabled={!bird.motherId}
              >
                <span>Dam / Mother</span>
                <strong>{bird.motherId || "Unknown"}</strong>
                <small>
                  {bird.motherId
                    ? "Profile linking coming next"
                    : "No mother recorded"}
                </small>
              </button>
            </div>

            <div className="profile-placeholder">
              <h4>Full pedigree tree</h4>
              <p>
                This section will show parents, grandparents, great-grandparents
                and attached pedigree documents.
              </p>
            </div>
          </div>
        )}

        {activeTab === "racing" && (
          <ProfilePlaceholder
            title="Race Record"
            label="Performance history"
            message="No race results have been connected to this bird yet."
            detail="This area will show race points, dates, distances, velocities, positions, prizes and honours."
          />
        )}

        {activeTab === "breeding" && (
          <ProfilePlaceholder
            title="Breeding"
            label="Breeding history"
            message="No breeding records have been connected to this bird yet."
            detail="This area will show mates, eggs, hatch results, foster records and every youngster bred."
          />
        )}

        {activeTab === "training" && (
          <ProfilePlaceholder
            title="Training"
            label="Training history"
            message="No training records have been connected to this bird yet."
            detail="This area will show training locations, distances, liberation times, arrivals and trapping performance."
          />
        )}

        {activeTab === "health" && (
          <ProfilePlaceholder
            title="Health"
            label="Hospital and treatment history"
            message="No health records have been connected to this bird yet."
            detail="This area will show vaccinations, treatments, illnesses, quarantine periods and recovery notes."
          />
        )}

        {activeTab === "photos" && (
          <ProfilePlaceholder
            title="Photos"
            label="Bird gallery"
            message="No photographs have been attached to this bird."
            detail="This area will hold profile photographs and other important images."
            buttonText="+ Add Photo"
          />
        )}

        {activeTab === "documents" && (
          <ProfilePlaceholder
            title="Documents"
            label="Historical archive"
            message="No documents have been attached to this bird."
            detail="This area will hold pedigree certificates, handwritten records, vaccination paperwork and supporting documents."
            buttonText="+ Add Document"
          />
        )}

        {activeTab === "notes" && (
          <div className="profile-section">
            <div className="profile-section-heading">
              <div>
                <p className="profile-label">Chronological diary</p>
                <h3>Notes</h3>
              </div>

              <button type="button" className="primary">
                + Add Note
              </button>
            </div>

            <div className="profile-notes-preview">
              <h4>Existing Notes</h4>
              <p>{bird.notes || "No notes have been recorded for this bird."}</p>
            </div>

            <p className="profile-coming-soon">
              Timestamped notes will be added without overwriting earlier
              entries.
            </p>
          </div>
        )}

        {activeTab === "timeline" && (
          <ProfilePlaceholder
            title="Timeline"
            label="Complete life story"
            message="There are no timeline events recorded yet."
            detail="Events from breeding, health, training, racing and loft movements will appear here in date order."
          />
        )}

        {activeTab === "archive" && (
          <div className="profile-section">
            <div className="profile-section-heading">
              <div>
                <p className="profile-label">Permanent lifetime record</p>
                <h3>Archive</h3>
              </div>
            </div>

            <div className="archive-warning">
              <h4>{bird.archived ? "This bird is archived" : "Archive Bird"}</h4>

              <p>
                Archiving removes a bird from active working lists while
                preserving its complete lifetime history. Birds are never
                permanently deleted from Loft Commander.
              </p>

              <button type="button" className="secondary">
                {bird.archived ? "Restore to Active Register" : "Archive Bird"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ProfilePlaceholder({
  title,
  label,
  message,
  detail,
  buttonText,
}) {
  return (
    <div className="profile-section">
      <div className="profile-section-heading">
        <div>
          <p className="profile-label">{label}</p>
          <h3>{title}</h3>
        </div>

        {buttonText && (
          <button type="button" className="primary">
            {buttonText}
          </button>
        )}
      </div>

      <div className="profile-placeholder">
        <h4>{message}</h4>
        <p>{detail}</p>
      </div>
    </div>
  );
}