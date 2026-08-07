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

    <p v-if="!data">Consultando estado...</p>

    <p v-if="data?.conectado">
      ✅ WhatsApp conectado
    </p>

    <div v-else-if="data?.qr">
      <p>Escanea este QR con tu WhatsApp:</p>
      <img :src="data.qr" alt="QR WhatsApp" style="max-width: 320px;" />
    </div>

    <p v-else>
      Generando QR...
    </p>
  </div>
</template>
