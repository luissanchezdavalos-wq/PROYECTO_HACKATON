/**
 * Crop Insights V6: prototype temperature-screening rules, NOT validated FAO
 * Ecocrop species records. Source for methodology, not for these numbers:
 * https://www.fao.org/geospatial/data-and-tools/data-portals/ecocrop/en
 * Explicit uncertainty: rainfall/irrigation, soils, frost, cultivar, stage are
 * NOT assessed here; never infer an overall crop suitability percentage.
 */
export const CROP_PROFILES=Object.freeze([
 {id:'citrus',name:'Cítricos',category:'frutas',tempMin:15,tempMax:32},
 {id:'strawberry',name:'Fresa',category:'frutas',tempMin:10,tempMax:25},
 {id:'grape',name:'Vid',category:'frutas',tempMin:12,tempMax:30},
 {id:'lettuce',name:'Lechuga',category:'vegetales',tempMin:8,tempMax:24},
 {id:'carrot',name:'Zanahoria',category:'vegetales',tempMin:10,tempMax:26},
 {id:'tomato',name:'Tomate',category:'vegetales',tempMin:16,tempMax:30},
 {id:'wheat',name:'Trigo',category:'granos',tempMin:10,tempMax:25},
 {id:'maize',name:'Maíz',category:'granos',tempMin:18,tempMax:32},
 {id:'sorghum',name:'Sorgo',category:'granos',tempMin:20,tempMax:35},
])
export const CATEGORIES=[{id:'frutas',label:'Frutas',color:'#E7AF38'},{id:'vegetales',label:'Vegetales',color:'#648B38'},{id:'granos',label:'Granos',color:'#A7C85B'}]
export function evaluateMonth(month, profiles=CROP_PROFILES){
 if(!month||!Number.isFinite(month.meanTempC)||!Number.isFinite(month.avgPrecipMm))return null
 return CATEGORIES.map(category=>{
  const items=profiles.filter(p=>p.category===category.id)
  const evaluated=items.map(item=>({...item,temperatureCompatible:month.meanTempC>=item.tempMin&&month.meanTempC<=item.tempMax}))
  return {...category,items:evaluated,compatibleCount:evaluated.filter(x=>x.temperatureCompatible).length,total:evaluated.length,month:month.month,meanTempC:month.meanTempC,avgPrecipMm:month.avgPrecipMm}
 })
}
export function evaluateYear(months){
 if(!Array.isArray(months))return []
 return months.map(month=>({month:month.month,categories:evaluateMonth(month)}))
}
