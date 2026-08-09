const SECTION_LABELS = {
  ingredients: ["ingredients", "composition", "contains"],
  nutritionalAnalysis: ["analytical constituents", "nutritional analysis", "analysis", "typical values", "nutrition"],
  dosage: ["dosage", "directions for use", "directions", "feeding instructions", "feeding guide", "recommended use", "how to use", "use"],
  warnings: ["warnings", "warning", "caution", "precautions", "important information"],
  storageInstructions: ["storage instructions", "storage", "store"],
  description: ["product description", "description", "about this product", "overview"],
  feedingGuidance: ["feeding guidelines", "feeding guidance", "feeding recommendations", "when to use"],
  waterInstructions: ["water", "drinking water", "water instructions"],
  keyBenefits: ["key benefits", "benefits", "features"],
};

const ALL_LABELS = Object.values(SECTION_LABELS).flat();

function clean(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isHeading(line, labels) {
  const normalised = line.toLowerCase().replace(/^[-*•]\s*/, "").replace(/[():\-–—]+$/g, "").trim();
  return labels.some((label) => normalised === label || normalised.startsWith(`${label}:`) || normalised.startsWith(`${label} (`));
}

function inlineHeadingValue(line, labels) {
  const prepared = line.replace(/^[-*•]\s*/, "").trim();
  const lower = prepared.toLowerCase();
  for (const label of labels) {
    if (lower.startsWith(`${label}:`)) return prepared.slice(label.length + 1).trim();
    if (lower.startsWith(`${label} -`)) return prepared.slice(label.length + 2).trim();
  }
  return "";
}

function extractSection(lines, labels) {
  for (let index = 0; index < lines.length; index += 1) {
    const inline = inlineHeadingValue(lines[index], labels);
    if (inline) return inline;
    if (!isHeading(lines[index], labels)) continue;
    const gathered = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const line = lines[cursor].trim();
      if (!line) {
        if (gathered.length) break;
        continue;
      }
      if (isHeading(line, ALL_LABELS)) break;
      gathered.push(line);
      if (gathered.join(" ").length > 1400) break;
    }
    if (gathered.length) return gathered.join("\n");
  }
  return "";
}

function labelledValue(lines, labels) {
  for (const line of lines) {
    const value = inlineHeadingValue(line, labels);
    if (value) return value;
  }
  return "";
}

function usefulOpeningParagraph(text) {
  const paragraphs = text.split(/\n\s*\n/).map(clean).filter(Boolean);
  return paragraphs.find((paragraph) =>
    paragraph.length >= 55 &&
    !/cookie|privacy|delivery|shipping|basket|sign in|newsletter|copyright/i.test(paragraph),
  ) || "";
}

function removeCitations(value) {
  return clean(value)
    .replace(/\[\[?\d+\]?\([^)]*\)(?:,?\s*\[\d+\]\([^)]*\))*\]?/g, "")
    .replace(/\[\d+\]\([^)]*\)/g, "")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

function extractSourceUrls(rawText, suppliedUrl) {
  const urls = [];
  if (suppliedUrl) urls.push(suppliedUrl);
  for (const match of rawText.matchAll(/https?:\/\/[^\s)\]]+/g)) {
    urls.push(match[0].replace(/[.,;]+$/, ""));
  }
  return [...new Set(urls)];
}

function inferIdentity(text, lines) {
  let name = labelledValue(lines, ["product name", "name", "title"]);
  let manufacturer = labelledValue(lines, ["manufacturer", "brand", "made by"]);
  if (!name) {
    const first = lines[0] || "";
    const match = first.match(/^(.{3,100}?)\s+(?:is|are)\s+(?:an?|the)\s+/i);
    if (match) name = match[1].trim();
  }
  if (!manufacturer && name) {
    const knownBrand = name.match(/^(Versele[- ]Laga|Harkers?|Beyers|Vanrobaeys|Matador|Countrywide|Gem|Johnston\s*&\s*Jeff|Natural|Rohnfried)\b/i);
    if (knownBrand) manufacturer = knownBrand[1].replace(" ", "-");
  }
  return { name, manufacturer };
}

