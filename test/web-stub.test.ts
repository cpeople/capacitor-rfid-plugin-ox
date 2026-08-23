// Trap 1: the browser stub used to `resolve()` silently and the UI reported a
// success that never happened. Every method that cannot work in a browser has
// to reject instead.

import { describe, expect, it } from 'vitest';

import { RFIDWeb } from '../src/web';

const stub = new RFIDWeb() as any;

describe('web stub', () => {
  it('reader portlarini ro\'yxatlash rad etiladi', async () => {
    // Not an empty list: that reads as "nothing plugged in" and sends the
    // operator to check a cable the browser cannot see.
    await expect(stub.listReaderPorts()).rejects.toThrow();
  });

  it('port tanlash rad etiladi', async () => {
    await expect(stub.selectReaderPort({ path: 'COM3' })).rejects.toThrow();
  });

  it('faqat isConnected jim javob beradi — u yolg\'on emas', async () => {
    await expect(stub.isConnected()).resolves.toEqual({ connected: false });
  });
});
