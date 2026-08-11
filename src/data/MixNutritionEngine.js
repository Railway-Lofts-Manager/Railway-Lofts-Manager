import { findGrainsInText } from "./GrainNutritionData.js";

const clamp = (value) => Math.max(0,Math.min(1,Number(value) || 0));

function ingredientTraits(product) {
  const composition = product.plannerAnalysis?.mixtureComposition;
  const ingredients = composition?.ingredients || [];
  const weighted = ingredients.map((ingredient) => ({
    grains:findGrainsInText(ingredient.name),
    weight:ingredient.percentage == null ? 1/Math.max(1,ingredients.length) : ingredient.percentage/100,
  }));
  const trait = (roles) => weighted.reduce((total,item) =>
    total+item.weight*(item.grains.some((grain) => grain.plannerRoles.some((role) => roles.includes(role))) ? 1 : 0),0);
  return {
    cerealEnergy:trait(["carbohydrate-energy","race-fuel"]),
    fatEnergy:trait(["fat-energy","distance-fuel","conditioning"]),
    proteinBuilding:trait(["protein-building","recovery-building","breeding-support"]),
    light:trait(["light-maintenance"]),
  };
}

export function nutritionProfile(product) {
  const composition = product.plannerAnalysis?.mixtureComposition;
  const analysis = composition?.analysis || {};
  const ingredients = ingredientTraits(product);
  const feedRoles = product.plannerAnalysis?.feedRoles || [];
  return {
    carbohydrate:clamp((analysis.carbohydrates ?? analysis.starch ?? 45)/70),
    fat:clamp((analysis.fat ?? 5)/12),
    protein:clamp((analysis.protein ?? 11)/22),
    fibre:clamp((analysis.fibre ?? 5)/12),
    cerealEnergy:clamp(ingredients.cerealEnergy),
    fatEnergy:clamp(ingredients.fatEnergy),
    proteinBuilding:clamp(ingredients.proteinBuilding),
    light:clamp(Math.max(ingredients.light,feedRoles.includes("light") ? 1 : 0)),
    conditioner:feedRoles.includes("conditioner") ? 1 : 0,
    general:feedRoles.includes("general") ? 1 : 0.25,
    analysed:Boolean(composition || product.plannerAnalysis),
  };
}

