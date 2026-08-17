// @vitest-environment jsdom

import { Context, Service } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { apply, inject } from '../src/client/index.ts'

interface SlotEntry {
  options: Record<string, unknown>
  inject?: () => unknown
}

class FakeSlots extends Service {
  private readonly registered: SlotEntry[] = []

  constructor(ctx: Context) { super(ctx, 'slots') }

  inject(_name: string, register: () => () => void): void { this.ctx.effect(register) }

  register(options: Record<string, unknown> & { inject?: () => unknown }, _component: unknown): () => void {
    const entry = { options, inject: options.inject }
    this.registered.push(entry)
    return () => { this.registered.splice(this.registered.indexOf(entry), 1) }
  }

  entries(name: string): readonly SlotEntry[] {
    return this.registered.filter(entry => entry.options['name'] === name)
  }
}

describe('Cursor client plugin registration', () => {
  it('declares only the client services it consumes', () => {
    expect(inject).toEqual(['slots', 'locale', 'connection'])
  })

  it('reads usage through the cursor usage/read RPC without exposing tokens', async () => {
    const ctx = new Context()
    await ctx.plugin(FakeSlots).await()
    const slots = ctx.get('slots') as FakeSlots
    ctx.provide('locale', {
      register: () => () => undefined,
      bind: () => (key: string) => key,
    } as never)
    const calls: Array<{ channel: string, endpoint: string, payload: unknown }> = []
    ctx.provide('connection', {
      rpc: {
        call: async (channel: string, endpoint: string, payload: unknown) => {
          calls.push({ channel, endpoint, payload })
          return {
            ok: true,
            value: {
              status: 'ok',
              usage: {
                fetchedAt: '2026-08-17T00:00:00.000Z',
                windows: [{ id: 'monthly', used: 1, limit: 10 }],
              },
            },
          }
        },
      },
    } as never)
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()

    const face = (slots.entries('settings.plugin.item')[0] as {
      inject?: () => { fetchUsage: () => Promise<unknown> }
    }).inject?.()
    const usage = await face?.fetchUsage()
    expect(usage).toEqual({
      status: 'ok',
      usage: {
        fetchedAt: '2026-08-17T00:00:00.000Z',
        windows: [{ id: 'monthly', used: 1, limit: 10 }],
      },
    })
    expect(calls[0]).toEqual({ channel: '/cursor', endpoint: 'usage/read', payload: {} })
    expect(JSON.stringify(calls)).not.toMatch(/accessToken|refreshToken/u)
    await fiber.dispose()
    await ctx.fiber.dispose()
  })
})
