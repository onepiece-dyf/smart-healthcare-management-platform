<template>
  <div class="orders-page">
    <HeroHeader title="医嘱管理" subtitle="智能医嘱管理与监控系统" :showDate="true" />
    
    <!-- 统计卡片 -->
    <div class="px-4 py-3">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="stat-card">
          <div class="stat-icon bg-blue-100 text-blue-600">
            <van-icon name="records" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-label">总医嘱数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-orange-100 text-orange-600">
            <van-icon name="clock-o" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.pending }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-green-100 text-green-600">
            <van-icon name="success" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-red-100 text-red-600">
            <van-icon name="warning-o" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.urgent }}</div>
            <div class="stat-label">紧急医嘱</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div class="flex items-center p-3 gap-2">
        <van-search
          v-model="searchText"
          placeholder="搜索医嘱内容、患者姓名、医生姓名"
          @search="handleSearch"
          @clear="handleClearSearch"
          class="flex-1" />
        <van-button 
          icon="filter-o" 
          @click="showFilter = true"
          :class="hasActiveFilters ? 'bg-primary text-white' : ''">
          筛选
        </van-button>
        <van-button 
          icon="refresh" 
          @click="onRefresh"
          :loading="loading">
          刷新
        </van-button>
      </div>
      
      <!-- 快速筛选标签 -->
      <div v-if="quickFilters.length > 0" class="px-3 pb-2">
        <div class="flex flex-wrap gap-2">
          <van-tag
            v-for="filter in quickFilters"
            :key="filter.key"
            :type="filter.active ? 'primary' : 'default'"
            @click="toggleQuickFilter(filter)"
            class="cursor-pointer">
            {{ filter.label }}
          </van-tag>
        </div>
      </div>
    </div>

    <!-- 分类切换 -->
    <van-tabs v-model:active="activeTab" sticky offset-top="54" class="order-tabs">
      <van-tab title="长期医嘱" :name="OrderType.LONG_TERM">
        <OrderList
          :orders="filteredOrders"
          v-model:loading="loading"
          v-model:finished="finished"
          @load="loadMore"
          @refresh="onRefresh" />
      </van-tab>
      <van-tab title="临时医嘱" :name="OrderType.TEMPORARY">
        <OrderList
          :orders="filteredOrders"
          v-model:loading="loading"
          v-model:finished="finished"
          @load="loadMore"
          @refresh="onRefresh" />
      </van-tab>
    </van-tabs>

    <!-- 高级筛选器 -->
    <van-popup v-model:show="showFilter" position="bottom" :style="{ height: '80%' }">
      <div class="filter-popup">
        <div class="filter-header">
          <h3 class="filter-title">高级筛选</h3>
          <van-icon name="cross" @click="showFilter = false" class="filter-close" />
        </div>
        
        <div class="filter-content">
          <!-- 状态筛选 -->
          <div class="filter-section">
            <h4 class="filter-section-title">医嘱状态</h4>
            <van-checkbox-group v-model="filters.status">
              <div class="filter-options">
                <van-checkbox
                  v-for="status in getOptions('OrderStatus')"
                  :key="status.value"
                  :name="status.value"
                  class="filter-option">
                  {{ status.label }}
                </van-checkbox>
              </div>
            </van-checkbox-group>
          </div>

          <!-- 优先级筛选 -->
          <div class="filter-section">
            <h4 class="filter-section-title">优先级</h4>
            <van-checkbox-group v-model="filters.priority">
              <div class="filter-options">
                <van-checkbox name="HIGH" class="filter-option">高优先级</van-checkbox>
                <van-checkbox name="MEDIUM" class="filter-option">中优先级</van-checkbox>
                <van-checkbox name="LOW" class="filter-option">低优先级</van-checkbox>
              </div>
            </van-checkbox-group>
          </div>

          <!-- 医生科室筛选 -->
          <div class="filter-section">
            <h4 class="filter-section-title">医生科室</h4>
            <van-checkbox-group v-model="filters.departments">
              <div class="filter-options">
                <van-checkbox
                  v-for="dept in departments"
                  :key="dept"
                  :name="dept"
                  class="filter-option">
                  {{ dept }}
                </van-checkbox>
              </div>
            </van-checkbox-group>
          </div>

          <!-- 时间范围筛选 -->
          <div class="filter-section">
            <h4 class="filter-section-title">创建时间</h4>
            <div class="filter-dates">
              <van-field
                v-model="filters.dateRange[0]"
                label="开始日期"
                type="date"
                placeholder="选择开始日期" />
              <van-field
                v-model="filters.dateRange[1]"
                label="结束日期"
                type="date"
                placeholder="选择结束日期" />
            </div>
          </div>

          <!-- 执行频率筛选 -->
          <div class="filter-section">
            <h4 class="filter-section-title">执行频率</h4>
            <van-checkbox-group v-model="filters.frequencies">
              <div class="filter-options">
                <van-checkbox
                  v-for="freq in frequencies"
                  :key="freq"
                  :name="freq"
                  class="filter-option">
                  {{ freq }}
                </van-checkbox>
              </div>
            </van-checkbox-group>
          </div>
        </div>

        <div class="filter-actions">
          <van-button 
            plain 
            type="primary" 
            size="large" 
            @click="resetFilter"
            class="flex-1">
            重置
          </van-button>
          <van-button 
            type="primary" 
            size="large" 
            @click="applyFilter"
            class="flex-1">
            应用筛选
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 悬浮按钮组 -->
    <FloatingButtonGroup>
      <!-- 新增医嘱按钮 -->
      <van-button v-if="canCreateOrder" icon="plus" type="primary" round @click="navigateToCreate">
        新增
      </van-button>
      <van-button icon="eye-o" type="warning" round @click="router.push('/orders/monitor')">
        监控
      </van-button>

      <!-- 待审核按钮 -->
      <van-button
        v-if="hasReviewPermission"
        type="primary"
        icon="records"
        round
        @click="router.push('/orders/review')">
        待审核
      </van-button>
    </FloatingButtonGroup>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useOrderStore } from "~/stores/orderStore";
