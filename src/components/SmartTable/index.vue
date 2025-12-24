<template>
  <el-table ref="tableRef"
    v-bind="$attrs"
    :data="data"
    :row-key="rowKey"
    class="smart-table"
    v-loading="loading">
    <TableColumn 
      v-for="col in cachedColumns" 
      :key="col.key" 
      :col="col" 
      :permissions="permissions"
      :pagination="pagination"
      @cell-change="handleCellChange"
      @cell-blur="handleCellBlur"
      @cell-enter="handleCellEnter"
      @cell-click="handleCellClick">
      <template v-for="col in cachedColumns" #[col.key]="slotProps">
        <slot :name="col.key" v-bind="slotProps" />
      </template>
    </TableColumn>
  </el-table>
</template>

<script setup lang="ts" name="SmartTable">
  import { PropType, ref, watch } from 'vue'
  import TableColumn from './column/index.vue'
  import type { BaseColumn, ColumnConfig } from './types'
  import { useTableColumns } from "./hooks/useTableColumns"

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
    'cell-click',
  ])

  // ------------------ columns 处理 ------------------
  const { columns: cachedColumns } = useTableColumns(props.columns, {
    cacheKey: props.cacheKey ?? '',
  })
  watch(
    cachedColumns,
    (val: ColumnConfig[]) => emit("update:columns", val),
    { deep: true, immediate: true },
  )

  // ----------------事件封装 ------------------
  const handleCellChange = (row: any, key: string) => emit('cellChange', row, key)
  const handleCellBlur = (row: any, key: string) => {
    emit('cellBlur', row, key)
  }
  const handleCellEnter = (row: any, key: string) => {
    console.log('enter')
    emit('cellEnter', row, key)
  }
  
  // SmartTable
  const handleCellClick = (row: any, col: any) => {
    if(!col) return
    emit('cell-click', row, col)
  }

  // el-table
  const tableRef = ref();
  defineExpose({
    tableRef,
  });

</script>

<style scoped>
  .smart-table {
    width: 100%;
  }
</style>
