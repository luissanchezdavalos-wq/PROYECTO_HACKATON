import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyIndicator, rangePosition } from '../src/lib/indicatorThresholds.js'
import { evaluateMonth, evaluateYear } from '../src/lib/cropInsights.js'
import { buildModelInput } from '../src/lib/advancedIndicators.js'

test('Experimental thresholds apply to all eight indicators at boundaries', () => {
  const cases=[
    ['pi1',0.79,'Malo'],['pi1',0.8,'Aceptable'],['pi1',1.2,'Aceptable'],['pi1',1.21,'Óptimo'],
    ['pi2',0.79,'Óptimo'],['pi2',0.8,'Aceptable'],['pi2',1,'Aceptable'],['pi2',1.01,'Malo'],
    ['pi3',0.9,'Malo'],['pi3',1,'Aceptable'],['pi3',3,'Aceptable'],['pi3',3.1,'Óptimo'],
    ['pi4',0.9,'Óptimo'],['pi4',1,'Aceptable'],['pi4',2,'Aceptable'],['pi4',2.1,'Malo'],
    ['pi5',0.09,'Óptimo'],['pi5',0.1,'Aceptable'],['pi5',0.5,'Aceptable'],['pi5',0.51,'Malo'],
    ['pi6',0.9,'Malo'],['pi6',1,'Aceptable'],['pi6',2,'Aceptable'],['pi6',2.1,'Óptimo'],
    ['pi8',0.9,'Malo'],['pi8',1,'Aceptable'],['pi8',5,'Aceptable'],['pi8',5.1,'Óptimo'],
  ]
  for(const [key,value,status] of cases)assert.equal(classifyIndicator(key,value),status,`${key}: ${value}`)
})
test('Pi7 exactly 1 is optimal, never a rounded 1', () => {
  assert.equal(classifyIndicator('pi7',1),'Óptimo')
  assert.equal(classifyIndicator('pi7',1.0000001),'Aceptable')
  assert.equal(classifyIndicator('pi7',0.9),'Aceptable')
  assert.equal(classifyIndicator('pi7',1.1),'Aceptable')
  assert.equal(classifyIndicator('pi7',0.899),'Malo')
  assert.equal(classifyIndicator('pi7',1.101),'Malo')
})
test('Missing indicators and gauge bounds are handled',()=>{
 assert.equal(classifyIndicator('pi1',null),'Sin datos')
 assert.equal(classifyIndicator('pi1',NaN),'Sin datos')
 assert.equal(rangePosition('pi1',-100),0)
 assert.equal(rangePosition('pi1',1e4),100)
})
test('Crop Insights monthly temperature screening is deterministic and count based',()=>{
 const rows=evaluateMonth({month:1,meanTempC:20,avgPrecipMm:12})
 assert.equal(rows.length,3)
 assert.equal(rows.reduce((n,r)=>n+r.total,0),9)
 assert.ok(rows.every(r=>r.compatibleCount<=r.total))
 assert.equal(evaluateYear([{month:1,meanTempC:20,avgPrecipMm:12}]).length,1)
 assert.equal(evaluateMonth({month:1,meanTempC:NaN,avgPrecipMm:12}),null)
})
test('Manual invalid inputs cannot become mathematical variables',()=>{
 for(const invalid of ['-1','abc','1e3','1,2','1.2.3','.']){
   assert.equal(buildModelInput(null,{MOS:{value:invalid}}).MOS,undefined,invalid)
 }
 assert.equal(buildModelInput(null,{MOS:{value:'0.75'}}).MOS.value,0.75)
})