function dosageSentence(text) {
  const sentences = text.split(/(?<=[.!?])\s+|\n/).map(clean).filter(Boolean);
  return sentences.find((sentence) =>
    /\b(dose|dosage|serve|give|administer|feed|per litre|per liter|per kg|teaspoon|tablespoon|ml|grams?)\b/i.test(sentence) &&
    /(\d\s*(?:ml|millilit|litre|liter|kg|kilogram|g\b|gram|tsp|teaspoon|tbsp|tablespoon|scoop|day|time)|per\s+(?:bird|pair|litre|liter|kg|kilogram))/i.test(sentence),
  ) || "";
}

function functionalBenefits(text) {
  const sentences = text.split(/(?<=[.!?])\s+|\n/).map(clean).filter(Boolean);
  return sentences.filter((sentence) =>
    /contains?|provides?|supports?|functional|vitamin|mineral|amino acid|prebiotic|probiotic|glucosamine|chondroitin/i.test(sentence) &&
    !/^ingredients?\b/i.test(sentence) &&
    !/clean,? fresh (?:drinking )?water/i.test(sentence),
  ).slice(0, 4).join("\n");
}

function parseAmount(dosage) {
  const match = dosage.match(/(\d+(?:\.\d+)?(?:\s*[-–]\s*\d+(?:\.\d+)?)?)\s*(ml|millilit(?:re|er)s?|l|lit(?:re|er)s?|kg|kilograms?|g|grams?|tsp|teaspoons?|tbsp|tablespoons?|fluid ounces?|fl\.?\s*oz|egg cups?|scoops?)/i);
  if (!match) return {};
  const unitText = match[2].toLowerCase();
  let dosageUnit = "Other";
  if (/^ml|millilit/.test(unitText)) dosageUnit = "Millilitres";
  else if (/^l$|^lit/.test(unitText)) dosageUnit = "Litres";
  else if (/^kg|kilogram/.test(unitText)) dosageUnit = "Kilograms";
  else if (/^g$|gram/.test(unitText)) dosageUnit = "Grams";
  else if (/^tsp|teaspoon/.test(unitText)) dosageUnit = "Teaspoon";
  else if (/^tbsp|tablespoon/.test(unitText)) dosageUnit = "Tablespoon";
  else if (/fluid|fl/.test(unitText)) dosageUnit = "Fluid ounces";
  else if (/egg/.test(unitText)) dosageUnit = "Egg cup";
  else if (/scoop/.test(unitText)) dosageUnit = "Scoops";
  let dosageBasis = "Manufacturer instructions";
  if (/per\s+(?:1\s*)?(?:litre|liter|l\b)/i.test(dosage)) dosageBasis = "Per litre of water";
  else if (/per\s+(?:1\s*)?(?:kilogram|kg)\b/i.test(dosage)) dosageBasis = "Per kilogram of feed";
  else if (/per\s+bird/i.test(dosage)) dosageBasis = "Per bird";
  else if (/per\s+pair/i.test(dosage)) dosageBasis = "Per pair";
  return { dosageAmount: match[1].replace(/\s/g, ""), dosageUnit, dosageBasis };
}

function inferPrimaryJob(text) {
  const rules = [
    ["Low-protein maintenance and weight control", /low[- ]protein|maintenance feed|prevent weight gain|off[- ]season/i],
    ["Race energy and endurance", /energy|endurance|stamina|long distance|race mix/i],
    ["Recovery support", /recovery|recover|recuperation|after racing/i],
    ["Protein and muscle support", /protein|muscle|amino acid/i],
    ["Weight control and lighter feeding", /light mix|depurative|weight control|reduce weight|strip.*fat/i],
    ["Breeding and youngster development", /breeding|rearing|youngster|growth|egg production/i],
    ["Moulting support", /moult|molt|feather/i],
    ["Digestive support", /digest|gut|probiotic|intestinal/i],
    ["Hydration and electrolyte support", /electrolyte|hydration|rehydrat/i],
    ["Vitamin and mineral support", /vitamin|mineral|trace element/i],
  ];
  return rules.find(([, pattern]) => pattern.test(text))?.[0] || "";
}

