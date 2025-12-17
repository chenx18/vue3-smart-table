<template>
    <div class="demo-container" style="padding: 20px;">
      <h2>Demo</h2>
      <SmartTable
        class="h-400px"
        class-name="table-flex" 
        :border="true" 
        :loading="loading"
        :pageKey="'route.name'"
        :rowKey="'id'"
        :data="tableData"
        v-model:columns="columns"
        :userId="'userId'"
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
  import { SmartTable } from '../src/index'
  const Enables = [
    { label: '启用', value: 1, listClass: 'primary' },
    { label: '禁用', value: 0, listClass: 'warning' }
  ]
  const buttonConfigs = [
    { permission: 'edit', label: '编辑', type: 'primary', action: (row: any) => console.log(row)},
    { permission: 'view', label:'删除', type: 'danger', action: (row: any) => console.log(row)},
    { permission: 'copy', label: '复制', type: 'success', action: (row: any) => console.log(row)},
  ]
  const permissions = ['edit', 'view']
  const loading = ref(false)
  // 示例列配置 
  const columns = ref([
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
      key: 'avatar',
      label: '头像',
      render: 'img',
      columnProps: { minWidth: 150, sortable: true},
      renderProps: {
        width: '60px',
        height: '60px',
        fit: 'cover',
        placeholder: '--'
      }
    },
    {
      key: 'gallery',
      label: '相册',
      render: 'img',
      columnProps: { minWidth: 150, sortable: true},
      renderProps: {
        width: '100px',
        height: '100px'
      }
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
    { 
      key: "remark", 
      label: "备注", 
      visible: true,
      columnProps: { minWidth: 100 },
      renderProps: { style: "overflow: hidden; white-space: nowrap; text-overflow: ellipsis;" }
    },
  ])

  const tableData = reactive([
    { id: 1, name: 'Alice', code: '9527', status: 1, map: 1, regionCode:'海外', orderNum: 1, selectId: 1 },
    { id: 2, name: 'Bob', code: '9526', status: 1, map: 1, regionCode:'海外', orderNum: 1, selectId: 1 },
    { id: 3, name: 'Charlie', code: '9525', status: 0, map: 1, regionCode:'海外', orderNum: 1, selectId: 2 },
    { id: 3, name: 'Charlie', code: '9525', status: 0, map: 1, regionCode:'海外', orderNum: 1, selectId: 2, 
      avatar: 'https://iconfont.alicdn.com/p/illus_3d/file/UMAqlm6KX5gw/8e357f00-9a4e-44c4-b0c5-bbed255cff24.png' ,
      gallery: [
        'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png',
        'https://iconfont.alicdn.com/p/illus_3d/file/UMAqlm6KX5gw/8e357f00-9a4e-44c4-b0c5-bbed255cff24.png',
      ],
      remark: '备注有点长，可自定义style/class,格式字符串'
    },
  ])

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
  