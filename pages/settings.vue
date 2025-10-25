<template>
  <div class="settings-page">
    <!-- 顶部 Hero -->
    <HeroHeader
      title="系统设置"
      subtitle="个性化设置与系统配置"
      :showDate="true">
      <template #actions>
        <div class="col-span-4 flex justify-end gap-2">
          <van-button 
            size="small" 
            type="primary" 
            icon="refresh"
            @click="resetSettings">
            重置设置
          </van-button>
          <van-button 
            size="small" 
            icon="save"
            @click="saveSettings">
            保存设置
          </van-button>
        </div>
      </template>
    </HeroHeader>

    <!-- 外观设置 -->
    <div class="px-4 pb-4">
      <SectionCard title="外观设置">
        <van-cell-group>
          <van-cell title="主题模式" :label="settings.darkMode ? '深色模式' : '浅色模式'">
            <template #icon>
              <van-icon name="setting-o" size="20" color="#1989fa" class="mr-2" />
            </template>
            <template #right-icon>
              <van-switch v-model="settings.darkMode" @change="toggleDarkMode" />
            </template>
          </van-cell>
          <van-cell title="语言设置" :label="getLanguageLabel(settings.language)">
            <template #icon>
              <van-icon name="globe-o" size="20" color="#4ecdc4" class="mr-2" />
            </template>
            <template #value>
              <van-dropdown-menu>
                <van-dropdown-item v-model="settings.language" :options="languageOptions" />
              </van-dropdown-menu>
            </template>
          </van-cell>
          <van-cell title="字体大小" :label="getFontSizeLabel(settings.fontSize)">
            <template #icon>
              <van-icon name="font-o" size="20" color="#45b7d1" class="mr-2" />
            </template>
            <template #value>
              <van-dropdown-menu>
                <van-dropdown-item v-model="settings.fontSize" :options="fontSizeOptions" />
              </van-dropdown-menu>
            </template>
          </van-cell>
          <van-cell title="自动切换主题" :label="settings.autoTheme ? '根据时间自动切换' : '手动切换'">
            <template #icon>
              <van-icon name="clock-o" size="20" color="#96ceb4" class="mr-2" />
            </template>
            <template #right-icon>
              <van-switch v-model="settings.autoTheme" />
            </template>
          </van-cell>
        </van-cell-group>
      </SectionCard>
    </div>

    <!-- 通知设置 -->
    <div class="px-4 pb-4">
      <SectionCard title="通知设置">
        <van-cell-group>
          <van-cell title="系统通知" :label="settings.systemNotifications ? '已启用' : '已禁用'">
            <template #icon>
              <van-icon name="bell" size="20" color="#ff6b6b" class="mr-2" />
            </template>
            <template #right-icon>
              <van-switch v-model="settings.systemNotifications" />
            </template>
          </van-cell>
          <van-cell title="医嘱提醒" :label="settings.orderReminders ? '已启用' : '已禁用'">
            <template #icon>
              <van-icon name="orders-o" size="20" color="#4ecdc4" class="mr-2" />
            </template>
            <template #right-icon>
              <van-switch v-model="settings.orderReminders" />
            </template>
          </van-cell>
          <van-cell title="患者提醒" :label="settings.patientReminders ? '已启用' : '已禁用'">
            <template #icon>
              <van-icon name="user-o" size="20" color="#45b7d1" class="mr-2" />
            </template>
            <template #right-icon>
              <van-switch v-model="settings.patientReminders" />
            </template>
          </van-cell>
          <van-cell title="邮件通知" :label="settings.emailNotifications ? '已启用' : '已禁用'">
            <template #icon>
              <van-icon name="envelop-o" size="20" color="#96ceb4" class="mr-2" />
            </template>
            <template #right-icon>
              <van-switch v-model="settings.emailNotifications" />
            </template>
          </van-cell>
          <van-cell title="短信通知" :label="settings.smsNotifications ? '已启用' : '已禁用'">
            <template #icon>
              <van-icon name="phone-o" size="20" color="#feca57" class="mr-2" />
            </template>
            <template #right-icon>
              <van-switch v-model="settings.smsNotifications" />
            </template>
          </van-cell>
        </van-cell-group>
      </SectionCard>
    </div>

    <!-- 隐私设置 -->
    <div class="px-4 pb-4">
      <SectionCard title="隐私设置">
        <van-cell-group>
          <van-cell title="数据收集" :label="settings.dataCollection ? '允许收集使用数据' : '禁止收集使用数据'">
            <template #icon>
              <van-icon name="shield-o" size="20" color="#ff6b6b" class="mr-2" />
            </template>
            <template #right-icon>
              <van-switch v-model="settings.dataCollection" />
            </template>
          </van-cell>
          <van-cell title="位置服务" :label="settings.locationService ? '已启用' : '已禁用'">
            <template #icon>
              <van-icon name="location-o" size="20" color="#4ecdc4" class="mr-2" />
            </template>
            <template #right-icon>
              <van-switch v-model="settings.locationService" />
            </template>
          </van-cell>
          <van-cell title="自动登录" :label="settings.autoLogin ? '已启用' : '已禁用'">
            <template #icon>
              <van-icon name="user-circle-o" size="20" color="#45b7d1" class="mr-2" />
            </template>
            <template #right-icon>
              <van-switch v-model="settings.autoLogin" />
            </template>
          </van-cell>
          <van-cell title="会话超时" :label="`${settings.sessionTimeout}分钟`">
            <template #icon>
              <van-icon name="clock-o" size="20" color="#96ceb4" class="mr-2" />
            </template>
            <template #value>
              <van-dropdown-menu>
                <van-dropdown-item v-model="settings.sessionTimeout" :options="timeoutOptions" />
              </van-dropdown-menu>
            </template>
          </van-cell>
        </van-cell-group>
      </SectionCard>
    </div>

    <!-- 系统信息 -->
    <div class="px-4 pb-4">
      <SectionCard title="系统信息">
        <van-cell-group>
          <van-cell title="系统版本" :value="systemInfo.version" />
          <van-cell title="构建时间" :value="systemInfo.buildTime" />
          <van-cell title="数据库版本" :value="systemInfo.dbVersion" />
          <van-cell title="最后更新" :value="systemInfo.lastUpdate" />
          <van-cell title="存储空间" :value="systemInfo.storage" />
          <van-cell title="内存使用" :value="systemInfo.memory" />
        </van-cell-group>
      </SectionCard>
    </div>

    <!-- 高级设置 -->
    <div class="px-4 pb-4">
      <SectionCard title="高级设置">
        <van-cell-group>
          <van-cell title="调试模式" :label="settings.debugMode ? '已启用' : '已禁用'">
            <template #icon>
              <van-icon name="setting-o" size="20" color="#ff6b6b" class="mr-2" />
            </template>
            <template #right-icon>
              <van-switch v-model="settings.debugMode" />
            </template>
          </van-cell>
          <van-cell title="性能监控" :label="settings.performanceMonitor ? '已启用' : '已禁用'">
            <template #icon>
              <van-icon name="chart-trending-o" size="20" color="#4ecdc4" class="mr-2" />
            </template>
            <template #right-icon>
              <van-switch v-model="settings.performanceMonitor" />
            </template>
          </van-cell>
          <van-cell title="数据备份" is-link @click="backupData">
            <template #icon>
              <van-icon name="backup" size="20" color="#45b7d1" class="mr-2" />
            </template>
          </van-cell>
          <van-cell title="清除缓存" is-link @click="clearCache">
            <template #icon>
              <van-icon name="delete-o" size="20" color="#96ceb4" class="mr-2" />
            </template>
          </van-cell>
          <van-cell title="重置系统" is-link @click="resetSystem" class="text-red-500">
            <template #icon>
              <van-icon name="replay" size="20" color="#ff6b6b" class="mr-2" />
            </template>
          </van-cell>
        </van-cell-group>
      </SectionCard>
    </div>

    <!-- 关于系统 -->
    <div class="px-4 pb-4">
      <SectionCard title="关于系统">
        <div class="text-center p-6">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <van-icon name="hospital-o" size="32" color="white" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">智慧医疗管理平台</h3>
          <p class="text-sm text-gray-600 mb-4">版本 {{ systemInfo.version }}</p>
          <p class="text-xs text-gray-500 mb-6">© 2025 智慧医疗管理平台<br>技术支持：医疗信息化部门</p>
          <div class="flex gap-2 justify-center">
            <van-button size="small" type="primary" @click="checkUpdate">检查更新</van-button>
            <van-button size="small" @click="showLicense">许可协议</van-button>
          </div>
        </div>
      </SectionCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { showToast, showDialog, showConfirmDialog } from "vant";

