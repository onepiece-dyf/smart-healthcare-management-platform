<template>
  <div class="ward-overview">
    <HeroHeader
      title="病房概览"
      subtitle="实时病房状态与床位管理"
      :showDate="true" />

    <!-- 统计概览 -->
    <div class="grid grid-cols-2 gap-3 p-4">
      <div class="glass rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="mb-1 text-xs text-gray-500">总病床数</div>
            <div class="text-2xl font-bold text-blue-600">{{ totalBeds }}</div>
          </div>
          <van-icon name="hotel-o" size="24" color="#3b82f6" />
        </div>
        <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div class="h-full rounded-full bg-blue-500" :style="{ width: '100%' }" />
        </div>
      </div>

      <div class="glass rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="mb-1 text-xs text-gray-500">已占用</div>
            <div class="text-2xl font-bold text-red-600">{{ occupiedBeds }}</div>
          </div>
          <van-icon name="user-o" size="24" color="#ef4444" />
        </div>
        <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div class="h-full rounded-full bg-red-500" :style="{ width: occupancyRate + '%' }" />
        </div>
      </div>

      <div class="glass rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="mb-1 text-xs text-gray-500">可用床位</div>
            <div class="text-2xl font-bold text-green-600">{{ availableBeds }}</div>
          </div>
          <van-icon name="check-circle-o" size="24" color="#10b981" />
        </div>
        <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div class="h-full rounded-full bg-green-500" :style="{ width: (100 - occupancyRate) + '%' }" />
        </div>
      </div>

      <div class="glass rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="mb-1 text-xs text-gray-500">使用率</div>
            <div class="text-2xl font-bold text-purple-600">{{ occupancyRate }}%</div>
          </div>
          <van-icon name="chart-trending-o" size="24" color="#8b5cf6" />
        </div>
        <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div class="h-full rounded-full bg-purple-500" :style="{ width: occupancyRate + '%' }" />
        </div>
      </div>
    </div>

    <!-- 病区列表 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold">病区详情</h3>
          <van-button size="small" icon="refresh" @click="refreshData">刷新</van-button>
        </div>
        
        <van-list v-model:loading="loading" :finished="finished" @load="loadWards">
          <div v-for="ward in wards" :key="ward.id" class="mb-4 rounded-lg border border-gray-100 p-4">
            <div class="mb-3 flex items-center justify-between">
              <div>
                <h4 class="font-semibold text-gray-900">{{ ward.name }}</h4>
                <p class="text-sm text-gray-500">{{ ward.description }}</p>
              </div>
              <van-tag :type="ward.status === 'active' ? 'success' : 'default'">
                {{ ward.status === 'active' ? '正常' : '维护中' }}
              </van-tag>
            </div>
            
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-lg font-bold text-blue-600">{{ ward.totalBeds || 0 }}</div>
                <div class="text-xs text-gray-500">总床位</div>
              </div>
              <div>
                <div class="text-lg font-bold text-red-600">{{ ward.occupiedBeds || 0 }}</div>
                <div class="text-xs text-gray-500">已占用</div>
              </div>
              <div>
                <div class="text-lg font-bold text-green-600">{{ ward.availableBeds || 0 }}</div>
                <div class="text-xs text-gray-500">可用</div>
              </div>
            </div>
            
            <div class="mt-3">
              <div class="mb-1 flex justify-between text-xs text-gray-500">
                <span>使用率</span>
                <span>{{ ward.occupancyRate || 0 }}%</span>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div 
                  class="h-full rounded-full transition-all duration-300"
                  :class="getOccupancyColor((ward.occupancyRate || 0) / 100)"
                  :style="{ width: (ward.occupancyRate || 0) + '%' }" />
              </div>
            </div>
            
            <!-- 科室管理操作按钮 -->
            <div class="mt-4 flex gap-2">
              <van-button 
                size="small" 
                type="primary" 
                icon="eye-o"
                @click="viewWardDetails(ward)">
                查看详情
              </van-button>
              <van-button 
                size="small" 
                type="default" 
                icon="edit"
                @click="editWard(ward)">
                编辑
              </van-button>
              <van-button 
                size="small" 
                type="default" 
                icon="hotel-o"
                @click="manageBeds(ward)">
                床位管理
              </van-button>
              <van-button 
                size="small" 
                type="default" 
                icon="chart-trending-o"
                @click="viewWardStats(ward)">
                统计报表
              </van-button>
            </div>
          </div>
        </van-list>
      </SectionCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWardStore } from '~/stores/wardStore';

const router = useRouter();
const wardStore = useWardStore();

// 响应式数据
const loading = ref(false);
const finished = ref(false);
const wards = ref<any[]>([]);

// 计算属性
const totalBeds = computed(() => {
  return wards.value.reduce((sum, ward) => sum + (ward.totalBeds || 0), 0);
});

const occupiedBeds = computed(() => {
  return wards.value.reduce((sum, ward) => sum + (ward.occupiedBeds || 0), 0);
});

const availableBeds = computed(() => {
  return totalBeds.value - occupiedBeds.value;
});

const occupancyRate = computed(() => {
  if (totalBeds.value === 0) return 0;
  return Math.round((occupiedBeds.value / totalBeds.value) * 100);
});

// 方法
const loadWards = async () => {
  if (loading.value) return;
  
  try {
    loading.value = true;
    
    // 获取所有相关数据
    await wardStore.fetchWards();
    
    // 使用 wardStore 的 wardStats 计算属性
    const wardStats = wardStore.wardStats;
    wards.value = wardStats || [];
    
    finished.value = true;
  } catch (error) {
    console.error('加载病区数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const refreshData = async () => {
  finished.value = false;
  wards.value = [];
  await loadWards();
};

const getOccupancyColor = (rate: number) => {
  if (isNaN(rate) || rate < 0) return 'bg-gray-500';
  if (rate >= 0.9) return 'bg-red-500';
  if (rate >= 0.7) return 'bg-yellow-500';
  return 'bg-green-500';
};

// 科室管理功能
const viewWardDetails = (ward: any) => {
  router.push(`/ward/${ward.id}`);
};

const editWard = (ward: any) => {
  router.push(`/ward/${ward.id}/edit`);
};

const manageBeds = (ward: any) => {
  router.push(`/ward/${ward.id}/beds`);
};

const viewWardStats = (ward: any) => {
  router.push(`/ward/${ward.id}/stats`);
};

// 生命周期
onMounted(() => {
  loadWards();
});

definePageMeta({
  layout: "admin",
  title: "病房概览",
  requiresAuth: true
});
</script>

<style scoped>
.ward-overview {
  min-height: 100vh;
  background-color: #f8fafc;
}

.glass {
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(30, 41, 59, 0.06);
}
</style>
