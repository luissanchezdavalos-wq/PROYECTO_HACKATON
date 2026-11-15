import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateIndicators, calculateRotationPi8, compareRotationPi8 } from '../src/lib/buckingham.js'
import { DAYS_PER_YEAR, convertVariable } from '../src/lib/variableRegistry.js'
const r = (value, unit, provenance='farmer') => ({value, unit, provenance})
const base = {
 theta:r(0.3,'m3/m3'), Zr:r(1,'m'), P:r(600,'mm'),
 ET:r(2,'mm/day'), tc:r(100,'day'), B:r(2,'kg/m2'),
 MOS:r(4,'kg/m2'), Gw:r(200,'mm'), E:r(0.3652425,'kg/m2/year'),
 FN:r(365.2425,'kgN/ha/year'), T:r(300,'K'), Topt:r(300,'K'),
}
test('Calculates eight original team formulas with documented conversions', () => {
 const got=calculateIndicators(base)
 assert.equal(Object.keys(got).length,8)
 assert.equal(got.pi1.value, 0.5)
 assert.equal(got.pi2.value, 1/3)
 assert.equal(got.pi3.value,0.5)
 assert.equal(got.pi4.value,1/3)
 assert.ok(Math.abs(got.pi5.value-0.025)<1e-10)
 assert.ok(Math.abs(got.pi6.value-0.0025)<1e-10)
 assert.equal(got.pi7.value,1)
 assert.ok(Math.abs(got.pi8.value-(2*365.2425/(0.3652425*2)))<1e-10)
})
test('Missing is not zero; zero denominator is undefined', () => {
 assert.equal(calculateIndicators({...base,P:null}).pi1.status,'missing')
 assert.equal(calculateIndicators({...base,P:r(0,'mm')}).pi2.status,'undefined')
 assert.equal(calculateIndicators({...base,FN:r(0,'kgN/ha/year')}).pi8.value,0)
 assert.equal(calculateIndicators({...base,E:r(0,'kg/m2/year')}).pi8.status,'undefined')
})
test('Rejects incompatible unit and temperature', () => {
 assert.equal(calculateIndicators({...base,P:r(12,'m')}).pi1.status,'invalid')
 assert.equal(calculateIndicators({...base,T:r(-1,'K')}).pi7.status,'invalid')
 assert.equal(convertVariable(1000,'mm','m'),1)
 assert.ok(Math.abs(convertVariable(DAYS_PER_YEAR,'day','year')-1)<1e-12)
})
const horizon={startYear:2026,startMonth:11,months:12}
const metrics=(B,FN,E,ET,h=horizon)=>({B:r(B,'kg/m2'),FN:r(FN,'kgN/m2'),E:r(E,'kg/m2'),ET:r(ET,'mm'),horizon:h})
test('Horizon Pi8, ranking and agronomic exclusion',()=>{
 const result=compareRotationPi8([
  {id:'A',viable:true,metrics:metrics(2,0.04,0.1,400)},
  {id:'B',viable:true,metrics:metrics(2,0.08,0.1,400)},
  {id:'C',viable:false,metrics:metrics(2,0.9,0.1,400)},
 ])
 assert.equal(result.status,'ok')
 assert.equal(result.recommendationReady,true)
 assert.deepEqual(result.ranked.map(r=>r.id),['B','A'])
 assert.equal(result.results[2].status,'excluded')
})
test('Refuses to rank strategies with mismatched horizons',()=>{
 const result=compareRotationPi8([
  {id:'A',viable:true,metrics:metrics(1,1,1,1)},
  {id:'B',viable:true,metrics:metrics(1,1,1,1,{startYear:2027,startMonth:1,months:12})},
 ])
 assert.equal(result.status,'incomparable')
 assert.equal(result.ranked.length,0)
})
test('No ranking for missing or undefined inputs',()=>{
 const input=metrics(1,1,1,1)
 delete input.FN
 const result=compareRotationPi8([{id:'A',viable:true,metrics:input},{id:'B',viable:true,metrics:metrics(1,1,0,1)}])
 assert.equal(result.status,'insufficient_data')
 assert.equal(result.ranked.length,0)
})

test('Partial inputs cannot produce a final recommendation',()=>{
 const data=metrics(1,1,1,1)
 delete data.B
 const result=compareRotationPi8([
  {id:'A',viable:true,metrics:metrics(2,2,1,1)},
  {id:'B',viable:true,metrics:data},
 ])
 assert.equal(result.status,'partial_data')
 assert.equal(result.recommendationReady,false)
})
