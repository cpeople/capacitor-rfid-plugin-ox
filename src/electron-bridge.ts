import type { PluginListenerHandle } from '@capacitor/core';

import type { RFIDPlugin } from './definitions';

/**
 * The bridge built by the `@capacitor-community/electron` preload
 * (`electron-rt.ts`). Its `addListener` returns an id **string** and is
 * synchronous — `removeListener` takes that same id.
 */
export interface ElectronBridge {
  addListener(eventName: string, callback: (...args: any[]) => void): string;
  removeListener(id: string): void;
}

/**
 * On native platforms Capacitor wraps the `addListener` result into a
 * `PluginListenerHandle` itself (`addListenerNative`), but only when
 * `PluginHeaders` are present. Electron has none, so the bridge's raw id
 * string reaches the UI as-is and `handle.remove()` is missing: the listener
 * is never removed, and scanning does not start the second time the modal
 * opens.
 *
 * Do not wrap it with a `Proxy`. Methods of an object exposed through
 * `contextBridge` arrive as `writable: false, configurable: false`, and for
 * such a property a `get` trap must return **that exact value** — even a
 * bound copy is rejected. Otherwise the engine throws the error we saw on
 * the device:
 *   TypeError: 'get' on proxy: property 'startScan' is a read-only and
 *   non-configurable data property on the proxy target but the proxy did
 *   not return its actual value
 * So the bridge is used as the prototype instead: the other methods are
 * found on it as usual, and only `addListener` is defined on top.
 */
export function withListenerHandles(bridge: ElectronBridge): RFIDPlugin {
  const plugin = Object.create(bridge) as RFIDPlugin;

  // A plain `plugin.addListener = ...` does not work: the prototype property
  // is `writable: false`, so [[Set]] blocks it.
  Object.defineProperty(plugin, 'addListener', {
    value: async (
      eventName: string,
      callback: (...args: any[]) => void,
    ): Promise<PluginListenerHandle> => {
      const id = bridge.addListener(eventName, callback);

      return {
        remove: async () => {
          bridge.removeListener(id);
        },
      };
    },
  });

  return plugin;
}
