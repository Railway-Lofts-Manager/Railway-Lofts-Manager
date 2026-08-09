import { useEffect, useMemo, useState } from "react";
import productStore from "../data/ProductStore";
import feedPlanStore from "../data/FeedPlanStore";
import { generateFeedPlan } from "../data/FeedPlanGenerator";
import "./FeedPlanner.css";

const PROGRAMMES = [
  { id:"widowhood-cocks", icon:"🐦", title:"Widowhood Cocks", method:"Widowhood", description:"Race preparation, recovery and weekly feeding for widowhood cocks." },
  { id:"widowhood-hens", icon:"🕊️", title:"Widowhood Hens", method:"Widowhood", description:"A separate programme matched to the hens’ work and racing schedule." },
  { id:"roundabout-team", icon:"🔄", title:"Roundabout Team", method:"Roundabout", description:"Coordinated plans for cocks and hens flown on the roundabout system." },
  { id:"young-birds", icon:"🐣", title:"Young Birds", method:"Young bird natural", description:"Growth, training, race build-up and recovery for the young-bird team." },
  { id:"stock-birds", icon:"🥚", title:"Stock Birds", method:"Stock", description:"Seasonal maintenance, winter, pairing, breeding and moulting plans." },
  { id:"breeding-pairs", icon:"🪺", title:"Breeding Pairs", method:"Breeding", description:"Feed and supplement planning for pairing, eggs and rearing youngsters." },
  { id:"custom", icon:"＋", title:"Custom Programme", method:"Custom", description:"Create another programme for a particular team, loft or flying method." },
];

const EMPTY_SETUP = { name:"", method:"", season:"Racing season", visits:"Twice daily", preferredVisit:"Morning", feedingMethod:"Trough", feedMeasure:"Egg cups", eggCupsPerBird:"1", eggCupGrams:"32.5", measureBasis:"Per bird per day", portionStrategy:"Adjust for workload and distance", birdCount:"", raceDay:"Saturday", distanceBand:"Weekly race distance", trainingDays:[], feedProductIds:[], waterProductIds:[], notes:"" };

function ProductChecks({ title, products, selected, onChange, emptyText }) {
  return <fieldset className="feed-plan-product-picker"><legend>{title}</legend>{products.length ? <div>{products.map((product) => <label key={product.id}><input type="checkbox" checked={selected.includes(product.id)} onChange={(event) => onChange(event.target.checked ? [...selected, product.id] : selected.filter((id) => id !== product.id))} /><span><strong>{product.name}</strong><small>{product.primaryJob || product.category}</small></span></label>)}</div> : <p>{emptyText}</p>}</fieldset>;
}

function formatEggCups(value) {
  const number = Number(value) || 0;
  const quarters = Math.round(number * 4);
  if (number > 0 && quarters === 0) return "less than ¼ full egg cup";
  const whole = Math.floor(quarters / 4);
  const remainder = quarters % 4;
  const fraction = remainder === 1 ? "¼" : remainder === 2 ? "½" : remainder === 3 ? "¾" : "";
  if (!whole) return fraction ? `${fraction} full egg cup` : "0 egg cups";
  if (!fraction) return `${whole} full egg cup${whole === 1 ? "" : "s"}`;
  return `${whole}${fraction} egg cups`;
}

function displayMeasure(value, unit) {
  return unit === "egg cup" ? formatEggCups(value) : `${value} g`;
}

