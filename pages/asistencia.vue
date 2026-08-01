<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';

type ConfirmationState = 'idle' | 'sending' | 'sent' | 'warning' | 'error';

interface ConfirmationResponse {
  success: boolean;
  telegramSent: boolean;
  message: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
}

const route = useRoute();
const router = useRouter();
const baseURL = useRuntimeConfig().app.baseURL;

function assetPath(path: string) {
  const basePath = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

  return `${basePath}${path}`;
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ').slice(0, 80);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase().slice(0, 120);
}

const guestName = ref('');
const guestEmail = ref('');
const submittedName = ref('');
const nameError = ref('');
const confirmationMessage = ref('');
const confirmationState = ref<ConfirmationState>('idle');
const emailMessage = ref('');
const emailState = ref<'idle' | 'sending' | 'sent' | 'error'>('idle');
const emailProgress = ref(0);
const isExporting = ref(false);
const exportProgress = ref(0);
const invitationCard = ref<HTMLElement | null>(null);
const exportCardWidth = 430;
const exportPdfCanvasScale = 2.4;
const exportPdfImageQuality = 0.9;
const cssPixelToMm = 25.4 / 96;

const queryName = computed(() => {
  const value = route.query.nombre;

  return typeof value === 'string' ? normalizeName(value) : '';
});

const invitationNames = computed(() => [submittedName.value]);
const invitationNameDensity = computed(() => {
  const longestName = Math.max(...invitationNames.value.map((name) => name.length), 0);

  if (longestName >= 30) return 'long';
  if (longestName >= 22) return 'compact';

  return 'normal';
});
const invitationSlides = [
  { src: assetPath('/images/slide-9.webp'), alt: 'Renée y Gabriel caminando juntos' },
  { src: assetPath('/images/slide-4.webp'), alt: 'Renée y Gabriel en una sesión de fotos' },
  { src: assetPath('/images/slide-7.webp'), alt: 'Renée y Gabriel al atardecer' },
  { src: assetPath('/images/slide-8.webp'), alt: 'Renée y Gabriel celebrando juntos' },
];
const invitationSchedule = [
  {
    time: '4:00 PM',
    title: 'Ceremonia religiosa',
    detail: 'Iglesia Nuestro Señor de Jesús.',
    link: 'https://www.google.com/maps/search/?api=1&query=Iglesia%20Nuestro%20Se%C3%B1or%20de%20Jes%C3%BAs%20Hermosillo%20Sonora',
  },
  {
    time: '7:00 PM',
    title: 'Cóctel de bienvenida',
    detail: 'Kiosko Villa Toscana.',
    link: 'https://www.google.com/maps/search/?api=1&query=Eventos%20Villa%20Toscana%20Hermosillo',
  },
  { time: '7:45 PM', title: 'Recepción', detail: 'Villa Toscana.' },
  { time: '8:00 PM', title: 'Cena', detail: 'Una noche para compartir.' },
  { time: '9:30 PM', title: 'Vals', detail: 'Nuestro primer baile.' },
  { time: '1:00 AM', title: 'Final', detail: 'Hasta la próxima.' },
];
const invitationParents = [
  {
    label: 'Papás de Renée',
    names: ['Francisca Imelda Urías Alcalá', 'Martín Ricardo Millanes Gaxiola'],
  },
  {
    label: 'Papás de Gabriel',
    names: ['María Medina Laborín', 'Carlos Coronado Medina'],
  },
];
const invitationSponsors = [
  { label: 'Velación', names: 'Sandra y Raúl Ambriz', icon: 'favorite' },
  { label: 'Lazo', names: 'Carlos Coronado y Carolina Henry', icon: 'all_inclusive' },
  { label: 'Anillos', names: 'Marisol Urías y Héctor Díaz', icon: 'join' },
  { label: 'Arras', names: 'Fernando Coronado y Leslie Ibarra', icon: 'groups' },
];
const invitationAvoidColors = [
  { name: 'Beige', value: '#f1dfc7' },
  { name: 'Blanco', value: '#ffffff' },
  { name: 'Crema', value: '#fff1d6' },
  { name: 'Rojo', value: '#c5161d' },
];
const invitationMusicLink = 'https://open.spotify.com/intl-es/track/3zl7j5ua8mF4JDYuxrfo01';
const invitationGiftLink = 'https://mesaderegalos.liverpool.com.mx/milistaderegalos/51972633';
const isSubmitting = computed(() => confirmationState.value === 'sending');
const isSendingEmail = computed(() => emailState.value === 'sending');

watch(
  queryName,
  (name) => {
    if (!name) return;

    guestName.value = name;
    submittedName.value = name;
  },
  { immediate: true },
);

async function submitName() {
  const name = normalizeName(guestName.value);
  const email = normalizeEmail(guestEmail.value);
  const nameParts = name.split(' ');

  if (name.length < 3 || nameParts.length < 2) {
    nameError.value = 'Escribe tu nombre y apellido para continuar.';
    return;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    nameError.value = 'Escribe un correo válido.';
    return;
  }

  nameError.value = '';
  confirmationMessage.value = '';
  confirmationState.value = 'sending';
  emailMessage.value = '';
  emailState.value = 'idle';

  try {
    const response = await $fetch<ConfirmationResponse>('/api/asistencia', {
      method: 'POST',
      body: {
        name,
        email,
      },
    });

    submittedName.value = name;
    await router.replace({
      path: '/asistencia',
      query: {
        nombre: name,
      },
    });
    await nextTick();
    invitationCard.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    confirmationMessage.value = response.message;
    confirmationState.value = response.telegramSent ? 'sent' : 'warning';
  } catch (error) {
    confirmationState.value = 'error';
    confirmationMessage.value = error instanceof Error ? error.message : 'No se pudo confirmar la asistencia.';
  }
}

function editName() {
  submittedName.value = '';
  nameError.value = '';
  confirmationMessage.value = '';
  confirmationState.value = 'idle';
  emailMessage.value = '';
  emailState.value = 'idle';
  void router.replace('/asistencia');
}

async function sendInvitationEmail() {
  const name = normalizeName(submittedName.value || guestName.value);
  const email = normalizeEmail(guestEmail.value);

  if (!name || !email) {
    emailState.value = 'error';
    emailMessage.value = 'Primero completa y confirma la asistencia.';
    return;
  }

  emailMessage.value = '';
  emailState.value = 'sending';
  emailProgress.value = 4;

  try {
    const pdf = await createInvitationPdf((progress) => {
      emailProgress.value = Math.min(progress, 92);
    });
    const pdfBase64 = pdf.output('datauristring').split(',')[1];

    const response = await $fetch<EmailResponse>('/api/invitacion-email', {
      method: 'POST',
      body: {
        name,
        email,
        pdfBase64,
        pdfFilename: invitationPdfFilename(),
      },
    });

    emailState.value = 'sent';
    emailProgress.value = 100;
    emailMessage.value = response.message;
  } catch (error) {
    emailState.value = 'error';
    emailMessage.value = error instanceof Error ? error.message : 'No se pudo enviar la invitación por correo.';
  } finally {
    if (emailState.value !== 'sending') {
      window.setTimeout(() => {
        emailProgress.value = 0;
      }, 450);
    }
  }
}

function invitationPdfFilename() {
  return `invitacion-renee-gabriel-${normalizeName(submittedName.value).toLowerCase().replace(/\s+/g, '-')}.pdf`;
}

