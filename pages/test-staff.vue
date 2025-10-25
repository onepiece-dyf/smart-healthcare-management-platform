<template>
  <div class="test-staff">
    <h1>人员数据测试页面</h1>
    
    <div class="actions">
      <button @click="checkData" :disabled="loading">检查数据</button>
      <button @click="initStaffData" :disabled="loading">初始化人员数据</button>
      <button @click="clearData" :disabled="loading">清空数据</button>
    </div>
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-if="dataInfo" class="data-info">
      <h2>数据统计</h2>
      <p>用户数: {{ dataInfo.users }}</p>
      <p>病区数: {{ dataInfo.wards }}</p>
      <p>人员分配数: {{ dataInfo.wardStaff }}</p>
      
      <h3>病区人员分配详情</h3>
      <div v-for="ward in dataInfo.wardDetails" :key="ward.id" class="ward-detail">
        <h4>{{ ward.name }} ({{ ward.department }})</h4>
        <p>病区ID: {{ ward.id }}</p>
        <p>医生: {{ ward.doctors }} | 护士: {{ ward.nurses }} | 管理员: {{ ward.managers }}</p>
        <p>总人数: {{ ward.total }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { db } from '~/api/db/database';
import { InitDataService } from '~/api/db/seeds/initData';

const loading = ref(false);
const dataInfo = ref<any>(null);

const checkData = async () => {
  try {
    loading.value = true;
    
    const users = await db.users.toArray();
    const wards = await db.wards.toArray();
    const wardStaff = await db.wardStaff.toArray();
    
    const wardDetails = [];
    for (const ward of wards) {
      const staff = wardStaff.filter(s => s.wardId === ward.id);
      const doctors = staff.filter(s => s.role === 'doctor').length;
      const nurses = staff.filter(s => s.role === 'nurse').length;
      const managers = staff.filter(s => s.role === 'manager').length;
      
      wardDetails.push({
        id: ward.id,
        name: ward.name,
        department: ward.department,
        doctors,
        nurses,
        managers,
        total: doctors + nurses + managers
      });
    }
    
    dataInfo.value = {
      users: users.length,
      wards: wards.length,
      wardStaff: wardStaff.length,
      wardDetails
    };
    
    console.log('数据检查完成:', dataInfo.value);
  } catch (error) {
    console.error('检查数据失败:', error);
    alert('检查数据失败: ' + error);
  } finally {
    loading.value = false;
  }
};

const initStaffData = async () => {
  try {
    loading.value = true;
    
    // 先清空现有数据
    await db.wardStaff.clear();
    
    // 初始化人员数据
    await InitDataService.initializeWardStaff();
    
    // 重新检查数据
    await checkData();
    
    alert('人员数据初始化完成！');
  } catch (error) {
    console.error('初始化人员数据失败:', error);
    alert('初始化失败: ' + error);
  } finally {
    loading.value = false;
  }
};

const clearData = async () => {
  if (confirm('确定要清空所有人员数据吗？')) {
    try {
      loading.value = true;
      await db.wardStaff.clear();
      await checkData();
      alert('数据已清空！');
    } catch (error) {
      console.error('清空数据失败:', error);
      alert('清空失败: ' + error);
    } finally {
      loading.value = false;
    }
  }
};

definePageMeta({
  layout: "admin",
  title: "人员数据测试"
});
</script>

<style scoped>
.test-staff {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.actions {
  margin: 20px 0;
}

.actions button {
  margin-right: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
  cursor: pointer;
}

.actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.data-info {
  margin-top: 20px;
}

.ward-detail {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin: 10px 0;
  background: #f9f9f9;
}

.ward-detail h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.ward-detail p {
  margin: 5px 0;
  color: #666;
}
</style>
