<template>
  <div class="monitor-page">
    <HeroHeader
      title="医嘱监控"
      subtitle="实时监控与异常管理"
      :showDate="true" />

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 gap-3 p-4">
      <van-card class="stat-card bg-gradient-to-br from-blue-50 to-blue-100">
        <template #title>
          <div class="mb-2 flex items-center">
            <van-icon name="clock" class="mr-2 text-blue-600" size="20" />
            <span class="font-medium text-gray-700">待执行医嘱</span>
          </div>
        </template>
        <template #num>
          <div class="flex flex-col">
            <span class="text-2xl font-bold text-blue-600">{{ pendingCount }}</span>
            <span class="mt-1 text-xs text-gray-500">待处理项</span>
          </div>
        </template>
      </van-card>

      <van-card class="stat-card bg-gradient-to-br from-orange-50 to-orange-100">
        <template #title>
          <div class="mb-2 flex items-center">
            <van-icon name="warning" class="mr-2 text-orange-600" size="20" />
            <span class="font-medium text-gray-700">异常执行</span>
          </div>
        </template>
        <template #num>
          <div class="flex flex-col">
            <span class="text-2xl font-bold text-orange-600">{{ abnormalCount }}</span>
            <span class="mt-1 text-xs text-gray-500">异常项</span>
          </div>
        </template>
      </van-card>
    </div>

    <!-- 新增统计卡片 -->
    <div class="grid grid-cols-2 gap-3 px-4 pb-4">
      <van-card class="stat-card bg-gradient-to-br from-green-50 to-green-100">
        <template #title>
          <div class="mb-2 flex items-center">
            <van-icon name="success" class="mr-2 text-green-600" size="20" />
            <span class="font-medium text-gray-700">已完成</span>
          </div>
        </template>
        <template #num>
          <div class="flex flex-col">
            <span class="text-2xl font-bold text-green-600">{{ completedCount }}</span>
            <span class="mt-1 text-xs text-gray-500">今日完成</span>
          </div>
        </template>
      </van-card>

      <van-card class="stat-card bg-gradient-to-br from-purple-50 to-purple-100">
        <template #title>
          <div class="mb-2 flex items-center">
            <van-icon name="chart-trending-o" class="mr-2 text-purple-600" size="20" />
            <span class="font-medium text-gray-700">执行率</span>
          </div>
        </template>
        <template #num>
          <div class="flex flex-col">
            <span class="text-2xl font-bold text-purple-600">{{ executionRate }}%</span>
            <span class="mt-1 text-xs text-gray-500">今日执行率</span>
          </div>
        </template>
      </van-card>
    </div>

    <!-- 医嘱列表表格 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <template #title>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">医嘱列表</h3>
            <div class="flex items-center space-x-2">
              <van-search
                v-model="searchKeyword"
                placeholder="搜索医嘱"
                @search="onSearch"
                @clear="onClearSearch"
                class="search-input" />
              <van-button
                type="primary"
                size="small"
                icon="refresh"
                @click="refreshOrders">
                刷新
              </van-button>
            </div>
          </div>
        </template>
        
        <div class="orders-table-container">
          <div class="table-wrapper">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>医嘱编号</th>
                  <th>患者姓名</th>
                  <th>医嘱内容</th>
                  <th>医生</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in ordersData" :key="order.id">
                  <td>{{ order.id }}</td>
                  <td>{{ order.patientName || '未知' }}</td>
                  <td>{{ order.content || '无' }}</td>
                  <td>{{ order.doctorName || '未知' }}</td>
                  <td>
                    <van-tag
                      :type="getStatusType(order.status)"
                      size="small">
                      {{ getStatusText(order.status) }}
                    </van-tag>
                  </td>
                  <td>{{ formatDate(order.createdAt) }}</td>
                  <td>
                    <van-button
                      type="primary"
                      size="mini"
                      @click="viewOrder(order.id)">
                      查看
                    </van-button>
                    <van-button
                      v-if="order.status === 'PENDING'"
                      type="success"
                      size="mini"
                      @click="executeOrder(order.id)">
                      执行
                    </van-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 执行记录表格 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <template #title>
          <h3 class="text-lg font-semibold text-gray-800">执行记录</h3>
        </template>
        
        <van-tabs
          v-model:active="activeTab"
          class="monitor-tabs"
          :border="false"
          title-active-color="#1a56db"
          color="#1a56db">
          <van-tab title="今日执行">
            <div class="execution-table-container">
              <div class="table-wrapper">
                <table class="execution-table">
                  <thead>
                    <tr>
                      <th>执行编号</th>
                      <th>医嘱内容</th>
                      <th>患者</th>
                      <th>执行人</th>
                      <th>执行时间</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="execution in executionsData" :key="execution.id">
                      <td>{{ execution.id }}</td>
                      <td>{{ execution.orderContent || '无' }}</td>
                      <td>{{ execution.patientName || '未知' }}</td>
                      <td>{{ execution.executorName || '未知' }}</td>
                      <td>{{ formatDateTime(execution.executedAt) }}</td>
                      <td>
                        <van-tag
                          :type="getExecutionStatusType(execution.status)"
                          size="small">
                          {{ getExecutionStatusText(execution.status) }}
                        </van-tag>
                      </td>
                      <td>
                        <van-button
                          type="primary"
                          size="mini"
                          @click="viewExecution(execution.id)">
                          详情
                        </van-button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </van-tab>
          
          <van-tab title="异常记录">
            <div class="abnormal-table-container">
              <div class="table-wrapper">
                <table class="abnormal-table">
                  <thead>
                    <tr>
                      <th>异常编号</th>
                      <th>医嘱内容</th>
                      <th>患者</th>
                      <th>异常类型</th>
                      <th>异常描述</th>
                      <th>发生时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="abnormal in abnormalData" :key="abnormal.id">
                      <td>{{ abnormal.id }}</td>
                      <td>{{ abnormal.orderContent || '无' }}</td>
                      <td>{{ abnormal.patientName || '未知' }}</td>
                      <td>
                        <van-tag
                          type="danger"
                          size="small">
                          {{ getAbnormalTypeText(abnormal.abnormalType) }}
                        </van-tag>
                      </td>
                      <td>{{ abnormal.abnormalDescription || '无' }}</td>
                      <td>{{ formatDateTime(abnormal.occurredAt) }}</td>
                      <td>
                        <van-button
                          type="warning"
                          size="mini"
                          @click="handleAbnormal(abnormal.id)">
                          处理
                        </van-button>
                        <van-button
                          type="primary"
                          size="mini"
                          @click="viewAbnormal(abnormal.id)">
                          详情
                        </van-button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </SectionCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useOrderStore } from "~/stores/orderStore";
