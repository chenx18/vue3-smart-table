<template>
  <div class="demo-container" style="padding: 20px;">
    <h1>Vue3 Smart Table - 完整示例</h1>

    <!-- 表格区域 -->
    <el-card header="表格示例（所有内置渲染器 + 自定义渲染器）">
      <SmartTable
        :border="true"
        :loading="loading"
        :rowKey="'id'"
        :data="tableData"
        v-model:columns="columns"
        :debug="true"
        :pagination="pagination"
        :permissions="permissions"
        :cacheKey="'vue3-smart-table-demo'"
        @cell-blur="onCellBlur"
        @cell-enter="onCellEnter"
        @cell-change="onCellChange"
        @cell-click="onCellClick"
      >
        <!-- 自定义复杂列插槽 -->
        <template #status="{ row }">
          <el-switch v-model="row.status" :active-value="1" :inactive-value="0" 
            @change="() => handleStatusChange(row)" />
        </template>
        <!-- 自定义复杂列插槽 -->
        <template #attachments="{ row }">
          <div v-for="(item, index) in row.attachments" :key="index" class="attachment-item">
            <el-image
              v-if="item.fileType === 1"
              :src="item.thumbnailUrl"
              :preview-src-list="row.imgPaths"
              fit="cover"
              style="width: 60px; height: 60px; margin-right: 8px;"
            />
            <el-button v-if="item.fileType === 0" type="primary" link size="small">
              <el-icon><Download /></el-icon> 下载日志
            </el-button>
            <div v-if="item.fileType === 2">
              <img :src="item.thumbnailUrl" alt="video" style="width: 60px; height: 60px;" />
            </div>
          </div>
        </template>
      </SmartTable>
    </el-card>

    <!-- 说明区域 -->
    <el-card class="mt-4" header="功能说明">
      <el-collapse>
        <el-collapse-item title="1. 基础列类型" name="1">
          <ul>
            <li><strong>Selection</strong>: 多选列，使用 type: 'selection'</li>
            <li><strong>Index</strong>: 序号列，支持分页计算，使用 type: 'index'</li>
            <li><strong>Operation</strong>: 操作列，支持权限控制和行级可见性</li>
          </ul>
        </el-collapse-item>

        <el-collapse-item title="2. 内置渲染器 (12+)" name="2">
          <el-row :gutter="20">
            <el-col :span="8" v-for="renderer in rendererList" :key="renderer.name">
              <el-tag type="primary" class="mr-2">{{ renderer.name }}</el-tag>
              <span>{{ renderer.desc }}</span>
            </el-col>
          </el-row>
        </el-collapse-item>

        <el-collapse-item title="3. 可编辑单元格" name="3">
          <ul>
            <li><strong>input</strong>: 文本输入框，支持 change/blur/enter 事件</li>
            <li><strong>input-number</strong>: 数字输入框，支持 min/max 配置</li>
            <li><strong>select</strong>: 下拉选择，支持 options 配置</li>
          </ul>
          <p class="text-gray-500">支持两种事件方式：</p>
          <ul>
            <li><code>props.onChange</code> - 列级回调，适合 columns 抽离到 ts 文件</li>
            <li><code>@cell-change</code> - 组件级事件，统一处理</li>
          </ul>
        </el-collapse-item>

        <el-collapse-item title="4. 自定义渲染器" name="4">
          <p>当前示例展示了一个名为 <code>status-badge</code> 的自定义渲染器：</p>
          <pre class="bg-gray-100 p-2 rounded">
import { createFunctionalRenderer, getRendererManager } from 'vue3-smart-table'

const statusRenderer = createFunctionalRenderer((props) => {
  const val = props.row[props.col.key]
  return h('span', {
    class: `status-badge status-${val}`,
    style: { padding: '4px 8px', borderRadius: '4px' }
  }, val === 1 ? '✅ 启用' : '❌ 禁用')
})

getRendererManager().register('status-badge', statusRenderer)
          </pre>
          <p>在列配置中使用：<code>{ type: 'status-badge', key: 'status' }</code></p>
        </el-collapse-item>

        <el-collapse-item title="5. 插槽自定义" name="5">
          <p>对于复杂场景，可以使用插槽完全自定义列内容：</p>
          <pre class="bg-gray-100 p-2 rounded">
