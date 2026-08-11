const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
export const FEED_GENERATOR_VERSION = 12;
const productText = (p) => [p.name,p.description,p.primaryJob,p.ingredients,p.nutritionalAnalysis,p.keyBenefits,p.feedingGuidance,...(p.programmeStages || [])].join(" ").toLowerCase();
const score = (p, words) => words.reduce((total,word) => total + (productText(p).includes(word) ? 1 : 0),0);
const dose = (p, contextPattern) => {
  const rule = p.mixingRules?.find((item) => contextPattern?.test(String(item.context || ""))) || p.mixingRules?.[0];
  return rule ? `${rule.amount} ${rule.unit} per ${rule.basisAmount} ${rule.basisUnit}` : [p.dosageAmount,p.dosageUnit,p.dosageBasis].filter(Boolean).join(" · ") || "Use verified label directions";
};
const reason = (p) => p.primaryJob || "its recorded Product Library purpose";
const distance = (band) => band === "Long distance" ? {days:4,multiplier:1.18,label:"Long-distance energy build"} : band === "Middle distance" ? {days:3,multiplier:1.10,label:"Middle-distance energy build"} : band === "Short distance" ? {days:2,multiplier:1.03,label:"Short-distance preparation"} : {days:3,multiplier:1.08,label:"Distance-adjusted preparation"};

function feedRole(product) {
  const analysedRoles = product.plannerAnalysis?.feedRoles || [];
  if (analysedRoles.includes("conditioner")) return "conditioner";
  if (analysedRoles.includes("energy")) return "energy";
  if (analysedRoles.includes("light")) return "light";
  if (analysedRoles.includes("general")) return "general";
  const value = productText(product);
  if (/red band|conditioner|conditioning|trapping reward|aniseed/.test(value)) return "conditioner";
  const scores = {
    light: score(product,["barley","light feeding","maintenance","weight control","fibre","fiber","depurative"]),
    energy: score(product,["energy","race preparation","sports mixture","superstar","fat","safflower","oilseed"]),
    general: score(product,["all round","general-purpose","balanced pigeon corn","everyday base"]),
  };
  return Object.entries(scores).sort((a,b) => b[1]-a[1])[0][1] ? Object.entries(scores).sort((a,b) => b[1]-a[1])[0][0] : "general";
}

function roleTargets({ isRacingProgramme, isNonRacingProgramme, before, settings, weekFocus }) {
  if (isNonRacingProgramme) return {general:60,light:25,energy:15,conditioner:0};
  if (!isRacingProgramme && weekFocus === "Recovery and reset week") return {general:45,light:40,energy:15,conditioner:0};
  if (!isRacingProgramme && weekFocus === "Lighter maintenance week") return {general:35,light:50,energy:15,conditioner:0};
  if (!isRacingProgramme && weekFocus === "Pre-race conditioning week") return {general:30,light:30,energy:35,conditioner:5};
  if (!isRacingProgramme && weekFocus === "Condition-building week") return {general:35,light:30,energy:30,conditioner:5};
  if (!isRacingProgramme) return {general:45,light:35,energy:20,conditioner:0};
  if (before === 0) return {general:40,light:35,energy:25,conditioner:0};
  if (before === 6) return {general:45,light:40,energy:15,conditioner:0};
  if (before === 1) return {general:20,light:5,energy:55,conditioner:20};
  if (before <= settings.days) {
    const progress = settings.days-before+1;
    const general = 25, energy = 25+progress*7, conditioner = 5+progress*3;
    return {general,light:100-general-energy-conditioner,energy,conditioner};
  }
  return {general:30,light:50,energy:20,conditioner:0};
}

function wholeCupAmounts(items, targetTotal) {
  const values = items.map((item) => ({...item,exact:targetTotal*item.percent/100}));
  const rounded = values.map((item) => ({...item,amount:Math.round(item.exact)}));
  let difference = targetTotal-rounded.reduce((sum,item) => sum+item.amount,0);
  while (difference !== 0 && rounded.length) {
    const candidates = [...rounded].filter((item) => difference > 0 || item.amount > 1).sort((a,b) => difference > 0 ? (b.exact-b.amount)-(a.exact-a.amount) : b.amount-a.amount);
    const target = candidates[0];
    if (!target) break;
    const original = rounded.find((item) => item.product.id === target.product.id);
    original.amount += difference > 0 ? 1 : -1;
    difference += difference > 0 ? -1 : 1;
  }
  return rounded;
}

