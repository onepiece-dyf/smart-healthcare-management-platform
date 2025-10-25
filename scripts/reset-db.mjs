import { db } from '../api/db/database.ts';
import { InitDataService } from '../api/db/seeds/initData.ts';

async function resetDatabase() {
  try {
    console.log('正在清空数据库...');
    
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
    
    // 检查权限数量
    const permissionCount = await db.permissions.count();
    console.log(`权限数量: ${permissionCount}`);
    
  } catch (error) {
    console.error('重置数据库失败:', error);
  } finally {
    await db.close();
  }
}

resetDatabase();
