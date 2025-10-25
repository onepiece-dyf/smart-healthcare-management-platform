<template>
  <div class="permission-management">
    <HeroHeader 
      :title="`${currentRole?.name || '角色'}权限配置`" 
      subtitle="配置角色权限，控制访问范围" 
      :showBack="true" 
      @back="router.back()" />
    
    <!-- 角色信息卡片 -->
    <div v-if="currentRole" class="px-4 py-3">
      <div class="role-info-card">
        <div class="role-avatar">
          <van-icon name="manager-o" size="24" />
        </div>
        <div class="role-details">
          <h3 class="role-name">{{ currentRole.name }}</h3>
          <p class="role-description">{{ currentRole.description || '暂无描述' }}</p>
          <div class="role-meta">
            <span class="role-code">编码：{{ currentRole.code }}</span>
            <span class="role-level">级别：{{ currentRole.level }}</span>
            <van-tag :type="currentRole.status === 'active' ? 'success' : 'warning'" size="small">
              {{ currentRole.status === 'active' ? '启用' : '禁用' }}
            </van-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 权限统计 -->
    <div class="px-4 py-2">
      <div class="grid grid-cols-3 gap-3">
        <div class="stat-item">
          <div class="stat-number">{{ totalPermissions }}</div>
          <div class="stat-label">总权限</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ selectedCount }}</div>
          <div class="stat-label">已选择</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ Math.round((selectedCount / totalPermissions) * 100) }}%</div>
          <div class="stat-label">选择率</div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div class="flex items-center p-3 gap-2">
        <van-search
          v-model="searchText"
          placeholder="搜索权限名称、描述"
          @search="handleSearch"
          @clear="handleClearSearch"
          class="flex-1" />
        <van-button 
          icon="filter-o" 
          @click="showFilter = true"
          :class="hasActiveFilters ? 'bg-primary text-white' : ''">
          筛选
        </van-button>
      </div>
    </div>

    <!-- 快速操作栏 -->
    <div class="px-4 py-2">
      <div class="flex gap-2">
        <van-button size="small" @click="selectAll">全选</van-button>
        <van-button size="small" @click="selectNone">全不选</van-button>
        <van-button size="small" @click="selectByType('menu')">选择菜单权限</van-button>
        <van-button size="small" @click="selectByType('operation')">选择操作权限</van-button>
      </div>
    </div>

    <!-- 权限分组列表 -->
    <van-collapse v-model="activeGroups" class="permission-groups">
      <van-collapse-item
        v-for="group in filteredPermissionGroups"
        :key="group.resource"
        :title="`${getResourceName(group.resource)} (${group.permissions.length})`"
        :name="group.resource">
        <template #title>
          <div class="group-header">
            <span class="group-name">{{ getResourceName(group.resource) }}</span>
            <div class="group-stats">
              <span class="group-count">{{ group.permissions.length }}</span>
              <span class="group-selected">{{ getGroupSelectedCount(group) }}</span>
            </div>
          </div>
        </template>
        
        <van-cell-group>
          <van-cell
            v-for="perm in group.permissions"
            :key="perm.id"
            class="permission-item">
            <template #title>
              <div class="permission-header">
                <span class="permission-name">{{ perm.name }}</span>
                <div class="permission-tags">
                  <van-tag
                    :type="getActionTagType(perm.action)"
                    size="small">
                    {{ getActionName(perm.action) }}
                  </van-tag>
                  <van-tag
                    :type="getTypeTagType(perm.type)"
                    size="small">
                    {{ getTypeName(perm.type) }}
                  </van-tag>
                </div>
              </div>
              <p class="permission-description">{{ perm.description || '暂无描述' }}</p>
              <div class="permission-code">{{ perm.code }}</div>
            </template>
            
            <template #right-icon>
              <van-checkbox 
                v-model="selectedPermissions[perm.id]" 
                @change="onPermissionChange(perm.id)" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-collapse-item>
    </van-collapse>

    <!-- 高级筛选器 -->
    <van-popup v-model:show="showFilter" position="bottom" :style="{ height: '60%' }">
      <div class="filter-popup">
        <div class="filter-header">
          <h3 class="filter-title">权限筛选</h3>
          <van-icon name="cross" @click="showFilter = false" class="filter-close" />
        </div>
        
        <div class="filter-content">
          <!-- 类型筛选 -->
          <div class="filter-section">
            <h4 class="filter-section-title">权限类型</h4>
            <van-checkbox-group v-model="filters.types">
              <div class="filter-options">
                <van-checkbox name="menu" class="filter-option">菜单权限</van-checkbox>
                <van-checkbox name="operation" class="filter-option">操作权限</van-checkbox>
                <van-checkbox name="data" class="filter-option">数据权限</van-checkbox>
              </div>
            </van-checkbox-group>
          </div>

          <!-- 操作筛选 -->
          <div class="filter-section">
            <h4 class="filter-section-title">操作类型</h4>
            <van-checkbox-group v-model="filters.actions">
              <div class="filter-options">
                <van-checkbox name="create" class="filter-option">创建</van-checkbox>
                <van-checkbox name="read" class="filter-option">读取</van-checkbox>
                <van-checkbox name="update" class="filter-option">更新</van-checkbox>
                <van-checkbox name="delete" class="filter-option">删除</van-checkbox>
                <van-checkbox name="manage" class="filter-option">管理</van-checkbox>
              </div>
            </van-checkbox-group>
          </div>

          <!-- 选择状态筛选 -->
          <div class="filter-section">
            <h4 class="filter-section-title">选择状态</h4>
            <van-radio-group v-model="filters.selectionStatus">
              <van-radio name="all">全部</van-radio>
              <van-radio name="selected">已选择</van-radio>
              <van-radio name="unselected">未选择</van-radio>
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

    <!-- 底部操作栏 -->
    <div class="fixed-bottom safe-area-bottom">
      <div class="flex gap-2 p-3 bg-white border-t border-gray-100">
        <van-button 
          plain 
          type="primary" 
          @click="previewPermissions"
          class="flex-1">
          预览权限
        </van-button>
        <van-button 
          type="primary" 
          :loading="saving" 
          @click="savePermissions"
          class="flex-1">
          保存配置
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showToast, showDialog } from "vant";
import { useRoleStore } from "~/stores/role";
import type { Permission, PermissionAction, PermissionType } from "~/types/models/auth";

