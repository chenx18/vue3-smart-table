/**
 * Vue3 Smart Table - 主入口文件
 *
 * 基于 Vue 3 + Element Plus 的高可复用表格组件库
 */
import SmartTable from './components/SmartTable/index.vue'

// 导出类型
export * from './components/SmartTable/types'

// 导出核心功能（从 SmartTable 内部导出）
export {
  getRendererManager,
  wrapSFCComponent,
  createFunctionalRenderer,
  validateRendererProps
} from './components/SmartTable/renderer'

export {
  setSmartTableConfig,
  getSmartTableConfig
} from './components/SmartTable/config'

// 导出内置渲染器
export {
  builtInRenderers,
  registerBuiltInRenderers,
  createRenderer
} from './components/SmartTable/renderers'

// 导出类型工具
export { defineColumn } from './types/enhanced'

// 导出主组件
export { SmartTable }

// 默认导出
export default SmartTable
