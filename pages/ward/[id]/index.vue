<template>
  <div class="ward-detail">
    <HeroHeader
      :title="ward?.name || '科室详情'"
      :subtitle="ward?.description || '科室信息管理'"
      :showDate="true" />

    <!-- 科室基本信息 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="mb-4">
          <h3 class="text-lg font-semibold">基本信息</h3>
        </div>
        
        <div v-if="ward" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-500">科室名称</label>
              <div class="text-lg font-medium">{{ ward.name }}</div>
            </div>
            <div>
              <label class="text-sm text-gray-500">科室代码</label>
              <div class="text-lg font-medium">{{ ward.code }}</div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-500">所属部门</label>
              <div class="text-lg font-medium">{{ ward.department }}</div>
            </div>
            <div>
              <label class="text-sm text-gray-500">楼层</label>
              <div class="text-lg font-medium">{{ ward.floor }}楼</div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-500">所在建筑</label>
              <div class="text-lg font-medium">{{ ward.building }}</div>
            </div>
            <div>
              <label class="text-sm text-gray-500">状态</label>
              <van-tag :type="ward.status === 'ACTIVE' ? 'success' : 'default'">
                {{ ward.status === 'ACTIVE' ? '正常' : '维护中' }}
              </van-tag>
            </div>
          </div>
          
          <div>
            <label class="text-sm text-gray-500">科室描述</label>
            <div class="text-lg font-medium">{{ ward.description }}</div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 床位统计 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="mb-4">
          <h3 class="text-lg font-semibold">床位统计</h3>
        </div>
        
        <div v-if="ward" class="grid grid-cols-2 gap-4">
          <div class="rounded-lg bg-blue-50 p-4">
            <div class="text-2xl font-bold text-blue-600">{{ ward.totalBeds || 0 }}</div>
            <div class="text-sm text-blue-600">总床位数</div>
          </div>
          <div class="rounded-lg bg-red-50 p-4">
            <div class="text-2xl font-bold text-red-600">{{ ward.occupiedBeds || 0 }}</div>
            <div class="text-sm text-red-600">已占用</div>
          </div>
          <div class="rounded-lg bg-green-50 p-4">
            <div class="text-2xl font-bold text-green-600">{{ ward.availableBeds || 0 }}</div>
            <div class="text-sm text-green-600">可用床位</div>
          </div>
          <div class="rounded-lg bg-purple-50 p-4">
            <div class="text-2xl font-bold text-purple-600">{{ ward.occupancyRate || 0 }}%</div>
            <div class="text-sm text-purple-600">使用率</div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 医护人员统计 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="mb-4">
          <h3 class="text-lg font-semibold">医护人员</h3>
        </div>
        
        <div v-if="ward" class="grid grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ actualStaffStats.total }}</div>
            <div class="text-sm text-gray-500">总人数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ actualStaffStats.doctors }}</div>
            <div class="text-sm text-gray-500">医生</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ actualStaffStats.nurses }}</div>
            <div class="text-sm text-gray-500">护士</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ actualStaffStats.managers }}</div>
            <div class="text-sm text-gray-500">管理员</div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 操作按钮 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="mb-4">
          <h3 class="text-lg font-semibold">管理操作</h3>
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <van-button 
            type="primary" 
            icon="hotel-o"
            @click="manageBeds">
            床位管理
          </van-button>
          <van-button 
            type="default" 
            icon="edit"
            @click="editWard">
            编辑科室
          </van-button>
          <van-button 
            type="default" 
            icon="chart-trending-o"
            @click="viewStats">
            统计报表
          </van-button>
          <van-button 
            type="default" 
            icon="user-o"
            @click="manageStaff">
            人员管理
          </van-button>
        </div>
      </SectionCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWardStore } from '~/stores/wardStore';
import { useStaffStore, WardStaffRole } from '~/stores/staffStore';

const route = useRoute();
const router = useRouter();
const wardStore = useWardStore();
const staffStore = useStaffStore();

const ward = ref<any>(null);
const loading = ref(false);

// 实际人员统计
const actualStaffStats = computed(() => {
  const wardId = parseInt(route.params.id as string);
  const wardStaff = staffStore.getWardStaff(wardId);
  
  return {
    total: wardStaff.length,
    doctors: wardStaff.filter(s => s.role === WardStaffRole.DOCTOR).length,
    nurses: wardStaff.filter(s => s.role === WardStaffRole.NURSE).length,
    managers: wardStaff.filter(s => s.role === WardStaffRole.MANAGER).length
  };
});

// 加载科室详情
const loadWardDetail = async () => {
  try {
    loading.value = true;
    const wardId = parseInt(route.params.id as string);
    
    // 获取所有病区数据
    await wardStore.fetchWards();
    
    // 获取人员数据
    await staffStore.fetchStaff();
    await staffStore.fetchUsers();
    await staffStore.fetchWardStaff(wardId);
    
    // 从 wardStats 中找到对应的病区
    const wardStats = wardStore.wardStats;
    ward.value = wardStats.find(w => w.id === wardId);
    
    if (!ward.value) {
      console.error('科室不存在');
      router.push('/ward');
    }
  } catch (error) {
    console.error('加载科室详情失败:', error);
  } finally {
    loading.value = false;
  }
};

// 管理功能
const manageBeds = () => {
  router.push(`/ward/${route.params.id}/beds`);
};

const editWard = () => {
  router.push(`/ward/${route.params.id}/edit`);
};

const viewStats = () => {
  router.push(`/ward/${route.params.id}/stats`);
};

const manageStaff = () => {
  router.push(`/ward/${route.params.id}/staff`);
};

onMounted(() => {
  loadWardDetail();
});

definePageMeta({
  layout: "admin",
  title: "科室详情",
  requiresAuth: true
});
</script>

<style scoped>
.ward-detail {
  min-height: 100vh;
  background-color: #f8fafc;
}
</style>
