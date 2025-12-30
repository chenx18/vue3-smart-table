<template>
  <el-table ref="tableRef"
    v-bind="$attrs"
    :data="data"
    :row-key="rowKey"
    class="smart_table"
    v-loading="loading">

    <!-- ========== selection 列 ========== -->
    <el-table-column
      v-for="col in selectionColumns"
      key="selection"
      type="selection"
      v-bind="col.columnProps"
    />

    <!-- ========== index 列 ========== -->
    <el-table-column
      v-for="col in indexColumns"
      key="index"
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
      v-for="col in getOperationColumns()"
      :key="col.key"
      :label="col.label || '操作'"
      align="center"
      v-bind="{
        ...col.columnProps,
        width: getOperationWidth(col)
      }"
    >
      <template #default="{ row }">
        <el-button
          v-for="btn in getVisibleButtons(col, row)"
          :key="btn.label"
          :type="btn.type || 'primary'"
          link
          @click="btn.action(row)"
        >
          {{ btn.label }}
        </el-button>
      </template>
    </el-table-column>

    <!-- ========== 普通数据列 ========== -->
    <el-table-column
      v-for="(col, idx) in dataColumns"
      :key="`${col.key}-${idx}`"
      :label="col.label"
      align="center"
      v-bind="col.columnProps || {}"
    >
      <template #default="scope">
        <!-- 父组件插槽优先 -->
        <template v-if="col.render === 'slot'">
          <!-- 跳过 el-table 的预渲染（$index === -1 时是假数据） -->
          <slot v-if="scope.$index >= 0" :name="col?.slot || col.key" v-bind="scope" />
        </template>

        <!-- renderer -->
        <component
          v-else-if="col.render && renderer[col.render]"
          :is="renderer[col.render]"
          :row="scope.row"
          :col="col"
          :index="scope.$index"
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
  </el-table>
</template>

<script setup lang="ts" name="SmartTable">
  import { PropType, ref, watch, computed } from 'vue'
  import type { BaseColumn, ColumnConfig } from './types'
  import { useTableColumns } from "./hooks/useTableColumns"
  import { useOperationColumn } from './hooks/useOperationColumn'
  import { getRendererManager } from './renderer'
  import { registerBuiltInRenderers } from './renderers'
  import { getValueByPath } from './utils/path'

  const props = defineProps({
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    rowKey: { type: String, default: 'id' },
    loading: { type: Boolean, default: false },
    permissions: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    cacheKey: String,
    pagination: { type: Object, default: () => ({}) },
  })

  const emit = defineEmits([
    'update:columns',
    'cellChange',
    'cellBlur',
    'cellEnter',
    'cellClick',
  ])

  // ------------------ columns 处理 ------------------
  const { columns: cachedColumns } = useTableColumns(props.columns, {
    cacheKey: props.cacheKey ?? '',
  })
  
  // 标记是否已初始化，避免初始化时触发不必要的更新
  let isInitialized = false
  watch(
    cachedColumns,
    (val: ColumnConfig[]) => {
      if (isInitialized) {
        emit("update:columns", val)
      }
      isInitialized = true
    },
    { deep: true, immediate: true },
  )

  // ------------------ 将行数据传递给 operation 列 ------------------
  watch(
    () => props.data,
    (newData) => {
      if (!newData) return

      // 为 operation 列注入 __rows，用于计算宽度
      cachedColumns.value.forEach((col: ColumnConfig) => {
        if (col.type === 'operation') {
          col.__rows = newData
        }
      })
    },
    { deep: true, immediate: true }
  )

  // ------------------ 列分类 ------------------
  const selectionColumns = computed(() =>
    cachedColumns.value.filter(col => col.type === 'selection')
  )

  const indexColumns = computed(() =>
    cachedColumns.value.filter(col => col.type === 'index')
  )

  const operationColumns = computed(() =>
    cachedColumns.value.filter(col => col.type === 'operation')
  )

  const dataColumns = computed(() =>
    cachedColumns.value.filter(col => {
      if (col.type === 'selection' || col.type === 'index') return false
      if (col.type === 'operation') return false
      if (col.visible === false) return false
      return true
    })
  )

  // ------------------ index 列序号计算 ------------------
  const computeIndex = (index: number) => {
    const page = props.pagination?.page
    const size = props.pagination?.size
    return page && size ? (page - 1) * size + index + 1 : index + 1
  }

  // ------------------ renderer 注册 ------------------
  registerBuiltInRenderers(getRendererManager())

  const renderer = computed(() => {
    const manager = getRendererManager()
    const allRenderers: Record<string, any> = {}

    manager.names().forEach((name: string) => {
      const r = manager.get(name)
      if (r) allRenderers[name] = r
    })

    return allRenderers
  })

  // ------------------ operation 列逻辑 ------------------
  // 为每个 operation 列创建 useOperationColumn 实例
  const operationColumnMap = computed(() => {
    const map = new Map<string, ReturnType<typeof useOperationColumn>>()

    operationColumns.value.forEach(col => {
      const hook = useOperationColumn(
        col.buttons || [],
        col.maxbtn ?? 10,
        props.permissions || []
      )
      map.set(col.key, hook)
    })

    return map
  })

  const getOperationColumnHook = (col: ColumnConfig) => {
    return operationColumnMap.value.get(col.key)
  }

  const getOperationWidth = (col: ColumnConfig) => {
    const hook = getOperationColumnHook(col)
    if (!hook) return 0

    // 无行数据，用静态宽度
    if (!col.__rows) return hook.optWidth.value
    // 有行数据，取最大宽度
    return hook.getMaxOptWidth(col.__rows)
  }

  const getVisibleButtons = (col: ColumnConfig, row: any) => {
    const hook = getOperationColumnHook(col)
    if (!hook) return []

    // 检查 operation 列是否应该显示
    const buttons = col.buttons || []
    if (!buttons.length) return []

    const rows = col.__rows || []
    if (!rows.length) {
      // 无行数据，基于权限判断
      return hook.getVisibleButtons(row)
    }

    // 有行数据，基于权限 + visible 判断
    return hook.getVisibleButtons(row)
  }

  const getOperationColumns = () => {
    return operationColumns.value.filter(col => {
      const hook = getOperationColumnHook(col)
      if (!hook) return false

      const buttons = col.buttons || []
      if (!buttons.length) return false

      const rows = col.__rows || []
      if (!rows.length) return hook.hasAnyButton.value

      return hook.hasAnyVisibleButton(col.__rows || [])
    })
  }

  // ----------------事件封装 ------------------
  const handleCellChange = (row: any, key: string) => {
    emit('cellChange', row, key)
  }
  const handleCellBlur = (row: any, key: string) => {
    emit('cellBlur', row, key)
  }
  const handleCellEnter = (row: any, key: string) => {
    emit('cellEnter', row, key)
  }
  const handleCellClick = (row: any, col: any) => {
    if(!col) return
    emit('cellClick', row, col)
  }

  // el-table
  const tableRef = ref();
  defineExpose({
    tableRef,
  });

</script>

<style>
  .smart_table {
    width: 100%;
  }
  
  .st_copy_wrapper:hover .st_copy_btn {
    display: inline-block !important;
  }

  .st_copy_btn:hover {
    transform: translateY(-50%) scale(1.1);
  }
</style>
