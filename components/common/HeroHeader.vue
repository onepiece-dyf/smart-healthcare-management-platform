<template>
  <div class="relative overflow-hidden rounded-b-2xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#EC4899] p-5 text-white">
    <div class="flex items-center justify-between">
      <div>
        <div v-if="subtitle" class="mb-1 text-xs opacity-90">{{ subtitle }}</div>
        <div class="text-xl font-semibold tracking-wide">{{ title }}</div>
        <div v-if="description" class="mt-1 text-xs opacity-90">{{ description }}</div>
      </div>
      <div v-if="showDate" class="rounded-xl bg-white/10 px-3 py-2 text-xs backdrop-blur">
        {{ todayString }}
      </div>
    </div>
    <div v-if="$slots.actions" class="mt-4 grid grid-cols-4 gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineProps<{
  title: string;
  subtitle?: string;
  description?: string;
  showDate?: boolean;
}>();

const todayString = computed(() =>
  new Date().toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" })
);
</script>

<style scoped>
</style>


