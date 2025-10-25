<template>
  <div class="ward-edit-page">
    <!-- 顶部 Hero -->
    <HeroHeader
      title="编辑科室"
      subtitle="修改科室基本信息"
      :showDate="false">
      <template #actions>
        <van-button
          type="default"
          size="small"
          icon="arrow-left"
          @click="onCancel">
          返回
        </van-button>
      </template>
    </HeroHeader>

    <!-- 编辑表单 -->
    <div class="px-4 pb-4">
      <SectionCard>
        <van-form @submit="onSubmit" ref="formRef">
          <!-- 基本信息 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-4">基本信息</h3>
            
            <div class="space-y-4">
              <!-- 科室名称 -->
              <van-field
                v-model="form.name"
                name="name"
                label="科室名称"
                placeholder="请输入科室名称"
                :rules="[{ required: true, message: '请输入科室名称' }]"
                left-icon="hospital-o"
                clearable />

              <!-- 科室代码 -->
              <van-field
                v-model="form.code"
                name="code"
                label="科室代码"
                placeholder="请输入科室代码"
                :rules="[{ required: true, message: '请输入科室代码' }]"
                left-icon="qr"
                clearable />

              <!-- 所属部门 -->
              <van-field
                v-model="form.department"
                name="department"
                label="所属部门"
                placeholder="请输入所属部门"
                :rules="[{ required: true, message: '请输入所属部门' }]"
                left-icon="cluster-o"
                clearable />

              <!-- 楼层 -->
              <van-field
                v-model.number="form.floor"
                name="floor"
                label="所在楼层"
                placeholder="请输入楼层数"
                type="number"
                :rules="[
                  { required: true, message: '请输入楼层数' },
                  { pattern: /^[1-9]\d*$/, message: '楼层数必须为正整数' }
                ]"
                left-icon="location-o"
                clearable />

              <!-- 所在建筑 -->
              <van-field
                v-model="form.building"
                name="building"
                label="所在建筑"
                placeholder="请输入所在建筑"
                :rules="[{ required: true, message: '请输入所在建筑' }]"
                left-icon="home-o"
                clearable />

              <!-- 科室状态 -->
              <van-field name="status" label="科室状态">
                <template #input>
                  <van-radio-group v-model="form.status" direction="horizontal">
                    <van-radio name="ACTIVE">正常</van-radio>
                    <van-radio name="INACTIVE">维护中</van-radio>
                  </van-radio-group>
                </template>
              </van-field>

              <!-- 科室描述 -->
              <van-field
                v-model="form.description"
                name="description"
                label="科室描述"
                type="textarea"
                placeholder="请输入科室描述"
                rows="3"
                autosize
                maxlength="200"
                show-word-limit
                left-icon="description" />
            </div>
          </div>

          <!-- 床位配置 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-4">床位配置</h3>
            
            <div class="space-y-4">
              <!-- 总床位数 -->
              <van-field
                v-model.number="form.totalBeds"
                name="totalBeds"
                label="总床位数"
                placeholder="请输入总床位数"
                type="number"
                :rules="[
                  { required: true, message: '请输入总床位数' },
                  { pattern: /^[1-9]\d*$/, message: '床位数必须为正整数' }
                ]"
                left-icon="hotel-o"
                clearable />

              <!-- 总房间数 -->
              <van-field
                v-model.number="form.totalRooms"
                name="totalRooms"
                label="总房间数"
                placeholder="请输入总房间数"
                type="number"
                :rules="[
                  { required: true, message: '请输入总房间数' },
                  { pattern: /^[1-9]\d*$/, message: '房间数必须为正整数' }
                ]"
                left-icon="home-o"
                clearable />
            </div>
          </div>

          <!-- 人员配置 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-4">人员配置</h3>
            
            <div class="space-y-4">
              <!-- 医生人数 -->
              <van-field
                v-model.number="form.doctorCount"
                name="doctorCount"
                label="医生人数"
                placeholder="请输入医生人数"
                type="number"
                :rules="[
                  { required: true, message: '请输入医生人数' },
                  { pattern: /^\d+$/, message: '人数必须为非负整数' }
                ]"
                left-icon="user-o"
                clearable />

              <!-- 护士人数 -->
              <van-field
                v-model.number="form.nurseCount"
                name="nurseCount"
                label="护士人数"
                placeholder="请输入护士人数"
                type="number"
                :rules="[
                  { required: true, message: '请输入护士人数' },
                  { pattern: /^\d+$/, message: '人数必须为非负整数' }
                ]"
                left-icon="contact"
                clearable />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-3 pt-4">
            <van-button
              type="default"
              size="large"
              @click="onCancel"
              class="flex-1">
              取消
            </van-button>
            <van-button
              type="primary"
              size="large"
              native-type="submit"
              :loading="loading"
              class="flex-1">
              保存修改
            </van-button>
          </div>
        </van-form>
      </SectionCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import { useWardStore } from '~/stores/wardStore';
