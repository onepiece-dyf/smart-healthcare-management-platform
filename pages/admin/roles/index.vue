<template>
  <div class="role-management">
    <HeroHeader title="角色管理" subtitle="系统角色配置与权限分配" :showDate="true" />
    
    <!-- 统计卡片 -->
    <div class="px-4 py-3">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="stat-card">
          <div class="stat-icon bg-blue-100 text-blue-600">
            <van-icon name="manager-o" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-label">总角色数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-green-100 text-green-600">
            <van-icon name="success" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.active }}</div>
            <div class="stat-label">启用角色</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-orange-100 text-orange-600">
            <van-icon name="warning-o" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.inactive }}</div>
            <div class="stat-label">禁用角色</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-purple-100 text-purple-600">
            <van-icon name="shield-o" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.permissions }}</div>
            <div class="stat-label">权限总数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div class="flex items-center p-3 gap-2">
        <van-search
          v-model="searchText"
          placeholder="搜索角色名称、描述"
          @search="handleSearch"
          @clear="handleClearSearch"
          class="flex-1" />
        <van-button 
          icon="filter-o" 
          @click="showFilter = true"
          :class="hasActiveFilters ? 'bg-primary text-white' : ''">
          筛选
        </van-button>
        <van-button 
          icon="refresh" 
          @click="onRefresh"
          :loading="loading">
          刷新
        </van-button>
      </div>
      
      <!-- 快速筛选标签 -->
      <div v-if="quickFilters.length > 0" class="px-3 pb-2">
        <div class="flex flex-wrap gap-2">
          <van-tag
            v-for="filter in quickFilters"
            :key="filter.key"
            :type="filter.active ? 'primary' : 'default'"
            @click="toggleQuickFilter(filter)"
            class="cursor-pointer">
            {{ filter.label }}
          </van-tag>
        </div>
      </div>
    </div>

    <van-list v-model:loading="loading" :finished="finished" @load="onLoad" class="role-list">
      <div v-for="role in filteredRoles" :key="role.id" class="role-card">
        <van-cell-group inset>
          <van-cell>
            <template #title>
              <div class="role-header">
                <div class="role-info">
                  <h3 class="role-name">{{ role.name }}</h3>
                  <p class="role-description">{{ role.description || '暂无描述' }}</p>
                </div>
                <div class="role-status">
                  <van-tag 
                    :type="role.status === 'active' ? 'success' : 'warning'" 
                    size="medium">
                    {{ role.status === "active" ? "启用" : "禁用" }}
                  </van-tag>
                </div>
              </div>
            </template>
            
            <template #label>
              <div class="role-meta">
                <div class="role-details">
                  <span class="role-code">编码：{{ role.code }}</span>
                  <span class="role-level">级别：{{ role.level }}</span>
                </div>
                <div class="role-permissions">
                  <van-icon name="shield-o" class="permission-icon" />
                  <span>{{ getRolePermissionCount(role) }} 个权限</span>
                </div>
              </div>
            </template>
          </van-cell>
          
          <van-cell>
            <template #value>
              <div class="role-actions">
                <van-button
                  plain
                  type="primary"
                  size="small"
                  icon="setting-o"
                  @click="navigateToPermissions(role.id)">
                  权限配置
                </van-button>
                <van-button 
                  plain
                  :type="role.status === 'active' ? 'warning' : 'success'"
                  size="small"
                  :icon="role.status === 'active' ? 'pause' : 'play'"
                  @click="toggleRoleStatus(role)">
                  {{ role.status === 'active' ? '禁用' : '启用' }}
                </van-button>
                <van-button 
                  plain
                  type="primary" 
                  size="small" 
                  icon="edit" 
                  @click="editRole(role)">
                  编辑
                </van-button>
                <van-button
                  plain
                  type="danger"
                  size="small"
                  icon="delete-o"
                  @click="confirmDelete(role.id)">
                  删除
                </van-button>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </van-list>

    <!-- 高级筛选器 -->
    <van-popup v-model:show="showFilter" position="bottom" :style="{ height: '60%' }">
      <div class="filter-popup">
        <div class="filter-header">
          <h3 class="filter-title">高级筛选</h3>
          <van-icon name="cross" @click="showFilter = false" class="filter-close" />
        </div>
        
        <div class="filter-content">
          <!-- 状态筛选 -->
          <div class="filter-section">
            <h4 class="filter-section-title">角色状态</h4>
            <van-radio-group v-model="filters.status">
              <van-radio name="all">全部</van-radio>
              <van-radio name="active">启用</van-radio>
              <van-radio name="inactive">禁用</van-radio>
            </van-radio-group>
          </div>

          <!-- 级别筛选 -->
          <div class="filter-section">
            <h4 class="filter-section-title">角色级别</h4>
            <van-checkbox-group v-model="filters.levels">
              <div class="filter-options">
                <van-checkbox name="1" class="filter-option">1级</van-checkbox>
                <van-checkbox name="2" class="filter-option">2级</van-checkbox>
                <van-checkbox name="3" class="filter-option">3级</van-checkbox>
                <van-checkbox name="4" class="filter-option">4级</van-checkbox>
                <van-checkbox name="5" class="filter-option">5级</van-checkbox>
              </div>
            </van-checkbox-group>
          </div>

          <!-- 权限数量筛选 -->
          <div class="filter-section">
            <h4 class="filter-section-title">权限数量</h4>
            <van-radio-group v-model="filters.permissionCount">
              <van-radio name="all">全部</van-radio>
              <van-radio name="0">无权限</van-radio>
              <van-radio name="1-10">1-10个</van-radio>
              <van-radio name="11-50">11-50个</van-radio>
              <van-radio name="50+">50个以上</van-radio>
            </van-radio-group>
          </div>
        </div>

        <div class="filter-actions">
          <van-button 
            plain 
            type="primary" 
            size="large" 
            @click="resetFilter"
            class="flex-1">
            重置
          </van-button>
          <van-button 
            type="primary" 
            size="large" 
            @click="applyFilter"
            class="flex-1">
            应用筛选
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 角色表单弹窗 -->
    <van-dialog
      v-model:show="showRoleDialog"
      :title="editingRole ? '编辑角色' : '新增角色'"
      show-cancel-button
      @confirm="saveRole"
      @cancel="resetForm">
      <van-form>
        <van-cell-group inset>
          <van-field
            v-model="currentRole.name"
            label="角色名称"
            placeholder="请输入角色名称"
            :rules="[{ required: true, message: '请输入角色名称' }]" />
          <van-field
            v-model="currentRole.code"
            label="角色编码"
            placeholder="请输入角色编码"
            :rules="[{ required: true, message: '请输入角色编码' }]" />
          <van-field
            v-model="currentRole.description"
            label="角色描述"
            type="textarea"
            placeholder="请输入角色描述"
            rows="2"
            autosize />
          <van-field
            v-model.number="currentRole.level"
            label="角色级别"
            type="digit"
            :rules="[{ required: true, message: '请输入角色级别' }]" />
          <van-field name="status" label="状态">
            <template #input>
              <van-switch
                v-model="currentRole.status"
                :active-value="'active'"
                :inactive-value="'inactive'" />
            </template>
          </van-field>
        </van-cell-group>
      </van-form>
    </van-dialog>

    <!-- 悬浮按钮组 -->
    <FloatingButtonGroup>
      <van-button icon="plus" type="primary" round @click="showRoleDialog = true">
        新增角色
      </van-button>
      <van-button icon="lock" type="success" round @click="router.push('/admin/permissions')">
        权限管理
      </van-button>
      <van-button icon="download" type="warning" round @click="exportRoles">
        导出角色
      </van-button>
    </FloatingButtonGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showToast, showDialog } from "vant";
