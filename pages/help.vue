<template>
  <div class="help-page">
    <!-- 顶部 Hero -->
    <HeroHeader
      title="帮助中心"
      subtitle="常见问题解答与技术支持"
      :showDate="true">
      <template #actions>
        <div class="col-span-4 flex justify-end gap-2">
          <van-button 
            size="small" 
            type="primary" 
            icon="search"
            @click="showSearch = true">
            搜索帮助
          </van-button>
          <van-button 
            size="small" 
            icon="phone-o"
            @click="contactSupport">
            联系客服
          </van-button>
        </div>
      </template>
    </HeroHeader>

    <!-- 搜索框 -->
    <div class="px-4 pb-4">
      <van-search
        v-model="searchText"
        placeholder="搜索帮助内容..."
        @search="handleSearch"
        @clear="handleClearSearch"
        class="search-input" />
    </div>

    <!-- 快速帮助 -->
    <div class="px-4 pb-4">
      <SectionCard title="快速帮助">
        <div class="grid grid-cols-2 gap-3">
          <div 
            v-for="item in quickHelp" 
            :key="item.title"
            class="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 group"
            @click="openHelpItem(item)">
            <div class="w-12 h-12 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200"
                 :style="{ backgroundColor: item.color + '20' }">
              <van-icon :name="item.icon" size="20" :color="item.color" />
            </div>
            <span class="text-sm text-gray-600 font-medium text-center">{{ item.title }}</span>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 常见问题 -->
    <div class="px-4 pb-4">
      <SectionCard title="常见问题">
        <van-collapse v-model="activeCollapse">
          <van-collapse-item 
            v-for="faq in filteredFAQs" 
            :key="faq.id"
            :title="faq.question"
            :name="faq.id">
            <div class="p-4 text-gray-700 leading-relaxed">
              {{ faq.answer }}
            </div>
            <div v-if="faq.steps && faq.steps.length > 0" class="mt-4">
              <h4 class="font-medium text-gray-900 mb-2">操作步骤：</h4>
              <ol class="list-decimal list-inside space-y-2 text-sm">
                <li v-for="(step, index) in faq.steps" :key="index" class="text-gray-600">
                  {{ step }}
                </li>
              </ol>
            </div>
          </van-collapse-item>
        </van-collapse>
      </SectionCard>
    </div>

    <!-- 功能指南 -->
    <div class="px-4 pb-4">
      <SectionCard title="功能指南">
        <van-cell-group>
          <van-cell 
            v-for="guide in guides" 
            :key="guide.id"
            :title="guide.title"
            :label="guide.description"
            is-link
            @click="openGuide(guide)">
            <template #icon>
              <van-icon :name="guide.icon" size="20" :color="guide.color" class="mr-2" />
            </template>
          </van-cell>
        </van-cell-group>
      </SectionCard>
    </div>

    <!-- 视频教程 -->
    <div class="px-4 pb-4">
      <SectionCard title="视频教程">
        <div class="grid grid-cols-1 gap-4">
          <div 
            v-for="video in videos" 
            :key="video.id"
            class="flex items-center p-4 rounded-xl border border-gray-200 hover:shadow-md cursor-pointer transition-all duration-200"
            @click="playVideo(video)">
            <div class="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
              <van-icon name="play" size="20" color="#666" />
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-gray-900 mb-1">{{ video.title }}</h4>
              <p class="text-sm text-gray-600 mb-1">{{ video.description }}</p>
              <div class="flex items-center text-xs text-gray-500">
                <van-icon name="clock-o" size="12" class="mr-1" />
                <span>{{ video.duration }}</span>
                <span class="mx-2">•</span>
                <span>{{ video.views }} 次观看</span>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 联系我们 -->
    <div class="px-4 pb-4">
      <SectionCard title="联系我们">
        <div class="grid grid-cols-1 gap-4">
          <div class="flex items-center p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
              <van-icon name="phone-o" size="20" color="white" />
            </div>
            <div>
              <h4 class="font-medium text-gray-900">客服热线</h4>
              <p class="text-sm text-gray-600">400-123-4567</p>
              <p class="text-xs text-gray-500">工作时间：9:00-18:00</p>
            </div>
          </div>
          
          <div class="flex items-center p-4 rounded-xl bg-green-50 border border-green-200">
            <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
              <van-icon name="envelop-o" size="20" color="white" />
            </div>
            <div>
              <h4 class="font-medium text-gray-900">邮箱支持</h4>
              <p class="text-sm text-gray-600">support@hospital.com</p>
              <p class="text-xs text-gray-500">24小时内回复</p>
            </div>
          </div>
          
          <div class="flex items-center p-4 rounded-xl bg-purple-50 border border-purple-200">
            <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
              <van-icon name="chat-o" size="20" color="white" />
            </div>
            <div>
              <h4 class="font-medium text-gray-900">在线客服</h4>
              <p class="text-sm text-gray-600">即时响应</p>
              <p class="text-xs text-gray-500">工作时间：9:00-21:00</p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 搜索弹窗 -->
    <van-popup v-model:show="showSearch" position="top" :style="{ height: '60%' }" round>
      <div class="p-6">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-900">搜索帮助</h3>
          <van-icon name="cross" size="20" @click="showSearch = false" class="text-gray-400" />
        </div>
        <van-search
          v-model="searchText"
          placeholder="输入关键词搜索..."
          @search="handleSearch"
          @clear="handleClearSearch" />
        <div v-if="searchResults.length > 0" class="mt-4">
          <h4 class="font-medium text-gray-900 mb-2">搜索结果：</h4>
          <div class="space-y-2">
            <div 
              v-for="result in searchResults" 
              :key="result.id"
              class="p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100"
              @click="openSearchResult(result)">
              <h5 class="font-medium text-gray-900">{{ result.title }}</h5>
              <p class="text-sm text-gray-600">{{ result.description }}</p>
            </div>
          </div>
        </div>
        <div v-else-if="searchText" class="mt-4 text-center text-gray-500">
          未找到相关帮助内容
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { showToast, showDialog } from "vant";

