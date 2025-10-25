import { db } from '../api/db/database.ts';

async function quickInitStaff() {
  try {
    console.log('🚀 快速为所有科室添加人员数据...\n');
    
    // 检查现有数据
    const existingStaff = await db.wardStaff.count();
    const wards = await db.wards.toArray();
    const users = await db.users.toArray();
    
    console.log('📊 当前状态:');
    console.log(`   - 科室数: ${wards.length}`);
    console.log(`   - 用户数: ${users.length}`);
    console.log(`   - 现有人员分配数: ${existingStaff}\n`);
    
    if (existingStaff > 0) {
      console.log('🗑️  清空现有人员数据...');
      await db.wardStaff.clear();
    }
    
    // 为每个科室添加人员
    let totalAdded = 0;
    const wardStaffData = [];
    
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
      
      // 为每个科室分配人员
      for (let j = 0; j < staffCount; j++) {
        const user = users[j % users.length]; // 循环使用用户
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
      
      totalAdded += staffCount;
      console.log(`✅ ${ward.name}: ${staffCount}人`);
    }
    
    // 批量插入数据
    console.log('\n💾 保存数据到数据库...');
    await db.wardStaff.bulkAdd(wardStaffData);
    
    // 更新病区统计数据
    console.log('📈 更新病区统计数据...');
    for (const ward of wards) {
      const wardStaff = wardStaffData.filter(s => s.wardId === ward.id);
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
    
    console.log(`\n🎉 完成！共为 ${wards.length} 个科室添加了 ${totalAdded} 个人员`);
    
    // 验证结果
    const finalStaffCount = await db.wardStaff.count();
    console.log(`📊 最终人员分配数: ${finalStaffCount}`);
    
    // 显示每个科室的最终统计
    console.log('\n📋 各科室最终人员统计:');
    console.log('=' .repeat(60));
    
    for (const ward of wards) {
      const staff = wardStaffData.filter(s => s.wardId === ward.id);
      const doctors = staff.filter(s => s.role === 'doctor').length;
      const nurses = staff.filter(s => s.role === 'nurse').length;
      const managers = staff.filter(s => s.role === 'manager').length;
      
      console.log(`${ward.name.padEnd(12)} | ${staff.length.toString().padStart(2)}人 | 医生${doctors}人, 护士${nurses}人, 管理员${managers}人`);
    }
    
    console.log('=' .repeat(60));
    console.log('✅ 所有科室人员数据添加完成！现在可以查看科室详情页面了。');
    
  } catch (error) {
    console.error('❌ 添加人员数据失败:', error);
  }
}

quickInitStaff();
