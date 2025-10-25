import { db } from '../database';

export async function seedVitalSigns() {
  const patients = await db.patients.toArray();
  
  const vitalSigns = [];
  
  patients.forEach((patient, patientIndex) => {
    // 为每个患者生成最近7天的生命体征数据
    for (let day = 0; day < 7; day++) {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - day);
      
      // 每天3次测量（早中晚）
      for (let time = 0; time < 3; time++) {
        const recordedAt = new Date(baseDate);
        recordedAt.setHours(8 + time * 6, Math.floor(Math.random() * 60), 0, 0);
        
        // 根据患者年龄和性别生成合理的生命体征数据
        const isMale = patient.gender === 'MALE';
        const age = patient.age || 40;
        
        // 血压（根据年龄调整）
        const systolicBase = isMale ? 120 : 110;
        const diastolicBase = isMale ? 80 : 75;
        const ageAdjustment = Math.max(0, (age - 40) * 0.5);
        
        const systolic = Math.round(systolicBase + ageAdjustment + (Math.random() - 0.5) * 20);
        const diastolic = Math.round(diastolicBase + ageAdjustment + (Math.random() - 0.5) * 15);
        
        // 心率（根据年龄调整）
        const heartRateBase = 70;
        const heartRate = Math.round(heartRateBase + (Math.random() - 0.5) * 20);
        
        // 体温
        const temperature = Math.round((36.5 + (Math.random() - 0.5) * 1.5) * 10) / 10;
        
        // 呼吸频率
        const respiratoryRate = Math.round(16 + (Math.random() - 0.5) * 8);
        
        // 血氧饱和度
        const oxygenSaturation = Math.round(95 + Math.random() * 5);
        
        // 体重（根据性别和年龄调整）
        const weightBase = isMale ? 70 : 60;
        const weight = Math.round(weightBase + (Math.random() - 0.5) * 20);
        
        vitalSigns.push({
          id: vitalSigns.length + 1,
          patientId: patient.id as number,
          systolic,
          diastolic,
          heartRate,
          temperature,
          respiratoryRate,
          oxygenSaturation,
          weight,
          recordedAt,
          recordedBy: '护士' + ((patientIndex + time) % 5 + 1),
          notes: time === 0 ? '晨间测量' : time === 1 ? '午间测量' : '晚间测量'
        });
      }
    }
  });

  await db.vitalSigns.bulkPut(vitalSigns);
  return vitalSigns;
}
