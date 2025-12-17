<template>
  <!-- ========== selection 列 ========== -->
  <el-table-column
    v-if="col.type === 'selection'"
    type="selection"
    v-bind="col.columnProps"
  />

  <!-- ========== index 列 ========== -->
  <el-table-column
    v-else-if="col.type === 'index'"
    type="index"
    :label="col.label || '#'"
    align="center"
    v-bind="col.columnProps"
  />

  <!-- ========== operation 列 ========== -->
  <el-table-column
    v-else-if="col.type === 'operation' && showOperationColumn"
    :label="col.label || '操作'"
    align="center"
    v-bind="{
      ...col.columnProps,
      width: operationWidth
    }"
  >
    <template #default="{ row }">
      <el-button
        v-for="btn in getVisibleButtons(row)"
        :key="btn.label"
        :type="btn.type || 'primary'"
        link
        @click="btn.action(row)"
      >
        {{ btn.label }}
      </el-button>
    </template>
  </el-table-column>

  <!-- ========== 普通列 / renderer / editable ========== -->
  <el-table-column
   v-else-if="isDataOrOperationColumn(col)"
    :prop="col.key"
    :label="col.label"
    align="center"
    v-bind="col.columnProps || {}"
  >
    <template #default="{ row }">
      <!-- renderer -->
      <component
        v-if="col.render && renderer[col.render]"
        :is="renderer[col.render]"
        :row="row"
        :col="col"
        :onCellChange="handleCellChange"
        :onCellBlur="handleCellBlur"
        :onCellEnter="handleCellEnter"
        :onClick="handleCellClick"
      />

      <!-- default -->
      <template v-else>
        <span
          :style="col.renderProps?.style || ''"
          :class="col.renderProps?.class || ''"
          :title="row[col.key!]">
          {{ row[col.key!] }}
        </span>
      </template>
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { PropType } from 'vue'
import type { ColumnConfig, DataColumn, OperationColumn } from '../types'
import { createRenderer } from './renderers'
import { useOperationColumn } from '../hooks/useOperationColumn'

const props = defineProps({
  col: { type: Object as PropType<ColumnConfig>, required: true },
  permissions: { type: Array as PropType<string[]>, default: () => [] }
})

const emit = defineEmits(['cellBlur', 'cellEnter', 'cellChange', 'cellClick'])

/** 解构 col 响应式引用 */
const { col } = toRefs(props)

/** ========== 事件统一上抛 ========== */
const handleCellChange = (row: any, key: string) => emit('cellChange', row, key)
const handleCellBlur = (row: any, key: string) =>  emit('cellBlur', row, key)
const handleCellEnter = (row: any, key: string) => emit('cellEnter', row, key)
const handleCellClick = (row: any, col: any) => emit('cellClick', row, col)

/** ========== renderer 注册 ========== */
const renderer = createRenderer()

/** ========== operation 列逻辑 ========== */
const {
  hasAnyButton,
  hasAnyVisibleButton,
  optWidth,
  getMaxOptWidth,
  getVisibleButtons
} = useOperationColumn(
  col.value.buttons || [],
  col.value.maxbtn ?? 10,
  props.permissions || []
)

/** 是否显示操作列 */
const showOperationColumn = computed(() => {
  const buttons = col.value.buttons || []
  if (!buttons.length) return false  // 没有配置按钮直接隐藏

  const rows = col.value.__rows || []
  
  // 无行数据时，至少有一个按钮有权限就显示
  if (!rows.length) return hasAnyButton.value
  
  // 有行数据时，至少一行有可见按钮才显示
  return hasAnyVisibleButton(col.value.__rows || [])
})

/** 操作列宽度 */
const operationWidth = computed(() => {
  // 无行数据，用静态宽度
  if (!col.value.__rows) return optWidth.value 
  // 有行数据，取最大宽度
  return getMaxOptWidth(col.value.__rows)
})

function isDataOrOperationColumn(c: ColumnConfig) {
  if (c.type === 'selection' || c.type === 'index') return false
  if (c.type === 'operation' && !showOperationColumn.value) return false
  if (c.visible === false) return false
  return true
}
</script>
<style>
  .copy-wrapper:hover .copy-btn {
    display: inline-block !important;
  }
</style>