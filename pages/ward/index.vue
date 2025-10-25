<template>
  <div class="ward-management">
    <!-- 顶部 Hero -->
    <HeroHeader
      title="病区管理"
      subtitle="病区信息管理与配置"
      :showDate="true">
      <template #actions>
        <div class="col-span-4 flex justify-end gap-2">
          <van-button 
            size="small" 
            type="primary" 
            icon="plus"
            @click="showAddWard = true">
            新增病区
          </van-button>
          <van-button 
            size="small" 
            icon="refresh" 
            @click="refreshData">
            刷新
          </van-button>
        </div>
      </template>
    </HeroHeader>

    <!-- 统计概览 -->
    <div class="grid grid-cols-2 gap-3 p-4">
      <SectionCard v-for="stat in overviewStats" :key="stat.title">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-600">{{ stat.title }}</span>
          <van-icon :name="stat.icon" class="bg-primary/10 text-primary rounded-full p-1.5" size="18" />
        </div>
        <div class="mt-3">
          <div class="flex items-baseline">
            <span class="text-2xl font-bold text-gray-900">{{ stat.value }}</span>
            <span class="ml-1 text-sm text-gray-500">{{ stat.unit }}</span>
          </div>
          <div class="mt-2 text-xs text-gray-500">{{ stat.subtext }}</div>
        </div>
      </SectionCard>
    </div>

    <!-- 病区列表 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold">病区列表</h3>
          <van-button size="small" icon="search" @click="showSearch = true">搜索</van-button>
        </div>
        
        <!-- 搜索栏 -->
        <van-search
          v-if="showSearch"
          v-model="searchKeyword"
          placeholder="搜索病区名称、科室、描述..."
          @search="onSearch"
          @cancel="onSearchCancel"
          show-action
          class="mb-4" />
        
        <van-list v-model:loading="loading" :finished="finished" @load="loadWards">
          <!-- 空状态 -->
          <div v-if="!loading && filteredWards.length === 0" class="py-8 text-center">
            <van-icon name="hotel-o" size="48" color="#ccc" />
            <p class="mt-2 text-gray-500">
              {{ searchKeyword ? '未找到匹配的病区' : '暂无病区数据' }}
            </p>
            <van-button 
              v-if="!searchKeyword" 
              size="small" 
              type="primary" 
              @click="showAddWard = true"
              class="mt-2">
              新增病区
            </van-button>
          </div>
          
          <div v-for="ward in filteredWards" :key="ward.id" class="mb-4 rounded-lg border border-gray-100 p-4">
            <div class="mb-3 flex items-center justify-between">
              <div>
                <h4 class="font-semibold text-gray-900">{{ ward.name }}</h4>
                <p class="text-sm text-gray-500">{{ ward.department }} - {{ ward.description }}</p>
              </div>
              <van-tag :type="ward.status === 'active' ? 'success' : 'default'">
                {{ ward.status === 'active' ? '正常' : '维护中' }}
              </van-tag>
            </div>
            
            <div class="grid grid-cols-4 gap-4 text-center">
              <div>
                <div class="text-lg font-bold text-blue-600">{{ ward.totalRooms || 0 }}</div>
                <div class="text-xs text-gray-500">房间数</div>
              </div>
              <div>
                <div class="text-lg font-bold text-green-600">{{ ward.totalBeds || 0 }}</div>
                <div class="text-xs text-gray-500">总床位</div>
              </div>
              <div>
                <div class="text-lg font-bold text-red-600">{{ ward.occupiedBeds || 0 }}</div>
                <div class="text-xs text-gray-500">已占用</div>
              </div>
              <div>
                <div class="text-lg font-bold text-purple-600">{{ ward.occupancyRate || 0 }}%</div>
                <div class="text-xs text-gray-500">使用率</div>
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
            
            <!-- 管理操作按钮 -->
            <div class="mt-4 flex flex-wrap gap-2">
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
              <van-button 
                size="small" 
                type="danger" 
                icon="delete-o"
                @click="deleteWard(ward)">
                删除
              </van-button>
            </div>
          </div>
        </van-list>
      </SectionCard>
    </div>

    <!-- 新增病区弹窗 -->
    <van-popup v-model:show="showAddWard" position="bottom" :style="{ height: '80%' }">
      <div class="p-4">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold">新增病区</h3>
          <van-icon name="cross" @click="showAddWard = false" />
        </div>
        <van-form @submit="onSubmit">
          <van-field
            v-model="newWard.name"
            name="name"
            label="病区名称"
            placeholder="请输入病区名称"
            :rules="[{ required: true, message: '请输入病区名称' }]" />
          <van-field
            v-model="newWard.code"
            name="code"
            label="病区代码"
            placeholder="请输入病区代码"
            :rules="[{ required: true, message: '请输入病区代码' }]" />
          <van-field
            v-model="newWard.department"
            name="department"
            label="所属科室"
            placeholder="请输入所属科室"
            :rules="[{ required: true, message: '请输入所属科室' }]" />
          <van-field
            v-model="newWard.description"
            name="description"
            label="病区描述"
            type="textarea"
            placeholder="请输入病区描述" />
          <van-field
            v-model="newWard.floor"
            name="floor"
            label="楼层"
            type="number"
            placeholder="请输入楼层" />
          <van-field
            v-model="newWard.building"
            name="building"
            label="楼栋"
            placeholder="请输入楼栋" />
          <div class="mt-4 flex gap-2">
            <van-button block type="primary" native-type="submit">保存</van-button>
            <van-button block @click="showAddWard = false">取消</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { showToast, showDialog, showConfirmDialog } from "vant";
