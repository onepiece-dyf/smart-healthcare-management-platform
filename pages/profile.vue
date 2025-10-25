<template>
	<div class="profile-page">
    <!-- 顶部 Hero -->
    <HeroHeader
			title="个人资料"
      subtitle="个人信息与账户管理"
      :showDate="true">
      <template #actions>
        <div class="col-span-4 flex justify-end gap-2">
          <van-button 
            size="small" 
            type="primary" 
            icon="edit"
            @click="editProfile">
            编辑资料
          </van-button>
          <van-button 
            size="small" 
            icon="setting-o" 
            @click="showSettings = true">
            设置
          </van-button>
        </div>
      </template>
    </HeroHeader>

    <!-- 用户信息卡片 -->
    <div class="px-4 pb-4">
      <SectionCard class="relative overflow-hidden">
        <!-- 背景装饰 -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
        
        <div class="relative flex items-center space-x-4 p-6">
          <div class="relative">
						<van-image
							round
              width="80"
              height="80"
              :src="user.avatar || defaultAvatar"
              @click="changeAvatar"
              class="ring-4 ring-white shadow-lg" />
            <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-gray-900 mb-1">{{ user.name }}</h3>
            <p class="text-sm text-gray-600 mb-1">{{ user.role }}</p>
            <p class="text-xs text-gray-500 mb-2">{{ user.department }}</p>
            <div class="flex items-center space-x-2">
              <van-tag :type="user.status === 'active' ? 'success' : 'default'" size="small">
                {{ user.status === 'active' ? '在线' : '离线' }}
              </van-tag>
              <span class="text-xs text-gray-400">工号: {{ user.employeeId }}</span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 个人信息 -->
    <div class="px-4 pb-4">
      <SectionCard title="个人信息">
        <van-cell-group>
          <van-cell title="姓名" :value="user.name" />
          <van-cell title="用户名" :value="user.username" />
          <van-cell title="角色" :value="user.role" />
          <van-cell title="科室" :value="user.department" />
          <van-cell title="工号" :value="user.employeeId" />
          <van-cell title="手机号" :value="user.phone" />
          <van-cell title="邮箱" :value="user.email" />
          <van-cell title="入职时间" :value="formatDate(user.joinDate)" />
          <van-cell title="最后登录" :value="formatDate(user.lastLoginAt)" />
        </van-cell-group>
      </SectionCard>
    </div>

    <!-- 工作统计 -->
    <div class="px-4 pb-4">
      <SectionCard title="工作统计">
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
            <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <van-icon name="user-o" size="20" color="white" />
            </div>
            <div class="text-3xl font-bold text-blue-600 mb-1">{{ workStats.patientsHandled }}</div>
            <div class="text-sm text-gray-600 font-medium">处理患者</div>
            <div class="text-xs text-blue-500 mt-1">+12 本周</div>
          </div>
          <div class="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
            <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <van-icon name="orders-o" size="20" color="white" />
            </div>
            <div class="text-3xl font-bold text-green-600 mb-1">{{ workStats.ordersCompleted }}</div>
            <div class="text-sm text-gray-600 font-medium">完成医嘱</div>
            <div class="text-xs text-green-500 mt-1">+8 本周</div>
          </div>
          <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
            <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <van-icon name="calendar-o" size="20" color="white" />
            </div>
            <div class="text-3xl font-bold text-purple-600 mb-1">{{ workStats.workingDays }}</div>
            <div class="text-sm text-gray-600 font-medium">工作天数</div>
            <div class="text-xs text-purple-500 mt-1">本月</div>
          </div>
          <div class="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-lg transition-all duration-300">
            <div class="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <van-icon name="chart-trending-o" size="20" color="white" />
            </div>
            <div class="text-3xl font-bold text-orange-600 mb-1">{{ workStats.attendanceRate }}%</div>
            <div class="text-sm text-gray-600 font-medium">出勤率</div>
            <div class="text-xs text-orange-500 mt-1">优秀</div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 快捷功能 -->
    <div class="px-4 pb-4">
      <SectionCard title="快捷功能">
        <div class="grid grid-cols-4 gap-3">
          <div 
            v-for="action in quickActions" 
            :key="action.text"
            class="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 group"
            @click="action.onClick">
            <div class="w-12 h-12 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200"
                 :style="{ backgroundColor: action.color + '20' }">
              <van-icon :name="action.icon" size="20" :color="action.color" />
            </div>
            <span class="text-xs text-gray-600 font-medium text-center">{{ action.text }}</span>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 系统设置 -->
    <div class="px-4 pb-4">
      <SectionCard title="系统设置">
        <van-cell-group>
          <van-cell title="修改密码" is-link @click="changePassword">
            <template #icon>
              <van-icon name="lock" size="20" color="#1989fa" class="mr-2" />
            </template>
          </van-cell>
          <van-cell title="通知设置" is-link @click="notificationSettings">
            <template #icon>
              <van-icon name="bell" size="20" color="#4ecdc4" class="mr-2" />
            </template>
          </van-cell>
          <van-cell title="隐私设置" is-link @click="privacySettings">
            <template #icon>
              <van-icon name="shield-o" size="20" color="#45b7d1" class="mr-2" />
            </template>
          </van-cell>
          <van-cell title="关于系统" is-link @click="aboutSystem">
            <template #icon>
              <van-icon name="info-o" size="20" color="#96ceb4" class="mr-2" />
            </template>
          </van-cell>
          <van-cell title="退出登录" is-link @click="logout" class="text-red-500">
            <template #icon>
              <van-icon name="close" size="20" color="#ff6b6b" class="mr-2" />
            </template>
          </van-cell>
        </van-cell-group>
      </SectionCard>
    </div>

    <!-- 设置弹窗 -->
    <van-popup v-model:show="showSettings" position="bottom" :style="{ height: '60%' }" round>
      <div class="p-6">
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-900">系统设置</h3>
          <van-icon name="cross" size="20" @click="showSettings = false" class="text-gray-400" />
        </div>
        <van-cell-group inset>
          <van-cell title="主题模式" :label="settings.darkMode ? '深色模式' : '浅色模式'">
            <template #icon>
              <van-icon name="setting-o" size="20" color="#1989fa" class="mr-2" />
            </template>
            <template #right-icon>
              <van-switch v-model="settings.darkMode" @change="toggleDarkMode" />
            </template>
          </van-cell>
          <van-cell title="语言设置" :label="settings.language === 'zh-CN' ? '中文' : 'English'">
            <template #icon>
              <van-icon name="globe-o" size="20" color="#4ecdc4" class="mr-2" />
            </template>
            <template #value>
              <van-dropdown-menu>
                <van-dropdown-item v-model="settings.language" :options="languageOptions" />
              </van-dropdown-menu>
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
			</van-cell-group>
		</div>
    </van-popup>

    <!-- 修改密码弹窗 -->
    <van-popup v-model:show="showChangePassword" position="center" :style="{ width: '90%' }" round>
      <div class="p-6">
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-900">修改密码</h3>
          <van-icon name="cross" size="20" @click="showChangePassword = false" class="text-gray-400" />
        </div>
        <van-form @submit="onPasswordSubmit">
          <van-field
            v-model="passwordForm.oldPassword"
            name="oldPassword"
            type="password"
            label="原密码"
            placeholder="请输入原密码"
            :rules="[{ required: true, message: '请输入原密码' }]">
            <template #left-icon>
              <van-icon name="lock" size="20" color="#1989fa" />
            </template>
          </van-field>
          <van-field
            v-model="passwordForm.newPassword"
            name="newPassword"
            type="password"
            label="新密码"
            placeholder="请输入新密码"
            :rules="[{ required: true, message: '请输入新密码' }]">
            <template #left-icon>
              <van-icon name="lock" size="20" color="#4ecdc4" />
            </template>
          </van-field>
          <van-field
            v-model="passwordForm.confirmPassword"
            name="confirmPassword"
            type="password"
            label="确认密码"
            placeholder="请再次输入新密码"
            :rules="[{ required: true, message: '请确认新密码' }]">
            <template #left-icon>
              <van-icon name="lock" size="20" color="#45b7d1" />
            </template>
          </van-field>
          <div class="mt-6 flex gap-3">
            <van-button block type="primary" native-type="submit" size="large">确认修改</van-button>
            <van-button block @click="showChangePassword = false" size="large">取消</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showToast, showDialog, showConfirmDialog } from "vant";