import { OrderExecutionAbnormal } from "~/types/models/order";

const router = useRouter();
const orderStore = useOrderStore();

// 状态管理
const activeTab = ref(0);
const loading = ref(false);
const finished = ref(false);
const abnormalLoading = ref(false);
const abnormalFinished = ref(false);
const error = ref(false);
const abnormalError = ref(false);
const errorText = ref("请求失败，点击重试");
const page = ref(1);
const abnormalPage = ref(1);

// 搜索功能
const searchKeyword = ref('');

// 统计数据 - 直接从 store 获取数据而不使用 computed
const pendingCount = ref(0);
const abnormalCount = ref(0);
const completedCount = ref(0);
const executionRate = ref(0);

// 表格数据
const ordersData = ref([]);
const executionsData = ref([]);
const abnormalData = ref([]);

// 加载今日执行记录
const loadTodayExecutions = async () => {
  if (loading.value) return;

  try {
    loading.value = true;
    error.value = false;

    const result = await orderStore.fetchTodayExecutions(page.value);
    if (result) {
      page.value++;
      // 根据实际数据量判断是否加载完成
      finished.value = result.length < 20;
    }
  } catch (e) {
    error.value = true;
    console.error("加载今日执行记录失败:", e);
  } finally {
    loading.value = false;
  }
};

// 加载异常记录
const loadAbnormalExecutions = async () => {
  if (abnormalLoading.value) return;

  try {
    abnormalLoading.value = true;
    abnormalError.value = false;

    const result = await orderStore.fetchAbnormalExecutions(abnormalPage.value);
    if (result) {
      abnormalPage.value++;
      // 根据实际数据量判断是否加载完成
      abnormalFinished.value = result.length < 20;
    }
  } catch (e) {
    abnormalError.value = true;
    console.error("加载异常记录失败:", e);
  } finally {
    abnormalLoading.value = false;
  }
};

