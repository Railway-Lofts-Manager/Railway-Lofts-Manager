import "./BreedingPanel.css";
import LoftCard from "./LoftCard";

const breedingLofts = [
  {
    id: "race-shed",
    name: "Race Shed",
    nestBoxes: 16,
    occupied: 0,
  },
  {
    id: "gs1",
    name: "GS1",
    nestBoxes: 9,
    occupied: 0,
  },
  {
    id: "gs2",
    name: "GS2",
    nestBoxes: 9,
    occupied: 0,
  },
  {
    id: "gs3",
    name: "GS3",
    nestBoxes: 16,
    occupied: 0,
  },
  {
    id: "js1",
    name: "JS1",
    nestBoxes: 12,
    occupied: 0,
  },
];

export default function BreedingPanel() {
  function handleOpenLoft(loft) {
    console.log("Open Loft:", loft.name);
  }

  return (
    <section className="breeding-panel">

      <header className="breeding-header">

        <p className="breeding-label">
          BREEDING CENTRE
        </p>

        <h2>Breeding</h2>

        <p className="breeding-intro">
          Select a breeding loft to manage
          breeding pairs, nest boxes and
          youngsters.
        </p>

      </header>

      <div className="breeding-loft-grid">

        {breedingLofts.map((loft) => (
          <LoftCard
            key={loft.id}
            loft={loft}
            onOpen={handleOpenLoft}
          />
        ))}

      </div>

    </section>
  );
}