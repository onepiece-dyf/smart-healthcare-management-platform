<template>
  <div class="review-page">
    <HeroHeader
      title="医嘱审核"
      subtitle="智能审核与质量控制"
      :showDate="true" />
    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 gap-3 p-4">
      <van-card class="stat-card bg-gradient-to-br from-blue-50 to-blue-100">
        <template #title>
          <div class="mb-2 flex items-center">
            <van-icon name="clock" class="mr-2 text-blue-600" size="20" />
            <span class="font-medium text-gray-700">待审核</span>
          </div>
        </template>
        <template #num>
          <div class="flex flex-col">
            <span class="text-2xl font-bold text-blue-600">{{ pendingCount }}</span>
            <span class="mt-1 text-xs text-gray-500">待处理项</span>
          </div>
        </template>
      </van-card>

      <van-card class="stat-card bg-gradient-to-br from-green-50 to-green-100">
        <template #title>
          <div class="mb-2 flex items-center">
            <van-icon name="success" class="mr-2 text-green-600" size="20" />
            <span class="font-medium text-gray-700">今日通过</span>
          </div>
        </template>
        <template #num>
          <div class="flex flex-col">
            <span class="text-2xl font-bold text-green-600">{{ approvedTodayCount }}</span>
            <span class="mt-1 text-xs text-gray-500">已审核项</span>
          </div>
        </template>
      </van-card>
    </div>

    <!-- 新增统计卡片 -->
    <div class="grid grid-cols-2 gap-3 px-4 pb-4">
      <van-card class="stat-card bg-gradient-to-br from-orange-50 to-orange-100">
        <template #title>
          <div class="mb-2 flex items-center">
            <van-icon name="warning" class="mr-2 text-orange-600" size="20" />
            <span class="font-medium text-gray-700">今日驳回</span>
          </div>
        </template>
        <template #num>
          <div class="flex flex-col">
            <span class="text-2xl font-bold text-orange-600">{{ rejectedTodayCount }}</span>
            <span class="mt-1 text-xs text-gray-500">需修改项</span>
          </div>
        </template>
      </van-card>

      <van-card class="stat-card bg-gradient-to-br from-purple-50 to-purple-100">
        <template #title>
          <div class="mb-2 flex items-center">
            <van-icon name="chart-trending-o" class="mr-2 text-purple-600" size="20" />
            <span class="font-medium text-gray-700">审核率</span>
          </div>
        </template>
        <template #num>
          <div class="flex flex-col">
            <span class="text-2xl font-bold text-purple-600">{{ reviewRate }}%</span>
            <span class="mt-1 text-xs text-gray-500">今日审核率</span>
          </div>
        </template>
      </van-card>
    </div>

    <!-- 筛选和搜索栏 -->
    <div class="sticky top-0 z-10 bg-white p-3 space-y-3">
      <van-search
        v-model="searchText"
        placeholder="搜索医嘱内容、患者姓名或医生"
        @search="handleSearch" />
      
      <!-- 筛选栏 -->
      <div class="flex items-center space-x-2">
        <van-dropdown-menu>
          <van-dropdown-item v-model="selectedStatus" :options="statusOptions" title="状态" />
          <van-dropdown-item v-model="selectedPriority" :options="priorityOptions" title="优先级" />
          <van-dropdown-item v-model="selectedDepartment" :options="departmentOptions" title="科室" />
        </van-dropdown-menu>
        
        <van-button
          type="primary"
          size="small"
          icon="filter"
          @click="showFilterDialog = true">
          高级筛选
        </van-button>
        
        <van-button
          v-if="selectedOrders.length > 0"
          type="success"
          size="small"
          icon="check"
          @click="showBatchActions = true">
          批量操作({{ selectedOrders.length }})
        </van-button>
      </div>
    </div>

    <!-- 审核列表 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <template #title>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">待审核医嘱</h3>
            <div class="flex items-center space-x-2">
              <van-button
                size="small"
                :type="selectMode ? 'primary' : 'default'"
                @click="toggleSelectMode">
                {{ selectMode ? '取消选择' : '批量选择' }}
              </van-button>
              <van-button
                size="small"
                icon="refresh"
                @click="onRefresh">
                刷新
              </van-button>
            </div>
          </div>
        </template>
        
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多待审核医嘱"
            @load="loadMore">
            <div class="p-4">
              <div
                v-for="order in filteredOrders"
                :key="order.id"
                class="mb-4"
                :class="{ 'selected': selectedOrders.includes(order.id!) }">
                <OrderCard
                  :order="order"
                  :show-actions="false"
                  @click="handleOrderClick(order.id!)">
                  <template #actions v-if="selectMode">
                    <van-checkbox
                      v-model="selectedOrders"
                      :name="order.id"
                      @click.stop />
                  </template>
                  <template #actions v-else>
                    <div class="flex space-x-2">
                      <van-button
                        size="mini"
                        type="primary"
                        @click.stop="quickApprove(order.id!)">
                        快速通过
                      </van-button>
                      <van-button
                        size="mini"
                        type="danger"
                        @click.stop="quickReject(order.id!)">
                        快速驳回
                      </van-button>
                      <van-button
                        size="mini"
                        type="default"
                        @click.stop="navigateToDetail(order.id!)">
                        详细审核
                      </van-button>
                    </div>
                  </template>
                </OrderCard>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </SectionCard>
    </div>

    <!-- 高级筛选弹窗 -->
    <van-popup v-model:show="showFilterDialog" position="bottom" round>
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4">高级筛选</h3>
        
        <van-form>
          <van-field
            v-model="filters.dateRange"
            label="创建时间"
            placeholder="选择时间范围"
            readonly
            @click="showDatePicker = true" />
          
          <van-field
            v-model="filters.doctorName"
            label="医生姓名"
            placeholder="请输入医生姓名" />
          
          <van-field
            v-model="filters.patientName"
            label="患者姓名"
            placeholder="请输入患者姓名" />
          
          <van-field
            v-model="filters.orderType"
            label="医嘱类型"
            placeholder="请选择医嘱类型"
            readonly
            @click="showOrderTypePicker = true" />
        </van-form>
        
        <div class="flex space-x-2 mt-4">
          <van-button block @click="resetFilters">重置</van-button>
          <van-button block type="primary" @click="applyFilters">应用筛选</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 批量操作弹窗 -->
    <van-popup v-model:show="showBatchActions" position="bottom" round>
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4">批量操作 ({{ selectedOrders.length }}项)</h3>
        
        <div class="space-y-2">
          <van-button
            block
            type="success"
            @click="batchApprove">
            批量通过
          </van-button>
          <van-button
            block
            type="danger"
            @click="batchReject">
            批量驳回
          </van-button>
          <van-button
            block
            type="default"
            @click="batchAssign">
            批量分配
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useOrderStore } from "~/stores/orderStore";
import { useAuthStore } from "~/stores/auth";
import { OrderStatus, type Order } from "~/types/models/order";
import { showDialog, showSuccessToast, showFailToast } from "vant";

