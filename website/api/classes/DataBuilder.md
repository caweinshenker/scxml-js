# Class: DataBuilder

Defined in: [builder.ts:346](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L346)

Fluent API builders for creating SCXML documents programmatically.

These builders provide a type-safe, fluent interface for constructing
SCXML documents from scratch.

## Constructors

### Constructor

> **new DataBuilder**(`id`): `DataBuilder`

Defined in: [builder.ts:349](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L349)

#### Parameters

##### id

`string`

#### Returns

`DataBuilder`

## Methods

### build()

> **build**(): [`DataElement`](../interfaces/DataElement.md)

Defined in: [builder.ts:372](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L372)

#### Returns

[`DataElement`](../interfaces/DataElement.md)

***

### content()

> **content**(`content`): `this`

Defined in: [builder.ts:367](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L367)

#### Parameters

##### content

`string`

#### Returns

`this`

***

### expr()

> **expr**(`expr`): `this`

Defined in: [builder.ts:362](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L362)

#### Parameters

##### expr

`string`

#### Returns

`this`

***

### src()

> **src**(`src`): `this`

Defined in: [builder.ts:357](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L357)

#### Parameters

##### src

`string`

#### Returns

`this`

***

### create()

> `static` **create**(`id`): `DataBuilder`

Defined in: [builder.ts:353](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/builder.ts#L353)

#### Parameters

##### id

`string`

#### Returns

`DataBuilder`
