<template>
  <div class="add-ward-staff">
    <h1>为所有科室添加人员数据</h1>
    <p class="subtitle">每个科室最多10人，根据科室类型智能分配</p>
    
    <div class="info-cards">
      <div class="info-card">
        <div class="number">{{ wards.length }}</div>
        <div class="label">总科室数</div>
      </div>
      <div class="info-card">
        <div class="number">{{ users.length }}</div>
        <div class="label">可用用户数</div>
      </div>
      <div class="info-card">
        <div class="number">{{ currentStaffCount }}</div>
        <div class="label">当前人员分配数</div>
      </div>
    </div>

    <div class="ward-grid">
      <div v-for="ward in wards" :key="ward.id" class="ward-card">
        <div class="ward-header">
          <h3>{{ ward.name }}</h3>
          <span class="department">{{ ward.department }}</span>
        </div>
        <div class="ward-details">
          <p><strong>楼层:</strong> {{ ward.floor }}楼 | <strong>建筑:</strong> {{ ward.building }}</p>
          <p><strong>当前人员:</strong> {{ getWardStaffCount(ward.id) }}人</p>
          <p><strong>计划分配:</strong> {{ getPlannedStaffCount(ward) }}人</p>
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
        class="primary-btn">
        {{ loading ? '添加中...' : '为所有科室添加人员' }}
      </button>
      <button 
        @click="clearAllStaff" 
        :disabled="loading"
        class="danger-btn">
        清空所有人员数据
      </button>
      <button 
        @click="refreshData" 
        :disabled="loading"
        class="secondary-btn">
        刷新数据
      </button>
    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>正在处理数据，请稍候...</p>
    </div>

    <div v-if="result" class="result-section">
      <h3>操作结果</h3>
      <div class="result-content">
        <pre>{{ result }}</pre>
      </div>
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
const currentStaffCount = ref(0);
const wardStaffData = ref<any[]>([]);
const result = ref('');

// 获取科室计划人员数量
const getPlannedStaffCount = (ward: any) => {
  let staffCount = 6; // 默认6个人员
  if (ward.name.includes('ICU') || ward.name.includes('CCU')) {
    staffCount = 10; // 重症监护科最多10人
  } else if (ward.name.includes('肿瘤') || ward.name.includes('康复')) {
    staffCount = 8; // 肿瘤科和康复科8人
  } else if (ward.name.includes('新生儿') || ward.name.includes('精神科')) {
    staffCount = 10; // 特殊科室最多10人
  } else if (ward.name.includes('心血管') || ward.name.includes('神经外科')) {
    staffCount = 8; // 重要科室8人
  } else {
    staffCount = 6; // 普通科室6人
  }
  return Math.min(staffCount, 10);
};

// 获取科室当前人员数量
const getWardStaffCount = (wardId: number) => {
  return wardStaffData.value.filter(staff => staff.wardId === wardId).length;
};

// 加载基础数据
const loadData = async () => {
  try {
    wards.value = await db.wards.toArray();
    users.value = await db.users.toArray();
    currentStaffCount.value = await db.wardStaff.count();
    wardStaffData.value = await db.wardStaff.toArray();
    
    console.log('数据加载完成:', {
      wards: wards.value.length,
      users: users.value.length,
      wardStaff: currentStaffCount.value
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

    // 先清空该科室现有人员
    await db.wardStaff.where('wardId').equals(wardId).delete();
    
    // 根据科室类型确定人员数量
    const staffCount = getPlannedStaffCount(ward);
    const newStaffData: any[] = [];
    
    for (let j = 0; j < staffCount; j++) {
      const user = users.value[j % users.value.length];
      const roleIndex = j % 3;
      
      let role = 'nurse';
      if (roleIndex === 0) role = 'doctor';
      if (roleIndex === 1) role = 'nurse';
      if (roleIndex === 2) role = 'manager';

      const shifts = ['白班', '夜班', '中班'];
      const shift = shifts[j % shifts.length];

      newStaffData.push({
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
    await db.wardStaff.bulkAdd(newStaffData);
    
    result.value = `为 ${ward.name} 添加了 ${staffCount} 个人员\n`;
    await loadData();
    
  } catch (error) {
    console.error('添加人员失败:', error);
    result.value += '添加人员失败: ' + error + '\n';
  } finally {
    loading.value = false;
  }
};

// 为所有科室添加人员
const addAllStaff = async () => {
  try {
    loading.value = true;
    result.value = '开始为所有科室添加人员...\n\n';
    
    // 先清空现有数据
    await db.wardStaff.clear();
    result.value += '已清空现有人员数据\n';
    
    // 为每个科室添加人员
    let totalAdded = 0;
    for (const ward of wards.value) {
      const staffCount = getPlannedStaffCount(ward);
      const newStaffData: any[] = [];
      
      for (let j = 0; j < staffCount; j++) {
        const user = users.value[j % users.value.length];
        const roleIndex = j % 3;
        
        let role = 'nurse';
        if (roleIndex === 0) role = 'doctor';
        if (roleIndex === 1) role = 'nurse';
        if (roleIndex === 2) role = 'manager';

        const shifts = ['白班', '夜班', '中班'];
        const shift = shifts[j % shifts.length];

        newStaffData.push({
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
      
      await db.wardStaff.bulkAdd(newStaffData);
      totalAdded += staffCount;
      result.value += `${ward.name}: ${staffCount}人\n`;
    }
    
    result.value += `\n完成！共为 ${wards.value.length} 个科室添加了 ${totalAdded} 个人员`;
    
    // 重新加载数据
    await loadData();
    
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
  title: "添加科室人员数据"
});
</script>

<style scoped>
.add-ward-staff {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.info-card .number {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.info-card .label {
  font-size: 14px;
  opacity: 0.9;
}

.ward-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.ward-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.ward-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.ward-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.ward-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.department {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.ward-details p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.ward-actions {
  margin-top: 15px;
  text-align: right;
}

.add-btn {
  background: #17a2b8;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.add-btn:hover:not(:disabled) {
  background: #138496;
}

.actions {
  text-align: center;
  margin: 40px 0;
}

.actions button {
  margin: 0 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  min-width: 150px;
}

.primary-btn {
  background: #28a745;
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background: #218838;
}

.danger-btn {
  background: #dc3545;
  color: white;
}

.danger-btn:hover:not(:disabled) {
  background: #c82333;
}

.secondary-btn {
  background: #6c757d;
  color: white;
}

.secondary-btn:hover:not(:disabled) {
  background: #5a6268;
}

button:disabled {
  background: #ccc !important;
  cursor: not-allowed;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  color: white;
  font-size: 18px;
  margin: 0;
}

.result-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 30px 0;
  border-left: 4px solid #007bff;
}

.result-section h3 {
  margin-top: 0;
  color: #333;
}

.result-content {
  background: white;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.result-content pre {
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  margin: 0;
  color: #333;
}
</style>
