# Class: SCXMLModifier

Defined in: [modifier.ts:16](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L16)

API for programmatically modifying existing SCXML documents.

## Constructors

### Constructor

> **new SCXMLModifier**(`document`): `SCXMLModifier`

Defined in: [modifier.ts:19](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L19)

#### Parameters

##### document

[`SCXMLDocument`](../interfaces/SCXMLDocument.md)

#### Returns

`SCXMLModifier`

## Methods

### addDataToModel()

> **addDataToModel**(`data`): `this`

Defined in: [modifier.ts:208](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L208)

#### Parameters

##### data

[`DataElement`](../interfaces/DataElement.md)

#### Returns

`this`

***

### addInvokeToState()

> **addInvokeToState**(`stateId`, `invoke`): `this`

Defined in: [modifier.ts:191](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L191)

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

Defined in: [modifier.ts:171](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L171)

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

Defined in: [modifier.ts:181](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L181)

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

Defined in: [modifier.ts:46](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L46)

#### Parameters

##### state

[`StateElement`](../interfaces/StateElement.md)

#### Returns

`this`

***

### addTransitionToState()

> **addTransitionToState**(`stateId`, `transition`): `this`

Defined in: [modifier.ts:141](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L141)

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

Defined in: [modifier.ts:339](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L339)

#### Returns

`SCXMLModifier`

***

### findState()

> **findState**(`stateId`): `undefined` \| [`StateElement`](../interfaces/StateElement.md)

Defined in: [modifier.ts:105](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L105)

#### Parameters

##### stateId

`string`

#### Returns

`undefined` \| [`StateElement`](../interfaces/StateElement.md)

***

### getAllStateIds()

> **getAllStateIds**(): `string`[]

Defined in: [modifier.ts:317](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L317)

#### Returns

`string`[]

***

### getDocument()

> **getDocument**(): [`SCXMLDocument`](../interfaces/SCXMLDocument.md)

Defined in: [modifier.ts:27](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L27)

#### Returns

[`SCXMLDocument`](../interfaces/SCXMLDocument.md)

***

### removeDataFromModel()

> **removeDataFromModel**(`dataId`): `this`

Defined in: [modifier.ts:228](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L228)

#### Parameters

##### dataId

`string`

#### Returns

`this`

***

### removeState()

> **removeState**(`stateId`): `this`

Defined in: [modifier.ts:54](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L54)

#### Parameters

##### stateId

`string`

#### Returns

`this`

***

### removeTransitionFromState()

> **removeTransitionFromState**(`stateId`, `predicate`): `this`

Defined in: [modifier.ts:151](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L151)

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

Defined in: [modifier.ts:235](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L235)

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

Defined in: [modifier.ts:41](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L41)

#### Parameters

##### datamodel

`string`

#### Returns

`this`

***

### setInitial()

> **setInitial**(`initial`): `this`

Defined in: [modifier.ts:36](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L36)

#### Parameters

##### initial

`string`

#### Returns

`this`

***

### setName()

> **setName**(`name`): `this`

Defined in: [modifier.ts:31](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L31)

#### Parameters

##### name

`string`

#### Returns

`this`

***

### setStateDataModel()

> **setStateDataModel**(`stateId`, `dataModel`): `this`

Defined in: [modifier.ts:201](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L201)

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

Defined in: [modifier.ts:219](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L219)

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

Defined in: [modifier.ts:71](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L71)

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

Defined in: [modifier.ts:160](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L160)

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

Defined in: [modifier.ts:23](https://github.com/caweinshenker/sxcml-js/blob/957847bdc6405b8502a575517be9bde5a1c195dc/src/modifier.ts#L23)

#### Parameters

##### document

[`SCXMLDocument`](../interfaces/SCXMLDocument.md)

#### Returns

`SCXMLModifier`
