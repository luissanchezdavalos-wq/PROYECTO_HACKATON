import test from 'node:test'
import assert from 'node:assert/strict'
import { daysInHorizon, normalizeRotationInputs, draftRotationStrategies, evaluateRotationStrategies } from '../src/lib/rotationPlanner.js'
const h={startYear:2026,startMonth:11,months:12}
const input={B:'2',FN:'80',E:'0.2',ET:'3'}
test('12 month horizon uses exact calendar day count',()=>{assert.equal(daysInHorizon(h),365);assert.equal(daysInHorizon({startYear:2023,startMonth:11,months:12}),366)})
test('Normalize nitrogen per ha and annual rates; ET daily to horizon total',()=>{
 const x=normalizeRotationInputs(input,h)
 assert.equal(x.status,'ok')
 assert.equal(x.converted.B,2)
 assert.equal(x.converted.FN,80/10000*(365/365.2425))
 assert.equal(x.converted.E,0.2*(365/365.2425))
 assert.equal(x.converted.ET,1095)
})
test('Missing data do not turn into zero, zero denominators remain undefined',()=>{
 assert.equal(normalizeRotationInputs({...input,FN:''},h).status,'missing')
 assert.equal(normalizeRotationInputs({...input,E:'-1'},h).status,'invalid')
 const entries=Object.fromEntries(['water','soil','balanced'].map(k=>[k,{...input,verified:true}]))
 assert.equal(evaluateRotationStrategies(entries,h).recommendationReady,true)
 assert.equal(evaluateRotationStrategies({...entries,water:{...input,E:'0',verified:true}},h).recommendationReady,false)
})
test('No automatic agricultural viability and no invented crops in thermally hostile seasons',()=>{
 const months=Array.from({length:12},(_,i)=>({month:i+1,meanTempC:55}))
 const proposals=draftRotationStrategies(months,1)
 assert.equal(proposals.length,3)
 assert.ok(proposals.every(r=>r.viable===false&&r.slots.every(slot=>slot.chosen===null)))
})

test('Partial temperature matches are explained without creating false crop recommendations',()=>{
 const months=Array.from({length:12},(_,i)=>({month:i+1,meanTempC:[15,15,40][i%3]}))
 const drafts=draftRotationStrategies(months,1)
 assert.ok(drafts.every(s=>s.slots[0].chosen===null))
 assert.ok(drafts.every(s=>s.slots[0].alternatives.some(a=>a.matchingMonths===2)))
})
test('Missing climate months are marked distinctly from no thermal matches',()=>{
 const months=Array.from({length:12},(_,i)=>({month:i+1,meanTempC:i===1?null:20}))
 const draft=draftRotationStrategies(months,1)[0]
 assert.equal(draft.slots[0].missingClimate,true)
 assert.equal(draft.slots[0].chosen,null)
})