function buildFeedMix(baseFeeds, targets, total, perBird, roundToWholeCups) {
  if (!baseFeeds.length) return [];
  const groups = {general:[],light:[],energy:[],conditioner:[]};
  baseFeeds.forEach((product) => groups[feedRole(product)].push(product));
  const adjusted = {...targets};
  Object.keys(groups).forEach((role) => {
    if (!groups[role].length && adjusted[role]) {
      const fallback = ["general","light","energy","conditioner"].find((name) => groups[name].length);
      if (fallback) adjusted[fallback] += adjusted[role];
      adjusted[role] = 0;
    }
  });
  const raw = [];
  Object.entries(groups).forEach(([role,items]) => {
    if (!items.length || !adjusted[role]) return;
    const share = adjusted[role] / items.length;
    items.forEach((product) => raw.push({product,percent:share}));
  });
  const rounded = raw.map((item,index) => ({...item,percent:index === raw.length-1 ? 100-raw.slice(0,-1).reduce((sum,value) => sum+Math.round(value.percent),0) : Math.round(item.percent)}));
  const active = rounded.filter((item) => item.percent > 0);
  const measured = roundToWholeCups ? wholeCupAmounts(active,Math.round(total)) : active.map((item) => ({...item,amount:Math.round(total*item.percent)/100}));
  return measured.map(({product,percent,amount}) => ({productId:product.id,name:product.name,percent,amount,perBirdAmount:Math.round(perBird*percent)/100,why:reason(product)}));
}

function feedAdditionsForDay(products, { day, before, isRacingProgramme, isNonRacingProgramme, programmeId }) {
  const additions = [];
  products.filter((product) => product.verified !== false && product.category !== "Medication / Treatment").forEach((product) => {
    const value = productText(product);
    if (/brewer.?s yeast|beer yeast/.test(value)) {
      const use = isRacingProgramme ? [0,6].includes(before) : isNonRacingProgramme && ["Tuesday","Friday"].includes(day);
      if (use) additions.push({productId:product.id,name:product.name,instructions:dose(product),why:isRacingProgramme ? "Recorded return and following-day protein, amino-acid and B-vitamin support." : "Recorded twice-weekly breeding or maintenance support."});
    } else if (/wonder pigeon|organic-acid glyceride/.test(value)) {
      const raceUse = isRacingProgramme && before === 1;
      const breedingUse = isNonRacingProgramme && ["breeding-pairs","stock-birds"].includes(programmeId) && ["Tuesday","Friday"].includes(day);
      if (raceUse || breedingUse) additions.push({productId:product.id,name:product.name,instructions:raceUse ? dose(product,/before and on basketing/i) : dose(product,/breeding and young birds/i),why:raceUse ? "Recorded pre-basketing intestinal-condition and nutrient-absorption support." : "Recorded breeding and young-bird intestinal-condition support."});
    }
  });
  return additions;
}

