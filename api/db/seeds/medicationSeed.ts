import { db } from '../database';

export async function seedMedicationRecords() {
  const patients = await db.patients.toArray();
  
  const medicationRecords = [];
  
  patients.forEach((patient, patientIndex) => {
    // 为每个患者生成最近7天的用药记录
    for (let day = 0; day < 7; day++) {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - day);
      
      // 每天1-3次用药
      const medicationCount = Math.floor(Math.random() * 3) + 1;
      
      for (let med = 0; med < medicationCount; med++) {
        const administeredAt = new Date(baseDate);
        administeredAt.setHours(8 + med * 6, Math.floor(Math.random() * 60), 0, 0);
        
        const medications = [
          { name: '硝苯地平缓释片', dosage: '30mg', unit: '片', frequency: '每日一次' },
          { name: '二甲双胍', dosage: '500mg', unit: '片', frequency: '每日两次' },
          { name: '阿莫西林', dosage: '500mg', unit: '粒', frequency: '每日三次' },
          { name: '头孢曲松', dosage: '1g', unit: '支', frequency: '每日两次' },
          { name: '阿司匹林', dosage: '100mg', unit: '片', frequency: '每日一次' },
          { name: '布洛芬', dosage: '400mg', unit: '片', frequency: '每日三次' },
          { name: '胰岛素', dosage: '10U', unit: '单位', frequency: '每日两次' },
          { name: '维生素C', dosage: '100mg', unit: '片', frequency: '每日一次' }
        ];
        
        const medication = medications[Math.floor(Math.random() * medications.length)];
        
        medicationRecords.push({
          id: medicationRecords.length + 1,
          patientId: patient.id as number,
          medicationName: medication.name,
          dosage: medication.dosage,
          unit: medication.unit,
          frequency: medication.frequency,
          administeredAt,
          administeredBy: '护士' + ((patientIndex + med) % 5 + 1),
          notes: `按时给药 - ${medication.name}`
        });
      }
    }
  });

  await db.medicationRecords.bulkPut(medicationRecords);
  return medicationRecords;
}

export async function seedMedicationReminders() {
  const patients = await db.patients.toArray();
  
  const reminders = [];
  
  patients.forEach((patient, patientIndex) => {
    // 为每个患者生成用药提醒
    const reminderCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < reminderCount; i++) {
      const reminderTime = new Date();
      reminderTime.setHours(8 + i * 6, 0, 0, 0);
      
      const medications = [
        '硝苯地平缓释片 30mg',
        '二甲双胍 500mg',
        '阿莫西林 500mg',
        '头孢曲松 1g',
        '阿司匹林 100mg',
        '布洛芬 400mg'
      ];
      
      const medication = medications[Math.floor(Math.random() * medications.length)];
      
      reminders.push({
        id: reminders.length + 1,
        patientId: patient.id as number,
        medicationRecordId: patientIndex * 3 + i + 1,
        medicationName: medication,
        reminderTime,
        status: Math.random() > 0.3 ? 'PENDING' : 'COMPLETED',
        notes: `用药提醒 - ${medication}`
      });
    }
  });

  await db.medicationReminders.bulkPut(reminders);
  return reminders;
}
