import type { ButtonProps, TableColumnCtx } from 'element-plus'
import { DefaultRow } from 'element-plus/es/components/table/src/table/defaults'
import type { Component } from 'vue'

// 导出验证函数类型
export type { validateRendererProps } from './renderer'

/* ======================= 基础工具类型 ======================= */

/** 支持额外参数（Element Plus 透传 props） */
export type WithRestProps<T> = T & {
  [key: string]: any
}

/* ======================= 渲染器系统 ======================= */

/** Renderer 组件类型 */
export type Renderer = Component

/** 渲染器注册表接口 */
export interface RendererRegistry {
  register(name: string, renderer: Renderer): void
  registerMultiple(renderers: Record<string, Renderer>): void
  get(name: string): Renderer | undefined
  has(name: string): boolean
  unregister(name: string): boolean
  clear(): void
  names(): string[]
}

/** 全局配置接口 */
export interface SmartTableConfig {
  /** 自定义渲染器 */
  renderers?: Record<string, Renderer>
  /** 默认分页配置 */
  defaultPagination?: {
    page?: number
    size?: number
    total?: number
  }
  /** 默认表格属性 */
  defaultTableProps?: Record<string, any>
  /** 默认列属性 */
  defaultColumnProps?: Record<string, any>
}

/* ======================= 分页配置 ======================= */

/** 分页配置接口 */
export interface PaginationConfig {
  /** 当前页码 */
  page?: number
  /** 每页条数 */
  size?: number
  /** 总条数 */
  total?: number
}

/* ======================= 操作列按钮 ======================= */

export interface ButtonConfig<R = any> {
  permission?: string | string[]
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  action: (row: R) => void
  visible?: (row: R) => boolean
  width?: number
}

/* ======================= 列类型 ======================= */

/**
 * 列类型枚举
 * 包含特殊列类型和渲染器类型
 */
export type ColumnType =
  // 特殊列
  | 'selection'
  | 'index'
  | 'operation'
  // 内置渲染器
  | 'input'
  | 'input-number'
  | 'select'
  | 'dict'
  | 'map'
  | 'img'
  | 'link'
  | 'button'
  | 'copy'
  | 'html'
  | 'formatter'
  | 'icon'
  | 'slot'

/* ======================= Props 类型映射 ======================= */

/** 各类型对应的 props */
export interface ColumnPropsMap {
  // 特殊列
  selection: {}
  index: {}
  operation: {}

  // 渲染器
  html: WithRestProps<{
    style?: string | Record<string, any>
    class?: string
  }>

  copy: WithRestProps<{
    iconColor?: string
    copyTitle?: string
    successText?: string
    errorText?: string
    lineClamp?: number
    textStyles?: Record<string, any>
    textClass?: string
  }>

  img: WithRestProps<{
    width?: string | number
    height?: string | number
    fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
    previewSrcList?: string[]
    placeholder?: string
    style?: string | Record<string, any>
  }>

  dict: WithRestProps<{
    options: Array<{
      label: string
      value: string | number
      listClass?: string
      cssClass?: string
      tagProps?: Record<string, any>
    }>
    showValue?: boolean
  }>

  map: WithRestProps<{
    options: Record<string | number, any>
  }>

  formatter: WithRestProps<{}>

  icon: WithRestProps<{
    style?: string | Record<string, any>
    size?: number
    class?: string
  }>

  input: WithRestProps<{
    placeholder?: string
    size?: 'small' | 'default' | 'large'
    clearable?: boolean
    maxlength?: number
    showWordLimit?: boolean
    disabled?: boolean
    // 事件
    onChange?: (val: string, row: any, col: any) => void
    onBlur?: (e: FocusEvent, row: any, col: any) => void
    onFocus?: (e: FocusEvent, row: any, col: any) => void
    onInput?: (val: string, row: any, col: any) => void
    onClear?: (row: any, col: any) => void
    onEnter?: (e: KeyboardEvent, row: any, col: any) => void
  }>

  'input-number': WithRestProps<{
    min?: number
    max?: number
    step?: number
    precision?: number
    size?: 'small' | 'default' | 'large'
    controls?: boolean
    disabled?: boolean
    // 事件
    onChange?: (val: number | undefined, oldVal: number | undefined, row: any, col: any) => void
    onBlur?: (e: FocusEvent, row: any, col: any) => void
    onFocus?: (e: FocusEvent, row: any, col: any) => void
    onEnter?: (e: KeyboardEvent, row: any, col: any) => void
  }>

