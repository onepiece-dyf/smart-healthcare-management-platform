<template>
  <div class="permission-management">
    <HeroHeader title="权限管理" subtitle="系统权限配置与访问控制" :showDate="true" />
    
    <!-- 统计卡片 -->
    <div class="px-4 py-3">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="stat-card">
          <div class="stat-icon bg-blue-100 text-blue-600">
            <van-icon name="shield-o" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-label">总权限数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-green-100 text-green-600">
            <van-icon name="success" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.active }}</div>
            <div class="stat-label">活跃权限</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-orange-100 text-orange-600">
            <van-icon name="warning-o" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.inactive }}</div>
            <div class="stat-label">禁用权限</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-purple-100 text-purple-600">
            <van-icon name="apps-o" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.resources }}</div>
            <div class="stat-label">资源类型</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div class="flex items-center p-3 gap-2">
        <van-search
          v-model="searchText"
          placeholder="搜索权限名称、编码、描述"
          @search="handleSearch"
          @clear="handleClearSearch"
          class="flex-1 search-input" />
        <van-button 
          icon="filter-o" 
          @click="showFilter = true"
          :class="hasActiveFilters ? 'bg-primary text-white' : ''"
          size="small">
          筛选
        </van-button>
        <van-button 
          icon="refresh" 
          @click="onRefresh"
          :loading="loading"
          size="small">
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
            class="cursor-pointer"
            size="small">
            {{ filter.label }}
          </van-tag>
        </div>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="selectedPermissions.length > 0" class="bg-primary/10 border-b border-primary/20 p-3">
      <div class="flex items-center justify-between">
        <span class="text-sm text-primary font-medium">
          已选择 {{ selectedPermissions.length }} 个权限
        </span>
        <div class="flex gap-2">
          <van-button size="small" @click="batchEnable">批量启用</van-button>
          <van-button size="small" @click="batchDisable">批量禁用</van-button>
          <van-button size="small" type="danger" @click="batchDelete">批量删除</van-button>
          <van-button size="small" plain @click="clearSelection">取消选择</van-button>
        </div>
      </div>
    </div>

    <div class="permission-list">
      <template v-for="group in permissionGroups" :key="group.resource">
        <!-- 资源组标题栏 -->
        <div class="resource-group-header">
          <div class="resource-info">
            <van-tag type="primary" size="medium" class="resource-tag">
              {{ getResourceName(group.resource) }}
            </van-tag>
            <span class="permission-count">{{ group.permissions.length }}个权限</span>
          </div>
          <!-- 添加资源级别的新增按钮 -->
          <van-button
            plain
            type="primary"
            size="small"
            icon="plus"
            @click="addPermissionForResource(group.resource)">
            新增权限
          </van-button>
        </div>

        <!-- 权限列表卡片 -->
        <van-cell-group inset class="permission-group">
          <van-cell
            v-for="permission in group.permissions"
            :key="permission.id"
            class="permission-item"
            :class="{ 'selected': selectedPermissions.includes(permission.id) }">
            <template #left-icon>
              <van-checkbox 
                v-model="selectedPermissions" 
                :name="permission.id"
                @click.stop />
            </template>
            
            <template #title>
              <div class="permission-main">
                <div class="permission-header">
                  <span class="permission-name">{{ permission.name }}</span>
                  <div class="permission-tags">
                    <van-tag
                      :type="getActionTagType(permission.action) as any"
                      size="small" as any
                      class="permission-action">
                      {{ getActionName(permission.action) }}
                    </van-tag>
                    <van-tag
                      :type="(permission.status === 'active' ? 'success' : 'warning') as any"
                      size="small" as any>
                      {{ permission.status === 'active' ? '启用' : '禁用' }}
                    </van-tag>
                    <van-tag
                      :type="getTypeTagType(permission.type) as any"
                      size="small" as any>
                      {{ getTypeName(permission.type) }}
                    </van-tag>
                  </div>
                </div>
                <div class="permission-sub">
                  <span class="permission-code">{{ permission.code }}</span>
                  <span v-if="permission.description" class="permission-description">
                    {{ permission.description }}
                  </span>
                </div>
                <div class="permission-meta">
                  <span class="permission-date">
                    创建：{{ formatDate(permission.createdAt) }}
                  </span>
                  <span class="permission-date">
                    更新：{{ formatDate(permission.updatedAt) }}
                  </span>
                </div>
              </div>
            </template>

            <template #right-icon>
              <div class="permission-actions">
                <van-button
                  plain
                  :type="permission.status === 'active' ? 'warning' : 'success'"
                  size="small"
                  :icon="permission.status === 'active' ? 'pause' : 'play'"
                  @click.stop="toggleStatus(permission)">
                  {{ permission.status === 'active' ? '禁用' : '启用' }}
                </van-button>
                <van-button
                  plain
                  type="primary"
                  size="small"
                  icon="edit"
                  @click.stop="editPermission(permission)">
                  编辑
                </van-button>
                <van-button
                  plain
                  type="danger"
                  size="small"
                  icon="delete-o"
                  @click.stop="confirmDelete(permission.id)">
                  删除
                </van-button>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </template>
      <!-- 加载更多按钮 -->
      <div v-if="!finished && permissionStore.permissions.length > 0" class="load-more-container">
        <van-button 
          @click="loadMore" 
          :loading="loading"
          type="primary" 
          size="large"
          block>
          {{ loading ? '加载中...' : '加载更多' }}
        </van-button>
      </div>
      
      <!-- 没有更多数据提示 -->
      <div v-if="finished && permissionStore.permissions.length > 0" class="no-more-data">
        <van-divider>没有更多数据了</van-divider>
      </div>
    </div>

    <!-- 高级筛选器 -->
    <van-popup v-model:show="showFilter" position="bottom" :style="{ height: '70%' }">
      <div class="filter-popup">
        <div class="filter-header">
          <h3 class="filter-title">高级筛选</h3>
          <van-icon name="cross" @click="showFilter = false" class="filter-close" />
        </div>
        
        <div class="filter-content">
          <!-- 状态筛选 -->
          <div class="filter-section">
            <h4 class="filter-section-title">权限状态</h4>
            <van-radio-group v-model="filters.status">
              <van-radio name="all">全部</van-radio>
              <van-radio name="active">启用</van-radio>
              <van-radio name="inactive">禁用</van-radio>
            </van-radio-group>
          </div>

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

          <!-- 资源筛选 -->
          <div class="filter-section">
            <h4 class="filter-section-title">资源类型</h4>
            <van-checkbox-group v-model="filters.resources">
              <div class="filter-options">
                <van-checkbox
                  v-for="resource in resourceOptions"
                  :key="resource.value"
                  :name="resource.value"
                  class="filter-option">
                  {{ resource.text }}
                </van-checkbox>
              </div>
            </van-checkbox-group>
          </div>

          <!-- 操作筛选 -->
          <div class="filter-section">
            <h4 class="filter-section-title">操作类型</h4>
            <van-checkbox-group v-model="filters.actions">
              <div class="filter-options">
                <van-checkbox
                  v-for="action in actionOptions"
                  :key="action.value"
                  :name="action.value"
                  class="filter-option">
                  {{ action.text }}
                </van-checkbox>
              </div>
            </van-checkbox-group>
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

    <!-- 权限表单弹窗 -->
    <van-dialog
      v-model:show="showPermissionDialog"
      :title="editingPermission ? '编辑权限' : '新增权限'"
      show-cancel-button
      @confirm="savePermission"
      @cancel="resetForm">
      <van-form>
        <van-cell-group inset>
          <van-field
            v-model="currentPermission.name"
            label="权限名称"
            placeholder="请输入权限名称"
            :rules="[{ required: true, message: '请输入权限名称' }]" />
          <van-field
            v-model="permissionCode"
            label="权限编码"
            placeholder="请输入权限编码"
            disabled
            :rules="[{ required: true, message: '请输入权限编码' }]" />
          <van-field
            v-model="resourceText"
            label="资源类型"
            placeholder="请选择资源类型"
            is-link
            @click="showResourcePicker = true"
            :rules="[{ required: true, message: '请选择资源类型' }]" />
          <van-field
            v-model="actionText"
            label="操作类型"
            placeholder="请选择操作类型"
            is-link
            @click="showActionPicker = true"
            :rules="[{ required: true, message: '请选择操作类型' }]" />
          <van-field
            v-model="typeText"
            label="权限类型"
            placeholder="请选择权限类型"
            is-link
            @click="showTypePicker = true"
            :rules="[{ required: true, message: '请选择权限类型' }]" />
          <van-field
            v-model="currentPermission.description"
            label="权限描述"
            type="textarea"
            placeholder="请输入权限描述"
            rows="2"
            autosize />
        </van-cell-group>
      </van-form>
    </van-dialog>

    <!-- 添加资源类型选择器 -->
    <van-popup v-model:show="showResourcePicker" position="bottom">
      <van-picker
        :columns="Object.entries(getResourceMap()).map(([value, text]) => ({ text, value }))"
        @confirm="onResourceSelect"
        @cancel="showResourcePicker = false"
        show-toolbar
        title="选择资源类型" />
    </van-popup>

    <!-- 添加操作类型选择器 -->
    <van-popup v-model:show="showActionPicker" position="bottom">
      <van-picker
        :columns="Object.entries(getActionMap()).map(([value, text]) => ({ text, value }))"
        @confirm="onActionSelect"
        @cancel="showActionPicker = false"
        show-toolbar
        title="选择操作类型" />
    </van-popup>

    <!-- 添加权限类型选择器 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="Object.entries(getTypeMap()).map(([value, text]) => ({ text, value }))"
        @confirm="onTypeSelect"
        @cancel="showTypePicker = false"
        show-toolbar
        title="选择权限类型" />
    </van-popup>

    <!-- 悬浮按钮组 -->
    <FloatingButtonGroup>
      <van-button icon="plus" type="primary" round @click="addPermission">
        新增权限
      </van-button>
      <van-button icon="download" type="success" round @click="exportPermissions">
        导出
      </van-button>
      <van-button icon="upload" type="warning" round @click="importPermissions">
        导入
      </van-button>
    </FloatingButtonGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { showToast, showDialog } from "vant";