import { useRoleStore } from "~/stores/role";
import type { Role } from "~/types/models/auth";
import { formatDate } from "~/utils/date";
import FloatingButtonGroup from "~/components/common/FloatingButtonGroup.vue";

const router = useRouter();
const roleStore = useRoleStore();

const roles = ref<Role[]>([]);
const loading = ref(false);
const finished = ref(false);
const showRoleDialog = ref(false);
const showFilter = ref(false);
const editingRole = ref<Role | null>(null);
const currentRole = reactive<Partial<Role>>({
  name: "",
  code: "",
  description: "",
  level: 0,
  status: "active",
  permissionIds: []
});

// 搜索和筛选
const searchText = ref("");

// 筛选条件
const filters = ref({
  status: 'all',
  levels: [] as string[],
  permissionCount: 'all'
});

// 快速筛选标签
const quickFilters = ref([
  { key: 'active', label: '启用角色', active: false },
  { key: 'inactive', label: '禁用角色', active: false },
  { key: 'high-level', label: '高级角色', active: false },
  { key: 'low-permissions', label: '权限较少', active: false }
]);

// 统计数据
const statistics = computed(() => {
  const allRoles = roles.value;
  return {
    total: allRoles.length,
    active: allRoles.filter(r => r.status === 'active').length,
    inactive: allRoles.filter(r => r.status === 'inactive').length,
    permissions: roleStore.permissions.length
  };
});