import { useAuthStore } from "~/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

// 响应式数据
const showSettings = ref(false);
const showChangePassword = ref(false);
const defaultAvatar = "https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg";

// 用户信息
const user = ref({
  id: 1,
  name: "张医生",
  username: "doctor1",
  role: "主治医师",
  department: "心血管内科",
  employeeId: "EMP001",
  phone: "13800138000",
  email: "doctor1@hospital.com",
  avatar: "",
  status: "active",
  joinDate: new Date("2020-01-15"),
  lastLoginAt: new Date()
});

// 工作统计
const workStats = ref({
  patientsHandled: 156,
  ordersCompleted: 423,
  workingDays: 245,
  attendanceRate: 98
});

// 系统设置
const settings = ref({
  darkMode: false,
  language: "zh-CN",
  autoLogin: true
});

// 语言选项
const languageOptions = [
  { text: "中文", value: "zh-CN" },
  { text: "English", value: "en-US" }
];

// 修改密码表单
const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

// 快捷功能
const quickActions = [
  {
    icon: "user-o",
    text: "编辑资料",
    color: "#1989fa",
    onClick: () => editProfile()
  },
  {
    icon: "lock",
    text: "修改密码",
    color: "#ff6b6b",
    onClick: () => changePassword()
  },
  {
    icon: "comment-o",
    text: "通知设置",
    color: "#4ecdc4",
    onClick: () => notificationSettings()
  },
  {
    icon: "shield-o",
    text: "隐私设置",
    color: "#45b7d1",
    onClick: () => privacySettings()
  },
  {
    icon: "setting-o",
    text: "系统设置",
    color: "#96ceb4",
    onClick: () => showSettings.value = true
  },
  {
    icon: "question-o",
    text: "帮助中心",
    color: "#feca57",
    onClick: () => helpCenter()
  },
  {
    icon: "info-o",
    text: "关于系统",
    color: "#ff9ff3",
    onClick: () => aboutSystem()
  },
  {
    icon: "close",
    text: "退出登录",
    color: "#ff6b6b",
    onClick: () => logout()
  }
];

