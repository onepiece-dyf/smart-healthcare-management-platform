<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <!-- 系统状态栏 -->
    <div class="h-safe-area-inset-top bg-primary" />

    <!-- 顶部导航栏 -->
    <van-nav-bar
      class="border-primary/10 bg-primary admin-nav-bar sticky top-0 z-50 border-b shadow-sm"
      fixed
      placeholder>
      <!-- 左侧区域 -->
      <template #left>
        <div class="flex items-center">
          <!-- 系统Logo -->
          <div class="flex items-center mr-4">
            <van-image
              width="32"
              height="32"
              src="/logo.svg"
              fit="contain"
              class="mr-2" />
            <span class="text-white font-bold text-lg hidden sm:block">智慧医疗管理平台</span>
          </div>
          
          <!-- 返回按钮或用户头像 -->
          <template v-if="showBack">
            <span @click="handleBack" class="ml-2">
              <van-icon name="arrow-left" class="mr-1 !text-white" />
              <span class="text-white">返回</span>
            </span>
          </template>
          <template v-else>
            <van-image
              round
              width="32"
              height="32"
              :src="authStore.user?.avatar || '/default-avatar.svg'"
              @click="showUserMenu = true"
              @error="handleAvatarError"
              :error-icon="'user-circle-o'"
              :loading-icon="'loading'" />
          </template>
        </div>
      </template>

      <!-- 标题区域 -->
      <template #title>
        <div class="flex items-center justify-center">
          <span class="text-white">
            {{ (currentRoute.meta.title as string) || "仪表板" }}
          </span>
          <!-- 如果需要显示子标题 -->
          <span v-if="currentRoute.meta.subtitle" class="ml-2 text-xs text-white/70">
            {{ currentRoute.meta.subtitle }}
          </span>
        </div>
      </template>

      <!-- 右侧区域 -->
      <template #right v-if="showRight">
        <div class="flex items-center space-x-4">
          <!-- 搜索按钮 -->
          <van-icon
            v-if="showSearch"
            name="search"
            class="!text-white"
            size="20"
            @click="onSearch" />

          <!-- 通知图标 -->
          <div class="relative" @click="showNotifications">
            <van-badge :content="notificationCount" :max="99" position="top-right">
              <van-icon name="bell" class="!text-white" size="20" />
            </van-badge>
          </div>

          <!-- 更多菜单 -->
          <van-popover
            v-model:show="showMoreMenu"
            placement="bottom-end"
            theme="dark"
            trigger="click"
            :offset="[0, 8]"
            :show-arrow="true">
            <template #reference>
              <van-icon name="ellipsis" class="!text-white" size="20" />
            </template>
            <div class="min-w-[160px] rounded-lg py-1">
              <div
                v-for="item in moreMenuItems"
                :key="item.text"
                class="flex cursor-pointer items-center px-4 py-3 text-sm hover:bg-gray-700"
                @click="handleMoreMenuClick(item)">
                <van-icon :name="item.icon" class="mr-3" />
                {{ item.text }}
              </div>
            </div>
          </van-popover>
        </div>
      </template>
    </van-nav-bar>

    <!-- 主要内容区域：桌面端带侧边栏，移动端全屏 -->
    <div class="flex-1">
      <div class="mx-auto max-w-screen-2xl px-4 md:px-6">
        <div class="md:flex md:gap-6">
          <!-- 侧边栏（仅桌面端显示） -->
          <aside class="sticky top-[52px] hidden h-[calc(100vh-52px)] w-60 shrink-0 overflow-auto rounded-b-xl border border-gray-100 bg-white shadow-lg md:block transition-all duration-300 hover:shadow-xl">
            <nav class="p-3">
              <div class="mb-2 px-2 text-xs font-semibold text-gray-500">导航</div>
              <ul class="space-y-1">
                <li v-for="item in navItems" :key="item.path">
                  <!-- 有子菜单的项目 -->
                  <div v-if="item.children" class="space-y-1">
                    <div 
                      class="nav-item nav-link group flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:scale-105 cursor-pointer"
                      :class="isParentActive(item) 
                        ? 'bg-primary/10 text-primary shadow-sm transform scale-105' 
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'"
                      @click="toggleSubMenu(item.path)">
                      <van-icon 
                        :name="item.icon" 
                        class="icon-rotate mr-2 transition-all duration-200 group-hover:scale-110 text-gray-700" />
                      <span class="transition-all duration-200 group-hover:font-medium flex-1">{{ item.name }}</span>
                      <van-icon 
                        :name="expandedMenus.includes(item.path) ? 'arrow-down' : 'arrow'"
                        class="transition-all duration-200"
                        :class="expandedMenus.includes(item.path) ? 'rotate-180' : ''" />
                    </div>
                    
                    <!-- 子菜单 -->
                    <div 
                      v-if="expandedMenus.includes(item.path)"
                      class="ml-4 space-y-1 animate-fadeIn">
                      <NuxtLink
                        v-for="child in item.children"
                        :key="child.path"
                        :to="child.path"
                        class="nav-item nav-link group flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:scale-105"
                        :class="route.path === child.path 
                          ? 'bg-primary/10 text-primary shadow-sm transform scale-105' 
                          : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'">
                        <van-icon 
                          :name="child.icon" 
                          class="icon-rotate mr-2 transition-all duration-200 group-hover:scale-110 text-gray-600" />
                        <span class="transition-all duration-200 group-hover:font-medium">{{ child.name }}</span>
                        <!-- 活跃状态指示器 -->
                        <div 
                          v-if="route.path === child.path"
                          class="bounce-indicator ml-auto h-2 w-2 rounded-full bg-primary"></div>
                      </NuxtLink>
                    </div>
                  </div>
                  
                  <!-- 没有子菜单的项目 -->
                  <NuxtLink
                    v-else
                    :to="item.path"
                    class="nav-item nav-link group flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:scale-105"
                    :class="route.path.startsWith(item.path) 
                      ? 'bg-primary/10 text-primary shadow-sm transform scale-105' 
                      : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'">
                    <van-icon 
                      :name="item.icon" 
                      class="icon-rotate mr-2 transition-all duration-200 group-hover:scale-110 text-gray-700" />
                    <span class="transition-all duration-200 group-hover:font-medium">{{ item.name }}</span>
                    <!-- 活跃状态指示器 -->
                    <div 
                      v-if="route.path.startsWith(item.path)"
                      class="bounce-indicator ml-auto h-2 w-2 rounded-full bg-primary"></div>
                  </NuxtLink>
                </li>
              </ul>
              <div class="mt-4 px-2 text-xs font-semibold text-gray-500">系统</div>
              <ul class="mt-1 space-y-1">
                <li>
                  <NuxtLink 
                    to="/admin/roles" 
                    class="nav-item nav-link group flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:scale-105"
                    :class="route.path.startsWith('/admin/roles') 
                      ? 'bg-primary/10 text-primary shadow-sm transform scale-105' 
                      : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'">
                    <van-icon 
                      name="friends-o" 
                      class="icon-rotate mr-2 transition-all duration-200 group-hover:scale-110 text-gray-700" />
                    <span class="transition-all duration-200 group-hover:font-medium">角色权限</span>
                    <div 
                      v-if="route.path.startsWith('/admin/roles')"
                      class="bounce-indicator ml-auto h-2 w-2 rounded-full bg-primary"></div>
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink 
                    to="/admin/permissions" 
                    class="nav-item nav-link group flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:scale-105"
                    :class="route.path.startsWith('/admin/permissions') 
                      ? 'bg-primary/10 text-primary shadow-sm transform scale-105' 
                      : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'">
                    <van-icon 
                      name="setting-o" 
                      class="icon-rotate mr-2 transition-all duration-200 group-hover:scale-110 text-gray-700" />
                    <span class="transition-all duration-200 group-hover:font-medium">权限点</span>
                    <div 
                      v-if="route.path.startsWith('/admin/permissions')"
                      class="bounce-indicator ml-auto h-2 w-2 rounded-full bg-primary"></div>
                  </NuxtLink>
                </li>
              </ul>
            </nav>
          </aside>

          <!-- 主内容容器 -->
          <main class="min-w-0 flex-1 overflow-visible py-4 md:py-6">
            <slot />
          </main>
        </div>
      </div>
    </div>

    <!-- 底部导航栏 -->
    <van-tabbar
      v-model="activeTab"
      route
      safe-area-inset-bottom
      fixed
      placeholder
      v-if="showTabbar"
      class="md:hidden">
      <van-tabbar-item
        v-for="tab in tabbarItems"
        :key="tab.name"
        :to="tab.path"
        :icon="tab.icon"
        :badge="tab.badge">
        {{ tab.name }}
      </van-tabbar-item>
    </van-tabbar>

    <!-- 底部安全区域 -->
    <div class="h-safe-area-inset-bottom" />

    <!-- 添加通知弹出层 -->
    <van-popup
      v-model:show="showNotificationList"
      position="right"
      :style="{ width: '80%', height: '100%' }">
      <div class="flex h-full flex-col">
        <van-nav-bar title="通知中心" left-arrow @click-left="showNotificationList = false" />
        <NotificationList class="flex-1 overflow-auto" />
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";
// import { useNotificationStore } from "~/stores/notification";
import NotificationList from "~/components/notification/NotificationList.vue";
import { useMedicationReminderStore } from "~/stores/medicationReminderStore";
import { useVitalSignsStore } from "~/stores/vitalSignsStore";
import type { MedicationReminder } from "~/types/models/medicationReminder";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
// const notificationStore = useNotificationStore();
const showNotificationList = ref(false);
const reminderStore = useMedicationReminderStore();
const vitalSignsStore = useVitalSignsStore();

