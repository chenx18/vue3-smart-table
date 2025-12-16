<template>
    <div class="demo-container" style="padding: 20px;">
      <h2>vue3-smart-table Demo</h2>
      <SmartTable
        :data="tableData"
        v-model:columns="columns"
        :permissions="permissions"
        @cell-blur="onCellBlur"
        @cell-enter="onCellEnter"
        @cell-change="onCellChange"
        @cell-click="onCellClick"
      />
    </div>
  </template>
  
  <script setup lang="ts" name="APP">
  import { reactive, ref } from 'vue'
  import SmartTable from '../src/index'
  import type { ColumnConfig } from '../src/components/SmartTable/types'
  const Enables = [
        { label: '启用', value: 1, listClass: 'primary' },
        { label: '禁用', value: 0, listClass: 'warning' }
  ]
  const buttonConfigs: any = [
    { permission: '', label: '编辑', type: 'primary', action: (row: any) => console.log(row)},
    { permission: '', label:'删除', type: 'danger', action: (row: any) => console.log(row)},
    { permission: '', label: '复制', type: 'success', action: (row: any) => console.log(row)},
  ]
  // 示例列配置 
  const columns = ref<ColumnConfig[]>([
    { 
      type: 'selection',
      key: 'index', 
      inControl: false,
    },
    { 
      type: 'index',
      key: 'index', 
      label: '序号', 
      inControl: false,
      columnProps: { width: 60}
    },
    {
      type: 'operation',
      key: 'opt',
      label: '操作',
      inControl: false,
      buttons: buttonConfigs, 
      columnProps: {
        fixed: "right",
        align: "left"
      }
    },
    {
      key: 'action',
      label: '按钮',
      render: 'button',
      renderProps: {
        label: '编辑',
        type: 'text'
      }
    },
    {
      key: 'url',
      label: 'li单元格',
      render: 'link',
      renderProps: {
        label: '查看详情',
        href: 'https://example.com',
        blank: true
      }
    },
    { 
      key: "selectId", 
      label: "可选单元格", 
      visible: true,
      render: 'select',
      columnProps: { minWidth: 150},
      renderProps:{
        options: [
          {label: '选中-1', value: 1},
          {label: '选中-2', value: 2},
        ]
      }
    },
    { 
      key: "orderNum", 
      label: "输入单元格", 
      visible: true,
      render: 'input-number',
      columnProps: { minWidth: 150, sortable: true} 
    },
    { 
      key: 'id', 
      label: 'ID', 
      visible: true 
    },
    { 
      key: 'name', 
      label: 'Name', 
      visible: true, 
      render: 'html' 
    },
    { 
      key: "code", 
      label: "系统标识", 
      visible: true, 
      render: "copy",
      columnProps: { minWidth: 160, sortable: true}
    },
    { 
      key: "logoUrl", 
      label: "图片", 
      visible: true, 
      render: 'img',
      columnProps: { minWidth: 150}
    },
    { 
      key: "status", 
      label: "状态", 
      visible: true, 
      render: "dict",
      renderProps: {
        options: Enables,
      },
      columnProps: { minWidth: 80, sortable: true}
    },
    { 
      key: 'map', 
      label: 'Map', 
      visible: true, 
      render: 'map', 
      renderProps: { options: { 1: 'Active', 0: 'Inactive' } } 
    },
    { 
      key: "regionCode", 
      label: "区域", 
      visible: true, 
      render: "formatter",
      columnProps: { minWidth: 100, sortable: true, align: 'left'},
      formatter: (val: string) => `${val}-123`,
    },
  ])

  // 示例表格数据 id name code logoUrl status  map regionCode orderNum
  const defImgUrl = 'https://iconfont.alicdn.com/p/illus_3d/file/UMAqlm6KX5gw/8e357f00-9a4e-44c4-b0c5-bbed255cff24.png'
  const tableData = reactive([
    { id: 1, name: 'Alice', code: '9527', logoUrl: defImgUrl, status: 1, map: 1, regionCode:'海外', orderNum: 1, selectId: 1 },
    { id: 2, name: 'Bob', code: '9526', logoUrl: defImgUrl, status: 1, map: 1, regionCode:'海外', orderNum: 1, selectId: 1 },
    { id: 3, name: 'Charlie', code: '9525', logoUrl: defImgUrl, status: 0, map: 1, regionCode:'海外', orderNum: 1, selectId: 2 },
  ])

  const permissions = ['edit', 'view']

  // 编辑单元格回调
  const onCellBlur = (row: any, col: any) => {
    console.log('cell blur:', row, col)
  }
  const onCellEnter = (row: any, col: any) => {
    console.log('cell enter:', row, col)
  }
  const onCellChange = (row: any, col: any) => {
    console.log('cell Change:', row, col)
  }
  
  const onCellClick = (row: any, col: any) => {
    console.log('cell button click:', row, col)
  }
  </script>
  