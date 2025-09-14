# Class: ParallelBuilder

Defined in: [builder.ts:190](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L190)

Fluent API builders for creating SCXML documents programmatically.

These builders provide a type-safe, fluent interface for constructing
SCXML documents from scratch.

## Constructors

### Constructor

> **new ParallelBuilder**(`id`): `ParallelBuilder`

Defined in: [builder.ts:193](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L193)

#### Parameters

##### id

`string`

#### Returns

`ParallelBuilder`

## Methods

### addOnEntry()

> **addOnEntry**(`onEntry`): `this`

Defined in: [builder.ts:225](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L225)

#### Parameters

##### onEntry

[`OnEntryElement`](../interfaces/OnEntryElement.md)

#### Returns

`this`

***

### addOnExit()

> **addOnExit**(`onExit`): `this`

Defined in: [builder.ts:233](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L233)

#### Parameters

##### onExit

[`OnExitElement`](../interfaces/OnExitElement.md)

#### Returns

`this`

***

### addParallel()

> **addParallel**(`childParallel`): `this`

Defined in: [builder.ts:209](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L209)

#### Parameters

##### childParallel

[`ParallelElement`](../interfaces/ParallelElement.md)

#### Returns

`this`

***

### addState()

> **addState**(`state`): `this`

Defined in: [builder.ts:201](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L201)

#### Parameters

##### state

[`StateElement`](../interfaces/StateElement.md)

#### Returns

`this`

***

### addTransition()

> **addTransition**(`transition`): `this`

Defined in: [builder.ts:217](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L217)

#### Parameters

##### transition

[`TransitionElement`](../interfaces/TransitionElement.md)

#### Returns

`this`

***

### build()

> **build**(): [`ParallelElement`](../interfaces/ParallelElement.md)

Defined in: [builder.ts:241](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L241)

#### Returns

[`ParallelElement`](../interfaces/ParallelElement.md)

***

### create()

> `static` **create**(`id`): `ParallelBuilder`

Defined in: [builder.ts:197](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L197)

#### Parameters

##### id

`string`

#### Returns

`ParallelBuilder`
