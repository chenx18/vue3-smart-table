<template>
  <el-table ref="tableRef"
    v-bind="$attrs"
    :data="data"
    :row-key="rowKey"
    class="smart_table"
    v-loading="loading">

    <template v-for="(col, idx) in visibleColumns" :key="getColumnKey(col, idx)">
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
        v-else-if="col.type === 'operation' && isOperationVisible(col)"
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

      <!-- ========== 数据列 ========== -->
      <el-table-column
        v-else
        :label="col.label"
        align="center"
        v-bind="col.columnProps || {}"
      >
        <template #default="scope">
          <!-- slot 类型 -->
          <template v-if="col.type === 'slot'">
            <slot v-if="scope.$index >= 0" :name="col.slot || col.key" v-bind="scope" />
          </template>

          <!-- 渲染器类型 -->
          <component
            v-else-if="col.type && renderer[col.type]"
            :is="renderer[col.type]"
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
            :style="col.props?.style || ''"
            :class="col.props?.class || ''"
            :title="getValueByPath(scope.row, col.key)">
            {{ getValueByPath(scope.row, col.key) }}
          </span>
        </template>
      </el-table-column>
    </template>
  </el-table>
</template>

<script setup lang="ts" name="SmartTable">
  import { ref, watch, computed } from 'vue'
  import type { ColumnConfig, SmartTableProps, SmartTableEmits, OperationColumn } from './types'
  import { isSpecialColumn, isOperationColumn } from './types'
  import { useTableColumns } from "./hooks/useTableColumns"
  import { useOperationColumn } from './hooks/useOperationColumn'
  import { getRendererManager } from './renderer'
  import { getConfigManager } from './config'
  import { getValueByPath } from './utils/path'

  // Props 定义
  const props = withDefaults(defineProps<SmartTableProps>(), {
    data: () => [],
    columns: () => [],
    rowKey: 'id',
    loading: false,
    permissions: () => [],
    pagination: () => ({}),
  })

  // Emits 定义
  const emit = defineEmits<SmartTableEmits>()

  // ------------------ 初始化渲染器（仅首次） ------------------
  getConfigManager().init()

  // ------------------ columns 处理 ------------------
  const { columns: cachedColumns } = useTableColumns(props.columns, {
    cacheKey: props.cacheKey ?? '',
  })
  
  // 标记是否已初始化，避免初始化时触发不必要的更新
  const isInitialized = ref(false)
  watch(
    cachedColumns,
    (val: ColumnConfig[]) => {
      if (isInitialized.value) {
        emit("update:columns", val)
      }
      isInitialized.value = true
    },
    { deep: true, immediate: true },
  )

  // ------------------ 列处理 ------------------
  
  // 可见列（按用户配置顺序）
  const visibleColumns = computed(() =>
    cachedColumns.value.filter(col => {
      // 特殊列始终显示
      if (isSpecialColumn(col.type)) return true
      // 数据列根据 visible 控制
      return col.visible !== false
    })
  )

  // 生成列的唯一 key
  const getColumnKey = (col: ColumnConfig, idx: number) => {
    if (col.type === 'selection') return `selection-${idx}`
    if (col.type === 'index') return `index-${idx}`
    if (col.type === 'operation') return `operation-${col.key}-${idx}`
    return `${col.key}-${idx}`
  }

  // operation 列集合（用于 hook 管理）
  const operationColumns = computed(() =>
    cachedColumns.value.filter(col => col.type === 'operation')
  )

  // ------------------ index 列序号计算 ------------------
  const computeIndex = (index: number) => {
    const page = props.pagination?.page
    const size = props.pagination?.size
    return page && size ? (page - 1) * size + index + 1 : index + 1
  }

  // ------------------ renderer 获取 ------------------
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
    if (!props.data?.length) return hook.optWidth.value
    // 有行数据，取最大宽度
    return hook.getMaxOptWidth(props.data)
  }

  const getVisibleButtons = (col: OperationColumn, row: any) => {
    const hook = getOperationColumnHook(col)
    if (!hook) return []

    const buttons = col.buttons || []
    if (!buttons.length) return []

    return hook.getVisibleButtons(row)
  }

  // 判断 operation 列是否应该显示
  const isOperationVisible = (col: ColumnConfig) => {
    if (!isOperationColumn(col)) return false
    
    const hook = getOperationColumnHook(col)
    if (!hook) return false

    const buttons = col.buttons || []
    if (!buttons.length) return false

    if (!props.data?.length) return hook.hasAnyButton.value

    return hook.hasAnyVisibleButton(props.data)
  }

  // ------------------ 事件封装 ------------------
  const handleCellChange = (row: any, col: ColumnConfig) => {
    emit('cellChange', row, col)
  }
  const handleCellBlur = (row: any, col: ColumnConfig) => {
    emit('cellBlur', row, col)
  }
  const handleCellEnter = (row: any, col: ColumnConfig) => {
    emit('cellEnter', row, col)
  }
  const handleCellClick = (row: any, col: ColumnConfig) => {
    if (!col) return
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