function createExportCard() {
  const exportHost = document.createElement('div');
  const exportCard = invitationCard.value.cloneNode(true) as HTMLElement;

  exportHost.className = 'invitation-export-host';
  exportCard.classList.add('preview-invitation--export');
  exportCard.style.width = `${exportCardWidth}px`;
  exportCard.style.height = 'auto';
  exportCard.style.maxHeight = 'none';
  exportHost.appendChild(exportCard);
  document.body.appendChild(exportHost);

  return { exportCard, exportHost };
}

async function waitForExportAssets(exportCard) {
  const images = [...exportCard.querySelectorAll('img')];

  await Promise.all(
    images.map((image) => {
      if (image.complete && image.naturalWidth > 0) return image.decode?.().catch(() => {}) || Promise.resolve();

      return new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    }),
  );

  await document.fonts?.ready;
}

async function getInvitationCanvas(scale = exportPdfCanvasScale) {
  if (!invitationCard.value) return null;

  await document.fonts?.ready;
  const { default: html2canvas } = await import('html2canvas');
  const { exportCard, exportHost } = createExportCard();

  await waitForExportAssets(exportCard);

  try {
    const exportHeight = Math.ceil(exportCard.scrollHeight);

    return await html2canvas(exportCard, {
      backgroundColor: '#f3efe7',
      height: exportHeight,
      logging: false,
      scale,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      width: exportCardWidth,
      windowHeight: exportHeight,
      windowWidth: exportCardWidth,
    });
  } finally {
    exportHost.remove();
  }
}

function addPdfPageLinks(pdf, pageElement, pageWidthMm) {
  const pageRect = pageElement.getBoundingClientRect();
  const mmPerPixel = pageWidthMm / pageRect.width;

  pageElement.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkRect = link.getBoundingClientRect();
    const x = (linkRect.left - pageRect.left) * mmPerPixel;
    const y = (linkRect.top - pageRect.top) * mmPerPixel;
    const width = linkRect.width * mmPerPixel;
    const height = linkRect.height * mmPerPixel;

    pdf.link(x, y, width, height, { url: href });
  });
}

async function createInvitationPdf(onProgress: (progress: number) => void) {
  if (!invitationCard.value) throw new Error('Primero genera tu invitación.');

  await document.fonts?.ready;
  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF } = await import('jspdf');
  const { exportCard, exportHost } = createExportCard();

  try {
    onProgress(12);
    await waitForExportAssets(exportCard);

    const pages = [...exportCard.querySelectorAll('.preview-invitation__page')];
    if (!pages.length) throw new Error('No se encontró contenido para generar el PDF.');
    onProgress(18);

    const firstPageHeight = Math.ceil(pages[0].getBoundingClientRect().height);
    const pdfWidth = exportCardWidth * cssPixelToMm;
    const firstPdfHeight = firstPageHeight * cssPixelToMm;
    const pdf = new jsPDF({
      compress: true,
      orientation: 'portrait',
      unit: 'mm',
      format: [pdfWidth, firstPdfHeight],
    });

    for (const [index, page] of pages.entries()) {
      onProgress(Math.round(18 + (index / pages.length) * 72));
      const pageHeight = Math.ceil(page.getBoundingClientRect().height);
      const pdfHeight = pageHeight * cssPixelToMm;

      if (index > 0) {
        pdf.addPage([pdfWidth, pdfHeight], 'portrait');
      }

      const canvas = await html2canvas(page, {
        backgroundColor: '#f3efe7',
        height: pageHeight,
        logging: false,
        scale: exportPdfCanvasScale,
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
        width: exportCardWidth,
        windowHeight: pageHeight,
        windowWidth: exportCardWidth,
      });
      const imageData = canvas.toDataURL('image/jpeg', exportPdfImageQuality);

      pdf.addImage(imageData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'SLOW');
      addPdfPageLinks(pdf, page, pdfWidth);
      onProgress(Math.round(18 + ((index + 1) / pages.length) * 72));
    }

    onProgress(96);
    return pdf;
  } finally {
    exportHost.remove();
  }
}

