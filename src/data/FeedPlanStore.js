const STORAGE_KEY = "loftCommanderFeedPlans";

function readPlans() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

let plans = readPlans();
const listeners = new Set();

function publish() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  listeners.forEach((listener) => listener([...plans]));
}

function createId() {
  return globalThis.crypto?.randomUUID?.() || `feed-plan-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const feedPlanStore = {
  getPlans() { return [...plans]; },
  savePlan(plan) {
    const now = new Date().toISOString();
    const saved = { ...plan, id: plan.id || createId(), version: plan.version || 1, createdAt: plan.createdAt || now, updatedAt: now };
    const index = plans.findIndex((item) => item.id === saved.id);
    plans = index >= 0 ? plans.map((item) => item.id === saved.id ? saved : item) : [saved, ...plans];
    publish();
    return saved;
  },
  deletePlan(id) { plans = plans.filter((plan) => plan.id !== id); publish(); },
  subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
};

export { STORAGE_KEY as FEED_PLAN_STORAGE_KEY };
export default feedPlanStore;
