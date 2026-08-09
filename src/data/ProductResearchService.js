const OPEN_DATABASES = [
  { name: "Open Pet Food Facts", host: "world.openpetfoodfacts.org" },
  { name: "Open Food Facts", host: "world.openfoodfacts.org" },
  { name: "Open Products Facts", host: "world.openproductsfacts.org" },
];

function compact(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function nutritionalText(nutriments = {}) {
  const fields = [
    ["Protein", nutriments.proteins_100g, "%"],
    ["Fat", nutriments.fat_100g, "%"],
    ["Carbohydrate", nutriments.carbohydrates_100g, "%"],
    ["Fibre", nutriments.fiber_100g, "%"],
    ["Ash", nutriments.ash_100g, "%"],
    ["Moisture", nutriments.moisture_100g, "%"],
    ["Energy", nutriments["energy-kcal_100g"], " kcal/100g"],
  ];
  return fields
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([label, value, unit]) => `${label}: ${value}${unit}`)
    .join("\n");
}

function normaliseProduct(product, database) {
  if (!product) return null;
  const name = compact(product.product_name_en || product.product_name || product.generic_name_en || product.generic_name);
  if (!name) return null;
  const brand = compact(product.brands);
  const description = compact(product.generic_name_en || product.generic_name || product.categories);
  const image = product.image_front_url || product.image_url || product.image_front_small_url || "";
  return {
    externalId: `${database.host}:${product.code || name}`,
    name,
    manufacturer: brand,
    barcode: compact(product.code),
    description,
    ingredients: compact(product.ingredients_text_en || product.ingredients_text),
    nutritionalAnalysis: nutritionalText(product.nutriments),
    dosageAmount: compact(product.serving_quantity || ""),
    dosageUnit: product.serving_quantity ? "Grams" : "",
    dosageBasis: product.serving_quantity ? "Per serving" : "",
    displayPhoto: image,
    sourceType: database.name,
    sourceUrl: product.code ? `https://${database.host}/product/${encodeURIComponent(product.code)}` : `https://${database.host}`,
    verified: false,
    researchNote: "Community product database record — check dosage and instructions against the current manufacturer label.",
  };
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Online source returned ${response.status}.`);
  return response.json();
}

async function searchDatabase(database, query, barcode) {
  if (barcode) {
    const data = await fetchJson(`https://${database.host}/api/v2/product/${encodeURIComponent(barcode)}.json`);
    return data.status === 1 ? [normaliseProduct(data.product, database)].filter(Boolean) : [];
  }
  if (!query) return [];
  const url = new URL(`https://${database.host}/cgi/search.pl`);
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "8");
  const data = await fetchJson(url.toString());
  return (data.products || []).map((product) => normaliseProduct(product, database)).filter(Boolean);
}

async function searchConfiguredResearchService(request) {
  const endpoint = import.meta.env.VITE_PRODUCT_RESEARCH_API_URL;
  if (!endpoint) return [];
  const data = await fetchJson(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return Array.isArray(data?.candidates) ? data.candidates : [];
}

export async function researchProduct({ name, manufacturer, barcode }) {
  const query = compact(`${manufacturer || ""} ${name || ""}`);
  const request = { name: compact(name), manufacturer: compact(manufacturer), barcode: compact(barcode) };
  const lookups = [
    searchConfiguredResearchService(request),
    ...OPEN_DATABASES.map((database) => searchDatabase(database, query, request.barcode)),
  ];
  const settled = await Promise.allSettled(lookups);
  const candidates = settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const unique = new Map();
  candidates.forEach((candidate) => {
    const key = candidate.barcode || `${candidate.manufacturer}|${candidate.name}`.toLowerCase();
    if (!unique.has(key)) unique.set(key, candidate);
  });
  return [...unique.values()];
}

export function productResearchSearchUrl({ name, manufacturer, barcode }) {
  const query = barcode || `${manufacturer || ""} ${name || ""} official pigeon product dosage ingredients`;
  return `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;
}
