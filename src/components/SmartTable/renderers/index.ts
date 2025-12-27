/**
 * 内置渲染器集合
 * 可以按需引入或批量注册
 */
import { h } from 'vue'
import { ElButton, ElTag, ElImage, ElMessage } from 'element-plus'
import { DocumentCopy, CopyDocument } from '@element-plus/icons-vue'
import type { ColumnConfig } from '../types'
import { getValueByPath } from '../utils/path'
import { wrapSFCComponent, createFunctionalRenderer } from '../renderer'
import EditableInput from './input.vue'
import EditableNumber from './inputNumber.vue'
import EditableSelect from './select.vue'

/**
 * 包装 SFC 组件
 */
const input = wrapSFCComponent(EditableInput)
const inputNumber = wrapSFCComponent(EditableNumber)
const select = wrapSFCComponent(EditableSelect)

/**
 * button 渲染器
 */
const button = createFunctionalRenderer((props) => {
  const rp = props.col.renderProps || {}
  const val = getValueByPath(props.row, props.col.key)
  return h(ElButton as any, {
    type: rp.type || 'primary',
    ...rp,
    onClick: () => props.onClick?.(props.row, props.col)
  }, () => rp.label || val)
})

/**
 * link 渲染器
 */
const link = createFunctionalRenderer((props) => {
  const rp = props.col.renderProps || {}
  const val = getValueByPath(props.row, props.col.key)
  return h('a', {
    href: rp.href || '#',
    target: rp.blank ? '_blank' : '_self',
    style: rp.style || 'color:#409EFF;cursor:pointer;',
  }, rp.label || val)
})

/**
 * html 渲染器
 */
const html = createFunctionalRenderer((props) => {
  const val = getValueByPath(props.row, props.col.key)
  return h('div', {
    class: 'line-clamp-2',
    innerHTML: val ?? '',
    ...(props.col?.renderProps || {})
  })
})

/**
 * copy 渲染器
 */
const copy = createFunctionalRenderer((props) => {
  const val = getValueByPath(props.row, props.col.key) ?? ''
  const rp = props.col.renderProps ?? {}
  const butStyle = {
    'position': 'absolute',
    'right': '-5px',
    'top': '50%',
    'transform': 'translateY(-50%)',
    'cursor': 'pointer',
    'display': 'none',
    'font-size': '12px',
    'color': rp.iconColor || '#409EFF',
    'user-select': 'none'
  }
  const testStyle = {
    'padding-right': '10px',
    'display': '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': rp.lineClamp ?? 2,
    'overflow': 'hidden',
    ...rp.textStyles
  }
  return h('div', {
      class: 'st_copy_wrapper',
      style: 'width: 100%; position: relative; display: inline-block;'
    },
    [
      h('span', {
        class: `st_copy_text ${rp.textClass ?? ''}`,
        style: testStyle,
        title: val
      }, val),
      val && h('span', {
        class: 'st_copy_btn',
        style: butStyle,
        title: rp.copyTitle || '复制',
        onClick: () => {
          if (!val) return
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(val).then(() => {
                ElMessage.success(rp.successText ?? '复制成功')
              }).catch(() => {
                ElMessage.error(rp.errorText ?? '复制失败')
              })
            } else {
              const textarea = document.createElement('textarea')
              textarea.value = val
              textarea.style.position = 'fixed'
              textarea.style.opacity = '0'
              document.body.appendChild(textarea)
              textarea.select()
              const successful = document.execCommand('copy')
              document.body.removeChild(textarea)

              if (successful) {
                ElMessage.success(rp.successText ?? '复制成功')
              } else {
                ElMessage.error(rp.errorText ?? '复制失败')
              }
            }
          } catch (err) {
            ElMessage.error(rp.errorText ?? '复制失败')
          }
        }
      }, [h(DocumentCopy, {
        style: 'width: 1em; height: 1em;'
      })])
    ].filter(Boolean)
  )
})

/**
 * img 渲染器
 */
