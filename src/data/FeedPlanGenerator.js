const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const productText = (p) => [p.name,p.description,p.primaryJob,p.ingredients,p.nutritionalAnalysis,p.keyBenefits,p.feedingGuidance,...(p.programmeStages || [])].join(" ").toLowerCase();
const score = (p, words) => words.reduce((n,w) => n + (productText(p).includes(w) ? 1 : 0),0);
const reason = (p) => {
  const value = productText(p), found = [];
  if (/maize|carbohydrate|energy|fat|safflower|oilseed|l-carnitine/.test(value)) found.push("recorded energy-rich grains, carbohydrates or fats");
  if (/protein|amino|pea|bean|soya|yeast/.test(value)) found.push("recorded protein or amino-acid contribution");
  if (/barley|fibre|fiber|maintenance|weight control|light feeding/.test(value)) found.push("recorded lighter-maintenance or fibre role");
  return found.join(" and ") || p.primaryJob || "its recorded Product Library purpose";
};
const distance = (band) => band === "Long distance" ? {days:4,multiplier:1.18,label:"Long-distance energy build"} : band === "Middle distance" ? {days:3,multiplier:1.10,label:"Middle-distance energy build"} : band === "Short distance" ? {days:2,multiplier:1.03,label:"Short-distance preparation"} : {days:3,multiplier:1.08,label:"Distance-adjusted preparation"};
const dose = (p) => p.mixingRules?.length ? `${p.mixingRules[0].amount} ${p.mixingRules[0].unit} per ${p.mixingRules[0].basisAmount} ${p.mixingRules[0].basisUnit}` : [p.dosageAmount,p.dosageUnit,p.dosageBasis].filter(Boolean).join(" · ") || "Use verified label directions";

