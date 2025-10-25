<template>
  <div class="debug-staff">
    <h1>人员数据调试页面</h1>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error }}</div>
    <div v-else>
      <h2>数据统计</h2>
      <p>总用户数: {{ users.length }}</p>
      <p>总病区数: {{ wards.length }}</p>
      <p>总人员分配数: {{ wardStaff.length }}</p>
      
      <h2>病区人员分配情况</h2>
      <div v-for="ward in wards" :key="ward.id" class="ward-info">
        <h3>{{ ward.name }} ({{ ward.department }})</h3>
        <p>病区ID: {{ ward.id }}</p>
        <p>统计中的医生数: {{ ward.doctorCount || 0 }}</p>
        <p>统计中的护士数: {{ ward.nurseCount || 0 }}</p>
        <p>统计中的总人数: {{ ward.totalStaff || 0 }}</p>
        
        <h4>实际分配的人员:</h4>
        <div v-if="getWardStaff(ward.id).length === 0" class="no-staff">
          暂无人员分配
        </div>
        <div v-else>
          <div v-for="staff in getWardStaff(ward.id)" :key="staff.id" class="staff-item">
            <span>{{ staff.user?.name || '未知用户' }} ({{ staff.user?.username }})</span>
            <span class="role">{{ getRoleLabel(staff.role) }}</span>
            <span class="shift">{{ staff.shift }}</span>
          </div>
        </div>
      </div>
      
      <div class="actions">
        <button @click="refreshData">刷新数据</button>
        <button @click="addStaffData" style="background: #28a745; margin-left: 10px;">添加人员数据</button>
        <button @click="updateWardStats" style="background: #007bff; margin-left: 10px;">更新病区统计</button>
        <button @click="resetDatabase" style="background: #dc3545; margin-left: 10px;">重置数据库</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStaffStore, WardStaffRole } from '~/stores/staffStore';
import { useWardStore } from '~/stores/wardStore';
import { InitDataService } from '~/api/db/seeds/initData';
import { db } from '~/api/db/database';

const staffStore = useStaffStore();
const wardStore = useWardStore();

const loading = ref(false);
const error = ref<string | null>(null);
const users = ref<any[]>([]);
const wards = ref<any[]>([]);
const wardStaff = ref<any[]>([]);

// 获取角色标签
const getRoleLabel = (role: string) => {
  switch (role) {
    case 'doctor': return '医生';
    case 'nurse': return '护士';
    case 'manager': return '管理员';
    default: return '未知';
  }
};

// 获取指定病区的人员
const getWardStaff = (wardId: number) => {
  return wardStaff.value.filter(staff => staff.wardId === wardId);
};

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // 加载用户数据
    users.value = await db.users.toArray();
    
    // 加载病区数据
    await wardStore.fetchWards();
    wards.value = wardStore.wards;
    
    // 加载人员分配数据
    wardStaff.value = await db.wardStaff.toArray();
    
    console.log('数据加载完成:');
    console.log('用户数:', users.value.length);
    console.log('病区数:', wards.value.length);
    console.log('人员分配数:', wardStaff.value.length);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载数据失败';
    console.error('加载数据失败:', err);
  } finally {
    loading.value = false;
  }
};

// 添加人员数据
const addStaffData = async () => {
  try {
    loading.value = true;
    
    // 先初始化病区人员数据
    await InitDataService.initializeWardStaff();
    
    // 重新加载数据
    await loadData();
    
    alert('人员数据添加成功！');
  } catch (err) {
    error.value = err instanceof Error ? err.message : '添加人员数据失败';
    console.error('添加人员数据失败:', err);
  } finally {
    loading.value = false;
  }
};

// 更新病区统计
const updateWardStats = async () => {
  try {
    loading.value = true;
    
    // 获取所有病区
    const allWards = await db.wards.toArray();
    
    for (const ward of allWards) {
      // 获取该病区的人员分配
      const wardStaffData = await db.wardStaff.where('wardId').equals(ward.id).toArray();
      
      // 统计各角色人数
      const doctorCount = wardStaffData.filter(s => s.role === 'doctor' && s.isActive).length;
      const nurseCount = wardStaffData.filter(s => s.role === 'nurse' && s.isActive).length;
      const managerCount = wardStaffData.filter(s => s.role === 'manager' && s.isActive).length;
      const totalStaff = doctorCount + nurseCount + managerCount;
      
      // 更新病区统计
      await db.wards.update(ward.id, {
        doctorCount,
        nurseCount,
        totalStaff,
        updatedAt: new Date()
      });
    }
    
    // 重新加载数据
    await loadData();
    
    alert('病区统计更新成功！');
  } catch (err) {
    error.value = err instanceof Error ? err.message : '更新病区统计失败';
    console.error('更新病区统计失败:', err);
  } finally {
    loading.value = false;
  }
};

// 刷新数据
const refreshData = () => {
  loadData();
};

// 重置数据库
const resetDatabase = async () => {
  if (confirm('确定要重置数据库吗？这将删除所有数据！')) {
    try {
      loading.value = true;
      await db.delete();
      await db.open();
      await InitDataService.initialize();
      await loadData();
      alert('数据库重置成功！');
    } catch (err) {
      error.value = err instanceof Error ? err.message : '重置数据库失败';
      console.error('重置数据库失败:', err);
    } finally {
      loading.value = false;
    }
  }
};

onMounted(() => {
  loadData();
});

definePageMeta({
  layout: "admin",
  title: "人员数据调试"
});
</script>

<style scoped>
.debug-staff {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.ward-info {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  background: #f9f9f9;
}

.staff-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin: 5px 0;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.role {
  background: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.shift {
  color: #666;
  font-size: 14px;
}

.no-staff {
  color: #999;
  font-style: italic;
  padding: 10px;
}

.actions {
  margin-top: 20px;
}

.actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.actions button:hover {
  opacity: 0.8;
}
</style>
