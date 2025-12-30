<template>
  <el-input-number
    v-model="value"
    v-bind="inputProps"
    @blur="onBlur"
    @focus="onFocus"
    @change="onChange"
    @keyup.enter="onEnter"
  />
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
const inputProps = computed(() => {
  const rp = props.col.props || {}
  const { onBlur, onFocus, onChange, onEnter, ...rest } = rp
  return {
    min: 0,
    max: 99999,
    controls: false,
    size: 'small' as const,
    ...rest
  }
})

watch(value, (v) => {
  setValueByPath(props.row, props.col.key, v)
})

const onChange = (val: number | undefined, oldVal: number | undefined) => {
  props.onCellChange?.(props.row, props.col)
  props.col.props?.onChange?.(val, oldVal, props.row, props.col)
}

const onBlur = (e: FocusEvent) => {
  props.onCellBlur?.(props.row, props.col)
  props.col.props?.onBlur?.(e, props.row, props.col)
}

const onFocus = (e: FocusEvent) => {
  props.col.props?.onFocus?.(e, props.row, props.col)
}

const onEnter = (e: KeyboardEvent) => {
  props.onCellEnter?.(props.row, props.col)
  props.col.props?.onEnter?.(e, props.row, props.col)
}
</script>
