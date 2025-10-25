<template>
  <div v-if="showMonitor" class="performance-monitor">
    <div class="monitor-header">
      <h4>性能监控</h4>
      <van-icon name="cross" @click="showMonitor = false" />
    </div>
    <div class="monitor-content">
      <div class="metric">
        <span class="metric-label">页面加载时间:</span>
        <span class="metric-value">{{ pageLoadTime }}ms</span>
      </div>
      <div class="metric">
        <span class="metric-label">数据查询时间:</span>
        <span class="metric-value">{{ queryTime }}ms</span>
      </div>
      <div class="metric">
        <span class="metric-label">内存使用:</span>
        <span class="metric-value">{{ memoryUsage }}MB</span>
      </div>
      <div class="metric">
        <span class="metric-label">缓存命中率:</span>
        <span class="metric-value">{{ cacheHitRate }}%</span>
      </div>
      <div class="metric">
        <span class="metric-label">数据量:</span>
        <span class="metric-value">{{ dataCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const showMonitor = ref(false);
const pageLoadTime = ref(0);
const queryTime = ref(0);
const memoryUsage = ref(0);
const cacheHitRate = ref(0);
const dataCount = ref(0);

let startTime = 0;
let queryStartTime = 0;

// 开始页面加载计时
const startPageLoad = () => {
  startTime = performance.now();
};

// 结束页面加载计时
const endPageLoad = () => {
  if (startTime > 0) {
    pageLoadTime.value = Math.round(performance.now() - startTime);
  }
};

// 开始查询计时
const startQuery = () => {
  queryStartTime = performance.now();
};

// 结束查询计时
const endQuery = () => {
  if (queryStartTime > 0) {
    queryTime.value = Math.round(performance.now() - queryStartTime);
  }
};

// 更新内存使用情况
const updateMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    memoryUsage.value = Math.round(memory.usedJSHeapSize / 1024 / 1024);
  }
};

// 更新缓存命中率
const updateCacheHitRate = (hits: number, total: number) => {
  if (total > 0) {
    cacheHitRate.value = Math.round((hits / total) * 100);
  }
};

// 更新数据量
const updateDataCount = (count: number) => {
  dataCount.value = count;
};

// 监听性能指标
onMounted(() => {
  updateMemoryUsage();
  
  // 定期更新内存使用情况
  const interval = setInterval(updateMemoryUsage, 5000);
  
  onUnmounted(() => {
    clearInterval(interval);
  });
});

// 暴露方法给父组件使用
defineExpose({
  startPageLoad,
  endPageLoad,
  startQuery,
  endQuery,
  updateCacheHitRate,
  updateDataCount,
  show: () => { showMonitor.value = true; },
  hide: () => { showMonitor.value = false; }
});
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 250px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  padding: 12px;
  z-index: 9999;
  font-size: 12px;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 4px;
}

.monitor-header h4 {
  margin: 0;
  font-size: 14px;
}

.monitor-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  color: #ccc;
}

.metric-value {
  color: #4ade80;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .performance-monitor {
    width: 200px;
    top: 10px;
    right: 10px;
    font-size: 11px;
  }
}
</style>
