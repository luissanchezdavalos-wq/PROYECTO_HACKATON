/** Rangos experimentales definidos por el equipo, NO umbrales agronómicos validados.
 * Pi7 uses strict mathematical equality 1 without rounding beforehand.
 */
export const RANGES = Object.freeze({
 pi1:{edges:[0.8,1.2],order:['Malo','Aceptable','Óptimo'],domain:[0,2]},
 pi2:{edges:[0.8,1],order:['Óptimo','Aceptable','Malo'],domain:[0,1.5]},
 pi3:{edges:[1,3],order:['Malo','Aceptable','Óptimo'],domain:[0,5]},
 pi4:{edges:[1,2],order:['Óptimo','Aceptable','Malo'],domain:[0,3]},
 pi5:{edges:[0.1,0.5],order:['Óptimo','Aceptable','Malo'],domain:[0,0.8]},
 pi6:{edges:[1,2],order:['Malo','Aceptable','Óptimo'],domain:[0,4]},
 pi7:{edges:[0.9,1.1],order:['Malo','Aceptable','Malo'],domain:[0.7,1.3]},
 pi8:{edges:[1,5],order:['Malo','Aceptable','Óptimo'],domain:[0,8]},
})
export function classifyIndicator(key,value){
 if(!RANGES[key] || typeof value!=='number' || !Number.isFinite(value)) return 'Sin datos'
 const {edges,order}=RANGES[key]
 if(key==='pi7')return value===1?'Óptimo':value<edges[0]||value>edges[1]?'Malo':'Aceptable'
 const [a,b]=edges
 if(key==='pi2'||key==='pi4'||key==='pi5')return value<a?order[0]:value<=b?order[1]:order[2]
 return value<a?order[0]:value<=b?order[1]:order[2]
}
export function rangePosition(key,value){
 const spec=RANGES[key];if(!spec||!Number.isFinite(value))return null
 const [lo,hi]=spec.domain
 return Math.max(0,Math.min(100,100*(value-lo)/(hi-lo)))
}
