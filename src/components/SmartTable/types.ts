import type { ButtonProps, TableColumnCtx } from 'element-plus'
import { DefaultRow } from 'element-plus/es/components/table/src/table/defaults'

/* ======================= 基础工具类型 ======================= */

/** 支持额外参数（Element Plus 透传 props） */
export type WithRestProps<T> = T & {
  [key: string]: any
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

/** renderer 对应的 renderProps */
export interface RendererPropsMap {
  html: WithRestProps<{
    style?: string
    class?: string
  }>

  copy: WithRestProps<{
    style?: string
    class?: string
    successText?: string
    errorText?: string
  }>

  img: WithRestProps<{
    style?: string
    class?: string
    fit?: 'contain' | 'cover' | 'fill'
    previewSrcList?: string[]
  }>

  dict: WithRestProps<{
    options: Array<{
      label: string
      value: string | number
      listClass?: string
      cssClass?: string
    }>
    showValue?: boolean
  }>

  map: WithRestProps<{
    options: Record<string | number, any>
  }>

  formatter: never

  icon: WithRestProps<{
    style?: string
    size?: number
    class?: string
  }>

  input: WithRestProps<{
    placeholder?: string
    size?: 'small' | 'default' | 'large'
    clearable?: boolean
  }>

  'input-number': WithRestProps<{
    min?: number
    max?: number
    size?: 'small' | 'default' | 'large'
    controls?: boolean
  }>

  select: WithRestProps<{
    style?: string
    class?: string
    placeholder?: string
    size?: 'small' | 'default' | 'large'
    clearable?: boolean
    options: Array<{
      label: string
      value: string | number
    }>
  }>

  button: WithRestProps<ButtonProps & {
    style?: string
    class?: string
    label?: string   // 用于渲染文本
  }>

  link: WithRestProps<any & {
    style?: string
    class?: string
    label: string
    href: string
    blank?: boolean
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
  render?: RendererName
  renderProps?: Partial<RendererPropsMap[keyof RendererPropsMap]>
  buttons?: ButtonConfig<R>[]   // operation 列专用
  maxbtn?: number               // operation 列专用
  __rows?: R[]                  // operation 列内部使用
}

export interface SelectionColumn<R extends DefaultRow> extends BaseColumn<R> { type: 'selection' }
export interface IndexColumn<R extends DefaultRow> extends BaseColumn<R> { type: 'index' }
export interface OperationColumn<R extends DefaultRow> extends BaseColumn<R> { type: 'operation'; buttons: ButtonConfig<R>[] }
export interface DataColumn<R extends DefaultRow> extends BaseColumn<R> { type?: 'default'; formatter?: (value: any, row: R) => any }

export type ColumnConfig<R extends DefaultRow = any> =
  | SelectionColumn<R>
  | IndexColumn<R>
  | OperationColumn<R>
  | DataColumn<R>