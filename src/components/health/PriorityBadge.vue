<script setup lang="ts">
import { computed } from 'vue'
import type { HealthPriority } from '@/types'
const props = defineProps<{ priority: HealthPriority; score?: number }>()
const config = computed(() => ({
  EMERGENCY: { icon: '🔴', label: 'Atención inmediata', cls: 'emergency' },
  PRIORITY: { icon: '🟠', label: 'Atención prioritaria', cls: 'priority' },
  ROUTINE: { icon: '🟡', label: 'Consulta programable', cls: 'routine' },
  PREVENTIVE: { icon: '🟢', label: 'Prevención y orientación', cls: 'preventive' },
}[props.priority]))
</script>
<template><span class="priority-badge" :class="config.cls"><span>{{ config.icon }}</span>{{ config.label }}<small v-if="score !== undefined">{{ score }}%</small></span></template>
<style scoped>
.priority-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.35rem .65rem;border-radius:999px;font-size:.75rem;font-weight:800;border:1px solid transparent}.priority-badge small{opacity:.7}.emergency{background:#fee2e2;color:#991b1b;border-color:#fecaca}.priority{background:#ffedd5;color:#9a3412;border-color:#fed7aa}.routine{background:#fef9c3;color:#854d0e;border-color:#fde68a}.preventive{background:#dcfce7;color:#166534;border-color:#bbf7d0}
</style>
