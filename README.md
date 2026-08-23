# capacitor-rfid-plugin-ox

rfid read-write

## Install

```bash
npm install capacitor-rfid-plugin-ox
npx cap sync
```

## API

<docgen-index>

* [`getCapabilities()`](#getcapabilities)
* [`isConnected()`](#isconnected)
* [`startScan()`](#startscan)
* [`stopScan()`](#stopscan)
* [`clearData()`](#cleardata)
* [`getScanData()`](#getscandata)
* [`getOutputPower()`](#getoutputpower)
* [`setOutputPower(...)`](#setoutputpower)
* [`getRange()`](#getrange)
* [`setRange(...)`](#setrange)
* [`getQueryMode()`](#getquerymode)
* [`setQueryMode(...)`](#setquerymode)
* [`getReaderType()`](#getreadertype)
* [`getFirmwareVersion()`](#getfirmwareversion)
* [`writeEpc(...)`](#writeepc)
* [`writeEpcString(...)`](#writeepcstring)
* [`startSearch(...)`](#startsearch)
* [`stopSearch()`](#stopsearch)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### getCapabilities()

```typescript
getCapabilities() => Promise<ReaderCapabilities>
```

Capabilities of the connected Reader.

Implementations that predate this method reject. That is a signal, not a
failure: the caller treats a rejection as a handheld Mobile Reader.

**Returns:** <code>Promise&lt;<a href="#readercapabilities">ReaderCapabilities</a>&gt;</code>

--------------------


### isConnected()

```typescript
isConnected() => Promise<{ connected: boolean; }>
```

**Returns:** <code>Promise&lt;{ connected: boolean; }&gt;</code>

--------------------


### startScan()

```typescript
startScan() => Promise<void>
```

--------------------


### stopScan()

```typescript
stopScan() => Promise<void>
```

--------------------


### clearData()

```typescript
clearData() => Promise<void>
```

--------------------


### getScanData()

```typescript
getScanData() => Promise<any>
```

**Returns:** <code>Promise&lt;any&gt;</code>

--------------------


### getOutputPower()

```typescript
getOutputPower() => Promise<{ value: number; }>
```

**Returns:** <code>Promise&lt;{ value: number; }&gt;</code>

--------------------


### setOutputPower(...)

```typescript
setOutputPower(options: { power: number; }) => Promise<{ value: number; }>
```

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ power: number; }</code> |

**Returns:** <code>Promise&lt;{ value: number; }&gt;</code>

--------------------


### getRange()

```typescript
getRange() => Promise<{ value: number; }>
```

**Returns:** <code>Promise&lt;{ value: number; }&gt;</code>

--------------------


### setRange(...)

```typescript
setRange(options: { range: number; }) => Promise<{ value: number; }>
```

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ range: number; }</code> |

**Returns:** <code>Promise&lt;{ value: number; }&gt;</code>

--------------------


### getQueryMode()

```typescript
getQueryMode() => Promise<{ value: 0 | 1 | 2 | 3; }>
```

**Returns:** <code>Promise&lt;{ value: 0 | 1 | 2 | 3; }&gt;</code>

--------------------


### setQueryMode(...)

```typescript
setQueryMode(options: { queryMode: 0 | 1 | 2 | 3; }) => Promise<{ value: number; }>
```

| Param         | Type                                          |
| ------------- | --------------------------------------------- |
| **`options`** | <code>{ queryMode: 0 \| 1 \| 2 \| 3; }</code> |

**Returns:** <code>Promise&lt;{ value: number; }&gt;</code>

--------------------


### getReaderType()

```typescript
getReaderType() => Promise<{ value: number; }>
```

**Returns:** <code>Promise&lt;{ value: number; }&gt;</code>

--------------------


### getFirmwareVersion()

```typescript
getFirmwareVersion() => Promise<{ value: string; }>
```

**Returns:** <code>Promise&lt;{ value: string; }&gt;</code>

--------------------


### writeEpc(...)

```typescript
writeEpc(options: { epc: string; password?: string; }) => Promise<{ value: number; }>
```

| Param         | Type                                             |
| ------------- | ------------------------------------------------ |
| **`options`** | <code>{ epc: string; password?: string; }</code> |

**Returns:** <code>Promise&lt;{ value: number; }&gt;</code>

--------------------


### writeEpcString(...)

```typescript
writeEpcString(options: { epc: string; password?: string; }) => Promise<{ value: number; }>
```

| Param         | Type                                             |
| ------------- | ------------------------------------------------ |
| **`options`** | <code>{ epc: string; password?: string; }</code> |

**Returns:** <code>Promise&lt;{ value: number; }&gt;</code>

--------------------


### startSearch(...)

```typescript
startSearch(options: { searchableTags: string[]; playSound: boolean; }) => Promise<void>
```

| Param         | Type                                                           |
| ------------- | -------------------------------------------------------------- |
| **`options`** | <code>{ searchableTags: string[]; playSound: boolean; }</code> |

--------------------


### stopSearch()

```typescript
stopSearch() => Promise<void>
```

--------------------


### Interfaces


#### ReaderCapabilities

What the connected Reader can do. Mode gating comes from here, not from the
reader type — a desktop reader that can write must not be gated like one
that cannot.

| Prop             | Type                                                        | Description                                                           |
| ---------------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| **`canWrite`**   | <code>boolean</code>                                        | Reader can write an EPC to a tag (Generate & Set mode depends on it). |
| **`hasRssi`**    | <code>boolean</code>                                        | Reader reports RSSI (Find mode depends on it).                        |
| **`isHandheld`** | <code>boolean</code>                                        | Reader is a handheld terminal rather than a desk device.              |
| **`power`**      | <code>{ min: number; max: number; default: number; }</code> | Output power range in dBm. The power slider renders this range.       |

</docgen-api>
