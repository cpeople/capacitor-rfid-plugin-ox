// The bridge has to work on an object exposed through `contextBridge`. Its
// methods arrive as `writable: false, configurable: false`, so the fake is
// built the same way — the bug only shows up in that shape.

import { describe, expect, it, vi } from 'vitest';

import { withListenerHandles } from '../src/electron-bridge';
import type { ElectronBridge } from '../src/electron-bridge';

function contextBridgeObject(methods: Record<string, unknown>): ElectronBridge {
  const exposed = {};

  for (const [name, value] of Object.entries(methods)) {
    Object.defineProperty(exposed, name, {
      value,
      writable: false,
      configurable: false,
      enumerable: true,
    });
  }

  return exposed as ElectronBridge;
}

function fakeBridge() {
  const listeners = new Map<string, { eventName: string; callback: (...args: any[]) => void }>();
  let nextId = 0;

  const startScan = vi.fn(async () => undefined);
  const setOutputPower = vi.fn(async () => ({ value: 15 }));

  const bridge = contextBridgeObject({
    startScan,
    setOutputPower,
    addListener: (eventName: string, callback: (...args: any[]) => void) => {
      const id = `id-${nextId++}`;
      listeners.set(id, { eventName, callback });
      return id;
    },
    removeListener: (id: string) => {
      listeners.delete(id);
    },
  });

  return { bridge, listeners, startScan, setOutputPower };
}

describe('withListenerHandles', () => {
  it("qolgan metodlar ko'prikdagi aynan o'sha funksiya bo'lib qoladi", () => {
    const { bridge, startScan, setOutputPower } = fakeBridge();

    const plugin = withListenerHandles(bridge) as any;

    // With a Proxy this line threw a TypeError: for a read-only,
    // non-configurable property the get trap must return that exact value.
    expect(plugin.startScan).toBe(startScan);
    expect(plugin.setOutputPower).toBe(setOutputPower);
  });

  it('addListener PluginListenerHandle qaytaradi', async () => {
    const { bridge, listeners } = fakeBridge();
    const plugin = withListenerHandles(bridge);
    const callback = vi.fn();

    const handle = await plugin.addListener('onScanEvent' as any, callback);

    expect(listeners.size).toBe(1);
    expect(typeof handle.remove).toBe('function');

    await handle.remove();
    expect(listeners.size).toBe(0);
  });

  it("qo'llanmaydigan metod undefined bo'lib qoladi", () => {
    const { bridge } = fakeBridge();

    // Capacitor rejects this with UNIMPLEMENTED instead of resolving silently.
    expect((withListenerHandles(bridge) as any).writeEpc).toBeUndefined();
  });

  it('await qilinganda thenable deb qabul qilinmaydi', async () => {
    const { bridge, startScan } = fakeBridge();

    const plugin = await (withListenerHandles(bridge) as any);

    expect(plugin.startScan).toBe(startScan);
  });
});
