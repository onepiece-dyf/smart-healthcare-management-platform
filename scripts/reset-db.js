import { db } from '../api/db/database.js';

async function resetDatabase() {
  try {
    console.log('正在清空数据库...');
    
    // 清空所有表
    await db.transaction('rw', [db.users, db.roles, db.permissions], async () => {
      await db.users.clear();
      await db.roles.clear();
      await db.permissions.clear();
    });
    
    console.log('数据库已清空');
    console.log('请刷新浏览器页面以重新初始化数据');
  } catch (error) {
    console.error('重置数据库失败:', error);
  }
}

resetDatabase();