export function generateFeedPlan(setup, allProducts) {
  const selectedFeed = (setup.feedProductIds || []).map((id) => allProducts.find((p) => p.id === id)).filter(Boolean);
  const selectedWater = (setup.waterProductIds || []).map((id) => allProducts.find((p) => p.id === id)).filter(Boolean);
  const selectedMinerals = selectedFeed.filter((p) => p.category === "Mineral / Grit" || p.administration === "Separate");
  const libraryMinerals = allProducts.filter((p) => !p.archived && p.inStock !== false && (p.category === "Mineral / Grit" || p.administration === "Separate"));
  const mineral = selectedMinerals[0] || libraryMinerals.find((p) => p.verified) || libraryMinerals[0];
  const baseFeeds = selectedFeed.filter((p) => ["Corn / Feed Mix","Straight Grain"].includes(p.category));
  const feedSupplements = selectedFeed.filter((p) => !baseFeeds.includes(p) && p.id !== mineral?.id && (p.category === "Supplement" || ["Feed","Feed or water"].includes(p.administration)));
  const nonTreatmentWaters = selectedWater.filter((p) => p.category !== "Medication / Treatment");
  const safeWaters = nonTreatmentWaters.filter((p) => p.verified !== false);
  const recovery = [...safeWaters]
    .filter((p) => p.administration === "Water")
    .sort((a,b) => score(b,["electrolyte","rehydration","mineral losses"])-score(a,["electrolyte","rehydration","mineral losses"]))
    .find((p) => /electrolyte|electrolit|rehydration/.test(productText(p)));
  const wonder = safeWaters.find((p) => /wonder pigeon|organic-acid glyceride/.test(productText(p)));
  const acidifier = nonTreatmentWaters.find((p) => /cider vinegar|apple cider|\bacv\b|acidif/.test(productText(p)) && p.mixingRules?.length);
  const isNonRacingProgramme = ["stock-birds","breeding-pairs"].includes(setup.programmeId) || ["Stock","Breeding"].includes(setup.method);
  const isRacingProgramme = !isNonRacingProgramme && DAYS.includes(setup.raceDay) && setup.distanceBand !== "No race adjustment";
  const raceIndex = isRacingProgramme ? DAYS.indexOf(setup.raceDay) : -1;
  const settings = isRacingProgramme ? distance(setup.distanceBand) : {days:0,multiplier:1,label:"Non-racing programme"};
  const birds = Number(setup.birdCount) || 1;
  const usesEggCups = setup.feedMeasure === "Egg cups" || setup.feedingMethod === "Individual egg cups" || !setup.feedMeasure;
  const visitsPerDay = setup.visits === "Twice daily" ? 2 : 1;
  const eggCupsPerBird = Number(setup.eggCupsPerBird) || 1;
  const eggCupGrams = Number(setup.eggCupGrams) || 32.5;
  const adjustEggCups = setup.portionStrategy !== "Keep egg-cup quantity fixed";
  const cupsPerDay = setup.measureBasis === "Per bird at each feed" ? eggCupsPerBird*visitsPerDay : eggCupsPerBird;
  const base = usesEggCups ? cupsPerDay : 30;
  const warnings = [];
  if (!baseFeeds.length) warnings.push("No base corn or feed mixture was selected.");
  if (!mineral) warnings.push("No mineral or grit product is available.");
  else if (!selectedMinerals.length) warnings.push(`${mineral.name} has been added from the Product Library as the available mineral/grit provision.`);
  [...new Map([...selectedFeed,...selectedWater].filter((p) => p.verified === false && p.id !== acidifier?.id).map((p) => [p.id,p])).values()].forEach((p) => warnings.push(`${p.name} is not verified and has not been scheduled automatically.`));
  if (acidifier?.verified === false) warnings.push(`${acidifier.name} uses the saved user-supplied rate; check the product and drinker instructions before use.`);
  selectedWater.filter((p) => p.category === "Medication / Treatment").forEach((p) => warnings.push(`${p.name} is a treatment and has not been scheduled by the Feed Planner.`));
  const acidifierDays = acidifier ? (isRacingProgramme ? DAYS.filter((day,index) => [5,4,3].includes((raceIndex-index+7)%7)).slice(0,2) : ["Monday","Thursday"]) : [];

  const schedule = DAYS.map((day,index) => {
    const before = isRacingProgramme ? (raceIndex-index+7)%7 : null;
    let phase = isNonRacingProgramme ? (setup.programmeId === "breeding-pairs" ? "Breeding support" : "Stock-bird maintenance") : setup.weekFocus || "Controlled maintenance";
    let amount = isNonRacingProgramme || (usesEggCups && !adjustEggCups) ? base : base*.9;
    if (isRacingProgramme && before === 0) { phase="Race and return recovery"; amount=base; }
    else if (isRacingProgramme && before === 1) { phase="Final fuel and basketing"; amount=usesEggCups && !adjustEggCups ? base : base*settings.multiplier; }
    else if (isRacingProgramme && before <= settings.days) { phase=settings.label; amount=usesEggCups && !adjustEggCups ? base : base*(1+(settings.days-before+1)*.025); }
    else if (isRacingProgramme && before === 6) { phase="Recovery and reset"; amount=usesEggCups && !adjustEggCups ? base : base*.92; }
    const perBird = Math.round(amount*10)/10;
    const total = usesEggCups ? Math.round(birds*amount) : Math.round(birds*amount);
    const feed = buildFeedMix(baseFeeds,roleTargets({isRacingProgramme,isNonRacingProgramme,before,settings,weekFocus:setup.weekFocus}),total,amount,usesEggCups);
    let feedAdditives = feedAdditionsForDay(feedSupplements,{day,before,isRacingProgramme,isNonRacingProgramme,programmeId:setup.programmeId});
    let water = {productId:null,name:"Fresh clear water",instructions:"No additive scheduled",why:"Provides clear-water time and avoids unnecessary combinations."};
    if (isRacingProgramme && before === 0 && recovery) water={productId:recovery.id,name:recovery.name,instructions:`Race return only: ${dose(recovery)}. Give when the birds arrive home, then replace with fresh clear water after the recovery drink. Do not leave available all day.`,why:"Replaces fluid and electrolyte losses immediately after the race."};
    else if (isRacingProgramme && before === 1 && wonder) water={productId:wonder.id,name:wonder.name,instructions:dose(wonder,/before and on basketing/i),why:"Recorded pre-basketing intestinal-condition support."};
    else if (isRacingProgramme && before === 6 && wonder) water={productId:wonder.id,name:wonder.name,instructions:dose(wonder,/arrival and following day|breeding, young birds, arrival/i),why:"Recorded following-day intestinal-condition and recovery support."};
    else if (isNonRacingProgramme && wonder && ["Tuesday","Friday"].includes(day)) water={productId:wonder.id,name:wonder.name,instructions:dose(wonder,/breeding, young birds, arrival/i),why:"Recorded breeding and young-bird intestinal-condition support."};
    else if (acidifierDays.includes(day)) water={productId:acidifier.id,name:acidifier.name,instructions:`Routine care day: ${dose(acidifier)}`,why:acidifier.primaryJob||"Recorded digestion and drinking-water acidification support"};
    feedAdditives = feedAdditives.filter((item) => item.productId !== water.productId);
    const sessions = usesEggCups && visitsPerDay === 2 ? [{name:"Morning feed",amount:Math.floor(total/2)},{name:"Evening feed",amount:total-Math.floor(total/2)}] : [{name:setup.visits === "Evening only" ? "Evening feed" : "Daily feed",amount:total}];
    const estimatedGrams = usesEggCups ? {perBird:Math.round(amount*eggCupGrams),total:Math.round(total*eggCupGrams),lowTotal:Math.round(total*30),highTotal:Math.round(total*35)} : null;
    const minerals = mineral ? {productId:mineral.id,name:mineral.name,instructions:mineral.feedingGuidance||mineral.frequency||"Provide separately and refresh regularly.",why:mineral.primaryJob||"Daily mineral and grit support",verified:mineral.verified} : null;
    return {day,phase,amountPerBird:perBird,totalAmount:total,measureUnit:usesEggCups?"egg cup":"g",estimatedGrams,sessions,feed,feedAdditives,water,minerals};
  });

  const usedIds = new Set(schedule.flatMap((day) => [...day.feed.map((item) => item.productId),...(day.feedAdditives||[]).map((item) => item.productId),day.water.productId,day.minerals?.productId]).filter(Boolean));
  [...selectedFeed,...selectedWater].filter((product) => product.category !== "Medication / Treatment" && product.verified !== false && !usedIds.has(product.id)).forEach((product) => warnings.push(`${product.name} was selected but no suitable day was found from its recorded directions.`));
  const roleNames = (role) => baseFeeds.filter((product) => feedRole(product) === role).map((product) => product.name).join(", ") || "Not identified";
  return {generatorVersion:FEED_GENERATOR_VERSION,generatedAt:new Date().toISOString(),schedule,warnings,analysis:{lightProduct:roleNames("light"),energyProduct:[roleNames("energy"),roleNames("conditioner")].filter((value) => value !== "Not identified").join(", ")||"Not identified",mineralProduct:mineral?.name||"Not available",buildDays:settings.days,programmeType:isRacingProgramme?"Racing":isNonRacingProgramme?"Non-racing":"Training",weekFocus:setup.weekFocus||null,feedingMeasure:usesEggCups?`${eggCupsPerBird} egg cup${eggCupsPerBird===1?"":"s"} per bird · approximately ${eggCupGrams} g per cup`:"Calculated in grams per bird"}};
}
