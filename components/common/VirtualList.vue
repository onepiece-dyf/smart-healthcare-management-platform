<template>
  <div 
    ref="containerRef" 
    class="virtual-list-container"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll">
    
    <!-- 虚拟滚动占位 -->
    <div :style="{ height: totalHeight + 'px' }">
      <div 
        :style="{ 
          transform: `translateY(${offsetY}px)`,
          height: visibleHeight + 'px'
        }"
        class="virtual-list-content">
        
        <!-- 渲染可见项目 -->
        <div
          v-for="(item, index) in visibleItems"
          :key="getItemKey(item, startIndex + index)"
          :style="{ height: itemHeight + 'px' }"
          class="virtual-list-item">
          <slot 
            :item="item" 
            :index="startIndex + index"
            :isVisible="true">
            {{ item }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

interface Props {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // 预渲染的额外项目数
  getItemKey?: (item: any, index: number) => string | number;
}

const props = withDefaults(defineProps<Props>(), {
  overscan: 5,
  getItemKey: (item: any, index: number) => index
});

const containerRef = ref<HTMLElement>();
const scrollTop = ref(0);

// 计算可见区域
const startIndex = computed(() => {
  return Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan);
});

const endIndex = computed(() => {
  const visibleCount = Math.ceil(props.containerHeight / props.itemHeight);
  return Math.min(
    props.items.length - 1,
    startIndex.value + visibleCount + props.overscan * 2
  );
});

// 可见项目
const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value + 1);
});

// 总高度
const totalHeight = computed(() => {
  return props.items.length * props.itemHeight;
});

// 偏移量
const offsetY = computed(() => {
  return startIndex.value * props.itemHeight;
});

// 可见区域高度
const visibleHeight = computed(() => {
  return (endIndex.value - startIndex.value + 1) * props.itemHeight;
});

// 滚动处理
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  scrollTop.value = target.scrollTop;
};

// 滚动到指定项目
const scrollToItem = (index: number) => {
  if (containerRef.value) {
    const scrollTop = index * props.itemHeight;
    containerRef.value.scrollTop = scrollTop;
  }
};

// 滚动到顶部
const scrollToTop = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = 0;
  }
};

// 滚动到底部
const scrollToBottom = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = totalHeight.value;
  }
};

// 监听项目变化，重置滚动位置
watch(() => props.items.length, () => {
  scrollTop.value = 0;
  if (containerRef.value) {
    containerRef.value.scrollTop = 0;
  }
});

// 暴露方法
defineExpose({
  scrollToItem,
  scrollToTop,
  scrollToBottom
});
</script>

<style scoped>
.virtual-list-container {
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.virtual-list-content {
  position: relative;
  width: 100%;
}

.virtual-list-item {
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
  box-sizing: border-box;
}

/* 滚动条样式 */
.virtual-list-container::-webkit-scrollbar {
  width: 6px;
}

.virtual-list-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.virtual-list-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.virtual-list-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