export function nutritionGoal({isRacingProgramme,isNonRacingProgramme,programmeId,before,settings,weekFocus,breedingStage,youngBirdAge,customFocus}) {
  if (programmeId === "custom") {
    if (customFocus === "moult") return {name:"Moult and feather support",weights:{protein:.31,proteinBuilding:.28,fatEnergy:.13,fat:.10,general:.12,carbohydrate:.06}};
    if (customFocus === "build-condition") return {name:"Controlled condition building",weights:{carbohydrate:.25,cerealEnergy:.20,fatEnergy:.18,protein:.17,proteinBuilding:.12,general:.08}};
    if (customFocus === "weight-control") return {name:"Weight control",weights:{light:.39,fibre:.22,protein:.15,general:.14,carbohydrate:.10}};
    if (customFocus === "recovery") return {name:"Recovery and rebuilding",weights:{protein:.27,proteinBuilding:.25,carbohydrate:.20,cerealEnergy:.12,light:.08,general:.08}};
    if (customFocus === "digestive") return {name:"Controlled digestive support",weights:{light:.30,general:.25,fibre:.16,protein:.12,carbohydrate:.12,cerealEnergy:.05}};
    return {name:"Custom maintenance",weights:{general:.34,light:.30,protein:.14,carbohydrate:.12,fibre:.10}};
  }
  if (isNonRacingProgramme && programmeId === "breeding-pairs") {
    if (breedingStage === "Feeding youngsters") {
      const olderYoungsters = youngBirdAge === "15 days to weaning";
      return {name:olderYoungsters ? "Feeding growing youngsters" : "Crop-milk and youngster support",weights:olderYoungsters
        ? {protein:.30,proteinBuilding:.28,carbohydrate:.20,cerealEnergy:.10,fat:.07,general:.05}
        : {protein:.36,proteinBuilding:.32,carbohydrate:.14,fat:.08,general:.10}};
    }
    if (breedingStage === "Sitting eggs") return {name:"Sitting-pair maintenance",weights:{general:.31,light:.23,protein:.18,proteinBuilding:.13,carbohydrate:.10,fibre:.05}};
    if (breedingStage === "Pairing and laying") return {name:"Pairing and egg preparation",weights:{protein:.30,proteinBuilding:.27,carbohydrate:.17,fat:.10,general:.16}};
    return {name:"Breeding and rearing",weights:{protein:.34,proteinBuilding:.30,carbohydrate:.14,fat:.08,general:.14}};
  }
  if (isNonRacingProgramme) {
    return {name:"Stock-bird maintenance",weights:{general:.35,light:.30,carbohydrate:.15,protein:.10,fibre:.10}};
  }
  if (!isRacingProgramme) {
    if (weekFocus === "Recovery and reset week") return {name:"Recovery week",weights:{light:.32,protein:.22,proteinBuilding:.18,carbohydrate:.13,general:.15}};
    if (weekFocus === "Pre-race conditioning week") return {name:"Condition building",weights:{carbohydrate:.30,cerealEnergy:.22,fatEnergy:.18,conditioner:.15,protein:.10,general:.05}};
    return {name:"Training maintenance",weights:{general:.30,light:.22,carbohydrate:.20,cerealEnergy:.15,protein:.13}};
  }
  if (before === 0) {
    return {name:"Race-return recovery",weights:{carbohydrate:.25,protein:.25,proteinBuilding:.24,cerealEnergy:.14,general:.12}};
  }
  if (before === 6) {
    return {name:"Post-race reset",weights:{light:.38,protein:.18,proteinBuilding:.16,carbohydrate:.12,general:.16}};
  }
  if (before === 1) {
    const longRace = settings.days >= 4;
    return {name:"Final race fuel",weights:longRace
      ? {fatEnergy:.32,carbohydrate:.25,cerealEnergy:.18,conditioner:.15,general:.10}
      : {carbohydrate:.34,cerealEnergy:.28,fatEnergy:.14,conditioner:.12,general:.12}};
  }
  if (before <= settings.days) {
    const progress = (settings.days-before+1)/settings.days;
    return {name:"Progressive race build",weights:{
      carbohydrate:.28,
      cerealEnergy:.22,
      fatEnergy:.10+.16*progress,
      conditioner:.05+.10*progress,
      protein:.15-.05*progress,
      general:.20-.05*progress,
    }};
  }
  return {name:"Controlled maintenance",weights:{general:.34,light:.28,carbohydrate:.18,cerealEnergy:.10,protein:.10}};
}

export function buildNutritionShares(products, context) {
  if (!products.length) return [];
  const goal = nutritionGoal(context);
  const scored = products.map((product) => {
    const profile = nutritionProfile(product);
    const score = Object.entries(goal.weights).reduce((total,[trait,weight]) => total+(profile[trait] || 0)*weight,0);
    return {product,profile,score:Math.max(.02,score)};
  });
  const totalScore = scored.reduce((sum,item) => sum+item.score,0);
  const raw = scored.map((item) => ({...item,exactPercent:item.score/totalScore*100}));
  const shares = raw.map((item) => ({...item,percent:Math.max(1,Math.round(item.exactPercent))}));
  let difference = 100-shares.reduce((sum,item) => sum+item.percent,0);
  while (difference !== 0) {
    const candidates = [...shares].filter((item) => difference > 0 || item.percent > 1)
      .sort((a,b) => difference > 0 ? (b.exactPercent-b.percent)-(a.exactPercent-a.percent) : (b.percent-b.exactPercent)-(a.percent-a.exactPercent));
    if (!candidates.length) break;
    const target = shares.find((item) => item.product.id === candidates[0].product.id);
    target.percent += difference > 0 ? 1 : -1;
    difference += difference > 0 ? -1 : 1;
  }
  return shares.map(({product,percent,profile}) => ({product,percent,profile,goal:goal.name}));
}
