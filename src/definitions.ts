import type { Plugin } from '@capacitor/core';

/**
 * What the connected Reader can do. Mode gating comes from here, not from the
 * reader type — a desktop reader that can write must not be gated like one
 * that cannot.
 */
export interface ReaderCapabilities {
  /** Reader can write an EPC to a tag (Generate & Set mode depends on it). */
  canWrite: boolean;
  /** Reader reports RSSI (Find mode depends on it). */
  hasRssi: boolean;
  /** Reader is a handheld terminal rather than a desk device. */
  isHandheld: boolean;
  /** Output power range in dBm. The power slider renders this range. */
  power: {
    min: number;
    max: number;
    default: number;
  };
}

export interface RFIDPlugin extends Plugin {
  /**
   * Capabilities of the connected Reader.
   *
   * Implementations that predate this method reject. That is a signal, not a
   * failure: the caller treats a rejection as a handheld Mobile Reader.
   */
  getCapabilities(): Promise<ReaderCapabilities>;

  isConnected(): Promise<{ connected: boolean }>;

  startScan(): Promise<void>;
  stopScan(): Promise<void>;
  clearData(): Promise<void>;

  getScanData(): Promise<any>;
  getOutputPower(): Promise<{ value: number }>;
  setOutputPower(options: { power: number }): Promise<{ value: number }>;

  getRange(): Promise<{ value: number }>;
  setRange(options: { range: number }): Promise<{ value: number }>;

  getQueryMode(): Promise<{ value: 0 | 1 | 2 | 3 }>;
  setQueryMode(options: {
    queryMode:
      | 0 // epc
      | 1 // epc+tid
      | 2 // epc+user
      | 3; // fasttid
  }): Promise<{ value: number }>;

  getReaderType(): Promise<{ value: number }>; // 80 - short, others - long distance mode
  getFirmwareVersion(): Promise<{ value: string }>;

  writeEpc(options: {
    epc: string;
    password?: string;
  }): Promise<{ value: number }>;
  writeEpcString(options: {
    epc: string;
    password?: string;
  }): Promise<{ value: number }>;

  startSearch(options: { searchableTags: string[], playSound: boolean }): Promise<void>;
  stopSearch(): Promise<void>;
}
