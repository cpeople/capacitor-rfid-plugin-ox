import { registerPlugin } from '@capacitor/core';

import type { RFIDPlugin } from './definitions';
import type { ElectronBridge } from './electron-bridge';
import { withListenerHandles } from './electron-bridge';

type ElectronWindow = Window & {
  CapacitorCustomPlatform?: { plugins?: { RFID?: ElectronBridge } };
};

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
