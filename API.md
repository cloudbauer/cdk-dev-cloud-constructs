# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### GitlabConstruct <a name="GitlabConstruct" id="cdk-dev-cloud-constructs.GitlabConstruct"></a>

VSCodeServer - spin it up in under 10 minutes.

#### Initializers <a name="Initializers" id="cdk-dev-cloud-constructs.GitlabConstruct.Initializer"></a>

```typescript
import { GitlabConstruct } from 'cdk-dev-cloud-constructs'

new GitlabConstruct(scope: Construct, id: string, props?: GitlabProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-dev-cloud-constructs.GitlabProps">GitlabProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-dev-cloud-constructs.GitlabConstruct.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-dev-cloud-constructs.GitlabConstruct.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-dev-cloud-constructs.GitlabConstruct.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-dev-cloud-constructs.GitlabProps">GitlabProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.domain">domain</a></code> | *No description.* |

---

##### `toString` <a name="toString" id="cdk-dev-cloud-constructs.GitlabConstruct.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `domain` <a name="domain" id="cdk-dev-cloud-constructs.GitlabConstruct.domain"></a>

```typescript
public domain(): string
```

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="cdk-dev-cloud-constructs.GitlabConstruct.isConstruct"></a>

```typescript
import { GitlabConstruct } from 'cdk-dev-cloud-constructs'

GitlabConstruct.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="cdk-dev-cloud-constructs.GitlabConstruct.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-dev-cloud-constructs.GitlabConstruct.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="cdk-dev-cloud-constructs.GitlabConstruct.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---


## Structs <a name="Structs" id="Structs"></a>

### GitlabProps <a name="GitlabProps" id="cdk-dev-cloud-constructs.GitlabProps"></a>

Properties for the Gitlab construct.

#### Initializer <a name="Initializer" id="cdk-dev-cloud-constructs.GitlabProps.Initializer"></a>

```typescript
import { GitlabProps } from 'cdk-dev-cloud-constructs'

const gitlabProps: GitlabProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-dev-cloud-constructs.GitlabProps.property.domainName">domainName</a></code> | <code>string</code> | Gitlab full qualified domain name. |

---

##### `domainName`<sup>Optional</sup> <a name="domainName" id="cdk-dev-cloud-constructs.GitlabProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

Gitlab full qualified domain name.

---

## Classes <a name="Classes" id="Classes"></a>

### Hello <a name="Hello" id="cdk-dev-cloud-constructs.Hello"></a>

#### Initializers <a name="Initializers" id="cdk-dev-cloud-constructs.Hello.Initializer"></a>

```typescript
import { Hello } from 'cdk-dev-cloud-constructs'

new Hello()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-dev-cloud-constructs.Hello.sayHello">sayHello</a></code> | *No description.* |

---

##### `sayHello` <a name="sayHello" id="cdk-dev-cloud-constructs.Hello.sayHello"></a>

```typescript
public sayHello(): string
```