function inferAdministration(text) {
  const water = /per litre|per liter|add(?:ed)? to (?:the )?(?:drinking )?water|mix(?:ed)? (?:in|with) (?:the )?water|administer(?:ed)? (?:in|through) (?:the )?(?:drinking )?water/i.test(text);
  const feed = /on (?:the )?feed|over (?:the )?food|per kg|per kilogram|feed mix|corn mix|maintenance feed|mixture for pigeons|includes grains|\bfeed\s+\d/i.test(text);
  if (water && feed) return "Feed or water";
  if (water) return "Water";
  if (feed) return "Feed";
  return "";
}

function inferredLists(text) {
  const suitableFor = [];
  if (/racing pigeon|race bird|racing bird|racing mix|widowhood|roundabout/i.test(text)) suitableFor.push("Racing cocks", "Racing hens");
  if (/young bird|youngster|weanling/i.test(text)) suitableFor.push("Young birds");
  if (/stock bird|breeder|breeding pair/i.test(text)) suitableFor.push("Stock birds", "Breeding pairs");
  const programmeStages = [];
  [["Race preparation", /race|competition|basketing/i], ["Recovery", /recovery|after racing/i], ["Training", /training/i], ["Breeding", /breeding|rearing/i], ["Moulting", /moult|molt/i], ["Winter", /winter|off[- ]season/i], ["Rest", /rest period|maintenance|off[- ]season/i]].forEach(([stage, pattern]) => { if (pattern.test(text)) programmeStages.push(stage); });
  return { suitableFor: [...new Set(suitableFor)], programmeStages };
}

export function parseProductText(rawText, sourceUrl = "") {
  const text = clean(rawText);
  const lines = text.split("\n").map(clean).filter(Boolean);
  const dosage = extractSection(lines, SECTION_LABELS.dosage) || dosageSentence(text);
  const inferred = inferredLists(text);
  const identity = inferIdentity(text, lines);
  const sourceUrls = extractSourceUrls(rawText, sourceUrl);
  const barcodeMatch = text.match(/\b(\d{13})\b/);
  const feedingGuidance = extractSection(lines, SECTION_LABELS.feedingGuidance);
  const waterInstructions = labelledValue(lines, SECTION_LABELS.waterInstructions) || extractSection(lines, SECTION_LABELS.waterInstructions);
  return {
    ...identity,
    barcode: labelledValue(lines, ["barcode", "ean", "upc"]) || barcodeMatch?.[1] || "",
    description: removeCitations(extractSection(lines, SECTION_LABELS.description) || usefulOpeningParagraph(text)),
    primaryJob: inferPrimaryJob(text),
    ingredients: removeCitations(extractSection(lines, SECTION_LABELS.ingredients)),
    nutritionalAnalysis: removeCitations(extractSection(lines, SECTION_LABELS.nutritionalAnalysis)),
    feedingGuidance: removeCitations(feedingGuidance),
    waterInstructions: removeCitations(waterInstructions),
    keyBenefits: removeCitations(extractSection(lines, SECTION_LABELS.keyBenefits) || functionalBenefits(text)),
    warnings: removeCitations(extractSection(lines, SECTION_LABELS.warnings)),
    storageInstructions: removeCitations(extractSection(lines, SECTION_LABELS.storageInstructions)),
    administration: inferAdministration(text),
    frequency: dosage || feedingGuidance || "",
    ...parseAmount(dosage),
    ...inferred,
    sourceType: sourceUrls.length ? "Other online source" : "Pasted product information",
    sourceUrl: sourceUrls[0] || "",
    sourceUrls,
    verified: false,
    pastedSourceText: text,
  };
}