// 列配置
{ type: 'slot', key: 'attachments', slot: 'attachments' }

// 模板
&lt;template #attachments="{ row }"&gt;
  自定义内容
&lt;/template&gt;
          </pre>
        </el-collapse-item>

        <el-collapse-item title="6. 权限控制" name="6">
          <p>操作列支持按钮级别的权限控制：</p>
          <ul>
            <li><code>permission</code>: 权限标识，支持 string 或 string[]</li>
            <li><code>visible</code>: 行级可见性函数</li>
            <li>当所有按钮都不可见时，整列自动隐藏</li>
          </ul>
        </el-collapse-item>

        <el-collapse-item title="7. 列配置缓存" name="7">
          <p>通过 <code>cacheKey</code> 启用列显隐配置的本地存储，刷新页面后保持用户设置。</p>
          <p>只缓存 <code>visible</code> 字段，不影响其他配置。</p>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 事件日志 -->
    <el-card class="mt-4" header="事件日志">
      <el-button @click="clearLogs" size="small" type="danger" class="mb-2">清空日志</el-button>
      <div class="log-container">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          <el-tag :type="log.type" size="small">{{ log.event }}</el-tag>
          <span class="ml-2">{{ log.message }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="APP">
import { reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { SmartTable } from '../src/index'
import { getRendererManager, createFunctionalRenderer } from '../src/index'
import { h } from 'vue'
import { Download } from '@element-plus/icons-vue'

// 用户状态修改
const handleStatusChange = (row: { status: number; userName: any; name: string }) => {
  const text = row.status === 1 ? '启用' : '停用'
  ElMessageBox.confirm(`确认要"${text}"${row.name}"用户吗？`)
    .then(() => {
      console.log('确认')
    })
    .catch(() => {
      row.status = row.status === 1 ? 0 : 1
    })
}

// ============ 自定义渲染器示例 ============
const statusRenderer = createFunctionalRenderer((props) => {
  const val = props.row[props.col.key]
  const isActive = val === 1

  return h('span', {
    class: `status-badge status-${isActive ? 'active' : 'inactive'}`,
    style: {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: isActive ? '#f0f9ff' : '#fef2f2',
      color: isActive ? '#0284c7' : '#dc2626',
      border: `1px solid ${isActive ? '#7dd3fc' : '#fca5a5'}`
    }
  }, isActive ? '✅ 启用' : '❌ 禁用')
})

const toggleCustomRenderer = (show: boolean) => {
  if (show) {
    getRendererManager().register('status-badge', statusRenderer)
  } else {
    getRendererManager().unregister('status-badge')
  }
}

// 初始化时注册自定义渲染器
toggleCustomRenderer(true)

// ============ 数据配置 ============
const permissions = ref(['edit3', 'view3', 'delete3', 'copy3', 'detail3'])
const loading = ref(false)

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 字典配置
const statusOptions = [
  { label: '启用', value: 1, listClass: 'success' },
  { label: '禁用', value: 0, listClass: 'danger' }
]

// 操作按钮配置
const buttonConfigs = [
  {
    permission: 'edit',
    label: '编辑',
    type: 'primary',
    action: (row: any) => addLog('info', '编辑', `编辑用户: ${row.name}`),
  },
  {
    permission: 'delete',
    label: '删除',
    type: 'danger',
    action: (row: any) => addLog('warning', '删除', `删除用户: ${row.name}`),
    visible: (row: any) => row.id !== 1  // 第一行不可删除
  },
  {
    permission: 'view',
    label: '查看',
    type: 'info',
    action: (row: any) => addLog('info', '查看', `查看用户: ${row.name}`),
  },
  {
    permission: 'copy',
    label: '复制',
    type: 'info',
    action: (row: any) => addLog('info', '复制', `复制用户: ${row.name}`),
    visible: (row: any) => row.role === 'admin'  // 仅管理员可见
  },
  {
    permission: 'detail',
    label: '详情',
    type: 'info',
    action: (row: any) => addLog('info', '详情', `查看详情: ${row.name}`),
    visible: (row: any) => row.status === 1  // 仅启用状态可见
  },
]

// 列配置
const columns = ref([
  {
    type: 'selection',
    key: 'selection',
    inControl: false,
  },
  {
    type: 'index',
    key: 'index',
    label: '序号',
    inControl: false,
    columnProps: { width: 80, fixed: 'left' }
  },
  {
    type: 'html',
    key: 'name',
    label: '姓名',
    visible: true,
    columnProps: { minWidth: 120, sortable: true }
  },
  {
    type: 'copy',
    key: 'email',
    label: '邮箱',
    visible: true,
    columnProps: { minWidth: 200, sortable: true },
    props: {
      copyTitle: '复制邮箱',
      successText: '邮箱已复制到剪贴板',
      iconColor: '#409EFF'
    }
  },
  {
    type: 'slot',
    key: 'status',
    label: '状态切换',
    visible: true,
    columnProps: { minWidth: 100, sortable: true }
  },
  {
    type: 'dict',
    key: 'status',
    label: '状态(Dict)',
    visible: true,
    columnProps: { minWidth: 100, sortable: true },
    props: {
      options: statusOptions
    }
  },
  {
    type: 'status-badge',
    key: 'status',
    label: '状态(自定义渲染器)',
    visible: true,
    columnProps: { minWidth: 150 }
  },
  {
    type: 'map',
    key: 'role',
    label: '角色(Map)',
    visible: true,
    columnProps: { minWidth: 100 },
    props: {
      options: {
        admin: '管理员',
        user: '普通用户',
        guest: '访客'
      }
    }
  },
  {
    type: 'icon',
    key: 'icon',
    label: '图标(Icon)',
    visible: true,
    columnProps: { minWidth: 80 },
    props: {
      size: 24
    }
  },
  {
    type: 'formatter',
    key: 'price',
    label: '价格(Formatter)',
    visible: true,
    columnProps: { minWidth: 120 },
    formatter: (val: number) => val != null ? `¥${Number(val).toFixed(2)}` : '-'
  },
  {
    type: 'img',
    key: 'avatar',
    label: '头像(图片)',
    visible: true,
    columnProps: { minWidth: 100 },
    props: {
      width: '60px',
      height: '60px',
      fit: 'cover'
    }
  },
  {
    type: 'img',
    key: 'gallery',
    label: '相册(多图)',
    visible: true,
    columnProps: { minWidth: 120 },
    props: {
      width: '80px',
      height: '80px'
    }
  },
  {
    type: 'link',
    key: 'website',
    label: '网站',
    visible: true,
    columnProps: { minWidth: 120 },
    props: {
      label: '访问网站',
      href: 'https://github.com',
      blank: true
    }
  },
  {
    type: 'select',
    key: 'selectValue',
    label: '可选值',
    visible: true,
    columnProps: { minWidth: 150 },
    props: {
      options: [
        { label: '选项1', value: 1 },
        { label: '选项2', value: 2 },
        { label: '选项3', value: 3 }
      ],
      // props 事件回调示例
      onChange: (val: any, row: any, col: any) => {
        console.log(`[props.onChange] ${col.key}: ${val}`, row)
      }
    }
  },
  {
    type: 'input-number',
    key: 'orderNum',
    label: '序号(可编辑)',
    visible: true,
    columnProps: { minWidth: 150 },
    props: {
      min: 0,
      max: 100,
      // props 事件回调示例
      onChange: (val: number | undefined, oldVal: number | undefined, row: any) => {
        console.log(`[props.onChange] orderNum: ${oldVal} -> ${val}`, row)
      }
    }
  },
  {
    type: 'input',
    key: 'username',
    label: '用户名(可编辑)',
    visible: true,
    columnProps: { minWidth: 150 },
    props: {
      placeholder: '请输入用户名',
      // props 事件回调示例
      onChange: (val: string, row: any, col: any) => {
        console.log(`[props.onChange] ${col.key}: ${val}`, row)
      },
      onEnter: (e: KeyboardEvent, row: any, col: any) => {
        console.log(`[props.onEnter] ${col.key} 回车`, row)
      }
    }
  },
  {
    type: 'button',
    key: 'action',
    label: '操作(按钮)',
    visible: true,
    columnProps: { minWidth: 100 },
    props: {
      label: '点击我',
      type: 'primary'
    }
  },
  {
    type: 'operation',
    key: 'operation',
    label: '操作',
    inControl: false,
    buttons: buttonConfigs,
    columnProps: {
      fixed: 'right',
      width: 200
    }
  },
  {
    type: 'slot',
    key: 'attachments',
    label: '附件(插槽)',
    visible: true,
    slot: 'attachments',
    columnProps: { minWidth: 150 }
  }
])

// 渲染器列表（用于展示）
const rendererList = [
  { name: 'input', desc: '文本输入框' },
  { name: 'input-number', desc: '数字输入框' },
  { name: 'select', desc: '下拉选择' },
  { name: 'button', desc: '按钮' },
  { name: 'link', desc: '链接' },
  { name: 'html', desc: 'HTML内容' },
  { name: 'copy', desc: '复制功能' },
  { name: 'img', desc: '图片预览' },
  { name: 'dict', desc: '字典映射' },
  { name: 'map', desc: '键值对映射' },
  { name: 'formatter', desc: '自定义格式化' },
  { name: 'icon', desc: '图标渲染' },
  { name: 'slot', desc: '插槽自定义' },
]

// 表格数据
const tableData = reactive([
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    status: 1,
    role: 'admin',
    price: 99.99,
    avatar: 'https://automation.vuejs.org/images/chrome_frameworks_fund.avif',
    gallery: [
      'https://automation.vuejs.org/images/chrome_frameworks_fund.avif',
      'https://automation.vuejs.org/images/vuemastery.avif',
    ],
    website: 'https://github.com',
    selectValue: 1,
    orderNum: 10,
    username: 'zhangsan001',
    icon: 'https://element-plus.org/images/element-plus-logo.svg',
    attachments: [
      {
        id: 1,
        fileType: 1,
        thumbnailUrl: 'https://automation.vuejs.org/images/vuemastery.avif'
      }
    ]
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    status: 0,
    role: 'user',
    price: 59.99,
    avatar: 'https://automation.vuejs.org/images/vuemastery.avif',
    gallery: [],
    website: '',
    selectValue: 2,
    orderNum: 20,
    username: 'lisi002',
    icon: 'el-icon-user',
    attachments: []
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    status: 1,
    role: 'guest',
    price: 29.99,
    avatar: 'https://automation.vuejs.org/images/vuemastery.avif',
    gallery: ['https://automation.vuejs.org/images/vuemastery.avif'],
    website: '',
    selectValue: 3,
    orderNum: 30,
    username: 'wangwu003',
    icon: 'https://vuejs.org/images/logo.png',
    attachments: [
      {
        id: 2,
        fileType: 0,
        thumbnailUrl: null
      }
    ]
  }
])

pagination.total = tableData.length

// ============ 事件处理 ============
const logs = ref<Array<{ event: string, message: string, type: string }>>([])

const addLog = (type: string, event: string, message: string) => {
  logs.value.unshift({ type, event, message })
  if (logs.value.length > 20) {
    logs.value.pop()
  }
}

const clearLogs = () => {
  logs.value = []
}

const onCellBlur = (row: any, col: any) => {
  addLog('info', 'cellBlur', `单元格失焦: ${col.key} = ${row[col.key]}`)
}

const onCellEnter = (row: any, col: any) => {
  addLog('success', 'cellEnter', `单元格回车: ${col.key} = ${row[col.key]}`)
}

const onCellChange = (row: any, col: any) => {
  addLog('warning', 'cellChange', `单元格变更: ${col.key} = ${row[col.key]}`)
}

const onCellClick = (row: any, col: any) => {
  addLog('info', 'cellClick', `按钮点击: ${col.key} - ${row.name}`)
}
</script>

<style scoped>
.demo-container {
  max-width: 1400px;
  margin: 0 auto;
}

.attachment-item {
  display: inline-flex;
  align-items: center;
  margin-right: 12px;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
}

.log-item {
  padding: 6px 0;
  border-bottom: 1px solid #e0e0e0;
}

.log-item:last-child {
  border-bottom: none;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.ml-2 {
  margin-left: 8px;
}

.mr-2 {
  margin-right: 8px;
}

.text-gray-500 {
  color: #6b7280;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.p-2 {
  padding: 8px;
}

.rounded {
  border-radius: 4px;
}

/* 自定义渲染器样式 */
.status-badge {
  display: inline-block;
  transition: all 0.3s;
}
</style>
