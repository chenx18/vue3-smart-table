# Vue3 Smart Table

> 基于 Vue 3 + Element Plus 的高可复用表格组件库 - 插件化架构，支持自定义渲染器

## 特性

- **插件化架构** - 支持自定义渲染器，灵活扩展
- **开箱即用** - 内置 12+ 种常用渲染器
- **类型安全** - 完整的 TypeScript 类型支持
- **主题定制** - 使用 CSS 变量，轻松定制主题
- **按需引入** - Tree-shaking 友好，减小打包体积
- **性能优化** - 列配置缓存、虚拟滚动支持
- **简单易用** - 专注于表格功能，不侵入数据管理

## 安装

```bash
npm install vue3-smart-table
# or
yarn add vue3-smart-table
# or
pnpm add vue3-smart-table
```

## 快速开始

### 1️⃣ 安装依赖

SmartTable 依赖 Element Plus，需要先安装：

```bash
# 安装 SmartTable
npm install vue3-smart-table

# 安装 Element Plus（如果还没安装）
npm install element-plus
```

### 2️⃣ 完整引入

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

// 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 引入 SmartTable
import SmartTable from 'vue3-smart-table'
import 'vue3-smart-table/dist/style.css'

const app = createApp(App)
app.use(ElementPlus)
app.use(SmartTable)
app.mount('#app')
```

### 3️⃣ 基础使用

```vue
<template>
  <SmartTable :columns="columns" :data="tableData" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 表格列配置
const columns = [
  { key: 'name', label: '姓名', width: 120 },
  { key: 'age', label: '年龄', width: 80 },
  { key: 'email', label: '邮箱' }
]

// 表格数据
const tableData = ref([
  { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
  { id: 2, name: '李四', age: 30, email: 'lisi@example.com' },
  { id: 3, name: '王五', age: 28, email: 'wangwu@example.com' }
])
</script>
```

### 4️⃣ 按需引入（推荐）

如果你只需要在特定页面使用：

```vue
<template>
  <SmartTable :columns="columns" :data="tableData" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SmartTable } from 'vue3-smart-table'
// 确保在 main.ts 中已经全局引入了样式
</script>
```

### 5️⃣ 完整示例（带加载状态和分页）

```vue
<template>
  <div>
    <SmartTable
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :pagination="{ page: 1, size: 10, total: total }"
    />

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SmartTable } from 'vue3-smart-table'

const columns = [
  { key: 'name', label: '姓名' },
  { key: 'age', label: '年龄' },
  { key: 'email', label: '邮箱' }
]

