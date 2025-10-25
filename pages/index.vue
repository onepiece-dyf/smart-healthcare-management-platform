<template>
  <div class="dashboard pb-safe">
    <!-- 顶部 Hero -->
    <div class="relative overflow-hidden rounded-b-2xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#EC4899] p-5 text-white">
      <div class="flex items-center justify-between">
        <div>
          <div class="mb-1 text-xs opacity-90">欢迎回来</div>
          <div class="text-xl font-semibold tracking-wide">智能护理管理控制台</div>
          <div class="mt-1 text-xs opacity-90">今日概览与快捷操作</div>
        </div>
        <div class="rounded-xl bg-white/10 px-3 py-2 text-xs backdrop-blur">
          {{ todayString }}
        </div>
      </div>
      <div class="mt-4 grid grid-cols-4 gap-3">
        <div
          v-for="action in quickActions"
          :key="action.name"
          class="group cursor-pointer rounded-xl bg-white/10 p-3 text-center transition-all hover:bg-white/15 active:opacity-80"
          @click="router.push(action.path)">
          <div
            class="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full shadow-inner"
            :style="{ background: action.bgGradient }">
            <van-icon :name="action.icon" size="20" :color="action.iconColor" />
          </div>
          <span class="text-[12px] leading-none">{{ action.name }}</span>
        </div>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="relative -mt-5 px-4">
      <van-row gutter="12">
        <van-col span="12" v-for="stat in statistics" :key="stat.title">
          <div class="glass mb-4 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="mb-1 text-[12px] text-gray-500">{{ stat.title }}</div>
                <div class="text-2xl font-bold">{{ stat.value }}</div>
              </div>
              <div
                class="rounded-full px-2 py-1 text-[10px]"
                :class="stat.trend > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'">
                {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}% 本周
              </div>
            </div>
            <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div class="h-full rounded-full" :class="stat.barColor" :style="{ width: stat.progress + '%' }" />
            </div>
          </div>
        </van-col>
      </van-row>
    </div>

    <!-- 图表区域 -->
    <div class="mx-4 mb-4 rounded-xl bg-white p-4 shadow-sm">
      <div class="mb-2 flex items-center justify-between">
        <h2 class="text-lg font-semibold">患者趋势</h2>
        <van-tabs v-model:active="activeSeries" shrink>
          <van-tab title="全部" name="all" />
          <van-tab title="入院" name="admit" />
          <van-tab title="出院" name="discharge" />
        </van-tabs>
      </div>
      <div v-if="chartLoading" class="flex h-64 w-full items-center justify-center">
        <van-loading type="spinner" size="24px">加载图表中...</van-loading>
      </div>
      <v-chart v-else class="h-64 w-full" :option="chartOption" autoresize />
    </div>

    <!-- 待办事项 -->
    <div class="mx-4 mb-6 rounded-xl bg-white p-4 shadow-sm">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-semibold">待办事项</h2>
        <van-tabs v-model:active="activeTaskTab" shrink>
          <van-tab title="今日" name="today" />
          <van-tab title="待处理" name="pending" />
        </van-tabs>
      </div>
      <van-list v-model:loading="loading" :finished="finished" @load="onLoad">
        <div
          v-for="todo in currentTasks"
          :key="todo.id"
          class="mb-3 flex items-center justify-between rounded-lg border border-gray-100 p-3">
          <div class="flex items-center">
            <van-tag :type="todo.priority === 'high' ? 'danger' : 'primary'" class="mr-2">
              {{ todo.priority === 'high' ? '紧急' : '普通' }}
            </van-tag>
            <span>{{ todo.title }}</span>
          </div>
          <span class="text-sm text-gray-500">{{ todo.time }}</span>
        </div>
      </van-list>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useWardStore } from "~/stores/wardStore";
import { usePatientStore } from "~/stores/patientStore";
import { useOrderStore } from "~/stores/orderStore";

const router = useRouter();
const wardStore = useWardStore();
const patientStore = usePatientStore();
const orderStore = useOrderStore();

// 快捷操作配置
const quickActions = [
  {
    name: "入院登记",
    path: "/patients/admission",
    icon: "plus",
    bgGradient: "linear-gradient(135deg,#DBEAFE,#BFDBFE)",
    iconColor: "#1d4ed8"
  },
  {
    name: "病房查看",
    path: "/ward/overview",
    icon: "hotel-o",
    bgGradient: "linear-gradient(135deg,#DCFCE7,#BBF7D0)",
    iconColor: "#16a34a"
  },
  {
    name: "医嘱管理",
    path: "/orders",
    icon: "records",
    bgGradient: "linear-gradient(135deg,#FFEDD5,#FED7AA)",
    iconColor: "#ea580c"
  },
  {
    name: "数据统计",
    path: "/statistics",
    icon: "chart-trending-o",
    bgGradient: "linear-gradient(135deg,#EDE9FE,#DDD6FE)",
    iconColor: "#6d28d9"
  }
];

