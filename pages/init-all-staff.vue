<template>
  <div class="init-all-staff">
    <h1>为所有科室添加医护人员数据</h1>
    
    <div class="info-section">
      <h2>科室信息</h2>
      <p>系统中共有 <strong>{{ wards.length }}</strong> 个科室</p>
      <p>当前用户数: <strong>{{ users.length }}</strong></p>
      <p>当前人员分配数: <strong>{{ wardStaffCount }}</strong></p>
    </div>

    <div class="ward-list">
      <h2>科室列表</h2>
      <div v-for="ward in wards" :key="ward.id" class="ward-item">
        <div class="ward-info">
          <h3>{{ ward.name }} ({{ ward.department }})</h3>
          <p>楼层: {{ ward.floor }}楼 | 建筑: {{ ward.building }}</p>
          <p>当前人员: {{ getWardStaffCount(ward.id) }}人</p>
        </div>
        <div class="ward-actions">
          <button 
            @click="addStaffToWard(ward.id)" 
            :disabled="loading"
            class="add-btn">
            添加人员
          </button>
        </div>
      </div>
    </div>

    <div class="actions">
      <button 
        @click="addAllStaff" 
        :disabled="loading"
        class="add-all-btn">
        {{ loading ? '添加中...' : '为所有科室添加人员' }}
      </button>
      <button 
        @click="clearAllStaff" 
        :disabled="loading"
        class="clear-btn">
        清空所有人员数据
      </button>
      <button 
        @click="refreshData" 
        :disabled="loading"
        class="refresh-btn">
        刷新数据
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>正在处理数据...</p>
    </div>

    <div v-if="result" class="result">
      <h3>操作结果</h3>
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { db } from '~/api/db/database';
import { InitDataService } from '~/api/db/seeds/initData';

const loading = ref(false);
const wards = ref<any[]>([]);
const users = ref<any[]>([]);
const wardStaffCount = ref(0);
const result = ref('');

// 获取科室人员数量
const getWardStaffCount = (wardId: number) => {
  // 这里需要从数据库查询，暂时返回0
  return 0;
};

// 加载基础数据
const loadData = async () => {
  try {
    wards.value = await db.wards.toArray();
    users.value = await db.users.toArray();
    wardStaffCount.value = await db.wardStaff.count();
    
    console.log('数据加载完成:', {
      wards: wards.value.length,
      users: users.value.length,
      wardStaff: wardStaffCount.value
    });
  } catch (error) {
    console.error('加载数据失败:', error);
    result.value = '加载数据失败: ' + error;
  }
};

// 为单个科室添加人员
const addStaffToWard = async (wardId: number) => {
  try {
    loading.value = true;
    
    const ward = wards.value.find(w => w.id === wardId);
    if (!ward) {
      result.value = `科室 ${wardId} 不存在`;
      return;
    }

    // 根据科室类型确定人员数量
    let staffCount = 6; // 默认6个人员
    if (ward.name.includes('ICU') || ward.name.includes('CCU')) {
      staffCount = 12;
    } else if (ward.name.includes('肿瘤') || ward.name.includes('康复')) {
      staffCount = 8;
    } else if (ward.name.includes('新生儿') || ward.name.includes('精神科')) {
      staffCount = 10;
    }

    const wardStaffData: any[] = [];
    
    for (let j = 0; j < staffCount; j++) {
      const user = users.value[j % users.value.length];
      const roleIndex = j % 3;
      
      let role = 'nurse';
      if (roleIndex === 0) role = 'doctor';
      if (roleIndex === 1) role = 'nurse';
      if (roleIndex === 2) role = 'manager';

      const shifts = ['白班', '夜班', '中班'];
      const shift = shifts[j % shifts.length];

      wardStaffData.push({
        wardId: ward.id,
        userId: user.id,
        role: role,
        shift: shift,
        isActive: true,
        assignedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // 插入数据
    await db.wardStaff.bulkAdd(wardStaffData);
    
    result.value = `为 ${ward.name} 添加了 ${staffCount} 个人员`;
    await loadData();
    
  } catch (error) {
    console.error('添加人员失败:', error);
    result.value = '添加人员失败: ' + error;
  } finally {
    loading.value = false;
  }
};

// 为所有科室添加人员
const addAllStaff = async () => {
  try {
    loading.value = true;
    result.value = '开始为所有科室添加人员...\n';
    
    // 先清空现有数据
    await db.wardStaff.clear();
    result.value += '已清空现有人员数据\n';
    
    // 使用InitDataService初始化所有人员数据
    await InitDataService.initializeWardStaff();
    result.value += '人员数据初始化完成\n';
    
    // 重新加载数据
    await loadData();
    
    result.value += `\n完成！共为 ${wards.value.length} 个科室添加了人员数据`;
    
  } catch (error) {
    console.error('添加所有人员失败:', error);
    result.value += '\n添加失败: ' + error;
  } finally {
    loading.value = false;
  }
};

// 清空所有人员数据
const clearAllStaff = async () => {
  if (confirm('确定要清空所有人员数据吗？')) {
    try {
      loading.value = true;
      await db.wardStaff.clear();
      await loadData();
      result.value = '所有人员数据已清空';
    } catch (error) {
      console.error('清空数据失败:', error);
      result.value = '清空失败: ' + error;
    } finally {
      loading.value = false;
    }
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
  title: "初始化所有科室人员"
});
</script>

<style scoped>
.init-all-staff {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.info-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.info-section h2 {
  margin-top: 0;
  color: #333;
}

.ward-list {
  margin: 20px 0;
}

.ward-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 10px 0;
  background: white;
}

.ward-info h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.ward-info p {
  margin: 3px 0;
  color: #666;
  font-size: 14px;
}

.ward-actions {
  margin-left: 20px;
}

.actions {
  margin: 30px 0;
  text-align: center;
}

.actions button {
  margin: 0 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.add-all-btn {
  background: #28a745;
  color: white;
}

.add-all-btn:hover:not(:disabled) {
  background: #218838;
}

.clear-btn {
  background: #dc3545;
  color: white;
}

.clear-btn:hover:not(:disabled) {
  background: #c82333;
}

.refresh-btn {
  background: #007bff;
  color: white;
}

.refresh-btn:hover:not(:disabled) {
  background: #0056b3;
}

.add-btn {
  background: #17a2b8;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn:hover:not(:disabled) {
  background: #138496;
}

button:disabled {
  background: #ccc !important;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 40px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  border-left: 4px solid #007bff;
}

.result pre {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 14px;
  margin: 0;
}
</style>
