function productScore(product,context){
  const text=`${product.name||""} ${product.primaryJob||""} ${product.description||""} ${(product.programmeStages||[]).join(" ")}`.toLowerCase();
  let score=product.category==="Mineral / Grit"?50:0;
  if(/mineral|grit|calcium|phosphorus|redstone|coral/.test(text))score+=30;
  if(context.isBreeding&&/breeding|calcium|egg/.test(text))score+=20;
  if(context.isMoulting&&/moult|feather|mineral/.test(text))score+=10;
  return score;
}

function eggCupLabel(value){
  const quarters=Math.max(1,Math.round(Number(value)*4)),whole=Math.floor(quarters/4),fraction=["","¼","½","¾"][quarters%4];
  if(!whole)return `${fraction} egg cup`;
  if(fraction)return `${whole}${fraction} egg cup${quarters>4?"s":""}`;
  return `${whole} full egg cup${whole===1?"":"s"}`;
}

export function selectMineralProvision(products,context){
  const candidates=products.filter((product)=>product.inStock!==false&&!product.archived&&product.category==="Mineral / Grit"&&["Separate","Feed","Feed or water"].includes(product.administration)).sort((a,b)=>productScore(b,context)-productScore(a,context));
  const product=candidates[0];
  if(!product)return {name:"No mineral / grit product selected",instructions:"Add a mineral or grit product to the Product Library and select it for this team.",why:"The planner will not invent a mineral product or dose."};
  if(context.isBreeding){const rule=(product.mixingRules||[]).find((item)=>/breeding pair/i.test(`${item.context||""} ${item.basisUnit||""}`)),spoonsPerCup=Math.max(1,Number(context.mineralTeaspoonsPerEggCup)||8);if(!rule)return {productId:product.id,name:product.name,instructions:"Use the saved breeding-pair directions; an egg-cup conversion cannot be calculated until a measured dose is recorded.",why:"The planner will not invent a mineral dose."};const totalTeaspoons=(Number(rule.amount)||0)*(Number(context.pairCount)||1)/Math.max(1,Number(rule.basisAmount)||1),eggCups=totalTeaspoons/spoonsPerCup;return {productId:product.id,name:product.name,eggCups,instructions:`Measure ${eggCupLabel(eggCups)} for all ${context.pairCount} pairs and provide fresh daily.`,why:context.feedingYoungsters?"Breeding parents feeding youngsters have continuing mineral, grit and calcium demands.":"Supports the mineral and grit requirements of breeding pairs."};}
  const hopperCups=Math.max(1,Math.ceil((Number(context.birdCount)||1)/20));
  return {productId:product.id,name:product.name,eggCups:hopperCups,instructions:`Place ${eggCupLabel(hopperCups)} in the separate mineral hopper, keep available and replace with a clean fresh portion daily. This is the amount offered, not an amount each bird must consume.`,why:context.isMoulting?"Supports feather formation and normal mineral intake during the moult.":"Provides the separate minerals and grinding grit that the grain mixture does not reliably supply."};
}
