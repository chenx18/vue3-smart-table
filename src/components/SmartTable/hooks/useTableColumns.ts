import { ref, watch } from 'vue'


/**
 * 合并默认列配置和缓存配置
 *
 * 设计原则：
 * 1️⃣ 列顺序：以 defaultColumns 为准
 * 2️⃣ 列增减：以 defaultColumns 为准
 * 3️⃣ 缓存只覆盖用户可配置字段（如 visible）
 */
function mergeColumns(
  defaultColumns: any[],
  cacheColumns: Array<{ key: string; visible?: boolean }>
) {
  if (!cacheColumns?.length) return defaultColumns

  // 建立 key => cache 映射表，提升查找效率
  const cacheMap = new Map(
    cacheColumns.map(c => [c.key, c])
  )

  return defaultColumns.map(col => {
    const cacheCol = cacheMap.get(col.key)

    // 只允许缓存覆盖「可配置字段」
    if (!cacheCol) return col

    return {
      ...col,
      visible:
        typeof cacheCol.visible === 'boolean'
          ? cacheCol.visible
          : col.visible
    }
  })
}


/**
 * useTableColumns
 *
 * 表格列管理 Hook
 *
 * 职责：
 * - 管理表格列顺序
 * - 管理列显示 / 隐藏
 * - 持久化用户配置
 */
export function useTableColumns(
  defaultColumns: any[],
  options?: {
    /** 缓存唯一标识 */
    cacheKey?: string
    /** 存储介质，默认 localStorage */
    storage?: Storage
  }
) {

  /** 解构参数并设置默认值 */
  const { cacheKey, storage = localStorage } = options || {}

  /**
   * 如果没有 cacheKey，则不启用缓存
   * （例如公共页面、未登录页面）
   * 从缓存中读取列配置
   */
  const cache = cacheKey ? storage.getItem(cacheKey) : null

  /**
   * 响应式列配置
   * 初始化时合并默认列和缓存列
   */
  const columns = ref(
    mergeColumns(
      defaultColumns,
      cache ? JSON.parse(cache) : []
    )
  )

  /**
   * 监听列变化，自动写入缓存
   */
  watch(
    columns,
    (newVal: any) => {
      if (!cacheKey) return

      /**
       * ⚠️ 只保存“轻量配置”
       * 避免把 render / action / 函数序列化进 localStorage
       */
      const lightColumns = newVal.map((col: any) => ({
        key: col.key,
        visible: col.visible,
        columnOpts: col.columnOpts
      }))

      storage.setItem(
        cacheKey,
        JSON.stringify(lightColumns)
      )
    },
    { deep: true }
  )

  /**
   * 对外暴露的 API
   */
  return {
    /** 当前列配置（响应式） */
    columns,

    /**
     * 主动设置列配置
     * 常用于：列设置弹窗 / 拖拽排序完成
     */
    setColumns(newColumns: any[]) {
      columns.value = mergeColumns(
        defaultColumns,
        newColumns
      )

      if (cacheKey) {
        storage.setItem(
          cacheKey,
          JSON.stringify(newColumns)
        )
      }
    },

    /**
     * 重置为默认列配置
     */
    resetColumns() {
      columns.value = defaultColumns

      if (cacheKey) {
        storage.removeItem(cacheKey)
      }
    }
  }
}
