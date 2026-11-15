import test from 'node:test'
import assert from 'node:assert/strict'
import { powerDateRange, latestValidPowerDate } from '../src/lib/powerDateRange.js'
import { buildExtendedPowerUrl } from '../src/lib/nasaPowerExtended.js'

test('updates through latest conservative NASA day without a hardcoded 2024 end', () => {
 const now = new Date('2026-11-15T12:00:00Z')
 const range = powerDateRange(now)
 assert.equal(range.startDate, '20150101')
 assert.equal(range.endDate, '20261107')
 assert.match(buildExtendedPowerUrl({latitude:32.62,longitude:-115.45}, undefined, undefined, now), /end=20261107/)
})
test('rolls over into a new year correctly', () => {
 assert.equal(powerDateRange(new Date('2027-01-04T00:00:00Z')).endDate, '20261227')
 assert.equal(powerDateRange(new Date('2027-01-12T00:00:00Z')).endDate, '20270104')
})
test('last day is validated from real returned readings rather than the requested end', () => {
 const r = {T2M:{20261105:22,20261106:-999},T2M_MAX:{20261105:35,20261106:31},PRECTOTCORR:{20261105:0,20261106:0}}
 assert.equal(latestValidPowerDate(r), '20261105')
 assert.equal(latestValidPowerDate({T2M:{},T2M_MAX:{},PRECTOTCORR:{}}), null)
})
