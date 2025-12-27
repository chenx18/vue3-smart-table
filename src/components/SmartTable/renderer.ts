/**
 * SmartTable 内部渲染器管理系统
 * 移动到组件内部，保证组件的自包含性
 */
import { defineComponent, h, Component } from 'vue'
import type { Renderer } from './types'

/**
 * 渲染器注册表接口
 */
export interface RendererRegistry {
  register(name: string, renderer: Renderer): void
  registerMultiple(renderers: Record<string, Renderer>): void
  get(name: string): Renderer | undefined
  has(name: string): boolean
  unregister(name: string): boolean
  clear(): void
  names(): string[]
}

/**
 * 渲染器管理器类
 */
class RendererManager implements RendererRegistry {
  private renderers: Map<string, Renderer> = new Map()

  register(name: string, renderer: Renderer): void {
    if (this.renderers.has(name)) {
      // 批量注册时不警告，只在单独注册时警告
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[SmartTable] Renderer "${name}" already registered, skipping.`)
      }
    }
    this.renderers.set(name, renderer)
  }

  registerMultiple(renderers: Record<string, Renderer>): void {
    Object.entries(renderers).forEach(([name, renderer]) => {
      if (!this.renderers.has(name)) {
        this.renderers.set(name, renderer)
      }
    })
  }

  get(name: string): Renderer | undefined {
    return this.renderers.get(name)
  }

  has(name: string): boolean {
    return this.renderers.has(name)
  }

  unregister(name: string): boolean {
    return this.renderers.delete(name)
  }

  clear(): void {
    this.renderers.clear()
  }

  names(): string[] {
    return Array.from(this.renderers.keys())
  }
}

/**
 * 全局渲染器管理器单例
 */
let globalRendererManager: RendererManager | null = null

/**
 * 获取渲染器管理器
 */
export function getRendererManager(): RendererManager {
  if (!globalRendererManager) {
    globalRendererManager = new RendererManager()
  }
  return globalRendererManager
}

/**
 * 包装 SFC 组件为渲染器
 */
export function wrapSFCComponent(comp: Component): Renderer {
  return defineComponent({
    props: ['row', 'col', 'index', 'onCellChange', 'onCellBlur', 'onCellEnter', 'onClick'],
    setup(props) {
      return () => h(comp, props)
    }
  })
}

/**
 * 创建函数式渲染器
 */
export function createFunctionalRenderer(
  render: (props: {
    row: any
    col: any
    index: number
    onCellChange?: (row: any, col: any) => void
    onCellBlur?: (row: any, col: any) => void
    onCellEnter?: (row: any, col: any) => void
    onClick?: (row: any, col: any) => void
  }) => any
): Renderer {
  return defineComponent({
    props: ['row', 'col', 'index', 'onCellChange', 'onCellBlur', 'onCellEnter', 'onClick'],
    setup(props) {
      return () => render(props)
    }
  })
}

/**
 * 验证渲染器配置
 * 在开发环境下验证 renderProps 的正确性
 */
export function validateRendererProps(
  rendererName: string,
  renderProps: Record<string, any> | undefined
): void {
  if (process.env.NODE_ENV !== 'production' && renderProps) {
    switch (rendererName) {
      case 'dict':
        if (!renderProps.options || !Array.isArray(renderProps.options)) {
          console.warn(
            `[SmartTable] 'dict' renderer requires 'options' array, received:`,
            renderProps.options
          )
        }
        break

      case 'select':
        if (!renderProps.options || !Array.isArray(renderProps.options)) {
          console.warn(
            `[SmartTable] 'select' renderer requires 'options' array, received:`,
            renderProps.options
          )
        } else if (renderProps.options.length === 0) {
          console.warn(`[SmartTable] 'select' renderer 'options' array is empty`)
        }
        break

      case 'map':
        if (!renderProps.options || typeof renderProps.options !== 'object') {
          console.warn(
            `[SmartTable] 'map' renderer requires 'options' object, received:`,
            renderProps.options
          )
        }
        break

      case 'link':
        if (!renderProps.href || typeof renderProps.href !== 'string') {
          console.warn(
            `[SmartTable] 'link' renderer requires 'href' string, received:`,
            renderProps.href
          )
        }
        break

      case 'input-number':
        if (renderProps.min !== undefined && renderProps.max !== undefined) {
          if (renderProps.min > renderProps.max) {
            console.warn(
              `[SmartTable] 'input-number' renderer: min (${renderProps.min}) should not be greater than max (${renderProps.max})`
            )
          }
        }
        break
    }
  }
}
