import { db } from '../database';
import { OrderType, OrderStatus } from '~/types/models/order';

export async function seedOrders() {
  const patients = await db.patients.toArray();
  
  // 医生信息
  const doctors = [
    { id: 1, name: '张医生', department: '心血管内科' },
    { id: 2, name: '李医生', department: '内分泌科' },
    { id: 3, name: '王医生', department: '呼吸内科' },
    { id: 4, name: '陈医生', department: '消化内科' },
    { id: 5, name: '刘医生', department: '神经内科' },
    { id: 6, name: '赵医生', department: '骨科' },
    { id: 7, name: '孙医生', department: '泌尿外科' },
    { id: 8, name: '周医生', department: '妇产科' },
    { id: 9, name: '吴医生', department: '儿科' },
    { id: 10, name: '郑医生', department: '急诊科' }
  ];

  // 医嘱内容模板
  const longTermOrders = [
    // 心血管药物
    '硝苯地平缓释片 30mg 口服 每日一次',
    '美托洛尔 25mg 口服 每日两次',
    '阿司匹林 100mg 口服 每日一次',
    '氯沙坦 50mg 口服 每日一次',
    '氨氯地平 5mg 口服 每日一次',
    '依那普利 10mg 口服 每日两次',
    '华法林 2.5mg 口服 每日一次',
    '地高辛 0.25mg 口服 每日一次',
    
    // 内分泌药物
    '二甲双胍 500mg 口服 每日两次',
    '格列齐特 80mg 口服 每日两次',
    '胰岛素 10U 皮下注射 每日三次',
    '阿卡波糖 50mg 口服 每日三次',
    '西格列汀 100mg 口服 每日一次',
    '格列美脲 2mg 口服 每日一次',
    
    // 呼吸系统药物
    '氨茶碱 0.1g 口服 每日三次',
    '沙丁胺醇 2.5mg 雾化吸入 每日三次',
    '布地奈德 200μg 雾化吸入 每日两次',
    '孟鲁司特 10mg 口服 每日一次',
    '茶碱缓释片 0.2g 口服 每日两次',
    
    // 消化系统药物
    '奥美拉唑 20mg 口服 每日一次',
    '雷贝拉唑 10mg 口服 每日一次',
    '多潘立酮 10mg 口服 每日三次',
    '蒙脱石散 3g 口服 每日三次',
    '双歧杆菌 2g 口服 每日两次',
    
    // 神经系统药物
    '卡马西平 0.2g 口服 每日两次',
    '苯妥英钠 0.1g 口服 每日三次',
    '多奈哌齐 5mg 口服 每日一次',
    '美金刚 10mg 口服 每日一次',
    
    // 监测项目
    '血压监测 每日三次',
    '血糖监测 每日四次',
    '体温监测 每日两次',
    '心率监测 持续',
    '血氧饱和度监测 每日两次',
    '体重监测 每日一次',
    '尿量监测 每日记录',
    '出入量监测 每日记录'
  ];

  const temporaryOrders = [
    // 检查项目
    '心电图检查 立即执行',
    '胸部X光检查 立即执行',
    '腹部B超检查 立即执行',
    '心脏彩超检查 立即执行',
    'CT检查 立即执行',
    'MRI检查 立即执行',
    '胃镜检查 立即执行',
    '肠镜检查 立即执行',
    '支气管镜检查 立即执行',
    '膀胱镜检查 立即执行',
    
    // 实验室检查
    '血常规检查 立即执行',
    '尿常规检查 立即执行',
    '生化全套检查 立即执行',
    '凝血功能检查 立即执行',
    '血气分析 立即执行',
    '肿瘤标志物检查 立即执行',
    '甲状腺功能检查 立即执行',
    '肝功能检查 立即执行',
    '肾功能检查 立即执行',
    '心肌酶谱检查 立即执行',
    
    // 特殊治疗
    '物理降温 立即执行',
    '吸氧治疗 立即执行',
    '雾化吸入 立即执行',
    '静脉输液 立即执行',
    '肌肉注射 立即执行',
    '皮下注射 立即执行',
    '换药处理 立即执行',
    '导尿术 立即执行',
    '灌肠治疗 立即执行',
    '鼻饲护理 立即执行'
  ];

  const frequencies = ['每日一次', '每日两次', '每日三次', '每日四次', '每12小时一次', '每8小时一次', '每6小时一次', '立即执行', '按需服用'];
  const statuses = [OrderStatus.PENDING, OrderStatus.APPROVED, OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REJECTED];

  const orders: any[] = [];
  let orderId = 1;

  // 生成长期医嘱 (200条)
  for (let i = 0; i < 200; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    const content = longTermOrders[Math.floor(Math.random() * longTermOrders.length)];
    const frequency = frequencies[Math.floor(Math.random() * 7)]; // 不包括"立即执行"
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 30)); // 过去30天内
    startTime.setHours(8 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
    
    const createdAt = new Date(startTime);
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000);

    orders.push({
      id: orderId++,
      patientId: patient.id,
      type: OrderType.LONG_TERM,
      content,
      status,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorDepartment: doctor.department,
      frequency,
      startTime,
      createdAt,
      updatedAt,
      priority: Math.random() > 0.8 ? 'HIGH' : Math.random() > 0.5 ? 'MEDIUM' : 'LOW',
      notes: status === OrderStatus.COMPLETED ? '医嘱执行完成' : status === OrderStatus.REJECTED ? '医嘱被拒绝' : ''
    });
  }

  // 生成临时医嘱 (150条)
  for (let i = 0; i < 150; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    const content = temporaryOrders[Math.floor(Math.random() * temporaryOrders.length)];
    const status = Math.random() > 0.3 ? OrderStatus.COMPLETED : OrderStatus.PENDING; // 70%已完成
    
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 7)); // 过去7天内
    startTime.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);
    
    const createdAt = new Date(startTime);
    const updatedAt = status === OrderStatus.COMPLETED 
      ? new Date(createdAt.getTime() + Math.random() * 2 * 60 * 60 * 1000) // 2小时内完成
      : createdAt;

    orders.push({
      id: orderId++,
      patientId: patient.id,
      type: OrderType.TEMPORARY,
      content,
      status,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorDepartment: doctor.department,
      frequency: '立即执行',
      startTime,
      createdAt,
      updatedAt,
      priority: Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.4 ? 'MEDIUM' : 'LOW',
      notes: status === OrderStatus.COMPLETED ? '检查/治疗已完成' : '等待执行'
    });
  }

  await db.orders.bulkPut(orders);
  return orders;
}

export async function seedOrderExecutions() {
  const orders = await db.orders.toArray();
  
  const executions: any[] = [];
  
  // 为已完成的医嘱创建执行记录
  orders.filter(order => order.status === OrderStatus.COMPLETED).forEach((order, index) => {
    if (order.createdAt) {
      executions.push({
        id: index + 1,
        orderId: order.id as number,
        executedAt: new Date(order.createdAt.getTime() + 30 * 60 * 1000), // 30分钟后执行
        status: 'COMPLETED',
        abnormal: false,
        executionTime: new Date(order.createdAt.getTime() + 30 * 60 * 1000),
        executorName: '护士' + (index % 3 + 1),
        notes: '医嘱执行完成'
      });
    }
  });

  await db.orderExecutions.bulkPut(executions);
  return executions;
}
