import { useState } from "react";
import LoftDashboard from "./Breeding/LoftDashboard";
import LoftGrid from "./Breeding/LoftGrid";
import PairRegister from "./Breeding/PairRegister";
import CurrentRound from "./Breeding/CurrentRound";
import BreedingStatistics from
  "./Breeding/BreedingStatistics";

function LoftView({
  selectedLoft,
  assignments,
  setSelectedBox,
}) {
  const [activeView, setActiveView] =
    useState("dashboard");

  const loftAssignments = Object.entries(
    assignments,
  ).filter(([key]) =>
    key.startsWith(`${selectedLoft.id}-`),
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
    ...selectedLoft,
    occupied: loftAssignments.length,
    eggs: totals.eggs,
    youngsters: totals.youngsters,
  };

  if (activeView === "nest-boxes") {
    return (
      <LoftGrid
        loft={selectedLoft}
        assignments={assignments}
        onSelectBox={setSelectedBox}
        onBack={() => setActiveView("dashboard")}
      />
    );
  }

  if (activeView === "pair-register") {
    return (
      <PairRegister
        loft={selectedLoft}
        assignments={assignments}
        onSelectBox={setSelectedBox}
        onBack={() => setActiveView("dashboard")}
      />
    );
  }

  if (activeView === "current-round") {
    return (
      <CurrentRound
        loft={selectedLoft}
        assignments={assignments}
        onSelectBox={setSelectedBox}
        onBack={() => setActiveView("dashboard")}
      />
    );
  }

  if (activeView === "statistics") {
    return (
      <BreedingStatistics
        loft={selectedLoft}
        assignments={assignments}
        onBack={() => setActiveView("dashboard")}
      />
    );
  }

  return (
    <LoftDashboard
      loft={loftSummary}
      onSelectModule={setActiveView}
    />
  );
}

export default LoftView;