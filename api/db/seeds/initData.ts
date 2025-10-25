import { info } from 'autoprefixer';
import { db } from '~/api/db/database';
import type { Role, Permission } from '~/types/models/auth';
import { PermissionAction, PermissionType } from '~/types/models/auth';
import { UserStatus } from '~/types/models/user';
import { hashPassword } from '~/utils/auth';

export class InitDataService {
  // 初始化系统权限
  static async initializePermissions(): Promise<number[]> {
    const defaultPermissions: Omit<Permission, 'id'>[] = [
      // 患者管理权限
      {
        name: '查看患者列表',
        code: 'patients.view',
        resource: 'patients',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看患者列表和基本信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '创建患者档案',
        code: 'patients.create',
        resource: 'patients',
        action: PermissionAction.Create,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许创建新的患者档案',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '编辑患者信息',
        code: 'patients.edit',
        resource: 'patients',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许修改患者基本信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 病历管理权限
      {
        name: '查看病历',
        code: 'medical_records.view',
        resource: 'medical_records',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看患者病历',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '创建病历',
        code: 'medical_records.create',
        resource: 'medical_records',
        action: PermissionAction.Create,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许创建新的病历记录',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '编辑病历',
        code: 'medical_records.edit',
        resource: 'medical_records',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许修改病历内容',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 处方管理权限
      {
        name: '查看处方',
        code: 'prescriptions.view',
        resource: 'prescriptions',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看处方信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '开具处方',
        code: 'prescriptions.create',
        resource: 'prescriptions',
        action: PermissionAction.Create,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许开具新处方',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 预约管理权限
      {
        name: '查看预约',
        code: 'appointments.view',
        resource: 'appointments',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看预约信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '创建预约',
        code: 'appointments.create',
        resource: 'appointments',
        action: PermissionAction.Create,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许创建新预约',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '编辑预约',
        code: 'appointments.edit',
        resource: 'appointments',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许修改预约信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '删除预约',
        code: 'appointments.delete',
        resource: 'appointments',
        action: PermissionAction.Delete,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许删除预约记录',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 医嘱管理权限
      {
        name: '查看医嘱',
        code: 'orders.view',
        resource: 'orders',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看医嘱列表',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '创建医嘱',
        code: 'orders.create',
        resource: 'orders',
        action: PermissionAction.Create,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许开具新医嘱',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '编辑医嘱',
        code: 'orders.edit',
        resource: 'orders',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许修改医嘱内容',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '执行医嘱',
        code: 'orders.execute',
        resource: 'orders',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许执行医嘱',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '审核医嘱',
        code: 'orders.review',
        resource: 'orders',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许审核医嘱',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '删除医嘱',
        code: 'orders.delete',
        resource: 'orders',
        action: PermissionAction.Delete,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许删除医嘱',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 病区管理权限
      {
        name: '查看病区',
        code: 'wards.view',
        resource: 'wards',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看病区列表',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '创建病区',
        code: 'wards.create',
        resource: 'wards',
        action: PermissionAction.Create,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许创建新病区',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '编辑病区',
        code: 'wards.edit',
        resource: 'wards',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许修改病区信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '删除病区',
        code: 'wards.delete',
        resource: 'wards',
        action: PermissionAction.Delete,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许删除病区',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '管理床位',
        code: 'beds.manage',
        resource: 'beds',
        action: PermissionAction.Manage,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许管理床位分配',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 用户管理权限
      {
        name: '查看用户',
        code: 'users.view',
        resource: 'users',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看用户列表',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '创建用户',
        code: 'users.create',
        resource: 'users',
        action: PermissionAction.Create,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许创建新用户',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '编辑用户',
        code: 'users.edit',
        resource: 'users',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许修改用户信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '删除用户',
        code: 'users.delete',
        resource: 'users',
        action: PermissionAction.Delete,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许删除用户',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '重置密码',
        code: 'users.reset_password',
        resource: 'users',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许重置用户密码',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 角色管理权限
      {
        name: '查看角色',
        code: 'roles.view',
        resource: 'roles',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看角色列表',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '创建角色',
        code: 'roles.create',
        resource: 'roles',
        action: PermissionAction.Create,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许创建新角色',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '编辑角色',
        code: 'roles.edit',
        resource: 'roles',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许修改角色信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '删除角色',
        code: 'roles.delete',
        resource: 'roles',
        action: PermissionAction.Delete,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许删除角色',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '分配权限',
        code: 'roles.assign_permissions',
        resource: 'roles',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许为角色分配权限',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 权限管理权限
      {
        name: '查看权限',
        code: 'permissions.view',
        resource: 'permissions',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看权限列表',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '创建权限',
        code: 'permissions.create',
        resource: 'permissions',
        action: PermissionAction.Create,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许创建新权限',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '编辑权限',
        code: 'permissions.edit',
        resource: 'permissions',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许修改权限信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '删除权限',
        code: 'permissions.delete',
        resource: 'permissions',
        action: PermissionAction.Delete,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许删除权限',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 系统管理权限
      {
        name: '查看系统设置',
        code: 'system.settings',
        resource: 'system',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看系统设置',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '修改系统设置',
        code: 'system.settings.edit',
        resource: 'system',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许修改系统设置',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '查看系统日志',
        code: 'system.logs',
        resource: 'system',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看系统日志',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '数据备份',
        code: 'system.backup',
        resource: 'system',
        action: PermissionAction.Manage,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许执行数据备份',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '数据恢复',
        code: 'system.restore',
        resource: 'system',
        action: PermissionAction.Manage,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许执行数据恢复',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 护理管理权限
      {
        name: '查看护理记录',
        code: 'nursing.view',
        resource: 'nursing',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看护理记录',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '创建护理记录',
        code: 'nursing.create',
        resource: 'nursing',
        action: PermissionAction.Create,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许创建护理记录',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '编辑护理记录',
        code: 'nursing.edit',
        resource: 'nursing',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许修改护理记录',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 药品管理权限
      {
        name: '查看药品',
        code: 'medications.view',
        resource: 'medications',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看药品信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '管理药品',
        code: 'medications.manage',
        resource: 'medications',
        action: PermissionAction.Manage,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许管理药品库存',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 生命体征权限
      {
        name: '查看生命体征',
        code: 'vital_signs.view',
        resource: 'vital_signs',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看生命体征记录',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '记录生命体征',
        code: 'vital_signs.create',
        resource: 'vital_signs',
        action: PermissionAction.Create,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许记录生命体征',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 通知管理权限
      {
        name: '查看通知',
        code: 'notifications.view',
        resource: 'notifications',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看系统通知',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '发送通知',
        code: 'notifications.send',
        resource: 'notifications',
        action: PermissionAction.Create,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许发送系统通知',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 报表统计权限
      {
        name: '查看报表',
        code: 'reports.view',
        resource: 'reports',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看统计报表',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '导出报表',
        code: 'reports.export',
        resource: 'reports',
        action: PermissionAction.Read,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许导出报表数据',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 设备管理权限（简化）
      {
        name: '查看设备',
        code: 'equipment.view',
        resource: 'equipment',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看医疗设备信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '管理设备',
        code: 'equipment.manage',
        resource: 'equipment',
        action: PermissionAction.Manage,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许管理医疗设备',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 财务管理权限（简化）
      {
        name: '查看财务',
        code: 'finance.view',
        resource: 'finance',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看财务信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '管理收费',
        code: 'finance.billing',
        resource: 'finance',
        action: PermissionAction.Manage,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许管理收费项目',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 库存管理权限（简化）
      {
        name: '查看库存',
        code: 'inventory.view',
        resource: 'inventory',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看库存信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '管理库存',
        code: 'inventory.manage',
        resource: 'inventory',
        action: PermissionAction.Manage,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许管理库存',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 培训管理权限（简化）
      {
        name: '查看培训',
        code: 'training.view',
        resource: 'training',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看培训信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '管理培训',
        code: 'training.manage',
        resource: 'training',
        action: PermissionAction.Manage,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许管理培训课程',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 质控管理权限（简化）
      {
        name: '查看质控',
        code: 'quality.view',
        resource: 'quality',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看质量控制信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '质控检查',
        code: 'quality.inspect',
        resource: 'quality',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许进行质控检查',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 应急管理权限（简化）
      {
        name: '查看应急预案',
        code: 'emergency.view',
        resource: 'emergency',
        action: PermissionAction.Read,
        type: PermissionType.Menu,
        status: 'active',
        description: '允许查看应急预案',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '应急响应',
        code: 'emergency.response',
        resource: 'emergency',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许启动应急响应',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 数据管理权限（简化）
      {
        name: '数据导入',
        code: 'data.import',
        resource: 'data',
        action: PermissionAction.Create,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许导入数据',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '数据同步',
        code: 'data.sync',
        resource: 'data',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许同步数据',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 患者管理核心权限
      {
        name: '患者档案查看',
        code: 'patients.profile.view',
        resource: 'patients',
        action: PermissionAction.Read,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许查看患者详细档案信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '患者信息修改',
        code: 'patients.profile.edit',
        resource: 'patients',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许修改患者基本信息',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 医嘱管理核心权限
      {
        name: '医嘱执行',
        code: 'orders.execute',
        resource: 'orders',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许执行医嘱',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '医嘱修改',
        code: 'orders.modify',
        resource: 'orders',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许修改医嘱内容',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 病区管理核心权限
      {
        name: '病区床位分配',
        code: 'wards.beds.assign',
        resource: 'wards',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许分配病区床位',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 护理管理核心权限
      {
        name: '护理记录录入',
        code: 'nursing.records.create',
        resource: 'nursing',
        action: PermissionAction.Create,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许录入护理记录',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 药品管理核心权限
      {
        name: '药品库存查看',
        code: 'medications.inventory.view',
        resource: 'medications',
        action: PermissionAction.Read,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许查看药品库存',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '药品发放',
        code: 'medications.dispense',
        resource: 'medications',
        action: PermissionAction.Update,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许发放药品',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 生命体征核心权限
      {
        name: '生命体征录入',
        code: 'vital_signs.record',
        resource: 'vital_signs',
        action: PermissionAction.Create,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许录入生命体征数据',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 系统管理核心权限
      {
        name: '系统日志查看',
        code: 'system.logs.view',
        resource: 'system',
        action: PermissionAction.Read,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许查看系统日志',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '系统监控',
        code: 'system.monitoring',
        resource: 'system',
        action: PermissionAction.Read,
        type: PermissionType.Operation,
        status: 'active',
        description: '允许监控系统状态',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 特殊权限
      {
        name: '超级管理员权限',
        code: 'super.admin',
        resource: 'system',
        action: PermissionAction.Manage,
        type: PermissionType.Operation,
        status: 'active',
        description: '拥有系统所有权限（仅限超级管理员）',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '审计日志查看',
        code: 'audit.logs.view',
        resource: 'audit',
        action: PermissionAction.Read,
        type: PermissionType.Data,
        status: 'active',
        description: '允许查看系统审计日志',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // 批量插入权限并返回生成的ID数组
    const permissionIds = await db.transaction(
      'rw',
      db.permissions,
      async () => {
        return await db.permissions.bulkAdd(
          defaultPermissions as Permission[],
          {
            allKeys: true
          }
        );
      }
    );

    return permissionIds;
  }

  // 初始化系统角色
  static async initializeRoles(permissionIds: number[]): Promise<number[]> {
    const defaultRoles: Omit<Role, 'id'>[] = [
      {
        name: '系统管理员',
        code: 'admin',
        description: '系统最高权限管理员',
        level: 0,
        status: 'active',
        permissionIds: permissionIds, // 管理员拥有所有权限ID
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '主治医师',
        code: 'doctor',
        description: '主治医师角色，负责患者诊疗',
        level: 1,
        status: 'active',
        permissionIds: [
          // 患者管理权限
          permissionIds[0], // 查看患者列表
          permissionIds[1], // 创建患者档案
          permissionIds[2], // 编辑患者信息
          // 病历管理权限
          permissionIds[3], // 查看病历
          permissionIds[4], // 创建病历
          permissionIds[5], // 编辑病历
          // 医嘱管理权限
          permissionIds[10], // 查看医嘱
          permissionIds[11], // 创建医嘱
          permissionIds[12], // 编辑医嘱
          permissionIds[13], // 执行医嘱
          permissionIds[14], // 审核医嘱
          // 预约管理权限
          permissionIds[6], // 查看预约
          permissionIds[7], // 创建预约
          permissionIds[8], // 编辑预约
          // 生命体征权限
          permissionIds[28], // 查看生命体征
          permissionIds[29], // 记录生命体征
          // 通知权限
          permissionIds[30], // 查看通知
          permissionIds[31], // 发送通知
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '护士',
        code: 'nurse',
        description: '护士角色，负责患者护理',
        level: 2,
        status: 'active',
        permissionIds: [
          // 患者管理权限
          permissionIds[0], // 查看患者列表
          // 病历管理权限
          permissionIds[3], // 查看病历
          // 医嘱管理权限
          permissionIds[10], // 查看医嘱
          permissionIds[13], // 执行医嘱
          // 护理管理权限
          permissionIds[25], // 查看护理记录
          permissionIds[26], // 创建护理记录
          permissionIds[27], // 编辑护理记录
          // 生命体征权限
          permissionIds[28], // 查看生命体征
          permissionIds[29], // 记录生命体征
          // 通知权限
          permissionIds[30], // 查看通知
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '药剂师',
        code: 'pharmacist',
        description: '药剂师角色，负责药品管理',
        level: 2,
        status: 'active',
        permissionIds: [
          // 患者管理权限
          permissionIds[0], // 查看患者列表
          // 处方管理权限
          permissionIds[6], // 查看处方
          permissionIds[7], // 开具处方
          // 医嘱管理权限
          permissionIds[10], // 查看医嘱
          permissionIds[14], // 审核医嘱
          // 药品管理权限
          permissionIds[24], // 查看药品
          permissionIds[25], // 管理药品
          // 通知权限
          permissionIds[30], // 查看通知
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '病区管理员',
        code: 'ward_manager',
        description: '病区管理员角色，负责病区管理',
        level: 2,
        status: 'active',
        permissionIds: [
          // 患者管理权限
          permissionIds[0], // 查看患者列表
          permissionIds[1], // 创建患者档案
          permissionIds[2], // 编辑患者信息
          // 病区管理权限
          permissionIds[15], // 查看病区
          permissionIds[16], // 创建病区
          permissionIds[17], // 编辑病区
          permissionIds[19], // 管理床位
          // 预约管理权限
          permissionIds[6], // 查看预约
          permissionIds[7], // 创建预约
          permissionIds[8], // 编辑预约
          // 通知权限
          permissionIds[30], // 查看通知
          permissionIds[31], // 发送通知
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '系统操作员',
        code: 'operator',
        description: '系统操作员角色，负责系统维护',
        level: 3,
        status: 'active',
        permissionIds: [
          // 用户管理权限
          permissionIds[20], // 查看用户
          permissionIds[21], // 创建用户
          permissionIds[22], // 编辑用户
          permissionIds[24], // 重置密码
          // 角色管理权限
          permissionIds[25], // 查看角色
          permissionIds[26], // 创建角色
          permissionIds[27], // 编辑角色
          permissionIds[29], // 分配权限
          // 权限管理权限
          permissionIds[30], // 查看权限
          permissionIds[31], // 创建权限
          permissionIds[32], // 编辑权限
          // 系统管理权限
          permissionIds[33], // 查看系统设置
          permissionIds[35], // 查看系统日志
          // 通知权限
          permissionIds[30], // 查看通知
          permissionIds[31], // 发送通知
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    const allRoleIds = await db.transaction('rw', db.roles, async () => {
      return await db.roles.bulkAdd(defaultRoles as Role[], {
        allKeys: true
      });
    });

    return allRoleIds;
  }

  // 初始化默认用户角色
  static async initializeUserRoles(): Promise<void> {
    const defaultUserRoles = [
      {
        userId: 1, // 假设 ID 为 1 的用户是管理员
        roleId: 1,
        createdAt: new Date(),
        updatedBy: 1
      }
    ];
  }

  // 执行完整的初始化
  static async initialize(): Promise<void> {
    try {
      console.log('开始初始化系统数据...');
      
      // 检查权限是否已初始化
      const existingPermissions = await db.permissions.count();
      console.log(`当前权限数量: ${existingPermissions}`);
      
      if (existingPermissions === 0) {
        console.log('初始化权限数据...');
      // 初始化权限
      const permissionIds = await this.initializePermissions();
        console.log(`权限初始化完成，共 ${permissionIds.length} 个权限`);

      // 初始化角色
        console.log('初始化角色数据...');
      const roleIds = await this.initializeRoles(permissionIds);
        console.log(`角色初始化完成，共 ${roleIds.length} 个角色`);

      // 初始化管理员用户
        console.log('初始化管理员用户...');
      await this.initializeAdminUser(roleIds);
        console.log('管理员用户初始化完成');

      // 初始化病区人员数据
      console.log('初始化病区人员数据...');
      await this.initializeWardStaff();
      console.log('病区人员数据初始化完成');
      } else {
        console.log('权限数据已存在，跳过权限初始化');
      }
      
      console.log('系统数据初始化完成');
    } catch (error) {
      console.error('Failed to initialize system:', error);
      throw error;
    }
  }

  // 初始化管理员用户
  private static async initializeAdminUser(roleIds: number[]): Promise<void> {
    const adminUser = {
      id: 0,
      username: 'admin',
      password: await hashPassword('admin123'), // 实现密码加密
      name: '系统管理员',
      avatar: '/default-avatar.svg', // 添加默认头像
      roleIds: roleIds, // 分配所有角色
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date()
    };

    await db.users.add(adminUser);
  }

  // 初始化医生用户
  static async initializeDoctorUsers(): Promise<void> {
    const doctorUsers = [
      {
        id: 1,
        username: 'doctor1',
        password: await hashPassword('doctor123'),
        name: '张医生',
        avatar: '/default-avatar.svg',
        roleIds: [2], // 主治医师角色
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      },
      {
        id: 2,
        username: 'doctor2',
        password: await hashPassword('doctor123'),
        name: '李医生',
        avatar: '/default-avatar.svg',
        roleIds: [2],
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      },
      {
        id: 3,
        username: 'doctor3',
        password: await hashPassword('doctor123'),
        name: '王医生',
        avatar: '/default-avatar.svg',
        roleIds: [2],
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      },
      {
        id: 4,
        username: 'doctor4',
        password: await hashPassword('doctor123'),
        name: '陈医生',
        avatar: '/default-avatar.svg',
        roleIds: [2],
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      },
      {
        id: 5,
        username: 'doctor5',
        password: await hashPassword('doctor123'),
        name: '刘医生',
        avatar: '/default-avatar.svg',
        roleIds: [2],
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      },
      {
        id: 6,
        username: 'doctor6',
        password: await hashPassword('doctor123'),
        name: '赵医生',
        avatar: '/default-avatar.svg',
        roleIds: [2],
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      },
      {
        id: 7,
        username: 'doctor7',
        password: await hashPassword('doctor123'),
        name: '孙医生',
        avatar: '/default-avatar.svg',
        roleIds: [2],
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      },
      {
        id: 8,
        username: 'doctor8',
        password: await hashPassword('doctor123'),
        name: '周医生',
        avatar: '/default-avatar.svg',
        roleIds: [2],
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      }
    ];

    await db.users.bulkPut(doctorUsers);
  }

  // 初始化病区人员数据
  static async initializeWardStaff(): Promise<void> {
    try {
      // 检查是否已有数据
      const existingStaff = await db.wardStaff.count();
      if (existingStaff > 0) {
        console.log('病区人员数据已存在，跳过初始化');
        return;
      }

      // 获取所有用户和病区
      const users = await db.users.toArray();
      const wards = await db.wards.toArray();

      if (users.length === 0 || wards.length === 0) {
        console.log('用户或病区数据不存在，跳过病区人员初始化');
        return;
      }

      const wardStaffData: any[] = [];

      // 为每个病区分配人员，确保有足够的用户
      for (let i = 0; i < wards.length; i++) {
        const ward = wards[i];
        
        // 根据病区类型和规模分配不同数量的人员，最多10人
        let staffCount = 6; // 默认6个人员
        if (ward.name.includes('ICU') || ward.name.includes('CCU')) {
          staffCount = 10; // 重症监护科最多10人
        } else if (ward.name.includes('肿瘤') || ward.name.includes('康复')) {
          staffCount = 8; // 肿瘤科和康复科8人
        } else if (ward.name.includes('新生儿') || ward.name.includes('精神科')) {
          staffCount = 10; // 特殊科室最多10人
        } else if (ward.name.includes('心血管') || ward.name.includes('神经外科')) {
          staffCount = 8; // 重要科室8人
        } else {
          staffCount = 6; // 普通科室6人
        }
        
        // 确保不超过10人
        staffCount = Math.min(staffCount, 10);
        
        // 为每个病区分配人员
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
      }

      // 批量插入数据
      await db.wardStaff.bulkAdd(wardStaffData);
      console.log(`病区人员数据初始化完成，共 ${wardStaffData.length} 条记录`);

      // 更新病区统计数据
      await this.updateWardStaffStats();
    } catch (error) {
      console.error('初始化病区人员数据失败:', error);
      throw error;
    }
  }

  // 更新病区人员统计
  static async updateWardStaffStats(): Promise<void> {
    try {
      const wards = await db.wards.toArray();
      
      for (const ward of wards) {
        // 获取该病区的人员分配
        const wardStaffData = await db.wardStaff.where('wardId').equals(ward.id!).toArray();
        
        // 统计各角色人数
        const doctorCount = wardStaffData.filter(s => s.role === 'doctor' && s.isActive).length;
        const nurseCount = wardStaffData.filter(s => s.role === 'nurse' && s.isActive).length;
        const managerCount = wardStaffData.filter(s => s.role === 'manager' && s.isActive).length;
        const totalStaff = doctorCount + nurseCount + managerCount;
        
        // 更新病区统计
        await db.wards.update(ward.id, {
          doctorCount,
          nurseCount,
          totalStaff,
          updatedAt: new Date()
        });
      }
      
      console.log('病区人员统计更新完成');
    } catch (error) {
      console.error('更新病区人员统计失败:', error);
      throw error;
    }
  }
}
