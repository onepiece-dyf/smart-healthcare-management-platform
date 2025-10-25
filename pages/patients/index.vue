<template>
  <div class="min-h-screen bg-gray-100">
    <HeroHeader title="患者管理" subtitle="检索与筛选" :showDate="true" />
    <van-sticky>
      <div class="space-y-2 bg-white p-4">
        <van-search
          v-model="searchText"
          placeholder="搜索患者姓名/ID"
          shape="round"
          @search="onSearch"
          @clear="onClear" />
        <div class="flex items-center justify-between">
          <van-button plain size="small" @click="showFilter = true">
            <template #icon>
              <van-icon name="filter-o" />
            </template>
            筛选
            <template v-if="hasActiveFilters">
              <van-badge dot color="var(--van-primary-color)" />
            </template>
          </van-button>
          <div class="text-sm text-gray-500">共 {{ filteredTotal }} 位患者</div>
        </div>
      </div>
    </van-sticky>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 gap-3 p-4">
      <SectionCard>
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-600">在院患者</div>
            <div class="mt-1 text-2xl font-bold text-blue-600">{{ statistics.inPatients }}</div>
            <div class="text-xs text-gray-500">较昨日 +5</div>
          </div>
          <van-icon name="user-o" size="24" color="#3b82f6" />
        </div>
      </SectionCard>
      <SectionCard>
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-600">今日入院</div>
            <div class="mt-1 text-2xl font-bold text-green-600">{{ statistics.todayAdmissions }}</div>
            <div class="text-xs text-gray-500">较昨日 +2</div>
          </div>
          <van-icon name="plus" size="24" color="#10b981" />
        </div>
      </SectionCard>
      <SectionCard>
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-600">今日出院</div>
            <div class="mt-1 text-2xl font-bold text-orange-600">{{ statistics.todayDischarges }}</div>
            <div class="text-xs text-gray-500">较昨日 -1</div>
          </div>
          <van-icon name="minus" size="24" color="#f59e0b" />
        </div>
      </SectionCard>
      <SectionCard>
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-600">总患者数</div>
            <div class="mt-1 text-2xl font-bold text-purple-600">{{ statistics.totalPatients }}</div>
            <div class="text-xs text-gray-500">历史记录</div>
          </div>
          <van-icon name="records" size="24" color="#8b5cf6" />
        </div>
      </SectionCard>
    </div>

    <!-- 标签页 -->
    <div class="px-4 pb-2">
      <van-tabs v-model:active="activeTab" @change="onTabChange">
        <van-tab title="在院患者" name="admitted">
          <div class="py-2 text-sm text-gray-500">当前在院治疗的患者</div>
        </van-tab>
        <van-tab title="今日入院" name="today">
          <div class="py-2 text-sm text-gray-500">今日新入院的患者</div>
        </van-tab>
        <van-tab title="今日出院" name="discharged">
          <div class="py-2 text-sm text-gray-500">今日出院的患者</div>
        </van-tab>
        <van-tab title="全部患者" name="all">
          <div class="py-2 text-sm text-gray-500">所有患者记录</div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 患者列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        class="pb-24"
        @load="onLoad">
        <van-cell-group
          v-for="patient in (patientStore.filteredPatients || [])"
          :key="patient.id"
          inset
          class="mb-3">
          <van-swipe-cell>
            <van-cell
              :title="patient.name"
              :label="`住院号: ${patient.id} | ${patient.gender} | ${patient.age}岁`"
              is-link
              :to="`/patients/${patient.id}`">
              <template #value>
                <div class="flex flex-col items-end space-y-1">
                  <van-tag :type="getType('PatientStatus', patient.status) as TagType" size="small">
                    {{ getLabel("PatientStatus", patient.status) }}
                  </van-tag>
                  <div class="text-xs text-gray-500">
                    {{ formatDate(patient.admissionDate) }}
                  </div>
                </div>
              </template>
            </van-cell>
            <van-cell
              :title="patient.diagnosis"
              :label="`床位: ${patient.bedId || '未分配'} | 科室: ${patient.roomId || '未分配'}`"
              class="text-sm">
              <template #value>
                <div class="flex space-x-1">
                  <van-button
                    size="mini"
                    type="primary"
                    plain
                    @click.stop="viewPatient(patient)">
                    查看
                  </van-button>
                  <van-button
                    v-if="patient.status === PatientStatus.ADMITTED"
                    size="mini"
                    type="success"
                    plain
                    @click.stop="dischargePatient(patient)">
                    出院
                  </van-button>
                </div>
              </template>
            </van-cell>
            <template #right>
              <van-button
                v-if="patient.status === PatientStatus.DISCHARGED"
                square
                type="danger"
                text="删除"
                class="!h-full"
                @click="confirmDelete(patient)" />
            </template>
          </van-swipe-cell>
        </van-cell-group>
        
        <!-- 空状态 -->
        <div v-if="!loading && (patientStore.filteredPatients || []).length === 0" class="py-12 text-center">
          <van-empty
            image="search"
            description="暂无患者数据"
            class="py-8">
            <van-button
              type="primary"
              size="small"
              @click="router.push('/patients/admission')">
              添加患者
            </van-button>
          </van-empty>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 筛选抽屉 -->
    <van-popup v-model:show="showFilter" position="right" class="h-full w-3/4">
      <div class="flex h-full flex-col">
        <van-nav-bar
          title="筛选条件"
          left-arrow
          right-text="重置"
          @click-left="showFilter = false"
          @click-right="resetFilters" />

        <div class="flex-1 space-y-4 overflow-auto p-4">
          <!-- 状态筛选 -->
          <div>
            <div class="mb-2 font-medium">患者状态</div>
            <van-checkbox-group v-model="filterForm.status">
              <van-cell-group inset>
                <van-cell
                  v-for="status in getOptions('PatientStatus')"
                  :key="status.value"
                  :title="status.label"
                  clickable
                  @click="toggleStatus(status.value as PatientStatus)">
                  <template #right-icon>
                    <van-checkbox :name="status.value" />
                  </template>
                </van-cell>
              </van-cell-group>
            </van-checkbox-group>
          </div>

          <!-- 入院时间筛选 -->
          <div>
            <div class="mb-2 font-medium">入院时间</div>
            <van-cell-group inset>
              <van-field
                readonly
                clickable
                label="开始日期"
                :model-value="formatDate(filterForm.dateRange?.start)"
                placeholder="请选择"
                @click="showStartDatePicker = true" />
              <van-field
                readonly
                clickable
                label="结束日期"
                :model-value="formatDate(filterForm.dateRange?.end)"
                placeholder="请选择"
                @click="showEndDatePicker = true" />
            </van-cell-group>
          </div>
        </div>

        <div class="border-t p-4">
          <van-button block type="primary" @click="applyFilters">确认</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 日期选择器 -->
    <van-calendar v-model:show="showStartDatePicker" @confirm="onStartDateConfirm" />
    <van-calendar v-model:show="showEndDatePicker" @confirm="onEndDateConfirm" />

    <!-- 底部添加按钮 -->
    <van-button
      type="primary"
      icon="plus"
      class="!fixed bottom-20 right-4 w-auto rounded-full shadow-lg"
      @click="router.push('/patients/admission')">
      入院登记
    </van-button>
  </div>
