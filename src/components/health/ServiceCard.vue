<script setup lang="ts">
import type { HealthService } from '@/types'

defineProps<{
  service: HealthService
}>()
</script>

<template>
  <article class="service-card">
    <div class="service-head">
      <div>
        <span class="service-type">{{ service.service_type }}</span>
        <h4>{{ service.name }}</h4>
      </div>
      <span v-if="service.emergency_available" class="badge badge-danger">Emergencia</span>
    </div>
    <p>📍 {{ service.address }} · {{ service.sector }}</p>
    <p>📞 {{ service.phone }}</p>
    <p>🕒 {{ service.schedule }}</p>
    <div v-if="service.accessibility_features.length" class="tags">
      <span v-for="feature in service.accessibility_features" :key="feature">♿ {{ feature }}</span>
    </div>
    <small>Fuente: {{ service.source_name }} · Verificado: {{ service.verified_at }}</small>
  </article>
</template>

<style scoped>
.service-card{padding:1rem;border:1px solid var(--color-gray-200);border-radius:12px;background:#fff}.service-head{display:flex;justify-content:space-between;gap:1rem}.service-type{font-size:.7rem;text-transform:uppercase;letter-spacing:.06em;color:var(--color-teal-dark);font-weight:800}.service-card h4{margin:.15rem 0 .45rem;color:var(--color-navy)}.service-card p{font-size:.82rem;color:var(--color-gray-700);margin:.2rem 0}.tags{display:flex;gap:.35rem;flex-wrap:wrap;margin:.6rem 0}.tags span{background:var(--color-gray-100);padding:.25rem .5rem;border-radius:999px;font-size:.7rem}.service-card small{color:var(--color-gray-500);display:block;margin-top:.65rem}
</style>