const tableData = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 模拟数据获取
const fetchData = async () => {
  loading.value = true
  try {
    // 实际项目中替换为你的 API 调用
    const response = await fetch(`/api/users?page=${currentPage.value}&size=${pageSize.value}`)
    const result = await response.json()
    tableData.value = result.data
    total.value = result.total
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>
```

---

## 目录结构

```txt
src/
├─ components/SmartTable/    # 主组件（完全自包含）
│  ├─ hooks/                 # 组件内部 Hooks（不对外暴露）
│  ├─ renderers/             # 内置渲染器
│  ├─ renderer.ts            # 渲染器管理器
│  ├─ config.ts              # 全局配置管理
│  ├─ utils/                 # 内部工具函数
│  ├─ types.ts               # 类型定义
│  └─ index.vue              # SmartTable 主组件
├─ types/                    # 类型工具（对外提供）
└─ index.ts                  # 入口文件
```

**架构优势**：
- ✅ SmartTable 组件完全自包含
- ✅ utils 和 styles 在组件内部
- ✅ 无外部依赖，易于移植和维护
- ✅ 清晰的内部和外部边界

---

## 核心概念

### 📦 SmartTable 是什么？

SmartTable 是一个**完全自包含的表格组件**，专注于表格渲染和交互功能。它：

- ✅ **不侵入你的数据管理** - 你可以用任何方式管理数据（ref、computed、VueUse 等）
- ✅ **专注于表格功能** - 渲染、编辑、排序、筛选等表格特有的功能
- ✅ **高度可定制** - 通过渲染器系统扩展任何自定义单元格

### 🎯 设计理念

与传统表格库不同，SmartTable 遵循以下理念：

```typescript
// ❌ 传统方式：强制使用组件的数据管理
import { useTable } from 'some-table-lib'  // 被迫使用特定的数据管理方案
const { data, loading, refresh } = useTable(...)

// ✅ SmartTable：你自己管理数据
import { ref } from 'vue'  // 使用你熟悉的方式
const data = ref([])
const loading = ref(false)
// 完全的控制权！
```

**为什么这样做？**

1. **灵活性** - 不同项目有不同的数据管理需求
2. **简单性** - 不需要学习特定的数据管理 API
3. **兼容性** - 可以与任何状态管理方案配合使用
4. **标准性** - 符合 Vue 生态的最佳实践

---



### 1. 插件化架构

支持动态注册自定义渲染器:

```typescript
import { getRendererManager, createFunctionalRenderer } from 'vue3-smart-table'
import { h } from 'vue'

// 创建自定义渲染器
const myRenderer = createFunctionalRenderer((props) => {
  const val = props.row[props.col.key]
  return h('span', { class: 'custom-renderer' }, `前缀: ${val}`)
})

// 注册渲染器
getRendererManager().register('my-renderer', myRenderer)

// 使用
const columns = [
  { key: 'name', render: 'my-renderer' }
]
```

### 2. 全局配置

```typescript
import { setSmartTableConfig } from 'vue3-smart-table'

setSmartTableConfig({
  defaultPagination: {
    page: 1,
    size: 20
  },
  renderers: {
    // 全局注册自定义渲染器
    'custom-renderer': MyRendererComponent
  }
})
```

---

## API 文档

### SmartTable Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| data | `any[]` | `[]` | 必需 - 表格数据 |
| columns | `ColumnConfig[]` | `[]` |必需 - 列配置数组，支持 v-model:columns 双向绑定|
| rowKey | `string` | `'id'` | 行数据的唯一标识字段 |
| loading | `boolean` | `false` | 加载状态，显示加载动画 |
| permissions | `string[]` | `[]` | 当前用户权限列表，用于操作列权限控制 |
| cacheKey | `string` | - | **列缓存键（推荐）**，如果提供则直接使用，格式：`table_columns_{userId}_{pageKey}` 或自定义 |
| pagination | `{page: number, size: number}` | - | 序号列计算序号（可选），page:当前页，size:当前页显示条数，不填则默认序号 |

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
  slot?: string   // render为slot时可自定slot否则使用key

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
- 可通过 render 使用内置 renderer 或自定义插槽

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

## 4. 内置渲染器完整指南

SmartTable 提供 13 种内置渲染器，按功能分为 4 类：

- **📝 展示型** (7种)：html、copy、img、dict、map、formatter、icon
- **✏️ 编辑型** (3种)：input、input-number、select
- **🔘 操作型** (2种)：button、link
- **🔧 扩展型** (1种)：slot

### 快速查找表

| 渲染器 | 类型 | 配置复杂度 | 支持事件 |
|--------|------|-----------|---------|
| `html` | 展示 | ⭐ | ❌ |
| `copy` | 展示 | ⭐⭐ | ❌ |
| `img` | 展示 | ⭐⭐ | ❌ |
| `dict` | 展示 | ⭐⭐⭐ | ❌ |
| `map` | 展示 | ⭐⭐ | ❌ |
| `formatter` | 展示 | ⭐⭐ | ❌ |
| `icon` | 展示 | ⭐⭐ | ❌ |
| `input` | 编辑 | ⭐⭐ | ✅ |
| `input-number` | 编辑 | ⭐⭐ | ✅ |
| `select` | 编辑 | ⭐⭐ | ✅ |
| `button` | 操作 | ⭐ | ✅ |
| `link` | 操作 | ⭐ | ✅ |
| `slot` | 扩展 | ⭐⭐⭐⭐ | ❌ |

---

### 📝 展示型渲染器

用于数据展示，不涉及用户交互。

#### 1. `html` - HTML 内容渲染

**功能**：渲染 HTML 内容，支持多行文本截断（最多 2 行）。

**配置**：
```typescript
{
  key: 'description',
  label: '描述',
  render: 'html',
  renderProps: {
    style?: string   // 自定义样式
    class?: string   // 自定义类名
  }
}
```

**示例**：
```typescript
const columns = [
  {
    key: 'content',
    label: '商品描述',
    render: 'html'
  }
]

const tableData = [
  {
    content: '<p>这是一段<strong>加粗</strong>的文本</p>'
  }
]
```

**效果**：
- 自动截断为 2 行
- 支持富文本 HTML
- 超出部分显示省略号

---

#### 2. `copy` - 可复制文本

**功能**：hover 显示复制按钮，点击复制文本到剪贴板。

**配置**：
```typescript
{
  key: 'code',
  label: '编号',
  render: 'copy',
  renderProps: {
    iconColor?: string        // 图标颜色，默认 '#409EFF'
    copyTitle?: string        // 复制提示文本，默认 '复制'
    successText?: string      // 成功提示，默认 '复制成功'
    errorText?: string        // 失败提示，默认 '复制失败'
    lineClamp?: 2              // 默认显示2行，超出省略
    textStyles?: object        // 文本样式 {fontSize: '12px'}
    textClass?: string         // 文本类名 
  }
}
```

**示例**：
```typescript
const columns = [
  {
    key: 'orderNo',
    label: '订单号',
    render: 'copy',
    renderProps: {
      iconColor: '#67C23A',
      successText: '订单号已复制',
      errorText: '复制失败，请重试'
    }
  }
]
```

**效果**：
- hover 显示复制按钮图标
- 点击自动复制到剪贴板
- 使用 ElMessage 提示结果
- 支持单行文本截断

---

#### 3. `img` - 图片预览

**功能**：图片展示，支持单图/多图预览。

**配置**：
```typescript
{
  key: 'avatar',
  label: '头像',
  render: 'img',
  renderProps: {
    width?: string | number           // 图片宽度，默认 '80px'
    height?: string | number          // 图片高度，默认 '80px'
    fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'  // 适应方式
    previewSrcList?: string[]         // 预览图片列表（可选）
    placeholder?: string              // 无图片时的占位文本
    style?: string                    // 自定义样式
    ...                               // el-Image属性都支持
  }
}
```

**示例 - 单图**：
```typescript
const columns = [
  {
    key: 'avatar',
    label: '头像',
    render: 'img',
    renderProps: {
      width: '60px',
      height: '60px',
      fit: 'cover'
    }
  }
]

const tableData = [
  { avatar: 'https://example.com/avatar.jpg' }
]
```

**示例 - 多图**：
```typescript
const columns = [
  {
    key: 'gallery',
    label: '相册',
    render: 'img',
    renderProps: {
      width: '80px',
      height: '80px'
    }
  }
]

const tableData = [
  {
    gallery: [
      'https://example.com/img1.jpg',
      'https://example.com/img2.jpg',
      'https://example.com/img3.jpg'
    ]
  }
]
```

**效果**：
- **单图**：直接显示，点击预览
- **多图**：显示第一张 + 数量标记（如：+2），点击预览全部
- 支持 Element Plus Image 的所有预览功能
- 无图片时显示占位符或空内容

---

#### 4. `dict` - 字典标签映射

**功能**：将值映射为标签显示（使用 ElTag）。

**配置**：
```typescript
{
  key: 'status',
  label: '状态',
  render: 'dict',
  renderProps: {
    options: Array<{           // 字典配置（必需）
      label: string            // 显示文本
      value: any               // 值
      listClass?: string       // ElTag 类型：'primary' | 'success' | 'warning' | 'danger' | 'info'
      cssClass?: string        // 自定义类名
    }>
    showValue?: boolean        // 是否显示未匹配的值，默认 false
  }
}
```

**示例 - 单值**：
```typescript
const columns = [
  {
    key: 'status',
    label: '状态',
    render: 'dict',
    renderProps: {
      options: [
        { label: '启用', value: 1, listClass: 'success' },
        { label: '禁用', value: 0, listClass: 'danger' },
        { label: '审核中', value: 2, listClass: 'warning' }
      ]
    }
  }
]

const tableData = [
  { status: 1 }  // 显示：[启用]
]
```

**示例 - 多值**：
```typescript
const columns = [
  {
    key: 'tags',
    label: '标签',
    render: 'dict',
    renderProps: {
      options: [
        { label: '重要', value: 'important', listClass: 'danger' },
        { label: '紧急', value: 'urgent', listClass: 'warning' }
      ],
      showValue: true  // 显示未匹配的值
    }
  }
]

const tableData = [
  { tags: ['important', 'urgent'] }  // 显示：[重要] [紧急]
]
```

**效果**：
- 单值映射为单个标签
- 多值映射为多个标签
- 未匹配的值根据 `showValue` 决定是否显示
- 支持自定义标签颜色和样式

---

#### 5. `map` - 键值映射

**功能**：简单的 key-value 映射。

**配置**：
```typescript
{
  key: 'gender',
  label: '性别',
  render: 'map',
  renderProps: {
    options: Record<string | number, any>  // 映射配置（必需）
  }
}
```

**示例**：
```typescript
const columns = [
  {
    key: 'gender',
    label: '性别',
    render: 'map',
    renderProps: {
      options: {
        1: '男',
        2: '女',
        0: '未知'
      }
    }
  }
]

const tableData = [
  { gender: 1 },  // 显示：男
  { gender: 2 },  // 显示：女
  { gender: 99 }  // 显示：(空)
]
```

**效果**：
- 根据值映射显示对应文本
- 未匹配的值显示空字符串
- 比 `dict` 更简单，适合不需要标签样式的场景

---

#### 6. `formatter` - 自定义格式化

**功能**：使用自定义函数格式化显示。

**配置**：
```typescript
{
  key: 'price',
  label: '价格',
  render: 'formatter',
  formatter: (value: any, row: any) => string  // 格式化函数
}
```

**示例**：
```typescript
const columns = [
  {
    key: 'price',
    label: '价格',
    render: 'formatter',
    formatter: (value, row) => {
      return `¥${Number(value).toFixed(2)}`
    }
  },
  {
    key: 'date',
    label: '日期',
    render: 'formatter',
    formatter: (value) => {
      return new Date(value).toLocaleDateString('zh-CN')
    }
  }
]

const tableData = [
  { price: 99.9, date: '2024-01-01' }
]
```

**效果**：
- 完全自定义格式化逻辑
- 可以访问当前行数据
- 适合复杂的格式化需求

---

#### 7. `icon` - 图标渲染

**功能**：支持多种图标格式。

**配置**：
```typescript
{
  key: 'icon',
  label: '图标',
  render: 'icon',
  renderProps: {
    style?: string  // 自定义样式
    size?: number   // 图标大小（像素）
    class?: string  // 自定义类名
  }
}
```

**示例**：
```typescript
const columns = [
  {
    key: 'avatarIcon',
    label: '头像',
    render: 'icon',
    renderProps: {
      style: 'font-size: 32px; color: #409EFF'
    }
  }
]

const tableData = [
  // 1. 网络图片
  { icon: 'https://example.com/icon.png' },

  // 2. SVG 源码
  { icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">...</svg>' },

  // 3. iconfont 类名
  { icon: 'iconfont icon-user' }
]
```

**效果**：
- 自动识别图标类型
- 网络图片：显示为 ElImage
- SVG：直接渲染
- iconfont：应用类名样式

---

### ✏️ 编辑型渲染器

支持单元格编辑，触发 `cellChange`、`cellBlur`、`cellEnter` 事件。

#### 8. `input` - 可编辑输入框

**配置**：
```typescript
{
  key: 'username',
  label: '用户名',
  render: 'input',
  renderProps: {
    placeholder?: string   // 占位文本，默认 ''
    size?: 'large' | 'default' | 'small'  // 尺寸，默认 'small'
    clearable?: boolean   // 是否可清空，默认 true
    // ... 其他 ElInput 属性
  }
}
```

**示例**：
```typescript
const columns = [
  {
    key: 'username',
    label: '用户名',
    render: 'input',
    renderProps: {
      placeholder: '请输入用户名',
      clearable: true
    }
  }
]
```

**事件处理**：
```vue
<script setup>
const handleCellChange = (row, col) => {
  console.log('值已修改:', row[col.key])
}

const handleCellBlur = (row, col) => {
  console.log('失去焦点')
}

const handleCellEnter = (row, col) => {
  console.log('回车确认')
}
</script>

<template>
  <SmartTable
    :columns="columns"
    :data="tableData"
    @cellChange="handleCellChange"
    @cellBlur="handleCellBlur"
    @cellEnter="handleCellEnter"
  />
</template>
```

---

#### 9. `input-number` - 可编辑数字输入框

**配置**：
```typescript
{
  key: 'age',
  label: '年龄',
  render: 'input-number',
  renderProps: {
    min?: number          // 最小值
    max?: number          // 最大值
    step?: number         // 步长
    precision?: number    // 精度
    size?: 'large' | 'default' | 'small'
    controls?: boolean    // 是否显示增减按钮
    // ... 其他 ElInputNumber 属性
  }
}
```

**示例**：
```typescript
const columns = [
  {
    key: 'orderNum',
    label: '序号',
    render: 'input-number',
    renderProps: {
      min: 0,
      max: 100,
      step: 1,
      controls: false  // 隐藏增减按钮
    }
  }
]
```

---

#### 10. `select` - 可编辑下拉选择

**配置**：
```typescript
{
  key: 'status',
  label: '状态',
  render: 'select',
  renderProps: {
    options: Array<{           // 选项配置（必需）
      label: string
      value: any
    }>
    placeholder?: string       // 占位文本，默认 '请选择'
    size?: 'large' | 'default' | 'small'
    clearable?: boolean        // 是否可清空
    // ... 其他 ElSelect 属性
  }
}
```

**示例**：
```typescript
const columns = [
  {
    key: 'role',
    label: '角色',
    render: 'select',
    renderProps: {
      placeholder: '请选择角色',
      clearable: true,
      options: [
        { label: '管理员', value: 'admin' },
        { label: '普通用户', value: 'user' },
        { label: '访客', value: 'guest' }
      ]
    }
  }
]
```

---

### 🔘 操作型渲染器

用于触发操作或跳转。

#### 11. `button` - 操作按钮

**配置**：
```typescript
{
  key: 'action',
  label: '操作',
  render: 'button',
  renderProps: {
    label?: string        // 按钮文本
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
    size?: 'large' | 'default' | 'small'
    disabled?: boolean
    // ... 其他 ElButton 属性
  }
}
```

**示例**：
```typescript
const columns = [
  {
    key: 'edit',
    label: '编辑',
    render: 'button',
    renderProps: {
      label: '编辑',
      type: 'primary',
      size: 'small'
    }
  }
]
```

**事件处理**：
```vue
<script setup>
const handleCellClick = (row, col) => {
  if (col.key === 'edit') {
    console.log('编辑行:', row)
  }
}
</script>

<template>
  <SmartTable
    :columns="columns"
    :data="tableData"
    @cellClick="handleCellClick"
  />
</template>
```

---

#### 12. `link` - 链接

**配置**：
```typescript
{
  key: 'detail',
  label: '详情',
  render: 'link',
  renderProps: {
    label?: string        // 链接文本
    href: string          // 链接地址（必需）
    blank?: boolean       // 是否新窗口打开，默认 false
    style?: string        // 自定义样式
  }
}
```

**示例**：
```typescript
const columns = [
  {
    key: 'url',
    label: '查看',
    render: 'link',
    renderProps: {
      label: '查看详情',
      href: 'https://example.com',
      blank: true,
      style: 'color: #409EFF'
    }
  }
]
```

---

### 🔧 扩展型渲染器

用于自定义复杂场景。

#### 13. `slot` - 自定义插槽

**功能**：使用 Vue 插槽完全自定义列内容。

**配置**：
```typescript
{
  key: 'attachments',
  label: '附件',
  render: 'slot',
  slot?: string  // 插槽名称，默认使用 key
}
```

**示例**：
```vue
<script setup>
const columns = [
  {
    key: 'attachments',
    label: '附件列表',
    render: 'slot',
    slot: 'attachments'
  }
]

const tableData = ref([
  {
    id: 1,
    attachments: [
      { name: 'file1.pdf', url: '/files/file1.pdf' },
      { name: 'file2.jpg', url: '/files/file2.jpg' }
    ]
  }
])

const download = (url) => {
  console.log('下载:', url)
}
</script>

<template>
  <SmartTable :columns="columns" :data="tableData">
    <template #attachments="{ row }">
      <div v-for="(file, index) in row.attachments" :key="index">
        <el-button type="text" @click="download(file.url)">
          {{ file.name }}
        </el-button>
      </div>
    </template>
  </SmartTable>
</template>
```

**效果**：
- 完全自定义列内容
- 访问完整的行数据
- 可以包含复杂的交互逻辑

---

### TypeScript 类型支持

所有渲染器的 `renderProps` 都有完整的 TypeScript 类型定义：

```typescript
import type { ColumnConfig, RendererPropsMap } from 'vue3-smart-table'

// 类型安全
const column: ColumnConfig = {
  key: 'status',
  label: '状态',
  render: 'dict',
  renderProps: {
    options: [  // ✅ 类型提示和检查
      { label: '启用', value: 1 }
    ]
  }
}

// 提取特定渲染器的 props 类型
type DictProps = RendererPropsMap['dict']
const dictConfig: DictProps = {
  options: [],
  showValue: true
}
```

---

### 最佳实践

1. **选择合适的渲染器**
   - 简单映射 → `map`
   - 需要标签样式 → `dict`
   - 复杂逻辑 → `formatter`
   - 自定义内容 → `slot`

2. **性能优化**
   - 大量数据时避免 `formatter`，使用 `map` 或 `dict`
   - 复杂自定义内容优先使用 `slot`

3. **用户体验**
   - 图片显示添加 `placeholder`
   - 复制功能添加友好的提示文本
   - 编辑单元格添加合适的 `placeholder`

---

## 5. 事件

### 单元格编辑事件
支持类型：input / number / select

- `cellChange(row, col)` - 值变化
- `cellBlur(row, col)` - 失去焦点
- `cellEnter(row, col)` - 回车事件（input）
- `cellClick(row, col)` - 点击事件（button/link）

### 完整事件列表

```typescript
interface SmartTableEmits {
  (e: 'cellChange', row: any, col: any): void
  (e: 'cellBlur', row: any, col: any): void
  (e: 'cellEnter', row: any, col: any): void
  (e: 'cellClick', row: any, col: any): void
  (e: 'selectionChange', selection: any[]): void
  (e: 'sortChange', sort: any): void
  // ... Element Plus Table 事件透传
}
```

---

## 6. 按需引入

### 只引入需要的部分

```typescript
// 只引入类型
import type { ColumnConfig, ButtonConfig } from 'vue3-smart-table'

// 只引入渲染器工具
import {
  getRendererManager,
  createFunctionalRenderer,
  wrapSFCComponent
} from 'vue3-smart-table'

// 只引入类型工具
import { defineColumn } from 'vue3-smart-table'
```

### Tree-shaking 支持

库已优化为支持 Tree-shaking，只会打包你实际使用的代码:

```typescript
// ✅ 只会打包 SmartTable 组件
import { SmartTable } from 'vue3-smart-table'

// ✅ 只会打包渲染器管理器
import { getRendererManager, createFunctionalRenderer } from 'vue3-smart-table'
```

---

## 7. 高级用法

### 自定义渲染器（3种方式）

#### 方式一：函数式渲染器

```typescript
import { createFunctionalRenderer } from 'vue3-smart-table'
import { h } from 'vue'

const statusRenderer = createFunctionalRenderer((props) => {
  const val = props.row[props.col.key]
  const color = val === 1 ? 'green' : 'red'
  return h('span', { style: { color } }, val === 1 ? '启用' : '禁用')
})

getRendererManager().register('status', statusRenderer)
```

#### 方式二：SFC 组件

```vue
<!-- StatusRenderer.vue -->
<template>
  <el-tag :type="statusType">{{ statusText }}</el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  row: any
  col: any
}>()

const statusType = computed(() =>
  props.row[props.col.key] === 1 ? 'success' : 'danger'
)

const statusText = computed(() =>
  props.row[props.col.key] === 1 ? '启用' : '禁用'
)
</script>
```

```typescript
import { wrapSFCComponent } from 'vue3-smart-table'
import StatusRenderer from './StatusRenderer.vue'

getRendererManager().register('status', wrapSFCComponent(StatusRenderer))
```

#### 方式三：全局配置

```typescript
import { setSmartTableConfig } from 'vue3-smart-table'
import StatusRenderer from './StatusRenderer.vue'

setSmartTableConfig({
  renderers: {
    'status': StatusRenderer
  }
})
```

### 类型安全的列配置

```typescript
import { defineColumn } from 'vue3-smart-table'

interface User {
  id: number
  name: string
  email: string
}

const columns = [
  defineColumn<User>('id', { label: 'ID' }),
  defineColumn<User>('name', { label: '姓名' }),
  defineColumn<User>('email', {
    label: '邮箱',
    render: 'copy'
  })
]
```

### 操作列权限控制

```typescript
const columns = [
  {
    type: 'operation',
    key: 'operation',
    label: '操作',
    buttons: [
      {
        label: '编辑',
        type: 'primary',
        permission: 'user:edit',  // 需要权限
        action: (row) => handleEdit(row)
      },
      {
        label: '删除',
        type: 'danger',
        permission: ['user:delete', 'admin'],  // 多个权限之一
        action: (row) => handleDelete(row),
        visible: (row) => row.status === 1  // 行级可见性
      }
    ]
  }
]

// 传入用户权限
const permissions = ['user:edit', 'user:view']
```

---

## 8. 完整示例

```vue
<!-- 全局注册 -->
import { createApp } from 'vue'
import App from './App.vue'
import { SmartTable } from 'vue3-smart-table'

const app = createApp(App)
app.component('SmartTable', SmartTable)
app.mount('#app')

<!-- 或者局部注册 -->
<script setup>
import { SmartTable } from 'vue3-smart-table'
</script>

<SmartTable
  v-model:columns="columns"
  :border="true" 
  :loading="loading"
  :rowKey="'appId'"
  :data="tabList"
  :permissions="userStore.permissions"
  :cacheKey="`table_columns_${userInfo?.userId}_APPFeedback`"
  @cellChange="onCellChange"
  @cellBlur="onCellBlur"
  @cellEnter="onCellEnter"
  @cellClick="onCellClick" >
  <!-- 自定义复杂列 -->
  <template #attachments="{ row }">
    <div v-for="(item, index) in row.attachments" :key="index">
      <el-image v-if="item.fileType === 1" :src="item.thumbnailUrl" :preview-src-list="row.imgPaths"/>
      <el-button v-if="item.fileType === 0" type="text" @click="download(item.fileUrl)">下载日志</el-button>
      <div v-if="item.fileType === 2" @click="handleVideo(item.fileUrl)">
        <img :src="item.thumbnailUrl" alt="video"/>
      </div>
    </div>
  </template>
</SmartTable>
```
## 完整示例代码
![DEMO](./demo/assets/demo.jpg)
```vue
<template>
    <div class="demo-container" style="padding: 20px;">
      <h2>Demo</h2>
      <SmartTable
        class="h-400px"
        class-name="table-flex" 
        :border="true" 
        :loading="loading"
        :rowKey="'id'"
        :data="tableData"
        v-model:columns="columns"
        :permissions="permissions"
        :cacheKey="`table_columns_${userInfo?.userId}_APPFeedback`"
        @cell-blur="onCellBlur"
        @cell-enter="onCellEnter"
        @cell-change="onCellChange"
        @cell-click="onCellClick"
      />
    </div>
  </template>
  
  <script setup lang="ts" name="APP">
  import { reactive, ref } from 'vue'
  import { SmartTable } from 'vue3-smart-table'
  const loading = ref(false)
  const Enables = [
    { label: '启用', value: 1, listClass: 'primary' },
    { label: '禁用', value: 0, listClass: 'warning' }
  ]
  const buttonConfigs = [
    { permission: 'edit', label: '编辑', type: 'primary', action: (row: any) => console.log(row)},
    { permission: 'view', label:'删除', type: 'danger', action: (row: any) => console.log(row)},
    { permission: 'copy', label: '复制', type: 'success', action: (row: any) => console.log(row)},
  ]
  const permissions = ['edit', 'view']
  const columns = ref([
    { 
      type: 'selection',
      key: 'index', 
      inControl: false,
    },
    { 
      type: 'index',
      key: 'index', 
      label: '序号', 
      inControl: false,
      columnProps: { width: 60}
    },
    {
      type: 'operation',
      key: 'opt',
      label: '操作',
      inControl: false,
      buttons: buttonConfigs, 
      columnProps: {
        fixed: "right",
        align: "left"
      }
    },
    {
      key: 'action',
      label: '按钮',
      render: 'button',
      renderProps: {
        label: '编辑',
        type: 'text'
      }
    },
    {
      key: 'url',
      label: 'li单元格',
      render: 'link',
      renderProps: {
        label: '查看详情',
        href: 'https://example.com',
        blank: true
      }
    },
    { 
      key: "selectId", 
      label: "可选单元格", 
      visible: true,
      render: 'select',
      columnProps: { minWidth: 150},
      renderProps:{
        options: [
          {label: '选中-1', value: 1},
          {label: '选中-2', value: 2},
        ]
      }
    },
    { 
      key: "orderNum", 
      label: "输入单元格", 
      visible: true,
      render: 'input-number',
      columnProps: { minWidth: 150, sortable: true} 
    },
    {
      key: 'avatar',
      label: '头像',
      render: 'img',
      columnProps: { minWidth: 150, sortable: true},
      renderProps: {
        width: '60px',
        height: '60px',
        fit: 'cover',
        placeholder: '--'
      }
    },
    {
      key: 'gallery',
      label: '相册',
      render: 'img',
      columnProps: { minWidth: 150, sortable: true},
      renderProps: {
        width: '100px',
        height: '100px'
      }
    },
    { 
      key: 'name', 
      label: 'Name', 
      visible: true, 
      render: 'html' 
    },
    { 
      key: "code", 
      label: "系统标识", 
      visible: true, 
      render: "copy",
      columnProps: { minWidth: 160, sortable: true}
    },
    { 
      key: "status", 
      label: "状态", 
      visible: true, 
      render: "dict",
      renderProps: {
        options: Enables,
      },
      columnProps: { minWidth: 80, sortable: true}
    },
    { 
      key: 'map', 
      label: 'Map', 
      visible: true, 
      render: 'map', 
      renderProps: { options: { 1: 'Active', 0: 'Inactive' } } 
    },
    { 
      key: "regionCode", 
      label: "区域", 
      visible: true, 
      render: "formatter",
      columnProps: { minWidth: 100, sortable: true, align: 'left'},
      formatter: (val: string) => `${val}-123`,
    },
    { 
      key: "regionCode", 
      label: "自定义复杂列", 
      visible: true, 
      columnProps: { minWidth: 100, align: 'right'},
    },
    { 
      key: "handling.feedbackId", 
      label: "key.key取值", 
      visible: true, 
      columnProps: { minWidth: 100, align: 'right'},
    },
  ])

  const tableData = reactive([
    { id: 1, name: 'Alice', code: '9527', status: 1, map: 1, regionCode:'海外', orderNum: 1, selectId: 1 },
    { id: 2, name: 'Bob', code: '9526', status: 1, map: 1, regionCode:'海外', orderNum: 1, selectId: 1 },
    { id: 3, name: 'Charlie', code: '9525', status: 0, map: 1, regionCode:'海外', orderNum: 1, selectId: 2 },
    { id: 3, name: 'Charlie', code: '9525', status: 0, map: 1, regionCode:'海外', orderNum: 1, selectId: 2, 
      avatar: 'https://iconfont.alicdn.com/p/illus_3d/file/UMAqlm6KX5gw/8e357f00-9a4e-44c4-b0c5-bbed255cff24.png' ,
      gallery: [
        'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png',
        'https://iconfont.alicdn.com/p/illus_3d/file/UMAqlm6KX5gw/8e357f00-9a4e-44c4-b0c5-bbed255cff24.png',
      ],
      attachments: [
        {
          "id": 1337611,
          "feedbackId": 1334127,
          "fileType": 1,
          "fileUrl": "http://xxxxxxxxxxxxxxxx/attachment/cn.com.blackview.dashcam/2025/12/17/193000-1334127-1.jpg",
          "fileSize": 298696,
          "thumbnailUrl": "http://xxxxxxxxxxxxxxxxxx/attachment/cn.com.blackview.dashcam/2025/12/17/193000-1334127-1-thumbnail.jpg"
        },
        {
          "id": 1337612,
          "feedbackId": 1334127,
          "fileType": 0,
          "fileUrl": "http://xxxxxxxxxxxxxxxxx/attachment/cn.com.blackview.dashcam/2025/12/17/193000-1334127-2.txt",
          "fileSize": 1619,
          "thumbnailUrl": null
        }
      ],
      handling: {
          "id": 1334076,
          "feedbackId": 1334160,
          "problemCategory": null,
          "handlePerson": null,
          "handleTime": "2025-12-19 09:51:05",
          "handleRemark": null,
          "handleStatus": 1,
          "callbackStatus": 1,
          "solveStatus": 1
      }
    },
  ])

  // 编辑单元格回调
  const onCellBlur = (row: any, col: any) => {
    console.log('cell blur:', row, col)
  }
  const onCellEnter = (row: any, col: any) => {
    console.log('cell enter:', row, col)
  }
  const onCellChange = (row: any, col: any) => {
    console.log('cell Change:', row, col)
  }
  
  const onCellClick = (row: any, col: any) => {
    console.log('cell button click:', row, col)
  }
  </script>
  
```