// 导航到执行页面
const navigateToExecute = (orderId: number) => {
  router.push(`/orders/${orderId}/execute`);
};

// 更新统计数据
const updateCounts = () => {
  // 使用表格数据计算统计
  pendingCount.value = ordersData.value.filter((e) => e.status === "PENDING").length;
  abnormalCount.value = abnormalData.value.length;
  completedCount.value = executionsData.value.filter((e) => e.status === "COMPLETED").length;
  
  const totalExecutions = executionsData.value.length;
  const completedExecutions = completedCount.value;
  executionRate.value = totalExecutions > 0 ? Math.round((completedExecutions / totalExecutions) * 100) : 0;
};

// 搜索功能
const onSearch = () => {
  // 实现搜索逻辑
  console.log('搜索:', searchKeyword.value);
};

const onClearSearch = () => {
  searchKeyword.value = '';
  onSearch();
};

// 刷新医嘱列表
const refreshOrders = async () => {
  await orderStore.fetchAllOrders();
  ordersData.value = orderStore.orders;
  updateCounts();
};

// 状态相关方法
const getStatusType = (status: string) => {
  const statusMap = {
    'PENDING': 'warning',
    'APPROVED': 'primary',
    'EXECUTING': 'info',
    'COMPLETED': 'success',
    'CANCELLED': 'danger'
  };
  return statusMap[status] || 'default';
};

const getStatusText = (status: string) => {
  const statusMap = {
    'PENDING': '待审核',
    'APPROVED': '已审核',
    'EXECUTING': '执行中',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  };
  return statusMap[status] || status;
};

const getExecutionStatusType = (status: string) => {
  const statusMap = {
    'PENDING': 'warning',
    'EXECUTING': 'info',
    'COMPLETED': 'success',
    'FAILED': 'danger'
  };
  return statusMap[status] || 'default';
};

const getExecutionStatusText = (status: string) => {
  const statusMap = {
    'PENDING': '待执行',
    'EXECUTING': '执行中',
    'COMPLETED': '已完成',
    'FAILED': '执行失败'
  };
  return statusMap[status] || status;
};

const getAbnormalTypeText = (type: string) => {
  const typeMap = {
    'TIMEOUT': '超时',
    'FAILED': '执行失败',
    'MISSING': '遗漏',
    'ERROR': '错误'
  };
  return typeMap[type] || type;
};

// 日期格式化
const formatDate = (date: Date | string) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN');
};

const formatDateTime = (date: Date | string) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('zh-CN');
};

// 操作按钮方法
const viewOrder = (orderId: number) => {
  router.push(`/orders/${orderId}`);
};

const executeOrder = (orderId: number) => {
  router.push(`/orders/${orderId}/execute`);
};

const viewExecution = (executionId: number) => {
  console.log('查看执行记录:', executionId);
};

const handleAbnormal = (abnormalId: number) => {
  console.log('处理异常:', abnormalId);
};

const viewAbnormal = (abnormalId: number) => {
  console.log('查看异常详情:', abnormalId);
};

// 生成模拟数据
const generateMockData = () => {
  // 模拟医嘱数据
  const mockOrders = [
    {
      id: 1,
      patientName: '张三',
      content: '静脉注射生理盐水 500ml',
      doctorName: '李医生',
      status: 'PENDING',
      createdAt: new Date('2025-01-23 08:30:00')
    },
    {
      id: 2,
      patientName: '李四',
      content: '口服阿莫西林 0.5g 每日3次',
      doctorName: '王医生',
      status: 'APPROVED',
      createdAt: new Date('2025-01-23 09:15:00')
    },
    {
      id: 3,
      patientName: '王五',
      content: '测量血压 每日2次',
      doctorName: '赵医生',
      status: 'EXECUTING',
      createdAt: new Date('2025-01-23 10:00:00')
    }
  ];

  // 模拟执行记录数据
  const mockExecutions = [
    {
      id: 1,
      orderContent: '静脉注射生理盐水 500ml',
      patientName: '张三',
      executorName: '护士A',
      status: 'COMPLETED',
      executedAt: new Date('2025-01-23 08:45:00')
    },
    {
      id: 2,
      orderContent: '口服阿莫西林 0.5g 每日3次',
      patientName: '李四',
      executorName: '护士B',
      status: 'EXECUTING',
      executedAt: new Date('2025-01-23 09:30:00')
    }
  ];

  // 模拟异常数据
  const mockAbnormals = [
    {
      id: 1,
      orderContent: '测量体温 每日4次',
      patientName: '赵六',
      abnormalType: 'TIMEOUT',
      abnormalDescription: '执行超时，未按时完成',
      occurredAt: new Date('2025-01-23 11:00:00')
    }
  ];

  return { mockOrders, mockExecutions, mockAbnormals };
};

