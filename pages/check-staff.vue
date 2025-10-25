<template>
  <div class="check-staff">
    <h1>人员分配检查</h1>
    
    <div v-if="loading">加载中...</div>
    <div v-else>
      <h2>病区 {{ wardId }} 的人员分配详情</h2>
      
      <div class="stats">
        <p><strong>总人数:</strong> {{ staffStats.total }}</p>
        <p><strong>医生:</strong> {{ staffStats.doctors }}</p>
        <p><strong>护士:</strong> {{ staffStats.nurses }}</p>
        <p><strong>管理员:</strong> {{ staffStats.managers }}</p>
        <p><strong>验证:</strong> {{ staffStats.doctors + staffStats.nurses + staffStats.managers }} = {{ staffStats.total }}</p>
      </div>
      
      <h3>详细人员列表</h3>
      <div v-if="staffList.length === 0" class="no-data">暂无人员数据</div>
      <div v-else>
        <div v-for="staff in staffList" :key="staff.id" class="staff-item">
          <div class="staff-info">
            <strong>{{ staff.user?.name || '未知用户' }}</strong> ({{ staff.user?.username || '未知' }})
          </div>
          <div class="staff-details">
            <span class="role role-{{ staff.role }}">{{ getRoleLabel(staff.role) }}</span>
            <span class="shift">{{ staff.shift }}</span>
            <span class="status" :class="{ active: staff.isActive }">
              {{ staff.isActive ? '在职' : '离职' }}
            </span>
          </div>
        </div>
      </div>
      
      <button @click="refreshData" class="refresh-btn">刷新数据</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStaffStore, WardStaffRole } from '~/stores/staffStore';

const route = useRoute();
const staffStore = useStaffStore();
const wardId = parseInt(route.params.id as string) || 1;

const loading = ref(false);
const staffList = ref<any[]>([]);

// 获取角色标签
const getRoleLabel = (role: string) => {
  switch (role) {
    case 'doctor': return '医生';
    case 'nurse': return '护士';
    case 'manager': return '管理员';
    default: return '未知';
  }
};

// 人员统计
const staffStats = computed(() => {
  const wardStaff = staffStore.getWardStaff(wardId);
  return {
    total: wardStaff.length,
    doctors: wardStaff.filter(s => s.role === WardStaffRole.DOCTOR).length,
    nurses: wardStaff.filter(s => s.role === WardStaffRole.NURSE).length,
    managers: wardStaff.filter(s => s.role === WardStaffRole.MANAGER).length
  };
});

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    
    // 获取所有人员数据
    await staffStore.fetchStaff();
    await staffStore.fetchUsers();
    
    // 获取指定病区的人员
    const staff = await staffStore.fetchWardStaff(wardId);
    staffList.value = staff;
    
    console.log('人员数据加载完成:', {
      wardId,
      staffCount: staff.length,
      staffList: staff.map(s => ({
        id: s.id,
        name: s.user?.name,
        username: s.user?.username,
        role: s.role,
        shift: s.shift,
        isActive: s.isActive
      }))
    });
  } catch (error) {
    console.error('加载人员数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 刷新数据
const refreshData = () => {
  loadData();
};

onMounted(() => {
  loadData();
});

definePageMeta({
  layout: "admin",
  title: "人员分配检查"
});
</script>

<style scoped>
.check-staff {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.stats {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.stats p {
  margin: 5px 0;
  font-size: 16px;
}

.staff-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin: 10px 0;
  background: white;
}

.staff-info {
  font-size: 16px;
  margin-bottom: 8px;
}

.staff-details {
  display: flex;
  gap: 10px;
  align-items: center;
}

.role {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.role-doctor {
  background: #e3f2fd;
  color: #1976d2;
}

.role-nurse {
  background: #e8f5e8;
  color: #388e3c;
}

.role-manager {
  background: #f3e5f5;
  color: #7b1fa2;
}

.shift {
  color: #666;
  font-size: 14px;
}

.status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.status.active {
  background: #e8f5e8;
  color: #388e3c;
}

.status:not(.active) {
  background: #ffebee;
  color: #d32f2f;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 40px;
  font-style: italic;
}

.refresh-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
}

.refresh-btn:hover {
  background: #0056b3;
}
</style>