export function generateFeedPlan(setup, allProducts) {
  const selectedProducts = setup.feedProductIds.map((id) => allProducts.find((p) => p.id === id)).filter(Boolean);
  const selectedMinerals = selectedProducts.filter((p) => p.category === "Mineral / Grit" || p.administration === "Separate");
  const libraryMinerals = allProducts.filter((p) => !p.archived && p.inStock !== false && (p.category === "Mineral / Grit" || p.administration === "Separate"));
  const mineral = selectedMinerals[0] || libraryMinerals.find((p) => p.verified) || libraryMinerals[0];
  const feeds = selectedProducts.filter((p) => p.id !== mineral?.id && p.category !== "Mineral / Grit" && p.administration !== "Separate");
  const waters = setup.waterProductIds.map((id) => allProducts.find((p) => p.id === id)).filter(Boolean);
  const lightWords = ["barley","light feeding","maintenance","weight control","fibre","fiber"];
  const energyWords = ["energy","maize","fat","safflower","oilseed","carbohydrate","race preparation"];
  const light = [...feeds].sort((a,b) => score(b,lightWords)-score(a,lightWords))[0];
  const energy = [...feeds].sort((a,b) => score(b,energyWords)-score(a,energyWords))[0];
  const recovery = [...waters].sort((a,b) => score(b,["electrolyte","rehydration","replace water","mineral losses","recovery"]) - score(a,["electrolyte","rehydration","replace water","mineral losses","recovery"]))
    .find((p) => p.programmeStages?.includes("Recovery") || score(p,["recovery","electrolyte","rehydration"]) > 0);
  const preparation = waters.find((p) => p.programmeStages?.includes("Race preparation") && p.id !== recovery?.id);
  const acidifier = waters.find((p) => /cider vinegar|apple cider|\bacv\b|acidif/.test(productText(p)));
  const warnings = [];
  if (!feeds.length) warnings.push("No feed product was selected.");
  if (!mineral) warnings.push("No mineral or grit product is available. Add one to the Product Library so the plan can include daily mineral provision.");
  else if (!selectedMinerals.length) warnings.push(`${mineral.name} has been added from the Product Library as the available mineral/grit provision.`);
  if (feeds.length && light === energy) warnings.push("Only one clear feed role was found. Add both a lighter product and an energy-rich race product for better progression.");
  [...feeds,...waters].filter((p) => !p.verified).forEach((p) => warnings.push(`${p.name} is not verified; check its instructions before use.`));
  waters.filter((p) => p.category === "Medication / Treatment").forEach((p) => warnings.push(`${p.name} is a treatment and has not been automatically scheduled.`));
  const raceIndex = Math.max(0,DAYS.indexOf(setup.raceDay));
  const settings = distance(setup.distanceBand), birds = Number(setup.birdCount) || 1;
  const usesEggCups = setup.feedMeasure === "Egg cups" || setup.feedingMethod === "Individual egg cups" || !setup.feedMeasure;
  const visitsPerDay = setup.visits === "Twice daily" ? 2 : 1;
  const eggCupsPerBird = Number(setup.eggCupsPerBird) || 1;
  const eggCupGrams = Number(setup.eggCupGrams) || 32.5;
  const adjustEggCups = setup.portionStrategy !== "Keep egg-cup quantity fixed";
  const cupsPerDay = setup.measureBasis === "Per bird at each feed" ? eggCupsPerBird * visitsPerDay : eggCupsPerBird;
  const base = usesEggCups ? cupsPerDay : 30;
  const acidifierDays = acidifier ? DAYS.filter((day,index) => {
    const before = (raceIndex-index+7)%7;
    return [6,5,4].includes(before) && !(setup.trainingDays || []).includes(day);
  }).slice(0,2) : [];
  const schedule = DAYS.map((day,index) => {
    const before = (raceIndex-index+7)%7;
    let phase="Controlled maintenance", energyPercent=20, grams=usesEggCups && !adjustEggCups ? base : base*.9;
    if (before===0) { phase="Race and return recovery"; energyPercent=100; grams=base; }
    else if (before===1) { phase="Final fuel and basketing"; energyPercent=85; grams=usesEggCups && !adjustEggCups ? base : base*settings.multiplier; }
    else if (before<=settings.days) { phase=settings.label; energyPercent=45+(settings.days-before+1)*10; grams=usesEggCups && !adjustEggCups ? base : base*(1+(settings.days-before+1)*.025); }
    else if (before===6) { phase="Recovery and reset"; energyPercent=25; grams=usesEggCups && !adjustEggCups ? base : base*.92; }
    const total=usesEggCups ? Math.round(birds*grams*10)/10 : Math.round(birds*grams), lightPercent=Math.max(0,100-energyPercent), mix=[];
    if (light && energy && light.id!==energy.id) {
      if (lightPercent) mix.push({productId:light.id,name:light.name,percent:lightPercent,amount:Math.round(total*lightPercent)/100,perBirdAmount:Math.round(grams*lightPercent)/100,why:reason(light)});
      mix.push({productId:energy.id,name:energy.name,percent:energyPercent,amount:Math.round(total*energyPercent)/100,perBirdAmount:Math.round(grams*energyPercent)/100,why:reason(energy)});
    } else if (energy || light) { const p=energy||light; mix.push({productId:p.id,name:p.name,percent:100,amount:total,perBirdAmount:Math.round(grams*10)/10,why:reason(p)}); }
    let water={name:"Fresh clear water",instructions:"No additive scheduled",why:"Provides clear-water time and avoids unnecessary combinations."};
    const isTrainingDay = (setup.trainingDays || []).includes(day);
    if (before===0 && recovery) water={name:recovery.name,instructions:`On return from the race only: ${dose(recovery)}`,why:"Replaces fluid and electrolyte losses after racing."};
    else if (isTrainingDay && recovery) water={name:recovery.name,instructions:`After training only: ${dose(recovery)}`,why:"Post-training rehydration and electrolyte replacement."};
    else if (before===1 && preparation) water={name:preparation.name,instructions:dose(preparation),why:preparation.primaryJob||"Recorded race preparation support"};
    else if (acidifierDays.includes(day)) water={name:acidifier.name,instructions:`Maintenance day: ${dose(acidifier)}`,why:acidifier.primaryJob||"Recorded digestion and drinking-water acidification support"};
    const sessions = usesEggCups && visitsPerDay === 2 ? [{name:"Morning feed",amount:Math.round(total*5)/10},{name:"Evening feed",amount:Math.round(total*5)/10}] : [{name:setup.visits === "Evening only" ? "Evening feed" : "Daily feed",amount:total}];
    const estimatedGrams = usesEggCups ? { perBird:Math.round(grams*eggCupGrams), total:Math.round(total*eggCupGrams), lowTotal:Math.round(total*30), highTotal:Math.round(total*35) } : null;
    const minerals = mineral ? { productId:mineral.id, name:mineral.name, instructions:mineral.feedingGuidance || mineral.frequency || "Provide separately and refresh regularly.", why:mineral.primaryJob || "Daily mineral and grit support", verified:mineral.verified } : null;
    return {day,phase,amountPerBird:Math.round(grams*10)/10,totalAmount:total,measureUnit:usesEggCups ? "egg cup" : "g",estimatedGrams,sessions,feed:mix,water,minerals};
  });
  return {generatedAt:new Date().toISOString(),schedule,warnings,analysis:{lightProduct:light?.name||"Not identified",energyProduct:energy?.name||"Not identified",mineralProduct:mineral?.name||"Not available",buildDays:settings.days,feedingMeasure:usesEggCups ? `${eggCupsPerBird} egg cup${eggCupsPerBird === 1 ? "" : "s"} per bird · approximately ${eggCupGrams} g per cup` : "Calculated in grams per bird"}};
}
