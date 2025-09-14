# Interface: SerializationOptions

Defined in: [serializer.ts:28](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/serializer.ts#L28)

Convert SCXML documents back to XML strings with configurable formatting.

## Properties

### attributeValueProcessor()?

> `optional` **attributeValueProcessor**: (`name`, `value`) => `unknown`

Defined in: [serializer.ts:35](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/serializer.ts#L35)

#### Parameters

##### name

`string`

##### value

`unknown`

#### Returns

`unknown`

***

### cdataPropName?

> `optional` **cdataPropName**: `string`

Defined in: [serializer.ts:36](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/serializer.ts#L36)

***

### format?

> `optional` **format**: `boolean`

Defined in: [serializer.ts:29](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/serializer.ts#L29)

***

### ignoreAttributes?

> `optional` **ignoreAttributes**: `boolean`

Defined in: [serializer.ts:38](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/serializer.ts#L38)

***

### indentBy?

> `optional` **indentBy**: `string`

Defined in: [serializer.ts:30](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/serializer.ts#L30)

***

### preserveOrder?

> `optional` **preserveOrder**: `boolean`

Defined in: [serializer.ts:37](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/serializer.ts#L37)

***

### processEntities?

> `optional` **processEntities**: `boolean`

Defined in: [serializer.ts:39](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/serializer.ts#L39)

***

### suppressBooleanAttributes?

> `optional` **suppressBooleanAttributes**: `boolean`

Defined in: [serializer.ts:33](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/serializer.ts#L33)

***

### suppressEmptyNode?

> `optional` **suppressEmptyNode**: `boolean`

Defined in: [serializer.ts:31](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/serializer.ts#L31)

***

### suppressUnpairedNode?

> `optional` **suppressUnpairedNode**: `boolean`

Defined in: [serializer.ts:32](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/serializer.ts#L32)

***

### tagValueProcessor()?

> `optional` **tagValueProcessor**: (`name`, `value`) => `unknown`

Defined in: [serializer.ts:34](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/serializer.ts#L34)

#### Parameters

##### name

`string`

##### value

`unknown`

#### Returns

`unknown`
