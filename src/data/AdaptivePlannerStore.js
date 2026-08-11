const STORAGE_KEY="loftCommanderAdaptivePlanners";
const LEGACY_KEY="loftCommanderAdaptivePlanner";
function readAll(){try{const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");return value&&typeof value==="object"?value:{};}catch{return {};}}
export function loadAdaptivePlanner(teamId){const saved=readAll()[teamId];if(saved)return saved;try{const legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||"null");if(legacy&&legacy.teamId===teamId)return legacy;}catch{}return null;}
export function saveAdaptivePlanner(teamId,settings){const saved={...settings,teamId,updatedAt:new Date().toISOString()},all=readAll();all[teamId]=saved;localStorage.setItem(STORAGE_KEY,JSON.stringify(all));return saved;}
export function getAdaptivePlannerSummaries(){return readAll();}
