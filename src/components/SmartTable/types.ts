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

/* ======================= Renderer ======================= */

export type RendererName =
  | 'html'
  | 'copy'
  | 'img'
  | 'dict'
  | 'map'
  | 'formatter'
  | 'icon'
  | 'input'
  | 'input-number'
  | 'select'
  | 'button'
  | 'link'
  | 'slot'
  
/** renderer 对应的 renderProps */
export interface RendererPropsMap {
  html: WithRestProps<{
    style?: string
    class?: string
  }>

  copy: WithRestProps<{
    /** 复制按钮图标颜色 */
    iconColor?: string
    /** 复制按钮提示文本 */
    copyTitle?: string
    /** 复制成功提示 */
    successText?: string
    /** 复制失败提示 */
    errorText?: string
    lineClamp?: number             // 默认显示2行，超出省略
    textStyles?: any        // 文本样式 {fontSize: '12px'}
    textClass?: string  
  }>

  img: WithRestProps<{
    /** 图片宽度 */
    width?: string | number
    /** 图片高度 */
    height?: string | number
    /** 图片适应方式 */
    fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
    /** 预览图片列表 */
    previewSrcList?: string[]
    /** 无图片时的占位文本 */
    placeholder?: string
    /** 自定义样式 */
    style?: string
  }>

  dict: WithRestProps<{
    /** 字典配置 */
    options: Array<{
      label: string
      value: string | number
      listClass?: string
      cssClass?: string
    }>
    /** 是否显示未匹配的值 */
    showValue?: boolean
  }>

  map: WithRestProps<{
    /** key-value 映射 */
    options: Record<string | number, any>
  }>

  formatter: never  // formatter 使用 ColumnConfig.formatter 函数

  icon: WithRestProps<{
    /** 自定义样式 */
    style?: string
    /** 图标大小（像素） */
    size?: number
    /** 自定义类名 */
    class?: string
  }>

  input: WithRestProps<{
    /** 占位文本 */
    placeholder?: string
    /** 输入框尺寸 */
    size?: 'small' | 'default' | 'large'
    /** 是否可清空 */
    clearable?: boolean
  }>

  'input-number': WithRestProps<{
    /** 最小值 */
    min?: number
    /** 最大值 */
    max?: number
    /** 步长 */
    step?: number
    /** 精度 */
    precision?: number
    /** 输入框尺寸 */
    size?: 'small' | 'default' | 'large'
    /** 是否显示增减按钮 */
    controls?: boolean
  }>

  select: WithRestProps<{
    /** 选项配置 */
    options: Array<{
      label: string
      value: string | number
    }>
    /** 占位文本 */
    placeholder?: string
    /** 选择器尺寸 */
    size?: 'small' | 'default' | 'large'
    /** 是否可清空 */
    clearable?: boolean
  }>

  button: WithRestProps<ButtonProps & {
    /** 按钮文本 */
    label?: string
    /** 自定义样式 */
    style?: string
    /** 自定义类名 */
    class?: string
  }>

  link: WithRestProps<{
    /** 链接文本 */
    label?: string
    /** 链接地址 */
    href: string
    /** 是否新窗口打开 */
    blank?: boolean
    /** 自定义样式 */
    style?: string
    /** 自定义类名 */
    class?: string
  }>
}

/* ======================= 列类型 ======================= */

export type ColumnType =
  | 'default'
  | 'selection'
  | 'index'
  | 'operation'

/* ======================= ColumnConfig ======================= */
export interface BaseColumn<R extends DefaultRow> {
  key: keyof R & string
  label?: string
  visible?: boolean
  inControl?: boolean
  columnProps?: Partial<TableColumnCtx<R>>
  render?: RendererName | string  // 支持自定义渲染器名称
  slot?: string           // 插槽名称，默认用 key
  renderProps?: Partial<RendererPropsMap[keyof RendererPropsMap]>
  buttons?: ButtonConfig<R>[]   // operation 列专用
  maxbtn?: number               // operation 列专用
}

export interface SelectionColumn<R extends DefaultRow> extends BaseColumn<R> { type: 'selection' }
export interface IndexColumn<R extends DefaultRow> extends BaseColumn<R> { type: 'index' }
export interface OperationColumn<R extends DefaultRow> extends BaseColumn<R> { type: 'operation'; buttons: ButtonConfig<R>[] }
export interface DataColumn<R extends DefaultRow> extends BaseColumn<R> {
  type?: 'default'
  /**
   * 格式化函数
   * @param value 单元格值
   * @param row 当前行数据
   * @param index 当前行索引（从0开始）
   * @returns 格式化后的显示内容
   */
  formatter?: (value: any, row: R, index: number) => any
}

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
  /** 单元格点击（button 渲染器） */
  (e: 'cellClick', row: R, col: ColumnConfig<R>): void
}