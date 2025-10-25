import { defineStore } from 'pinia';
import { db } from '~/api/db/database';
import type { Patient, PatientStatus } from '~/types/models/patient';

export const usePatientStore = defineStore('patient', {
  state: () => ({
    patients: [] as Patient[], // 分页显示的患者数据
    allPatients: [] as Patient[], // 全部患者数据，用于统计计算
    loading: false,
    error: null as string | null,
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    },
    filters: {
      status: [] as PatientStatus[],
      dateRange: null as { start: Date; end: Date } | null,
      keyword: ''
    }
  }),

  getters: {
    // 获取所有患者（用于显示）
    displayPatients: (state) => state.patients,
    
    // 获取过滤后的患者（基于全部数据）
    filteredPatients: (state) => {
      let filtered = state.allPatients;
      
      // 应用搜索过滤
      if (state.filters.keyword) {
        const keyword = state.filters.keyword.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(keyword) ||
          p.idCard.toLowerCase().includes(keyword) ||
          p.phone.includes(keyword)
        );
      }
      
      // 应用状态过滤
      if (state.filters.status.length > 0) {
        filtered = filtered.filter(p => state.filters.status.includes(p.status));
      }
      
      // 应用日期范围过滤
      if (state.filters.dateRange) {
        const { start, end } = state.filters.dateRange;
        filtered = filtered.filter(p => {
          const admissionDate = new Date(p.admissionDate);
          return admissionDate >= start && admissionDate <= end;
        });
      }
      
      return filtered;
    },
    
    // 获取在院患者（基于全部数据）
    admittedPatients: (state) => state.allPatients.filter(p => p.status === 'ADMITTED'),
    
    // 获取在院患者数量（基于全部数据）
    inPatientsCount: (state) => state.allPatients.filter(p => p.status === 'ADMITTED').length,
    
    // 获取今日入院患者（基于全部数据）
    todayAdmissions: (state) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return state.allPatients.filter(p => 
        p.status === 'ADMITTED' && 
        new Date(p.admissionDate) >= today
      );
    },
    
    // 获取今日入院患者数量（基于全部数据）
    todayAdmissionsCount: (state) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return state.allPatients.filter(p => 
        p.status === 'ADMITTED' && 
        new Date(p.admissionDate) >= today
      ).length;
    },
    
    // 获取今日出院患者（基于全部数据）
    todayDischarges: (state) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return state.allPatients.filter(p => 
        p.status === 'DISCHARGED' && 
        new Date(p.dischargeDate || 0) >= today
      );
    },
    
    // 获取患者统计（基于全部数据）
    patientStats: (state) => {
      const total = state.allPatients.length;
      const admitted = state.allPatients.filter(p => p.status === 'ADMITTED').length;
      const discharged = state.allPatients.filter(p => p.status === 'DISCHARGED').length;
      const transferred = state.allPatients.filter(p => p.status === 'TRANSFERRED').length;
      
      return {
        total,
        admitted,
        discharged,
        transferred,
        admissionRate: total > 0 ? Math.round((admitted / total) * 100) : 0
      };
    }
  },

  actions: {
    // 加载全部患者数据（用于统计计算）
    async loadAllPatients() {
      try {
        const patients = await db.patients.toArray();
        this.allPatients = Array.isArray(patients) ? patients : [];
        console.log('全部患者数据加载完成:', this.allPatients.length);
      } catch (error) {
        console.error('加载全部患者数据失败:', error);
        this.allPatients = [];
      }
    },

    // 获取患者数据（分页显示）
    async fetchPatients(params?: any): Promise<{ patients: Patient[]; pagination: any }> {
      try {
        this.loading = true;
        this.error = null;
        
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 20;
        
        // 构建数据库查询
        let query = db.patients.orderBy('id');
        
        // 应用搜索过滤
        if (this.filters.keyword) {
          const keyword = this.filters.keyword.toLowerCase();
          query = query.filter(patient => 
            patient.name.toLowerCase().includes(keyword) ||
            patient.idCard.toLowerCase().includes(keyword) ||
            patient.phone.includes(keyword)
          );
        }
        
        // 应用状态过滤
        if (this.filters.status.length > 0) {
          query = query.filter(patient => this.filters.status.includes(patient.status));
        }
        
        // 应用日期范围过滤
        if (this.filters.dateRange) {
          const { start, end } = this.filters.dateRange;
          query = query.filter(patient => {
            const admissionDate = new Date(patient.admissionDate);
            return admissionDate >= start && admissionDate <= end;
          });
        }
        
        // 获取总数
        const total = await query.count();
        
        // 分页查询
        const offset = (page - 1) * pageSize;
        const patients = await query.offset(offset).limit(pageSize).toArray();
        
        // 更新分页信息
        this.pagination.total = total;
        this.pagination.page = page;
        this.pagination.pageSize = pageSize;
        
        // 如果是第一页，替换数据；否则追加数据
        if (page === 1) {
          this.patients = patients;
        } else {
          this.patients = [...this.patients, ...patients];
        }
        
        // 返回结果
        return {
          patients: this.patients,
          pagination: this.pagination
        };
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取患者数据失败';
        console.error('获取患者数据失败:', error);
        this.patients = [];
        return {
          patients: [],
          pagination: this.pagination
        };
      } finally {
        this.loading = false;
      }
    },

    // 根据ID获取患者
    async getPatientById(id: number): Promise<Patient | null> {
      try {
        const patient = await db.patients.get(id);
        return patient || null;
      } catch (error) {
        console.error('获取患者详情失败:', error);
        return null;
      }
    },

    // 创建患者
    async createPatient(patientData: Omit<Patient, 'id'>): Promise<Patient | null> {
      try {
        const id = await db.patients.add(patientData);
        const newPatient = { ...patientData, id: id as number };
        this.patients.push(newPatient);
        return newPatient;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '创建患者失败';
        console.error('创建患者失败:', error);
        return null;
      }
    },

    // 更新患者
    async updatePatient(id: number, patientData: Partial<Patient>): Promise<boolean> {
      try {
        await db.patients.update(id, patientData);
        const index = this.patients.findIndex(p => p.id === id);
        if (index !== -1) {
          this.patients[index] = { ...this.patients[index], ...patientData };
        }
        return true;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新患者失败';
        console.error('更新患者失败:', error);
        return false;
      }
    },

    // 删除患者
    async deletePatient(id: number): Promise<boolean> {
      try {
        await db.patients.delete(id);
        this.patients = this.patients.filter(p => p.id !== id);
        return true;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '删除患者失败';
        console.error('删除患者失败:', error);
        return false;
      }
    },

    // 入院登记
    async admitPatient(patientData: Omit<Patient, 'id'>): Promise<Patient | null> {
      try {
        const admissionData = {
          ...patientData,
          status: 'ADMITTED' as PatientStatus,
          admissionDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return await this.createPatient(admissionData);
      } catch (error) {
        console.error('入院登记失败:', error);
        return null;
      }
    },

    // 出院登记
    async dischargePatient(id: number, dischargeData?: Partial<Patient>): Promise<boolean> {
      try {
        const updateData = {
          status: 'DISCHARGED' as PatientStatus,
          dischargeDate: new Date(),
          updatedAt: new Date(),
          ...dischargeData
        };
        return await this.updatePatient(id, updateData);
      } catch (error) {
        console.error('出院登记失败:', error);
        return false;
      }
    },

    // 转科
    async transferPatient(id: number, transferData: Partial<Patient>): Promise<boolean> {
      try {
        const updateData = {
          status: 'TRANSFERRED' as PatientStatus,
          updatedAt: new Date(),
          ...transferData
        };
        return await this.updatePatient(id, updateData);
      } catch (error) {
        console.error('转科失败:', error);
        return false;
      }
    },

    // 搜索患者
    async searchPatients(query: string): Promise<Patient[]> {
      try {
        const patients = await db.patients
          .where('name')
          .startsWithIgnoreCase(query)
          .or('idCard')
          .startsWithIgnoreCase(query)
          .or('phone')
          .startsWithIgnoreCase(query)
          .toArray();
        return patients;
      } catch (error) {
        console.error('搜索患者失败:', error);
        return [];
      }
    },

    // 根据状态筛选患者
    async getPatientsByStatus(status: PatientStatus): Promise<Patient[]> {
      try {
        const patients = await db.patients.where('status').equals(status).toArray();
        return patients;
      } catch (error) {
        console.error('根据状态获取患者失败:', error);
        return [];
      }
    },

    // 根据房间ID获取患者
    async fetchPatientsByRoomId(roomId: number): Promise<Patient[]> {
      try {
        const patients = await db.patients.where('roomId').equals(roomId).toArray();
        return patients;
      } catch (error) {
        console.error('根据房间ID获取患者失败:', error);
        return [];
      }
    },

    // 获取患者趋势数据
    async getPatientTrends(days: number = 7) {
      try {
        const patients = await db.patients.toArray();
        console.log('患者数据:', patients.length, '个患者');
        
        const trends = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          const nextDate = new Date(date);
          nextDate.setDate(date.getDate() + 1);
          
          const admissions = patients.filter(p => {
            if (!p.admissionDate) return false;
            const admissionDate = new Date(p.admissionDate);
            return admissionDate >= date && admissionDate < nextDate;
          }).length;
          
          const discharges = patients.filter(p => {
            if (!p.dischargeDate) return false;
            const dischargeDate = new Date(p.dischargeDate);
            return dischargeDate >= date && dischargeDate < nextDate;
          }).length;
          
          trends.push({
            date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
            admissions: admissions,
            discharges: discharges
          });
        }
        
        console.log('趋势数据:', trends);
        return trends;
      } catch (error) {
        console.error('获取患者趋势数据失败:', error);
        return [];
      }
    },

    // 设置过滤器
    setFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters };
    },
    
    // 设置搜索关键词
    setKeyword(keyword: string) {
      this.filters.keyword = keyword;
    },
    
    // 重置过滤器
    resetFilters() {
      this.filters = {
        status: [],
        dateRange: null,
        keyword: ''
      };
    },
    
    // 清空数据
    clearData() {
      this.patients = [];
      this.error = null;
    }
  }
});