// 当前路由信息
const currentRoute = computed(() => route);

// 是否显示返回按钮
const showBack = computed(() => {
  return route.meta.showBack !== false && route.path !== "/";
});

// 是否显示底部标签栏
const showTabbar = computed(() => {
  return route.meta.showTabbar !== false;
});

// 是否显示右侧操作区
const showRight = computed(() => {
  return route.meta.showRight !== false;
});

// 处理返回操作
const handleBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
};

// 底部标签栏配置
const activeTab = ref(0);
const tabbarItems = [
  { name: "首页", icon: "home-o", path: "/" },
  { name: "病区", icon: "records", path: "/ward", badge: "2" },
  { name: "患者", icon: "friends-o", path: "/patients" },
  { name: "医嘱", icon: "records", path: "/orders" },
  { name: "我的", icon: "setting-o", path: "/profile" }
];

// 侧边栏导航配置
const navItems = [
  { name: "首页", icon: "home-o", path: "/" },
  { name: "病区管理", icon: "hotel-o", path: "/ward" },
  { name: "患者管理", icon: "friends-o", path: "/patients" },
  { 
    name: "医嘱管理", 
    icon: "records", 
    path: "/orders",
    children: [
      { name: "医嘱监控", icon: "eye-o", path: "/orders/monitor" },
      { name: "医嘱审核", icon: "checked", path: "/orders/review" }
    ]
  },
  { name: "个人资料", icon: "user-o", path: "/profile" }
];

