<template>
  <el-select
    v-model="value"
    v-bind="selectProps"
    @change="onChange"
    @blur="onBlur"
    @focus="onFocus"
    @visible-change="onVisibleChange"
    @clear="onClear"
    @keyup.enter="onEnter"
  >
    <el-option
      v-for="opt in options"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
      :disabled="opt.disabled"
    />
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ColumnConfig } from '../types'
import { getValueByPath, setValueByPath } from '../utils/path'

interface Props {
  readonly row: any
  readonly col: ColumnConfig
  readonly index: number
  onCellChange?: (row: any, col: ColumnConfig) => void
  onCellBlur?: (row: any, col: ColumnConfig) => void
  onCellEnter?: (row: any, col: ColumnConfig) => void
}

const props = defineProps<Props>()
const value = ref(getValueByPath(props.row, props.col.key))

// 合并默认属性和用户自定义属性
const selectProps = computed(() => {
  const rp = props.col.props || {}
  const { options, onChange, onBlur, onFocus, onVisibleChange, onClear, onEnter, ...rest } = rp
  return {
    placeholder: '请选择',
    size: 'small' as const,
    clearable: true,
    ...rest
  }
})

// 选项列表
const options = computed(() => {
  const rp = props.col.props || {}
  return rp.options || []
})

watch(value, (v) => {
  setValueByPath(props.row, props.col.key, v)
})

const onChange = (val: any) => {
  props.onCellChange?.(props.row, props.col)
  props.col.props?.onChange?.(val, props.row, props.col)
}

const onBlur = (e: FocusEvent) => {
  props.onCellBlur?.(props.row, props.col)
  props.col.props?.onBlur?.(e, props.row, props.col)
}

const onFocus = (e: FocusEvent) => {
  props.col.props?.onFocus?.(e, props.row, props.col)
}

const onVisibleChange = (visible: boolean) => {
  props.col.props?.onVisibleChange?.(visible, props.row, props.col)
}

const onClear = () => {
  props.col.props?.onClear?.(props.row, props.col)
}

const onEnter = (e: KeyboardEvent) => {
  props.onCellEnter?.(props.row, props.col)
  props.col.props?.onEnter?.(e, props.row, props.col)
}
</script>
