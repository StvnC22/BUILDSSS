<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { HealthService } from '@/types'
import { fetchHealthServices } from '@/services/healthServices'
import ServiceCard from '@/components/health/ServiceCard.vue'

const search = ref('')
const services = ref<HealthService[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  services.value = await fetchHealthServices(search.value)
  loading.value = false
}

onMounted(load)
</script>
<template><div class="page"><header><span>📍 Directorio local</span><h1>Servicios de salud</h1><p>Busca por nombre, especialidad o sector. Los registros de demostración deben reemplazarse por fuentes oficiales verificadas.</p></header><form class="search" @submit.prevent="load"><input v-model="search" class="form-input" placeholder="Ej.: vacunación, Tarqui, laboratorio"/><button class="btn btn-primary">Buscar</button></form><p v-if="loading">Buscando...</p><div class="grid"><ServiceCard v-for="service in services" :key="service.id" :service="service"/></div></div></template>
<style scoped>.page{padding:2rem;max-width:1100px;margin:auto}.page header span{color:var(--color-teal-dark);font-size:.8rem;font-weight:800}.page h1{color:var(--color-navy)}.page header p{color:var(--color-gray-500);max-width:720px}.search{display:flex;gap:.6rem;margin:1.3rem 0}.search input{flex:1}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.8rem}@media(max-width:700px){.page{padding:1rem}.grid{grid-template-columns:1fr}.search{flex-direction:column}}</style>
