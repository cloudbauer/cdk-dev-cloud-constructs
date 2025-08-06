# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### GitlabConstruct <a name="GitlabConstruct" id="cdk-dev-cloud-constructs.GitlabConstruct"></a>

GitLab Helm Chart construct for Kubernetes on AWS.

#### Initializers <a name="Initializers" id="cdk-dev-cloud-constructs.GitlabConstruct.Initializer"></a>

```typescript
import { GitlabConstruct } from 'cdk-dev-cloud-constructs'

new GitlabConstruct(scope: Construct, id: string, props: GitlabProps)
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

##### `props`<sup>Required</sup> <a name="props" id="cdk-dev-cloud-constructs.GitlabConstruct.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-dev-cloud-constructs.GitlabProps">GitlabProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-dev-cloud-constructs.GitlabConstruct.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

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
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.property.chart">chart</a></code> | <code>aws-cdk-lib.aws_eks.HelmChart</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.property.cluster">cluster</a></code> | <code>aws-cdk-lib.aws_eks.ICluster</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.property.defaultValues">defaultValues</a></code> | <code>{[ key: string ]: any}</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.property.fqdn">fqdn</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.property.mergedValues">mergedValues</a></code> | <code>{[ key: string ]: any}</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.property.namespace">namespace</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.property.release">release</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.property.values">values</a></code> | <code>{[ key: string ]: any}</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.property.version">version</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabConstruct.property.yamlValues">yamlValues</a></code> | <code>{[ key: string ]: any}</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-dev-cloud-constructs.GitlabConstruct.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `chart`<sup>Required</sup> <a name="chart" id="cdk-dev-cloud-constructs.GitlabConstruct.property.chart"></a>

```typescript
public readonly chart: HelmChart;
```

- *Type:* aws-cdk-lib.aws_eks.HelmChart

---

##### `cluster`<sup>Required</sup> <a name="cluster" id="cdk-dev-cloud-constructs.GitlabConstruct.property.cluster"></a>

```typescript
public readonly cluster: ICluster;
```

- *Type:* aws-cdk-lib.aws_eks.ICluster

---

##### `defaultValues`<sup>Required</sup> <a name="defaultValues" id="cdk-dev-cloud-constructs.GitlabConstruct.property.defaultValues"></a>

```typescript
public readonly defaultValues: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="cdk-dev-cloud-constructs.GitlabConstruct.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---

##### `fqdn`<sup>Required</sup> <a name="fqdn" id="cdk-dev-cloud-constructs.GitlabConstruct.property.fqdn"></a>

```typescript
public readonly fqdn: string;
```

- *Type:* string

---

##### `mergedValues`<sup>Required</sup> <a name="mergedValues" id="cdk-dev-cloud-constructs.GitlabConstruct.property.mergedValues"></a>

```typescript
public readonly mergedValues: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

---

##### `name`<sup>Required</sup> <a name="name" id="cdk-dev-cloud-constructs.GitlabConstruct.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `namespace`<sup>Required</sup> <a name="namespace" id="cdk-dev-cloud-constructs.GitlabConstruct.property.namespace"></a>

```typescript
public readonly namespace: string;
```

- *Type:* string

---

##### `release`<sup>Required</sup> <a name="release" id="cdk-dev-cloud-constructs.GitlabConstruct.property.release"></a>

```typescript
public readonly release: string;
```

- *Type:* string

---

##### `values`<sup>Required</sup> <a name="values" id="cdk-dev-cloud-constructs.GitlabConstruct.property.values"></a>

```typescript
public readonly values: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

---

##### `version`<sup>Required</sup> <a name="version" id="cdk-dev-cloud-constructs.GitlabConstruct.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

---

##### `yamlValues`<sup>Required</sup> <a name="yamlValues" id="cdk-dev-cloud-constructs.GitlabConstruct.property.yamlValues"></a>

```typescript
public readonly yamlValues: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

---


## Structs <a name="Structs" id="Structs"></a>

### GitlabProps <a name="GitlabProps" id="cdk-dev-cloud-constructs.GitlabProps"></a>

Properties for the GitLab Helm Chart construct.

#### Initializer <a name="Initializer" id="cdk-dev-cloud-constructs.GitlabProps.Initializer"></a>

```typescript
import { GitlabProps } from 'cdk-dev-cloud-constructs'

const gitlabProps: GitlabProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-dev-cloud-constructs.GitlabProps.property.cluster">cluster</a></code> | <code>aws-cdk-lib.aws_eks.ICluster</code> | Gitlab full qualified domain name. |
| <code><a href="#cdk-dev-cloud-constructs.GitlabProps.property.chartName">chartName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabProps.property.chartVersion">chartVersion</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabProps.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabProps.property.namespace">namespace</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabProps.property.releaseName">releaseName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabProps.property.valuesOverride">valuesOverride</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#cdk-dev-cloud-constructs.GitlabProps.property.valuesYamlFile">valuesYamlFile</a></code> | <code>string</code> | *No description.* |

---

##### `cluster`<sup>Required</sup> <a name="cluster" id="cdk-dev-cloud-constructs.GitlabProps.property.cluster"></a>

```typescript
public readonly cluster: ICluster;
```

- *Type:* aws-cdk-lib.aws_eks.ICluster

Gitlab full qualified domain name.

---

##### `chartName`<sup>Optional</sup> <a name="chartName" id="cdk-dev-cloud-constructs.GitlabProps.property.chartName"></a>

```typescript
public readonly chartName: string;
```

- *Type:* string

---

##### `chartVersion`<sup>Optional</sup> <a name="chartVersion" id="cdk-dev-cloud-constructs.GitlabProps.property.chartVersion"></a>

```typescript
public readonly chartVersion: string;
```

- *Type:* string

---

##### `domainName`<sup>Optional</sup> <a name="domainName" id="cdk-dev-cloud-constructs.GitlabProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---

##### `namespace`<sup>Optional</sup> <a name="namespace" id="cdk-dev-cloud-constructs.GitlabProps.property.namespace"></a>

```typescript
public readonly namespace: string;
```

- *Type:* string

---

##### `releaseName`<sup>Optional</sup> <a name="releaseName" id="cdk-dev-cloud-constructs.GitlabProps.property.releaseName"></a>

```typescript
public readonly releaseName: string;
```

- *Type:* string

---

##### `valuesOverride`<sup>Optional</sup> <a name="valuesOverride" id="cdk-dev-cloud-constructs.GitlabProps.property.valuesOverride"></a>

```typescript
public readonly valuesOverride: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

##### `valuesYamlFile`<sup>Optional</sup> <a name="valuesYamlFile" id="cdk-dev-cloud-constructs.GitlabProps.property.valuesYamlFile"></a>

```typescript
public readonly valuesYamlFile: string;
```

- *Type:* string

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