// 方法
const formatDate = (date: Date | string) => {
  if (!date) return "未知";
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const editProfile = () => {
	router.push("/profile/edit");
};

const changeAvatar = () => {
  showToast("头像修改功能开发中");
};

const changePassword = () => {
  showChangePassword.value = true;
};

const onPasswordSubmit = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showToast("两次输入的密码不一致");
    return;
  }
  
  try {
    // 这里应该调用API修改密码
    showToast("密码修改成功");
    showChangePassword.value = false;
    passwordForm.value = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    };
  } catch (error) {
    showToast("密码修改失败");
  }
};

const notificationSettings = () => {
  router.push("/settings");
};

const privacySettings = () => {
  router.push("/settings");
};

const aboutSystem = () => {
  showDialog({
    title: "关于系统",
    message: "智慧医疗管理平台 v2.0.0\n\n© 2025 智慧医疗管理平台\n技术支持：医疗信息化部门"
  });
};

const helpCenter = () => {
  router.push("/help");
};

const toggleDarkMode = (value: boolean) => {
  showToast(value ? "已切换到深色模式" : "已切换到浅色模式");
};

const logout = async () => {
  try {
    await showConfirmDialog({
      title: "确认退出",
      message: "确定要退出登录吗？"
    });
    
    await authStore.logout();
    showToast("已退出登录");
    router.push("/login");
  } catch (error) {
    // 用户取消退出
  }
};

// 加载用户数据
const loadUserData = async () => {
  try {
    // 从authStore获取当前用户信息
    if (authStore.user) {
      user.value = {
        id: authStore.user.id,
        name: authStore.user.name || "未知用户",
        username: authStore.user.username || "未知",
        role: authStore.user.role || "用户",
        department: authStore.user.department || "未知科室",
        employeeId: authStore.user.employeeId || "未知",
        phone: authStore.user.phone || "未知",
        email: authStore.user.email || "未知",
        avatar: authStore.user.avatar || "",
        status: "active",
        joinDate: authStore.user.createdAt ? new Date(authStore.user.createdAt) : new Date(),
        lastLoginAt: authStore.user.lastLoginAt ? new Date(authStore.user.lastLoginAt) : new Date()
      };
    }
    
    // 模拟加载工作统计（这里可以后续接入真实API）
    workStats.value = {
      patientsHandled: Math.floor(Math.random() * 200) + 100,
      ordersCompleted: Math.floor(Math.random() * 500) + 200,
      workingDays: Math.floor(Math.random() * 100) + 200,
      attendanceRate: Math.floor(Math.random() * 10) + 90
    };
  } catch (error) {
    console.error("加载用户数据失败:", error);
    showToast("加载用户数据失败");
  }
};

// 生命周期
onMounted(() => {
  loadUserData();
});

definePageMeta({
  layout: "admin",
  title: "个人资料",
  requiresAuth: true,
  middleware: "auth"
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* 头像点击效果 */
.van-image {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.van-image:hover {
  transform: scale(1.05);
}

/* 快捷功能卡片悬停效果 */
.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
  transition: background-color 0.2s ease;
}

/* 统计卡片动画 */
.grid > div {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.grid > div:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 设置弹窗样式 */
.van-popup {
  border-radius: 16px 16px 0 0;
}

/* 密码修改弹窗样式 */
.van-popup[style*="width: 90%"] {
  border-radius: 12px;
}

/* 退出登录按钮样式 */
.text-red-500 {
  color: #ef4444;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quickActions .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 加载动画 */
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

.profile-page > div {
  animation: fadeIn 0.3s ease-out;
}

/* 状态标签样式 */
.van-tag {
  font-size: 12px;
  padding: 2px 8px;
}

/* 统计数字样式 */
.text-2xl {
  font-weight: 700;
  line-height: 1.2;
}

/* 卡片阴影效果 */
.van-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
}

/* 按钮组样式 */
.flex.gap-2 > * {
  flex-shrink: 0;
}

/* 表单样式优化 */
.van-field {
  padding: 12px 16px;
}

.van-field__label {
  font-weight: 500;
  color: #374151;
}

/* 弹窗标题样式 */
.text-lg.font-semibold {
  color: #111827;
  font-weight: 600;
}
</style>
