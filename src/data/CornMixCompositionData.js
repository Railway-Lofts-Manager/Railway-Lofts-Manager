const cornMixCompositionData = [
  {
    productKey:"versele-laga-gerry",
    productName:"Plus I.C.+ Gerry",
    accuracy:"Exact manufacturer percentages",
    ingredients:[
      ["Red maize",4],["Small cribs maize",27.5],["Mung beans",1],["White pigeon wheat",5],
      ["White dari",8],["Yellow dari",4],["Red dari",6],["Safflower",20],
      ["Pigeon barley",2],["Paddy rice",10],["Broken rice",2],["Peeled oats",2],
      ["Peeled barley",4],["Buckwheat",0.5],["Brown linseed",1],["Extruded Plus pellets",3],
    ],
    analysis:{protein:11,fat:8,fibre:7.5,carbohydrates:58},
    source:"https://www.versele.com/en/gb/plus/products/plus-gerry",
  },
  {
    productKey:"versele-laga-superstar",
    productName:"Plus I.C.+ Superstar",
    accuracy:"Exact manufacturer percentages",
    ingredients:[
      ["Red maize",10],["Premium cribs maize",15],["Small cribs maize",14],["Toasted soya beans",6],
      ["Maple peas",2],["Small green peas",2],["Tares",2],["Mung beans",2],
      ["White pigeon wheat",8],["White dari",9],["Safflower",8],["Paddy rice",5],
      ["Peeled oats",5],["Hempseed",2],["Black coleseed",1],["Red dari",1],
      ["Extruded Plus pellets",8],
    ],
    analysis:{protein:14.5,fat:7.5,fibre:5.5,carbohydrates:58},
    source:"https://www.versele.com/en/be/plus/products/plus-superstar",
  },
  {
    productKey:"johnston-jeff-all-rounder",
    productName:"All Rounder Pigeon Corn",
    accuracy:"Ingredient order only; percentages not supplied",
    ingredients:[
      ["Whole maize",null],["Maple peas",null],["Wheat",null],["Blue peas",null],
      ["Red dari",null],["Yellow peas",null],["Safflower seed",null],["White dari",null],
    ],
    analysis:null,
    source:"https://johnstonandjeff.co.uk/product/all-rounder-pigeon-corn/",
  },
  {
    productKey:"haiths-red-band-conditioner",
    productName:"Red Band Pigeon Conditioner",
    accuracy:"Ingredients and complete-mixture analysis known; ingredient percentages not supplied and recipe may vary",
    ingredients:[
      ["Wheat",null],["Sorghum",null],["Oats",null],["Rapeseed",null],["Barley",null],
      ["Buckwheat",null],["Soyabean meal",null],["Sunflower meal",null],["Vegetable oil",null],
      ["Safflower seed",null],["Linseed",null],["Balancer pellet",null],
    ],
    analysis:{protein:12.4,fat:10.04,fibre:4.9,starch:54.9,moisture:11.2,ash:3.6},
    source:"https://haiths.com/products/red-band-pigeon-conditioner-1",
  },
  {
    productKey:"beyers-pigeon-barley",
    productName:"Pigeon Barley",
    accuracy:"Single straight grain",
    ingredients:[["Pigeon barley",100]],
    analysis:{protein:10},
    source:"https://www.feedipedia.org/node/227",
  },
];

export function findCornMixComposition(product) {
  const key = product?.seedKey || product?.id;
  const name = String(product?.name || "").toLowerCase();
  return cornMixCompositionData.find((record) =>
    record.productKey === key || record.productName.toLowerCase() === name,
  ) || null;
}

export default cornMixCompositionData;
