<template>
  <el-table ref="tableRef"
    v-bind="$attrs"
    :data="data"
    :row-key="rowKey"
    class="smart_table"
    v-loading="loading">

    <!-- ========== selection 列 ========== -->
    <el-table-column
      v-for="(col, idx) in selectionColumns"
      :key="`selection-${idx}`"
      type="selection"
      v-bind="col.columnProps"
    />

    <!-- ========== index 列 ========== -->
    <el-table-column
      v-for="(col, idx) in indexColumns"
      :key="`index-${idx}`"
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
  import { ref, watch, computed } from 'vue'
  import type { ColumnConfig, SmartTableProps, SmartTableEmits } from './types'
  import { useTableColumns } from "./hooks/useTableColumns"
  import { useOperationColumn } from './hooks/useOperationColumn'
  import { getRendererManager } from './renderer'
  import { getConfigManager } from './config'
  import { getValueByPath } from './utils/path'

  // Props 定义 - 与 SmartForm 风格一致
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

  const getVisibleButtons = (col: ColumnConfig, row: any) => {
    const hook = getOperationColumnHook(col)
    if (!hook) return []

    const buttons = col.buttons || []
    if (!buttons.length) return []

    return hook.getVisibleButtons(row)
  }

  const getOperationColumns = () => {
    return operationColumns.value.filter(col => {
      const hook = getOperationColumnHook(col)
      if (!hook) return false

      const buttons = col.buttons || []
      if (!buttons.length) return false

      if (!props.data?.length) return hook.hasAnyButton.value

      return hook.hasAnyVisibleButton(props.data)
    })
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