  select: WithRestProps<{
    options: Array<{
      label: string
      value: string | number
      disabled?: boolean
    }>
    placeholder?: string
    size?: 'small' | 'default' | 'large'
    clearable?: boolean
    filterable?: boolean
    multiple?: boolean
    disabled?: boolean
    // 事件
    onChange?: (val: any, row: any, col: any) => void
    onBlur?: (e: FocusEvent, row: any, col: any) => void
    onFocus?: (e: FocusEvent, row: any, col: any) => void
    onVisibleChange?: (visible: boolean, row: any, col: any) => void
    onClear?: (row: any, col: any) => void
  }>

  button: WithRestProps<ButtonProps & {
    label?: string
    style?: string | Record<string, any>
    class?: string
    onClick?: (e: Event, row: any, col: any) => void
  }>

  link: WithRestProps<{
    label?: string
    href?: string
    blank?: boolean
    style?: string | Record<string, any>
    class?: string
  }>

  slot: {}
}

/* ======================= ColumnConfig ======================= */

/** 列配置基础接口 */
export interface BaseColumnConfig<R extends DefaultRow = any> {
  /** 字段名 */
  key: string
  /** 列类型 */
  type?: ColumnType | string
  /** 列标题 */
  label?: string
  /** 是否显示 */
  visible?: boolean
  /** 是否在列控制中显示 */
  inControl?: boolean
  /** el-table-column 原生属性 */
  columnProps?: Partial<TableColumnCtx<R>>
  /** 插槽名称（type 为 slot 时使用，默认用 key） */
  slot?: string
  /** 渲染器/组件属性 */
  props?: Record<string, any>
}

/** Selection 列 */
export interface SelectionColumn<R extends DefaultRow = any> extends BaseColumnConfig<R> {
  type: 'selection'
}

/** Index 列 */
export interface IndexColumn<R extends DefaultRow = any> extends BaseColumnConfig<R> {
  type: 'index'
}

/** Operation 列 */
export interface OperationColumn<R extends DefaultRow = any> extends BaseColumnConfig<R> {
  type: 'operation'
  buttons: ButtonConfig<R>[]
  /** 最大显示按钮数 */
  maxbtn?: number
}

/** 数据列 */
export interface DataColumn<R extends DefaultRow = any> extends BaseColumnConfig<R> {
  type?: Exclude<ColumnType, 'selection' | 'index' | 'operation'> | string
  /**
   * 格式化函数（type 为 formatter 时使用）
   */
  formatter?: (value: any, row: R, index: number) => any
}

/** 列配置联合类型 */
export type ColumnConfig<R extends DefaultRow = any> =
  | SelectionColumn<R>
  | IndexColumn<R>
  | OperationColumn<R>
  | DataColumn<R>

/* ======================= 组件 Props ======================= */

/**
 * SmartTable 组件 Props 接口
 */
export interface SmartTableProps<R extends DefaultRow = any> {
  /** 表格数据 */
  data: R[]
  /** 列配置 */
  columns: ColumnConfig<R>[]
  /** 行数据的唯一标识字段，默认 'id' */
  rowKey?: string
  /** 是否显示加载状态 */
  loading?: boolean
  /** 权限列表，用于操作列按钮权限控制 */
  permissions?: string[]
  /** 列配置缓存 key，用于持久化列显隐配置 */
  cacheKey?: string
  /** 分页配置，用于序号列计算 */
  pagination?: PaginationConfig
}

/**
 * SmartTable 组件 Emits 接口
 */
export interface SmartTableEmits<R extends DefaultRow = any> {
  /** 列配置更新（v-model:columns） */
  (e: 'update:columns', columns: ColumnConfig<R>[]): void
  /** 单元格值变更 */
  (e: 'cellChange', row: R, col: ColumnConfig<R>): void
  /** 单元格失焦 */
  (e: 'cellBlur', row: R, col: ColumnConfig<R>): void
  /** 单元格回车 */
  (e: 'cellEnter', row: R, col: ColumnConfig<R>): void
  /** 单元格点击（button 类型） */
  (e: 'cellClick', row: R, col: ColumnConfig<R>): void
}

/* ======================= 辅助类型 ======================= */

/** 特殊列类型 */
export type SpecialColumnType = 'selection' | 'index' | 'operation'

/** 判断是否为特殊列 */
export function isSpecialColumn(type?: string): type is SpecialColumnType {
  return type === 'selection' || type === 'index' || type === 'operation'
}

/** 判断是否为渲染器类型 */
export function isRendererType(type?: string): boolean {
  if (!type) return false
  return !isSpecialColumn(type)
}

/** 判断是否为 operation 列 */
export function isOperationColumn<R extends DefaultRow = any>(col: ColumnConfig<R>): col is OperationColumn<R> {
  return col.type === 'operation'
}
