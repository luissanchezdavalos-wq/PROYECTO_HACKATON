import test from 'node:test'
import assert from 'node:assert/strict'
import { buildModelInput,analyzeMissingInputs } from '../src/lib/advancedIndicators.js'
import { calculateIndicators } from '../src/lib/buckingham.js'
const live={source:'nasa-power',months:Array.from({length:12},(_,i)=>({month:i+1,avgPrecipMm:10}))}
const demo={...live,source:'demo'}
test('Real NASA precipitation is reused and never replaced by manual P',()=>{
 const result=buildModelInput(live,{P:{value:'999'},Zr:{value:'1',period:'annual'}})
 assert.equal(result.P.value,120)
 assert.equal(result.P.provenance,'estimated')
 assert.equal(result.Zr.value,1)
})
test('Demo climate never populates NASA measurements',()=>{
 assert.equal(buildModelInput(demo,{}).P,undefined)
})
test('Empty inputs stay missing rather than zero',()=>{
 const input=buildModelInput(live,{MOS:{value:''},FN:{value:'0'}})
 assert.equal(input.MOS,undefined)
 assert.equal(input.FN.value,0)
 assert.equal(calculateIndicators(input).pi6.status,'missing')
})
test('All eight model outputs are guarded by availability',()=>{
 const input=buildModelInput(null,{T:{value:'300'},Topt:{value:'300'}})
 const result=calculateIndicators(input)
 const gaps=analyzeMissingInputs(result,input)
 assert.equal(gaps.length,8)
 assert.equal(result.pi7.status,'ok')
 assert.equal(result.pi8.status,'missing')
 assert.deepEqual(gaps.find(g=>g.id==='pi8').missing,['B','FN','E','ET'])
})