// 是否有活跃筛选条件
const hasActiveFilters = computed(() => {
  return filters.value.status !== 'all' ||
         filters.value.levels.length > 0 ||
         filters.value.permissionCount !== 'all' ||
         quickFilters.value.some(f => f.active);
});

// 过滤后的角色列表
const filteredRoles = computed(() => {
  return roles.value.filter((role) => {
    // 搜索匹配
    const matchesSearch = searchText.value === "" ||
      role.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(searchText.value.toLowerCase())) ||
      role.code.toLowerCase().includes(searchText.value.toLowerCase());

    // 状态匹配
    const matchesStatus = filters.value.status === 'all' || 
                         role.status === filters.value.status;

    // 级别匹配
    const matchesLevels = filters.value.levels.length === 0 || 
                         filters.value.levels.includes(role.level.toString());

    // 权限数量匹配
    const permissionCount = getRolePermissionCount(role);
    const matchesPermissionCount = filters.value.permissionCount === 'all' ||
      (filters.value.permissionCount === '0' && permissionCount === 0) ||
      (filters.value.permissionCount === '1-10' && permissionCount >= 1 && permissionCount <= 10) ||
      (filters.value.permissionCount === '11-50' && permissionCount >= 11 && permissionCount <= 50) ||
      (filters.value.permissionCount === '50+' && permissionCount > 50);

    // 快速筛选匹配
    const matchesQuickFilter = !quickFilters.value.some(f => f.active) || 
      (quickFilters.value.find(f => f.key === 'active' && f.active) && role.status === 'active') ||
      (quickFilters.value.find(f => f.key === 'inactive' && f.active) && role.status === 'inactive') ||
      (quickFilters.value.find(f => f.key === 'high-level' && f.active) && role.level >= 4) ||
      (quickFilters.value.find(f => f.key === 'low-permissions' && f.active) && permissionCount <= 5);

    return matchesSearch && matchesStatus && matchesLevels && 
           matchesPermissionCount && matchesQuickFilter;
  });
});

// 获取角色权限数量
const getRolePermissionCount = (role: Role): number => {
  return role.permissionIds?.length || 0;
};

// 加载角色列表
const onLoad = async () => {
  if (!loading.value) {
    loading.value = true;
    try {
      await roleStore.loadRoles();
      roles.value = roleStore.roles;
      finished.value = true;
    } catch (error) {
      showToast("加载失败");
    } finally {
      loading.value = false;
    }
  }
};

// 编辑角色
const editRole = (role: Role) => {
  editingRole.value = role;
  Object.assign(currentRole, role);
  showRoleDialog.value = true;
};

// 保存角色
const saveRole = async () => {
  try {
    const roleData = {
      name: currentRole.name,
      code: currentRole.code,
      description: currentRole.description,
      level: Number(currentRole.level),
      status: currentRole.status,
      permissionIds: [...(currentRole.permissionIds || [])]
    };
    if (editingRole.value) {
      await roleStore.updateRole(editingRole.value.id, roleData);
    } else {
      await roleStore.createRole(roleData as Role);
    }
    showRoleDialog.value = false;
    resetForm();
    showToast("保存成功");
    roles.value = [];
    finished.value = false;
    onLoad();
  } catch (error) {
    showToast("保存失败");
  }
};

// 确认删除
const confirmDelete = (id: number) => {
  showDialog({
    title: "确认删除",
    message: "确定要删除该角色吗？",
    showCancelButton: true
  }).then(async () => {
    try {
      await roleStore.deleteRole(id);
      showToast("删除成功");
      roles.value = roles.value.filter((r) => r.id !== id);
    } catch (error) {
      showToast("删除失败");
    }
  });
};

// 刷新
const onRefresh = async () => {
  finished.value = false;
  await onLoad();
};

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑在computed中处理
};

// 清除搜索
const handleClearSearch = () => {
  searchText.value = '';
};

// 切换快速筛选
const toggleQuickFilter = (filter: any) => {
  filter.active = !filter.active;
  // 如果激活了其他快速筛选，取消其他筛选
  if (filter.active) {
    quickFilters.value.forEach(f => {
      if (f.key !== filter.key) {
        f.active = false;
      }
    });
  }
};

// 应用筛选
const applyFilter = () => {
  showFilter.value = false;
};

