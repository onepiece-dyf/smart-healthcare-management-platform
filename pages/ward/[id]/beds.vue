<template>
  <div class="bed-management">
    <HeroHeader
      :title="`${ward?.name || '科室'} - 床位管理`"
      subtitle="床位状态管理与分配"
      :showDate="true" />

    <!-- 床位统计 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold">床位统计</h3>
          <van-button size="small" icon="refresh" @click="refreshData">刷新</van-button>
        </div>
        
        <div class="grid grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ totalBeds }}</div>
            <div class="text-sm text-gray-500">总床位</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">{{ occupiedBeds }}</div>
            <div class="text-sm text-gray-500">已占用</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ availableBeds }}</div>
            <div class="text-sm text-gray-500">可用</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ occupancyRate }}%</div>
            <div class="text-sm text-gray-500">使用率</div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 床位列表 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold">床位列表</h3>
          <div class="flex gap-2">
            <van-button size="small" @click="filterStatus = 'all'">全部</van-button>
            <van-button size="small" @click="filterStatus = 'occupied'">已占用</van-button>
            <van-button size="small" @click="filterStatus = 'available'">可用</van-button>
          </div>
        </div>
        
        <van-list v-model:loading="loading" :finished="finished" @load="loadBeds">
          <div v-for="bed in filteredBeds" :key="bed.id" class="mb-3 rounded-lg border border-gray-100 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full"
                     :class="bed.status === 'OCCUPIED' ? 'bg-red-100' : 'bg-green-100'">
                  <van-icon :name="bed.status === 'OCCUPIED' ? 'user-o' : 'check-circle-o'" 
                           :color="bed.status === 'OCCUPIED' ? '#ef4444' : '#10b981'" />
                </div>
                <div>
                  <div class="font-semibold">{{ bed.name }}</div>
                  <div class="text-sm text-gray-500">{{ bed.code }}</div>
                </div>
              </div>
              
              <div class="text-right">
                <van-tag :type="hasPatient(bed) ? 'danger' : 'success'">
                  {{ hasPatient(bed) ? '已占用' : '可用' }}
                </van-tag>
                <div class="mt-1 text-sm text-gray-500">
                  {{ bed.type === 'INTENSIVE' ? '重症' : '普通' }}
                </div>
              </div>
            </div>
            
            <!-- 患者信息（如果床位被占用） -->
            <div v-if="hasPatient(bed) && bed.patient" class="mt-3 rounded-lg bg-gray-50 p-3">
              <div class="text-sm font-medium text-gray-700">患者信息</div>
              <div class="mt-1 grid grid-cols-2 gap-2 text-sm">
                <div>姓名：{{ bed.patient.name }}</div>
                <div>年龄：{{ bed.patient.age }}岁</div>
                <div>性别：{{ bed.patient.gender === 'MALE' ? '男' : '女' }}</div>
                <div>诊断：{{ bed.patient.diagnosis }}</div>
              </div>
              <div class="mt-2 text-xs text-gray-500">
                入院时间：{{ formatDate(bed.patient.admissionDate) }}
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div v-if="!hasPatient(bed)" class="mt-3 flex gap-2">
              <van-button size="small" type="primary" @click="assignPatient(bed)">
                分配患者
              </van-button>
            </div>
            <div v-else class="mt-3 flex gap-2">
              <van-button 
                v-if="bed.patient && bed.patient.id" 
                size="small" 
                type="default" 
                @click="viewPatient(bed.patient)">
                查看患者
              </van-button>
              <van-button size="small" type="default" @click="dischargePatient(bed)">
                办理出院
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
import { useRoute, useRouter } from 'vue-router';
import { useWardStore } from '~/stores/wardStore';

const route = useRoute();
const router = useRouter();
const wardStore = useWardStore();

const ward = ref<any>(null);
const beds = ref<any[]>([]);
const patients = ref<any[]>([]);
const loading = ref(false);
const finished = ref(false);
const filterStatus = ref('all');

