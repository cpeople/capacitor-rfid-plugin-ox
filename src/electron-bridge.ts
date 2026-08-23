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

const SCAN_EVENT = 'onScanEvent';

/**
 * The Electron main process sends the tags it read in one message per 250 ms
 * window instead of one per frame — a single tag is read about 44 times a
 * second. The contract does not change: the array is unrolled here, so a
 * listener still gets one tag per call.
 */
const SCAN_BATCH_EVENT = 'onScanEventBatch';

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
      const ids = [bridge.addListener(eventName, callback)];

      if (eventName === SCAN_EVENT) {
        // A desktop app older than the batch sends one message per tag on
        // `onScanEvent`, a newer one sends only batches. Both are listened
        // for, because the bundle in the browser and the installed desktop
        // app are updated separately; only one of them ever fires.
        ids.push(
          bridge.addListener(SCAN_BATCH_EVENT, (batch: unknown[]) => {
            for (const event of batch) callback(event);
          }),
        );
      }

      return {
        remove: async () => {
          for (const id of ids) bridge.removeListener(id);
        },
      };
    },
  });

  return plugin;
}