const router = useRouter();
const orderStore = useOrderStore();
const authStore = useAuthStore();

// 状态管理
const searchText = ref("");
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const page = ref(1);

// 筛选状态
const selectedStatus = ref("all");
const selectedPriority = ref("all");
const selectedDepartment = ref("all");
const showFilterDialog = ref(false);
const showBatchActions = ref(false);
const selectMode = ref(false);
const selectedOrders = ref<number[]>([]);

// 筛选选项
const statusOptions = [
  { text: "全部状态", value: "all" },
  { text: "待审核", value: "PENDING" },
  { text: "已通过", value: "APPROVED" },
  { text: "已驳回", value: "REJECTED" }
];

const priorityOptions = [
  { text: "全部优先级", value: "all" },
  { text: "紧急", value: "URGENT" },
  { text: "普通", value: "NORMAL" },
  { text: "非紧急", value: "LOW" }
];

const departmentOptions = [
  { text: "全部科室", value: "all" },
  { text: "内科", value: "INTERNAL" },
  { text: "外科", value: "SURGERY" },
  { text: "儿科", value: "PEDIATRICS" }
];

// 高级筛选
const filters = ref({
  dateRange: "",
  doctorName: "",
  patientName: "",
  orderType: ""
});

// 弹窗状态
const showDatePicker = ref(false);
const showOrderTypePicker = ref(false);