// 子菜单展开状态
const expandedMenus = ref<string[]>([]);

// 切换子菜单展开状态
const toggleSubMenu = (path: string) => {
  const index = expandedMenus.value.indexOf(path);
  if (index > -1) {
    expandedMenus.value.splice(index, 1);
  } else {
    expandedMenus.value.push(path);
  }
};

// 判断父菜单是否激活
const isParentActive = (item: any) => {
  if (!item.children) return false;
  return item.children.some((child: any) => route.path === child.path);
};

// 自动展开当前页面对应的父菜单
const autoExpandMenu = () => {
  const currentPath = route.path;
  for (const item of navItems) {
    if (item.children) {
      const hasActiveChild = item.children.some((child: any) => child.path === currentPath);
      if (hasActiveChild && !expandedMenus.value.includes(item.path)) {
        expandedMenus.value.push(item.path);
      }
    }
  }
};

// 监听路由变化，自动展开菜单
watch(() => route.path, () => {
  autoExpandMenu();
}, { immediate: true });

// 用户菜单
const showUserMenu = ref(false);
const userMenuItems = [
  { text: "个人资料", action: "profile" },
  { text: "系统设置", action: "settings" },
  { text: "退出登录", action: "logout" }
];

// 通知数量
// const notificationCount = computed(() => notificationStore.unreadCount);

const todayReminders = ref<MedicationReminder[]>([]);

const notificationCount = computed(() => {
  const pendingReminders = todayReminders.value.filter((r) => r.status === "PENDING").length;
  const alertsCount = 0;
  return pendingReminders + alertsCount;
});

// 显示通知
const showNotifications = () => {
  showNotificationList.value = true;
};

