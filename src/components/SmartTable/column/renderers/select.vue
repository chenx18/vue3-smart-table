<template>
  <el-select
    v-model="value"
    v-bind="{ placeholder: '请选择', size: 'small', clearable: true, ...col.renderProps }"
    @change="onChange"
    @blur="onBlur"
    @keyup.enter="onEnter"
  >
    <el-option
      v-for="opt in col.renderProps?.options || []"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
    />
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ColumnConfig } from '../../types'

interface Props {
  readonly row: any
  readonly col: ColumnConfig
  onCellChange?: (row: any, col: ColumnConfig) => void
  onCellBlur?: (row: any, col: ColumnConfig) => void
  onCellEnter?: (row: any, col: ColumnConfig) => void
}

const props = defineProps<Props>()
const value = ref(props.row[props.col.key])

watch(value, (v) => {
  props.row[props.col.key] = v
})

const onChange = () => props.onCellChange?.(props.row, props.col)
const onBlur = () => props.onCellBlur?.(props.row, props.col)
const onEnter = () => props.onCellEnter?.(props.row, props.col)
</script>
