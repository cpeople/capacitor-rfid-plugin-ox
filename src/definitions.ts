import type { Plugin, PluginListenerHandle } from '@capacitor/core';

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

/**
 * The four states an operator can act on.
 *
 * `isConnected()` is too coarse for this: a reader that is plugged in but
 * silent answers `false` the same way a missing one does, and the operator
 * needs a different move in each case. `isConnected()` stays as it is.
 */
export type ReaderConnectionStatus =
  /** An attempt is running. */
  | 'connecting'
  /** The reader is open and answering. */
  | 'connected'
  /** No reader to talk to — nothing found, or found but not openable. */
  | 'not-found'
  /** The port opened but the reader did not answer a command. */
  | 'not-responding';

/**
 * Why the reader is unusable. The status alone does not say what to do next:
 * a busy reader needs another program closed, a missing one needs the
 * connection checked. The UI picks its message from the reason when there is
 * one.
 *
 * These name what happened to the *reader*, never how it is wired. A driver
 * for a device with no serial port has to be able to answer in this
 * vocabulary too, and the operator has to be told the truth either way —
 * so nothing here says "COM port" or "USB". The device-specific sentence
 * belongs in `detail`.
 */
export type ReaderConnectionReason =
  /** Another program holds the reader. Only one may have it at a time. */
  | 'busy'
  /** No reader in sight — nothing connected, or nothing that is a reader. */
  | 'not-detected'
  /** The reader was there and then went away. */
  | 'disconnected'
  /** The reader is reachable but did not answer. */
  | 'no-answer'
  /**
   * Several readers are connected and none was picked. Guessing here would
   * attach tags read by the wrong device, so nothing is opened until
   * `selectReaderPort` says which one.
   */
  | 'not-chosen';

export interface ReaderConnectionState {
  status: ReaderConnectionStatus;
  reason?: ReaderConnectionReason;
  /**
   * Driver text: the port list, the command code, the OS error. This is the
   * one field allowed to talk about the wiring, because nothing branches on
   * it — it is shown as-is for support, not translated.
   */
  detail?: string;
}

/**
 * One reader the driver could talk to.
 *
 * `path` is the identity — `COM3` on Windows, `/dev/cu.usbserial-110`
 * elsewhere. Two identical CH340 adapters carry no serial number of their own,
 * so the path is all that separates them.
 *
 * The caller treats it as **opaque**: it compares, stores and hands it back,
 * and never reads meaning out of it. A driver for a device that is not a
 * serial port puts its own identity here.
 */
export interface ReaderPort {
  path: string;
  /** What the OS calls the device. For the operator to read, not to match on. */
  label?: string;
  vendorId?: string;
  productId?: string;
}

export interface RFIDPlugin extends Plugin {
  /**
   * Capabilities of the connected Reader.
   *
   * Implementations that predate this method reject. That is a signal, not a
   * failure: the caller treats a rejection as a handheld Mobile Reader.
   */
  getCapabilities(): Promise<ReaderCapabilities>;

  /**
   * Connection state for the first render. The stream of later changes comes
   * from the `onConnectionState` listener — "not responding" is only found out
   * after a timeout, so it cannot be a return value.
   *
   * A reader is an exclusive resource, so its state is only knowable while it
   * is held: an implementation that is not connected may start an attempt here
   * and answer `connecting`, with the outcome arriving on the listener.
   *
   * Implementations that predate this method reject. The caller then hides the
   * indicator instead of guessing.
   */
  getConnectionState(): Promise<ReaderConnectionState>;

  /**
   * The readers plugged in right now, newest listing every call — a port that
   * was there a minute ago may be gone.
   *
   * Only readers, not every serial port: what the caller does with this list
   * is offer it as a choice, and a Bluetooth port is not a choice.
   *
   * Implementations that predate this method reject. The caller then keeps
   * whatever the driver picks on its own.
   */
  listReaderPorts(): Promise<{ ports: ReaderPort[] }>;

  /**
   * Use this reader from now on. Reconnects when another port is open.
   *
   * The choice itself is not stored here: the driver is restarted with the
   * app, and where a choice belongs is the caller's question. The caller
   * remembers the path and says it again on the next start.
   *
   * Rejects when the path is not in the current `listReaderPorts()` — a
   * remembered reader that was unplugged has to be chosen again, not opened
   * blindly.
   */
  selectReaderPort(options: { path: string }): Promise<void>;

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

  /** Every connection state change. Fires only on a change, not on a poll. */
  addListener(
    eventName: 'onConnectionState',
    listener: (state: ReaderConnectionState) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: string,
    listenerFunc: (...args: any[]) => any,
  ): Promise<PluginListenerHandle>;
}