// 统计数据 - 使用响应式数据
const statistics = ref([
  {
    title: "在院患者",
    value: "0",
    trend: -5,
    progress: 0,
    barColor: "bg-blue-500"
  },
  {
    title: "今日入院",
    value: "0",
    trend: 8,
    progress: 0,
    barColor: "bg-emerald-500"
  },
  {
    title: "待处理医嘱",
    value: "0",
    trend: 15,
    progress: 0,
    barColor: "bg-amber-500"
  },
  {
    title: "病床使用率",
    value: "0%",
    trend: -2,
    progress: 0,
    barColor: "bg-violet-500"
  }
]);

// 更新统计数据的函数
const updateStatistics = () => {
  console.log('开始更新统计数据...');
  console.log('患者store状态:', {
    patients: patientStore.patients.length,
    inPatientsCount: patientStore.inPatientsCount,
    todayAdmissionsCount: patientStore.todayAdmissionsCount,
    todayDischargesCount: patientStore.todayDischarges.length,
    patientStats: patientStore.patientStats
  });
  
  const patientStats = patientStore.patientStats;
  const wardStats = wardStore.wardStats;
  const orders = orderStore.orders;
  
  // 统一使用 patientStore 的计算逻辑
  const inPatientsCount = patientStore.inPatientsCount;
  const todayAdmissionsCount = patientStore.todayAdmissionsCount;
  const todayDischargesCount = patientStore.todayDischarges.length;
  
  // 计算病床使用率
  let bedOccupancyRate = 0;
  if (wardStats && wardStats.length > 0) {
    const totalBeds = wardStats.reduce((sum, ward) => sum + (ward.totalBeds || 0), 0);
    const occupiedBeds = wardStats.reduce((sum, ward) => sum + (ward.occupiedBeds || 0), 0);
    bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  }
  
  console.log('计算出的统计数据:', {
    inPatientsCount,
    todayAdmissionsCount,
    todayDischargesCount,
    bedOccupancyRate
  });
  
  // 更新统计数据
  statistics.value[0] = {
    title: "在院患者",
    value: inPatientsCount.toString(),
    trend: -5,
    progress: patientStats.admissionRate,
    barColor: "bg-blue-500"
  };
  
  statistics.value[1] = {
    title: "今日入院",
    value: todayAdmissionsCount.toString(),
    trend: 8,
    progress: Math.min(100, (todayAdmissionsCount / 20) * 100),
    barColor: "bg-emerald-500"
  };
  
  statistics.value[2] = {
    title: "待处理医嘱",
    value: orders.filter(order => order.status === 'PENDING').length.toString(),
    trend: 15,
    progress: Math.min(100, (orders.filter(order => order.status === 'PENDING').length / 50) * 100),
    barColor: "bg-amber-500"
  };
  
  statistics.value[3] = {
    title: "病床使用率",
    value: bedOccupancyRate + "%",
    trend: -2,
    progress: bedOccupancyRate,
    barColor: "bg-violet-500"
  };
  
  console.log('统计数据已更新:', statistics.value);
};

// 图表配置
const activeSeries = ref("all");
const chartLoading = ref(false);

// 监听图表标签切换
watch(activeSeries, () => {
  generateChartData();
});

const chartData = ref({
  dates: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
  admissions: [12, 15, 10, 18, 14, 9, 12],
  discharges: [8, 12, 11, 14, 16, 10, 9]
});

const chartOption = computed(() => {
  const series = [];
  
  if (activeSeries.value === "all" || activeSeries.value === "admit") {
    series.push({
      name: "入院人数",
      type: "line",
      smooth: true,
      areaStyle: { opacity: 0.15 },
      lineStyle: { width: 3, color: "#3b82f6" },
      symbol: "circle",
      symbolSize: 6,
      data: chartData.value.admissions
    });
  }
  
  if (activeSeries.value === "all" || activeSeries.value === "discharge") {
    series.push({
      name: "出院人数",
      type: "line",
      smooth: true,
      areaStyle: { opacity: 0.12 },
      lineStyle: { width: 3, color: "#10b981" },
      symbol: "circle",
      symbolSize: 6,
      data: chartData.value.discharges
    });
  }
  
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross"
      }
    },
    legend: {
      data: series.map(s => s.name)
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: chartData.value.dates
    },
    yAxis: {
      type: "value"
    },
    series
  };
});

