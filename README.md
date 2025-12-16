# vue3-SmartTable v0.0.1 使用文档

## 概览

`SmartTable` 是一个 **基于 Vue 3 + Element Plus** 的高可复用表格组件，面向 **中后台系统** 场景设计，强调：

- 配置驱动（columns 即 schema）
- 权限解耦（不依赖 store / 登录体系）
- 操作列智能显示（无可见按钮 → 整列隐藏）
- 列显隐持久化（方案 A：只缓存 visible）
- 单元格渲染器体系（renderer 插件化）

---

## 目录结构

```txt
SmartTable/
├─ column/
│  ├─ index.vue            # TableColumn 子组件
│  └─ renderer.ts          # renderer 注册中心
├─ hooks/
│  ├─ useOperationColumn.ts # 操作列按钮可见性 / 宽度逻辑
│  └─ useTableColumns.ts    # 列显隐缓存（只缓存 visible）
├─ index.vue               # SmartTable 主组件
├─ types.ts                # ColumnConfig / ButtonConfig 类型
└─ README.md
```

---

## 1. SmartTable Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| data | `any[]` | `[]` | 表格数据 |
| columns | `ColumnConfig[]` | `[]` | 列配置（支持 v-model:columns） |
| rowKey | `string` | `'id'` | 行唯一 key |
| loading | `boolean` | `false` | loading 状态 |
| permissions | `string[]` | `[]` | 当前用户权限列表 |
| pageKey | `string` | - | 列缓存 pageKey（可选） |
| userId | `string \| number` | - | 列缓存 userId（可选） |

> 其余属性将 **透传给 el-table**。

---

## 2. ColumnConfig 列配置

```ts
export interface ColumnConfig<R = any> {
  type?: 'selection' | 'index' | 'operation'
  key?: string
  label?: string

  visible?: boolean
  inControl?: boolean

  render?: string
  editable?: boolean
  editType?: 'input' | 'number' | 'select'

  renderProps?: Record<string, any>
  columnProps?: Record<string, any>
  formatter?: (value: any, row: R) => any

  /** operation 专用 */
  buttons?: ButtonConfig<R>[]
  maxbtn?: number

  /** 内部字段（SmartTable 自动注入） */
  __rows?: R[]
}
```

### 设计约定

- `selection / index / operation` 为 **核心列**
- 核心列必须：`inControl = false`
- 普通列通过 `visible` 控制显示 / 隐藏

---

## 3. 操作列 ButtonConfig

```ts
export interface ButtonConfig<R = any> {
  permission?: string | string[]
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  action: (row: R) => void

  /** 行级可见性 */
  visible?: (row: R) => boolean

  /** 用于宽度计算 */
  width?: number
}
```

### 操作列显示规则

> **整个操作列是否显示 = 是否存在“至少一个行 + 至少一个按钮可见”**

- 按钮无权限 → 不显示
- `visible(row) === false` → 不显示
- **所有行所有按钮都不可见 → 整列隐藏**
- 避免出现「空白操作列」

---

## 4. 内置 Renderer

| renderer | 说明 |
| --- | --- |
| `html` | 原生 HTML（ellipsis） |
| `copy` | 可复制文本（hover 显示按钮 + ElMessage） |
| `img` | 图片预览 |
| `dict` | 字典映射 |
| `map` | key-value 映射 |
| `formatter` | 自定义格式化 |
| `editable` | 可编辑单元格（input / number / select） |
| `icon` | iconfont / svg / url |

### copy 示例

```ts
{
  key: 'username',
  label: '用户名',
  render: 'copy'
}
```

特性：
- hover 显示复制按钮
- 复制成功 / 失败统一使用 `ElMessage`

---
### img 示例
```ts
{
  key: 'avatar',
  label: '头像',
  render: 'img',
  renderProps: { style: 'width:50px;height:50px' }
}

```
- 支持图片预览
- 可传入 previewSrcList、fit、style 等 renderProps

### map 示例

```ts
const providerMap =  {
  aa: 'xxx',
  bb: 'xxxx',
  cc: 'xxxxxx'
}
{ 
  visible: true, 
  key: "status", 
  label: "状态", 
  render: "map",
  renderProps: {
    options: providerMap,
  },
  columnProps: { width: 80, sortable: true}
},

```
- 根据值映射显示文本
- 不匹配则显示空字符串

### dict 示例

```ts
const Enables = [
  { label: '启用', value: 1, listClass: 'primary' },
  { label: '禁用', value: 0, listClass: 'warning' }
]

{ 
  key: "status", 
  label: "状态", 
  visible: true, 
  render: "dict",
  renderProps: {
    options: Enables,
  },
  columnProps: { width: 80, sortable: true}
},
```
---
- 支持多选值
- 可通过 showValue 显示未匹配的值
- 可自定义 tag 类型（listClass）

### formatter 示例
```ts
{
  key: 'price',
  label: '价格',
  render: 'formatter',
  formatter: (val) => `$${val}`
}
```
- 使用自定义函数格式化显示内容

### editable 渲染器

```ts
{
  key: 'age',
  label: '年龄',
  render: 'editable',
  editable: true,
  editType: 'number',
  renderProps: { min: 0, max: 120 }
}
```
- 支持类型：input / number / select
- 支持事件：
  - cellChange(row, key) 值变化
  - cellBlur(row, key) 失去焦点
  - cellEnter(row, key) 回车事件（input）
### icon 示例
```ts
{
  key: 'icon',
  label: '图标',
  render: 'icon',
  renderProps: { style: 'color:red;font-size:24px' }
}
```
- 支持网络图片 URL
- 支持 svg 字符串
- 支持 iconfont class
## 5. useTableColumns（列显隐缓存）

### 设计原则

- ✅ **顺序永远以 defaultColumns 为准**
- ✅ **只缓存 visible**
- ❌ 不缓存 render / action / 函数
- ❌ 不侵入 store / 登录体系

```ts
const { columns } = useTableColumns(defaultColumns, {
  pageKey: 'user-list',
  userId: currentUserId
})
```

- `userId` / `pageKey` **由调用方决定**
- 不传则不启用缓存

---

## 6. 使用示例

```vue
<SmartTable
  :data="tableData"
  v-model:columns="columns"
  :permissions="userPermissions"
  :user-id="userId"
  page-key="user-list"
  @cellChange="onCellChange"
/>
```

## 7. 设计边界说明

- SmartTable **不关心权限系统如何实现**
- permission 只是 string 比对
- renderer 只负责 UI，不处理权限
- 操作列是否显示由 SmartTable 统一决策






