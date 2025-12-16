import { defineComponent, h } from 'vue';
import { ElButton, ElTag, ElImage, ElMessage } from 'element-plus'
import type { ColumnConfig, DataColumn } from '../../types'
import EditableInput from './input.vue'
import EditableNumber from './inputNumber.vue'
import EditableSelect from './select.vue'
import { DefaultRow } from 'element-plus/es/components/table/src/table/defaults';

/** 统一 renderer props 类型 */
export interface RendererProps {
  row: any
  col: ColumnConfig
  onCellChange?: (row: any, col: any) => void
  onCellBlur?: (row: any, col: any) => void
  onCellEnter?: (row: any, col: any) => void
  onClick?: (row: any, col: any) => void
}

/** 类型安全包装 SFC 组件，兼容 TS */
const wrapSFC = (comp: any) =>
  defineComponent({
    props: ['row', 'col', 'onCellChange', 'onCellBlur', 'onCellEnter', 'onClick'],
    setup(props: RendererProps) {
      return () => h(comp, props)
    }
  })

export function isDataColumn<R extends DefaultRow>(
  col: ColumnConfig<R>
): col is DataColumn<R> {
  return typeof (col as any).formatter === 'function'
}
  

export function createRenderer() {
  return {
    input: wrapSFC(EditableInput),
    'input-number': wrapSFC(EditableNumber),
    select: wrapSFC(EditableSelect),

    button: (props: RendererProps) => {
      const rp = props.col.renderProps || {}
      return h(ElButton as any, {
        type: rp.type || 'primary',
        ...rp,
        onClick: () => props.onClick?.(props.row, props.col)
      }, () => rp.label || props.row[props.col.key])
    },
    
    link: (props: RendererProps) => {
      const rp = props.col.renderProps || {}
      return h('a', {
        href: rp.href || '#',
        target: rp.blank ? '_blank' : '_self',
        style: rp.style || 'color:#409EFF;cursor:pointer;',
        onClick: (e: MouseEvent) => {
          e.preventDefault()
          props.onClick?.(props.row, props.col)
        }
      }, rp.label || props.row[props.col.key])
    },

    html: (props: RendererProps) =>{
      return h('div', {
        class: 'line-clamp-2',
        innerHTML: props.row[props.col.key] ?? '',
        ...(props.col?.renderProps || {})
      })
    },

    copy: (props: RendererProps) => {
      const val = props.row[props.col.key] ?? ''
      return h( 'div', {
          class: 'copy-wrapper',
          style: 'position: relative; display: inline-block;'
        },
        [
          h('span', {
            class: 'copy-text line-clamp-1',
            style: 'padding-right: 20px;',
          }, val),
          h(
            'span',
            {
              class: 'copy-btn',
              style: `
                position: absolute;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                cursor: pointer;
                display: none;
                font-size: 12px;
                color: #409EFF;
                user-select: none;
              `,
              onClick: () => {
                if (!val) return
                try {
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    // 现代浏览器
                    navigator.clipboard.writeText(val).then(() => {
                      ElMessage.success('复制成功')
                    }).catch(() => {
                      ElMessage.error('复制失败')
                    })
                  } else {
                    // 兼容旧浏览器
                    const textarea = document.createElement('textarea')
                    textarea.value = val
                    textarea.style.position = 'fixed' // 避免滚动影响
                    textarea.style.opacity = '0'
                    document.body.appendChild(textarea)
                    textarea.select()
                    const successful = document.execCommand('copy')
                    document.body.removeChild(textarea)
              
                    if (successful) {
                      ElMessage.success('复制成功')
                    } else {
                      ElMessage.error('复制失败')
                    }
                  }
                } catch (err) {
                  ElMessage.error('复制失败')
                }
              }
            },
            '📋' // 复制图标，可用 Element Plus 图标替换
          )
        ]
      )
    },

    img: (props: RendererProps) =>{
      const val = props.row[props.col.key] ?? ''
      const rp = props.col?.renderProps || {};
      return h(ElImage, {
        src: val,
        previewSrcList: rp?.previewSrcList ?? (Array.isArray(val) ? val : [val]),
        fit: 'contain',
        style: 'width:80px;height:80px',
        ...rp
      })
    },

    dict: (props: RendererProps) => {
      const val = props.row[props.col.key];
      const rp = props.col.renderProps || {};
      const options = rp.options ?? [];
      const showValue = rp.showValue ?? false;
    
      if (val === null || val === undefined || val === '') return '';

      const values = Array.isArray(val) ? val.map(String) : [String(val)];
      const matchedOptions = options.filter((opt: any) => values.includes(String(opt.value)));
      const unmatched = values.filter(v => !options.some((opt: any) => String(opt.value) === v));
    
      // 渲染节点
      const children = matchedOptions.map((item: any, _index: number) => {
        return h(
          ElTag,
          { key: item.value, type: item.listClass, class: item.cssClass, disableTransitions: true },
          { default: () => item.label + ' ' }
        );
      });
    
      // 渲染未匹配值
      if (showValue && unmatched.length > 0) {
        children.push(h('span', {}, unmatched.join(' ')));
      }
    
      return h('div', {}, children);
    },

    map: (props: RendererProps) =>{
      const val = props.row[props.col.key]
      const options = (props.col.renderProps?.options ?? {}) as Record<string, any>
      return val != null ? options[val] ?? '' : ''
    },

    formatter: (props: RendererProps) =>{
      const { col, row } = props
      const value = row[col.key]
      if (isDataColumn(col)) {
        return col.formatter?.(value, row)
      }
      return value ?? ''
    },

    icon: (props: RendererProps) => {
      const val = props.row[props.col.key] ?? '';
      const rp = props.col.renderProps || {};
      if (!val) return '';
      // 判断网络图片
      if (/^https?:\/\//.test(val)) {
        return h(ElImage, {
          src: val,
          previewSrcList: [val],
          fit: 'contain',
          style: 'width:40px;height:40px',
          ...rp
        });
      }
      // 判断 svg 源码
      if (/^\s*<svg[\s\S]*<\/svg>\s*$/.test(val)) {
        return h('div', {
          innerHTML: val,
          style: `width:40px;height:40px;display:inline-block;${rp.style || ''}`,
          ...rp
        });
      }
      // 默认当作 iconfont
      return h('i', {
        class: val, // val 直接当 className
        style: `font-size:20px;${rp.style || ''}`,
        ...rp
      });
    },

  }
}

