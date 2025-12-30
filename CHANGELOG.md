# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2025-12-30

### Fixed
- **操作列宽度计算优化** - 调整 operation 列逻辑代码顺序,确保在 visibleColumns 之前定义
- **代码结构优化** - 优化 isOperationVisible 函数位置,提升代码可读性
- **类型引用修复** - 修复 RendererName -> ColumnType 类型引用

### Changed
- 重构代码组织结构,提升可维护性

## [2.1.0] - 2025-12-30

### Changed
- **统一 type 字段** - 合并原 `type` 和 `render` 为单一 `type` 字段，更简洁
- **重命名 renderProps 为 props** - 与 SmartForm 保持一致
- **列顺序可控** - 所有列类型（selection/index/operation/数据列）按配置顺序渲染
- **Props 定义优化** - 改用 `defineProps<SmartTableProps>()` + `withDefaults`
- **Emits 定义优化** - 改用 `defineEmits<SmartTableEmits>()`

### Added
- **props 事件回调** - 可编辑渲染器支持 `props.onChange`、`props.onBlur` 等事件，方便 columns 抽离到独立 ts 文件
- **属性透传增强** - 所有渲染器支持透传 Element Plus 原生属性和事件

### Fixed
- 修复 el-switch 在页面加载时立即触发 change 事件的问题（el-table 预渲染 slot 导致）
- 修复 SSR 安全问题，`isInitialized` 改为 `ref()`

## [2.0.0] - 2025-12-29

### ⚠️ Breaking Changes
- 全新重构发布，废弃 1.x 版本
- 建议所有用户升级到 2.0.0 版本

### Added
- 基于 Vue 3 + Element Plus 的高可复用表格组件
- 插件化架构，支持自定义渲染器
- 内置 13 种常用渲染器（html、copy、img、dict、map、formatter、icon、input、input-number、select、button、link、slot）
- 完整的 TypeScript 类型支持
- 操作列权限控制
- 列配置缓存

## [1.0.6] and earlier - 2025-12-29

### ⚠️ Deprecated
- 1.x 及更早版本已废弃，请升级到 2.0.0 版本