// 处理用户菜单点击
const handleUserMenuClick = async (item: { text: string; action: string }) => {
  showUserMenu.value = false;

  switch (item.action) {
    case "profile":
      router.push("/profile");
      break;
    case "settings":
      router.push("/settings");
      break;
    case "logout":
      await authStore.logout();
      router.push("/login");
      break;
  }
};

// 更多菜单选项
const showMoreMenu = ref(false);
const moreMenuItems = [
  { text: "个人资料", icon: "user-o", action: "profile" },
  { text: "系统设置", icon: "setting-o", action: "settings" },
  { text: "帮助中心", icon: "question-o", action: "help" },
  { text: "退出登录", icon: "cross", action: "logout" }
];

// 处理更多菜单点击
const handleMoreMenuClick = async (item: { text: string; action: string; icon: string }) => {
  showMoreMenu.value = false;

  switch (item.action) {
    case "profile":
      router.push("/profile");
      break;
    case "settings":
      router.push("/settings");
      break;
    case "help":
      router.push("/help");
      break;
    case "logout":
      await authStore.logout();
      router.push("/login");
      break;
  }
};

// 搜索处理
const showSearch = computed(() => route.meta.showSearch !== false);
const onSearch = () => {
  // TODO: 实现全局搜索功能
  router.push("/search");
};

// 头像错误处理
const handleAvatarError = () => {
  console.log('头像加载失败，使用默认头像');
};

onMounted(async () => {
  todayReminders.value = await reminderStore.fetchTodayAllReminders();
});
</script>

<style scoped>
.admin-nav-bar {
  background-color: var(--van-primary-color);
  background-image: linear-gradient(
    to right,
    var(--van-primary-color),
    color-mix(in srgb, var(--van-primary-color) 90%, #000)
  );
}

/* 修改 placeholder 的背景颜色 */
.admin-nav-bar:deep(.van-nav-bar--fixed) {
  background-color: var(--van-primary-color);
  background-image: linear-gradient(
    to right,
    var(--van-primary-color),
    color-mix(in srgb, var(--van-primary-color) 90%, #000)
  );
}

/* 重要：覆盖 placeholder 的背景颜色 */
.admin-nav-bar:deep(.van-nav-bar__placeholder) {
  background-color: var(--van-primary-color);
  background-image: linear-gradient(
    to right,
    var(--van-primary-color),
    color-mix(in srgb, var(--van-primary-color) 90%, #000)
  );
}

.h-safe-area-inset-bottom {
  height: env(safe-area-inset-bottom);
}

.van-nav-bar {
  background-color: var(--van-primary-color);
  /* 添加渐变背景 */
  background-image: linear-gradient(
    to right,
    var(--van-primary-color),
    color-mix(in srgb, var(--van-primary-color) 90%, #000)
  );
}

.van-nav-bar :deep(.van-nav-bar__content) {
  height: 52px; /* 稍微增加导航栏高度 */
}

.van-nav-bar :deep(.van-nav-bar__title),
.van-nav-bar :deep(.van-nav-bar__left),
.van-nav-bar :deep(.van-nav-bar__right) {
  color: white;
}

/* 添加图标按钮点击效果 */
.van-icon {
  cursor: pointer;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.7;
  }
}

/* 优化 Popover 样式 */
.van-popover {
  :deep(.van-popover__content) {
    padding: 4px 0;
    border-radius: 8px;
  }
}

/* 添加阴影效果 */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* 导航项动画效果 */
.nav-item {
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.nav-item:hover::before {
  left: 100%;
}

/* 图标旋转动画 */
.icon-rotate {
  transition: transform 0.3s ease;
}

.icon-rotate:hover {
  transform: rotate(15deg);
}

/* 脉冲动画 */
@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.pulse-glow {
  animation: pulse-glow 2s infinite;
}

/* 侧边栏进入动画 */
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.sidebar-enter {
  animation: slideInLeft 0.5s ease-out;
}

/* 导航项悬停效果 */
.nav-link {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover::after {
  width: 80%;
}

/* 活跃状态指示器动画 */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
}

.bounce-indicator {
  animation: bounce 1s infinite;
}

/* 子菜单动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

/* 子菜单样式 */
.ml-4 .nav-item {
  font-size: 13px;
  padding: 8px 12px;
}

.ml-4 .nav-item .van-icon {
  font-size: 14px;
}

/* 箭头旋转动画 */
.rotate-180 {
  transform: rotate(180deg);
}
</style>
