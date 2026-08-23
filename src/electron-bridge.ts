import type { PluginListenerHandle } from '@capacitor/core';

import type { RFIDPlugin } from './definitions';

/**
 * `@capacitor-community/electron` preload'i yasaydigan ko'prik
 * (`electron-rt.ts`). `addListener` id **satrini** qaytaradi va u
 * sinxron — `removeListener` o'sha id ni oladi.
 */
export interface ElectronBridge {
  addListener(eventName: string, callback: (...args: any[]) => void): string;
  removeListener(id: string): void;
}

/**
 * Native yo'lda Capacitor `addListener` javobini `PluginListenerHandle` ga
 * o'zi o'raydi (`addListenerNative`), lekin buni faqat `PluginHeaders` bor
 * bo'lganda qiladi. Electron'da ular yo'q, ya'ni ko'prikning xom id satri
 * UI'ga o'sha holicha yetadi va `handle.remove()` yo'q bo'lib chiqadi:
 * tinglovchi olib tashlanmaydi, oyna ikkinchi marta ochilganda skanerlash
 * boshlanmaydi.
 *
 * O'rash `Proxy` bilan qilinmaydi. `contextBridge` ochgan obyektning
 * metodlari `writable: false, configurable: false` bo'lib keladi, bunday
 * xossada `get` tuzog'i **aynan o'sha qiymatni** qaytarishi shart — bind
 * qilingan nusxa ham yaramaydi. Aks holda dvigatel qurilmada ko'rilgan
 * xatoni tashlaydi:
 *   TypeError: 'get' on proxy: property 'startScan' is a read-only and
 *   non-configurable data property on the proxy target but the proxy did
 *   not return its actual value
 * Shuning uchun ko'prik prototip qilib olinadi: qolgan metodlar prototipdan
 * o'z holicha topiladi, faqat `addListener` ustiga yoziladi.
 */
export function withListenerHandles(bridge: ElectronBridge): RFIDPlugin {
  const plugin = Object.create(bridge) as RFIDPlugin;

  // Oddiy `plugin.addListener = ...` ishlamaydi: prototipdagi xossa
  // `writable: false` bo'lgani uchun [[Set]] uni to'sadi.
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
