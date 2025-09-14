# Class: DataModelBuilder

Defined in: [builder.ts:322](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L322)

Fluent API builders for creating SCXML documents programmatically.

These builders provide a type-safe, fluent interface for constructing
SCXML documents from scratch.

## Constructors

### Constructor

> **new DataModelBuilder**(): `DataModelBuilder`

Defined in: [builder.ts:325](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L325)

#### Returns

`DataModelBuilder`

## Methods

### addData()

> **addData**(`data`): `this`

Defined in: [builder.ts:333](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L333)

#### Parameters

##### data

[`DataElement`](../interfaces/DataElement.md)

#### Returns

`this`

***

### build()

> **build**(): [`DataModelElement`](../interfaces/DataModelElement.md)

Defined in: [builder.ts:341](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L341)

#### Returns

[`DataModelElement`](../interfaces/DataModelElement.md)

***

### create()

> `static` **create**(): `DataModelBuilder`

Defined in: [builder.ts:329](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/builder.ts#L329)

#### Returns

`DataModelBuilder`