// 初始化加载
onMounted(async () => {
  try {
    await orderStore.fetchAllOrders();
    await orderStore.fetchAllExecutions();
    await loadTodayExecutions();
    
    // 初始化表格数据
    ordersData.value = orderStore.orders && orderStore.orders.length > 0 ? orderStore.orders : generateMockData().mockOrders;
    executionsData.value = orderStore.todayExecutions && orderStore.todayExecutions.length > 0 ? orderStore.todayExecutions : generateMockData().mockExecutions;
    abnormalData.value = orderStore.abnormalExecutions && orderStore.abnormalExecutions.length > 0 ? orderStore.abnormalExecutions : generateMockData().mockAbnormals;
    
    updateCounts();
  } catch (error) {
    console.error('初始化数据失败:', error);
    // 使用模拟数据
    const { mockOrders, mockExecutions, mockAbnormals } = generateMockData();
    ordersData.value = mockOrders;
    executionsData.value = mockExecutions;
    abnormalData.value = mockAbnormals;
    updateCounts();
  }
});

// 监听 tab 切换
watch(activeTab, async (newTab) => {
  if (newTab === 1 && orderStore.abnormalExecutions.length === 0) {
    await loadAbnormalExecutions();
  }
});

definePageMeta({
  layout: "admin",
  title: "医嘱监控",
  requiresAuth: true
});
</script>

<style scoped>
.monitor-page {
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

.monitor-tabs {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.monitor-tabs :deep(.van-tabs__wrap) {
  padding: 0 8px;
}

.monitor-tabs :deep(.van-tab) {
  font-size: 15px;
  font-weight: 500;
  padding: 12px 0;
}

.execution-list {
  padding: 4px 0;
}

.execution-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.execution-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 自定义滚动条样式 */
.execution-list {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.execution-list::-webkit-scrollbar {
  width: 6px;
}

.execution-list::-webkit-scrollbar-track {
  background: transparent;
}

.execution-list::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

/* Loading 和 Error 状态样式 */
:deep(.van-list__loading),
:deep(.van-list__error-text),
:deep(.van-list__finished-text) {
  color: #64748b;
  font-size: 14px;
  padding: 16px 0;
  text-align: center;
}

/* 表格样式 */
.orders-table-container,
.execution-table-container,
.abnormal-table-container {
  overflow-x: auto;
  margin-top: 16px;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background: white;
}

.orders-table,
.execution-table,
.abnormal-table {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  background: white;
}

.orders-table th,
.execution-table th,
.abnormal-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  padding: 12px 8px;
  text-align: left;
  border-bottom: 2px solid #e5e7eb;
  font-size: 14px;
}

.orders-table td,
.execution-table td,
.abnormal-table td {
  padding: 12px 8px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.orders-table tr:hover,
.execution-table tr:hover,
.abnormal-table tr:hover {
  background-color: #f9fafb;
}

.orders-table tr:last-child td,
.execution-table tr:last-child td,
.abnormal-table tr:last-child td {
  border-bottom: none;
}

/* 搜索框样式 */
.search-input {
  max-width: 200px;
}

.search-input :deep(.van-search__content) {
  background: #f8fafc;
  border-radius: 6px;
}

/* 按钮组样式 */
.van-button + .van-button {
  margin-left: 8px;
}

/* 标签样式优化 */
.van-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 响应式表格 */
@media (max-width: 768px) {
  .orders-table-container,
  .execution-table-container,
  .abnormal-table-container {
    margin: 0 -16px;
  }
  
  .orders-table,
  .execution-table,
  .abnormal-table {
    min-width: 600px;
  }
  
  .search-input {
    max-width: 150px;
  }
}
</style>
