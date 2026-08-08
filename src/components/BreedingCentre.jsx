import BreedingPanel from "./Breeding/BreedingPanel";

function BreedingCentre({
  lofts,
  assignments,
  openLoft,
  onSeasonRollover,
}) {
  return (
    <BreedingPanel
      lofts={lofts}
      assignments={assignments}
      onSelectLoft={openLoft}
      onSeasonRollover={onSeasonRollover}
    />
  );
}

export default BreedingCentre;