import { usePermissionStore } from "~/stores/permission";
import type { Permission, PermissionAction, PermissionType } from "~/types/models/auth";
import { formatDate } from "~/utils/date";
import FloatingButtonGroup from "~/components/common/FloatingButtonGroup.vue";

const permissionStore = usePermissionStore();

const loading = ref(false);
const finished = ref(false);
const showPermissionDialog = ref(false);
const showFilter = ref(false);
const editingPermission = ref<Permission | null>(null);
const currentPermission = ref<Partial<Permission>>({
  name: "",
  code: "",
  resource: "",
  action: "" as PermissionAction,
  type: "operation" as PermissionType,
  status: "active",
  description: ""
});

// 添加新的状态
const showResourcePicker = ref(false);
const showActionPicker = ref(false);
const showTypePicker = ref(false);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(50); // 增加分页大小
const totalCount = ref(0);

// 搜索和筛选
const searchText = ref("");
const selectedPermissions = ref<number[]>([]);

// 筛选条件
const filters = ref({
  status: 'all',
  types: [] as string[],
  resources: [] as string[],
  actions: [] as string[]
});

// 快速筛选标签
const quickFilters = ref([
  { key: 'active', label: '启用权限', active: false },
  { key: 'inactive', label: '禁用权限', active: false },
  { key: 'menu', label: '菜单权限', active: false },
  { key: 'operation', label: '操作权限', active: false }
]);

