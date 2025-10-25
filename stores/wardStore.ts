import { defineStore } from 'pinia';
import { db } from '~/api/db/database';
import type { Ward, Room, Bed, Patient } from '~/types/models/ward';
import type { WardStaff, WardStaffRole } from '~/stores/staffStore';

export const useWardStore = defineStore('ward', {
  state: () => ({
    wards: [] as Ward[],
    rooms: [] as Room[],
    beds: [] as Bed[],
    patients: [] as Patient[],
    currentWard: null as Ward | null,
    loading: false,
    error: null as string | null
  }),

  getters: {
    // 获取所有病区
    allWards: (state) => state.wards,
    
    // 获取当前病区
    selectedWard: (state) => state.currentWard,
    
    // 获取病区统计信息
    wardStats: (state) => {
      return state.wards.map(ward => {
        const wardRooms = state.rooms.filter(room => room.wardId === ward.id);
        const wardBeds = state.beds.filter(bed => wardRooms.some(room => room.id === bed.roomId));
        
        // 计算实际占用的床位（有在院患者且bedId匹配的床位）
        const occupiedBeds = wardBeds.filter(bed => {
          const patient = state.patients.find(patient => 
            patient.bedId === bed.id && patient.status === 'ADMITTED'
          );
          return !!patient;
        }).length;
        
        const totalBeds = wardBeds.length;
        const availableBeds = totalBeds - occupiedBeds;
        const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
        
        return {
          ...ward,
          totalRooms: wardRooms.length,
          totalBeds,
          occupiedBeds,
          availableBeds,
          occupancyRate
        };
      });
    },

    // 获取床位使用率
    bedOccupancyRate: (state) => {
      const totalBeds = state.beds.length;
      const occupiedBeds = state.patients.filter(patient => patient.status === 'ADMITTED').length;
      return totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    },

    // 获取病区选项
    wardOptions: (state) => {
      return state.wards.map(ward => ({
        text: `${ward.name} (${ward.department})`,
        value: ward.id
      }));
    },

    // 获取病区人员统计
    wardStaffStats: (state) => {
      return state.wards.map(ward => {
        // 这里需要从wardStaff表中获取实际数据
        // 暂时返回模拟数据
        return {
          ...ward,
          totalStaff: ward.totalStaff || 0,
          doctorCount: ward.doctorCount || 0,
          nurseCount: ward.nurseCount || 0
        };
      });
    }
  },

  actions: {
    // 获取所有病区
    async fetchWards(): Promise<Ward[]> {
      try {
        this.loading = true;
        this.error = null;
        
        const wards = await db.wards.toArray();
        this.wards = wards;
        
        // 同时获取房间、床位和患者数据
        await this.fetchRooms();
        await this.fetchBeds();
        await this.fetchPatients();
        
        // 调试信息
        console.log('病区数据加载完成:');
        console.log('病区数量:', this.wards.length);
        console.log('房间数量:', this.rooms.length);
        console.log('床位数量:', this.beds.length);
        console.log('患者数量:', this.patients.length);
        console.log('病区统计:', this.wardStats);
        
        return wards;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取病区数据失败';
        console.error('获取病区数据失败:', error);
        return [];
      } finally {
        this.loading = false;
      }
    },

    // 获取房间数据
    async fetchRooms(): Promise<Room[]> {
      try {
        const rooms = await db.rooms.toArray();
        this.rooms = rooms;
        return rooms;
      } catch (error) {
        console.error('获取房间数据失败:', error);
        return [];
      }
    },

    // 获取床位数据
    async fetchBeds(): Promise<Bed[]> {
      try {
        const beds = await db.beds.toArray();
        this.beds = beds;
        return beds;
      } catch (error) {
        console.error('获取床位数据失败:', error);
        return [];
      }
    },

    // 获取病区数据（分页）
    async fetchWardsPage(page = 1, pageSize = 20, searchKeyword = '') {
      try {
        this.loading = true;
        this.error = null;
        
        // 构建查询
        let query = db.wards.orderBy('id');
        
        // 应用搜索过滤
        if (searchKeyword) {
          const keyword = searchKeyword.toLowerCase();
          query = query.filter(ward => 
            ward.name.toLowerCase().includes(keyword) ||
            ward.code.toLowerCase().includes(keyword) ||
            ward.department.toLowerCase().includes(keyword)
          );
        }
        
        // 获取总数
        const total = await query.count();
        
        // 分页查询
        const offset = (page - 1) * pageSize;
        const wards = await query.offset(offset).limit(pageSize).toArray();
        
        // 如果是第一页，替换数据；否则追加数据
        if (page === 1) {
          this.wards = wards;
        } else {
          this.wards = [...this.wards, ...wards];
        }
        
        return {
          wards: this.wards,
          pagination: {
            page,
            pageSize,
            total,
            hasMore: page * pageSize < total
          }
        };
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取病区数据失败';
        console.error('获取病区数据失败:', error);
        return {
          wards: [],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 0,
            hasMore: false
          }
        };
      } finally {
        this.loading = false;
      }
    },

    // 获取患者数据
    async fetchPatients(): Promise<Patient[]> {
      try {
        const patients = await db.patients.toArray();
        this.patients = patients;
        return patients;
      } catch (error) {
        console.error('获取患者数据失败:', error);
        return [];
      }
    },

    // 根据ID获取病区
    async getWardById(id: number): Promise<Ward | null> {
      try {
        const ward = await db.wards.get(id);
        return ward || null;
      } catch (error) {
        console.error('获取病区详情失败:', error);
        return null;
      }
    },

    // 获取病区详情（包含统计信息）
    async fetchWardById(id: number): Promise<Ward | null> {
      try {
        this.loading = true;
        this.error = null;
        
        const ward = await db.wards.get(id);
        if (!ward) return null;
        
        // 获取相关数据
        await this.fetchRooms();
        await this.fetchBeds();
        await this.fetchPatients();
        
        // 更新当前病区
        this.currentWard = ward;
        
        return ward;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取病区详情失败';
        console.error('获取病区详情失败:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    // 获取所有病区（别名方法）
    async fetchAllWards(): Promise<Ward[]> {
      return this.fetchWards();
    },

    // 创建病区
    async createWard(wardData: Omit<Ward, 'id'>): Promise<Ward | null> {
      try {
        const id = await db.wards.add(wardData);
        const newWard = { ...wardData, id: id as number };
        this.wards.push(newWard);
        return newWard;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '创建病区失败';
        console.error('创建病区失败:', error);
        return null;
      }
    },

    // 更新病区
    async updateWard(id: number, wardData: Partial<Ward>): Promise<boolean> {
      try {
        await db.wards.update(id, wardData);
        const index = this.wards.findIndex(ward => ward.id === id);
        if (index !== -1) {
          this.wards[index] = { ...this.wards[index], ...wardData };
        }
        return true;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新病区失败';
        console.error('更新病区失败:', error);
        return false;
      }
    },

    // 删除病区
    async deleteWard(id: number): Promise<boolean> {
      try {
        await db.wards.delete(id);
        this.wards = this.wards.filter(ward => ward.id !== id);
        return true;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '删除病区失败';
        console.error('删除病区失败:', error);
        return false;
      }
    },

    // 获取病区床位详情
    async getWardBedDetails(wardId: number) {
      try {
        const ward = await this.getWardById(wardId);
        if (!ward) return null;

        const rooms = await db.rooms.where('wardId').equals(wardId).toArray();
        const beds = await db.beds.where('roomId').anyOf(rooms.map(r => r.id)).toArray();
        const patients = await db.patients.where('bedId').anyOf(beds.map(b => b.id)).toArray();

        return {
          ward,
          rooms: rooms.map(room => ({
            ...room,
            beds: beds.filter(bed => bed.roomId === room.id).map(bed => ({
              ...bed,
              patient: patients.find(p => p.bedId === bed.id) || null
            }))
          }))
        };
      } catch (error) {
        console.error('获取病区床位详情失败:', error);
        return null;
      }
    },

    // 分配床位
    async assignBed(patientId: number, bedId: number): Promise<boolean> {
      try {
        await db.patients.update(patientId, { bedId });
        const patient = this.patients.find(p => p.id === patientId);
        if (patient) {
          patient.bedId = bedId;
        }
        return true;
      } catch (error) {
        console.error('分配床位失败:', error);
        return false;
      }
    },

    // 释放床位
    async releaseBed(patientId: number): Promise<boolean> {
      try {
        await db.patients.update(patientId, { bedId: null });
        const patient = this.patients.find(p => p.id === patientId);
        if (patient) {
          patient.bedId = null;
        }
        return true;
      } catch (error) {
        console.error('释放床位失败:', error);
        return false;
      }
    },

    // 清空数据
    clearData() {
      this.wards = [];
      this.rooms = [];
      this.beds = [];
      this.patients = [];
      this.error = null;
    }
  }
});