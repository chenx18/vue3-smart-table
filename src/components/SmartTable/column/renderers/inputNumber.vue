<template>
  <el-input-number
    v-model="value"
    v-bind="{ min: 0, max: 99999, controls: false, size: 'small', ...col.renderProps }"
    @blur="onBlur"
    @keyup.enter="onEnter"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ColumnConfig } from '../../types'
import { getValueByPath, setValueByPath } from '@/utils/path'

interface Props {
  readonly row: any
  readonly col: ColumnConfig
  onCellChange?: (row: any, col: ColumnConfig) => void
  onCellBlur?: (row: any, col: ColumnConfig) => void
  onCellEnter?: (row: any, col: ColumnConfig) => void
}

const props = defineProps<Props>()
const value = ref(getValueByPath(props.row, props.col.key))

watch(value, (v) => {
  setValueByPath(props.row, props.col.key, v)
  props.onCellChange?.(props.row, props.col)
})

const onBlur = () => props.onCellBlur?.(props.row, props.col)
const onEnter = () => props.onCellEnter?.(props.row, props.col)
</script>