function GeneratedPlan({ plan, onClose, onEdit, onRegenerate }) {
  const generated = plan.generatedPlan;
  return <section className="generated-feed-plan">
    <header><div><p className="feed-kicker">Generated race-week plan</p><h2>{plan.name}</h2><p>{plan.birdCount} birds · {plan.distanceBand} · race day {plan.raceDay}</p></div><div><button className="feed-primary-button" onClick={onRegenerate}>Regenerate plan</button><button className="feed-secondary-button" onClick={onEdit}>Edit setup</button><button className="feed-secondary-button" onClick={onClose}>Close plan</button></div></header>
    {generated.warnings.length > 0 && <div className="feed-generation-warnings"><strong>Checks required before use</strong><ul>{generated.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>}
    <div className="feed-nutrition-summary"><span><small>Lighter product</small><strong>{generated.analysis.lightProduct}</strong></span><span><small>Energy product</small><strong>{generated.analysis.energyProduct}</strong></span><span><small>Minerals / grit</small><strong>{generated.analysis.mineralProduct || "Not available"}</strong></span><span><small>Feeding measure</small><strong>{generated.analysis.feedingMeasure || `${generated.analysis.buildDays} build days`}</strong></span></div>
    <div className="feed-week-grid">{generated.schedule.map((day) => { const unit=day.measureUnit || "g", perBird=day.amountPerBird ?? day.gramsPerBird, total=day.totalAmount ?? day.totalGrams; return <article key={day.day}><header><strong>{day.day}</strong><small>{day.phase}</small></header><div className="feed-day-quantity"><b>{displayMeasure(total,unit)}</b><span>prepare in total · {displayMeasure(perBird,unit)} per bird</span>{day.estimatedGrams && <em>Estimated {day.estimatedGrams.total} g total ({day.estimatedGrams.lowTotal}–{day.estimatedGrams.highTotal} g using the standard cup range)</em>}{day.sessions?.map((session) => <small key={session.name}>{session.name}: {displayMeasure(session.amount,unit)}</small>)}</div><h4>Feed mixture</h4>{day.feed.length ? day.feed.map((item) => <div className="feed-day-product" key={item.productId}><strong>{item.name} — {item.percent}%</strong><span>{displayMeasure(item.amount ?? item.grams,unit)} in total mix</span><span>{displayMeasure(item.perBirdAmount,unit)} per bird</span><p>Why: {item.why}</p></div>) : <p className="feed-muted">Product information is missing.</p>}<h4>Minerals / grit</h4>{day.minerals ? <div className="feed-day-product minerals"><strong>{day.minerals.name}</strong><span>{day.minerals.instructions}</span><p>Why: {day.minerals.why}</p></div> : <p className="feed-muted">No mineral product available.</p>}<h4>Drinking water</h4><div className="feed-day-product water"><strong>{day.water.name}</strong><span>{day.water.instructions}</span><p>Why: {day.water.why}</p></div></article>; })}</div>
    <p className="feed-generator-note">Egg-cup instructions are rounded to the nearest practical quarter cup. This rules-based guide uses information saved in this fancier’s Product Library; check bird condition, weather, workload and current labels before following it.</p>
  </section>;
}

export default function FeedPlanner() {
  const [products, setProducts] = useState(productStore.getProducts());
  const [plans, setPlans] = useState(feedPlanStore.getPlans());
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [setup, setSetup] = useState(EMPTY_SETUP);
  const [message, setMessage] = useState("");
  const [viewingPlanId, setViewingPlanId] = useState(null);
  const programme = PROGRAMMES.find((item) => item.id === selected);

  useEffect(() => productStore.subscribe(setProducts), []);
  useEffect(() => feedPlanStore.subscribe(setPlans), []);

  const activeProducts = products.filter((product) => !product.archived && product.inStock !== false);
  const feedProducts = activeProducts.filter((product) => ["Corn / Feed Mix","Straight Grain","Mineral / Grit"].includes(product.category) || ["Feed","Separate","Feed or water"].includes(product.administration));
  const waterProducts = activeProducts.filter((product) => ["Drink Additive","Supplement","Medication / Treatment"].includes(product.category) && ["Water","Feed or water"].includes(product.administration));
  const groupPlans = useMemo(() => plans.filter((plan) => plan.programmeId === selected), [plans, selected]);
  const viewingPlan = plans.find((plan) => plan.id === viewingPlanId);

  function startPlan() {
    setSetup({ ...EMPTY_SETUP, name:`${programme.title} Programme`, method:programme.method });
    setMessage("");
    setCreating(true);
  }

  function update(field, value) { setSetup((current) => ({ ...current, [field]:value })); }

  function savePlan(event) {
    event.preventDefault();
    if (!setup.name.trim() || !setup.birdCount || Number(setup.birdCount) < 1) { setMessage("Enter a plan name and the number of birds."); return; }
    const prepared = { ...setup, name:setup.name.trim(), birdCount:Number(setup.birdCount), programmeId:programme.id, programmeTitle:programme.title, status:"Generated" };
    const saved = feedPlanStore.savePlan({ ...prepared, generatedPlan:generateFeedPlan(prepared, products) });
    setCreating(false);
    setViewingPlanId(saved.id);
    setMessage(`${saved.name} has been saved.`);
  }

  function regeneratePlan(plan) {
    feedPlanStore.savePlan({ ...plan, generatedPlan:generateFeedPlan(plan, products), status:"Generated" });
    setMessage(`${plan.name} has been regenerated using the current Product Library.`);
  }

  if (programme) return <div className="feed-planner-page">
    <button className="feed-back-button" onClick={() => { setSelected(null); setCreating(false); }}>← Back to Feed Plans</button>
    <header className="feed-planner-hero feed-programme-hero"><div className="feed-programme-heading-icon">{programme.icon}</div><div><p className="feed-kicker">Feeding programme</p><h1>{programme.title}</h1><p>{programme.description}</p></div></header>
    {message && <p className="feed-plan-success">{message}</p>}
    {!creating && viewingPlan?.generatedPlan && <GeneratedPlan plan={viewingPlan} onClose={() => setViewingPlanId(null)} onEdit={() => { setSetup(viewingPlan); setCreating(true); }} onRegenerate={() => regeneratePlan(viewingPlan)} />}
    {!creating && !viewingPlan && <>
      <section className="feed-programme-toolbar"><div><p className="feed-kicker">Saved for this team</p><h2>{groupPlans.length ? `${groupPlans.length} feed ${groupPlans.length === 1 ? "plan" : "plans"}` : "No plan created yet"}</h2></div><button className="feed-primary-button" onClick={startPlan}>＋ Create feed plan</button></section>
      {groupPlans.length ? <section className="feed-saved-plan-grid">{groupPlans.map((plan) => <article className="feed-content-card" key={plan.id}><div><span>{plan.season}</span><b>Version {plan.version}</b></div><h3>{plan.name}</h3><p>{plan.birdCount} birds · {plan.visits} · {plan.feedingMethod}</p><small>{plan.feedProductIds.length} feed products · {plan.waterProductIds.length} water products</small>{plan.generatedPlan && <button className="feed-primary-button" onClick={() => setViewingPlanId(plan.id)}>View weekly plan</button>}<button className="feed-secondary-button" onClick={() => { setSetup(plan); setCreating(true); }}>Edit setup</button></article>)}</section> : <section className="feed-content-card feed-programme-empty"><span>🗓️</span><h2>{programme.title} plan</h2><p>Create a programme using suitable products from this fancier’s private Product Library.</p><button className="feed-primary-button" onClick={startPlan}>Create this feed plan</button></section>}
    </>}
    {creating && <form className="feed-plan-setup" onSubmit={savePlan}>
      <header><div><p className="feed-kicker">Programme setup</p><h2>{setup.id ? "Edit feed plan" : `Create ${programme.title} plan`}</h2></div><button type="button" className="feed-secondary-button" onClick={() => setCreating(false)}>Cancel</button></header>
      <section className="feed-plan-form-grid">
        <label>Plan name<input value={setup.name} onChange={(e) => update("name",e.target.value)} /></label>
        <label>Flying / management method<select value={setup.method} onChange={(e) => update("method",e.target.value)}>{["Widowhood","Roundabout","Natural","Young bird natural","Darkness","Stock","Breeding","Custom"].map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Programme period<select value={setup.season} onChange={(e) => update("season",e.target.value)}>{["Racing season","Training period","Rest period","Winter","Pairing and breeding","Rearing youngsters","Moulting"].map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Number of birds<input type="number" min="1" value={setup.birdCount} onChange={(e) => update("birdCount",e.target.value)} /></label>
        <label>Loft visits<select value={setup.visits} onChange={(e) => update("visits",e.target.value)}>{["Once daily","Twice daily","Morning only","Evening only","Variable by day"].map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Preferred visit<select value={setup.preferredVisit} onChange={(e) => update("preferredVisit",e.target.value)}>{["Morning","Evening","Both","Varies with work shifts"].map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>How the birds are fed<select value={setup.feedingMethod} onChange={(e) => update("feedingMethod",e.target.value)}>{["Trough","Individual pots","Communal pots","Floor feeding","Mixed method"].map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Feed measuring unit<select value={setup.feedMeasure || "Egg cups"} onChange={(e) => update("feedMeasure",e.target.value)}>{["Egg cups","Grams"].map((v) => <option key={v}>{v}</option>)}</select></label>
        {(setup.feedMeasure || "Egg cups") === "Egg cups" && <><label>Normal egg cups per bird<input type="number" min="0.1" step="0.1" value={setup.eggCupsPerBird || "1"} onChange={(e) => update("eggCupsPerBird",e.target.value)} /><small className="feed-field-note">Normal starting measure: 1 egg cup per bird.</small></label><label>Measurement basis<select value={setup.measureBasis || "Per bird per day"} onChange={(e) => update("measureBasis",e.target.value)}><option>Per bird per day</option><option>Per bird at each feed</option></select></label><label>Estimated grams in your egg cup<input type="number" min="1" step="0.5" value={setup.eggCupGrams || "32.5"} onChange={(e) => update("eggCupGrams",e.target.value)} /><small className="feed-field-note">Default midpoint is 32.5 g; grain density can change the actual weight.</small></label><label>Portion adjustment<select value={setup.portionStrategy || "Adjust for workload and distance"} onChange={(e) => update("portionStrategy",e.target.value)}><option>Adjust for workload and distance</option><option>Keep egg-cup quantity fixed</option></select></label></>}
        <label>Normal race day<select value={setup.raceDay} onChange={(e) => update("raceDay",e.target.value)}>{["Saturday","Sunday","Variable","Not applicable"].map((v) => <option key={v}>{v}</option>)}</select></label>
        <label className="full">Race-distance adjustment<select value={setup.distanceBand} onChange={(e) => update("distanceBand",e.target.value)}>{["Weekly race distance","Short distance","Middle distance","Long distance","No race adjustment"].map((v) => <option key={v}>{v}</option>)}</select></label>
        <fieldset className="feed-plan-product-picker"><legend>Normal training days</legend><div>{["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"].map((day) => <label key={day}><input type="checkbox" checked={(setup.trainingDays || []).includes(day)} onChange={(event) => update("trainingDays",event.target.checked ? [...(setup.trainingDays || []),day] : (setup.trainingDays || []).filter((value) => value !== day))} /><span><strong>{day}</strong><small>Schedule post-training recovery when appropriate</small></span></label>)}</div></fieldset>
        <ProductChecks title="Available feed products" products={feedProducts} selected={setup.feedProductIds} onChange={(value) => update("feedProductIds",value)} emptyText="No suitable feed products are currently in the Product Library." />
        <ProductChecks title="Available water products" products={waterProducts} selected={setup.waterProductIds} onChange={(value) => update("waterProductIds",value)} emptyText="No suitable water products are currently in the Product Library." />
        <label className="full">Requirements or restrictions<textarea rows="3" value={setup.notes} onChange={(e) => update("notes",e.target.value)} placeholder="Work shifts, products to avoid, missing sessions or other requirements" /></label>
      </section>
      {message && <p className="product-form-error">{message}</p>}
      <footer><button type="button" className="feed-secondary-button" onClick={() => setCreating(false)}>Cancel</button><button type="submit" className="feed-primary-button">Save programme setup</button></footer>
    </form>}
  </div>;

  return <div className="feed-planner-page"><header className="feed-planner-hero"><div><p className="feed-kicker">Loft Commander nutrition</p><h1>Feed Planner</h1><p>Select a team to open its own feeding and drinking programme.</p></div><div className="feed-hero-count"><strong>{PROGRAMMES.length - 1}</strong><span>programme types</span></div></header><section className="feed-plan-dashboard-heading"><div><p className="feed-kicker">Team programmes</p><h2>Which birds are you planning for?</h2></div><p>Each programme remains separate and uses only products saved in this fancier’s Product Library.</p></section><section className="feed-programme-grid">{PROGRAMMES.map((item) => <button key={item.id} className={`feed-programme-tile ${item.id === "custom" ? "custom" : ""}`} onClick={() => setSelected(item.id)}><span className="feed-programme-icon">{item.icon}</span><span className="feed-programme-copy"><strong>{item.title}</strong><small>{item.description}</small></span><b>{plans.filter((plan) => plan.programmeId === item.id).length ? `${plans.filter((plan) => plan.programmeId === item.id).length} saved · Open →` : "Open plan →"}</b></button>)}</section><section className="feed-planner-lower-actions"><button className="feed-content-card"><span>📋</span><strong>Saved Plans</strong><small>Open earlier versions and compare changes.</small></button><button className="feed-content-card"><span>📈</span><strong>Feed Performance</strong><small>Compare plans with results and return percentages.</small></button></section></div>;
}