import type { Ward, WardStatus } from '~/types/models/ward';

const route = useRoute();
const router = useRouter();
const wardStore = useWardStore();

const formRef = ref();
const loading = ref(false);
const wardId = parseInt(route.params.id as string);

// 表单数据
const form = reactive({
  name: '',
  code: '',
  department: '',
  floor: 1,
  building: '',
  description: '',
  status: 'ACTIVE' as WardStatus,
  totalBeds: 0,
  totalRooms: 0,
  doctorCount: 0,
  nurseCount: 0
});

// 加载科室数据
const loadWardData = async () => {
  try {
    loading.value = true;
    
    // 直接获取病区详情
    const ward = await wardStore.fetchWardById(wardId);
    
    if (!ward) {
      showToast('科室不存在');
      router.push('/ward');
      return;
    }

    // 填充表单数据
    Object.assign(form, {
      name: ward.name || '',
      code: ward.code || '',
      department: ward.department || '',
      floor: ward.floor || 1,
      building: ward.building || '',
      description: ward.description || '',
      status: ward.status || 'ACTIVE',
      totalBeds: ward.totalBeds || 0,
      totalRooms: ward.totalRooms || 0,
      doctorCount: ward.doctorCount || 0,
      nurseCount: ward.nurseCount || 0
    });
  } catch (error) {
    console.error('加载科室数据失败:', error);
    showToast('加载科室数据失败');
  } finally {
    loading.value = false;
  }
};

// 提交表单
const onSubmit = async () => {
  try {
    // 验证表单
    await formRef.value?.validate();
    
    // 显示确认对话框
    await showDialog({
      title: '确认修改',
      message: '确定要保存对科室信息的修改吗？',
      confirmButtonText: '确定保存',
      cancelButtonText: '取消'
    });
    
    loading.value = true;
    
    // 准备更新数据
    const updateData: Partial<Ward> = {
      name: form.name,
      code: form.code,
      department: form.department,
      floor: form.floor,
      building: form.building,
      description: form.description,
      status: form.status,
      totalBeds: form.totalBeds,
      totalRooms: form.totalRooms,
      doctorCount: form.doctorCount,
      nurseCount: form.nurseCount,
      totalStaff: form.doctorCount + form.nurseCount,
      updatedAt: new Date()
    };

    // 更新病区
    const success = await wardStore.updateWard(wardId, updateData);
    
    if (success) {
      showToast('科室信息更新成功');
      router.push(`/ward/${wardId}`);
    } else {
      showToast('更新失败，请重试');
    }
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消操作，不做任何处理
      return;
    }
    console.error('更新科室失败:', error);
    showToast('更新失败，请检查输入信息');
  } finally {
    loading.value = false;
  }
};

// 取消编辑
const onCancel = () => {
  showDialog({
    title: '确认取消',
    message: '确定要取消编辑吗？未保存的修改将丢失。',
    confirmButtonText: '确定取消',
    cancelButtonText: '继续编辑'
  }).then(() => {
    router.push(`/ward/${wardId}`);
  }).catch(() => {
    // 用户选择继续编辑，不做任何操作
  });
};

onMounted(() => {
  loadWardData();
});

definePageMeta({
  layout: "admin",
  title: "编辑科室",
  middleware: "auth"
});
</script>

<style scoped>
.ward-edit-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* 表单样式优化 */
:deep(.van-field__label) {
  font-weight: 500;
  color: #374151;
}

:deep(.van-field__control) {
  color: #1f2937;
}

:deep(.van-radio-group) {
  display: flex;
  gap: 1rem;
}

:deep(.van-radio) {
  margin-right: 0;
}

/* 按钮样式 */
.van-button {
  border-radius: 8px;
  font-weight: 500;
}

.van-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.van-button--default {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.van-button--default:hover {
  background: #f9fafb;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .van-button {
    font-size: 14px;
  }
}

/* 表单分组样式 */
.mb-6 h3 {
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

/* 输入框聚焦效果 */
:deep(.van-field--focused .van-field__control) {
  color: #2563eb;
}

/* 单选按钮样式 */
:deep(.van-radio__label) {
  color: #374151;
  font-weight: 500;
}

:deep(.van-radio__icon--checked .van-icon) {
  background-color: #2563eb;
  border-color: #2563eb;
}
</style>
