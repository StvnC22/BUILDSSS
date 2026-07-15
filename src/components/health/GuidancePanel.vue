<script setup lang="ts">
defineProps<{
  sourceCount?: number
}>()
</script>

<template>
  <aside class="guide-panel">
    <h3>Cómo funciona</h3>
    <ol>
      <li>Describe tu necesidad.</li>
      <li>GPT-5.6 clasifica y extrae datos.</li>
      <li>Reglas de seguridad verifican alertas.</li>
      <li>El agente consulta servicios y contenido aprobado.</li>
      <li>El caso se registra para seguimiento.</li>
    </ol>
    <div class="safe">
      <strong>Límites</strong>
      <p>No diagnostica, no receta medicamentos y no reemplaza profesionales de salud.</p>
    </div>
    <p class="sources">Fuentes mostradas en la respuesta: {{ sourceCount ?? 0 }}</p>
  </aside>
</template>

<style scoped>
.guide-panel{padding:1rem;height:100%;background:#fff}.guide-panel h3{color:var(--color-navy);margin-bottom:.75rem}.guide-panel ol{padding-left:1.2rem;color:var(--color-gray-700);font-size:.83rem}.guide-panel li{margin:.45rem 0}.safe{margin-top:1rem;background:#ecfeff;padding:.8rem;border-radius:10px}.safe strong{color:#155e75}.safe p,.sources{font-size:.78rem;color:var(--color-gray-600);margin-top:.25rem}.sources{margin-top:1rem}
</style>