// 页面元数据
definePageMeta({
  layout: "admin",
  title: "帮助中心",
  middleware: "auth"
});

// 响应式数据
const searchText = ref("");
const showSearch = ref(false);
const activeCollapse = ref<string[]>([]);

// 快速帮助
const quickHelp = [
  {
    title: "登录问题",
    icon: "user-o",
    color: "#1989fa",
    type: "login"
  },
  {
    title: "密码重置",
    icon: "lock",
    color: "#ff6b6b",
    type: "password"
  },
  {
    title: "患者管理",
    icon: "user-circle-o",
    color: "#4ecdc4",
    type: "patient"
  },
  {
    title: "医嘱管理",
    icon: "orders-o",
    color: "#45b7d1",
    type: "order"
  },
  {
    title: "床位管理",
    icon: "hospital-o",
    color: "#96ceb4",
    type: "bed"
  },
  {
    title: "系统设置",
    icon: "setting-o",
    color: "#feca57",
    type: "settings"
  }
];

// 常见问题
const faqs = [
  {
    id: "1",
    question: "如何重置密码？",
    answer: "您可以通过以下方式重置密码：1. 在登录页面点击'忘记密码'；2. 输入您的用户名或邮箱；3. 按照系统提示完成密码重置。",
    steps: [
      "点击登录页面的'忘记密码'链接",
      "输入您的用户名或注册邮箱",
      "检查邮箱中的重置链接",
      "点击链接并设置新密码",
      "使用新密码登录系统"
    ],
    category: "login"
  },
  {
    id: "2",
    question: "如何添加新患者？",
    answer: "在患者管理页面，点击'新增患者'按钮，填写患者基本信息，包括姓名、性别、年龄、联系方式等，然后保存即可。",
    steps: [
      "进入患者管理页面",
      "点击右上角的'新增患者'按钮",
      "填写患者基本信息",
      "选择所属科室和床位",
      "点击保存完成添加"
    ],
    category: "patient"
  },
  {
    id: "3",
    question: "如何创建医嘱？",
    answer: "在医嘱管理页面，选择患者后点击'新增医嘱'，填写医嘱内容、执行时间、频率等信息，提交审核即可。",
    steps: [
      "进入医嘱管理页面",
      "选择目标患者",
      "点击'新增医嘱'按钮",
      "填写医嘱详细信息",
      "设置执行时间和频率",
      "提交审核"
    ],
    category: "order"
  },
  {
    id: "4",
    question: "如何查看床位状态？",
    answer: "在病区管理页面，可以查看所有床位的占用情况，包括已占用、可用、维护中等状态。",
    steps: [
      "进入病区管理页面",
      "选择要查看的病区",
      "查看床位列表",
      "根据颜色标识判断床位状态"
    ],
    category: "bed"
  },
  {
    id: "5",
    question: "系统支持哪些浏览器？",
    answer: "系统支持Chrome、Firefox、Safari、Edge等主流浏览器，建议使用最新版本以获得最佳体验。",
    category: "system"
  },
  {
    id: "6",
    question: "如何导出数据？",
    answer: "在相应的管理页面，点击'导出'按钮，选择导出格式（Excel、PDF等），确认后即可下载数据文件。",
    steps: [
      "进入需要导出数据的页面",
      "点击'导出'按钮",
      "选择导出格式",
      "确认导出范围",
      "点击确认下载文件"
    ],
    category: "export"
  }
];

