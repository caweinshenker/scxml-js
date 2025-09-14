# Class: OnExitBuilder

Defined in: [builder.ts:487](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L487)

Fluent API builders for creating SCXML documents programmatically.

These builders provide a type-safe, fluent interface for constructing
SCXML documents from scratch.

## Constructors

### Constructor

> **new OnExitBuilder**(): `OnExitBuilder`

Defined in: [builder.ts:490](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L490)

#### Returns

`OnExitBuilder`

## Methods

### addAssign()

> **addAssign**(`assign`): `this`

Defined in: [builder.ts:514](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L514)

#### Parameters

##### assign

[`AssignElement`](../interfaces/AssignElement.md)

#### Returns

`this`

***

### addLog()

> **addLog**(`log`): `this`

Defined in: [builder.ts:506](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L506)

#### Parameters

##### log

[`LogElement`](../interfaces/LogElement.md)

#### Returns

`this`

***

### addRaise()

> **addRaise**(`raise`): `this`

Defined in: [builder.ts:498](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L498)

#### Parameters

##### raise

[`RaiseElement`](../interfaces/RaiseElement.md)

#### Returns

`this`

***

### addScript()

> **addScript**(`script`): `this`

Defined in: [builder.ts:530](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L530)

#### Parameters

##### script

[`ScriptElement`](../interfaces/ScriptElement.md)

#### Returns

`this`

***

### addSend()

> **addSend**(`send`): `this`

Defined in: [builder.ts:522](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L522)

#### Parameters

##### send

[`SendElement`](../interfaces/SendElement.md)

#### Returns

`this`

***

### build()

> **build**(): [`OnExitElement`](../interfaces/OnExitElement.md)

Defined in: [builder.ts:538](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L538)

#### Returns

[`OnExitElement`](../interfaces/OnExitElement.md)

***

### create()

> `static` **create**(): `OnExitBuilder`

Defined in: [builder.ts:494](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L494)

#### Returns

`OnExitBuilder`
