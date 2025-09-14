# Class: OnEntryBuilder

Defined in: [builder.ts:431](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L431)

Fluent API builders for creating SCXML documents programmatically.

These builders provide a type-safe, fluent interface for constructing
SCXML documents from scratch.

## Constructors

### Constructor

> **new OnEntryBuilder**(): `OnEntryBuilder`

Defined in: [builder.ts:434](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L434)

#### Returns

`OnEntryBuilder`

## Methods

### addAssign()

> **addAssign**(`assign`): `this`

Defined in: [builder.ts:458](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L458)

#### Parameters

##### assign

[`AssignElement`](../interfaces/AssignElement.md)

#### Returns

`this`

***

### addLog()

> **addLog**(`log`): `this`

Defined in: [builder.ts:450](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L450)

#### Parameters

##### log

[`LogElement`](../interfaces/LogElement.md)

#### Returns

`this`

***

### addRaise()

> **addRaise**(`raise`): `this`

Defined in: [builder.ts:442](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L442)

#### Parameters

##### raise

[`RaiseElement`](../interfaces/RaiseElement.md)

#### Returns

`this`

***

### addScript()

> **addScript**(`script`): `this`

Defined in: [builder.ts:474](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L474)

#### Parameters

##### script

[`ScriptElement`](../interfaces/ScriptElement.md)

#### Returns

`this`

***

### addSend()

> **addSend**(`send`): `this`

Defined in: [builder.ts:466](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L466)

#### Parameters

##### send

[`SendElement`](../interfaces/SendElement.md)

#### Returns

`this`

***

### build()

> **build**(): [`OnEntryElement`](../interfaces/OnEntryElement.md)

Defined in: [builder.ts:482](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L482)

#### Returns

[`OnEntryElement`](../interfaces/OnEntryElement.md)

***

### create()

> `static` **create**(): `OnEntryBuilder`

Defined in: [builder.ts:438](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L438)

#### Returns

`OnEntryBuilder`