// 计算属性
const totalBeds = computed(() => beds.value.length);
const occupiedBeds = computed(() => {
  return beds.value.filter(bed => {
    const patient = wardStore.patients.find(patient => 
      patient.bedId === bed.id && patient.status === 'ADMITTED'
    );
    return !!patient;
  }).length;
});
const availableBeds = computed(() => totalBeds.value - occupiedBeds.value);
const occupancyRate = computed(() => {
  if (totalBeds.value === 0) return 0;
  return Math.round((occupiedBeds.value / totalBeds.value) * 100);
});

const filteredBeds = computed(() => {
  if (filterStatus.value === 'all') return beds.value;
  if (filterStatus.value === 'occupied') {
    return beds.value.filter(bed => {
      const patient = wardStore.patients.find(patient => 
        patient.bedId === bed.id && patient.status === 'ADMITTED'
      );
      return !!patient;
    });
  }
  if (filterStatus.value === 'available') {
    return beds.value.filter(bed => {
      const patient = wardStore.patients.find(patient => 
        patient.bedId === bed.id && patient.status === 'ADMITTED'
      );
      return !patient;
    });
  }
  return beds.value;
});

// 加载数据
const loadBeds = async () => {
  if (loading.value) return;
  
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
    
    // 获取床位和患者数据
    await wardStore.fetchBeds();
    await wardStore.fetchPatients();
    
    // 筛选该科室的床位
    const allBeds = wardStore.beds;
    const allPatients = wardStore.patients;
    
    // 获取该科室的房间
    const wardRooms = wardStore.rooms.filter(room => room.wardId === wardId);
    const wardRoomIds = wardRooms.map(room => room.id);
    
    // 筛选该科室的床位
    beds.value = allBeds.filter(bed => wardRoomIds.includes(bed.roomId));
    
    // 为每个床位添加患者信息
    beds.value.forEach(bed => {
      // 查找占用该床位的患者（状态为ADMITTED且bedId匹配）
      const patient = allPatients.find(patient => 
        patient.bedId === bed.id && patient.status === 'ADMITTED'
      );
      
      if (patient) {
        bed.patient = patient;
        bed.status = 'OCCUPIED';
      } else {
        bed.status = 'AVAILABLE';
        bed.patient = null;
      }
    });
    
    finished.value = true;
    
    // 调试日志
    console.log('床位数据加载完成:', {
      totalBeds: beds.value.length,
      occupiedBeds: beds.value.filter(bed => bed.status === 'OCCUPIED').length,
      availableBeds: beds.value.filter(bed => bed.status === 'AVAILABLE').length,
      beds: beds.value.map(bed => ({
        id: bed.id,
        status: bed.status,
        hasPatient: !!bed.patient
      }))
    });
  } catch (error) {
    console.error('加载床位数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const refreshData = async () => {
  finished.value = false;
  beds.value = [];
  await loadBeds();
};

// 工具函数
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

// 管理功能
const assignPatient = (bed: any) => {
  router.push(`/patients/admission?bedId=${bed.id}`);
};

const viewPatient = (patient: any) => {
  if (!patient || !patient.id) {
    console.warn('患者信息不存在或无效');
    return;
  }
  router.push(`/patients/${patient.id}`);
};

const dischargePatient = (bed: any) => {
  // 这里可以添加出院逻辑
  console.log('办理出院:', bed);
};

// 检查床位是否有患者
const hasPatient = (bed: any) => {
  const patient = wardStore.patients.find(patient => 
    patient.bedId === bed.id && patient.status === 'ADMITTED'
  );
  return !!patient;
};

onMounted(() => {
  loadBeds();
});

definePageMeta({
  layout: "admin",
  title: "床位管理",
  requiresAuth: true
});
</script>

<style scoped>
.bed-management {
  min-height: 100vh;
  background-color: #f8fafc;
}
</style>