import { useEnum } from "~/types/enums/metadata";
import { OrderStatus, OrderType, OrderPriority } from "~/types/models/order";
import FloatingButtonGroup from "~/components/common/FloatingButtonGroup.vue";
import { storeToRefs } from "pinia";

const { getOptions } = useEnum();

const router = useRouter();
const orderStore = useOrderStore();

// 状态管理
const activeTab = ref<OrderType>(OrderType.LONG_TERM);
const searchText = ref("");
const showFilter = ref(false);
const loading = ref(false);
const finished = ref(false);
const page = ref(1);
const pageSize = ref(20); // 增加分页大小

// 筛选条件
const filters = ref({
  status: [] as OrderStatus[],
  priority: [] as OrderPriority[],
  departments: [] as string[],
  dateRange: ['', ''],
  frequencies: [] as string[]
});

// 科室列表
const departments = [
  '心血管内科', '内分泌科', '呼吸内科', '消化内科', '神经内科',
  '骨科', '泌尿外科', '妇产科', '儿科', '急诊科'
];

// 频率列表
const frequencies = [
  '每日一次', '每日两次', '每日三次', '每日四次', 
  '每12小时一次', '每8小时一次', '每6小时一次', '立即执行', '按需服用'
];

// 快速筛选标签
const quickFilters = ref([
  { key: 'urgent', label: '紧急医嘱', active: false },
  { key: 'pending', label: '待审核', active: false },
  { key: 'today', label: '今日医嘱', active: false },
  { key: 'completed', label: '已完成', active: false }
]);

// 权限检查
const canCreateOrder = computed(() => {
  return true;
});

const { orders } = storeToRefs(orderStore);

// 统计数据
const statistics = computed(() => {
  const allOrders = orders.value;
  return {
    total: allOrders.length,
    pending: allOrders.filter(o => o.status === OrderStatus.PENDING).length,
    completed: allOrders.filter(o => o.status === OrderStatus.COMPLETED).length,
    urgent: allOrders.filter(o => o.priority === 'HIGH').length
  };
});

// 是否有活跃筛选条件
const hasActiveFilters = computed(() => {
  return filters.value.status.length > 0 ||
         filters.value.priority.length > 0 ||
         filters.value.departments.length > 0 ||
         filters.value.frequencies.length > 0 ||
         filters.value.dateRange[0] || filters.value.dateRange[1] ||
         quickFilters.value.some(f => f.active);
});

