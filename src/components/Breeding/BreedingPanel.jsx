import { useState } from "react";
import "./BreedingPanel.css";
import LoftCard from "./LoftCard";
import settingsStore from "../../data/SettingsStore";
import useBreedingSeasons from "../../hooks/useBreedingSeasons";
import BreedingSeasonRollover from "./BreedingSeasonRollover";
import BreedingSeasonArchive from "./BreedingSeasonArchive";

export default function BreedingPanel({
  lofts = [],
  assignments = {},
  onSelectLoft,
  onSeasonRollover,
}) {
  const seasons = useBreedingSeasons();
  const [rolloverOpen, setRolloverOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const activeSeason =
    seasons.find((season) => season.status === "active") || null;
  const currentSeason =
    activeSeason?.year || settingsStore.getSettings().season;

  const getOccupiedBoxes = (loftId) =>
    Object.keys(assignments).filter((key) =>
      key.startsWith(`${loftId}-`),
    ).length;

  return (
    <section className="breeding-panel">
      <header className="breeding-header">
        <div className="breeding-header-content">
          <div>
            <p className="breeding-label">
              BREEDING CENTRE • SEASON {currentSeason}
            </p>

            <h2>Breeding Locations</h2>

            <p className="breeding-intro">
              Select a loft to open its nest box planner.
            </p>
          </div>

          <div className="breeding-season-actions">
            <button
              type="button"
              className="breeding-archive-button"
              onClick={() => setArchiveOpen(true)}
            >
              View Season Archive
            </button>

            <button
              type="button"
              className="breeding-season-button"
              onClick={() => setRolloverOpen(true)}
            >
              Close Season / Start Next
            </button>
          </div>
        </div>
      </header>

      <div className="breeding-loft-grid">
        {lofts.map((loft) => (
          <LoftCard
            key={loft.id}
            loft={{
              ...loft,
              nestBoxes: loft.boxes,
              occupied: getOccupiedBoxes(loft.id),
            }}
            onOpen={onSelectLoft}
          />
        ))}
      </div>

      <BreedingSeasonRollover
        open={rolloverOpen}
        currentSeason={Number(currentSeason)}
        seasons={seasons}
        onClose={() => setRolloverOpen(false)}
        onConfirm={(nextYear) => {
          onSeasonRollover?.(nextYear);
          setRolloverOpen(false);
        }}
      />

      <BreedingSeasonArchive
        open={archiveOpen}
        seasons={seasons}
        lofts={lofts}
        onClose={() => setArchiveOpen(false)}
      />
    </section>
  );
}
