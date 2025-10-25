<template>
  <div class="fix-ward-staff">
    <h1>修复科室人员数据显示</h1>
    <p class="subtitle">确保科室详情页面显示实际的人员分配数据，而不是静态配置数据</p>
    
    <div class="info-section">
      <h2>问题说明</h2>
      <div class="problem-card">
        <h3>❌ 当前问题</h3>
        <p>科室详情页面显示的是病区配置中的静态数据（如心血管内科显示30总人数，10医生，20护士），而不是实际的人员分配数据。</p>
      </div>
      
      <div class="solution-card">
        <h3>✅ 解决方案</h3>
        <p>已修改科室详情页面，现在会显示实际的人员分配数据，包括管理员数量。</p>
      </div>
    </div>

    <div class="actions">
      <button 
        @click="checkAllWards" 
        :disabled="loading"
        class="check-btn">
        {{ loading ? '检查中...' : '检查所有科室人员数据' }}
      </button>
      <button 
        @click="quickInitAllStaff" 
        :disabled="loading"
        class="quick-init-btn">
        {{ loading ? '初始化中...' : '快速初始化所有科室人员' }}
      </button>
      <button 
        @click="addMissingStaff" 
        :disabled="loading"
        class="add-btn">
        为缺少人员的科室添加数据
      </button>
      <button 
        @click="refreshData" 
        :disabled="loading"
        class="refresh-btn">
        刷新数据
      </button>
    </div>

    <div v-if="wardData.length > 0" class="ward-results">
      <h2>科室人员数据检查结果</h2>
      <div class="ward-list">
        <div v-for="ward in wardData" :key="ward.id" class="ward-item">
          <div class="ward-info">
            <h3>{{ ward.name }} ({{ ward.department }})</h3>
            <p>楼层: {{ ward.floor }}楼 | 建筑: {{ ward.building }}</p>
          </div>
          <div class="ward-stats">
            <div class="stat-item">
              <span class="label">配置数据:</span>
              <span class="value">{{ ward.configTotal }}人 (医生{{ ward.configDoctors }}人, 护士{{ ward.configNurses }}人)</span>
            </div>
            <div class="stat-item">
              <span class="label">实际数据:</span>
              <span class="value">{{ ward.actualTotal }}人 (医生{{ ward.actualDoctors }}人, 护士{{ ward.actualNurses }}人, 管理员{{ ward.actualManagers }}人)</span>
            </div>
            <div class="stat-item">
              <span class="label">状态:</span>
              <span :class="['status', ward.hasData ? 'has-data' : 'no-data']">
                {{ ward.hasData ? '✅ 有数据' : '❌ 无数据' }}
              </span>
            </div>
          </div>
        </div>
      </div>
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
import { ref, onMounted } from 'vue';
import { db } from '~/api/db/database';
import { useStaffStore, WardStaffRole } from '~/stores/staffStore';

const loading = ref(false);
const wardData = ref<any[]>([]);
const result = ref('');

const staffStore = useStaffStore();

// 检查所有科室的人员数据
const checkAllWards = async () => {
  try {
    loading.value = true;
    result.value = '开始检查所有科室的人员数据...\n\n';
    
    // 获取所有科室
    const wards = await db.wards.toArray();
    
    // 获取人员数据
    await staffStore.fetchStaff();
    await staffStore.fetchUsers();
    
    const wardResults = [];
    
    for (const ward of wards) {
      // 获取该科室的实际人员分配
      const actualStaff = await staffStore.fetchWardStaff(ward.id!);
      
      const actualDoctors = actualStaff.filter(s => s.role === WardStaffRole.DOCTOR).length;
      const actualNurses = actualStaff.filter(s => s.role === WardStaffRole.NURSE).length;
      const actualManagers = actualStaff.filter(s => s.role === WardStaffRole.MANAGER).length;
      const actualTotal = actualStaff.length;
      
      wardResults.push({
        id: ward.id,
        name: ward.name,
        department: ward.department,
        floor: ward.floor,
        building: ward.building,
        configTotal: ward.totalStaff || 0,
        configDoctors: ward.doctorCount || 0,
        configNurses: ward.nurseCount || 0,
        actualTotal,
        actualDoctors,
        actualNurses,
        actualManagers,
        hasData: actualTotal > 0
      });
      
      result.value += `${ward.name}: 配置${ward.totalStaff || 0}人, 实际${actualTotal}人\n`;
    }
    
    wardData.value = wardResults;
    
    const totalWithData = wardResults.filter(w => w.hasData).length;
    result.value += `\n检查完成！${totalWithData}/${wards.length} 个科室有人员数据`;
    
  } catch (error) {
    console.error('检查科室数据失败:', error);
    result.value += '\n检查失败: ' + error;
  } finally {
    loading.value = false;
  }
};