const img = createFunctionalRenderer((props) => {
  const val = getValueByPath(props.row, props.col.key) ?? ''
  const rp = props.col?.renderProps || {}

  const getImageList = () => {
    if (!val) return []
    if (Array.isArray(val)) {
      return val.filter(item => item && typeof item === 'string')
    }
    return [val]
  }

  const imageList = getImageList()

  if (imageList.length === 0) {
    return rp.placeholder || ''
  }

  const defaultStyle = {
    width: rp.width || '80px',
    height: rp.height || '80px',
    marginRight: imageList.length > 1 ? '4px' : '0',
    ...(rp.style || {})
  }

  if (imageList.length === 1) {
    return h(ElImage, {
      src: imageList[0],
      previewSrcList: rp.previewSrcList || imageList,
      previewTeleported: true, 
      fit: rp.fit || 'contain',
      style: defaultStyle,
      ...rp
    })
  }

  return h('div',
    {
      class: 'st_img_wrapper',
      style: 'display: flex; align-items: center; position: relative'
    },
    [
      h(ElImage, {
        src: imageList[0],
        previewSrcList: rp.previewSrcList || imageList,
        previewTeleported: true, 
        fit: rp.fit || 'contain',
        style: defaultStyle,
        ...rp
      }),
      imageList.length > 1 && h('span', {
        class: 'st_img_total',
        style: `position: absolute; top: 0; right: 0; `,
        title: `${imageList.length}`
      }, [h(CopyDocument, { style: `width: 1em; height: 1em; ` })])
    ]
  )
})

/**
 * dict 渲染器
 */
const dict = createFunctionalRenderer((props) => {
  const val = getValueByPath(props.row, props.col.key) ?? ''
  const rp = props.col.renderProps || {}
  const options = rp.options ?? []
  const showValue = rp.showValue ?? false

  if (val === null || val === undefined || val === '') return ''

  const values = Array.isArray(val) ? val.map(String) : [String(val)]
  const matchedOptions = options.filter((opt: any) => values.includes(String(opt.value)))
  const unmatched = values.filter(v => !options.some((opt: any) => String(opt.value) === v))

  const children = matchedOptions.map((item: any, _index: number) => {
    return h(
      ElTag,
      { key: item.value, type: item.listClass, class: item.cssClass, disableTransitions: true },
      { default: () => item.label + ' ' }
    )
  })

  if (showValue && unmatched.length > 0) {
    children.push(h('span', {}, unmatched.join(' ')))
  }

  return h('div', {}, children)
})

/**
 * map 渲染器
 */
const map = createFunctionalRenderer((props) => {
  const val = getValueByPath(props.row, props.col.key) ?? ''
  const options = (props.col.renderProps?.options ?? {}) as Record<string, any>
  return val != null ? options[val] ?? '' : ''
})

/**
 * formatter 渲染器
 */
export function isDataColumn(
  col: ColumnConfig
): col is any {
  return typeof (col as any).formatter === 'function'
}

const formatter = createFunctionalRenderer((props) => {
  const { col, row, index } = props
  const val = getValueByPath(props.row, props.col.key) ?? ''
  if (isDataColumn(col)) {
    // formatter 函数签名: (value, row, index) => string
    return col.formatter?.(val, row, index)
  }
  return val ?? ''
})

/**
 * icon 渲染器
 */
const icon = createFunctionalRenderer((props) => {
  const val = getValueByPath(props.row, props.col.key) ?? ''
  const rp = props.col.renderProps || {}
  if (!val) return ''
  // 判断网络图片
  if (/^https?:\/\//.test(val)) {
    return h(ElImage, {
      src: val,
      previewSrcList: [val],
      previewTeleported: true, 
      fit: 'contain',
      style: 'width:40px;height:40px',
      ...rp
    })
  }
  // 判断 svg 源码
  if (/^\s*<svg[\s\S]*<\/svg>\s*$/.test(val)) {
    return h('div', {
      innerHTML: val,
      style: `width:40px;height:40px;display:inline-block;${rp.style || ''}`,
      ...rp
    })
  }
  // 默认当作 iconfont
  return h('i', {
    class: val,
    style: `font-size:20px;${rp.style || ''}`,
    ...rp
  })
})

/**
 * 所有内置渲染器
 */
export const builtInRenderers = {
  input,
  'input-number': inputNumber,
  select,
  button,
  link,
  html,
  copy,
  img,
  dict,
  map,
  formatter,
  icon,
}

/**
 * 安装所有内置渲染器
 */
export function registerBuiltInRenderers(registry: { registerMultiple: (renderers: Record<string, any>) => void }) {
  registry.registerMultiple(builtInRenderers)
}

/**
 * 创建默认渲染器集合（兼容旧 API）
 * @deprecated 建议使用插件化架构
 */
export function createRenderer() {
  return builtInRenderers
}