</template>

<script setup lang="ts">
import type { TagType } from "vant";
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { usePatientStore } from "~/stores/patientStore";
import { useEnum } from "~/types/enums/metadata";
import { PatientStatus, type Patient } from "~/types/models/patient";
import { debounce } from "lodash";
import { showDialog, showSuccessToast, showFailToast } from "vant";

const router = useRouter();
const patientStore = usePatientStore();
const { getLabel, getType, getOptions } = useEnum();

// 状态
const searchText = ref("");
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);
const activeTab = ref("admitted");

const statistics = computed(() => ({
  inPatients: patientStore.inPatientsCount,
  todayAdmissions: patientStore.todayAdmissionsCount,
  todayDischarges: patientStore.todayDischarges.length,
  totalPatients: patientStore.patientStats.total
}));

const searchParams = ref({
  page: 1,
  pageSize: 20, // 增加分页大小
  keyword: ""
});

// 新增状态
const showFilter = ref(false);
const showStartDatePicker = ref(false);
const showEndDatePicker = ref(false);

const filterForm = ref({
  status: [] as PatientStatus[],
  dateRange: null as { start: Date; end: Date } | null
});

// 计算属性
const hasActiveFilters = computed(() => {
  return filterForm.value.status.length > 0 || filterForm.value.dateRange !== null;
});

const filteredTotal = computed(() => {
  return patientStore.filteredPatients?.length || 0;
});

// 方法
const formatDate = (date?: Date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("zh-CN");
};

const toggleStatus = (status: PatientStatus) => {
  const index = filterForm.value.status.indexOf(status);
  if (index > -1) {
    filterForm.value.status.splice(index, 1);
  } else {
    filterForm.value.status.push(status);
  }
};

const resetFilters = () => {
  filterForm.value = {
    status: [],
    dateRange: null
  };
};

const applyFilters = () => {
  patientStore.setFilters({
    status: filterForm.value.status,
    dateRange: filterForm.value.dateRange
  });
  showFilter.value = false;
  searchParams.value.page = 1;
  patientStore.fetchPatients({ page: 1, pageSize: 10 });
};

