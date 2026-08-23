import { registerPlugin } from '@capacitor/core';

import type { RFIDPlugin } from './definitions';

type ElectronWindow = Window & {
  CapacitorCustomPlatform?: { plugins?: { RFID?: RFIDPlugin } };
};

const RFID = registerPlugin<RFIDPlugin>('RFID', {
  web: () => import('./web').then(m => new m.RFIDWeb()),
  electron: () => {
    const plugin = (window as ElectronWindow).CapacitorCustomPlatform?.plugins
      ?.RFID;

    if (!plugin) {
      throw new Error(
        'RFID is not registered in the Electron runtime. Register the driver in electron-plugins.js.',
      );
    }

    return plugin;
  },
});

export * from './definitions';
export { RFID };
