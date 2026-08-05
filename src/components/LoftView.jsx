import { useState } from "react";
import LoftDashboard from "./Breeding/LoftDashboard";
import LoftGrid from "./Breeding/LoftGrid";

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

  return (
    <LoftDashboard
      loft={loftSummary}
      onSelectModule={(moduleId) => {
        if (moduleId === "nest-boxes") {
          setActiveView("nest-boxes");
        }
      }}
    />
  );
}

export default LoftView;