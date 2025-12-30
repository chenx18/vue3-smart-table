# Vue3 Smart Table

基于 Vue 3 + Element Plus 的智能表格组件，通过配置快速生成功能丰富的数据表格。

## 特性

- 🎯 **统一的 type 配置** - 一个 `type` 字段搞定列类型和渲染方式
- 📦 **内置 12+ 渲染器** - input、select、dict、img、copy 等开箱即用
- 🔌 **可扩展** - 支持自定义渲染器和插槽
- 🔐 **权限控制** - 操作列按钮级别权限 + 行级可见性
- 💾 **列配置缓存** - 自动持久化用户的列显隐设置
- 📝 **TypeScript** - 完整的类型定义

## 安装

```bash
npm install vue3-smart-table
```

## 快速开始

```vue
<template>
  <SmartTable :data="tableData" :columns="columns" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SmartTable } from 'vue3-smart-table'

const columns = ref([
  { type: 'index', key: 'index', label: '序号' },
  { key: 'name', label: '姓名' },
  { type: 'dict', key: 'status', label: '状态', props: { options: [
    { label: '启用', value: 1, listClass: 'success' },
    { label: '禁用', value: 0, listClass: 'danger' }
  ]}},
  { type: 'operation', key: 'action', label: '操作', buttons: [
    { label: '编辑', type: 'primary', action: (row) => console.log(row) }
  ]}
])

const tableData = ref([
  { id: 1, name: '张三', status: 1 },
  { id: 2, name: '李四', status: 0 }
])
</script>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| data | `any[]` | `[]` | 表格数据 |
| columns | `ColumnConfig[]` | `[]` | 列配置，支持 `v-model:columns` |
| rowKey | `string` | `'id'` | 行唯一标识字段 |
| loading | `boolean` | `false` | 加载状态 |
| permissions | `string[]` | `[]` | 权限列表，用于操作列按钮控制 |
| cacheKey | `string` | - | 列配置缓存 key |
| pagination | `{ page, size }` | - | 分页配置，用于序号计算 |

> 其他属性透传给 `el-table`

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| cellChange | `(row, col)` | 单元格值变更（input/select 等） |
| cellBlur | `(row, col)` | 单元格失焦 |
| cellEnter | `(row, col)` | 单元格回车 |
| cellClick | `(row, col)` | 单元格点击（button 类型） |

## 列配置

### 基础结构

```ts
interface ColumnConfig {
  type?: string           // 列类型/渲染器类型
  key: string             // 字段名
  label?: string          // 列标题
  visible?: boolean       // 是否显示，默认 true
  props?: object          // 渲染器属性
  columnProps?: object    // el-table-column 属性
  
  // operation 列专用
  buttons?: ButtonConfig[]
  
  // formatter 类型专用
  formatter?: (value, row, index) => any
}
```

### 列类型

#### 特殊列

```ts
// 多选列
{ type: 'selection', key: 'selection' }

// 序号列
{ type: 'index', key: 'index', label: '序号' }

// 操作列
{ 
  type: 'operation', 
  key: 'action', 
  label: '操作',
  buttons: [
    { label: '编辑', type: 'primary', permission: 'edit', action: (row) => {} },
    { label: '删除', type: 'danger', action: (row) => {}, visible: (row) => row.id !== 1 }
  ]
}
```

#### 渲染器类型

| type | 说明 | props |
|------|------|-------|
| `input` | 可编辑输入框 | `placeholder`, `clearable`, `maxlength`, `onChange`, `onBlur`, `onEnter` 等 |
| `input-number` | 可编辑数字框 | `min`, `max`, `step`, `precision`, `onChange`, `onBlur` 等 |
| `select` | 可编辑下拉框 | `options`, `filterable`, `onChange`, `onVisibleChange`, `onClear` 等 |
| `dict` | 字典标签 | `options: [{label, value, listClass}]`, `showValue` |
| `map` | 键值映射 | `options: {key: value}` |
| `img` | 图片预览 | `width`, `height`, `fit`, `placeholder` |
| `copy` | 可复制文本 | `iconColor`, `successText`, `lineClamp` |
| `link` | 链接 | `href`, `label`, `blank` |
| `button` | 按钮 | `label`, `type`, `onClick` |
| `html` | HTML 内容 | `style`, `class` |
| `formatter` | 自定义格式化 | 配合 `formatter` 函数使用 |
| `icon` | 图标（支持 iconfont/svg/url） | `size`, `style` |
| `slot` | 插槽 | `slot`（插槽名，默认用 key） |

> 所有渲染器的 `props` 支持透传 Element Plus 原生属性和事件

### 示例

```ts
const columns = [
  // 特殊列
  { type: 'selection', key: 'selection' },
  { type: 'index', key: 'index', label: '序号', columnProps: { width: 60 } },
  
  // 默认文本
  { key: 'name', label: '姓名' },
  
  // 可编辑
  { type: 'input', key: 'username', label: '用户名', props: { placeholder: '请输入' } },
  { type: 'select', key: 'role', label: '角色', props: { 
    options: [{ label: '管理员', value: 'admin' }, { label: '用户', value: 'user' }]
  }},
  
  // 字典映射
  { type: 'dict', key: 'status', label: '状态', props: {
    options: [
      { label: '启用', value: 1, listClass: 'success' },
      { label: '禁用', value: 0, listClass: 'danger' }
    ]
  }},
  
  // 图片
  { type: 'img', key: 'avatar', label: '头像', props: { width: 60, height: 60 } },
  
  // 可复制
  { type: 'copy', key: 'code', label: '编号', props: { successText: '已复制' } },
  
  // 自定义格式化
  { type: 'formatter', key: 'price', label: '价格', formatter: (val) => `¥${val.toFixed(2)}` },
  
  // 插槽
  { type: 'slot', key: 'custom', label: '自定义' },
  
  // 操作列
  { type: 'operation', key: 'action', label: '操作', buttons: [...] }
]
```

## props 事件回调

可编辑渲染器（input、input-number、select）支持在 `props` 中直接配置事件回调，适合将 columns 配置抽离到独立 ts 文件：

```ts
// columns.ts - 配置与逻辑内聚
import { ElMessage } from 'element-plus'
import type { ColumnConfig } from 'vue3-smart-table'

