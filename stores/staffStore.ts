import { defineStore } from 'pinia';
import { db } from '~/api/db/database';
import type { User, UserStatus } from '~/types/models/user';

// 病区员工角色枚举
export enum WardStaffRole {
  NURSE = 'nurse',
  DOCTOR = 'doctor',
  MANAGER = 'manager'
}

// 病区员工模型
export interface WardStaff {
  id: number;
  wardId: number;
  userId: number;
  user?: User;
  role: WardStaffRole;
  shift: string;
  isActive: boolean;
  assignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const useStaffStore = defineStore('staff', {
  state: () => ({
    staff: [] as WardStaff[],
    users: [] as User[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    // 获取指定病区的员工
    getWardStaff: (state) => (wardId: number) => {
      console.log('getWardStaff called:', { wardId, staffCount: state.staff.length });
      return state.staff.filter(staff => staff.wardId === wardId);
    },

    // 获取指定病区的医生
    getWardDoctors: (state) => (wardId: number) => {
      return state.staff.filter(staff => 
        staff.wardId === wardId && staff.role === WardStaffRole.DOCTOR && staff.isActive
      );
    },

    // 获取指定病区的护士
    getWardNurses: (state) => (wardId: number) => {
      return state.staff.filter(staff => 
        staff.wardId === wardId && staff.role === WardStaffRole.NURSE && staff.isActive
      );
    },

    // 获取指定病区的管理人员
    getWardManagers: (state) => (wardId: number) => {
      return state.staff.filter(staff => 
        staff.wardId === wardId && staff.role === WardStaffRole.MANAGER && staff.isActive
      );
    },

    // 获取可分配的用户（未分配到该病区的用户）
    getAvailableUsers: (state) => (wardId: number) => {
      const assignedUserIds = state.staff
        .filter(staff => staff.wardId === wardId)
        .map(staff => staff.userId);
      
      return state.users.filter(user => 
        !assignedUserIds.includes(user.id) && user.status === 'active'
      );
    }
  },

  actions: {
    // 获取所有员工
    async fetchStaff(): Promise<WardStaff[]> {
      try {
        this.loading = true;
        this.error = null;
        
        const staff = await db.wardStaff.toArray();
        this.staff = staff;
        
        // 同时获取用户数据
        await this.fetchUsers();
        
        return staff;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取员工数据失败';
        console.error('获取员工数据失败:', error);
        return [];
      } finally {
        this.loading = false;
      }
    },

    // 获取所有用户
    async fetchUsers(): Promise<User[]> {
      try {
        const users = await db.users.toArray();
        this.users = users;
        return users;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取用户数据失败';
        console.error('获取用户数据失败:', error);
        return [];
      }
    },

    // 获取指定病区的员工
    async fetchWardStaff(wardId: number): Promise<WardStaff[]> {
      try {
        this.loading = true;
        this.error = null;
        
        const staff = await db.wardStaff.where('wardId').equals(wardId).toArray();
        
        // 获取用户信息
        await this.fetchUsers();
        
        // 关联用户信息
        const staffWithUsers = staff.map(staffMember => ({
          ...staffMember,
          user: this.users.find(user => user.id === staffMember.userId)
        }));
        
        // 更新本地状态
        this.staff = staffWithUsers;
        
        return staffWithUsers;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取病区员工失败';
        console.error('获取病区员工失败:', error);
        return [];
      } finally {
        this.loading = false;
      }
    },

    // 添加员工到病区
    async addStaffToWard(wardId: number, userId: number, role: WardStaffRole, shift: string = '白班'): Promise<boolean> {
      try {
        // 检查是否已经分配
        const existingStaff = await db.wardStaff
          .where(['wardId', 'userId'])
          .equals([wardId, userId])
          .first();
        
        if (existingStaff) {
          throw new Error('该用户已经分配到该病区');
        }

        const newStaff: Omit<WardStaff, 'id'> = {
          wardId,
          userId,
          role,
          shift,
          isActive: true,
          assignedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await db.wardStaff.add(newStaff);
        
        // 刷新数据
        await this.fetchWardStaff(wardId);
        
        return true;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '添加员工失败';
        console.error('添加员工失败:', error);
        return false;
      }
    },

    // 从病区移除员工
    async removeStaffFromWard(staffId: number): Promise<boolean> {
      try {
        await db.wardStaff.delete(staffId);
        
        // 刷新数据
        await this.fetchStaff();
        
        return true;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '移除员工失败';
        console.error('移除员工失败:', error);
        return false;
      }
    },

    // 更新员工信息
    async updateStaff(staffId: number, updates: Partial<WardStaff>): Promise<boolean> {
      try {
        const updateData = {
          ...updates,
          updatedAt: new Date()
        };
        
        await db.wardStaff.update(staffId, updateData);
        
        // 刷新数据
        await this.fetchStaff();
        
        return true;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新员工信息失败';
        console.error('更新员工信息失败:', error);
        return false;
      }
    },

    // 搜索员工
    async searchStaff(wardId: number, keyword: string): Promise<WardStaff[]> {
      try {
        const staff = await this.fetchWardStaff(wardId);
        
        if (!keyword.trim()) {
          return staff;
        }
        
        const lowerKeyword = keyword.toLowerCase();
        return staff.filter(staffMember => {
          const user = staffMember.user;
          if (!user) return false;
          
          return (
            user.name.toLowerCase().includes(lowerKeyword) ||
            user.username.toLowerCase().includes(lowerKeyword) ||
            user.department?.toLowerCase().includes(lowerKeyword) ||
            user.position?.toLowerCase().includes(lowerKeyword) ||
            staffMember.role.toLowerCase().includes(lowerKeyword) ||
            staffMember.shift.toLowerCase().includes(lowerKeyword)
          );
        });
      } catch (error) {
        this.error = error instanceof Error ? error.message : '搜索员工失败';
        console.error('搜索员工失败:', error);
        return [];
      }
    }
  }
});
