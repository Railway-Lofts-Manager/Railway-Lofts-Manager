import { findGrainsInText } from "./GrainNutritionData.js";
import { findCornMixComposition } from "./CornMixCompositionData.js";
import { analyseCornMixFromProduct } from "./CornMixAnalysisService.js";
export const PRODUCT_ANALYSIS_VERSION = 5;

const clean = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const unique = (values) => [...new Set(values.filter(Boolean))];

function fullText(product) {
  return clean([
    product.name,
    product.category,
    product.administration,
    product.description,
    product.primaryJob,
    product.feedingGuidance,
    product.waterInstructions,
    product.keyBenefits,
    product.ingredients,
    product.nutritionalAnalysis,
    product.frequency,
    product.warnings,
    ...(product.programmeStages || []),
    ...(product.historicalUses || []),
    ...(product.mixingRules || []).map((rule) => rule.context),
  ].join(" "));
}

function has(text, pattern) {
  return pattern.test(text);
}

function analyseRoles(product, text) {
  const roles = [];
  if (has(text, /barley|depurative|light feed|maintenance|weight control|fibre|fiber/)) roles.push("light-maintenance");
  if (has(text, /energy|race preparation|sports mix|superstar|carbohydrate|fat|oilseed|safflower/)) roles.push("race-energy");
  if (has(text, /conditioner|conditioning|red band|trapping reward|aniseed/)) roles.push("conditioner");
  if (has(text, /electrolyte|electrolit|rehydrat|fluid loss|mineral loss/)) roles.push("rehydration");
  if (has(text, /recovery|arrival|return from (the )?race|after flight/)) roles.push("recovery");
  if (has(text, /protein|amino acid|brewer s yeast|beer yeast/)) roles.push("protein-support");
  if (has(text, /digest|intestinal|gut flora|acidif|cider vinegar|organic acid/)) roles.push("digestive-support");
  if (has(text, /vitamin|b12|micronutrient/)) roles.push("vitamin-support");
  if (product.category === "Mineral / Grit" || has(text, /grit|redstone|calcium|mineral provision/)) roles.push("mineral-grit");
  if (has(text, /breeding|pairing|egg|rearing|youngster/)) roles.push("breeding-support");
  if (has(text, /moult|moult|feather/)) roles.push("moulting-support");
  if (product.category === "Medication / Treatment") roles.push("treatment");
  if (!roles.length && ["Corn / Feed Mix","Straight Grain"].includes(product.category)) roles.push("general-feed");
  return unique(roles);
}

function analyseTriggers(text) {
  const triggers = [];
  if (has(text, /actual race return|race return|return from (the )?race|immediately on return|on arrival/)) triggers.push("actual-race-return");
  if (has(text, /following day|day after (the )?race|next day/)) triggers.push("following-day-recovery");
  if (has(text, /before (and|or) on basketing|basketing day|before basket/)) triggers.push("pre-basketing");
  if (has(text, /after training|training return|after exercise/)) triggers.push("training-return");
  if (has(text, /daily|freely available|refresh daily/)) triggers.push("daily");
  if (has(text, /twice weekly|2 times weekly|2 3 times per week|weekly/)) triggers.push("routine-weekly");
  return unique(triggers);
}

function analyseRestrictions(product, text) {
  const restrictions = [];
  if (has(text, /do not leave (available )?all day|return only|actual race return only/)) restrictions.push("not-all-day");
  if (has(text, /do not combin|do not mix|no other water|one water additive/)) restrictions.push("do-not-combine");
  if (has(text, /not (a )?medicine|not (a )?treatment/)) restrictions.push("not-a-treatment");
  if (has(text, /not.*metal|plastic or glass/)) restrictions.push("non-metal-drinker");
  if (product.category === "Medication / Treatment") restrictions.push("health-module-only");
  if (product.verified === false) restrictions.push("unverified-directions");
  return unique(restrictions);
}

function feedRoles(roles) {
  const result = [];
  if (roles.includes("light-maintenance")) result.push("light");
  if (roles.includes("race-energy")) result.push("energy");
  if (roles.includes("conditioner")) result.push("conditioner");
  if (roles.includes("general-feed")) result.push("general");
  return result;
}

export function analyseProduct(product) {
  const text = fullText(product);
  const mixtureComposition = findCornMixComposition(product) || analyseCornMixFromProduct(product);
  const compositionText = mixtureComposition?.ingredients.map(([name]) => name).join(", ");
  const recognisedIngredients = findGrainsInText(compositionText || product.ingredients || product.description);
  const roles = analyseRoles(product,text);
  const triggers = analyseTriggers(text);
  const restrictions = analyseRestrictions(product,text);
  const missing = [];
  if (!product.administration) missing.push("administration method");
  if (!product.primaryJob && !product.description) missing.push("purpose");
  if (!(product.mixingRules || []).length && !product.dosageAmount) missing.push("dose");
  if (!(product.suitableFor || []).length) missing.push("suitable birds");
  if (!(product.programmeStages || []).length && !roles.includes("general-feed")) missing.push("programme stage");
  const eligible = product.category !== "Medication / Treatment" && product.verified !== false && !missing.includes("administration method");
  return {
    version: PRODUCT_ANALYSIS_VERSION,
    analysedAt: new Date().toISOString(),
    productType: product.category || "Other",
    administration: product.administration || "Unknown",
    roles,
    feedRoles: feedRoles(roles),
    suitableFor: [...(product.suitableFor || [])],
    stages: [...(product.programmeStages || [])],
    triggers,
    restrictions,
    recognisedIngredients: recognisedIngredients.map((ingredient) => ({
      id:ingredient.id,
      name:ingredient.name,
      family:ingredient.family,
      primaryContributions:ingredient.primaryContributions,
      plannerRoles:ingredient.plannerRoles,
      nutrientReference:ingredient.nutrientReference,
    })),
    mixtureComposition: mixtureComposition ? {
      accuracy:mixtureComposition.accuracy,
      ingredients:mixtureComposition.ingredients.map(([name,percentage]) => ({name,percentage})),
      analysis:mixtureComposition.analysis,
      source:mixtureComposition.source,
      totalPercentage:mixtureComposition.totalPercentage ?? null,
      exact:mixtureComposition.exact ?? mixtureComposition.accuracy.startsWith("Exact"),
      warnings:mixtureComposition.warnings || [],
    } : null,
    doseRules: (product.mixingRules || []).map((rule) => ({...rule})),
    frequency: product.frequency || "",
    waterProfile:["Water","Feed or water"].includes(product.administration) ? {
      purposes:roles,
      allowedEvents:triggers,
      restrictions,
      doseRules:(product.mixingRules || []).map((rule) => ({...rule})),
      verified:product.verified !== false,
      treatment:product.category === "Medication / Treatment",
      schedulingDecision:product.category === "Medication / Treatment"
        ? "Health module only"
        : product.verified === false && !(product.mixingRules || []).some((rule) => rule.userSupplied)
          ? "Review required before automatic use"
          : "Available when an analysed trigger matches",
    } : null,
    plannerEligible: eligible,
    confidence: missing.length ? "Review required" : "Ready",
    missingInformation: missing,
  };
}

export function productAnalysisNeedsRefresh(product) {
  return product.plannerAnalysis?.version !== PRODUCT_ANALYSIS_VERSION;
}

export function withProductAnalysis(product) {
  return {...product,plannerAnalysis:analyseProduct(product)};
}
