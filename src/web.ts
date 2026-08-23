import { WebPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

import type {
  ReaderCapabilities,
  ReaderConnectionState,
  ReaderPort,
  RFIDPlugin,
} from './definitions';

const NO_READER_ON_WEB =
  'No RFID Reader in the browser. Use the desktop app (ox-desktop) or the Android handheld.';

export class RFIDWeb extends WebPlugin implements RFIDPlugin {
  /**
   * The one method the browser can answer truthfully. Everything else rejects:
   * a silent `resolve` makes the UI report a success that never happened.
   */
  async isConnected(): Promise<{ connected: boolean }> {
    return { connected: false };
  }

  /**
   * Events never fire without a Reader, so registering a listener here would be
   * the same silent lie as a resolving `startScan()`.
   */
  async addListener(): Promise<PluginListenerHandle> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async getCapabilities(): Promise<ReaderCapabilities> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  /**
   * Not `not-found`: that state tells the operator to check the cable, and
   * there is no cable to check in a browser. The rejection carries the one
   * useful sentence — open the desktop app or the handheld.
   */
  async getConnectionState(): Promise<ReaderConnectionState> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  /**
   * Not an empty list: "no readers plugged in" would send the operator to look
   * for a cable, and the browser has no serial ports to look at.
   */
  async listReaderPorts(): Promise<{ ports: ReaderPort[] }> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async selectReaderPort(): Promise<void> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async startScan(): Promise<void> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async stopScan(): Promise<void> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async clearData(): Promise<void> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async getScanData(): Promise<any> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async getOutputPower(): Promise<{ value: number }> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async setOutputPower(): Promise<{ value: number }> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async getRange(): Promise<{ value: number }> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async setRange(): Promise<{ value: number }> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async getQueryMode(): Promise<{ value: 0 | 1 | 2 | 3 }> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async setQueryMode(): Promise<{ value: number }> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async getReaderType(): Promise<{ value: number }> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async getFirmwareVersion(): Promise<{ value: string }> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async writeEpc(): Promise<{ value: number }> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async writeEpcString(): Promise<{ value: number }> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async startSearch(): Promise<void> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }

  async stopSearch(): Promise<void> {
    throw this.unimplemented(NO_READER_ON_WEB);
  }
}
