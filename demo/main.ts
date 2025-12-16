import { createApp } from 'vue'
import App from './App.vue'

// 如果 vue3-smart-table 发布到本地包（未发布 NPM），使用相对路径
// import SmartTable from '../src/index'

// 安装 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
