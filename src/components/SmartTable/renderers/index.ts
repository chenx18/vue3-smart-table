/**
 * 内置渲染器集�?
 * 可以按需引入或批量注�?
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
 * 提取 props 中的事件（on 开头的属性）
 */
const extractEvents = (rp: Record<string, any>) => {
  const events: Record<string, any> = {}
  const props: Record<string, any> = {}
  
  Object.keys(rp).forEach(key => {
    if (key.startsWith('on') && typeof rp[key] === 'function') {
      events[key] = rp[key]
    } else {
      props[key] = rp[key]
    }
  })
  
  return { events, props }
}

/**
 * button 渲染�?
 */
const button = createFunctionalRenderer((props) => {
  const rp = props.col.props || {}
  const val = getValueByPath(props.row, props.col.key)
  const { events, props: restProps } = extractEvents(rp)
  
  return h(ElButton as any, {
    type: 'primary',
    ...restProps,
    ...events,
    onClick: (e: Event) => {
      props.onClick?.(props.row, props.col)
      // 支持用户自定�?onClick
      rp.onClick?.(e, props.row, props.col)
    }
  }, () => rp.label || val)
})

/**
 * link 渲染�?
 */
const link = createFunctionalRenderer((props) => {
  const rp = props.col.props || {}
  const val = getValueByPath(props.row, props.col.key)
  const { href, blank, label, ...restProps } = rp
  
  return h('a', {
    href: href || val || '#',
    target: blank ? '_blank' : '_self',
    rel: blank ? 'noopener noreferrer' : undefined,
    style: 'color:#409EFF;cursor:pointer;text-decoration:none;',
    ...restProps,
  }, label || val)
})

/**
 * html 渲染�?
 */
const html = createFunctionalRenderer((props) => {
  const val = getValueByPath(props.row, props.col.key)
  const rp = props.col?.props || {}
  const { style, class: className, ...restProps } = rp
  
  return h('div', {
    class: className || 'line-clamp-2',
    style,
    innerHTML: val ?? '',
    ...restProps
  })
})

/**
 * copy 渲染�?
 */
const copy = createFunctionalRenderer((props) => {
  const val = getValueByPath(props.row, props.col.key) ?? ''
  const rp = props.col.props ?? {}
  const { iconColor, copyTitle, successText, errorText, lineClamp, textStyles, textClass, ...restProps } = rp
  
  const butStyle = {
    'position': 'absolute',
    'right': '-5px',
    'top': '50%',
    'transform': 'translateY(-50%)',
    'cursor': 'pointer',
    'display': 'none',
    'font-size': '12px',
    'color': iconColor || '#409EFF',
    'user-select': 'none'
  }
  const textStyleObj = {
    'padding-right': '10px',
    'display': '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': lineClamp ?? 2,
    'overflow': 'hidden',
    ...textStyles
  }
  
  return h('div', {
      class: 'st_copy_wrapper',
      style: 'width: 100%; position: relative; display: inline-block;',
      ...restProps
    },
    [
      h('span', {
        class: `st_copy_text ${textClass ?? ''}`,
        style: textStyleObj,
        title: val
      }, val),
      val && h('span', {
        class: 'st_copy_btn',
        style: butStyle,
        title: copyTitle || '复制',
        onClick: () => {
          if (!val) return
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(val).then(() => {
                ElMessage.success(successText ?? '复制成功')
              }).catch(() => {
                ElMessage.error(errorText ?? '复制失败')
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
                ElMessage.success(successText ?? '复制成功')
              } else {
                ElMessage.error(errorText ?? '复制失败')
              }
            }
          } catch (err) {
            ElMessage.error(errorText ?? '复制失败')
          }
        }
      }, [h(DocumentCopy, {
        style: 'width: 1em; height: 1em;'
      })])
    ].filter(Boolean)
  )
})

/**
 * img 渲染�?
 */