// 响应式数据
const settings = ref({
  // 外观设置
  darkMode: false,
  language: "zh-CN",
  fontSize: "medium",
  autoTheme: false,
  
  // 通知设置
  systemNotifications: true,
  orderReminders: true,
  patientReminders: true,
  emailNotifications: false,
  smsNotifications: false,
  
  // 隐私设置
  dataCollection: true,
  locationService: false,
  autoLogin: true,
  sessionTimeout: 30,
  
  // 高级设置
  debugMode: false,
  performanceMonitor: false
});

// 系统信息
const systemInfo = ref({
  version: "v2.0.0",
  buildTime: "2024-10-23 14:30:00",
  dbVersion: "2.0",
  lastUpdate: "2024-10-23",
  storage: "2.3 GB / 10 GB",
  memory: "156 MB / 512 MB"
});

// 选项配置
const languageOptions = [
  { text: "中文", value: "zh-CN" },
  { text: "English", value: "en-US" },
  { text: "日本語", value: "ja-JP" }
];

const fontSizeOptions = [
  { text: "小", value: "small" },
  { text: "中", value: "medium" },
  { text: "大", value: "large" },
  { text: "特大", value: "xlarge" }
];

const timeoutOptions = [
  { text: "15分钟", value: 15 },
  { text: "30分钟", value: 30 },
  { text: "60分钟", value: 60 },
  { text: "120分钟", value: 120 }
];

