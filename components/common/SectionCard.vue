<template>
  <div class="rounded-xl bg-white p-4 shadow-sm">
    <div v-if="title || $slots.extra" class="mb-2 flex items-center justify-between">
      <h2 v-if="title" class="text-base font-semibold">{{ title }}</h2>
      <div v-if="$slots.extra">
        <slot name="extra" />
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>();
</script>

<style scoped>
</style>