const img = createFunctionalRenderer((props) => {
  const val = getValueByPath(props.row, props.col.key) ?? ''
  const rp = props.col?.props || {}
  const { width, height, fit, previewSrcList, placeholder, style, ...restProps } = rp

  const getImageList = () => {
    if (!val) return []
    if (Array.isArray(val)) {
      return val.filter(item => item && typeof item === 'string')
    }
    return [val]
  }

  const imageList = getImageList()

  if (imageList.length === 0) {
    return placeholder || ''
  }

  const defaultStyle = {
    width: width || '80px',
    height: height || '80px',
    marginRight: imageList.length > 1 ? '4px' : '0',
    ...(typeof style === 'object' ? style : {})
  }

  const imageProps = {
    previewSrcList: previewSrcList || imageList,
    previewTeleported: true, 
    fit: fit || 'contain',
    style: defaultStyle,
    ...restProps
  }

  if (imageList.length === 1) {
    return h(ElImage, {
      src: imageList[0],
      ...imageProps
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
        ...imageProps
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
 * dict 渲染�?
 */
const dict = createFunctionalRenderer((props) => {
  const val = getValueByPath(props.row, props.col.key) ?? ''
  const rp = props.col.props || {}
  const { options = [], showValue = false, ...restProps } = rp

  if (val === null || val === undefined || val === '') return ''

  const values = Array.isArray(val) ? val.map(String) : [String(val)]
  const matchedOptions = options.filter((opt: any) => values.includes(String(opt.value)))
  const unmatched = values.filter((v: string) => !options.some((opt: any) => String(opt.value) === v))

  const children = matchedOptions.map((item: any) => {
    const { listClass, cssClass, tagProps, ...itemRest } = item
    return h(
      ElTag,
      { 
        key: item.value, 
        type: listClass, 
        class: cssClass, 
        disableTransitions: true,
        ...restProps,
        ...tagProps
      },
      { default: () => item.label + ' ' }
    )
  })

  if (showValue && unmatched.length > 0) {
    children.push(h('span', {}, unmatched.join(' ')))
  }

  return h('div', { style: 'display: inline-flex; gap: 4px; flex-wrap: wrap;' }, children)
})

/**
 * map 渲染�?
 */
const map = createFunctionalRenderer((props) => {
  const val = getValueByPath(props.row, props.col.key) ?? ''
  const rp = props.col.props || {}
  const { options = {}, ...restProps } = rp
  const mappedVal = val != null ? options[val] ?? '' : ''
  
  return h('span', { ...restProps }, mappedVal)
})

/**
 * formatter 渲染�?
 */
export function isDataColumn(
  col: ColumnConfig
): col is any {
  return typeof (col as any).formatter === 'function'
}

const formatter = createFunctionalRenderer((props) => {
  const { col, row, index } = props
  const val = getValueByPath(props.row, props.col.key) ?? ''
  const rp = props.col.props || {}
  
  let content = val
  if (isDataColumn(col)) {
    content = col.formatter?.(val, row, index) ?? val
  }
  
  return h('span', { ...rp }, content)
})

/**
 * icon 渲染�?
 */
const icon = createFunctionalRenderer((props) => {
  const val = getValueByPath(props.row, props.col.key) ?? ''
  const rp = props.col.props || {}
  const { style, size, class: className, ...restProps } = rp
  
  if (!val) return ''
  
  const iconSize = size ? `${size}px` : '20px'
  
  // 判断网络图片
  if (/^https?:\/\//.test(val)) {
    return h(ElImage, {
      src: val,
      previewSrcList: [val],
      previewTeleported: true, 
      fit: 'contain',
      style: { width: '40px', height: '40px', ...(typeof style === 'object' ? style : {}) },
      ...restProps
    })
  }
  
  // 判断 svg 源码
  if (/^\s*<svg[\s\S]*<\/svg>\s*$/.test(val)) {
    return h('div', {
      innerHTML: val,
      class: className,
      style: { 
        width: '40px', 
        height: '40px', 
        display: 'inline-block',
        ...(typeof style === 'object' ? style : {})
      },
      ...restProps
    })
  }
  
  // 默认当作 iconfont
  return h('i', {
    class: [val, className].filter(Boolean).join(' '),
    style: { 
      fontSize: iconSize,
      ...(typeof style === 'object' ? style : {})
    },
    ...restProps
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
 * 创建默认渲染器集合（兼容�?API�?
 * @deprecated 建议使用插件化架�?
 */
export function createRenderer() {
  return builtInRenderers
}