// 过滤后的医嘱列表
const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    // 类型匹配
    const matchesType = order.type === activeTab.value;
    
    // 状态匹配
    const matchesStatus = filters.value.status.length === 0 || 
                         filters.value.status.includes(order.status);
    
    // 优先级匹配
    const matchesPriority = filters.value.priority.length === 0 || 
                           (order.priority && filters.value.priority.includes(order.priority));
    
    // 科室匹配
    const matchesDepartment = filters.value.departments.length === 0 || 
                             (order.doctorDepartment && filters.value.departments.includes(order.doctorDepartment));
    
    // 频率匹配
    const matchesFrequency = filters.value.frequencies.length === 0 || 
                            (order.frequency && filters.value.frequencies.includes(order.frequency));
    
    // 时间范围匹配
    const matchesDateRange = !filters.value.dateRange[0] || !filters.value.dateRange[1] || 
                            (order.createdAt && 
                             new Date(order.createdAt) >= new Date(filters.value.dateRange[0]) &&
                             new Date(order.createdAt) <= new Date(filters.value.dateRange[1]));
    
    // 搜索匹配
    const matchesSearch = searchText.value === "" ||
      order.content.toLowerCase().includes(searchText.value.toLowerCase()) ||
      (order.doctorName && order.doctorName.toLowerCase().includes(searchText.value.toLowerCase())) ||
      (order.patient?.name && order.patient.name.toLowerCase().includes(searchText.value.toLowerCase()));
    
    // 快速筛选匹配
    const matchesQuickFilter = !quickFilters.value.some(f => f.active) || 
      (quickFilters.value.find(f => f.key === 'urgent' && f.active) && order.priority === 'HIGH') ||
      (quickFilters.value.find(f => f.key === 'pending' && f.active) && order.status === OrderStatus.PENDING) ||
      (quickFilters.value.find(f => f.key === 'today' && f.active) && 
       order.createdAt && isToday(new Date(order.createdAt))) ||
      (quickFilters.value.find(f => f.key === 'completed' && f.active) && order.status === OrderStatus.COMPLETED);

    return matchesType && matchesStatus && matchesPriority && matchesDepartment && 
           matchesFrequency && matchesDateRange && matchesSearch && matchesQuickFilter;
  });
});

// 判断是否为今天
const isToday = (date: Date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// 加载更多
const loadMore = async () => {
  loading.value = true;
  try {
    await orderStore.fetchAllOrders();
    if (filteredOrders.value.length < 20) {
      finished.value = true;
    } else {
      page.value++;
    }
  } finally {
    loading.value = false;
  }
};

// 刷新
const onRefresh = async () => {
  finished.value = false;
  page.value = 1;
  await orderStore.fetchAllOrders();
};

// 搜索处理
const handleSearch = () => {
  finished.value = false;
  page.value = 1;
};

// 清除搜索
const handleClearSearch = () => {
  searchText.value = '';
  handleSearch();
};

// 切换快速筛选
const toggleQuickFilter = (filter: any) => {
  filter.active = !filter.active;
  // 如果激活了其他快速筛选，取消其他筛选
  if (filter.active) {
    quickFilters.value.forEach(f => {
      if (f.key !== filter.key) {
        f.active = false;
      }
    });
  }
  handleSearch();
};

// 应用筛选
const applyFilter = () => {
  showFilter.value = false;
  handleSearch();
};

// 重置筛选
const resetFilter = () => {
  filters.value = {
    status: [],
    priority: [],
    departments: [],
    dateRange: ['', ''],
    frequencies: []
  };
  quickFilters.value.forEach(f => f.active = false);
  showFilter.value = false;
  handleSearch();
};

// 跳转到创建页面
const navigateToCreate = () => {
  router.push("/orders/create");
};

// 初始加载
onMounted(() => {
  loadMore();
});

// 权限检查
const hasReviewPermission = computed(() => {
  return true;
});

definePageMeta({
  layout: "admin",
  title: "医嘱列表",
  requiresAuth: true
});
</script>

<style scoped>
.orders-page {
  min-height: calc(100vh - 96px);
  background-color: var(--van-background);
}

/* 统计卡片样式 */
.stat-card {
  @apply bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-3;
}

.stat-icon {
  @apply w-10 h-10 rounded-full flex items-center justify-center;
}

.stat-content {
  @apply flex-1;
}

.stat-value {
  @apply text-xl font-bold text-gray-900;
}

.stat-label {
  @apply text-sm text-gray-500;
}

/* 筛选弹窗样式 */
.filter-popup {
  @apply h-full flex flex-col;
}

.filter-header {
  @apply flex items-center justify-between p-4 border-b border-gray-100;
}

.filter-title {
  @apply text-lg font-semibold text-gray-900;
}

.filter-close {
  @apply text-gray-400 text-xl cursor-pointer;
}

.filter-content {
  @apply flex-1 overflow-y-auto p-4 space-y-6;
}

.filter-section {
  @apply space-y-3;
}

.filter-section-title {
  @apply text-base font-medium text-gray-900;
}

.filter-options {
  @apply grid grid-cols-2 gap-2;
}

.filter-option {
  @apply text-sm;
}

.filter-dates {
  @apply space-y-3;
}

.filter-actions {
  @apply flex gap-3 p-4 border-t border-gray-100;
}

/* 快速筛选标签样式 */
.van-tag {
  @apply transition-all duration-200;
}

.van-tag.cursor-pointer:hover {
  @apply transform scale-105;
}

/* 订单标签页样式 */
.order-tabs :deep(.van-tabs__wrap) {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .filter-options {
    @apply grid-cols-1;
  }
  
  .stat-card {
    @apply p-2;
  }
  
  .stat-icon {
    @apply w-8 h-8;
  }
  
  .stat-value {
    @apply text-lg;
  }
}
</style>
