const DAY_INDEX = {Sunday:0,Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6};

function dose(product, event) {
  const rules = product.mixingRules || product.plannerAnalysis?.doseRules || [];
  const patterns = {
    "race-return":/return|arrival|recovery/i,
    "following-day":/following day|arrival/i,
    "pre-basketing":/before|basketing/i,
    "training-return":/training|exercise|toss|return/i,
    routine:/routine|weekly|general|young birds|breeding/i,
  };
  const rule = rules.find((item) => patterns[event]?.test(String(item.context || ""))) || rules[0];
  if (rule) return `${rule.amount} ${rule.unit} per ${rule.basisAmount} ${rule.basisUnit}`;
  return [product.dosageAmount,product.dosageUnit,product.dosageBasis].filter(Boolean).join(" · ") || "Use the verified product directions";
}

function candidateEvent(product, context) {
  const profile = product.plannerAnalysis;
  const triggers = profile?.triggers || [];
  const roles = profile?.roles || [];
  if (context.isRacingProgramme && context.before === 0 && triggers.includes("actual-race-return")) {
    return {event:"race-return",score:100+(roles.includes("rehydration") ? 20 : 0),why:"Matches the product’s analysed actual-race-return trigger."};
  }
  if (context.isRacingProgramme && context.before === 6 && triggers.includes("following-day-recovery")) {
    return {event:"following-day",score:85,why:"Matches the product’s analysed following-day recovery directions."};
  }
  if (context.isRacingProgramme && context.before === 1 && triggers.includes("pre-basketing")) {
    return {event:"pre-basketing",score:80,why:"Matches the product’s analysed pre-basketing directions."};
  }
  if (context.isTrainingDay && ["Hard training","Long training toss"].includes(context.trainingIntensity)
    && triggers.includes("training-return")) {
    return {event:"training-return",score:75,why:"Matches a recorded hard-training return use."};
  }
  if (triggers.includes("daily")) {
    return {event:"routine",score:30,why:"The analysed directions permit daily routine use."};
  }
  if (triggers.includes("routine-weekly") || roles.includes("digestive-support")) {
    const routineDay = [1,4].includes(DAY_INDEX[context.day]);
    if (routineDay) return {event:"routine",score:25,why:"Matches the product’s analysed routine weekly purpose."};
  }
  return null;
}

function eventInstructions(product, event) {
  const amount = dose(product,event);
  const restrictions = product.plannerAnalysis?.restrictions || [];
  const prefix = {
    "race-return":"Race return only",
    "following-day":"Following-day recovery",
    "pre-basketing":"Basketing period only",
    "training-return":"On return from hard training only",
    routine:"Routine water period",
  }[event];
  const ending = restrictions.includes("not-all-day")
    ? " Give for the recorded recovery period, then replace with fresh clear water. Do not leave available all day."
    : "";
  return `${prefix}: ${amount}.${ending}`;
}

export function selectWaterSupplement(products, context) {
  const eligible = products.filter((product) => {
    if (product.category === "Medication / Treatment") return false;
    if (!["Water","Feed or water"].includes(product.administration)) return false;
    const hasUserRule = product.mixingRules?.some((rule) => rule.userSupplied);
    return product.verified !== false || hasUserRule;
  });
  const candidates = eligible.map((product) => {
    const match = candidateEvent(product,context);
    return match ? {product,...match} : null;
  }).filter(Boolean).sort((a,b) => b.score-a.score);
  if (!candidates.length) {
    return {productId:null,name:"Fresh clear water",instructions:"No additive scheduled",why:"No selected water product had analysed directions matching this exact workload and time."};
  }
  const selected = candidates[0];
  return {
    productId:selected.product.id,
    name:selected.product.name,
    instructions:eventInstructions(selected.product,selected.event),
    why:selected.why,
    event:selected.event,
  };
}