const route = useRoute();
const router = useRouter();
const roleStore = useRoleStore();

const roleId = Number(route.params.id);
const saving = ref(false);
const activeGroups = ref<string[]>([]);
const selectedPermissions = ref<Record<number, boolean>>({});
const currentRole = ref<any>(null);
const searchText = ref("");
const showFilter = ref(false);

// 筛选条件
const filters = ref({
  types: [] as string[],
  actions: [] as string[],
  selectionStatus: 'all'
});

// 统计数据
const totalPermissions = computed(() => roleStore.permissions.length);
const selectedCount = computed(() => Object.values(selectedPermissions.value).filter(Boolean).length);

// 是否有活跃筛选条件
const hasActiveFilters = computed(() => {
  return filters.value.types.length > 0 ||
         filters.value.actions.length > 0 ||
         filters.value.selectionStatus !== 'all';
});

// 过滤后的权限列表
const filteredPermissions = computed(() => {
  return roleStore.permissions.filter((permission) => {
    // 搜索匹配
    const matchesSearch = searchText.value === "" ||
      permission.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
      (permission.description && permission.description.toLowerCase().includes(searchText.value.toLowerCase())) ||
      permission.code.toLowerCase().includes(searchText.value.toLowerCase());

    // 类型匹配
    const matchesTypes = filters.value.types.length === 0 || 
                        filters.value.types.includes(permission.type);

    // 操作匹配
    const matchesActions = filters.value.actions.length === 0 || 
                          filters.value.actions.includes(permission.action);

    // 选择状态匹配
    const isSelected = selectedPermissions.value[permission.id] || false;
    const matchesSelectionStatus = filters.value.selectionStatus === 'all' ||
      (filters.value.selectionStatus === 'selected' && isSelected) ||
      (filters.value.selectionStatus === 'unselected' && !isSelected);

    return matchesSearch && matchesTypes && matchesActions && matchesSelectionStatus;
  });
});

// 按资源分组的权限列表
const permissionGroups = computed(() => {
  const groups: Record<string, Permission[]> = {};
  filteredPermissions.value.forEach((perm) => {
    if (!groups[perm.resource]) {
      groups[perm.resource] = [];
    }
    groups[perm.resource].push(perm);
  });

  return Object.entries(groups).map(([resource, permissions]) => ({
    resource,
    permissions
  }));
});

// 过滤后的权限分组
const filteredPermissionGroups = computed(() => {
  return permissionGroups.value;
});

// 获取分组选中数量
const getGroupSelectedCount = (group: any) => {
  return group.permissions.filter((perm: Permission) => selectedPermissions.value[perm.id]).length;
};

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑在computed中处理
};

// 清除搜索
const handleClearSearch = () => {
  searchText.value = '';
};

// 应用筛选
const applyFilter = () => {
  showFilter.value = false;
};

// 重置筛选
const resetFilter = () => {
  filters.value = {
    types: [],
    actions: [],
    selectionStatus: 'all'
  };
  showFilter.value = false;
};

// 全选
const selectAll = () => {
  roleStore.permissions.forEach(perm => {
    selectedPermissions.value[perm.id] = true;
  });
  showToast(`已选择 ${roleStore.permissions.length} 个权限`);
};

// 全不选
const selectNone = () => {
  roleStore.permissions.forEach(perm => {
    selectedPermissions.value[perm.id] = false;
  });
  showToast('已取消选择所有权限');
};

// 按类型选择
const selectByType = (type: string) => {
  const typePermissions = roleStore.permissions.filter(perm => perm.type === type);
  typePermissions.forEach(perm => {
    selectedPermissions.value[perm.id] = true;
  });
  showToast(`已选择 ${typePermissions.length} 个${getTypeName(type)}权限`);
};

