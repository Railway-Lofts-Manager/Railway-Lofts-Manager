import { useState } from "react";
import "./FeedPlanner.css";

const PROGRAMMES = [
  { id: "widowhood-cocks", icon: "🐦", title: "Widowhood Cocks", description: "Race preparation, recovery and weekly feeding for widowhood cocks." },
  { id: "widowhood-hens", icon: "🕊️", title: "Widowhood Hens", description: "A separate programme matched to the hens’ work and racing schedule." },
  { id: "roundabout-team", icon: "🔄", title: "Roundabout Team", description: "Coordinated plans for cocks and hens flown on the roundabout system." },
  { id: "young-birds", icon: "🐣", title: "Young Birds", description: "Growth, training, race build-up and recovery for the young-bird team." },
  { id: "stock-birds", icon: "🥚", title: "Stock Birds", description: "Seasonal maintenance, winter, pairing, breeding and moulting plans." },
  { id: "breeding-pairs", icon: "🪺", title: "Breeding Pairs", description: "Feed and supplement planning for pairing, eggs and rearing youngsters." },
  { id: "custom", icon: "＋", title: "Custom Programme", description: "Create another programme for a particular team, loft or flying method." },
];

export default function FeedPlanner() {
  const [selected, setSelected] = useState(null);
  const programme = PROGRAMMES.find((item) => item.id === selected);

  if (programme) {
    return (
      <div className="feed-planner-page">
        <button className="feed-back-button" onClick={() => setSelected(null)}>← Back to Feed Plans</button>
        <header className="feed-planner-hero feed-programme-hero">
          <div className="feed-programme-heading-icon">{programme.icon}</div>
          <div><p className="feed-kicker">Feeding programme</p><h1>{programme.title}</h1><p>{programme.description}</p></div>
        </header>
        <section className="feed-content-card feed-programme-empty">
          <span>🗓️</span>
          <h2>{programme.title} plan</h2>
          <p>This plan will be created using suitable products from this fancier’s private Product Library. Products belonging to another loft will never be included.</p>
          <button className="feed-primary-button">Create this feed plan</button>
        </section>
      </div>
    );
  }

  return (
    <div className="feed-planner-page">
      <header className="feed-planner-hero">
        <div><p className="feed-kicker">Loft Commander nutrition</p><h1>Feed Planner</h1><p>Select a team to open its own feeding and drinking programme.</p></div>
        <div className="feed-hero-count"><strong>{PROGRAMMES.length - 1}</strong><span>programme types</span></div>
      </header>

      <section className="feed-plan-dashboard-heading">
        <div><p className="feed-kicker">Team programmes</p><h2>Which birds are you planning for?</h2></div>
        <p>Each programme remains separate and uses only products saved in this fancier’s Product Library.</p>
      </section>

      <section className="feed-programme-grid">
        {PROGRAMMES.map((item) => (
          <button key={item.id} className={`feed-programme-tile ${item.id === "custom" ? "custom" : ""}`} onClick={() => setSelected(item.id)}>
            <span className="feed-programme-icon">{item.icon}</span>
            <span className="feed-programme-copy"><strong>{item.title}</strong><small>{item.description}</small></span>
            <b>Open plan →</b>
          </button>
        ))}
      </section>

      <section className="feed-planner-lower-actions">
        <button className="feed-content-card"><span>📋</span><strong>Saved Plans</strong><small>Open earlier versions and compare changes.</small></button>
        <button className="feed-content-card"><span>📈</span><strong>Feed Performance</strong><small>Compare plans with results and return percentages.</small></button>
      </section>
    </div>
  );
}
