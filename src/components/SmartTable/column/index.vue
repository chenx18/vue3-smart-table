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
  >
    <template #default="{ $index }">
      {{ computeIndex($index) }}
    </template>
  </el-table-column>

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
    :label="col.label"
    align="center"
    v-bind="col.columnProps || {}"
    >
    
    <template #default="scope">
      <!-- 父组件插槽优先 -->
      <template v-if="col.render === 'slot' && $slots[col?.slot || col.key]">
        <slot :name="col?.slot || col.key" v-bind="scope" />
      </template>

      <!-- renderer -->
      <component
        v-else-if="col.render && renderer[col.render]"
        :is="renderer[col.render]"
        :row="scope.row"
        :col="col"
        :onCellChange="handleCellChange"
        :onCellBlur="handleCellBlur"
        :onCellEnter="handleCellEnter"
        :onClick="handleCellClick"
      />
      <!-- 默认文本 -->
      <span v-else
        :style="col.renderProps?.style || ''"
        :class="col.renderProps?.class || ''"
        :title="getValueByPath(scope.row, col.key)">
        {{ getValueByPath(scope.row, col.key) }}
      </span>
    </template>
  </el-table-column>
  
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { PropType } from 'vue'
import type { ColumnConfig } from '../types'
import { getRendererManager } from '../renderer'
import { registerBuiltInRenderers } from '../renderers'
import { useOperationColumn } from '../hooks/useOperationColumn'
import { getValueByPath } from '../utils/path'

const props = defineProps({
  col: { type: Object as PropType<ColumnConfig>, required: true },
  permissions: { type: Array as PropType<string[]>, default: () => [] },
  pagination: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['cellBlur', 'cellEnter', 'cellChange', 'cellClick'])

const computeIndex = (index: number) => {
  const page = props.pagination?.page
  const size = props.pagination?.size
  return page && size ? (page - 1) * size + index + 1 : index + 1
}

/** 解构 col 响应式引用 */
const { col } = toRefs(props)

/** ========== 事件统一上抛 ========== */
const handleCellChange = (row: any, key: string) => emit('cellChange', row, key)
const handleCellBlur = (row: any, key: string) =>  emit('cellBlur', row, key)
const handleCellEnter = (row: any, key: string) => emit('cellEnter', row, key)
const handleCellClick = (row: any, col: any) => emit('cellClick', row, col)

/** ========== renderer 注册 ========== */
// 注册内置渲染器（重复调用会自动跳过已存在的）
registerBuiltInRenderers(getRendererManager())

// 获取所有渲染器（内置 + 自定义）
const renderer = computed(() => {
  const manager = getRendererManager()
  const allRenderers: Record<string, any> = {}

  // 合并内置渲染器和自定义渲染器
  manager.names().forEach((name: string) => {
    const r = manager.get(name)
    if (r) allRenderers[name] = r
  })

  return allRenderers
})

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
  .st_copy_wrapper:hover .st_copy_btn {
    display: inline-block !important;
  }
</style>