// 资源类型选项
const resourceOptions = computed(() => {
  return Object.entries(getResourceMap()).map(([value, label]) => ({
    text: label,
    value
  }));
});

// 操作类型选项
const actionOptions = computed(() => {
  return Object.entries(getActionMap()).map(([value, label]) => ({
    text: label,
    value
  }));
});

// 统计数据
const statistics = computed(() => {
  const allPermissions = permissionStore.permissions;
  return {
    total: allPermissions.length,
    active: allPermissions.filter(p => p.status === 'active').length,
    inactive: allPermissions.filter(p => p.status === 'inactive').length,
    resources: new Set(allPermissions.map(p => p.resource)).size
  };
});

// 是否有活跃筛选条件
const hasActiveFilters = computed(() => {
  return filters.value.status !== 'all' ||
         filters.value.types.length > 0 ||
         filters.value.resources.length > 0 ||
         filters.value.actions.length > 0 ||
         quickFilters.value.some(f => f.active);
});

// 过滤后的权限列表
const filteredPermissions = computed(() => {
  return permissionStore.permissions.filter((permission) => {
    // 搜索匹配
    const matchesSearch = searchText.value === "" ||
      permission.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
      permission.code.toLowerCase().includes(searchText.value.toLowerCase()) ||
      (permission.description && permission.description.toLowerCase().includes(searchText.value.toLowerCase()));

    // 状态匹配
    const matchesStatus = filters.value.status === 'all' || 
                         permission.status === filters.value.status;

    // 类型匹配
    const matchesTypes = filters.value.types.length === 0 || 
                        filters.value.types.includes(permission.type);

    // 资源匹配
    const matchesResources = filters.value.resources.length === 0 || 
                            filters.value.resources.includes(permission.resource);

    // 操作匹配
    const matchesActions = filters.value.actions.length === 0 || 
                          filters.value.actions.includes(permission.action);

    // 快速筛选匹配
    const matchesQuickFilter = !quickFilters.value.some(f => f.active) || 
      (quickFilters.value.find(f => f.key === 'active' && f.active) && permission.status === 'active') ||
      (quickFilters.value.find(f => f.key === 'inactive' && f.active) && permission.status === 'inactive') ||
      (quickFilters.value.find(f => f.key === 'menu' && f.active) && permission.type === 'menu') ||
      (quickFilters.value.find(f => f.key === 'operation' && f.active) && permission.type === 'operation');

    return matchesSearch && matchesStatus && matchesTypes && 
           matchesResources && matchesActions && matchesQuickFilter;
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

// 加载权限列表
const onLoad = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    const filterParams = {
      status: filters.value.status,
      types: filters.value.types,
      resources: filters.value.resources,
      searchText: searchText.value
    };
    
    const result = await permissionStore.loadPermissions(currentPage.value, pageSize.value, filterParams);
    totalCount.value = result.totalCount;
    
    // 检查是否还有更多数据
    if (currentPage.value * pageSize.value >= totalCount.value) {
      finished.value = true;
    } else {
      currentPage.value++;
    }
  } catch (error) {
    console.error('加载权限失败:', error);
    showToast("加载失败");
  } finally {
    loading.value = false;
  }
};

// 刷新
const onRefresh = async () => {
  finished.value = false;
  currentPage.value = 1;
  permissionStore.permissions = [];
  await onLoad();
};

// 加载更多
const loadMore = async () => {
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
    types: [],
    resources: [],
    actions: []
  };
  quickFilters.value.forEach(f => f.active = false);
  showFilter.value = false;
};

// 切换权限状态
const toggleStatus = async (permission: Permission) => {
  try {
    const newStatus = permission.status === 'active' ? 'inactive' : 'active';
    await permissionStore.updatePermission(permission.id, { status: newStatus });
    showToast(`${newStatus === 'active' ? '启用' : '禁用'}成功`);
  } catch (error) {
    showToast("操作失败");
  }
};

// 批量操作
const batchEnable = async () => {
  try {
    for (const id of selectedPermissions.value) {
      await permissionStore.updatePermission(id, { status: 'active' });
    }
    showToast("批量启用成功");
    clearSelection();
  } catch (error) {
    showToast("批量操作失败");
  }
};

const batchDisable = async () => {
  try {
    for (const id of selectedPermissions.value) {
      await permissionStore.updatePermission(id, { status: 'inactive' });
    }
    showToast("批量禁用成功");
    clearSelection();
  } catch (error) {
    showToast("批量操作失败");
  }
};

const batchDelete = async () => {
  showDialog({
    title: "确认删除",
    message: `确定要删除选中的 ${selectedPermissions.value.length} 个权限吗？`,
    showCancelButton: true
  }).then(async () => {
    try {
      for (const id of selectedPermissions.value) {
        await permissionStore.deletePermission(id);
      }
      showToast("批量删除成功");
      clearSelection();
    } catch (error) {
      showToast("批量删除失败");
    }
  }).catch(() => {});
};

const clearSelection = () => {
  selectedPermissions.value = [];
};

// 新增权限
const addPermission = () => {
  resetForm();
  showPermissionDialog.value = true;
};

// 导出权限
const exportPermissions = () => {
  const data = filteredPermissions.value.map(p => ({
    权限名称: p.name,
    权限编码: p.code,
    资源类型: getResourceName(p.resource),
    操作类型: getActionName(p.action),
    权限类型: getTypeName(p.type),
    状态: p.status === 'active' ? '启用' : '禁用',
    描述: p.description || '',
    创建时间: formatDate(p.createdAt),
    更新时间: formatDate(p.updatedAt)
  }));
  
  const csv = convertToCSV(data);
  downloadCSV(csv, '权限列表.csv');
  showToast("导出成功");
};

// 导入权限
const importPermissions = () => {
  showToast("导入功能开发中");
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

// 编辑权限
const editPermission = (permission: Permission) => {
  editingPermission.value = permission;
  currentPermission.value = { ...permission };
  showPermissionDialog.value = true;
};

// 保存权限
const savePermission = async () => {
  try {
    const permissionData = {
      name: currentPermission.value.name!,
      code: currentPermission.value.code!,
      resource: currentPermission.value.resource!,
      action: currentPermission.value.action!,
      description: currentPermission.value.description
    };

    if (editingPermission.value) {
      await permissionStore.updatePermission(editingPermission.value.id, permissionData);
    } else {
      await permissionStore.createPermission(permissionData as Permission);
    }

    showPermissionDialog.value = false;
    resetForm();
    showToast("保存成功");
    finished.value = false;
    await onLoad();
  } catch (error) {
    showToast("保存失败");
  }
};

// 确认删除
const confirmDelete = (id: number) => {
  showDialog({
    title: "确认删除",
    message: "确定要删除该权限吗？删除后关联的角色将失去此权限。",
    showCancelButton: true
  })
    .then(async () => {
      try {
        await permissionStore.deletePermission(id);
        showToast("删除成功");
        finished.value = false;
        await onLoad();
      } catch (error) {
        showToast("删除失败");
      }
    })
    .catch(() => {});
};

// 重置表单
const resetForm = () => {
  editingPermission.value = null;
  currentPermission.value = {
    name: "",
    code: "",
    resource: "",
    action: "" as PermissionAction,
    description: ""
  };
};

// 获取资源名称
const getResourceName = (resource: string): string => {
  const resourceMap: Record<string, string> = {
    patients: "患者管理",
    prescriptions: "处方管理",
    appointments: "预约管理",
    users: "用户管理",
    roles: "角色管理",
    permissions: "权限管理",
    system: "系统管理",
    medical_records: "病历管理",
    orders: "医嘱管理",
    wards: "病区管理",
    beds: "床位管理",
    nursing: "护理管理",
    medications: "药品管理",
    vital_signs: "生命体征",
    notifications: "通知管理",
    reports: "报表统计",
    equipment: "设备管理",
    finance: "财务管理",
    inventory: "库存管理",
    training: "培训管理",
    quality: "质控管理",
    research: "科研管理",
    emergency: "应急管理",
    documents: "文档管理",
    meetings: "会议管理",
    attendance: "考勤管理",
    performance: "绩效管理",
    security: "安全管理",
    data: "数据管理",
    ai: "AI智能",
    consultation: "远程会诊",
    blockchain: "区块链",
    iot: "物联网",
    audit: "审计管理",
    multi: "多租户"
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

// 为特定资源添加权限
const addPermissionForResource = (resource: string) => {
  currentPermission.value = {
    name: "",
    code: "",
    resource,
    action: "" as PermissionAction,
    description: ""
  };
  showPermissionDialog.value = true;
};

// 选择资源类型
const onResourceSelect = ({ selectedValues }: { selectedValues: string[] }) => {
  currentPermission.value.resource = selectedValues.join(",");
  showResourcePicker.value = false;
};

const resourceText = computed(() => {
  return getResourceName(currentPermission.value.resource || "");
});

// 选择操作类型
const onActionSelect = ({ selectedValues }: { selectedValues: string[] }) => {
  currentPermission.value.action = selectedValues.join(",") as PermissionAction;
  showActionPicker.value = false;
};

const actionText = computed(() => {
  return getActionName(currentPermission.value.action || "");
});

const permissionCode = computed(() => {
  return `${currentPermission.value.resource}.${currentPermission.value.action}`;
});

// 获取资源映射表
const getResourceMap = (): Record<string, string> => ({
  patients: "患者管理",
  prescriptions: "处方管理",
  appointments: "预约管理",
  users: "用户管理",
  roles: "角色管理",
  permissions: "权限管理",
  system: "系统管理",
  medical_records: "病历管理",
  orders: "医嘱管理",
  wards: "病区管理",
  beds: "床位管理",
  nursing: "护理管理",
  medications: "药品管理",
  vital_signs: "生命体征",
  notifications: "通知管理",
  reports: "报表统计",
  equipment: "设备管理",
  finance: "财务管理",
  inventory: "库存管理",
  training: "培训管理",
  quality: "质控管理",
  research: "科研管理",
  emergency: "应急管理",
  documents: "文档管理",
  meetings: "会议管理",
  attendance: "考勤管理",
  performance: "绩效管理",
  security: "安全管理",
  data: "数据管理"
});

// 获取操作映射表
const getActionMap = (): Record<string, string> => ({
  create: "创建",
  read: "读取",
  update: "更新",
  delete: "删除",
  manage: "管理"
});

// 获取类型映射表
const getTypeMap = (): Record<string, string> => ({
  menu: "菜单权限",
  operation: "操作权限",
  data: "数据权限"
});

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

// 选择权限类型
const onTypeSelect = ({ selectedValues }: { selectedValues: string[] }) => {
  currentPermission.value.type = selectedValues.join(",") as PermissionType;
  showTypePicker.value = false;
};

const typeText = computed(() => {
  return getTypeName(currentPermission.value.type || "");
});

onMounted(onLoad);

definePageMeta({
  layout: "admin",
  title: "权限管理",
  requiresAuth: true
});
</script>

<style scoped>
.permission-management {
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
  @apply grid grid-cols-1 gap-2;
}

.filter-option {
  @apply text-sm;
}

.filter-actions {
  @apply flex gap-3 p-4 border-t border-gray-100;
}

/* 搜索框样式优化 */
.search-input {
  --van-search-input-height: 32px;
}

.search-input .van-search__content {
  background-color: #f7f8fa;
  border-radius: 6px;
  height: 32px;
  display: flex;
  align-items: center;
}

.search-input .van-search__input {
  text-align: left;
  padding: 0 8px;
  line-height: 32px;
  height: 32px;
  font-size: 14px;
  display: flex;
  align-items: center;
  vertical-align: middle;
  box-sizing: border-box;
}

.search-input .van-search__input::placeholder {
  text-align: left;
  color: #969799;
  line-height: 32px;
  height: 32px;
  font-size: 14px;
  display: inline-block;
  vertical-align: middle;
  margin: 0;
  padding: 0;
}

/* 权限列表样式 */
.permission-list {
  margin-bottom: 16px;
}

/* 加载更多按钮样式 */
.load-more-container {
  padding: 16px;
  text-align: center;
}

.no-more-data {
  padding: 16px;
  text-align: center;
  color: #969799;
}

.resource-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 8px;
}

.resource-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resource-tag {
  font-weight: 500;
}

.permission-count {
  color: var(--van-gray-6);
  font-size: 14px;
}

.permission-group {
  margin-bottom: 16px;
}

.permission-item {
  padding: 8px 12px;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.permission-item:last-child {
  border-bottom: none;
}

.permission-item.selected {
  background-color: var(--van-primary-color-light);
  border-left: 3px solid var(--van-primary-color);
}

.permission-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.permission-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
}

.permission-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--van-text-color);
}

.permission-tags {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

.permission-sub {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.permission-code {
  font-size: 11px;
  color: var(--van-gray-6);
  font-family: monospace;
  background: var(--van-background-2);
  padding: 1px 4px;
  border-radius: 3px;
  display: inline-block;
}

.permission-description {
  font-size: 11px;
  color: var(--van-gray-6);
  line-height: 1.3;
}

.permission-meta {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.permission-date {
  font-size: 12px;
  color: var(--van-gray-5);
}

.permission-actions {
  display: flex;
  gap: 4px;
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
  .permission-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .permission-actions {
    flex-direction: column;
  }
  
  .permission-meta {
    flex-direction: column;
    gap: 4px;
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

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .permission-item:hover {
    background-color: var(--van-background-3);
  }

  .permission-code {
    background: var(--van-background-3);
  }
}

:deep(.van-cell__right-icon) {
  display: none;
}

:deep(.van-cell) {
  padding: 16px;
  align-items: flex-start;
}

:deep(.van-cell__title) {
  flex: 1;
}

:deep(.van-button) {
  min-width: 60px;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
}
</style>
