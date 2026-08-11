const STORAGE_KEY = "loftCommanderDailyWorkloads";
function readAll() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } }
export function getDailyWorkload(planId,date) { return readAll().find((item) => item.planId === planId && item.date === date) || null; }
export function saveDailyWorkload(entry) { const entries=readAll().filter((item) => !(item.planId === entry.planId && item.date === entry.date)); const saved={...entry,updatedAt:new Date().toISOString()}; localStorage.setItem(STORAGE_KEY,JSON.stringify([...entries,saved])); return saved; }
export function getRecentWorkloads(planId,beforeDate,days=7) { const end=new Date(`${beforeDate}T12:00:00`),start=new Date(end); start.setDate(start.getDate()-days); return readAll().filter((item) => item.planId === planId && new Date(`${item.date}T12:00:00`) >= start && new Date(`${item.date}T12:00:00`) < end); }