// 统计数据
const pendingCount = ref(0);
const approvedTodayCount = ref(0);
const rejectedTodayCount = ref(0);
const reviewRate = ref(0);

// 获取待审核医嘱
const pendingOrders = computed(() =>
  orderStore.orders.filter((order) => order.status === OrderStatus.PENDING)
);

// 过滤后的医嘱
const filteredOrders = computed(() => {
  let filtered = pendingOrders.value;
  
  // 搜索过滤
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase();
    filtered = filtered.filter(order => 
      order.content?.toLowerCase().includes(keyword) ||
      order.patient?.name?.toLowerCase().includes(keyword) ||
      order.doctor?.name?.toLowerCase().includes(keyword)
    );
  }
  
  // 状态过滤
  if (selectedStatus.value !== "all") {
    filtered = filtered.filter(order => order.status === selectedStatus.value);
  }
  
  // 优先级过滤
  if (selectedPriority.value !== "all") {
    filtered = filtered.filter(order => order.priority === selectedPriority.value);
  }
  
  // 科室过滤
  if (selectedDepartment.value !== "all") {
    filtered = filtered.filter(order => order.department === selectedDepartment.value);
  }
  
  return filtered;
});

// 更新统计数据
const updateStats = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  pendingCount.value = orderStore.orders.filter(order => order.status === OrderStatus.PENDING).length;
  
  approvedTodayCount.value = orderStore.orders.filter(order => 
    order.status === OrderStatus.APPROVED && 
    order.updatedAt && 
    new Date(order.updatedAt) >= today
  ).length;
  
  rejectedTodayCount.value = orderStore.orders.filter(order => 
    order.status === OrderStatus.REJECTED && 
    order.updatedAt && 
    new Date(order.updatedAt) >= today
  ).length;
  
  const totalToday = approvedTodayCount.value + rejectedTodayCount.value;
  reviewRate.value = totalToday > 0 ? Math.round((approvedTodayCount.value / totalToday) * 100) : 0;
};

// 加载更多
const loadMore = async () => {
  try {
    loading.value = true;
    await orderStore.fetchOrdersPage({
      status: [OrderStatus.PENDING],
      page: page.value,
      searchText: searchText.value
    });
    page.value++;
    if (orderStore.orders.length < page.value * 20) {
      finished.value = true;
    }
    updateStats();
  } finally {
    loading.value = false;
    finished.value = true;
  }
};

// 搜索处理
const handleSearch = () => {
  finished.value = false;
  page.value = 1;
  orderStore.clearOrders();
  loadMore();
};

// 刷新处理
const onRefresh = async () => {
  finished.value = false;
  page.value = 1;
  orderStore.clearOrders();
  await loadMore();
  refreshing.value = false;
};

// 切换选择模式
const toggleSelectMode = () => {
  selectMode.value = !selectMode.value;
  if (!selectMode.value) {
    selectedOrders.value = [];
  }
};

// 处理医嘱点击
const handleOrderClick = (id: number) => {
  if (selectMode.value) {
    const index = selectedOrders.value.indexOf(id);
    if (index > -1) {
      selectedOrders.value.splice(index, 1);
    } else {
      selectedOrders.value.push(id);
    }
  } else {
    navigateToDetail(id);
  }
};

// 快速通过
const quickApprove = async (id: number) => {
  try {
    await orderStore.updateOrderStatus(id, OrderStatus.APPROVED, {
      reviewerId: authStore.user?.id,
      reviewTime: new Date(),
      reviewNotes: "快速通过"
    });
    showSuccessToast("审核通过");
    updateStats();
  } catch (error) {
    showFailToast("操作失败");
  }
};

