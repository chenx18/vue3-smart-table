/**
 * 增强类型系统 - 提供更好的类型推断
 */
import type { ColumnConfig, RendererName } from '../components/SmartTable/types'

/**
 * 提取行数据的类型
 */
export type ExtractRowType<T> = T extends ColumnConfig<infer R> ? R : never

/**
 * 根据列配置提取表格数据类型
 */
export type TableDataFromColumns<T extends ColumnConfig[]> = T extends (infer C)[]
  ? C extends ColumnConfig<infer R>
    ? R
    : any
  : any

/**
 * 渲染器 Props 类型推断
 */
export type InferRendererProps<T extends RendererName> =
  T extends 'html'
    ? { style?: string; class?: string; [key: string]: any }
    : T extends 'copy'
      ? { successText?: string; errorText?: string; iconColor?: string; [key: string]: any }
      : T extends 'img'
        ? { width?: string | number; height?: string | number; fit?: string; previewSrcList?: string[]; [key: string]: any }
        : T extends 'dict'
          ? { options: Array<{ label: string; value: string | number; listClass?: string; cssClass?: string }>; showValue?: boolean }
          : T extends 'map'
            ? { options: Record<string | number, any> }
            : T extends 'input'
              ? { placeholder?: string; size?: 'small' | 'default' | 'large'; clearable?: boolean }
              : T extends 'select'
                ? { options: Array<{ label: string; value: string | number }>; placeholder?: string; clearable?: boolean }
                : { [key: string]: any }

/**
 * 快捷创建列的辅助函数（类型安全简化版）
 */
export function defineColumn(
  key: string,
  config?: Partial<Omit<ColumnConfig, 'key'>>
): ColumnConfig {
  return {
    key,
    ...config
  } as ColumnConfig
}
