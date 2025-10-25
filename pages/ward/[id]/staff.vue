<template>
  <div class="ward-staff-page">
    <!-- 顶部 Hero -->
    <HeroHeader
      title="人员管理"
      subtitle="管理病区医护人员"
      :showDate="false">
      <template #actions>
        <van-button
          type="primary"
          size="small"
          icon="plus"
          @click="showAddStaffDialog = true">
          添加人员
        </van-button>
      </template>
    </HeroHeader>

    <!-- 统计卡片 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="grid grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ staffStats.total }}</div>
            <div class="text-sm text-gray-500">总人数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ staffStats.doctors }}</div>
            <div class="text-sm text-gray-500">医生</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ staffStats.nurses }}</div>
            <div class="text-sm text-gray-500">护士</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ staffStats.managers }}</div>
            <div class="text-sm text-gray-500">管理员</div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 搜索和筛选 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="space-y-4">
          <!-- 搜索框 -->
          <van-field
            v-model="searchKeyword"
            placeholder="搜索姓名、用户名、部门或职位"
            left-icon="search"
            clearable
            @input="onSearch" />

          <!-- 筛选标签 -->
          <div class="flex flex-wrap gap-2">
            <van-tag
              v-for="filter in roleFilters"
              :key="filter.value"
              :type="activeRoleFilter === filter.value ? 'primary' : 'default'"
              size="medium"
              @click="onRoleFilter(filter.value)">
              {{ filter.label }}
            </van-tag>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 人员列表 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <div class="mb-4">
          <h3 class="text-lg font-semibold">人员列表</h3>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-8">
          <van-loading type="spinner" size="24px" />
          <div class="mt-2 text-gray-500">加载中...</div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredStaff.length === 0" class="text-center py-8">
          <van-icon name="user-o" size="48" class="text-gray-300" />
          <div class="mt-2 text-gray-500">暂无人员数据</div>
        </div>

        <!-- 人员卡片列表 -->
        <div v-else class="space-y-3">
          <div
            v-for="staff in filteredStaff"
            :key="staff.id"
            class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <!-- 头像 -->
                <van-image
                  :src="staff.user?.avatar || '/default-avatar.svg'"
                  width="48"
                  height="48"
                  round
                  :error-icon="'user-circle-o'" />

                <!-- 基本信息 -->
                <div>
                  <div class="font-medium text-gray-900">
                    {{ staff.user?.name || '未知用户' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ staff.user?.username || '未知' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ staff.user?.department || '未知部门' }} · {{ staff.user?.position || '未知职位' }}
                  </div>
                </div>
              </div>

              <!-- 角色和操作 -->
              <div class="flex flex-col items-end space-y-2">
                <van-tag
                  :type="getRoleTagType(staff.role)"
                  size="medium">
                  {{ getRoleLabel(staff.role) }}
                </van-tag>
                
                <div class="flex space-x-2">
                  <van-button
                    type="default"
                    size="mini"
                    icon="edit"
                    @click="editStaff(staff)">
                    编辑
                  </van-button>
                  <van-button
                    type="danger"
                    size="mini"
                    icon="delete"
                    @click="removeStaff(staff)">
                    移除
                  </van-button>
                </div>
              </div>
            </div>

            <!-- 详细信息 -->
            <div class="mt-3 pt-3 border-t border-gray-100">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">班次：</span>
                  <span class="text-gray-900">{{ staff.shift }}</span>
                </div>
                <div>
                  <span class="text-gray-500">状态：</span>
                  <van-tag
                    :type="staff.isActive ? 'success' : 'default'"
                    size="mini">
                    {{ staff.isActive ? '在职' : '离职' }}
                  </van-tag>
                </div>
                <div>
                  <span class="text-gray-500">分配时间：</span>
                  <span class="text-gray-900">{{ formatDate(staff.assignedAt) }}</span>
                </div>
                <div>
                  <span class="text-gray-500">联系方式：</span>
                  <span class="text-gray-900">{{ staff.user?.phone || '未设置' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 添加人员对话框 -->
    <van-dialog
      v-model:show="showAddStaffDialog"
      title="添加人员"
      show-cancel-button
      @confirm="onAddStaff">
      <div class="p-4">
        <van-form ref="addStaffFormRef">
          <van-field
            v-model="addStaffForm.userId"
            name="userId"
            label="选择用户"
            placeholder="请选择用户"
            readonly
            @click="showUserPicker = true" />

          <van-field
            v-model="addStaffForm.role"
            name="role"
            label="角色"
            placeholder="请选择角色">
            <template #input>
              <van-radio-group v-model="addStaffForm.role" direction="horizontal">
                <van-radio name="doctor">医生</van-radio>
                <van-radio name="nurse">护士</van-radio>
                <van-radio name="manager">管理员</van-radio>
              </van-radio-group>
            </template>
          </van-field>

          <van-field
            v-model="addStaffForm.shift"
            name="shift"
            label="班次"
            placeholder="请输入班次"
            :rules="[{ required: true, message: '请输入班次' }]" />
        </van-form>
      </div>
    </van-dialog>

    <!-- 用户选择器 -->
    <van-popup v-model:show="showUserPicker" position="bottom">
      <van-picker
        :columns="userColumns"
        @confirm="onUserSelect"
        @cancel="showUserPicker = false" />
    </van-popup>

    <!-- 编辑人员对话框 -->
    <van-dialog
      v-model:show="showEditStaffDialog"
      title="编辑人员"
      show-cancel-button
      @confirm="onUpdateStaff">
      <div class="p-4">
        <van-form ref="editStaffFormRef">
          <van-field
            v-model="editStaffForm.role"
            name="role"
            label="角色"
            placeholder="请选择角色">
            <template #input>
              <van-radio-group v-model="editStaffForm.role" direction="horizontal">
                <van-radio name="doctor">医生</van-radio>
                <van-radio name="nurse">护士</van-radio>
                <van-radio name="manager">管理员</van-radio>
              </van-radio-group>
            </template>
          </van-field>

          <van-field
            v-model="editStaffForm.shift"
            name="shift"
            label="班次"
            placeholder="请输入班次"
            :rules="[{ required: true, message: '请输入班次' }]" />

          <van-field
            v-model="editStaffForm.isActive"
            name="isActive"
            label="状态"
            placeholder="请选择状态">
            <template #input>
              <van-radio-group v-model="editStaffForm.isActive" direction="horizontal">
                <van-radio :name="true">在职</van-radio>
                <van-radio :name="false">离职</van-radio>
              </van-radio-group>
            </template>
          </van-field>
        </van-form>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import { useStaffStore, WardStaffRole } from '~/stores/staffStore';
import { formatDate } from '~/utils/date';

const route = useRoute();
const router = useRouter();
const staffStore = useStaffStore();

const wardId = parseInt(route.params.id as string);

// 响应式数据
const loading = ref(false);
const searchKeyword = ref('');
const activeRoleFilter = ref('all');
const showAddStaffDialog = ref(false);
const showEditStaffDialog = ref(false);
const showUserPicker = ref(false);
const filteredStaff = ref([]);

// 表单引用
const addStaffFormRef = ref();
const editStaffFormRef = ref();

// 添加人员表单
const addStaffForm = reactive({
  userId: null as number | null,
  role: 'doctor' as string,
  shift: '白班'
});

// 编辑人员表单
const editStaffForm = reactive({
  id: null as number | null,
  role: 'doctor' as string,
  shift: '白班',
  isActive: true
});

// 角色筛选选项
const roleFilters = [
  { label: '全部', value: 'all' },
  { label: '医生', value: 'doctor' },
  { label: '护士', value: 'nurse' },
  { label: '管理员', value: 'manager' }
];

// 用户选择器列
const userColumns = computed(() => {
  const availableUsers = staffStore.getAvailableUsers(wardId);
  return availableUsers.map(user => ({
    text: `${user.name} (${user.username})`,
    value: user.id
  }));
});

// 人员统计
const staffStats = computed(() => {
  const wardStaff = staffStore.getWardStaff(wardId);
  console.log('计算人员统计:', {
    wardId,
    wardStaff: wardStaff.length,
    staff: staffStore.staff.length,
    users: staffStore.users.length
  });
  return {
    total: wardStaff.length,
    doctors: wardStaff.filter(s => s.role === WardStaffRole.DOCTOR).length,
    nurses: wardStaff.filter(s => s.role === WardStaffRole.NURSE).length,
    managers: wardStaff.filter(s => s.role === WardStaffRole.MANAGER).length
  };
});

// 获取角色标签类型
const getRoleTagType = (role: string) => {
  switch (role) {
    case 'doctor': return 'primary';
    case 'nurse': return 'success';
    case 'manager': return 'warning';
    default: return 'default';
  }
};

// 获取角色标签文本
const getRoleLabel = (role: string) => {
  switch (role) {
    case 'doctor': return '医生';
    case 'nurse': return '护士';
    case 'manager': return '管理员';
    default: return '未知';
  }
};

// 搜索处理
const onSearch = async () => {
  if (!searchKeyword.value.trim()) {
    await loadStaff();
    return;
  }
  
  loading.value = true;
  try {
    filteredStaff.value = await staffStore.searchStaff(wardId, searchKeyword.value);
  } catch (error) {
    console.error('搜索失败:', error);
    showToast('搜索失败');
  } finally {
    loading.value = false;
  }
};

// 角色筛选
const onRoleFilter = async (role: string) => {
  activeRoleFilter.value = role;
  await loadStaff();
};

// 加载人员数据
const loadStaff = async () => {
  try {
    loading.value = true;
    
    // 先获取所有人员数据
    await staffStore.fetchStaff();
    await staffStore.fetchUsers();
    
    // 然后获取指定病区的人员
    const staff = await staffStore.fetchWardStaff(wardId);
    
    // 应用角色筛选
    if (activeRoleFilter.value === 'all') {
      filteredStaff.value = staff;
    } else {
      filteredStaff.value = staff.filter(s => s.role === activeRoleFilter.value);
    }
    
    console.log('人员数据加载完成:', {
      wardId,
      staffCount: staff.length,
      filteredCount: filteredStaff.value.length,
      activeFilter: activeRoleFilter.value
    });
  } catch (error) {
    console.error('加载人员数据失败:', error);
    showToast('加载人员数据失败');
  } finally {
    loading.value = false;
  }
};

// 用户选择
const onUserSelect = ({ selectedValues }: { selectedValues: number[] }) => {
  addStaffForm.userId = selectedValues[0];
  showUserPicker.value = false;
};

// 添加人员
const onAddStaff = async () => {
  try {
    if (!addStaffForm.userId) {
      showToast('请选择用户');
      return;
    }

    const success = await staffStore.addStaffToWard(
      wardId,
      addStaffForm.userId,
      addStaffForm.role as WardStaffRole,
      addStaffForm.shift
    );

    if (success) {
      showToast('添加成功');
      showAddStaffDialog.value = false;
      await loadStaff();
      
      // 重置表单
      Object.assign(addStaffForm, {
        userId: null,
        role: 'doctor',
        shift: '白班'
      });
    } else {
      showToast('添加失败');
    }
  } catch (error) {
    console.error('添加人员失败:', error);
    showToast('添加失败');
  }
};

// 编辑人员
const editStaff = (staff: any) => {
  Object.assign(editStaffForm, {
    id: staff.id,
    role: staff.role,
    shift: staff.shift,
    isActive: staff.isActive
  });
  showEditStaffDialog.value = true;
};

// 更新人员
const onUpdateStaff = async () => {
  try {
    if (!editStaffForm.id) return;

    const success = await staffStore.updateStaff(editStaffForm.id, {
      role: editStaffForm.role as WardStaffRole,
      shift: editStaffForm.shift,
      isActive: editStaffForm.isActive
    });

    if (success) {
      showToast('更新成功');
      showEditStaffDialog.value = false;
      await loadStaff();
    } else {
      showToast('更新失败');
    }
  } catch (error) {
    console.error('更新人员失败:', error);
    showToast('更新失败');
  }
};

// 移除人员
const removeStaff = (staff: any) => {
  showDialog({
    title: '确认移除',
    message: `确定要移除 ${staff.user?.name || '该用户'} 吗？`,
    confirmButtonText: '确定移除',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      const success = await staffStore.removeStaffFromWard(staff.id);
      if (success) {
        showToast('移除成功');
        await loadStaff();
      } else {
        showToast('移除失败');
      }
    } catch (error) {
      console.error('移除人员失败:', error);
      showToast('移除失败');
    }
  });
};

onMounted(() => {
  loadStaff();
});

definePageMeta({
  layout: "admin",
  title: "人员管理",
  middleware: "auth"
});
</script>

<style scoped>
.ward-staff-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* 统计卡片样式 */
.grid > div {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 8px;
  padding: 1rem;
}

/* 人员卡片样式 */
.space-y-3 > div {
  transition: all 0.2s ease;
}

.space-y-3 > div:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 标签样式 */
.van-tag {
  font-weight: 500;
}

/* 按钮样式 */
.van-button--mini {
  font-size: 12px;
  padding: 0 8px;
  height: 24px;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .grid {
    gap: 0.75rem;
  }
  
  .grid > div {
    padding: 0.75rem;
  }
}
</style>
