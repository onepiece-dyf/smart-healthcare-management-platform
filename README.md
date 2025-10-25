# 智慧医疗管理平台 (Smart Healthcare Management Platform)

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/onepiece-dyf/smart-healthcare-management-platform)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Nuxt](https://img.shields.io/badge/Nuxt-3.14.159-00DC82.svg)](https://nuxt.com)

一个基于 Nuxt 3 的智能化医疗管理平台，专注于提供数字化、智能化的医疗运营解决方案，涵盖病房管理、患者跟踪、医嘱执行和数据分析等核心功能。

> **v2.0.0 重大更新**: 全新升级为智慧医疗管理平台，新增权限管理、人员管理、数据统计等核心功能模块。

## 🌟 核心特性

- 🧠 **智能化管理** - AI驱动的数据分析和决策支持
- 📱 **全平台适配** - 响应式设计，支持桌面端、平板和移动端
- 🔐 **安全权限控制** - 基于角色的精细化权限管理
- 📊 **实时数据可视化** - 动态图表和智能报表系统
- 🏥 **数字化病房管理** - 智能床位分配和状态监控
- 👥 **全生命周期患者管理** - 从入院到出院的全程跟踪
- 📋 **智能医嘱系统** - 自动化执行监控和异常预警
- 🎨 **现代化界面设计** - 直观易用的用户体验

## 🛠 技术栈

- **前端框架:** Nuxt 3
- **UI 组件库:** Vant 4
- **状态管理:** Pinia
- **数据可视化:** ECharts
- **样式方案:** TailwindCSS
- **本地存储:** Dexie.js
- **TypeScript:** 严格类型检查

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/onepiece-dyf/smart-healthcare-management-platform.git

# 2. 进入项目目录
cd smart-healthcare-management-platform

# 3. 安装依赖
npm install
# 或使用 yarn
yarn install

# 4. 启动开发服务器
npm run dev
# 或使用 yarn
yarn dev
```

### 访问应用

开发服务器启动后，访问 [http://localhost:3000](http://localhost:3000) 即可查看应用。

### 默认账户

系统已预置以下测试账户：

- **管理员**: admin / admin123
- **医生**: doctor / doctor123  
- **护士**: nurse / nurse123

> 💡 **提示**: 首次访问时系统会自动初始化测试数据，包括科室、患者、医嘱等信息。

## 🏗 项目结构（部分）

```
smart-healthcare-management-platform/
├── components/        # 可复用组件
├── composables/      # 组合式函数
├── layouts/          # 布局组件
├── pages/           # 页面组件
├── public/          # 静态资源
├── server/          # 服务端接口
├── stores/          # Pinia 状态管理
├── types/           # TypeScript 类型定义
├── api/             # 数据库和API服务
├── scripts/         # 工具脚本
└── utils/           # 工具函数
```

## 🔑 核心功能模块

### 1. 智能病房管理

- 🏥 **实时床位监控** - 智能床位分配和状态追踪
- 📊 **占用率分析** - 动态统计和预测分析
- 🧹 **清洁状态管理** - 自动化清洁计划和提醒
- 🔧 **设备维护记录** - 设备生命周期管理

### 2. 全生命周期患者管理

- 📝 **智能入院登记** - 快速录入和自动验证
- 📋 **电子病历系统** - 结构化病历记录和管理
- 🔄 **智能转科管理** - 自动化转科流程和通知
- ✅ **出院处理优化** - 一站式出院办理

### 3. 智能医嘱系统

- 📋 **医嘱智能下达** - 模板化医嘱和智能推荐
- ⏰ **执行时间管理** - 自动排程和提醒系统
- ✅ **执行状态跟踪** - 实时监控和进度管理
- ⚠️ **异常预警处理** - 智能异常检测和处理

### 4. 权限管理系统

- 🔐 **角色权限配置** - 基于角色的精细化权限控制
- 👥 **用户权限管理** - 灵活的用户权限分配
- 🛡️ **安全访问控制** - 多层次的安全验证机制
- 📊 **权限审计日志** - 完整的操作记录和审计

### 5. 人员管理系统

- 👨‍⚕️ **医护人员管理** - 科室人员分配和调度
- 📋 **班次排班管理** - 智能排班和班次管理
- 📊 **人员统计分析** - 人员配置和效率分析
- 🔄 **人员调动管理** - 跨科室人员调动流程

### 6. 数据分析与决策支持

- 📈 **实时数据统计** - 多维度数据分析和展示
- 📊 **趋势预测分析** - AI驱动的趋势预测
- 🎯 **运营效率优化** - 基于数据的运营建议
- 📋 **智能报表生成** - 自动化报表和报告

## 📱 界面预览



## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解更多详情

## 📞 联系我

- GitHub: [@onepiece-dyf](https://github.com/onepiece-dyf)
- Repository: [smart-healthcare-management-platform](https://github.com/onepiece-dyf/smart-healthcare-management-platform)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者，以及提供反馈的医疗工作者。

---

Made with ❤️ by onepiece-dyf