// 权限变化处理
const onPermissionChange = (permissionId: number) => {
  // 可以在这里添加权限变化的处理逻辑
};

// 预览权限
const previewPermissions = () => {
  const selectedPerms = roleStore.permissions.filter(perm => selectedPermissions.value[perm.id]);
  const message = `已选择 ${selectedPerms.length} 个权限：\n\n` +
    selectedPerms.map(perm => `• ${perm.name} (${perm.code})`).join('\n');
  
  showDialog({
    title: '权限预览',
    message: message,
    showCancelButton: false
  });
};

// 初始化选中状态
const initializeSelection = async () => {
  const role = await roleStore.loadRole(roleId);
  if (role) {
    currentRole.value = role;
    role.permissionIds.forEach((id) => {
      selectedPermissions.value[id] = true;
    });
  }
};

// 保存权限配置
const savePermissions = async () => {
  try {
    saving.value = true;
    const permissions = Object.entries(selectedPermissions.value)
      .filter(([_, selected]) => selected)
      .map(([id]) => Number(id));

    await roleStore.assignPermissions(roleId, permissions);
    showToast("保存成功");
    router.back();
  } catch (error) {
    showDialog({
      title: "保存失败",
      message: "权限配置保存失败，请重试"
    });
  } finally {
    saving.value = false;
  }
};

// 获取资源名称
const getResourceName = (resource: string): string => {
  const resourceMap: Record<string, string> = {
    patients: "患者管理",
    prescriptions: "处方管理",
    appointments: "预约管理",
    users: "用户管理",
    roles: "角色管理",
    system: "系统管理",
    medical_records: "病历管理"
  };
  return resourceMap[resource] || resource;
};

// 获取操作类型对应的标签类型
const getActionTagType = (action: string): string => {
  const typeMap: Record<string, string> = {
    create: "success",
    read: "primary",
    update: "warning",
    delete: "danger",
    manage: "primary"
  };
  return typeMap[action] || "default";
};

// 获取操作类型的中文名称
const getActionName = (action: string): string => {
  const nameMap: Record<string, string> = {
    create: "创建",
    read: "读取",
    update: "更新",
    delete: "删除",
    manage: "管理"
  };
  return nameMap[action] || action;
};

// 获取类型标签类型
const getTypeTagType = (type: string): string => {
  const typeMap: Record<string, string> = {
    menu: "primary",
    operation: "success",
    data: "warning"
  };
  return typeMap[type] || "default";
};

// 获取类型名称
const getTypeName = (type: string): string => {
  const nameMap: Record<string, string> = {
    menu: "菜单",
    operation: "操作",
    data: "数据"
  };
  return nameMap[type] || type;
};

onMounted(async () => {
  await roleStore.loadRoles();
  await initializeSelection();
});
</script>

<style scoped>
.permission-management {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 80px;
}

/* 角色信息卡片 */
.role-info-card {
  @apply bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center gap-4;
}

.role-avatar {
  @apply w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center;
}

.role-details {
  @apply flex-1;
}

.role-name {
  @apply text-lg font-semibold text-gray-900 m-0 mb-1;
}

.role-description {
  @apply text-sm text-gray-600 m-0 mb-2;
}

.role-meta {
  @apply flex items-center gap-3 flex-wrap;
}

.role-code, .role-level {
  @apply text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded;
}

/* 统计项 */
.stat-item {
  @apply bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100;
}

.stat-number {
  @apply text-xl font-bold text-gray-900;
}

.stat-label {
  @apply text-xs text-gray-500 mt-1;
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

/* 权限分组样式 */
.permission-groups {
  @apply px-4;
}

.group-header {
  @apply flex items-center justify-between w-full;
}

.group-name {
  @apply font-medium text-gray-900;
}

.group-stats {
  @apply flex items-center gap-2 text-sm text-gray-500;
}

.group-count {
  @apply bg-gray-100 px-2 py-1 rounded text-xs;
}

.group-selected {
  @apply bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs;
}

/* 权限项样式 */
.permission-item {
  @apply border-b border-gray-100;
}

.permission-header {
  @apply flex items-center justify-between mb-2;
}

.permission-name {
  @apply font-medium text-gray-900;
}

.permission-tags {
  @apply flex gap-1;
}

.permission-description {
  @apply text-sm text-gray-600 mb-2 m-0;
}

.permission-code {
  @apply text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono;
}

/* 固定底部 */
.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  z-index: 10;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .role-info-card {
    @apply p-3;
  }
  
  .role-avatar {
    @apply w-10 h-10;
  }
  
  .role-meta {
    @apply flex-col items-start gap-2;
  }
  
  .stat-item {
    @apply p-2;
  }
  
  .stat-number {
    @apply text-lg;
  }
  
  .group-header {
    @apply flex-col items-start gap-2;
  }
  
  .permission-header {
    @apply flex-col items-start gap-2;
  }
}
</style>
