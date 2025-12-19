import { computed } from 'vue'

import { ButtonConfig } from "../types"
/**
 * useOperationColumn
 *
 * 操作列专用逻辑 Hook，负责：
 * 1. 根据权限判断操作列是否需要显示
 * 2. 计算操作列宽度（支持按钮自定义宽度）
 * 3. 支持行级 visible 配置
 * @param buttonConfigs 操作列按钮配置
 * @param maxbtn        操作列最多显示按钮数量（超过的不参与宽度计算）
 * @param userPermissions 当前用户权限列表
 */
export function useOperationColumn(
  buttonConfigs: ButtonConfig[],
  maxbtn = 10,
  userPermissions: string[] = []
) {
  /** 默认按钮宽度 */
  const defaultWidth = 60

  /** 超级权限标识 */
  const all_permission = '*:*:*'

  /** --------------------------
   * 权限判断
   * -------------------------- */

  /**
   * 判断是否具备按钮权限
   *
   * 规则：
   * - permission 未配置 ⇒ 永远有权限
   * - permission 为 string | string[] ⇒ 与用户权限匹配
   */
  const hasPermi = (value?: string | string[]) => {
    if (!value) return true

    const permArray = Array.isArray(value) ? value : [value]
    return userPermissions.some(
      p => p === all_permission || permArray.includes(p)
    )
  }

  /** --------------------------
   * 仅基于权限（不考虑行级 visible）
   * 适用于：表格未加载数据时的判断
   * -------------------------- */

  /**
   * 是否至少存在一个有权限的按钮
   * 用于判断操作列是否需要渲染
   */
  const hasAnyButton = computed(() => {
    return buttonConfigs.some(btn => hasPermi(btn.permission))
  })

  /**
   * 操作列宽度（仅基于权限）
   * 用于无行数据时的兜底宽度计算
   */
  const optWidth = computed(() => {
    const permittedBtns = buttonConfigs
      .filter(btn => hasPermi(btn.permission))
      .slice(0, maxbtn)

    return permittedBtns.reduce(
      (sum, btn) => sum + (btn.width ?? defaultWidth),
      0
    )
  })

  /** --------------------------
   * 权限 + 行级 visible
   * -------------------------- */

  /**
   * 判断某个按钮在某一行是否可见
   */
  const isButtonVisible = (btn: ButtonConfig, row: any) => {
    return (
      hasPermi(btn.permission) &&
      (btn.visible ? btn.visible(row) : true)
    )
  }

  /**
   * 单行操作列宽度
   */
  const optRowWidth = (row: any) => {
    const visibleBtns = buttonConfigs
      .filter(btn => isButtonVisible(btn, row))
      .slice(0, maxbtn)

    return visibleBtns.reduce(
      (sum, btn) => sum + (btn.width ?? defaultWidth),
      0
    )
  }

  /**
   * 遍历所有行，获取最大操作列宽度
   */
  const getMaxOptWidth = (rows: any[]) => {
    if (!rows?.length) return optWidth.value
    return rows.reduce(
      (max, row) => Math.max(max, optRowWidth(row)),
      0
    )
  }

  /**
   * 判断是否至少有一行存在可见按钮
   */
  const hasAnyVisibleButton = (rows: any[]) => {
    if (!rows?.length) return false
    return rows.some(row =>
      buttonConfigs.some(btn => isButtonVisible(btn, row))
    )
  }

  const getVisibleButtons = (row: any) => {
    return buttonConfigs
      .filter(btn => isButtonVisible(btn, row))
      .slice(0, maxbtn)
  }

  return {
    hasAnyButton,
    optWidth,
    hasAnyVisibleButton,
    getMaxOptWidth,
    getVisibleButtons
  }
}
