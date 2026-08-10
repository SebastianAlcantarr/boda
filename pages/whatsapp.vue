<script setup lang="ts">
const { data, refresh } = await useFetch('/api/whatsapp/status')

let interval: any = null
let cargando = false
let iniciado = false

onMounted(() => {
  if (iniciado) return

  iniciado = true

  interval = setInterval(() => {
    if (cargando) return

    cargando = true
    refresh().finally(() => {
      cargando = false
    })
  }, 3000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <div style="padding: 40px; font-family: sans-serif;">
    <h1>WhatsApp Boda</h1>

    <p v-if="!data">Iniciando WhatsApp...</p>

    <p v-else-if="data?.estado === 'connected'">
      WhatsApp conectado
    </p>

    <div v-else-if="data?.estado === 'qr' && data?.qr">
      <p>Escanea este QR con tu WhatsApp:</p>
      <img :src="data.qr" alt="QR WhatsApp" style="max-width: 320px;" />
    </div>

    <p v-else-if="data?.estado === 'connecting'">
      Conectando...
    </p>

    <p v-else-if="data?.estado === 'logged_out'">
      Sesión cerrada / se requiere nuevo QR
    </p>

    <p v-else-if="data?.estado === 'error'">
      Error de conexión<span v-if="data?.error">: {{ data.error }}</span>
    </p>

    <p v-else-if="data?.estado === 'starting'">
      Iniciando WhatsApp...
    </p>

    <p v-else>
      Generando QR...
    </p>
  </div>
</template>
