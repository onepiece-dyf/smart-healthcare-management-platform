import { db } from '../api/db/database.ts';
import { InitDataService } from '../api/db/seeds/initData.ts';

async function addAllStaff() {
  try {
    console.log('开始为所有科室添加人员数据...');
    
    // 检查现有数据
    const existingStaff = await db.wardStaff.count();
    const wards = await db.wards.toArray();
    const users = await db.users.toArray();
    
    console.log(`当前状态:`);
    console.log(`- 科室数: ${wards.length}`);
    console.log(`- 用户数: ${users.length}`);
    console.log(`- 现有人员分配数: ${existingStaff}`);
    
    if (existingStaff > 0) {
      console.log('清空现有人员数据...');
      await db.wardStaff.clear();
    }
    
    // 初始化所有人员数据
    await InitDataService.initializeWardStaff();
    
    // 检查结果
    const newStaffCount = await db.wardStaff.count();
    console.log(`\n人员数据添加完成！`);
    console.log(`- 新增人员分配数: ${newStaffCount}`);
    
    // 显示每个科室的人员分配情况
    console.log('\n各科室人员分配情况:');
    for (const ward of wards) {
      const staff = await db.wardStaff.where('wardId').equals(ward.id).toArray();
      const doctors = staff.filter(s => s.role === 'doctor').length;
      const nurses = staff.filter(s => s.role === 'nurse').length;
      const managers = staff.filter(s => s.role === 'manager').length;
      
      console.log(`${ward.name} (${ward.department}): ${staff.length}人 (医生${doctors}人, 护士${nurses}人, 管理员${managers}人)`);
    }
    
  } catch (error) {
    console.error('添加人员数据失败:', error);
  }
}

addAllStaff();
