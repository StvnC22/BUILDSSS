<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import EmergencyBanner from '@/components/health/EmergencyBanner.vue'
import PriorityBadge from '@/components/health/PriorityBadge.vue'
import ServiceCard from '@/components/health/ServiceCard.vue'
defineProps<{ escribiendo: boolean }>()
const chat = useChatStore()
const container = ref<HTMLElement | null>(null)
function scrollToBottom(){ if(container.value) container.value.scrollTop = container.value.scrollHeight }
function speak(value: string){ if('speechSynthesis' in window){ speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(value)) } }
defineExpose({ scrollToBottom })
</script>
<template>
  <div ref="container" class="messages">
    <div v-if="!chat.mensajes.length && !escribiendo" class="welcome"><span>🌊🩺</span><h2>¿Cómo podemos orientarte?</h2><p>Explica tu necesidad con tus propias palabras. La IA no reemplaza a un profesional de salud.</p></div>
    <article v-for="msg in chat.mensajes" :key="msg.id" class="message" :class="msg.rol">
      <div class="avatar">{{ msg.rol === 'usuario' ? '👤' : '✚' }}</div>
      <div class="content">
        <EmergencyBanner v-if="msg.rol === 'asistente' && msg.metadata?.show_emergency_banner" />
        <PriorityBadge v-if="msg.rol === 'asistente' && msg.metadata?.priority" :priority="msg.metadata.priority" />
        <div class="bubble"><p>{{ msg.contenido }}</p><button v-if="msg.rol === 'asistente'" class="listen" @click="speak(msg.contenido)">🔊 Leer</button><time>{{ new Date(msg.created_at).toLocaleTimeString('es-EC',{hour:'2-digit',minute:'2-digit'}) }}</time></div>
        <div v-if="msg.metadata?.services?.length" class="service-list"><ServiceCard v-for="service in msg.metadata.services" :key="service.id" :service="service" /></div>
        <div v-if="msg.metadata?.sources?.length" class="source-list"><strong>Fuentes y verificación</strong><span v-for="source in msg.metadata.sources" :key="source.title">{{ source.title }}<template v-if="source.verified_at"> · {{ source.verified_at }}</template></span></div>
      </div>
    </article>
    <article v-if="escribiendo" class="message asistente"><div class="avatar">✚</div><div class="bubble typing"><span/><span/><span/></div></article>
  </div>
</template>
<style scoped>.messages{flex:1;overflow:auto;padding:1.2rem;display:flex;flex-direction:column;gap:1rem}.welcome{text-align:center;margin:auto;max-width:480px;color:var(--color-gray-600)}.welcome span{font-size:2.5rem}.welcome h2{color:var(--color-navy);margin:.5rem}.message{display:flex;gap:.65rem;max-width:90%}.message.usuario{align-self:flex-end;flex-direction:row-reverse}.avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#e0f2fe;color:#075985;font-weight:900;flex:none}.content{min-width:0}.bubble{background:var(--color-gray-100);padding:.8rem 1rem;border-radius:14px}.usuario .bubble{background:var(--color-navy);color:#fff}.bubble p{white-space:pre-wrap;font-size:.92rem;line-height:1.5}.bubble time{display:block;font-size:.65rem;opacity:.55;margin-top:.35rem}.listen{display:block;background:transparent;color:var(--color-teal-dark);font-size:.7rem;margin-top:.45rem}.usuario .listen{color:#fff}.service-list{display:grid;gap:.55rem;margin-top:.6rem}.source-list{display:flex;flex-direction:column;gap:.15rem;font-size:.7rem;color:var(--color-gray-500);margin-top:.45rem;padding:.5rem;background:#f8fafc;border-radius:8px}.typing{display:flex;gap:4px}.typing span{width:7px;height:7px;background:#94a3b8;border-radius:50%;animation:bounce 1s infinite}.typing span:nth-child(2){animation-delay:.15s}.typing span:nth-child(3){animation-delay:.3s}@keyframes bounce{50%{transform:translateY(-5px)}}@media(max-width:700px){.message{max-width:100%}}
</style>