// 快速初始化所有科室人员
const quickInitAllStaff = async () => {
  try {
    loading.value = true;
    result.value = '开始快速初始化所有科室人员数据...\n\n';
    
    // 先清空现有数据
    await db.wardStaff.clear();
    result.value += '已清空现有人员数据\n';
    
    // 获取所有科室和用户
    const wards = await db.wards.toArray();
    const users = await db.users.toArray();
    
    if (users.length === 0) {
      result.value += '❌ 没有可用用户，请先创建用户数据\n';
      return;
    }
    
    let totalAdded = 0;
    
    // 为每个科室添加人员
    for (const ward of wards) {
      // 根据科室类型确定人员数量
      let staffCount = 6; // 默认6个人员
      if (ward.name.includes('ICU') || ward.name.includes('CCU')) {
        staffCount = 10; // 重症监护科最多10人
      } else if (ward.name.includes('肿瘤') || ward.name.includes('康复')) {
        staffCount = 8; // 肿瘤科和康复科8人
      } else if (ward.name.includes('新生儿') || ward.name.includes('精神科')) {
        staffCount = 10; // 特殊科室最多10人
      } else if (ward.name.includes('心血管') || ward.name.includes('神经外科')) {
        staffCount = 8; // 重要科室8人
      }
      
      const newStaffData = [];
      
      for (let j = 0; j < staffCount; j++) {
        const user = users[j % users.length];
        const roleIndex = j % 3;
        
        let role: 'doctor' | 'nurse' | 'manager' = 'nurse';
        if (roleIndex === 0) role = 'doctor';
        if (roleIndex === 1) role = 'nurse';
        if (roleIndex === 2) role = 'manager';

        const shifts = ['白班', '夜班', '中班'];
        const shift = shifts[j % shifts.length];

        newStaffData.push({
          wardId: ward.id!,
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
      result.value += `✅ ${ward.name}: ${staffCount}人\n`;
    }
    
    // 更新病区统计数据
    result.value += '\n📈 更新病区统计数据...\n';
    for (const ward of wards) {
      const wardStaff = await db.wardStaff.where('wardId').equals(ward.id!).toArray();
      const doctorCount = wardStaff.filter(s => s.role === 'doctor').length;
      const nurseCount = wardStaff.filter(s => s.role === 'nurse').length;
      const managerCount = wardStaff.filter(s => s.role === 'manager').length;
      const totalStaff = doctorCount + nurseCount + managerCount;
      
      await db.wards.update(ward.id, {
        doctorCount,
        nurseCount,
        totalStaff,
        updatedAt: new Date()
      });
    }
    
    result.value += `\n🎉 完成！共为 ${wards.length} 个科室添加了 ${totalAdded} 个人员\n`;
    result.value += '现在可以查看科室详情页面，人员数量应该正确显示了！';
    
    // 重新检查数据
    await checkAllWards();
    
  } catch (error) {
    console.error('快速初始化失败:', error);
    result.value += '\n❌ 快速初始化失败: ' + error;
  } finally {
    loading.value = false;
  }
};

// 为缺少人员的科室添加数据
const addMissingStaff = async () => {
  try {
    loading.value = true;
    result.value = '开始为缺少人员的科室添加数据...\n\n';
    
    const wardsWithoutStaff = wardData.value.filter(w => !w.hasData);
    
    if (wardsWithoutStaff.length === 0) {
      result.value = '所有科室都有人员数据，无需添加';
      return;
    }
    
    // 获取用户数据
    const users = await db.users.toArray();
    
    for (const ward of wardsWithoutStaff) {
      // 根据科室类型确定人员数量
      let staffCount = 6; // 默认6个人员
      if (ward.name.includes('ICU') || ward.name.includes('CCU')) {
        staffCount = 10;
      } else if (ward.name.includes('肿瘤') || ward.name.includes('康复')) {
        staffCount = 8;
      } else if (ward.name.includes('新生儿') || ward.name.includes('精神科')) {
        staffCount = 10;
      } else if (ward.name.includes('心血管') || ward.name.includes('神经外科')) {
        staffCount = 8;
      }
      
      const newStaffData: any[] = [];
      
      for (let j = 0; j < staffCount; j++) {
        const user = users[j % users.length];
        const roleIndex = j % 3;
        
        let role: 'doctor' | 'nurse' | 'manager' = 'nurse';
        if (roleIndex === 0) role = 'doctor';
        if (roleIndex === 1) role = 'nurse';
        if (roleIndex === 2) role = 'manager';

        const shifts = ['白班', '夜班', '中班'];
        const shift = shifts[j % shifts.length];

        newStaffData.push({
          wardId: ward.id!,
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
      result.value += `为 ${ward.name} 添加了 ${staffCount} 个人员\n`;
    }
    
    result.value += `\n完成！为 ${wardsWithoutStaff.length} 个科室添加了人员数据`;
    
    // 重新检查数据
    await checkAllWards();
    
  } catch (error) {
    console.error('添加人员数据失败:', error);
    result.value += '\n添加失败: ' + error;
  } finally {
    loading.value = false;
  }
};

// 刷新数据
const refreshData = () => {
  wardData.value = [];
  result.value = '';
  checkAllWards();
};

onMounted(() => {
  checkAllWards();
});

definePageMeta({
  layout: "admin",
  title: "修复科室人员数据"
});
</script>

<style scoped>
.fix-ward-staff {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
}

.info-section {
  margin: 30px 0;
}

.problem-card, .solution-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin: 15px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.problem-card {
  border-left: 4px solid #dc3545;
}

.solution-card {
  border-left: 4px solid #28a745;
}

.problem-card h3, .solution-card h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.actions {
  text-align: center;
  margin: 30px 0;
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

.check-btn {
  background: #007bff;
  color: white;
}

.quick-init-btn {
  background: #fd7e14;
  color: white;
  font-weight: bold;
}

.add-btn {
  background: #28a745;
  color: white;
}

.refresh-btn {
  background: #6c757d;
  color: white;
}

.actions button:hover:not(:disabled) {
  opacity: 0.8;
}

button:disabled {
  background: #ccc !important;
  cursor: not-allowed;
}

.ward-results {
  margin: 30px 0;
}

.ward-list {
  display: grid;
  gap: 15px;
}

.ward-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.ward-info h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.ward-info p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.ward-stats {
  margin-top: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #555;
}

.value {
  color: #333;
  font-family: monospace;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status.has-data {
  background: #d4edda;
  color: #155724;
}

.status.no-data {
  background: #f8d7da;
  color: #721c24;
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