// 待办事项相关
const activeTaskTab = ref("today");
const loading = ref(false);
const finished = ref(false);
const tasks: Record<string, any[]> = {
  today: [
    { id: 1, title: "张三的术前检查", time: "10:30", priority: "high" },
    { id: 2, title: "李四的出院评估", time: "14:00", priority: "normal" },
    { id: 3, title: "查房记录整理", time: "16:00", priority: "normal" }
  ],
  pending: [
    { id: 4, title: "王五的康复计划制定", time: "明天 09:00", priority: "high" },
    { id: 5, title: "赵六的复查预约", time: "明天 11:00", priority: "normal" },
    { id: 6, title: "孙八待出院", time: "明天 10:00", priority: "normal" }
  ]
};

const currentTasks = computed(() => tasks[activeTaskTab.value]);

const onLoad = () => {
  setTimeout(() => {
    loading.value = false;
    finished.value = true;
  }, 1000);
};

// 加载数据
const loadData = async () => {
  try {
    chartLoading.value = true;
    
    // 并行加载所有数据
    await Promise.all([
      wardStore.fetchWards(),
      patientStore.loadAllPatients(), // 加载全部患者数据用于统计
      orderStore.fetchAllOrders()
    ]);
    
    // 确保数据加载完成后打印调试信息
    console.log('数据加载完成:');
    console.log('在院患者数量:', patientStore.inPatientsCount);
    console.log('今日入院数量:', patientStore.todayAdmissionsCount);
    console.log('今日出院数量:', patientStore.todayDischarges.length);
    console.log('总患者数:', patientStore.patientStats.total);
    console.log('病区统计:', wardStore.wardStats);
    
    // 更新统计数据
    updateStatistics();
    
    // 生成图表数据
    await generateChartData();
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    chartLoading.value = false;
  }
};

// 生成图表数据
const generateChartData = async () => {
  try {
    const trends = await patientStore.getPatientTrends(7);
    console.log('患者趋势数据:', trends);
    
    if (trends && trends.length > 0) {
      // 使用真实数据，不添加随机变化
      const admissions = trends.map(t => t.admissions);
      const discharges = trends.map(t => t.discharges);
      
      chartData.value = {
        dates: trends.map(t => t.date),
        admissions,
        discharges
      };
    } else {
      // 如果没有真实数据，生成基于当前数据的模拟数据
      const dates = [];
      const admissions = [];
      const discharges = [];
      
      // 基于当前患者数据生成合理的趋势
      const currentInPatients = patientStore.inPatientsCount;
      const currentAdmissions = patientStore.todayAdmissionsCount;
      const currentDischarges = patientStore.todayDischarges.length;
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
        
        // 基于当前数据生成合理的趋势
        const baseAdmissions = Math.max(1, Math.floor(currentAdmissions * (0.8 + Math.random() * 0.4)));
        const baseDischarges = Math.max(1, Math.floor(currentDischarges * (0.8 + Math.random() * 0.4)));
        
        admissions.push(baseAdmissions);
        discharges.push(baseDischarges);
      }
      
      chartData.value = { dates, admissions, discharges };
    }
    
    console.log('最终图表数据:', chartData.value);
  } catch (error) {
    console.error('生成图表数据失败:', error);
    // 生成基于当前数据的默认数据
    const dates = [];
    const admissions = [];
    const discharges = [];
    
    const currentInPatients = patientStore.inPatientsCount;
    const currentAdmissions = patientStore.todayAdmissionsCount;
    const currentDischarges = patientStore.todayDischarges.length;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
      
      // 基于当前数据生成合理的趋势
      const baseAdmissions = Math.max(1, Math.floor(currentAdmissions * (0.8 + Math.random() * 0.4)));
      const baseDischarges = Math.max(1, Math.floor(currentDischarges * (0.8 + Math.random() * 0.4)));
      
      admissions.push(baseAdmissions);
      discharges.push(baseDischarges);
    }
    
    chartData.value = { dates, admissions, discharges };
  }
};

// 页面元数据
definePageMeta({
  layout: "admin",
  title: "仪表板",
  requiresAuth: true,
  permissions: ["VIEW_DASHBOARD"]
});

// 日期字符串
const todayString = new Date().toLocaleDateString(undefined, {
  year: 'numeric', month: '2-digit', day: '2-digit'
});

// 监听store数据变化，自动更新统计数据
watch(
  () => [patientStore.patients, wardStore.wardStats, orderStore.orders],
  () => {
    if (patientStore.patients.length > 0 || wardStore.wardStats.length > 0) {
      updateStatistics();
    }
  },
  { deep: true }
);

// 页面加载时获取数据
onMounted(async () => {
  console.log('页面挂载，开始加载数据...');
  await loadData();
  
  // 延迟一秒后再次更新统计数据，确保数据完全加载
  setTimeout(() => {
    console.log('延迟更新统计数据...');
    updateStatistics();
  }, 1000);
});
</script>

<style scoped>
.glass {
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(30, 41, 59, 0.06);
}
</style>
