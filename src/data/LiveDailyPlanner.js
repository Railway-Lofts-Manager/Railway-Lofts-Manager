import { buildNutritionShares } from "./MixNutritionEngine.js";
import { selectWaterSupplement } from "./WaterSupplementEngine.js";
const DAY_NAMES=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const dateValue=(value)=>new Date(`${value}T12:00:00`);
const daysBetween=(from,to)=>Math.max(0,Math.round((dateValue(to)-dateValue(from))/86400000));
function allocateCups(shares,total) { const result=shares.map((item)=>({...item,exact:total*item.percent/100,cups:Math.floor(total*item.percent/100)})); let left=total-result.reduce((sum,item)=>sum+item.cups,0); [...result].sort((a,b)=>(b.exact-b.cups)-(a.exact-a.cups)).forEach((item)=>{if(left>0){item.cups+=1;left-=1;}}); return result.filter((item)=>item.cups>0).map((item)=>({productId:item.product.id,name:item.product.name,cups:item.cups,percent:item.percent})); }
function workloadLevel(input) { const effort={Easy:.8,Normal:1,Hard:1.3}[input.effort]||1; if(input.activityType==="Road training")return Math.min(10,(Number(input.distanceMiles)||0)/5*effort); if(input.activityType==="Loft exercise")return Math.min(10,(Number(input.durationMinutes)||0)/15*effort); if(input.activityType==="Race")return Math.min(10,(Number(input.distanceMiles)||0)/25*effort); return 0; }
export function buildLiveDailyPlan({plan,week,products,input,recentWorkloads=[]}) {
  const day=DAY_NAMES[dateValue(input.date).getDay()];
  const race=input.weekendRace==="race"?{racePoint:input.racePoint||"Race",miles:Number(input.raceDistance)||0,raceDate:input.raceDate}:null;
  const daysToRace=race?.raceDate?daysBetween(input.date,race.raceDate):null,level=workloadLevel(input),noWork=["Rest day","Training cancelled","No exercise","Bad weather"].includes(input.activityType);
  const weeklyLoad=recentWorkloads.reduce((sum,item)=>sum+workloadLevel(item),0)+level,selectedIds=new Set(plan.feedProductIds||[]);
  const feedProducts=products.filter((product)=>selectedIds.has(product.id)&&["Corn / Feed Mix","Straight Grain"].includes(product.category));
  const longRace=race&&race.miles>=200,settings={days:longRace?4:race?.miles>=100?3:2}; let before=9,weekFocus=race?"Race week":"Lighter maintenance week";
  if(race&&daysToRace!=null)before=daysToRace; if((noWork||input.birdCondition==="Heavy")&&(!race||daysToRace>settings.days))weekFocus="Recovery and reset week"; if((level>=5||input.birdCondition==="Light")&&(!race||daysToRace>1))weekFocus="Pre-race conditioning week";
  const shares=buildNutritionShares(feedProducts,{isRacingProgramme:Boolean(race),isNonRacingProgramme:false,programmeId:plan.programmeId,before,settings,weekFocus});
  const birdCount=Math.max(1,Number(input.birdCount)||Number(plan.birdCount)||1),mixture=allocateCups(shares,birdCount),waterIds=new Set(plan.waterProductIds||[]);
  const water=selectWaterSupplement(products.filter((product)=>waterIds.has(product.id)),{day,before,isRacingProgramme:input.activityType==="Race"&&before===0,isTrainingDay:level>=5,trainingIntensity:level>=7?"Long training toss":level>=5?"Hard training":"Normal exercise"});
  const target=race?`${race.racePoint}, ${race.miles} miles in ${daysToRace} day${daysToRace===1?"":"s"}`:"No weekend race — fitness maintenance";
  let reason=noWork?`${input.activityType} reduced today’s energy demand. The mix is kept lighter while still maintaining the birds.`:level>=5?"Today’s recorded work was demanding, so the mix supports replacement and controlled race preparation.":"Today’s workload was moderate, so the mix keeps the team on its planned build without overfeeding.";
  if(input.birdCondition==="Heavy")reason+=" The birds were marked heavy, so energy loading is held back unless the race is close."; if(input.birdCondition==="Tired")reason+=" Tired birds need recovery and observation; feed must not be used to hide a health problem."; if(input.birdCondition==="Light")reason+=" The birds were marked light, so controlled condition-building is favoured.";
  if(race)reason+=longRace?" The longer target progressively increases fat-rich distance fuel near basketing.":" The target favours readily available carbohydrate energy near basketing."; else reason+=" With no race selected, the planner does not apply a race-fuelling build."; if(weeklyLoad>=18)reason+=" The recorded seven-day workload is already high, so further loading should be judged against body condition.";
  return {day,target,daysToRace,workloadLevel:level,weeklyLoad,birdCount,mixture,water,reason,goal:shares[0]?.goal||"Maintenance",sourceWeek:week?.startDate};
}
