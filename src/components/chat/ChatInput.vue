<script setup lang="ts">
const model = defineModel<string>({ required: true })
defineProps<{ disabled?: boolean }>()
const emit = defineEmits<{ send: []; quick: [value: string] }>()
const quick = ['No sé si debo ir a emergencias', 'Buscar un centro de salud', 'Ayuda para sacar una cita', 'Información preventiva']
function keydown(event: KeyboardEvent) { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (model.value.trim()) emit('send') } }
</script>
<template>
  <div class="input-wrap">
    <div class="quick"><button v-for="item in quick" :key="item" type="button" :disabled="disabled" @click="emit('quick', item)">{{ item }}</button></div>
    <div class="chat-input-area"><textarea v-model="model" rows="3" :disabled="disabled" placeholder="Describe tu necesidad de salud o el servicio que buscas..." @keydown="keydown"/><button class="btn btn-primary" :disabled="disabled || !model.trim()" @click="emit('send')">Enviar ➤</button></div>
  </div>
</template>
<style scoped>.input-wrap{border-top:1px solid var(--color-gray-200);background:#fff}.quick{display:flex;gap:.45rem;overflow-x:auto;padding:.65rem 1rem 0}.quick button{white-space:nowrap;background:#ecfeff;color:#155e75;border:1px solid #a5f3fc;padding:.35rem .65rem;border-radius:999px;font-size:.72rem}.chat-input-area{display:flex;gap:.7rem;padding:.75rem 1rem 1rem}.chat-input-area textarea{flex:1;resize:vertical;min-height:70px;max-height:180px;border:1px solid var(--color-gray-200);border-radius:10px;padding:.75rem;font:inherit}.chat-input-area textarea:focus{outline:3px solid rgba(45,212,191,.16);border-color:var(--color-teal-dark)}.chat-input-area .btn{align-self:flex-end}@media(max-width:640px){.chat-input-area{flex-direction:column}.chat-input-area .btn{align-self:stretch}}</style>
