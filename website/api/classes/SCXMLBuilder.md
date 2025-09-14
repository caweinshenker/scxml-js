# Class: SCXMLBuilder

Defined in: [builder.ts:27](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L27)

Fluent API builders for creating SCXML documents programmatically.

These builders provide a type-safe, fluent interface for constructing
SCXML documents from scratch.

## Constructors

### Constructor

> **new SCXMLBuilder**(): `SCXMLBuilder`

Defined in: [builder.ts:30](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L30)

#### Returns

`SCXMLBuilder`

## Methods

### addDataModel()

> **addDataModel**(`dataModel`): `this`

Defined in: [builder.ts:82](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L82)

#### Parameters

##### dataModel

[`DataModelElement`](../interfaces/DataModelElement.md)

#### Returns

`this`

***

### addFinal()

> **addFinal**(`final`): `this`

Defined in: [builder.ts:74](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L74)

#### Parameters

##### final

[`FinalElement`](../interfaces/FinalElement.md)

#### Returns

`this`

***

### addParallel()

> **addParallel**(`parallel`): `this`

Defined in: [builder.ts:66](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L66)

#### Parameters

##### parallel

[`ParallelElement`](../interfaces/ParallelElement.md)

#### Returns

`this`

***

### addScript()

> **addScript**(`script`): `this`

Defined in: [builder.ts:87](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L87)

#### Parameters

##### script

[`ScriptElement`](../interfaces/ScriptElement.md)

#### Returns

`this`

***

### addState()

> **addState**(`state`): `this`

Defined in: [builder.ts:58](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L58)

#### Parameters

##### state

[`StateElement`](../interfaces/StateElement.md)

#### Returns

`this`

***

### build()

> **build**(): [`SCXMLDocument`](../interfaces/SCXMLDocument.md)

Defined in: [builder.ts:95](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L95)

#### Returns

[`SCXMLDocument`](../interfaces/SCXMLDocument.md)

***

### datamodel()

> **datamodel**(`datamodel`): `this`

Defined in: [builder.ts:53](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L53)

#### Parameters

##### datamodel

`string`

#### Returns

`this`

***

### initial()

> **initial**(`initial`): `this`

Defined in: [builder.ts:48](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L48)

#### Parameters

##### initial

`string`

#### Returns

`this`

***

### name()

> **name**(`name`): `this`

Defined in: [builder.ts:43](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L43)

#### Parameters

##### name

`string`

#### Returns

`this`

***

### create()

> `static` **create**(): `SCXMLBuilder`

Defined in: [builder.ts:39](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L39)

#### Returns

`SCXMLBuilder`
