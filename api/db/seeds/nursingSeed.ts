import { db } from '../database';

export async function seedNursingRecords() {
  const patients = await db.patients.toArray();
  
  const nursingRecords = [];
  
  patients.forEach((patient, patientIndex) => {
    // 为每个患者生成最近7天的护理记录
    for (let day = 0; day < 7; day++) {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - day);
      
      // 每天2-4次护理记录
      const recordCount = Math.floor(Math.random() * 3) + 2;
      
      for (let record = 0; record < recordCount; record++) {
        const performedAt = new Date(baseDate);
        performedAt.setHours(8 + record * 4, Math.floor(Math.random() * 60), 0, 0);
        
        const nursingTypes = [
          '生命体征监测',
          '药物给药',
          '伤口护理',
          '体位护理',
          '饮食护理',
          '心理护理',
          '康复训练',
          '健康教育'
        ];
        
        const nursingType = nursingTypes[Math.floor(Math.random() * nursingTypes.length)];
        
        const contents = [
          '患者生命体征平稳，意识清楚，配合治疗',
          '按时给药，患者无不良反应',
          '伤口愈合良好，无感染征象',
          '协助患者翻身，预防压疮',
          '患者食欲良好，按时进餐',
          '患者情绪稳定，积极配合治疗',
          '进行康复训练，患者配合度良好',
          '向患者及家属进行健康教育'
        ];
        
        const content = contents[Math.floor(Math.random() * contents.length)];
        
        nursingRecords.push({
          id: nursingRecords.length + 1,
          patientId: patient.id as number,
          type: nursingType,
          content,
          performedAt,
          performedBy: '护士' + ((patientIndex + record) % 5 + 1),
          notes: `护理记录 - ${nursingType}`
        });
      }
    }
  });

  await db.nursingRecords.bulkPut(nursingRecords);
  return nursingRecords;
}
