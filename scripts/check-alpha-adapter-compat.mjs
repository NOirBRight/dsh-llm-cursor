#!/usr/bin/env node

/** Verify the built adapter provides the method called directly by an alpha1 Host. */
const module = await import(new URL('../lib/index.js', import.meta.url).href)
const Adapter = module.CursorAdapter
if (typeof Adapter !== 'function') throw new Error('CursorAdapter is not exported from lib/index.js')
if (!Object.hasOwn(Adapter.prototype, 'imageRequestPricing')) {
  throw new Error('CursorAdapter must own imageRequestPricing')
}
const adapter = Object.create(Adapter.prototype)
const pricing = adapter.imageRequestPricing('cursor', 'grok-4.6')
if (pricing !== undefined) throw new Error('neutral imageRequestPricing must return undefined')
console.log('CursorAdapter alpha1 adapter compatibility passed')