export const columns: ColumnConfig[] = [
  {
    type: 'input',
    key: 'name',
    label: '姓名',
    props: {
      placeholder: '请输入姓名',
      maxlength: 20,
      // 事件回调 - 参数: (value, row, col)
      onChange: (val, row, col) => {
        console.log(`${col.key} 变更为: ${val}`)
      },
      onBlur: (e, row, col) => {
        if (!row.name) ElMessage.warning('姓名不能为空')
      },
      onEnter: (e, row, col) => {
        console.log('回车提交')
      }
    }
  },
  {
    type: 'input-number',
    key: 'price',
    label: '价格',
    props: {
      min: 0,
      max: 99999,
      precision: 2,
      onChange: (val, oldVal, row, col) => {
        console.log(`价格从 ${oldVal} 改为 ${val}`)
      }
    }
  },
  {
    type: 'select',
    key: 'status',
    label: '状态',
    props: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ],
      onChange: (val, row, col) => {
        // 可以调用 API 更新状态
        updateStatus(row.id, val)
      },
      onVisibleChange: (visible, row, col) => {
        if (visible) console.log('下拉框展开')
      }
    }
  },
  {
    type: 'button',
    key: 'action',
    label: '操作',
    props: {
      label: '详情',
      type: 'primary',
      onClick: (e, row, col) => {
        router.push(`/detail/${row.id}`)
      }
    }
  }
]
```

```vue
<!-- Page.vue - 模板简洁 -->
<template>
  <SmartTable :data="tableData" :columns="columns" />
</template>

<script setup>
import { columns } from './columns'
</script>
```

### 事件触发顺序

当同时配置 `props.onChange` 和 `@cell-change` 时，两者都会触发：

1. 先执行 `props.onChange`（列级回调）
2. 再触发 `@cell-change`（组件级事件）

```vue
<SmartTable 
  :columns="columns" 
  @cell-change="onCellChange"  <!-- 统一处理，如日志/埋点 -->
/>
```

### 支持的事件

| 渲染器 | 支持的事件 |
|--------|-----------|
| `input` | `onChange`, `onBlur`, `onFocus`, `onInput`, `onClear`, `onEnter` |
| `input-number` | `onChange`, `onBlur`, `onFocus`, `onEnter` |
| `select` | `onChange`, `onBlur`, `onFocus`, `onVisibleChange`, `onClear` |
| `button` | `onClick` |

## 插槽

```vue
<SmartTable :data="data" :columns="columns">
  <!-- 插槽名 = key 或 slot 属性值 -->
  <template #custom="{ row, $index }">
    <el-tag>{{ row.name }}</el-tag>
  </template>
</SmartTable>
```

## 自定义渲染器

```ts
import { getRendererManager, createFunctionalRenderer } from 'vue3-smart-table'
import { h } from 'vue'

// 创建渲染器
const statusBadge = createFunctionalRenderer((props) => {
  const val = props.row[props.col.key]
  return h('span', {
    style: { color: val === 1 ? 'green' : 'red' }
  }, val === 1 ? '✓ 启用' : '✗ 禁用')
})

// 注册
getRendererManager().register('status-badge', statusBadge)

// 使用
const columns = [
  { type: 'status-badge', key: 'status', label: '状态' }
]
```

## 操作列权限

```ts
const columns = [
  {
    type: 'operation',
    key: 'action',
    buttons: [
      { 
        label: '编辑', 
        permission: 'user:edit',  // 需要此权限
        action: (row) => {} 
      },
      { 
        label: '删除', 
        permission: ['user:delete', 'admin'],  // 任一权限即可
        visible: (row) => row.status !== 1,    // 行级控制
        action: (row) => {} 
      }
    ]
  }
]

// 传入用户权限
<SmartTable :permissions="['user:edit', 'user:view']" />
```

## 列配置缓存

```vue
<!-- 提供 cacheKey 自动缓存列显隐配置 -->
<SmartTable 
  :columns="columns" 
  cacheKey="my-table-columns" 
/>
```

## TypeScript

```ts
import type { ColumnConfig, ButtonConfig } from 'vue3-smart-table'

interface User {
  id: number
  name: string
  status: number
}

const columns: ColumnConfig<User>[] = [
  { key: 'name', label: '姓名' },
  { type: 'dict', key: 'status', label: '状态', props: { options: [...] } }
]
```

## License

MIT
