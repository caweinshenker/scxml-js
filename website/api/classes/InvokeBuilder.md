# Class: InvokeBuilder

Defined in: [builder.ts:377](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L377)

Fluent API builders for creating SCXML documents programmatically.

These builders provide a type-safe, fluent interface for constructing
SCXML documents from scratch.

## Constructors

### Constructor

> **new InvokeBuilder**(): `InvokeBuilder`

Defined in: [builder.ts:380](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L380)

#### Returns

`InvokeBuilder`

## Methods

### addParam()

> **addParam**(`param`): `this`

Defined in: [builder.ts:413](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L413)

#### Parameters

##### param

[`ParamElement`](../interfaces/ParamElement.md)

#### Returns

`this`

***

### autoforward()

> **autoforward**(`autoforward`): `this`

Defined in: [builder.ts:408](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L408)

#### Parameters

##### autoforward

`boolean`

#### Returns

`this`

***

### build()

> **build**(): [`InvokeElement`](../interfaces/InvokeElement.md)

Defined in: [builder.ts:426](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L426)

#### Returns

[`InvokeElement`](../interfaces/InvokeElement.md)

***

### content()

> **content**(`content`): `this`

Defined in: [builder.ts:421](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L421)

#### Parameters

##### content

[`ContentElement`](../interfaces/ContentElement.md)

#### Returns

`this`

***

### id()

> **id**(`id`): `this`

Defined in: [builder.ts:398](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L398)

#### Parameters

##### id

`string`

#### Returns

`this`

***

### src()

> **src**(`src`): `this`

Defined in: [builder.ts:393](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L393)

#### Parameters

##### src

`string`

#### Returns

`this`

***

### srcexpr()

> **srcexpr**(`srcexpr`): `this`

Defined in: [builder.ts:403](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L403)

#### Parameters

##### srcexpr

`string`

#### Returns

`this`

***

### type()

> **type**(`type`): `this`

Defined in: [builder.ts:388](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L388)

#### Parameters

##### type

`string`

#### Returns

`this`

***

### create()

> `static` **create**(): `InvokeBuilder`

Defined in: [builder.ts:384](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L384)

#### Returns

`InvokeBuilder`
