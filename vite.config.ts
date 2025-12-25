import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Vue3SmartTable',
      fileName: (format) => {
        if (format === 'es') {
          return 'vue3-smart-table.es.js'
        }
        if (format === 'cjs') {
          return 'vue3-smart-table.cjs.js'
        }
        return 'vue3-smart-table.[format].js'
      },
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      // 外部化依赖，不打包到库中
      external: ['vue', 'element-plus', '@element-plus/icons-vue'],
      output: {
        // 全局变量名
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          '@element-plus/icons-vue': 'ElementPlusIconsVue'
        },
        // 为不同格式设置不同的输出目录
        preserveModules: false
      }
    },
    // 生成 source map
    sourcemap: true,
    // CSS 代码拆分
    cssCodeSplit: true
  }
})
