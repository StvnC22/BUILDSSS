<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore(); const router = useRouter(); const open = ref(false)
async function logout(){ await auth.signOut(); await router.push('/') }
const links = [
  {to:'/app',icon:'⌂',label:'Inicio'}, {to:'/app/chat',icon:'✚',label:'Orientación IA'},
  {to:'/app/casos',icon:'📋',label:'Mis casos'}, {to:'/app/servicios',icon:'📍',label:'Servicios'}, {to:'/app/perfil',icon:'👤',label:'Mi perfil'},
]
</script>
<template>
  <div class="app-shell">
    <aside :class="['nav', {open}]">
      <router-link to="/app" class="brand"><span class="logo">✚</span><div><strong>Manta Cuida IA</strong><small>Salud y acceso</small></div></router-link>
      <nav><router-link v-for="item in links" :key="item.to" :to="item.to" @click="open=false"><span>{{ item.icon }}</span>{{ item.label }}</router-link><router-link v-if="auth.canReviewCases" to="/app/admin" @click="open=false"><span>🛡️</span>Panel de atención</router-link></nav>
      <div class="nav-bottom"><div class="user"><span>{{ auth.userName.charAt(0).toUpperCase() }}</span><div><strong>{{ auth.userName }}</strong><small>{{ auth.profile?.role }}</small></div></div><button @click="logout">Cerrar sesión</button></div>
    </aside>
    <main><header class="mobile-head"><button @click="open=!open">☰</button><strong>Manta Cuida IA</strong><span>GPT-5.6</span></header><router-view /></main>
    <button v-if="open" class="overlay" aria-label="Cerrar menú" @click="open=false"/>
  </div>
</template>
<style scoped>.app-shell{min-height:100vh;display:flex}.nav{width:245px;background:linear-gradient(180deg,#082f49,#0c4a6e);color:#fff;display:flex;flex-direction:column;position:fixed;inset:0 auto 0 0;z-index:30}.brand{display:flex;gap:.7rem;align-items:center;padding:1.2rem;color:#fff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.12)}.logo{width:38px;height:38px;border-radius:10px;background:var(--color-teal);display:grid;place-items:center;color:#083344;font-size:1.35rem;font-weight:900}.brand div{display:flex;flex-direction:column}.brand small{opacity:.7}.nav nav{padding:.8rem;display:flex;flex-direction:column;gap:.2rem}.nav nav a{display:flex;gap:.7rem;align-items:center;color:#dbeafe;padding:.7rem .8rem;border-radius:9px;text-decoration:none}.nav nav a.router-link-exact-active,.nav nav a:hover{background:rgba(255,255,255,.12);color:#fff}.nav-bottom{margin-top:auto;padding:1rem;border-top:1px solid rgba(255,255,255,.12)}.user{display:flex;gap:.6rem;align-items:center;margin-bottom:.7rem}.user>span{width:34px;height:34px;border-radius:50%;background:#2dd4bf;color:#083344;display:grid;place-items:center;font-weight:900}.user div{display:flex;flex-direction:column;min-width:0}.user strong{font-size:.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.user small{opacity:.65}.nav-bottom button{width:100%;padding:.55rem;border-radius:8px;background:rgba(255,255,255,.1);color:#fff}main{margin-left:245px;flex:1;min-width:0}.mobile-head{display:none}.overlay{display:none}@media(max-width:850px){.nav{transform:translateX(-100%);transition:.2s}.nav.open{transform:translateX(0)}main{margin-left:0}.mobile-head{height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 1rem;background:#fff;border-bottom:1px solid var(--color-gray-200);position:sticky;top:0;z-index:20}.mobile-head button{background:transparent;font-size:1.4rem}.mobile-head span{font-size:.7rem;color:var(--color-teal-dark);font-weight:800}.overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:25}}
</style>