import { useWardStore } from "~/stores/wardStore";
import type { Ward } from "~/types/models/ward";

const router = useRouter();
const wardStore = useWardStore();

// 响应式数据
const loading = ref(false);
const finished = ref(false);
const showAddWard = ref(false);
const showSearch = ref(false);
const searchKeyword = ref("");

// 新增病区表单数据
const newWard = ref({
  name: "",
  code: "",
  department: "",
  description: "",
  floor: "",
  building: ""
});

// 从 store 获取数据
const wardStats = computed(() => wardStore.wardStats);

// 搜索过滤后的病区列表
const filteredWards = computed(() => {
  if (!searchKeyword.value) return wardStats.value;
  
  const keyword = searchKeyword.value.toLowerCase();
  return wardStats.value.filter(ward => 
    ward.name.toLowerCase().includes(keyword) ||
    ward.department.toLowerCase().includes(keyword) ||
    ward.description.toLowerCase().includes(keyword) ||
    ward.code.toLowerCase().includes(keyword)
  );
});

// 概览统计数据
const overviewStats = computed(() => {
  const totalWards = wardStats.value.length;
  const totalBeds = wardStats.value.reduce((sum, ward) => sum + (ward.totalBeds || 0), 0);
  const occupiedBeds = wardStats.value.reduce((sum, ward) => sum + (ward.occupiedBeds || 0), 0);
  const totalRooms = wardStats.value.reduce((sum, ward) => sum + (ward.totalRooms || 0), 0);
  
  return [
    {
      title: "总病区数",
      value: totalWards,
      unit: "个",
      subtext: "活跃病区",
      icon: "hotel-o"
    },
    {
      title: "总床位数",
      value: totalBeds,
      unit: "张",
      subtext: `已占用: ${occupiedBeds}`,
      icon: "bars"
    },
    {
      title: "总房间数",
      value: totalRooms,
      unit: "间",
      subtext: "所有病区",
      icon: "wap-home"
    },
    {
      title: "平均使用率",
      value: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      unit: "%",
      subtext: "床位使用率",
      icon: "chart-trending-o"
    }
  ];
});

// 方法
const loadWards = async () => {
  if (loading.value) return;
  
  try {
    loading.value = true;
    await wardStore.fetchWards();
    finished.value = true;
  } catch (error) {
    console.error('加载病区数据失败:', error);
    showToast('加载病区数据失败');
  } finally {
    loading.value = false;
  }
};

const refreshData = async () => {
  finished.value = false;
  await loadWards();
};

const getOccupancyColor = (rate: number) => {
  if (isNaN(rate) || rate < 0) return 'bg-gray-500';
  if (rate >= 0.9) return 'bg-red-500';
  if (rate >= 0.7) return 'bg-yellow-500';
  return 'bg-green-500';
};

// 病区管理功能
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

// 删除病区
const deleteWard = async (ward: any) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除病区"${ward.name}"吗？此操作不可恢复。`
    });
    
    const success = await wardStore.deleteWard(ward.id);
    if (success) {
      showToast('删除成功');
      await refreshData();
    } else {
      showToast('删除失败');
    }
  } catch (error) {
    // 用户取消删除
  }
};

// 新增病区
const onSubmit = async () => {
  try {
    const wardData = {
      ...newWard.value,
      floor: parseInt(newWard.value.floor) || 1,
      status: 'active',
      totalStaff: 0,
      doctorCount: 0,
      nurseCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const success = await wardStore.createWard(wardData);
    if (success) {
      showToast('新增病区成功');
      showAddWard.value = false;
      resetForm();
      await refreshData();
    } else {
      showToast('新增病区失败');
    }
  } catch (error) {
    console.error('新增病区失败:', error);
    showToast('新增病区失败');
  }
};

const resetForm = () => {
  newWard.value = {
    name: "",
    code: "",
    department: "",
    description: "",
    floor: "",
    building: ""
  };
};

// 搜索功能
const onSearch = (value: string) => {
  searchKeyword.value = value;
};

const onSearchCancel = () => {
  searchKeyword.value = "";
  showSearch.value = false;
};

// 监听搜索关键词变化
watch(searchKeyword, () => {
  // 搜索关键词变化时，可以在这里添加防抖逻辑
});

// 生命周期
onMounted(() => {
  loadWards();
});

definePageMeta({
  layout: "admin",
  title: "病区管理",
  requiresAuth: true,
  middleware: "auth"
});
</script>

<style scoped>
.ward-management {
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* 添加过渡动画 */
.van-card {
  transition: all 0.3s ease;
}

.van-card:active {
  transform: scale(0.98);
}

.stat-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

/* 添加鼠标悬停效果 */
.stat-card:hover {
  border-color: #e5e7eb;
}

/* 添加卡片激活状态效果 */
.stat-card:active {
  transform: scale(0.98);
}

/* 可选：添加装饰性背景 */
.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, transparent, rgba(var(--van-primary-color), 0.03));
  border-radius: 50%;
  transform: translate(50%, -50%);
  pointer-events: none;
}
</style>