// 方法
const getLanguageLabel = (value: string) => {
  const option = languageOptions.find(opt => opt.value === value);
  return option ? option.text : "中文";
};

const getFontSizeLabel = (value: string) => {
  const option = fontSizeOptions.find(opt => opt.value === value);
  return option ? option.text : "中";
};

const toggleDarkMode = (value: boolean) => {
  showToast(value ? "已切换到深色模式" : "已切换到浅色模式");
  // 这里可以添加实际的主题切换逻辑
};

const saveSettings = async () => {
  try {
    // 这里应该调用API保存设置
    showToast("设置保存成功");
  } catch (error) {
    showToast("设置保存失败");
  }
};

const resetSettings = async () => {
  try {
    await showConfirmDialog({
      title: "重置设置",
      message: "确定要重置所有设置吗？此操作不可撤销。"
    });
    
    // 重置为默认设置
    settings.value = {
      darkMode: false,
      language: "zh-CN",
      fontSize: "medium",
      autoTheme: false,
      systemNotifications: true,
      orderReminders: true,
      patientReminders: true,
      emailNotifications: false,
      smsNotifications: false,
      dataCollection: true,
      locationService: false,
      autoLogin: true,
      sessionTimeout: 30,
      debugMode: false,
      performanceMonitor: false
    };
    
    showToast("设置已重置");
  } catch (error) {
    // 用户取消重置
  }
};

const backupData = async () => {
  try {
    await showConfirmDialog({
      title: "数据备份",
      message: "确定要备份当前数据吗？"
    });
    
    showToast("数据备份中...");
    // 这里应该添加实际的数据备份逻辑
    setTimeout(() => {
      showToast("数据备份完成");
    }, 2000);
  } catch (error) {
    // 用户取消备份
  }
};

const clearCache = async () => {
  try {
    await showConfirmDialog({
      title: "清除缓存",
      message: "确定要清除所有缓存数据吗？"
    });
    
    showToast("缓存清除中...");
    // 这里应该添加实际的缓存清除逻辑
    setTimeout(() => {
      showToast("缓存清除完成");
    }, 1000);
  } catch (error) {
    // 用户取消清除
  }
};

const resetSystem = async () => {
  try {
    await showConfirmDialog({
      title: "重置系统",
      message: "确定要重置整个系统吗？这将清除所有数据，此操作不可撤销！"
    });
    
    showToast("系统重置中...");
    // 这里应该添加实际的系统重置逻辑
  } catch (error) {
    // 用户取消重置
  }
};

const checkUpdate = () => {
  showDialog({
    title: "检查更新",
    message: "当前已是最新版本"
  });
};

const showLicense = () => {
  showDialog({
    title: "许可协议",
    message: "智慧医疗管理平台许可协议\n\n本软件受版权法保护，未经授权不得复制、分发或修改。\n\n© 2025 智慧医疗管理平台"
  });
};

// 加载设置
const loadSettings = async () => {
  try {
    // 这里应该从API或本地存储加载设置
    // 暂时使用默认设置
  } catch (error) {
    console.error("加载设置失败:", error);
  }
};

// 生命周期
onMounted(() => {
  loadSettings();
});

definePageMeta({
  layout: "admin",
  title: "系统设置",
  requiresAuth: true,
  middleware: "auth"
});
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* 设置项样式 */
.van-cell {
  padding: 16px;
}

.van-cell__title {
  font-weight: 500;
  color: #374151;
}

.van-cell__label {
  color: #6b7280;
  font-size: 12px;
}

/* 开关样式 */
.van-switch {
  transform: scale(0.9);
}

/* 下拉菜单样式 */
.van-dropdown-menu {
  border: none;
}

/* 系统信息样式 */
.text-center {
  text-align: center;
}

/* 危险操作样式 */
.text-red-500 {
  color: #ef4444;
}

/* 图标样式 */
.van-icon {
  margin-right: 8px;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .van-cell {
    padding: 12px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-page > div {
  animation: fadeIn 0.3s ease-out;
}
</style>