const onSearch = () => {
  console.log('搜索患者:', searchText.value);
  searchParams.value = {
    ...searchParams.value,
    page: 1,
    keyword: searchText.value
  };
  patientStore.setKeyword(searchText.value);
  finished.value = false;
  // 重新加载分页数据
  patientStore.fetchPatients({ page: 1, pageSize: 10 });
};

const onClear = () => {
  searchText.value = "";
  onSearch();
};

const onStartDateConfirm = (date: Date) => {
  if (!filterForm.value.dateRange) {
    filterForm.value.dateRange = { start: date, end: date };
  } else {
    filterForm.value.dateRange.start = date;
  }
  showStartDatePicker.value = false;
};

const onEndDateConfirm = (date: Date) => {
  if (!filterForm.value.dateRange) {
    filterForm.value.dateRange = { start: date, end: date };
  } else {
    filterForm.value.dateRange.end = date;
  }
  showEndDatePicker.value = false;
};

// 标签页切换
const onTabChange = (name: string) => {
  console.log('切换标签页:', name);
  activeTab.value = name;
  
  // 根据标签页设置不同的过滤器
  switch (name) {
    case 'admitted':
      patientStore.setFilters({ 
        status: ['ADMITTED'],
        dateRange: null
      });
      break;
    case 'today':
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      patientStore.setFilters({ 
        status: ['ADMITTED'],
        dateRange: { start: today, end: tomorrow }
      });
      break;
    case 'discharged':
      const todayDischarge = new Date();
      todayDischarge.setHours(0, 0, 0, 0);
      const tomorrowDischarge = new Date(todayDischarge);
      tomorrowDischarge.setDate(tomorrowDischarge.getDate() + 1);
      patientStore.setFilters({ 
        status: ['DISCHARGED'],
        dateRange: { start: todayDischarge, end: tomorrowDischarge }
      });
      break;
    case 'all':
      patientStore.resetFilters();
      break;
  }
  
  // 重新加载数据
  searchParams.value.page = 1;
  finished.value = false;
  patientStore.fetchPatients({ page: 1, pageSize: 10 });
};

// 分页相关
const onRefresh = async () => {
  try {
    searchParams.value.page = 1;
    finished.value = false;
    await patientStore.fetchPatients({ page: 1, pageSize: 10 });
  } finally {
    refreshing.value = false;
  }
};

// 上拉加载
const onLoad = async () => {
  try {
    loading.value = true;
    const result = await patientStore.fetchPatients({ 
      page: searchParams.value.page + 1, 
      pageSize: 10 
    });

    // 判断是否加载完成
    const { page, pageSize, total } = result.pagination;
    if (page * pageSize >= total) {
      finished.value = true;
    } else {
      searchParams.value.page += 1;
    }
  } finally {
    loading.value = false;
  }
};

// 搜索防抖
const debouncedSearch = debounce(() => {
  onSearch();
}, 500);

watch(searchText, () => {
  debouncedSearch();
});

// 初始化
onMounted(async () => {
  console.log('患者管理页面初始化');
  // 先加载全部患者数据（用于统计）
  await patientStore.loadAllPatients();
  // 设置默认过滤为在院患者
  patientStore.setFilters({ status: ['ADMITTED'] });
  // 加载第一页数据
  await patientStore.fetchPatients({ page: 1, pageSize: 10 });
});

definePageMeta({
  layout: "admin",
  middleware: "auth",
  title: "患者管理",
  requiresAuth: true
});

// 查看患者详情
const viewPatient = (patient: Patient) => {
  router.push(`/patients/${patient.id}`);
};

// 出院处理
const dischargePatient = (patient: Patient) => {
  showDialog({
    title: "确认出院",
    message: `确定要为患者 ${patient.name} 办理出院手续吗？`,
    showCancelButton: true
  }).then(async () => {
    try {
      await patientStore.dischargePatient(patient.id as number);
      showSuccessToast("出院成功");
      // 刷新列表
      onRefresh();
    } catch (error) {
      showFailToast((error as Error).message);
    }
  });
};

// 删除确认
const confirmDelete = (patient: Patient) => {
  showDialog({
    title: "确认删除",
    message: `确定要删除患者 ${patient.name} 的记录吗？此操作不可恢复。`,
    showCancelButton: true
  }).then(async () => {
    try {
      await patientStore.deletePatient(patient.id as number);
      showSuccessToast("删除成功");
      // 刷新列表
      onRefresh();
    } catch (error) {
      showFailToast((error as Error).message);
    }
  });
};
</script>
