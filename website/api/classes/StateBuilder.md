# Class: StateBuilder

Defined in: [builder.ts:100](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L100)

Fluent API builders for creating SCXML documents programmatically.

These builders provide a type-safe, fluent interface for constructing
SCXML documents from scratch.

## Constructors

### Constructor

> **new StateBuilder**(`id`): `StateBuilder`

Defined in: [builder.ts:103](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L103)

#### Parameters

##### id

`string`

#### Returns

`StateBuilder`

## Methods

### addDataModel()

> **addDataModel**(`dataModel`): `this`

Defined in: [builder.ts:180](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L180)

#### Parameters

##### dataModel

[`DataModelElement`](../interfaces/DataModelElement.md)

#### Returns

`this`

***

### addFinal()

> **addFinal**(`final`): `this`

Defined in: [builder.ts:132](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L132)

#### Parameters

##### final

[`FinalElement`](../interfaces/FinalElement.md)

#### Returns

`this`

***

### addHistory()

> **addHistory**(`history`): `this`

Defined in: [builder.ts:172](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L172)

#### Parameters

##### history

[`HistoryElement`](../interfaces/HistoryElement.md)

#### Returns

`this`

***

### addInvoke()

> **addInvoke**(`invoke`): `this`

Defined in: [builder.ts:164](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L164)

#### Parameters

##### invoke

[`InvokeElement`](../interfaces/InvokeElement.md)

#### Returns

`this`

***

### addOnEntry()

> **addOnEntry**(`onEntry`): `this`

Defined in: [builder.ts:148](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L148)

#### Parameters

##### onEntry

[`OnEntryElement`](../interfaces/OnEntryElement.md)

#### Returns

`this`

***

### addOnExit()

> **addOnExit**(`onExit`): `this`

Defined in: [builder.ts:156](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L156)

#### Parameters

##### onExit

[`OnExitElement`](../interfaces/OnExitElement.md)

#### Returns

`this`

***

### addParallel()

> **addParallel**(`parallel`): `this`

Defined in: [builder.ts:124](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L124)

#### Parameters

##### parallel

[`ParallelElement`](../interfaces/ParallelElement.md)

#### Returns

`this`

***

### addState()

> **addState**(`childState`): `this`

Defined in: [builder.ts:116](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L116)

#### Parameters

##### childState

[`StateElement`](../interfaces/StateElement.md)

#### Returns

`this`

***

### addTransition()

> **addTransition**(`transition`): `this`

Defined in: [builder.ts:140](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L140)

#### Parameters

##### transition

[`TransitionElement`](../interfaces/TransitionElement.md)

#### Returns

`this`

***

### build()

> **build**(): [`StateElement`](../interfaces/StateElement.md)

Defined in: [builder.ts:185](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L185)

#### Returns

[`StateElement`](../interfaces/StateElement.md)

***

### initial()

> **initial**(`initial`): `this`

Defined in: [builder.ts:111](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L111)

#### Parameters

##### initial

`string`

#### Returns

`this`

***

### create()

> `static` **create**(`id`): `StateBuilder`

Defined in: [builder.ts:107](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L107)

#### Parameters

##### id

`string`

#### Returns

`StateBuilder`
