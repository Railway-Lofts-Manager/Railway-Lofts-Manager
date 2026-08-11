import { FEED_GENERATOR_VERSION, generateFeedPlan } from "./FeedPlanGenerator.js";

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function validDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth()+1).padStart(2,"0");
  const day = String(date.getDate()).padStart(2,"0");
  return `${year}-${month}-${day}`;
}

function sundayOf(date) {
  const value = new Date(date);
  value.setDate(value.getDate()-value.getDay());
  value.setHours(12,0,0,0);
  return value;
}

function addDays(date, days) {
  const value = new Date(date);
  value.setDate(value.getDate()+days);
  return value;
}

function distanceBand(miles) {
  const distance = Number(miles) || 0;
  if (distance >= 200) return "Long distance";
  if (distance >= 100) return "Middle distance";
  return "Short distance";
}

function focusForWeek(index, previousRace, nextRace) {
  if (previousRace) return "Recovery and reset week";
  if (nextRace && nextRace.daysAway <= 13) return "Pre-race conditioning week";
  return index % 3 === 0 ? "Lighter maintenance week" : index % 3 === 1 ? "Training and fitness week" : "Condition-building week";
}

export function generateRollingFeedPlan(setup, products, races) {
  const datedRaces = (races || []).map((race) => ({...race,date:validDate(race.raceDate)})).filter((race) => race.date && race.status !== "Cancelled").sort((a,b) => a.date-b.date);
  const start = sundayOf(validDate(setup.planStartDate) || new Date());
  let weekCount = Number(setup.planWeeks) || 4;
  if (setup.planWeeks === "Full race programme" && datedRaces.length) {
    const finalRace = datedRaces[datedRaces.length-1].date;
    weekCount = Math.min(52,Math.max(1,Math.ceil((finalRace-start)/(7*86400000))+1));
  }
  const weeks = Array.from({length:weekCount},(_,index) => {
    const weekStart = addDays(start,index*7), weekEnd = addDays(weekStart,6);
    const race = datedRaces.find((item) => item.date >= weekStart && item.date <= weekEnd);
    const previousRace = datedRaces.find((item) => item.date >= addDays(weekStart,-7) && item.date < weekStart);
    const nextRaceItem = datedRaces.find((item) => item.date > weekEnd);
    const nextRace = nextRaceItem ? {race:nextRaceItem,daysAway:Math.round((nextRaceItem.date-weekEnd)/86400000)} : null;
    const focus = race ? "Race week" : focusForWeek(index,previousRace,nextRace);
    const weekSetup = race ? {...setup,weekFocus:focus,raceDay:DAY_NAMES[race.date.getDay()],distanceBand:distanceBand(race.miles)} : {...setup,weekFocus:focus,raceDay:"Not applicable",distanceBand:"No race adjustment"};
    const plan = generateFeedPlan(weekSetup,products);
    return {
      id:`${isoDate(weekStart)}-${race?.id || index}`,
      weekNumber:index+1,
      startDate:isoDate(weekStart),
      endDate:isoDate(weekEnd),
      focus,
      race:race ? {id:race.id,racePoint:race.racePoint,miles:race.miles,yards:race.yards,raceDate:race.raceDate,distanceBand:weekSetup.distanceBand} : null,
      plan,
    };
  });
  return {generatorVersion:FEED_GENERATOR_VERSION,generatedAt:new Date().toISOString(),mode:"Rolling race programme",linkedRaceCount:weeks.filter((week) => week.race).length,weeks};
}