// 快速驳回
const quickReject = async (id: number) => {
  showDialog({
    title: "确认驳回",
    message: "确定要驳回该医嘱吗？",
    showCancelButton: true
  }).then(async () => {
    try {
      await orderStore.updateOrderStatus(id, OrderStatus.REJECTED, {
        reviewerId: authStore.user?.id,
        reviewTime: new Date(),
        reviewNotes: "快速驳回"
      });
      showSuccessToast("已驳回");
      updateStats();
    } catch (error) {
      showFailToast("操作失败");
    }
  });
};

// 批量通过
const batchApprove = async () => {
  try {
    for (const id of selectedOrders.value) {
      await orderStore.updateOrderStatus(id, OrderStatus.APPROVED, {
        reviewerId: authStore.user?.id,
        reviewTime: new Date(),
        reviewNotes: "批量通过"
      });
    }
    showSuccessToast(`已通过 ${selectedOrders.value.length} 项医嘱`);
    selectedOrders.value = [];
    showBatchActions.value = false;
    updateStats();
  } catch (error) {
    showFailToast("批量操作失败");
  }
};

// 批量驳回
const batchReject = async () => {
  showDialog({
    title: "确认批量驳回",
    message: `确定要驳回选中的 ${selectedOrders.value.length} 项医嘱吗？`,
    showCancelButton: true
  }).then(async () => {
    try {
      for (const id of selectedOrders.value) {
        await orderStore.updateOrderStatus(id, OrderStatus.REJECTED, {
          reviewerId: authStore.user?.id,
          reviewTime: new Date(),
          reviewNotes: "批量驳回"
        });
      }
      showSuccessToast(`已驳回 ${selectedOrders.value.length} 项医嘱`);
      selectedOrders.value = [];
      showBatchActions.value = false;
      updateStats();
    } catch (error) {
      showFailToast("批量操作失败");
    }
  });
};

// 批量分配
const batchAssign = () => {
  showFailToast("批量分配功能开发中");
};

// 应用筛选
const applyFilters = () => {
  showFilterDialog.value = false;
  handleSearch();
};

// 重置筛选
const resetFilters = () => {
  filters.value = {
    dateRange: "",
    doctorName: "",
    patientName: "",
    orderType: ""
  };
  selectedStatus.value = "all";
  selectedPriority.value = "all";
  selectedDepartment.value = "all";
  handleSearch();
};

// 导航到详情页
const navigateToDetail = (id: number) => {
  router.push(`/orders/review/${id}`);
};

// 初始化
onMounted(async () => {
  await orderStore.fetchAllOrders();
  updateStats();
});

definePageMeta({
  layout: "admin",
  title: "医嘱审核",
  requiresAuth: true
});
</script>

<style scoped>
.review-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.selected {
  background-color: #e3f2fd;
  border: 2px solid #2196f3;
  border-radius: 8px;
}

.van-dropdown-menu {
  flex: 1;
}

.van-dropdown-menu :deep(.van-dropdown-item) {
  font-size: 14px;
}

.van-dropdown-menu :deep(.van-dropdown-item__title) {
  color: #374151;
  font-weight: 500;
}

/* 筛选弹窗样式 */
.van-popup {
  max-height: 80vh;
}

.van-popup .p-4 {
  padding: 16px;
}

.van-popup h3 {
  color: #111827;
  font-weight: 600;
  margin-bottom: 16px;
}

/* 批量操作按钮样式 */
.van-button + .van-button {
  margin-left: 8px;
}

/* 快速操作按钮组 */
.flex.space-x-2 .van-button {
  margin-right: 8px;
}

.flex.space-x-2 .van-button:last-child {
  margin-right: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grid.grid-cols-2 {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  
  .stat-card {
    padding: 12px;
  }
  
  .flex.space-x-2 {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .flex.space-x-2 .van-button {
    flex: 1;
    min-width: 80px;
  }
}
</style>