// 重置筛选
const resetFilter = () => {
  filters.value = {
    status: 'all',
    levels: [],
    permissionCount: 'all'
  };
  quickFilters.value.forEach(f => f.active = false);
  showFilter.value = false;
};

// 切换角色状态
const toggleRoleStatus = async (role: Role) => {
  try {
    const newStatus = role.status === 'active' ? 'inactive' : 'active';
    await roleStore.updateRole(role.id, { status: newStatus });
    showToast(`${newStatus === 'active' ? '启用' : '禁用'}成功`);
    // 更新本地状态
    const index = roles.value.findIndex(r => r.id === role.id);
    if (index !== -1) {
      roles.value[index].status = newStatus;
    }
  } catch (error) {
    showToast("操作失败");
  }
};

// 导出角色
const exportRoles = () => {
  const data = filteredRoles.value.map(r => ({
    角色名称: r.name,
    角色编码: r.code,
    角色描述: r.description || '',
    角色级别: r.level,
    状态: r.status === 'active' ? '启用' : '禁用',
    权限数量: getRolePermissionCount(r),
    创建时间: formatDate(r.createdAt),
    更新时间: formatDate(r.updatedAt)
  }));
  
  const csv = convertToCSV(data);
  downloadCSV(csv, '角色列表.csv');
  showToast("导出成功");
};

// 工具函数
const convertToCSV = (data: any[]) => {
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  return csvContent;
};

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// 跳转到权限配置页面
const navigateToPermissions = (roleId: number) => {
  console.info("navigateToPermissions", roleId);
  router.push(`/admin/roles/${roleId}/permissions`);
};

// 重置表单
const resetForm = () => {
  editingRole.value = null;
  Object.assign(currentRole, {
    name: "",
    code: "",
    description: "",
    level: 0,
    status: "active",
    permissionIds: []
  });
};

onMounted(() => {
  onLoad();
});

definePageMeta({
  layout: "admin",
  title: "角色管理",
  requiresAuth: true
  // permissions: {
  //   resource: "roles",
  //   action: "manage"
  // }
});
</script>

<style scoped>
.role-management {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 80px;
}

/* 统计卡片样式 */
.stat-card {
  @apply bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-3;
}

.stat-icon {
  @apply w-10 h-10 rounded-full flex items-center justify-center;
}

.stat-content {
  @apply flex-1;
}

.stat-value {
  @apply text-xl font-bold text-gray-900;
}

.stat-label {
  @apply text-sm text-gray-500;
}

/* 筛选弹窗样式 */
.filter-popup {
  @apply h-full flex flex-col;
}

.filter-header {
  @apply flex items-center justify-between p-4 border-b border-gray-100;
}

.filter-title {
  @apply text-lg font-semibold text-gray-900;
}

.filter-close {
  @apply text-gray-400 text-xl cursor-pointer;
}

.filter-content {
  @apply flex-1 overflow-y-auto p-4 space-y-6;
}

.filter-section {
  @apply space-y-3;
}

.filter-section-title {
  @apply text-base font-medium text-gray-900;
}

.filter-options {
  @apply grid grid-cols-2 gap-2;
}

.filter-option {
  @apply text-sm;
}

.filter-actions {
  @apply flex gap-3 p-4 border-t border-gray-100;
}

/* 角色卡片样式 */
.role-list {
  margin-bottom: 16px;
}

.role-card {
  margin-bottom: 16px;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.role-info {
  flex: 1;
}

.role-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--van-text-color);
  margin: 0 0 4px 0;
}

.role-description {
  font-size: 14px;
  color: var(--van-gray-6);
  margin: 0;
  line-height: 1.4;
}

.role-status {
  margin-left: 12px;
}

.role-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.role-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--van-gray-5);
}

.role-code, .role-level {
  background: var(--van-background-2);
  padding: 2px 6px;
  border-radius: 4px;
}

.role-permissions {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--van-gray-6);
}

.permission-icon {
  font-size: 14px;
}

.role-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 快速筛选标签样式 */
.van-tag {
  @apply transition-all duration-200;
}

.van-tag.cursor-pointer:hover {
  @apply transform scale-105;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .role-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .role-status {
    margin-left: 0;
    margin-top: 8px;
  }
  
  .role-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .role-actions {
    flex-direction: column;
  }
  
  .stat-card {
    @apply p-2;
  }
  
  .stat-icon {
    @apply w-8 h-8;
  }
  
  .stat-value {
    @apply text-lg;
  }
}

:deep(.van-cell-group) {
  margin-bottom: 12px;
}

:deep(.van-space) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.van-button) {
  min-width: 60px;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
}
</style>
