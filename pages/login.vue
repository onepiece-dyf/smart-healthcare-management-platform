<template>
  <div class="auth-container">
    <!-- 顶部 Logo 区域 -->
    <div class="auth-header">
      <div class="auth-logo">
        <div class="logo-icon">
          <van-image
            width="48"
            height="48"
            src="/logo.svg"
            fit="contain"
            alt="智慧医疗管理平台Logo" />
        </div>
        <h1 class="auth-title">智慧医疗管理平台</h1>
        <p class="auth-subtitle">智能化、数字化的医疗运营解决方案</p>
      </div>
    </div>

    <!-- 登录说明 -->
    <div class="auth-notice">
      <van-icon name="info-o" class="notice-icon" />
      <p class="notice-text">首次使用需要完成注册并等待管理员审核</p>
    </div>

    <!-- 登录表单区域 -->
    <div class="auth-form-container">
      <div class="auth-form-card">
        <van-form @submit="onSubmit" class="auth-form">
          <!-- 登录方式选择 -->
          <van-tabs v-model:active="activeTab" class="auth-tabs">
            <van-tab title="账号密码" name="account">
              <div class="form-fields">
                <div class="field-group">
                  <van-field
                    v-model="form.username"
                    name="username"
                    label="用户名"
                    placeholder="请输入用户名"
                    :rules="[{ required: true, message: '请填写用户名' }]">
                    <template #left-icon>
                      <van-icon name="user-o" class="field-icon" />
                    </template>
                  </van-field>

                  <van-field
                    v-model="form.password"
                    type="password"
                    name="password"
                    label="密码"
                    placeholder="请输入密码"
                    :rules="[{ required: true, message: '请填写密码' }]">
                    <template #left-icon>
                      <van-icon name="lock" class="field-icon" />
                    </template>
                  </van-field>
                </div>
              </div>
            </van-tab>

            <van-tab title="手机验证码" name="phone">
              <div class="form-fields">
                <div class="field-group">
                  <van-field
                    v-model="form.phone"
                    name="phone"
                    label="手机号"
                    placeholder="请输入手机号"
                    :rules="[
                      { required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                    ]">
                    <template #left-icon>
                      <van-icon name="phone-o" class="field-icon" />
                    </template>
                  </van-field>

                  <van-field
                    v-model="form.smsCode"
                    center
                    label="验证码"
                    placeholder="请输入验证码"
                    :rules="[{ required: true, message: '请填写验证码' }]">
                    <template #left-icon>
                      <van-icon name="shield-o" class="field-icon" />
                    </template>
                    <template #button>
                      <van-button
                        size="small"
                        type="primary"
                        :disabled="!!countdown"
                        @click="sendSmsCode">
                        {{ countdown ? `${countdown}s后重试` : "发送验证码" }}
                      </van-button>
                    </template>
                  </van-field>
                </div>
              </div>
            </van-tab>
          </van-tabs>

          <!-- 记住登录和忘记密码 -->
          <div class="form-options">
            <van-checkbox v-model="form.remember" shape="square" class="remember-checkbox">
              记住登录
            </van-checkbox>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>

          <!-- 登录按钮 -->
          <div class="form-actions">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="isLoading"
              size="large"
              class="primary-button">
              登录
            </van-button>

            <!-- 生物识别登录 -->
            <van-button
              v-if="supportsBiometric"
              round
              block
              plain
              icon="fingerprint"
              size="large"
              class="biometric-button"
              @click="onBiometricLogin">
              {{ biometricType === "face" ? "面容识别" : "指纹识别" }}
            </van-button>
          </div>
        </van-form>
      </div>

      <!-- 其他登录方式 -->
      <div class="auth-other-options">
        <van-divider class="divider">其他登录方式</van-divider>

        <!-- 紧急访问 -->
        <div class="emergency-section">
          <van-button 
            type="danger" 
            plain 
            block 
            icon="warning-o" 
            class="emergency-button"
            @click="onEmergencyAccess">
            紧急访问
          </van-button>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="auth-footer">
        <!-- 注册入口 -->
        <div class="register-link">
          <span class="register-text">还没有账号？</span>
          <button class="register-button" @click="router.push('/auth/register')">
            立即注册
          </button>
        </div>

        <!-- 版权信息 -->
        <div class="copyright">
          <p class="version">版本 1.0.0</p>
          <p class="copyright-text">© 2025 智慧医疗管理平台</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { showToast, showDialog } from "vant";
import { useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const activeTab = ref("account");

// 表单数据
const form = reactive({
  username: "",
  password: "",
  phone: "",
  smsCode: "",
  remember: false
});

// 状态变量
const isLoading = ref(false);
const countdown = ref(0);
let timer: NodeJS.Timeout;
const supportsBiometric = ref(false);
const biometricType = ref<"face" | "fingerprint">("fingerprint");

// 检查生物识别支持
onMounted(async () => {
  // TODO: 实际检查设备是否支持生物识别
  supportsBiometric.value = true;
  biometricType.value = "fingerprint";
});

// 发送验证码
const sendSmsCode = async () => {
  if (countdown.value > 0) return;

  if (!form.phone) {
    showToast("请输入手机号");
    return;
  }

  try {
    // TODO: 实现发送验证码的API
    countdown.value = 60;
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    showToast("验证码已发送");
  } catch (error) {
    showToast("发送验证码失败");
  }
};

// 表单提交
const onSubmit = async () => {
  try {
    if (activeTab.value === "account") {
      await authStore.login(form.username, form.password);
    } else {
      // TODO: 实现手机验证码登录
      showToast("手机验证码登录功能开发中");
      return;
    }

    showToast("登录成功");
    router.push("/");
  } catch (error: any) {
    showToast(error.message || "登录失败");
  }
};

// 生物识别登录
const onBiometricLogin = async () => {
  try {
    // TODO: 实现生物识别登录
    showToast("生物识别登录功能开发中");
  } catch (error: any) {
    showToast({
      type: "fail",
      message: error?.message || "认证失败"
    });
  }
};

// 紧急访问
const onEmergencyAccess = () => {
  showDialog({
    title: "紧急访问",
    message: "紧急访问仅供特殊情况使用，所有操作将被记录。是否继续？",
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    confirmButtonColor: "#ee0a24"
  }).then(async () => {
    try {
      await authStore.emergencyAccess();
      showToast("紧急访问成功");
      router.push("/");
    } catch (error: any) {
      showToast(error.message || "紧急访问失败");
    }
  });
};

// 清理定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

// 禁用默认布局
definePageMeta({
  layout: "default",
  middleware: ["guest"]
});
</script>

<style scoped>
/* 认证页面统一样式 */
.auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: env(safe-area-inset-bottom, 20px);
}

/* 头部区域 */
.auth-header {
  padding: 2rem 1rem 1rem;
  text-align: center;
}

.auth-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.auth-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* 通知区域 */
.auth-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0 1rem 2rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.notice-icon {
  color: #fbbf24;
  font-size: 1.125rem;
}

.notice-text {
  color: white;
  font-size: 0.875rem;
  margin: 0;
}

/* 表单容器 */
.auth-form-container {
  max-width: 28rem;
  margin: 0 auto;
  padding: 0 1rem;
}

.auth-form-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 表单样式 */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.auth-tabs {
  :deep(.van-tabs__wrap) {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    background: #f8fafc;
  }
  
  :deep(.van-tab) {
    font-weight: 500;
  }
  
  :deep(.van-tab--active) {
    color: #3b82f6;
  }
}

.form-fields {
  padding-top: 1.5rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-icon {
  color: #6b7280;
  font-size: 1.125rem;
}

/* 表单选项 */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
}

.remember-checkbox {
  font-size: 0.875rem;
  color: #6b7280;
}

.forgot-password {
  font-size: 0.875rem;
  color: #3b82f6;
  text-decoration: none;
  transition: opacity 0.2s;
}

.forgot-password:hover {
  opacity: 0.8;
}

/* 表单操作 */
.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.primary-button {
  height: 3rem;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.biometric-button {
  height: 3rem;
  font-size: 0.875rem;
  color: #6b7280;
  border-color: #e5e7eb;
  transition: all 0.3s ease;
}

.biometric-button:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

/* 其他选项 */
.auth-other-options {
  margin-top: 2rem;
}

.divider {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.emergency-section {
  margin-top: 1rem;
}

.emergency-button {
  height: 2.5rem;
  font-size: 0.875rem;
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  transition: all 0.3s ease;
}

.emergency-button:hover {
  background: rgba(239, 68, 68, 0.05);
  border-color: #ef4444;
}

/* 底部信息 */
.auth-footer {
  margin-top: 2rem;
  padding: 0 1rem;
}

.register-link {
  text-align: center;
  margin-bottom: 1.5rem;
}

.register-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.register-button {
  font-size: 0.875rem;
  color: white;
  background: none;
  border: none;
  font-weight: 600;
  text-decoration: underline;
  margin-left: 0.5rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.register-button:hover {
  opacity: 0.8;
}

.copyright {
  text-align: center;
}

.version {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.copyright-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0.25rem 0 0;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .auth-form-card {
    padding: 1.5rem;
    margin: 0 0.5rem;
  }
  
  .auth-title {
    font-size: 1.5rem;
  }
  
  .logo-icon {
    width: 64px;
    height: 64px;
  }
}
</style>