async function exportAsPdf() {
  isExporting.value = true;
  exportProgress.value = 4;

  try {
    const pdf = await createInvitationPdf((progress) => {
      exportProgress.value = progress;
    });
    pdf.save(invitationPdfFilename());
    exportProgress.value = 100;
  } finally {
    window.setTimeout(() => {
      isExporting.value = false;
      exportProgress.value = 0;
    }, 450);
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-[radial-gradient(circle_at_90%_18%,rgba(205,192,166,0.2),transparent_25rem),linear-gradient(180deg,#f7f4ee_0%,#f0ede5_100%)] pb-16 text-[#512301]"
  >
    <header
      class="fixed left-0 top-0 z-50 w-full border-b border-[rgba(196,188,174,0.8)] bg-[rgba(247,244,238,0.9)] shadow-[0_14px_36px_-34px_rgba(81,35,1,0.5)] backdrop-blur-[16px]"
    >
      <div
        class="mx-auto flex h-[82px] w-[calc(100%-40px)] max-w-[1560px] items-center justify-between gap-7 max-[900px]:h-[70px] max-[900px]:w-[calc(100%-32px)] max-[520px]:h-[68px] max-[520px]:w-[calc(100%-24px)] max-[520px]:gap-2.5"
      >
        <NuxtLink
          to="/"
          class="inline-flex min-w-0 items-center gap-3.5 text-[#512301] max-[520px]:gap-2"
          aria-label="Volver al inicio"
        >
          <span
            class="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full border border-[rgba(173,147,99,0.52)] bg-[#f4f1eb] max-[520px]:h-[42px] max-[520px]:w-[42px]"
            aria-hidden="true"
          >
            <img
              class="h-[37px] w-[37px] object-contain max-[520px]:h-[34px] max-[520px]:w-[34px]"
              :src="assetPath('/images/monograma.png')"
              alt=""
            />
          </span>
          <span class="font-serif text-[28px] font-medium italic leading-none tracking-[-.02em] text-[#512301] max-[520px]:text-2xl">Renée &amp; Gabriel</span>
        </NuxtLink>

        <NuxtLink
          to="/#asistencia"
          class="inline-flex items-center gap-2 font-sans text-[10px] font-bold tracking-[.16em] text-[#512301] uppercase transition-colors hover:text-folio-overline max-[520px]:text-[0px] max-[520px]:[&_.material-symbols-outlined]:text-xl"
        >
          <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          Volver
        </NuxtLink>
      </div>
    </header>

    <main class="mx-auto min-h-screen w-[calc(100%-40px)] max-w-[1560px] pt-32 md:pt-40 max-[900px]:w-[calc(100%-32px)] max-[520px]:w-[calc(100%-24px)]">
      <div class="mx-auto max-w-3xl text-center">
        <span class="inline-flex items-center gap-3.5 font-sans text-[10px] font-semibold tracking-[.24em] text-folio-overline uppercase before:h-px before:w-6 before:bg-[rgba(173,147,99,0.62)] before:content-[''] after:h-px after:w-6 after:bg-[rgba(173,147,99,0.62)] after:content-[''] max-[900px]:before:w-[18px] max-[900px]:after:w-[18px]">INVITACION</span>
        <h1 class="mt-5 font-serif text-[48px] leading-[.9] text-[#512301] md:text-[76px]">
          Confirma tu asistencia
        </h1>
      </div>

      <div class="mx-auto mt-12 grid max-w-[1240px] grid-cols-[minmax(280px,.78fr)_minmax(0,1.22fr)] gap-3.5 max-[900px]:grid-cols-1">
        <section class="min-h-[680px] border border-folio-line bg-[rgba(251,250,246,0.74)] p-[clamp(32px,5vw,64px)] max-[900px]:min-h-0 max-[520px]:px-5 max-[520px]:py-6">
          <span class="font-sans text-[11px] font-bold tracking-[.18em] text-folio-gold uppercase">01 <span class="font-medium text-[#9a9285]">de 01</span></span>
          <h2 class="mt-8 font-serif text-4xl leading-none text-[#512301] md:text-5xl">
            Llene la invitacion
          </h2>
          <p class="mt-5 max-w-md text-[#6f5b50]">
            Escriba su nombre completo para continuar
          </p>

          <p class="mt-5 max-w-md text-[#6f5b50]">
            **La invitacion es Intransferible**
          </p>

          <form class="mt-10" @submit.prevent="submitName">
            <label class="block font-sans text-[10px] font-bold tracking-[.18em] text-[#512301] uppercase" for="guest-name">Nombre completo</label>
            <input
              id="guest-name"
              v-model="guestName"
              class="mt-3 w-full border-0 border-b border-[#bdb4a5] bg-transparent px-0 pb-3.5 pt-3 font-serif text-[28px] text-[#512301] outline-none transition-colors duration-[180ms] placeholder:text-[#a69d90] focus:border-folio-gold aria-[invalid=true]:border-[#a85845] max-[520px]:text-2xl"
              type="text"
              name="nombre"
              autocomplete="name"
              maxlength="80"
              placeholder="Nombre Completo"
              :aria-invalid="Boolean(nameError)"
              :aria-describedby="nameError ? 'name-error' : undefined"
              @input="nameError = ''"
            />

            <div class="mt-6 grid gap-5">
              <div>
                <label class="block font-sans text-[10px] font-bold tracking-[.18em] text-[#512301] uppercase" for="guest-email">Correo</label>
                <input
                  id="guest-email"
                  v-model="guestEmail"
                  class="mt-3 w-full border-0 border-b border-[#bdb4a5] bg-transparent px-0 pb-3.5 pt-3 font-sans text-[16px] text-[#512301] outline-none transition-colors duration-[180ms] placeholder:text-[#a69d90] focus:border-folio-gold"
                  type="email"
                  name="correo"
                  autocomplete="email"
                  maxlength="120"
                  placeholder="juan@gmail.com"
                  @input="nameError = ''"
                />
              </div>
            </div>

            <p v-if="nameError" id="name-error" class="mt-[9px] text-[13px] text-[#a85845]" role="alert">
              {{ nameError }}
            </p>

            <p
              v-if="confirmationMessage"
              class="mt-[9px] text-[13px]"
              :class="confirmationState === 'error' ? 'text-[#a85845]' : confirmationState === 'warning' ? 'text-[#a67b00]' : 'text-[#4f7f45]'"
              role="status"
            >
              {{ confirmationMessage }}
            </p>

            <p
              v-if="emailMessage"
              class="mt-[9px] text-[13px]"
              :class="emailState === 'error' ? 'text-[#a85845]' : 'text-[#4f7f45]'"
              role="status"
            >
              {{ emailMessage }}
            </p>

            <button class="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-sm border border-[#512301] bg-[#512301] px-[25px] py-3.5 font-sans text-[10px] font-bold tracking-[.2em] text-[#fbfaf6] uppercase transition-[background,box-shadow,transform] duration-[180ms] hover:-translate-y-0.5 hover:bg-[#6d3914] hover:shadow-[0_14px_28px_-20px_rgba(81,35,1,0.7)] disabled:cursor-wait disabled:opacity-70 sm:w-auto" type="submit" :disabled="isSubmitting" :aria-busy="isSubmitting">
              {{ isSubmitting ? 'Enviando confirmación...' : 'Confirmar asistencia' }}
              <span class="material-symbols-outlined ml-2 text-[18px]" aria-hidden="true">arrow_forward</span>
            </button>
          </form>
        </section>

        <section class="border border-folio-line bg-[rgba(251,250,246,0.74)] p-[clamp(24px,4vw,48px)] max-[520px]:px-5 max-[520px]:py-6" aria-labelledby="preview-title">
          <div class="flex items-center justify-between gap-4">
            <div>
              <span class="inline-flex items-center gap-3.5 font-sans text-[10px] font-semibold tracking-[.24em] text-folio-overline uppercase before:h-px before:w-6 before:bg-[rgba(173,147,99,0.62)] before:content-[''] after:h-px after:w-6 after:bg-[rgba(173,147,99,0.62)] after:content-[''] max-[900px]:before:w-[18px] max-[900px]:after:w-[18px]">02 · Vista previa</span>
              <h2 id="preview-title" class="mt-3 font-serif text-3xl text-[#512301] md:text-4xl">
                Tu invitación
              </h2>
            </div>
            <span v-if="submittedName" class="border border-[rgba(173,147,99,0.55)] px-2.5 py-[7px] font-sans text-[9px] font-bold tracking-[.16em] text-folio-overline uppercase">
              {{ invitationNames.length }} {{ invitationNames.length === 1 ? 'persona' : 'personas' }}
            </span>
          </div>






          <div v-if="submittedName" class="preview-stage mt-8">
            <article
              ref="invitationCard"
              class="preview-invitation"
              :data-guest-count="invitationNames.length"
              :data-guest-density="invitationNameDensity"
            >
              <section class="preview-invitation__page preview-invitation__cover">
                <img class="preview-invitation__cover-image" :src="invitationSlides[0].src" :alt="invitationSlides[0].alt" />
                <div class="preview-invitation__cover-wash" aria-hidden="true"></div>
                <div class="preview-invitation__frame" aria-hidden="true"></div>
                <div class="preview-invitation__cover-content">
                  <span class="preview-invitation__eyebrow">Renée &amp; Gabriel</span>
                  <img class="preview-invitation__monogram" :src="assetPath('/images/monograma-white.png')" alt="Monograma de Renée y Gabriel" />
                  <p class="preview-invitation__cover-kicker">Siempre tuyo, siempre mío,<br />siempre nuestro.</p>
                  <h3>Renée <i>&amp;</i> Gabriel</h3>
                  <div class="preview-invitation__cover-date">
                    <span>21 de noviembre de 2026</span>
                    <i aria-hidden="true"></i>
                    <span>Hermosillo, Sonora</span>
                  </div>
                  <a class="preview-invitation__music-link" :href="invitationMusicLink" target="_blank" rel="noreferrer">
                    <span class="material-symbols-outlined" aria-hidden="true">play_circle</span>
                    Escucha nuestra canción
                  </a>
                </div>
              </section>

              <section class="preview-invitation__page preview-invitation__story">
                <div class="preview-invitation__page-heading">
                  <span>01 / Invitación</span>
                  <span>21 — 11 — 26</span>
                </div>
                <p class="preview-invitation__section-label">Con la bendición de Dios y nuestros padres</p>
                <h3 class="preview-invitation__title">Tenemos el honor<br />de invitarte a celebrar</h3>
                <p class="preview-invitation__names">Renée <i>&amp;</i> Gabriel</p>

                <div class="preview-invitation__guest-card">
                  <span>Esta invitación es para</span>
                  <strong v-for="(name, index) in invitationNames" :key="`${name}-${index}`">{{ name }}</strong>
                </div>

                <div class="preview-invitation__parents">
                  <div v-for="parent in invitationParents" :key="parent.label">
                    <span>{{ parent.label }}</span>
                    <p v-for="name in parent.names" :key="name">{{ name }}</p>
                  </div>
                </div>

                <div class="preview-invitation__quote">“El amor no mira con los ojos, sino con el alma.”</div>
              </section>

              <section class="preview-invitation__page preview-invitation__event-page">
                <div class="preview-invitation__page-heading">
                  <span>02 / El día</span>
                  <span>Hermosillo, Sonora</span>
                </div>
                <h3 class="preview-invitation__title">Cronograma<br />de nuestra celebración</h3>
                <p class="preview-invitation__intro-text">Acompáñanos a vivir cada momento de este día tan especial.</p>

                <div class="preview-invitation__schedule">
                  <div v-for="(item, index) in invitationSchedule" :key="`${item.time}-${item.title}`" class="preview-invitation__schedule-item">
                    <span class="preview-invitation__schedule-time">{{ item.time }}</span>
                    <span class="preview-invitation__schedule-dot" aria-hidden="true"></span>
                    <div>
                      <h4>{{ item.title }}</h4>
                      <p>{{ item.detail }}</p>
                      <a v-if="item.link" :href="item.link" target="_blank" rel="noreferrer">
                        Ver ubicación <span class="material-symbols-outlined" aria-hidden="true">north_east</span>
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              <section class="preview-invitation__page preview-invitation__people-page">
                <div class="preview-invitation__page-heading">
                  <span>03 / Padrinos</span>
                  <span>Con cariño</span>
                </div>
                <h3 class="preview-invitation__title">Personas que<br />nos acompañan</h3>
                <p class="preview-invitation__intro-text">Con cariño compartimos los nombres de quienes estarán cerca de nosotros en este día.</p>

                <div class="preview-invitation__sponsors">
                  <article v-for="sponsor in invitationSponsors" :key="sponsor.label">
                    <span class="material-symbols-outlined" aria-hidden="true">{{ sponsor.icon }}</span>
                    <small>Padrinos de {{ sponsor.label }}</small>
                    <strong>{{ sponsor.names }}</strong>
                  </article>
                </div>

              </section>

              <section class="preview-invitation__page preview-invitation__details-page">
                <div class="preview-invitation__photo-wide">
                  <img :src="invitationSlides[2].src" :alt="invitationSlides[2].alt" />
                  <span>Renée &amp; Gabriel</span>
                </div>

                <div class="preview-invitation__detail-block">
                  <span class="preview-invitation__section-label">Detalles importantes</span>
                  <h3 class="preview-invitation__title">Para celebrar<br />en armonía</h3>
                  <div class="preview-invitation__detail-grid">
                    <div>
                      <span>Código de vestimenta</span>
                      <strong>Elegancia rigurosa</strong>
                    </div>
<div>
                       <span>Invitación</span>
                       <strong>Respetuosamente no niños · Intransferible</strong>
                     </div>
                     <div>
                       <span>Color mamá de la novia</span>
                       <strong>Azul</strong>
                     </div>
                   </div>
                   <div class="preview-invitation__colors-block">
                     <span>Colores a evitar</span>
                     <div class="preview-invitation__avoid-colors" aria-label="Beige, blanco, crema y rojo">
                       <i v-for="color in invitationAvoidColors" :key="color.name" :style="{ backgroundColor: color.value }" :title="color.name"></i>
                     </div>
                     <p>Beige, blanco, crema, tonos similares y rojo.</p>
                   </div>
                </div>

                <div class="preview-invitation__actions">
                  <a :href="invitationMusicLink" target="_blank" rel="noreferrer">
                    Escucha nuestra canción
                  </a>
                  <a :href="invitationGiftLink" target="_blank" rel="noreferrer">
                    Ver mesa de regalos
                  </a>
                </div>
              </section>

              <section class="preview-invitation__page preview-invitation__closing-page">
                <img :src="invitationSlides[3].src" :alt="invitationSlides[3].alt" />
                <div class="preview-invitation__closing-wash" aria-hidden="true"></div>
                <div class="preview-invitation__closing-content">
                  <span class="preview-invitation__eyebrow">Gracias por acompañarnos</span>
                  <h3>Nos vemos<br />en el altar</h3>
                  <p>{{ invitationNames.join(' · ') }}</p>
                  <span>Renée &amp; Gabriel · 21.11.2026</span>
                </div>
              </section>
            </article>
          </div>








          <div v-else class="mt-8 flex min-h-[540px] flex-col items-center justify-center bg-[#ece8df] max-[520px]:min-h-[420px]">
            <div class="mb-[26px] grid h-[68px] w-[68px] place-items-center border border-[rgba(173,147,99,0.66)] text-folio-overline" aria-hidden="true">
              <span class="material-symbols-outlined text-[26px]">favorite</span>
            </div>
            <p class="inline-flex items-center gap-3.5 font-sans text-[10px] font-semibold tracking-[.24em] text-folio-overline uppercase before:h-px before:w-6 before:bg-[rgba(173,147,99,0.62)] before:content-[''] after:h-px after:w-6 after:bg-[rgba(173,147,99,0.62)] after:content-[''] max-[900px]:before:w-[18px] max-[900px]:after:w-[18px]">Aún no hay nombre</p>
            <p class="mt-3 max-w-xs text-center text-sm text-[#6f5b50]">
              Completa el formulario para ver aparecer tu invitación personal.
            </p>
          </div>

          <div v-if="submittedName" class="mt-7 flex items-center justify-between gap-[18px] border-t border-folio-line pt-[18px] max-[520px]:items-start max-[520px]:flex-col">
            <div>
              <p class="text-sm font-semibold text-[#512301]">Descarga tu invitación</p>
              <p class="mt-1 text-xs text-[#6f5b50]">
                {{ isExporting ? `Preparando PDF · ${exportProgress}%` : isSendingEmail ? `Preparando correo · ${emailProgress}%` : 'Se generará en PDF con tus enlaces incluidos.' }}
              </p>
              <div v-if="isExporting || isSendingEmail" class="mt-3 h-1.5 w-[min(260px,70vw)] overflow-hidden rounded-full bg-[rgba(168,142,95,0.22)]">
                <span
                  class="block h-full rounded-full bg-[#512301] transition-[width] duration-300"
                  :style="{ width: `${isSendingEmail ? emailProgress : exportProgress}%` }"
                ></span>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button class="inline-flex min-h-[42px] items-center gap-2 rounded-sm border border-[#512301] bg-[#512301] px-4 py-[11px] font-sans text-[9px] font-extrabold tracking-[.13em] text-[#fbfaf6] uppercase transition-[background,box-shadow,transform] duration-[180ms] hover:-translate-y-0.5 hover:bg-[#6d3914] hover:shadow-[0_14px_28px_-20px_rgba(81,35,1,0.7)] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none [&_.material-symbols-outlined]:text-[17px]" type="button" :disabled="isExporting || isSendingEmail" @click="exportAsPdf">
                <span class="material-symbols-outlined text-[17px]" aria-hidden="true">picture_as_pdf</span>
                {{ isExporting ? 'Generando PDF' : 'Descargar como PDF' }}
              </button>
              <button class="inline-flex min-h-[42px] items-center gap-2 rounded-sm border border-[#9a7a3f] bg-[#f7f1e4] px-4 py-[11px] font-sans text-[9px] font-extrabold tracking-[.13em] text-[#512301] uppercase transition-[background,box-shadow,transform] duration-[180ms] hover:-translate-y-0.5 hover:bg-[#efe4cf] hover:shadow-[0_14px_28px_-20px_rgba(81,35,1,0.35)] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none [&_.material-symbols-outlined]:text-[17px]" type="button" :disabled="isSendingEmail || isExporting || confirmationState === 'idle'" @click="sendInvitationEmail">
                <span class="material-symbols-outlined text-[17px]" aria-hidden="true">mail</span>
                {{ isSendingEmail ? 'Enviando correo' : 'Enviar por correo' }}
              </button>
              <button class="inline-flex min-h-[38px] items-center gap-1.5 rounded-sm border border-transparent bg-transparent px-3 py-[9px] font-sans text-[9px] font-extrabold tracking-[.12em] text-[#7c7469] uppercase transition-colors duration-[180ms] hover:border-folio-gold hover:bg-[#ebe7df] [&_.material-symbols-outlined]:text-[17px]" type="button" @click="editName">
                <span class="material-symbols-outlined text-[17px]" aria-hidden="true">edit</span>
                Editar
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style>
.preview-invitation {
  position: relative;
  width: min(100%, 430px);
  height: 760px;
  overflow: hidden;
  background: #d4cabc;
  color: #171512;
  font-family: 'Cormorant Garamond', Georgia, serif;
  box-shadow: 0 28px 54px -30px rgba(53, 38, 21, 0.58);
}

.preview-invitation,
.preview-invitation * {
  box-sizing: border-box;
}

.preview-invitation::before {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: '';
  opacity: 0.38;
  background:
    radial-gradient(circle at 12% 6%, rgba(154, 126, 83, 0.16), transparent 30%),
    radial-gradient(circle at 88% 94%, rgba(154, 126, 83, 0.12), transparent 28%),
    repeating-linear-gradient(0deg, rgba(72, 55, 33, 0.025) 0 1px, transparent 1px 4px);
}

.preview-invitation__envelope {
  position: absolute;
  inset: 8px;
  z-index: 1;
  overflow: hidden;
  border: 1px solid rgba(104, 83, 58, 0.52);
  background: linear-gradient(145deg, #dcd4c8, #c6bbaa);
  box-shadow: inset 0 0 0 7px rgba(255, 252, 246, 0.12);
}

.preview-invitation__envelope::before,
.preview-invitation__envelope::after {
  position: absolute;
  pointer-events: none;
  content: '';
}

.preview-invitation__envelope::before {
  inset: 0 0 auto;
  height: 53%;
  border-bottom: 1px solid rgba(104, 83, 58, 0.38);
  background: linear-gradient(145deg, rgba(245, 240, 231, 0.32), rgba(166, 150, 130, 0.18));
  clip-path: polygon(0 0, 50% 58%, 100% 0, 100% 100%, 0 100%);
}

.preview-invitation__envelope::after {
  right: 9%;
  bottom: 8%;
  width: 105px;
  height: 105px;
  border: 1px solid rgba(104, 83, 58, 0.23);
  border-radius: 50%;
}

.preview-invitation__paper {
  position: relative;
  display: flex;
  z-index: 2;
  width: calc(100% - 32px);
  height: calc(100% - 32px);
  flex-direction: column;
  margin: 16px;
  border: 1px solid rgba(117, 91, 57, 0.68);
  padding: 19px 25px 17px;
  overflow: hidden;
  background: linear-gradient(145deg, #f5f0e7, #f0ebe1);
  text-align: center;
}

.preview-invitation__paper::before,
.preview-invitation__paper::after {
  position: absolute;
  pointer-events: none;
  content: '';
}

.preview-invitation__paper::before {
  inset: 7px;
  border: 1px solid rgba(154, 126, 83, 0.3);
}

.preview-invitation__paper::after {
  top: 20%;
  right: -96px;
  width: 180px;
  height: 180px;
  border: 1px solid rgba(154, 126, 83, 0.12);
  border-radius: 50%;
}

.preview-invitation__masthead,
.preview-invitation__footer,
.preview-invitation__parents span,
.preview-invitation__guest > span,
.preview-invitation__events span {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.preview-invitation__masthead {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #765f3f;
  font-size: 7px;
  line-height: 1;
}

.preview-invitation__intro,
.preview-invitation__parents,
.preview-invitation__couple,
.preview-invitation__guest,
.preview-invitation__date,
.preview-invitation__events,
.preview-invitation__sponsors,
.preview-invitation__details,
.preview-invitation__footer {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.preview-invitation__intro {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 8px;
}

.preview-invitation__monogram {
  width: 67px;
  height: 67px;
  object-fit: contain;
  margin-bottom: 7px;
  mix-blend-mode: multiply;
}

.preview-invitation__overline {
  margin: 0;
  color: #1d1a16;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1.12;
  text-transform: uppercase;
}

.preview-invitation__blessing {
  margin: 11px 0 0;
  color: #2d2821;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.09em;
  line-height: 1.16;
  text-transform: uppercase;
}

.preview-invitation__parents {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid rgba(117, 91, 57, 0.36);
}

.preview-invitation__parents > div + div {
  border-left: 1px solid rgba(117, 91, 57, 0.28);
  padding-left: 18px;
}

.preview-invitation__parents span,
.preview-invitation__guest > span,
.preview-invitation__events span {
  display: block;
  color: #765f3f;
  font-size: 6.5px;
  line-height: 1.1;
}

.preview-invitation__parents p {
  margin: 4px 0 0;
  color: #211d18;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.02;
}

.preview-invitation__couple {
  margin-top: 14px;
}

.preview-invitation__couple p {
  margin: 0;
  color: #765f3f;
  font-family: 'DM Sans', sans-serif;
  font-size: 6.5px;
  font-weight: 700;
  letter-spacing: 0.16em;
  line-height: 1.1;
  text-transform: uppercase;
}

.preview-invitation__couple h3 {
  margin: 6px 0 0;
  color: #171512;
  font-size: 43px;
  font-weight: 500;
  letter-spacing: -0.055em;
  line-height: 0.92;
}

.preview-invitation__couple h3 i {
  font-size: 0.62em;
  font-style: normal;
  font-weight: 400;
}

.preview-invitation__guest {
  margin-top: 20px;
}

.preview-invitation__guest > div {
  display: flex;
  align-items: center;
  min-height: 0;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  margin-top: 5px;
  flex: 0 0 auto;
}

.preview-invitation__guest p {
  max-width: 100%;
  margin: 0;
  overflow-wrap: anywhere;
  color: #171512;
  font-size: 24px;
  font-weight: 600;
  line-height: 0.86;
}

.preview-invitation[data-guest-count='2'] .preview-invitation__guest p {
  font-size: 21px;
}

.preview-invitation[data-guest-count='3'] .preview-invitation__guest p {
  font-size: 18px;
}

.preview-invitation[data-guest-density='compact'][data-guest-count='1'] .preview-invitation__guest p {
  font-size: 21px;
}

.preview-invitation[data-guest-density='compact'][data-guest-count='2'] .preview-invitation__guest p {
  font-size: 18px;
}

.preview-invitation[data-guest-density='compact'][data-guest-count='3'] .preview-invitation__guest p {
  font-size: 16px;
}

.preview-invitation[data-guest-density='long'] .preview-invitation__guest {
  margin-top: 18px;
}

.preview-invitation[data-guest-density='long'][data-guest-count='1'] .preview-invitation__guest p {
  font-size: 18px;
}

.preview-invitation[data-guest-density='long'][data-guest-count='2'] .preview-invitation__guest p {
  font-size: 16px;
}

.preview-invitation[data-guest-density='long'][data-guest-count='3'] .preview-invitation__guest p {
  font-size: 13.5px;
  line-height: 0.92;
}

.preview-invitation[data-guest-density='long'] .preview-invitation__guest > div {
  gap: 0;
  margin-top: 4px;
}

.preview-invitation__date {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 13px;
  min-height: 28px;
  color: #211d18;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1.1;
  text-transform: uppercase;
}

.preview-invitation__date i {
  width: 3px;
  height: 3px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #9a7e53;
}

.preview-invitation__events {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 17px;
  padding-top: 11px;
  border-top: 1px solid rgba(117, 91, 57, 0.36);
}

.preview-invitation__events > div + div {
  border-left: 1px solid rgba(117, 91, 57, 0.28);
  padding-left: 16px;
}

.preview-invitation__events strong {
  display: block;
  margin-top: 4px;
  color: #171512;
  font-size: 20px;
  font-weight: 600;
  line-height: 0.9;
}

.preview-invitation__events small {
  display: block;
  margin-top: 4px;
  color: #3a3329;
  font-size: 9px;
  font-weight: 600;
  line-height: 1.05;
}

.preview-invitation__sponsors {
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid rgba(117, 91, 57, 0.36);
}

.preview-invitation__sponsors > span {
  display: block;
  color: #765f3f;
  font-family: 'DM Sans', sans-serif;
  font-size: 6.5px;
  font-weight: 700;
  letter-spacing: 0.16em;
  line-height: 1.1;
  text-transform: uppercase;
}

.preview-invitation__sponsors > div {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px 16px;
  margin-top: 7px;
}

.preview-invitation__sponsors p {
  margin: 0;
}

.preview-invitation__sponsors strong,
.preview-invitation__sponsors small {
  display: block;
}

.preview-invitation__sponsors strong {
  color: #211d18;
  font-size: 10px;
  font-weight: 600;
  line-height: 0.95;
}

.preview-invitation__sponsors small {
  margin-top: 3px;
  color: #765f3f;
  font-family: 'DM Sans', sans-serif;
  font-size: 5.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  line-height: 1;
  text-transform: uppercase;
}

.preview-invitation__details {
  margin-top: 12px;
  padding-top: 9px;
  border-top: 1px solid rgba(117, 91, 57, 0.36);
}

.preview-invitation__details > span,
.preview-invitation__details-grid span,
.preview-invitation__avoid-colors > span {
  display: block;
  color: #765f3f;
  font-family: 'DM Sans', sans-serif;
  font-size: 6.5px;
  font-weight: 700;
  letter-spacing: 0.16em;
  line-height: 1.1;
  text-transform: uppercase;
}

.preview-invitation__details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 7px;
}

.preview-invitation__details-grid > div + div {
  border-left: 1px solid rgba(117, 91, 57, 0.28);
  padding-left: 16px;
}

.preview-invitation__details-grid strong {
  display: block;
  margin-top: 3px;
  color: #211d18;
  font-size: 10px;
  font-weight: 600;
  line-height: 0.95;
}

.preview-invitation__avoid-colors {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-top: 8px;
}

.preview-invitation__avoid-colors > div {
  display: flex;
  gap: 5px;
}

.preview-invitation__avoid-colors i {
  display: block;
  width: 11px;
  height: 11px;
  border: 1px solid rgba(33, 29, 24, 0.35);
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(245, 240, 231, 0.8);
}

.preview-invitation__footer {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 5px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(117, 91, 57, 0.36);
  color: #765f3f;
  font-size: 6.5px;
  line-height: 1.1;
}

.invitation-export-host {
  position: fixed;
  top: 0;
  left: -10000px;
  width: 430px;
  height: 760px;
  pointer-events: none;
}

.preview-invitation--export {
  width: 430px !important;
  height: 760px !important;
  box-shadow: none;
}

@media (max-width: 520px) {
  .preview-invitation {
    height: auto;
    aspect-ratio: 430 / 760;
  }

  .preview-invitation__paper {
    padding: 17px 18px 15px;
  }

  .preview-invitation__masthead {
    font-size: 6px;
  }

  .preview-invitation__monogram {
    width: 59px;
    height: 59px;
  }

  .preview-invitation__overline {
    font-size: 11px;
  }

  .preview-invitation__blessing {
    font-size: 9px;
  }

  .preview-invitation__parents {
    gap: 10px;
  }

  .preview-invitation__parents > div + div {
    padding-left: 10px;
  }

  .preview-invitation__parents p {
    font-size: 8px;
  }

  .preview-invitation__couple h3 {
    font-size: 35px;
  }

  .preview-invitation__date {
    gap: 6px;
    font-size: 9px;
  }

  .preview-invitation__events {
    gap: 9px;
  }

  .preview-invitation__events > div + div {
    padding-left: 9px;
  }

  .preview-invitation__events strong {
    font-size: 17px;
  }

  .preview-invitation__events small {
    font-size: 7px;
  }

  .preview-invitation__sponsors {
    margin-top: 10px;
    padding-top: 8px;
  }

  .preview-invitation__sponsors > div {
    gap: 5px 9px;
  }

  .preview-invitation__sponsors strong {
    font-size: 8px;
  }

  .preview-invitation__sponsors small {
    font-size: 4.5px;
  }

  .preview-invitation__details {
    margin-top: 8px;
    padding-top: 7px;
  }

  .preview-invitation__details-grid {
    gap: 9px;
    margin-top: 5px;
  }

  .preview-invitation__details-grid > div + div {
    padding-left: 9px;
  }

  .preview-invitation__details-grid strong {
    font-size: 8px;
  }

  .preview-invitation__avoid-colors {
    gap: 6px;
    margin-top: 6px;
  }

  .preview-invitation__avoid-colors i {
    width: 8px;
    height: 8px;
  }

  .preview-invitation__footer {
    font-size: 5.5px;
  }
}
</style>

<style>
.preview-stage {
  display: grid;
  min-height: 540px;
  max-height: 760px;
  place-items: start center;
  overflow: auto;
  padding: 24px;
  background:
    linear-gradient(rgba(173, 147, 99, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(173, 147, 99, 0.08) 1px, transparent 1px),
    #e8e3da;
  background-size: 28px 28px;
  scrollbar-color: #a88e5f transparent;
  scrollbar-width: thin;
}

.preview-invitation {
  position: relative;
  width: min(100%, 430px);
  height: auto;
  overflow: visible;
  background: #eee8dc;
  color: #27231e;
  font-family: 'Cormorant Garamond', Georgia, serif;
  box-shadow: 0 28px 54px -30px rgba(53, 38, 21, 0.58);
}

.preview-invitation,
.preview-invitation * {
  box-sizing: border-box;
}

.preview-invitation::before {
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
  content: '';
  opacity: 0.24;
  background: repeating-linear-gradient(0deg, rgba(72, 55, 33, 0.035) 0 1px, transparent 1px 4px);
  mix-blend-mode: multiply;
}

.preview-invitation__page {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 720px;
  flex-direction: column;
  overflow: hidden;
  padding: 40px 30px;
}

.preview-invitation__page::after {
  position: absolute;
  right: -74px;
  bottom: -74px;
  width: 170px;
  height: 170px;
  border: 1px solid rgba(168, 142, 95, 0.42);
  border-radius: 50%;
  content: '';
}

.preview-invitation__page-heading {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(168, 142, 95, 0.42);
  color: #826f4f;
  font-family: 'DM Sans', sans-serif;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.18em;
  line-height: 1.2;
  text-transform: uppercase;
}

.preview-invitation__eyebrow,
.preview-invitation__section-label {
  color: #f8f3e9;
  font-family: 'DM Sans', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.22em;
  line-height: 1.2;
  text-transform: uppercase;
}

.preview-invitation__cover {
  min-height: 720px;
  align-items: center;
  justify-content: center;
  padding: 46px 34px;
  color: #fffaf1;
  text-align: center;
}

.preview-invitation__cover-image,
.preview-invitation__cover-wash,
.preview-invitation__frame,
.preview-invitation__closing-page > img,
.preview-invitation__closing-wash {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.preview-invitation__cover-image,
.preview-invitation__closing-page > img {
  object-fit: cover;
  object-position: center center;
}

.preview-invitation__cover-image {
  filter: saturate(0.72) sepia(0.22) brightness(0.72);
  transform: scale(1.02);
}

.preview-invitation__cover-wash {
  background: linear-gradient(180deg, rgba(45, 28, 18, 0.28), rgba(45, 28, 18, 0.78));
}

.preview-invitation__frame {
  inset: 17px;
  width: auto;
  height: auto;
  border: 1px solid rgba(255, 248, 233, 0.66);
}

.preview-invitation__cover-content,
.preview-invitation__closing-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.preview-invitation__cover .preview-invitation__monogram {
  display: block;
  width: 90px;
  height: 90px;
  margin: 25px 0 18px;
  object-fit: contain;
  opacity: 0.92;
}

.preview-invitation__cover-kicker {
  margin: 0;
  color: rgba(255, 250, 241, 0.9);
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  line-height: 1.45;
  text-transform: uppercase;
}

.preview-invitation__cover h3 {
  margin: 24px 0 0;
  color: #fffaf1;
  font-size: 58px;
  font-weight: 500;
  letter-spacing: -0.08em;
  line-height: 0.78;
}

.preview-invitation__cover h3 i,
.preview-invitation__names i {
  font-size: 0.58em;
  font-style: normal;
  font-weight: 400;
}

.preview-invitation__cover-date {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 29px;
  color: rgba(255, 250, 241, 0.94);
  font-family: 'DM Sans', sans-serif;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.preview-invitation__cover-date i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #d3b37a;
}

.preview-invitation__music-link,
.preview-invitation__actions a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: inherit;
  font-family: 'DM Sans', sans-serif;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-decoration: none;
  text-transform: uppercase;
}

.preview-invitation__music-link {
  margin-top: 32px;
  padding: 10px 14px;
  border: 1px solid rgba(255, 248, 233, 0.7);
}

.preview-invitation__music-link .material-symbols-outlined,
.preview-invitation__actions .material-symbols-outlined {
  font-size: 17px;
}

.preview-invitation__story,
.preview-invitation__details-page {
  background: #f5f0e7;
}

.preview-invitation__story {
  justify-content: center;
  padding-top: 48px;
  padding-bottom: 48px;
  text-align: center;
}

.preview-invitation__story .preview-invitation__page-heading,
.preview-invitation__event-page .preview-invitation__page-heading,
.preview-invitation__people-page .preview-invitation__page-heading {
  width: 100%;
}

.preview-invitation__section-label {
  margin: 48px 0 0;
  color: #826f4f;
  font-size: 8px;
}

.preview-invitation__title {
  position: relative;
  z-index: 1;
  margin: 18px 0 0;
  color: #5b2503;
  font-size: 48px;
  font-weight: 500;
  letter-spacing: -0.06em;
  line-height: 0.84;
}

.preview-invitation__names {
  margin: 25px 0 0;
  color: #5b2503;
  font-size: 42px;
  font-weight: 500;
  letter-spacing: -0.06em;
  line-height: 0.82;
}

.preview-invitation__guest-card {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 5px;
  margin: 40px auto 0;
  padding: 17px 20px 19px;
  border-top: 1px solid rgba(168, 142, 95, 0.45);
  border-bottom: 1px solid rgba(168, 142, 95, 0.45);
}

.preview-invitation__guest-card span,
.preview-invitation__parents span,
.preview-invitation__detail-grid span,
.preview-invitation__colors-block > span,
.preview-invitation__sponsors small {
  color: #826f4f;
  font-family: 'DM Sans', sans-serif;
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.16em;
  line-height: 1.2;
  text-transform: uppercase;
}

.preview-invitation__guest-card strong {
  max-width: 100%;
  color: #27231e;
  font-size: 23px;
  font-weight: 600;
  line-height: 0.9;
  overflow-wrap: anywhere;
}

.preview-invitation[data-guest-density='compact'] .preview-invitation__guest-card strong {
  font-size: 19px;
}

.preview-invitation[data-guest-density='long'] .preview-invitation__guest-card strong {
  font-size: 15px;
}

.preview-invitation__parents {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  width: min(100%, 340px);
  margin: 34px auto 0;
  padding: 0;
  border: 0;
  text-align: center;
}

.preview-invitation__parents > div {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.preview-invitation__parents > div + div {
  padding-left: 22px;
  border-left: 1px solid rgba(168, 142, 95, 0.34);
}

.preview-invitation__parents p {
  max-width: 125px;
  margin: 8px 0 0;
  color: #6f6256;
  font-family: 'DM Sans', sans-serif;
  font-size: 7.6px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1.45;
}

.preview-invitation__quote {
  position: relative;
  z-index: 1;
  margin-top: auto;
  padding-top: 35px;
  color: #756e64;
  font-size: 17px;
  font-style: italic;
  line-height: 1.1;
}

.preview-invitation__event-page {
  min-height: 900px;
  background: #ebe5da;
}

.preview-invitation__intro-text {
  position: relative;
  z-index: 1;
  max-width: 280px;
  margin: 19px 0 0;
  color: #756e64;
  font-size: 19px;
  line-height: 1.05;
}

.preview-invitation__schedule {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 0;
  margin-top: 42px;
}

.preview-invitation__schedule-item {
  display: grid;
  grid-template-columns: 58px 12px minmax(0, 1fr);
  gap: 12px;
  min-height: 104px;
  padding: 0 0 24px;
}

.preview-invitation__schedule-time {
  padding-top: 2px;
  color: #a88e5f;
  font-family: 'DM Sans', sans-serif;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.preview-invitation__schedule-dot {
  position: relative;
  display: block;
  width: 9px;
  height: 9px;
  margin-top: 2px;
  border: 2px solid #ebe5da;
  border-radius: 50%;
  background: #a88e5f;
  box-shadow: 0 0 0 1px #a88e5f;
}

.preview-invitation__schedule-item:not(:last-child) .preview-invitation__schedule-dot::after {
  position: absolute;
  top: 8px;
  left: 2px;
  width: 1px;
  height: 104px;
  background: rgba(168, 142, 95, 0.45);
  content: '';
}

.preview-invitation__schedule-item h4 {
  margin: 0;
  color: #5b2503;
  font-size: 27px;
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 0.86;
}

.preview-invitation__schedule-item p {
  margin: 6px 0 0;
  color: #756e64;
  font-size: 17px;
  line-height: 1;
}

.preview-invitation__schedule-item a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  color: #826f4f;
  font-family: 'DM Sans', sans-serif;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-transform: uppercase;
}

.preview-invitation__schedule-item a .material-symbols-outlined {
  font-size: 13px;
}

.preview-invitation__people-page {
  min-height: 820px;
  background: #f5f0e7;
}

.preview-invitation__sponsors {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-top: 40px;
  padding: 0;
  border: 0;
}

.preview-invitation__sponsors article {
  min-height: 145px;
  padding: 16px 14px;
  border: 1px solid rgba(168, 142, 95, 0.4);
  background: rgba(251, 250, 246, 0.62);
}

.preview-invitation__sponsors article:nth-child(2n) {
  background: rgba(231, 224, 212, 0.68);
}

.preview-invitation__sponsors article > .material-symbols-outlined {
  display: block;
  margin-bottom: 18px;
  color: #a88e5f;
  font-size: 20px;
}

.preview-invitation__sponsors small {
  display: block;
  font-size: 6px;
}

.preview-invitation__sponsors strong {
  display: block;
  margin-top: 8px;
  color: #5b2503;
  font-size: 19px;
  font-weight: 500;
  line-height: 0.88;
}

.preview-invitation__photo-card {
  position: relative;
  z-index: 1;
  margin: 29px 0 0;
  overflow: hidden;
  border: 1px solid rgba(168, 142, 95, 0.42);
  background: #d3c7b4;
}

.preview-invitation__photo-card img {
  display: block;
  width: 100%;
  height: 185px;
  object-fit: cover;
  filter: saturate(0.75) sepia(0.15);
}

.preview-invitation__photo-card figcaption {
  padding: 10px 12px 12px;
  color: #756e64;
  font-size: 16px;
  font-style: italic;
  line-height: 1;
  text-align: center;
}

.preview-invitation__details-page {
  min-height: 890px;
  padding: 30px;
}

.preview-invitation__photo-wide {
  position: relative;
  z-index: 1;
  height: 260px;
  overflow: hidden;
  border: 1px solid rgba(168, 142, 95, 0.55);
}

.preview-invitation__photo-wide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.72) sepia(0.2) brightness(0.82);
}

.preview-invitation__photo-wide span {
  position: absolute;
  right: 13px;
  bottom: 12px;
  color: #fffaf1;
  font-family: 'DM Sans', sans-serif;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.preview-invitation__detail-block {
  position: relative;
  z-index: 1;
  margin-top: 31px;
}

.preview-invitation__detail-block .preview-invitation__section-label {
  display: block;
}

.preview-invitation__detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 28px;
  padding-top: 15px;
  border-top: 1px solid rgba(168, 142, 95, 0.42);
}

.preview-invitation__detail-grid > div + div {
  padding-left: 15px;
  border-left: 1px solid rgba(168, 142, 95, 0.34);
}

.preview-invitation__detail-grid strong {
  display: block;
  margin-top: 7px;
  color: #5b2503;
  font-size: 22px;
  font-weight: 500;
  line-height: 0.9;
}

.preview-invitation__colors-block {
  margin-top: 22px;
  padding-top: 15px;
  border-top: 1px solid rgba(168, 142, 95, 0.42);
}

.preview-invitation__avoid-colors {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-top: 10px;
}

.preview-invitation__avoid-colors i {
  display: block;
  width: 19px;
  height: 19px;
  border: 2px solid #f5f0e7;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(39, 35, 30, 0.32);
}

.preview-invitation__colors-block p {
  margin: 9px 0 0;
  color: #756e64;
  font-family: 'DM Sans', sans-serif;
  font-size: 8px;
  letter-spacing: 0.04em;
}

.preview-invitation__actions {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 9px;
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid rgba(168, 142, 95, 0.42);
}

.preview-invitation__actions a {
  justify-content: center;
  min-height: 42px;
  color: #f8f3e9;
  background: #5b2503;
}

.preview-invitation__closing-page {
  min-height: 680px;
  align-items: center;
  justify-content: center;
  padding: 45px 34px;
  color: #fffaf1;
  text-align: center;
}

.preview-invitation__closing-page > img {
  filter: saturate(0.7) sepia(0.2) brightness(0.62);
  object-position: center center;
}

.preview-invitation__closing-wash {
  background: linear-gradient(180deg, rgba(39, 30, 22, 0.22), rgba(39, 30, 22, 0.8));
}

.preview-invitation__closing-content h3 {
  margin: 26px 0 0;
  color: #fffaf1;
  font-size: 58px;
  font-weight: 500;
  letter-spacing: -0.07em;
  line-height: 0.78;
}

.preview-invitation__closing-content p {
  max-width: 330px;
  margin: 32px 0 0;
  color: #fffaf1;
  font-size: 22px;
  line-height: 0.92;
}

.preview-invitation__closing-content > span:last-child {
  margin-top: 18px;
  color: rgba(255, 250, 241, 0.82);
  font-family: 'DM Sans', sans-serif;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.invitation-export-host {
  position: absolute !important;
  top: 0 !important;
  left: -10000px !important;
  width: 430px !important;
  height: auto !important;
  overflow: visible !important;
  pointer-events: none !important;
}

.preview-invitation--export {
  width: 430px !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  box-shadow: none !important;
}

.preview-invitation--export .preview-invitation__page {
  break-inside: avoid;
}

@media (max-width: 520px) {
  .preview-stage {
    min-height: 430px;
    max-height: 690px;
    padding: 14px;
  }

  .preview-invitation__page {
    padding: 33px 22px;
  }

  .preview-invitation__cover,
  .preview-invitation__closing-page {
    padding-right: 25px;
    padding-left: 25px;
  }

  .preview-invitation__cover h3,
  .preview-invitation__closing-content h3 {
    font-size: 49px;
  }

  .preview-invitation__cover .preview-invitation__monogram {
    width: 76px;
    height: 76px;
  }

  .preview-invitation__title {
    font-size: 42px;
  }

  .preview-invitation__names {
    font-size: 36px;
  }

  .preview-invitation__parents {
    gap: 11px;
  }

  .preview-invitation__parents > div + div,
  .preview-invitation__detail-grid > div + div {
    padding-left: 11px;
  }

  .preview-invitation__parents p {
    font-size: 10px;
  }

  .preview-invitation__schedule-item {
    grid-template-columns: 50px 12px minmax(0, 1fr);
    gap: 9px;
  }

  .preview-invitation__schedule-item h4 {
    font-size: 24px;
  }

  .preview-invitation__sponsors strong {
    font-size: 16px;
  }

  .preview-invitation__details-page {
    padding-right: 22px;
    padding-left: 22px;
  }

  .preview-invitation__detail-grid {
    gap: 10px;
  }

  .preview-invitation__detail-grid strong {
    font-size: 18px;
  }
}
</style>
