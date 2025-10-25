<template>
  <div class="profile-edit-page">
    <!-- 顶部 Hero -->
    <HeroHeader
      title="编辑资料"
      subtitle="修改个人信息"
      :showDate="false">
      <template #actions>
        <div class="col-span-4 flex justify-end gap-2">
          <van-button 
            size="small" 
            icon="arrow-left"
            @click="goBack">
            返回
          </van-button>
          <van-button 
            size="small" 
            type="primary" 
            @click="saveProfile"
            :loading="saving">
            保存
          </van-button>
        </div>
      </template>
    </HeroHeader>

    <!-- 编辑表单 -->
    <div class="px-4 pb-4">
      <SectionCard title="基本信息">
        <van-form @submit="saveProfile">
          <!-- 头像上传 -->
          <van-cell title="头像">
            <template #value>
              <div class="flex items-center space-x-4">
                <van-image
                  round
                  width="60"
                  height="60"
                  :src="formData.avatar || defaultAvatar" />
                <van-button size="small" type="primary" @click="uploadAvatar">
                  更换头像
                </van-button>
              </div>
            </template>
          </van-cell>

          <!-- 基本信息字段 -->
          <van-field
            v-model="formData.name"
            name="name"
            label="姓名"
            placeholder="请输入姓名"
            :rules="[{ required: true, message: '请输入姓名' }]" />
          
          <van-field
            v-model="formData.username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请输入用户名' }]" />
          
          <van-field
            v-model="formData.phone"
            name="phone"
            label="手机号"
            type="tel"
            placeholder="请输入手机号"
            :rules="[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]" />
          
          <van-field
            v-model="formData.email"
            name="email"
            label="邮箱"
            type="email"
            placeholder="请输入邮箱"
            :rules="[
              { required: true, message: '请输入邮箱' },
              { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱' }
            ]" />
          
          <van-field
            v-model="formData.employeeId"
            name="employeeId"
            label="工号"
            placeholder="请输入工号"
            :rules="[{ required: true, message: '请输入工号' }]" />
          
          <van-field
            v-model="formData.department"
            name="department"
            label="科室"
            placeholder="请输入科室"
            :rules="[{ required: true, message: '请输入科室' }]" />
        </van-form>
      </SectionCard>
    </div>

    <!-- 其他信息 -->
    <div class="px-4 pb-4">
      <SectionCard title="其他信息">
        <van-form>
          <van-field
            v-model="formData.bio"
            name="bio"
            label="个人简介"
            type="textarea"
            placeholder="请输入个人简介"
            maxlength="200"
            show-word-limit />
          
          <van-field
            v-model="formData.address"
            name="address"
            label="地址"
            placeholder="请输入地址" />
          
          <van-field
            v-model="formData.emergencyContact"
            name="emergencyContact"
            label="紧急联系人"
            placeholder="请输入紧急联系人" />
          
          <van-field
            v-model="formData.emergencyPhone"
            name="emergencyPhone"
            label="紧急联系电话"
            type="tel"
            placeholder="请输入紧急联系电话" />
        </van-form>
      </SectionCard>
    </div>

    <!-- 头像上传弹窗 -->
    <van-popup v-model:show="showAvatarUpload" position="center" :style="{ width: '90%' }">
      <div class="p-4">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold">更换头像</h3>
          <van-icon name="cross" @click="showAvatarUpload = false" />
        </div>
        <div class="text-center">
          <van-image
            round
            width="120"
            height="120"
            :src="tempAvatar || defaultAvatar"
            class="mx-auto mb-4" />
          <van-button type="primary" @click="selectImage">选择图片</van-button>
          <van-button class="ml-2" @click="showAvatarUpload = false">取消</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";

const router = useRouter();

// 响应式数据
const saving = ref(false);
const showAvatarUpload = ref(false);
const defaultAvatar = "https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg";
const tempAvatar = ref("");

// 表单数据
const formData = ref({
  name: "张医生",
  username: "doctor1",
  phone: "13800138000",
  email: "doctor1@hospital.com",
  employeeId: "EMP001",
  department: "心血管内科",
  avatar: "",
  bio: "专业的心血管内科医生，拥有丰富的临床经验。",
  address: "北京市朝阳区医院路123号",
  emergencyContact: "张夫人",
  emergencyPhone: "13900139000"
});

// 方法
const goBack = () => {
  router.back();
};

const saveProfile = async () => {
  try {
    saving.value = true;
    
    // 验证表单
    if (!formData.value.name) {
      showToast("请输入姓名");
      return;
    }
    
    if (!formData.value.phone || !/^1[3-9]\d{9}$/.test(formData.value.phone)) {
      showToast("请输入正确的手机号");
      return;
    }
    
    if (!formData.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
      showToast("请输入正确的邮箱");
      return;
    }
    
    // 这里应该调用API保存数据
    // await updateUserProfile(formData.value);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showToast("保存成功");
    router.back();
  } catch (error) {
    console.error("保存失败:", error);
    showToast("保存失败");
  } finally {
    saving.value = false;
  }
};

const uploadAvatar = () => {
  showAvatarUpload.value = true;
};

const selectImage = () => {
  // 这里应该实现图片选择功能
  showToast("图片选择功能开发中");
  showAvatarUpload.value = false;
};

// 生命周期
onMounted(() => {
  // 加载用户数据
  // loadUserData();
});

definePageMeta({
  layout: "admin",
  title: "编辑资料",
  requiresAuth: true,
  middleware: "auth"
});
</script>

<style scoped>
.profile-edit-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* 表单样式 */
.van-field {
  padding: 12px 16px;
}

.van-field__label {
  font-weight: 500;
  color: #374151;
  min-width: 80px;
}

/* 头像上传区域 */
.flex.items-center.space-x-4 {
  align-items: center;
}

/* 按钮样式 */
.van-button {
  border-radius: 8px;
}

/* 弹窗样式 */
.van-popup {
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .px-4 {
    padding-left: 16px;
    padding-right: 16px;
  }
}

/* 加载状态 */
.van-button--loading {
  opacity: 0.7;
}

/* 表单验证样式 */
.van-field--error .van-field__control {
  color: #ef4444;
}

/* 头像预览 */
.van-image {
  border: 2px solid #e5e7eb;
  transition: border-color 0.2s ease;
}

.van-image:hover {
  border-color: #3b82f6;
}
</style>
