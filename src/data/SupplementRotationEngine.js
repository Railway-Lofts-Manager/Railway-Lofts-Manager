const text=(product)=>`${product.name||""} ${product.primaryJob||""} ${product.description||""}`.toLowerCase();
const ruleText=(rule)=>`${rule.context||""}`.toLowerCase();
function dose(product,patterns){const rules=product.mixingRules||[];const rule=rules.find((item)=>patterns.some((pattern)=>pattern.test(ruleText(item))))||rules[0];if(!rule)return "Use the saved verified directions";return `${rule.amount} ${rule.unit} per ${rule.basisAmount} ${rule.basisUnit}`;}
function eligible(product,administrations){return product.inStock!==false&&!product.archived&&product.category!=="Medication / Treatment"&&administrations.includes(product.administration)&&(product.verified!==false||(product.mixingRules||[]).some((rule)=>rule.userSupplied));}
function find(products,pattern,administrations){return products.find((product)=>eligible(product,administrations)&&pattern.test(text(product)));}

export function buildSupplementRotation(products,context){
  const {before,isRaceDay,isRaceReturn,isHardTraining,dayIndex,hasRace,customFocus}=context;
  const electrolyte=find(products,/electroly|rehydrat/,["Water","Feed or water"]);
  const wonder=find(products,/wonder pigeon|intestinal.condition|organic.acid/,["Water","Feed or water"]);
  const vinegar=find(products,/vinegar|acidif/,["Water","Feed or water"]);
  const b12=find(products,/b.?12|vitamin k/,["Water","Feed or water"]);
  const yeast=find(products,/brewer.?s yeast|amino.acid.*b.vitamin/,["Feed","Feed or water"]);
  let water={name:"Fresh clear water",instructions:"No additive scheduled",why:"A clear-water day prevents unnecessary stacking of supplements."};
  if(customFocus==="moult"&&[1,4].includes(dayIndex)&&wonder)water={productId:wonder.id,name:wonder.name,instructions:dose(wonder,[/moult/]),why:"Its analysed directions specifically include moulting support."};
  else if(isRaceReturn&&electrolyte)water={productId:electrolyte.id,name:electrolyte.name,instructions:`${dose(electrolyte,[/actual race return|return|arrival/])}. Give on race return for the recovery period, then replace with fresh water.`,why:"Replaces fluid and electrolyte losses after the actual race."};
  else if(hasRace&&before===1&&wonder)water={productId:wonder.id,name:wonder.name,instructions:dose(wonder,[/before|basketing/]),why:"Its analysed directions match the pre-basketing stage."};
  else if(!isRaceDay&&!isHardTraining&&(dayIndex===1||(!hasRace&&dayIndex===3))&&vinegar)water={productId:vinegar.id,name:vinegar.name,instructions:`${dose(vinegar,[/general fancier|weekly/])}. Use plastic or glass drinkers; do not combine with medicines, vaccines or probiotics.`,why:"A spaced routine digestive-support day, kept away from race-return and basketing products."};
  else if(hasRace&&before>=2&&before<=3&&b12)water={productId:b12.id,name:b12.name,instructions:dose(b12,[/historical|young.bird/]),why:"The saved user-supplied routine matches race preparation; no pigeon-specific dose has been invented."};
  else if(isHardTraining&&wonder)water={productId:wonder.id,name:wonder.name,instructions:dose(wonder,[/arrival|young birds/]),why:"A demanding training day matches its recorded recovery/intestinal-support use."};
  const feed=[];
  if(yeast&&customFocus==="moult"&&[2,5].includes(dayIndex))feed.push({productId:yeast.id,name:yeast.name,instructions:`Moisten the corn and apply ${dose(yeast,[/label rate/])}.`,why:"Twice-weekly amino-acid, protein and B-vitamin support for feather production."});
  else if(yeast&&isRaceReturn)feed.push({productId:yeast.id,name:yeast.name,instructions:`Moisten the corn and apply ${dose(yeast,[/label rate|return|following day/])}.`,why:"Protein, amino-acid and B-vitamin support after the recorded race."});
  else if(yeast&&isHardTraining&&before>1)feed.push({productId:yeast.id,name:yeast.name,instructions:`Moisten the corn and apply ${dose(yeast,[/label rate/])}.`,why:"Recovery support after the recorded demanding training workload."});
  else if(yeast&&!hasRace&&dayIndex===2)feed.push({productId:yeast.id,name:yeast.name,instructions:`Moisten the corn and apply ${dose(yeast,[/label rate/])}.`,why:"A single maintenance support day without duplicating other feed supplements."});
  return {water,feed};
}
