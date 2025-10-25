<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { initializeWardData } from "./api/db/seeds/ward";
import { InitDataService } from "./api/db/seeds/initData";
import { useAuthStore } from "./stores/auth";
import { seedMedicalRecords } from "./api/db/seeds/medicalRecordSeed";
import { seedOrders, seedOrderExecutions } from "./api/db/seeds/orderSeed";
import { seedVitalSigns } from "./api/db/seeds/vitalSignsSeed";
import { seedNursingRecords } from "./api/db/seeds/nursingSeed";
import { seedMedicationRecords, seedMedicationReminders } from "./api/db/seeds/medicationSeed";

const authStore = useAuthStore();

// 在应用启动时检查认证状态
onMounted(async () => {
  await authStore.checkAuth();
  
  // 初始化所有种子数据
  try {
    await InitDataService.initialize();
    await InitDataService.initializeDoctorUsers();
    await initializeWardData();
    await InitDataService.initializeWardStaff(); // 添加人员数据初始化
    await seedMedicalRecords();
    await seedOrders();
    await seedOrderExecutions();
    await seedVitalSigns();
    await seedNursingRecords();
    await seedMedicationRecords();
    await seedMedicationReminders();
    console.log('所有种子数据初始化完成');
  } catch (error) {
    console.error('种子数据初始化失败:', error);
  }
});
</script>