// 功能指南
const guides = [
  {
    id: "1",
    title: "系统入门指南",
    description: "新用户必读，快速了解系统功能",
    icon: "book-o",
    color: "#1989fa",
    content: "系统入门指南内容..."
  },
  {
    id: "2",
    title: "患者管理操作手册",
    description: "详细的患者管理功能说明",
    icon: "user-o",
    color: "#4ecdc4",
    content: "患者管理操作手册内容..."
  },
  {
    id: "3",
    title: "医嘱管理使用指南",
    description: "医嘱创建、审核、执行流程",
    icon: "orders-o",
    color: "#45b7d1",
    content: "医嘱管理使用指南内容..."
  },
  {
    id: "4",
    title: "权限管理说明",
    description: "角色权限配置和管理",
    icon: "shield-o",
    color: "#96ceb4",
    content: "权限管理说明内容..."
  }
];

// 视频教程
const videos = [
  {
    id: "1",
    title: "系统快速入门",
    description: "5分钟了解系统基本功能",
    duration: "5:30",
    views: 1234,
    url: "#"
  },
  {
    id: "2",
    title: "患者管理详解",
    description: "患者信息的增删改查操作",
    duration: "12:45",
    views: 856,
    url: "#"
  },
  {
    id: "3",
    title: "医嘱管理流程",
    description: "医嘱创建到执行完整流程",
    duration: "18:20",
    views: 642,
    url: "#"
  }
];

// 计算属性
const filteredFAQs = computed(() => {
  if (!searchText.value) return faqs;
  return faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchText.value.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

const searchResults = computed(() => {
  if (!searchText.value) return [];
  const results: any[] = [];
  
  // 搜索FAQ
  faqs.forEach(faq => {
    if (faq.question.toLowerCase().includes(searchText.value.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchText.value.toLowerCase())) {
      results.push({
        id: `faq-${faq.id}`,
        title: faq.question,
        description: faq.answer.substring(0, 100) + "...",
        type: "faq",
        data: faq
      });
    }
  });
  
  // 搜索指南
  guides.forEach(guide => {
    if (guide.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchText.value.toLowerCase())) {
      results.push({
        id: `guide-${guide.id}`,
        title: guide.title,
        description: guide.description,
        type: "guide",
        data: guide
      });
    }
  });
  
  return results;
});

// 方法
const handleSearch = () => {
  if (searchText.value) {
    showSearch.value = true;
  }
};

const handleClearSearch = () => {
  searchText.value = "";
  showSearch.value = false;
};

const openHelpItem = (item: any) => {
  const relatedFAQs = faqs.filter(faq => faq.category === item.type);
  if (relatedFAQs.length > 0) {
    activeCollapse.value = [relatedFAQs[0].id];
    showToast(`已跳转到${item.title}相关问题`);
  } else {
    showToast(`${item.title}功能开发中`);
  }
};

const openGuide = (guide: any) => {
  showDialog({
    title: guide.title,
    message: guide.content
  });
};

const playVideo = (video: any) => {
  showToast(`正在播放：${video.title}`);
  // 这里可以添加视频播放逻辑
};

const openSearchResult = (result: any) => {
  if (result.type === "faq") {
    activeCollapse.value = [result.data.id];
    showSearch.value = false;
  } else if (result.type === "guide") {
    openGuide(result.data);
    showSearch.value = false;
  }
};

const contactSupport = () => {
  showDialog({
    title: "联系客服",
    message: "客服热线：400-123-4567\n邮箱：support@hospital.com\n工作时间：9:00-18:00"
  });
};

// 生命周期
onMounted(() => {
  // 初始化数据
});
</script>

<style scoped>
.help-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* 搜索框样式 */
.search-input {
  --van-search-input-height: 40px;
}

.search-input .van-search__content {
  background-color: #f7f8fa;
  border-radius: 8px;
}

/* 快速帮助卡片样式 */
.grid > div {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.grid > div:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 折叠面板样式 */
.van-collapse-item {
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
}

.van-collapse-item__title {
  font-weight: 500;
  color: #374151;
}

/* 视频教程卡片样式 */
.grid > div {
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.grid > div:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

/* 联系我们卡片样式 */
.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.bg-purple-50 {
  background-color: #faf5ff;
}

/* 搜索弹窗样式 */
.van-popup {
  border-radius: 16px 16px 0 0;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .grid.grid-cols-1 {
    grid-template-columns: 1fr;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.help-page > div {
  animation: fadeIn 0.3s ease-out;
}

/* 列表样式 */
.list-decimal {
  list-style-type: decimal;
}

.list-inside {
  list-style-position: inside;
}

/* 文本样式 */
.leading-relaxed {
  line-height: 1.625;
}

/* 图标样式 */
.van-icon {
  margin-right: 8px;
}
</style>

