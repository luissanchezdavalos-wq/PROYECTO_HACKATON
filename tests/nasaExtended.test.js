import test from 'node:test'
import assert from 'node:assert/strict'
import { aggregateExtendedPower, buildExtendedPowerUrl } from '../src/lib/nasaPowerExtended.js'
import { buildModelInput } from '../src/lib/advancedIndicators.js'

test('url requests optional POWER daily parameters',()=>{
 const url=buildExtendedPowerUrl({latitude:32.62,longitude:-115.45})
 for(const name of ['TSURF','SFMC','EVPTRNS','EVLAND']) assert.ok(url.includes(name))
})
test('converts surface C to Kelvin, reads soil moisture and estimates ET from energy flux',()=>{
 const r=aggregateExtendedPower({TSURF:{20200101:27,20200102:29},SFMC:{20200101:0.23,20200102:0.25},EVPTRNS:{20200101:2.45},EVLAND:{20200101:2.45}})
 assert.ok(Math.abs(r.T.value-301.15)<1e-9)
 assert.equal(r.theta.value,0.24)
 assert.equal(r.ET.value,2)
 assert.equal(r.ET.provenance,'estimated')
})
test('does not fill missing measurements with zero',()=>{
 const r=aggregateExtendedPower({TSURF:{20200101:-999},SFMC:{20200101:-999}})
 assert.equal(r.T,null); assert.equal(r.theta,null); assert.equal(r.ET,null)
})
test('model uses compatible automatic NASA inputs and asks manual only for absent keys',()=>{
 const r=buildModelInput({source:'live',months:Array.from({length:12},()=>({avgPrecipMm:10})),extended:{T:{value:300,unit:'K',provenance:'estimated',source:'NASA POWER'},theta:{value:.2,unit:'m3/m3',provenance:'estimated',source:'NASA POWER'},ET:{value:3,unit:'mm/day',provenance:'estimated',source:'NASA POWER'}}},{T:{value:500},Zr:{value:'1'}})
 assert.equal(r.T.value,300); assert.equal(r.P.value,120); assert.equal(r.Zr.value,1); assert.equal(r.ET.value,3)
})
test('demo climate must never enter experimental calculations',()=>{
 const r=buildModelInput({source:'demo',months:Array.from({length:12},()=>({avgPrecipMm:10})),extended:{theta:{value:.25,unit:'m3/m3'}}})
 assert.equal(Object.keys(r).length,0)
})
