/**
 * 全局配置管理
 */
import type { SmartTableConfig } from './types'
import { getRendererManager } from './renderer'

/**
 * 默认配置
 */
const defaultConfig: SmartTableConfig = {
  defaultPagination: {
    page: 1,
    size: 10,
    total: 0
  },
  defaultTableProps: {},
  defaultColumnProps: {}
}

/**
 * 全局配置类
 */
class ConfigManager {
  private config: SmartTableConfig = { ...defaultConfig }

  /**
   * 获取所有配置
   */
  getConfig(): SmartTableConfig {
    return { ...this.config }
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<SmartTableConfig>): void {
    this.config = this.mergeConfig(this.config, config)

    // 如果有自定义渲染器，自动注册
    if (config.renderers) {
      const manager = getRendererManager()
      manager.registerMultiple(config.renderers)
    }
  }

  /**
   * 获取特定配置项
   */
  get<K extends keyof SmartTableConfig>(key: K): SmartTableConfig[K] {
    return this.config[key]
  }

  /**
   * 重置为默认配置
   */
  reset(): void {
    this.config = { ...defaultConfig }
  }

  /**
   * 深度合并配置
   */
  private mergeConfig(target: any, source: any): any {
    const result = { ...target }

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeConfig(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }

    return result
  }
}

/**
 * 全局配置管理器单例
 */
let globalConfigManager: ConfigManager | null = null

/**
 * 获取全局配置管理器
 */
export function getConfigManager(): ConfigManager {
  if (!globalConfigManager) {
    globalConfigManager = new ConfigManager()
  }
  return globalConfigManager
}

/**
 * 安装插件（用于 Vue.use()）
 */
export interface SmartTablePlugin {
  install: (options?: SmartTableConfig) => void
}

/**
 * 创建插件实例
 */
export function createSmartTablePlugin(defaultOptions?: SmartTableConfig): SmartTablePlugin {
  return {
    install(options?: SmartTableConfig) {
      const manager = getConfigManager()
      const config = { ...defaultOptions, ...options }
      if (config) {
        manager.setConfig(config)
      }
    }
  }
}

/**
 * 全局配置快捷方法
 */
export function setSmartTableConfig(config: Partial<SmartTableConfig>): void {
  getConfigManager().setConfig(config)
}

export function getSmartTableConfig(): SmartTableConfig {
  return getConfigManager().getConfig()
}
