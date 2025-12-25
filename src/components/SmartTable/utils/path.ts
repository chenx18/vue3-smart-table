/**
 * 安全获取对象深层属性
 * 支持 a.b.c / a.0.b
 */
export function getValueByPath(obj: any, path?: string) {
    if (!obj || !path) return undefined
    return path.split('.').reduce((acc, key) => acc?.[key], obj)
  }
  
  /**
   * 安全设置对象深层属性（用于可编辑表格）
   */
  export function setValueByPath(
    obj: any,
    path: string,
    value: any
  ) {
    if (!obj || !path) return
    const keys = path.split('.')
    const lastKey = keys.pop()!
  
    const target = keys.reduce((acc, key) => {
      if (!acc[key]) acc[key] = {}
      return acc[key]
    }, obj)
  
    target[lastKey] = value
  }
  