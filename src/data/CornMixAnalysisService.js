import { findGrainsInText } from "./GrainNutritionData.js";

const number = (value) => value == null ? null : Number(value);

function parsePart(part) {
  const value = String(part || "").replace(/^composition\s*:?\s*/i,"").trim();
  if (!value) return null;
  let match = value.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*%\s*(?:\(.*)?$/);
  if (match) return {name:match[1].trim(),percentage:number(match[2])};
  match = value.match(/^(\d+(?:\.\d+)?)\s*%\s+(.+)$/);
  if (match) return {name:match[2].trim(),percentage:number(match[1])};
  return {name:value.replace(/\s*\(.*$/,"").trim(),percentage:null};
}

function ingredientParts(value) {
  const text = String(value || "").trim();
  if (!text) return [];
  const separator = /[;\n]/.test(text) ? /[;\n]+/ : /,+/;
  return text.split(separator).map(parsePart).filter((part) => part?.name);
}

function readAnalysisValue(text, names) {
  for (const name of names) {
    const match = text.match(new RegExp(`${name}\\s*:?\\s*(\\d+(?:\\.\\d+)?)\\s*%`,"i"));
    if (match) return Number(match[1]);
  }
  return null;
}

export function parseProductNutritionalAnalysis(value) {
  const text = String(value || "");
  const analysis = {
    protein:readAnalysisValue(text,["crude protein","protein"]),
    fat:readAnalysisValue(text,["crude fat","total oil","fat","oil"]),
    fibre:readAnalysisValue(text,["crude fibre","crude fiber","fibre","fiber"]),
    carbohydrates:readAnalysisValue(text,["carbohydrates","carbohydrate"]),
    starch:readAnalysisValue(text,["starch"]),
    ash:readAnalysisValue(text,["crude ash","ash"]),
    moisture:readAnalysisValue(text,["moisture"]),
  };
  return Object.values(analysis).some((value) => value != null) ? analysis : null;
}

export function analyseCornMixFromProduct(product) {
  if (!["Corn / Feed Mix","Straight Grain"].includes(product.category)) return null;
  const ingredients = ingredientParts(product.ingredients);
  if (!ingredients.length) return null;
  const percentages = ingredients.filter((ingredient) => ingredient.percentage != null);
  const totalPercentage = percentages.reduce((sum,ingredient) => sum+ingredient.percentage,0);
  const allPercentagesKnown = percentages.length === ingredients.length;
  const recognised = ingredients.map((ingredient) => ({
    ...ingredient,
    grainIds:findGrainsInText(ingredient.name).map((grain) => grain.id),
  }));
  const warnings = [];
  if (!allPercentagesKnown) warnings.push("One or more ingredient percentages were not supplied.");
  if (percentages.length && (totalPercentage < 99.5 || totalPercentage > 100.5)) {
    warnings.push(`Recorded percentages total ${Math.round(totalPercentage*10)/10}%, not 100%.`);
  }
  if (recognised.some((ingredient) => !ingredient.grainIds.length)) {
    warnings.push("One or more ingredients are not yet in the grain-and-seed reference library.");
  }
  const exact = allPercentagesKnown && totalPercentage >= 99.5 && totalPercentage <= 100.5;
  return {
    accuracy:exact ? "Exact saved percentages totalling 100%" : percentages.length ? "Partial saved percentage breakdown" : "Ingredient order only; percentages not supplied",
    ingredients:recognised.map(({name,percentage}) => [name,percentage]),
    analysis:parseProductNutritionalAnalysis(product.nutritionalAnalysis),
    source:product.sourceUrl || product.sourceUrls?.[0] || "Product Library entry",
    totalPercentage:percentages.length ? Math.round(totalPercentage*10)/10 : null,
    exact,
    warnings,
  };
}
