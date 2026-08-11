import { buildNutritionShares } from "./MixNutritionEngine.js";
import { buildSupplementRotation } from "./SupplementRotationEngine.js";
import { interpretCustomRequest } from "./CustomPlanInterpreter.js";
import { selectMineralProvision } from "./MineralProvisionEngine.js";
const DAY_NAMES=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const iso=(date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
const atNoon=(value)=>new Date(`${value}T12:00:00`);
function addDays(date,days){const copy=new Date(date);copy.setDate(copy.getDate()+days);return copy;}
function allocate(shares,total){const values=shares.map((item)=>({...item,exact:total*item.percent/100,cups:Math.floor(total*item.percent/100)}));let left=total-values.reduce((sum,item)=>sum+item.cups,0);[...values].sort((a,b)=>(b.exact-b.cups)-(a.exact-a.cups)).forEach((item)=>{if(left>0){item.cups++;left--;}});return values.filter((item)=>item.cups).map((item)=>({productId:item.product.id,name:item.product.name,cups:item.cups,percent:item.percent}));}
function settingsFor(miles){return {days:miles>=200?4:miles>=100?3:2};}
function workload(activity){if(!activity)return 0;const effort={Easy:.8,Normal:1,Hard:1.3}[activity.effort]||1;if(activity.activityType==="Road training")return Math.min(10,(Number(activity.distanceMiles)||0)/5*effort);if(activity.activityType==="Loft exercise")return Math.min(10,(Number(activity.durationMinutes)||0)/15*effort);if(activity.activityType==="Race")return 10;return 0;}
export function generateAdaptiveWeek(settings,products,activities=[]){
  const custom=interpretCustomRequest(settings.customRequest);
  const race=settings.hasRace?{racePoint:settings.racePoint||"Race",miles:Number(settings.raceDistance)||0,raceDate:settings.raceDate}:null;
  const breeding=settings.team==="Breeding pairs",pairCount=Math.max(1,Number(settings.pairCount)||Math.ceil((Number(settings.birdCount)||2)/2)),adultBirdCount=breeding?pairCount*2:Math.max(1,Number(settings.birdCount)||1);
  const youngCount=breeding&&settings.breedingStage==="Feeding youngsters"?Math.max(0,Number(settings.youngBirdCount)||0):0,ageAllowance={"0–7 days":.25,"8–14 days":.5,"15 days to weaning":.75}[settings.youngBirdAge]||0;
  const youngSupportCups=Math.round(youngCount*ageAllowance),totalFeedCups=adultBirdCount+youngSupportCups;
  const anchor=race?.raceDate?atNoon(race.raceDate):atNoon(settings.weekEnding);const start=addDays(anchor,-6),birdCount=adultBirdCount;
  const allowed=new Set(settings.productIds||products.map((item)=>item.id));const available=products.filter((item)=>allowed.has(item.id)&&item.inStock!==false&&!item.archived);
  const feeds=available.filter((item)=>["Corn / Feed Mix","Straight Grain"].includes(item.category));const supplements=available.filter((item)=>["Supplement","Drink Additive"].includes(item.category));const mineralProducts=available.filter((item)=>item.category==="Mineral / Grit");
  const days=Array.from({length:7},(_,index)=>{const date=addDays(start,index),dateString=iso(date),before=race?6-index:9,activity=activities.find((item)=>item.date===dateString),level=workload(activity),noWork=["Rest day","Training cancelled","No exercise","Bad weather"].includes(activity?.activityType),build=settingsFor(race?.miles||0);let weekFocus=race?"Race week":"Lighter maintenance week";
    if((noWork||activity?.birdCondition==="Heavy")&&(!race||before>build.days))weekFocus="Recovery and reset week";else if(level>=5&&(!race||before>1))weekFocus="Pre-race conditioning week";
    const programmeId=settings.teamId==="custom"?"custom":settings.team==="Breeding pairs"?"breeding-pairs":settings.team==="Stock birds"?"stock-birds":"adaptive-race-team";
    const shares=buildNutritionShares(feeds,{isRacingProgramme:Boolean(race),isNonRacingProgramme:["Stock birds","Breeding pairs"].includes(settings.team),programmeId,before,settings:build,weekFocus,breedingStage:settings.breedingStage,youngBirdAge:settings.youngBirdAge,customFocus:custom.focus});
    const extras=buildSupplementRotation(supplements,{before,isRaceDay:Boolean(race)&&before===0,isRaceReturn:Boolean(race)&&before===0&&activity?.activityType==="Race",isHardTraining:level>=5,dayIndex:date.getDay(),hasRace:Boolean(race),customFocus:settings.teamId==="custom"?custom.focus:null});
    const minerals=selectMineralProvision(mineralProducts,{isBreeding:breeding,feedingYoungsters:breeding&&settings.breedingStage==="Feeding youngsters",isMoulting:custom.focus==="moult",pairCount,birdCount:adultBirdCount,mineralTeaspoonsPerEggCup:settings.mineralTeaspoonsPerEggCup});
    const conditionNote=activity?`${activity.activityType}${level?` · workload ${level.toFixed(1)}/10`:""}${activity.birdCondition?` · ${activity.birdCondition}`:""}`:"No actual activity recorded — planned demand used";
    return {date:dateString,day:DAY_NAMES[date.getDay()],before,phase:shares[0]?.goal||"Maintenance",feed:allocate(shares,totalFeedCups),feedSupplements:extras.feed,minerals,water:extras.water,activity,conditionNote};
  });
  return {generatedAt:new Date().toISOString(),birdCount,adultBirdCount,pairCount,youngCount,youngSupportCups,totalFeedCups,race,custom,weekStart:iso(start),weekEnd:iso(anchor),days,warnings:[feeds.length?null:"No analysed corn mixes or straight grains are available.",mineralProducts.length?null:"No mineral or grit product is selected for this team.",race&&!race.raceDate?"Enter the race date so the build can be timed correctly.":null,breeding&&settings.breedingStage==="Feeding youngsters"&&!youngCount?"Enter how many youngsters the pairs are feeding.":null,settings.teamId==="custom"?custom.warning:null].filter(Boolean)};
}
