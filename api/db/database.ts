import Dexie, { type Table } from 'dexie';
import type { Session, User } from '~/types/models/user';
import type { Role, Permission } from '~/types/models/auth';
import type {
  Ward,
  Room,
  Bed,
  RoomEquipment,
  CleaningRecord,
  WardStaff,
  BedAssignment,
  BedRelease
} from '~/types/models/ward';
import type { OperationLogDetail } from '~/types/models/log';
import type { Patient } from '~/types/models/patient';
import type { MedicalRecord } from '~/types/models/medicalRecord';
import type { VitalSigns } from '~/types/models/vitalSigns';
import type { NursingRecord } from '~/types/models/nursing';
import type { MedicationRecord } from '~/types/models/medication';
import type { MedicationReminder } from '~/types/models/medicationReminder';
import type { Order, OrderExecution } from '~/types/models/order';
// 定义数据库类
class AppDatabase extends Dexie {
  users!: Table<User>;
  sessions!: Table<Session>;
  roles!: Table<Role>;
  permissions!: Table<Permission>;
  operationLogs!: Table<OperationLogDetail>;

  wards!: Table<Ward>;
  rooms!: Table<Room>;
  beds!: Table<Bed>;
  patients!: Table<Patient>;
  roomEquipment!: Table<RoomEquipment>;
  cleaningRecords!: Table<CleaningRecord>;
  wardStaff!: Table<WardStaff>;
  bedAssignments!: Table<BedAssignment>;
  bedReleases!: Table<BedRelease>;
  medicalRecords!: Table<MedicalRecord>;
  vitalSigns!: Table<VitalSigns>;
  nursingRecords!: Table<NursingRecord>;
  medicationRecords!: Table<MedicationRecord>;
  medicationReminders!: Table<MedicationReminder>;
  orders!: Table<Order>;
  orderExecutions!: Table<OrderExecution>;
  constructor() {
    super('hospital_app');

    // 版本2：完整的数据库结构定义（优化索引）
    this.version(2).stores({
      // 用户认证相关表
      users: '++id, username, roleIds, status, createdAt',
      sessions: '++id, userId, token, expiresAt, createdAt',
      roles: '++id, code, status, level, createdAt',
      permissions: '++id, code, type, resource, action, status, createdAt',
      operationLogs: '++id, userId, action, createdAt, [userId+createdAt]',

      // 病房管理相关表
      wards: '++id, code, department, status, createdAt, [department+status]',
      rooms: '++id, wardId, code, status, createdAt, [wardId+status]',
      beds: '++id, roomId, code, status, createdAt, [roomId+status]',
      patients: '++id, bedId, roomId, name, gender, age, status, admissionDate, [status+admissionDate], [bedId+status]',
      roomEquipment: '++id, roomId, code, status, createdAt, [roomId+status]',
      cleaningRecords: '++id, roomId, staffId, cleanedAt, [roomId+cleanedAt]',
      wardStaff: '++id, wardId, userId, role, isActive, [wardId+isActive]',
      bedAssignments: '++id, bedId, patientId, admissionDate, assignmentType, note, [bedId+admissionDate]',
      bedReleases: '++id, bedId, releasedAt, previousPatientId, [bedId+releasedAt]',
      medicalRecords: '++id, patientId, createdAt, [patientId+createdAt]',
      vitalSigns: '++id, patientId, recordedAt, [patientId+recordedAt]',
      nursingRecords: '++id, patientId, performedAt, [patientId+performedAt]',
      medicationRecords: '++id, patientId, administeredAt, [patientId+administeredAt]',
      medicationReminders: '++id, patientId, medicationRecordId, reminderTime, status, [patientId+status]',
      orders: '++id, patientId, type, status, createdAt, priority, doctorDepartment, [patientId+status], [type+status], [status+createdAt]',
      orderExecutions: '++id, orderId, executedAt, status, abnormal, executionTime, [orderId+executedAt]'
    });
  }
}

export const db = new AppDatabase();
