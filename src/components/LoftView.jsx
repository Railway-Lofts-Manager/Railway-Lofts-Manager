import { useState } from "react";
import LoftDashboard from "./Breeding/LoftDashboard";
import LoftGrid from "./Breeding/LoftGrid";
import PairRegister from "./Breeding/PairRegister";
import CurrentRound from "./Breeding/CurrentRound";
import BreedingStatistics from
  "./Breeding/BreedingStatistics";
import "./LoftView.css";

function LoftView({
  lofts = [],
  selectedLoft,
  setSelectedLoft,
  assignments,
  setSelectedBox,
}) {
  const [activeView, setActiveView] =
    useState("dashboard");

  const currentLoft =
    lofts.find((loft) => loft.id === selectedLoft?.id) ||
    lofts[0];

  if (!currentLoft) {
    return <section className="panel"><h2>Loft View</h2><p>No lofts have been configured yet.</p></section>;
  }

  function chooseLoft(loft) {
    setSelectedLoft?.(loft);
    setActiveView("dashboard");
  }

  const loftAssignments = Object.entries(
    assignments,
  ).filter(([key]) =>
    key.startsWith(`${currentLoft.id}-`),
  );

  const totals = loftAssignments.reduce(
    (result, [, assignment]) => ({
      eggs:
        result.eggs +
        Number(assignment.eggs || 0),
      youngsters:
        result.youngsters +
        Number(assignment.youngsters || 0),
    }),
    { eggs: 0, youngsters: 0 },
  );

  const loftSummary = {
    ...currentLoft,
    occupied: loftAssignments.length,
    eggs: totals.eggs,
    youngsters: totals.youngsters,
  };

  if (activeView === "nest-boxes") {
    return (
      <LoftGrid
        loft={currentLoft}
        assignments={assignments}
        onSelectBox={setSelectedBox}
        onBack={() => setActiveView("dashboard")}
      />
    );
  }

  if (activeView === "pair-register") {
    return (
      <PairRegister
        loft={currentLoft}
        assignments={assignments}
        onSelectBox={setSelectedBox}
        onBack={() => setActiveView("dashboard")}
      />
    );
  }

  if (activeView === "current-round") {
    return (
      <CurrentRound
        loft={currentLoft}
        assignments={assignments}
        onSelectBox={setSelectedBox}
        onBack={() => setActiveView("dashboard")}
      />
    );
  }

  if (activeView === "statistics") {
    return (
      <BreedingStatistics
        loft={currentLoft}
        assignments={assignments}
        onBack={() => setActiveView("dashboard")}
      />
    );
  }

  return (
    <section className="complete-loft-view">
      <header className="complete-loft-view-header">
        <div><p>Configured accommodation</p><h2>Loft View</h2><span>Select any loft or section to open its records.</span></div>
        <strong>{lofts.length} configured</strong>
      </header>

      <nav className="loft-selector-grid" aria-label="Select loft">
        {lofts.map((loft) => (
          <button type="button" className={loft.id === currentLoft.id ? "active" : ""} key={loft.id} onClick={() => chooseLoft(loft)} style={{ "--loft-card-colour": loft.colour || "#d4af37" }}>
            <span>🏠</span><div><strong>{loft.name}</strong><small>{loft.type || "Loft"} • {loft.boxes ?? loft.nestBoxes ?? 0} boxes</small></div>
          </button>
        ))}
      </nav>

      <LoftDashboard loft={loftSummary} onSelectModule={setActiveView} />
    </section>
  );
}

export default LoftView;
