import BreedingPanel from "./Breeding/BreedingPanel";

function BreedingCentre({
  lofts,
  assignments,
  openLoft,
}) {
  return (
    <BreedingPanel
      lofts={lofts}
      assignments={assignments}
      onSelectLoft={openLoft}
    />
  );
}

export default BreedingCentre;