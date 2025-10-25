import { db } from '../api/db/database.ts';
import { InitDataService } from '../api/db/seeds/initData.ts';

async function initStaffData() {
  try {
    console.log('开始初始化人员数据...');
    
    // 初始化病区人员数据
    await InitDataService.initializeWardStaff();
    
    // 检查数据
    const wardStaffCount = await db.wardStaff.count();
    const usersCount = await db.users.count();
    const wardsCount = await db.wards.count();
    
    console.log('数据统计:');
    console.log(`用户数: ${usersCount}`);
    console.log(`病区数: ${wardsCount}`);
    console.log(`人员分配数: ${wardStaffCount}`);
    
    // 显示每个病区的人员分配情况
    const wards = await db.wards.toArray();
    for (const ward of wards) {
      const staff = await db.wardStaff.where('wardId').equals(ward.id).toArray();
      const doctors = staff.filter(s => s.role === 'doctor').length;
      const nurses = staff.filter(s => s.role === 'nurse').length;
      const managers = staff.filter(s => s.role === 'manager').length;
      
      console.log(`\n${ward.name} (${ward.department}):`);
      console.log(`  总人数: ${staff.length}`);
      console.log(`  医生: ${doctors}`);
      console.log(`  护士: ${nurses}`);
      console.log(`  管理员: ${managers}`);
    }
    
    console.log('\n人员数据初始化完成！');
  } catch (error) {
    console.error('初始化人员数据失败:', error);
  }
}

initStaffData();
