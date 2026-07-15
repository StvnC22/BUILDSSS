<script setup lang="ts">
import type { HealthCase } from '@/types'
import PriorityBadge from './PriorityBadge.vue'
defineProps<{ healthCase: HealthCase | null }>()
</script>
<template>
  <aside class="case-panel">
    <div class="panel-header"><h3>🩺 Caso activo</h3></div>
    <div v-if="!healthCase" class="empty">Inicia una conversación para crear una ficha de orientación.</div>
    <div v-else class="body">
      <PriorityBadge :priority="healthCase.priority_level" :score="healthCase.priority_score" />
      <div class="field"><label>Estado</label><strong>{{ healthCase.status }}</strong></div>
      <div class="field"><label>Motivo</label><p>{{ healthCase.reason || 'Pendiente de identificar' }}</p></div>
      <div class="field"><label>Resumen</label><p>{{ healthCase.summary || 'Sin resumen todavía' }}</p></div>
      <div v-if="healthCase.warning_signs.length" class="field warning"><label>Señales detectadas</label><ul><li v-for="item in healthCase.warning_signs" :key="item">{{ item }}</li></ul></div>
      <div class="field"><label>Ubicación</label><p>{{ healthCase.sector || healthCase.location || 'No indicada' }}</p></div>
      <div v-if="healthCase.requires_human_review" class="review">👩‍⚕️ Requiere revisión humana</div>
    </div>
  </aside>
</template>
<style scoped>.case-panel{height:100%;background:#fff}.panel-header{padding:1rem 1.1rem;border-bottom:1px solid var(--color-gray-200)}.panel-header h3{font-size:.95rem;color:var(--color-navy)}.empty,.body{padding:1rem}.empty{font-size:.85rem;color:var(--color-gray-500)}.field{margin-top:1rem}.field label{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;font-weight:800;color:var(--color-gray-500);margin-bottom:.25rem}.field p,.field li{font-size:.84rem;color:var(--color-gray-700)}.field ul{padding-left:1rem}.warning{background:#fff7ed;padding:.7rem;border-radius:8px}.review{margin-top:1rem;background:#e0f2fe;color:#075985;padding:.7rem;border-radius:8px;font-size:.8rem;font-weight:700}</style>
