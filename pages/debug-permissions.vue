<template>
  <div class="debug-permissions">
    <h1>权限调试页面</h1>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error }}</div>
    <div v-else>
      <h2>权限统计</h2>
      <p>总权限数: {{ permissionStore.permissions.length }}</p>
      <p>活跃权限: {{ activePermissions }}</p>
      <p>禁用权限: {{ inactivePermissions }}</p>
      
      <h2>权限列表 (前10个)</h2>
      <ul>
        <li v-for="permission in permissionStore.permissions.slice(0, 10)" :key="permission.id">
          {{ permission.name }} ({{ permission.code }}) - {{ permission.status }}
        </li>
      </ul>
      
      <button @click="refreshData">刷新数据</button>
      <button @click="resetDatabase" style="background: #dc3545; margin-left: 10px;">重置数据库</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePermissionStore } from '~/stores/permission';
import { InitDataService } from '~/api/db/seeds/initData';
import { db } from '~/api/db/database';

const permissionStore = usePermissionStore();
const loading = ref(true);
const error = ref<string | null>(null);

const activePermissions = computed(() => 
  permissionStore.permissions.filter(p => p.status === 'active').length
);

const inactivePermissions = computed(() => 
  permissionStore.permissions.filter(p => p.status === 'inactive').length
);

const refreshData = async () => {
  loading.value = true;
  error.value = null;
  try {
    await permissionStore.loadPermissions();
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};

const resetDatabase = async () => {
  if (!confirm('确定要重置数据库吗？这将清空所有数据！')) {
    return;
  }
  
  loading.value = true;
  error.value = null;
  try {
    console.log('开始重置数据库...');
    
    // 清空所有表
    await db.transaction('rw', [
      db.users, 
      db.roles, 
      db.permissions, 
      db.sessions,
      db.wards,
      db.rooms,
      db.beds,
      db.patients,
      db.medicalRecords,
      db.vitalSigns,
      db.nursingRecords,
      db.medicationRecords,
      db.medicationReminders,
      db.orders,
      db.orderExecutions
    ], async () => {
      await db.users.clear();
      await db.roles.clear();
      await db.permissions.clear();
      await db.sessions.clear();
      await db.wards.clear();
      await db.rooms.clear();
      await db.beds.clear();
      await db.patients.clear();
      await db.medicalRecords.clear();
      await db.vitalSigns.clear();
      await db.nursingRecords.clear();
      await db.medicationRecords.clear();
      await db.medicationReminders.clear();
      await db.orders.clear();
      await db.orderExecutions.clear();
    });
    
    console.log('数据库已清空');
    
    // 重新初始化数据
    console.log('开始重新初始化数据...');
    await InitDataService.initialize();
    console.log('数据初始化完成');
    
    // 刷新权限数据
    await permissionStore.loadPermissions();
    
    alert('数据库重置完成！');
  } catch (e: any) {
    error.value = e.message;
    console.error('重置数据库失败:', e);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await refreshData();
});
</script>

<style scoped>
.debug-permissions {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1, h2 {
  color: #333;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 8px;
  border-bottom: 1px solid #eee;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}
</style>
