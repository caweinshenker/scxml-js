# Class: DataBuilder

Defined in: [builder.ts:346](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L346)

Fluent API builders for creating SCXML documents programmatically.

These builders provide a type-safe, fluent interface for constructing
SCXML documents from scratch.

## Constructors

### Constructor

> **new DataBuilder**(`id`): `DataBuilder`

Defined in: [builder.ts:349](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L349)

#### Parameters

##### id

`string`

#### Returns

`DataBuilder`

## Methods

### build()

> **build**(): [`DataElement`](../interfaces/DataElement.md)

Defined in: [builder.ts:372](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L372)

#### Returns

[`DataElement`](../interfaces/DataElement.md)

***

### content()

> **content**(`content`): `this`

Defined in: [builder.ts:367](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L367)

#### Parameters

##### content

`string`

#### Returns

`this`

***

### expr()

> **expr**(`expr`): `this`

Defined in: [builder.ts:362](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L362)

#### Parameters

##### expr

`string`

#### Returns

`this`

***

### src()

> **src**(`src`): `this`

Defined in: [builder.ts:357](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L357)

#### Parameters

##### src

`string`

#### Returns

`this`

***

### create()

> `static` **create**(`id`): `DataBuilder`

Defined in: [builder.ts:353](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L353)

#### Parameters

##### id

`string`

#### Returns

`DataBuilder`
