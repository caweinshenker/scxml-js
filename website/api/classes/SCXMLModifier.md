# Class: SCXMLModifier

Defined in: [modifier.ts:16](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L16)

API for programmatically modifying existing SCXML documents.

## Constructors

### Constructor

> **new SCXMLModifier**(`document`): `SCXMLModifier`

Defined in: [modifier.ts:19](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L19)

#### Parameters

##### document

[`SCXMLDocument`](../interfaces/SCXMLDocument.md)

#### Returns

`SCXMLModifier`

## Methods

### addDataToModel()

> **addDataToModel**(`data`): `this`

Defined in: [modifier.ts:268](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L268)

#### Parameters

##### data

[`DataElement`](../interfaces/DataElement.md)

#### Returns

`this`

***

### addInvokeToState()

> **addInvokeToState**(`stateId`, `invoke`): `this`

Defined in: [modifier.ts:251](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L251)

#### Parameters

##### stateId

`string`

##### invoke

[`InvokeElement`](../interfaces/InvokeElement.md)

#### Returns

`this`

***

### addOnEntryToState()

> **addOnEntryToState**(`stateId`, `onEntry`): `this`

Defined in: [modifier.ts:231](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L231)

#### Parameters

##### stateId

`string`

##### onEntry

[`OnEntryElement`](../interfaces/OnEntryElement.md)

#### Returns

`this`

***

### addOnExitToState()

> **addOnExitToState**(`stateId`, `onExit`): `this`

Defined in: [modifier.ts:241](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L241)

#### Parameters

##### stateId

`string`

##### onExit

[`OnExitElement`](../interfaces/OnExitElement.md)

#### Returns

`this`

***

### addState()

> **addState**(`state`): `this`

Defined in: [modifier.ts:46](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L46)

#### Parameters

##### state

[`StateElement`](../interfaces/StateElement.md)

#### Returns

`this`

***

### addTransitionToState()

> **addTransitionToState**(`stateId`, `transition`): `this`

Defined in: [modifier.ts:194](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L194)

#### Parameters

##### stateId

`string`

##### transition

[`TransitionElement`](../interfaces/TransitionElement.md)

#### Returns

`this`

***

### clone()

> **clone**(): `SCXMLModifier`

Defined in: [modifier.ts:433](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L433)

#### Returns

`SCXMLModifier`

***

### findState()

> **findState**(`stateId`): `undefined` \| [`StateElement`](../interfaces/StateElement.md)

Defined in: [modifier.ts:145](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L145)

#### Parameters

##### stateId

`string`

#### Returns

`undefined` \| [`StateElement`](../interfaces/StateElement.md)

***

### getAllStateIds()

> **getAllStateIds**(): `string`[]

Defined in: [modifier.ts:411](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L411)

#### Returns

`string`[]

***

### getDocument()

> **getDocument**(): [`SCXMLDocument`](../interfaces/SCXMLDocument.md)

Defined in: [modifier.ts:27](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L27)

#### Returns

[`SCXMLDocument`](../interfaces/SCXMLDocument.md)

***

### removeDataFromModel()

> **removeDataFromModel**(`dataId`): `this`

Defined in: [modifier.ts:294](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L294)

#### Parameters

##### dataId

`string`

#### Returns

`this`

***

### removeState()

> **removeState**(`stateId`): `this`

Defined in: [modifier.ts:54](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L54)

#### Parameters

##### stateId

`string`

#### Returns

`this`

***

### removeTransitionFromState()

> **removeTransitionFromState**(`stateId`, `predicate`): `this`

Defined in: [modifier.ts:204](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L204)

#### Parameters

##### stateId

`string`

##### predicate

(`transition`) => `boolean`

#### Returns

`this`

***

### renameState()

> **renameState**(`oldId`, `newId`): `this`

Defined in: [modifier.ts:304](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L304)

#### Parameters

##### oldId

`string`

##### newId

`string`

#### Returns

`this`

***

### setDatamodel()

> **setDatamodel**(`datamodel`): `this`

Defined in: [modifier.ts:41](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L41)

#### Parameters

##### datamodel

`string`

#### Returns

`this`

***

### setInitial()

> **setInitial**(`initial`): `this`

Defined in: [modifier.ts:36](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L36)

#### Parameters

##### initial

`string`

#### Returns

`this`

***

### setName()

> **setName**(`name`): `this`

Defined in: [modifier.ts:31](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L31)

#### Parameters

##### name

`string`

#### Returns

`this`

***

### setStateDataModel()

> **setStateDataModel**(`stateId`, `dataModel`): `this`

Defined in: [modifier.ts:261](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L261)

#### Parameters

##### stateId

`string`

##### dataModel

[`DataModelElement`](../interfaces/DataModelElement.md)

#### Returns

`this`

***

### updateDataInModel()

> **updateDataInModel**(`dataId`, `updater`): `this`

Defined in: [modifier.ts:281](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L281)

#### Parameters

##### dataId

`string`

##### updater

(`data`) => [`DataElement`](../interfaces/DataElement.md)

#### Returns

`this`

***

### updateState()

> **updateState**(`stateId`, `updater`): `this`

Defined in: [modifier.ts:73](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L73)

#### Parameters

##### stateId

`string`

##### updater

(`state`) => [`StateElement`](../interfaces/StateElement.md)

#### Returns

`this`

***

### updateTransitionInState()

> **updateTransitionInState**(`stateId`, `predicate`, `updater`): `this`

Defined in: [modifier.ts:216](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L216)

#### Parameters

##### stateId

`string`

##### predicate

(`transition`) => `boolean`

##### updater

(`transition`) => [`TransitionElement`](../interfaces/TransitionElement.md)

#### Returns

`this`

***

### from()

> `static` **from**(`document`): `SCXMLModifier`

Defined in: [modifier.ts:23](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/modifier.ts#L23)

#### Parameters

##### document

[`SCXMLDocument`](../interfaces/SCXMLDocument.md)

#### Returns

`SCXMLModifier`
