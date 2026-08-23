import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

import type { RFIDPlugin } from './definitions';

/**
 * `@capacitor-community/electron` preload'i yasaydigan ko'prik. `addListener`
 * id **satrini** qaytaradi, `removeListener` o'sha id ni oladi.
 */
interface ElectronBridge {
  addListener(eventName: string, callback: (...args: any[]) => void): string;
  removeListener(id: string): void;
  [method: string]: unknown;
}

type ElectronWindow = Window & {
  CapacitorCustomPlatform?: { plugins?: { RFID?: ElectronBridge } };
};

/**
 * Native yo'lda Capacitor `addListener` javobini o'zi `PluginListenerHandle`
 * ga o'raydi (`addListenerNative`), lekin buni faqat `PluginHeaders` bor
 * bo'lganda qiladi — Electron'da ular yo'q va xom id satri UI'ga o'sha holicha
 * yetadi. Natijada `handle.remove()` yo'q bo'lib chiqadi va tinglovchi
 * hech qachon olib tashlanmaydi.
 */
function withListenerHandles(bridge: ElectronBridge): RFIDPlugin {
  const addListener = async (
    eventName: string,
    callback: (...args: any[]) => void,
  ): Promise<PluginListenerHandle> => {
    const id = bridge.addListener(eventName, callback);

    return {
      remove: async () => {
        bridge.removeListener(id);
      },
    };
  };

  return new Proxy(bridge, {
    get(target, prop) {
      if (prop === 'addListener') return addListener;

      const value = target[prop as string];
      return typeof value === 'function' ? value.bind(target) : value;
    },
  }) as unknown as RFIDPlugin;
}

const RFID = registerPlugin<RFIDPlugin>('RFID', {
  web: () => import('./web').then(m => new m.RFIDWeb()),
  electron: () => {
    const bridge = (window as ElectronWindow).CapacitorCustomPlatform?.plugins
      ?.RFID;

    if (!bridge) {
      throw new Error(
        'RFID is not registered in the Electron runtime. Register the driver in electron-plugins.js.',
      );
    }

    return withListenerHandles(bridge);
  },
});

export * from './definitions';
export { RFID };
