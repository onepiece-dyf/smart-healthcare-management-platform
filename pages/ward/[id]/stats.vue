<template>
  <div class="ward-stats">
    <HeroHeader
      :title="`${ward?.name || '科室'} - 统计报表`"
      subtitle="科室运营数据分析"
      :showDate="true" />

    <!-- 关键指标 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="mb-4">
          <h3 class="text-lg font-semibold">关键指标</h3>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-lg bg-blue-50 p-4">
            <div class="text-2xl font-bold text-blue-600">{{ ward?.totalBeds || 0 }}</div>
            <div class="text-sm text-blue-600">总床位数</div>
          </div>
          <div class="rounded-lg bg-red-50 p-4">
            <div class="text-2xl font-bold text-red-600">{{ ward?.occupiedBeds || 0 }}</div>
            <div class="text-sm text-red-600">已占用</div>
          </div>
          <div class="rounded-lg bg-green-50 p-4">
            <div class="text-2xl font-bold text-green-600">{{ ward?.availableBeds || 0 }}</div>
            <div class="text-sm text-green-600">可用床位</div>
          </div>
          <div class="rounded-lg bg-purple-50 p-4">
            <div class="text-2xl font-bold text-purple-600">{{ ward?.occupancyRate || 0 }}%</div>
            <div class="text-sm text-purple-600">使用率</div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 患者统计 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="mb-4">
          <h3 class="text-lg font-semibold">患者统计</h3>
        </div>
        
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ patientStats.total }}</div>
            <div class="text-sm text-gray-500">总患者数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ patientStats.admitted }}</div>
            <div class="text-sm text-gray-500">在院患者</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ patientStats.discharged }}</div>
            <div class="text-sm text-gray-500">已出院</div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 床位使用率趋势 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="mb-4">
          <h3 class="text-lg font-semibold">床位使用率趋势</h3>
        </div>
        
        <div v-if="loading" class="flex h-64 w-full items-center justify-center">
          <van-loading type="spinner" size="24px">加载中...</van-loading>
        </div>
        <v-chart v-else class="h-64 w-full" :option="occupancyChartOption" autoresize />
      </SectionCard>
    </div>

    <!-- 患者年龄分布 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="mb-4">
          <h3 class="text-lg font-semibold">患者年龄分布</h3>
        </div>
        
        <div v-if="loading" class="flex h-64 w-full items-center justify-center">
          <van-loading type="spinner" size="24px">加载中...</van-loading>
        </div>
        <v-chart v-else class="h-64 w-full" :option="ageChartOption" autoresize />
      </SectionCard>
    </div>

    <!-- 疾病诊断统计 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="mb-4">
          <h3 class="text-lg font-semibold">疾病诊断统计</h3>
        </div>
        
        <div class="space-y-2">
          <div v-for="(diagnosis, index) in topDiagnoses" :key="index" 
               class="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <div class="flex items-center space-x-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <span class="text-sm font-bold text-blue-600">{{ index + 1 }}</span>
              </div>
              <div>
                <div class="font-medium">{{ diagnosis.name }}</div>
                <div class="text-sm text-gray-500">{{ diagnosis.count }} 例</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium">{{ diagnosis.percentage }}%</div>
              <div class="mt-1 h-2 w-20 overflow-hidden rounded-full bg-gray-200">
                <div class="h-full bg-blue-500" :style="{ width: diagnosis.percentage + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 医护人员统计 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="mb-4">
          <h3 class="text-lg font-semibold">医护人员统计</h3>
        </div>
        
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ ward?.totalStaff || 0 }}</div>
            <div class="text-sm text-gray-500">总人数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ ward?.doctorCount || 0 }}</div>
            <div class="text-sm text-gray-500">医生</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ ward?.nurseCount || 0 }}</div>
            <div class="text-sm text-gray-500">护士</div>
          </div>
        </div>
      </SectionCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWardStore } from '~/stores/wardStore';

const route = useRoute();
const router = useRouter();
const wardStore = useWardStore();

const ward = ref<any>(null);
const patients = ref<any[]>([]);
const loading = ref(false);

// 计算属性
const patientStats = computed(() => {
  const total = patients.value.length;
  const admitted = patients.value.filter(p => p.status === 'ADMITTED').length;
  const discharged = patients.value.filter(p => p.status === 'DISCHARGED').length;
  return { total, admitted, discharged };
});

const topDiagnoses = computed(() => {
  const diagnosisCount: { [key: string]: number } = {};
  patients.value.forEach(patient => {
    if (patient.diagnosis) {
      diagnosisCount[patient.diagnosis] = (diagnosisCount[patient.diagnosis] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(diagnosisCount)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / patients.value.length) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return sorted;
});

// 图表配置
const occupancyChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value',
    max: 100,
    axisLabel: {
      formatter: '{value}%'
    }
  },
  series: [{
    name: '使用率',
    type: 'line',
    smooth: true,
    data: [75, 80, 78, 85, 82, 77, 79],
    areaStyle: {
      opacity: 0.3
    }
  }]
}));

const ageChartOption = computed(() => {
  const ageGroups = [
    { name: '0-18岁', count: 0 },
    { name: '19-35岁', count: 0 },
    { name: '36-50岁', count: 0 },
    { name: '51-65岁', count: 0 },
    { name: '65岁以上', count: 0 }
  ];
  
  patients.value.forEach(patient => {
    const age = patient.age;
    if (age <= 18) ageGroups[0].count++;
    else if (age <= 35) ageGroups[1].count++;
    else if (age <= 50) ageGroups[2].count++;
    else if (age <= 65) ageGroups[3].count++;
    else ageGroups[4].count++;
  });
  
  return {
    tooltip: {
      trigger: 'item'
    },
    series: [{
      name: '年龄分布',
      type: 'pie',
      radius: '60%',
      data: ageGroups.map(group => ({
        name: group.name,
        value: group.count
      }))
    }]
  };
});

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    const wardId = parseInt(route.params.id as string);
    
    // 获取病区信息
    await wardStore.fetchWards();
    const wardStats = wardStore.wardStats;
    ward.value = wardStats.find(w => w.id === wardId);
    
    if (!ward.value) {
      console.error('科室不存在');
      router.push('/ward');
      return;
    }
    
    // 获取患者数据
    await wardStore.fetchPatients();
    await wardStore.fetchBeds();
    
    // 筛选该科室的患者
    const allPatients = wardStore.patients;
    const allBeds = wardStore.beds;
    const wardRooms = wardStore.rooms.filter(room => room.wardId === wardId);
    const wardRoomIds = wardRooms.map(room => room.id);
    const wardBedIds = allBeds.filter(bed => wardRoomIds.includes(bed.roomId)).map(bed => bed.id);
    
    patients.value = allPatients.filter(patient => 
      wardBedIds.includes(patient.bedId) || 
      (patient.dischargeDate && wardBedIds.includes(patient.bedId))
    );
    
  } catch (error) {
    console.error('加载统计数据失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

definePageMeta({
  layout: "admin",
  title: "科室统计",
  requiresAuth: true
});
</script>

<style scoped>
.ward-stats {
  min-height: 100vh;
  background-color: #f8fafc;
}
</style>
