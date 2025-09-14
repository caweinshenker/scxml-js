# Class: TransitionBuilder

Defined in: [builder.ts:246](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L246)

Fluent API builders for creating SCXML documents programmatically.

These builders provide a type-safe, fluent interface for constructing
SCXML documents from scratch.

## Constructors

### Constructor

> **new TransitionBuilder**(): `TransitionBuilder`

Defined in: [builder.ts:249](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L249)

#### Returns

`TransitionBuilder`

## Methods

### addAssign()

> **addAssign**(`assign`): `this`

Defined in: [builder.ts:293](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L293)

#### Parameters

##### assign

[`AssignElement`](../interfaces/AssignElement.md)

#### Returns

`this`

***

### addLog()

> **addLog**(`log`): `this`

Defined in: [builder.ts:285](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L285)

#### Parameters

##### log

[`LogElement`](../interfaces/LogElement.md)

#### Returns

`this`

***

### addRaise()

> **addRaise**(`raise`): `this`

Defined in: [builder.ts:277](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L277)

#### Parameters

##### raise

[`RaiseElement`](../interfaces/RaiseElement.md)

#### Returns

`this`

***

### addScript()

> **addScript**(`script`): `this`

Defined in: [builder.ts:309](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L309)

#### Parameters

##### script

[`ScriptElement`](../interfaces/ScriptElement.md)

#### Returns

`this`

***

### addSend()

> **addSend**(`send`): `this`

Defined in: [builder.ts:301](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L301)

#### Parameters

##### send

[`SendElement`](../interfaces/SendElement.md)

#### Returns

`this`

***

### build()

> **build**(): [`TransitionElement`](../interfaces/TransitionElement.md)

Defined in: [builder.ts:317](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L317)

#### Returns

[`TransitionElement`](../interfaces/TransitionElement.md)

***

### cond()

> **cond**(`cond`): `this`

Defined in: [builder.ts:262](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L262)

#### Parameters

##### cond

`string`

#### Returns

`this`

***

### event()

> **event**(`event`): `this`

Defined in: [builder.ts:257](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L257)

#### Parameters

##### event

`string`

#### Returns

`this`

***

### target()

> **target**(`target`): `this`

Defined in: [builder.ts:267](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L267)

#### Parameters

##### target

`string`

#### Returns

`this`

***

### type()

> **type**(`type`): `this`

Defined in: [builder.ts:272](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L272)

#### Parameters

##### type

`"internal"` | `"external"`

#### Returns

`this`

***

### create()

> `static` **create**(): `TransitionBuilder`

Defined in: [builder.ts:253](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L253)

#### Returns

`TransitionBuilder`
