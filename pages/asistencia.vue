<script setup>
import { computed, nextTick, ref, watch } from 'vue';

const route = useRoute();
const router = useRouter();
const baseURL = useRuntimeConfig().app.baseURL;

function assetPath(path) {
  const basePath = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

  return `${basePath}${path}`;
}

function normalizeName(value) {
  return value.trim().replace(/\s+/g, ' ').slice(0, 80);
}

const guestName = ref('');
const additionalGuestCount = ref(0);
const companionNames = ref(['', '']);
const submittedName = ref('');
const submittedCompanions = ref([]);
const nameError = ref('');
const companionError = ref('');
const isExporting = ref(false);
const invitationCard = ref(null);
const exportCanvasScale = 4;

const queryName = computed(() => {
  const value = route.query.nombre;

  return typeof value === 'string' ? normalizeName(value) : '';
});

const queryCompanionNames = computed(() =>
  [route.query.acompanante1, route.query.acompanante2]
    .map((value) => (typeof value === 'string' ? normalizeName(value) : ''))
    .filter(Boolean),
);

const queryCompanionCount = computed(() => {
  const count = Number(route.query.acompanantes);

  return Number.isInteger(count) && count >= 0 && count <= 2
    ? count
    : queryCompanionNames.value.length;
});

const invitationNames = computed(() => [submittedName.value, ...submittedCompanions.value]);
const invitationNameDensity = computed(() => {
  const longestName = Math.max(...invitationNames.value.map((name) => name.length), 0);

  if (longestName >= 30) return 'long';
  if (longestName >= 22) return 'compact';

  return 'normal';
});
const invitationSponsors = [
  { label: 'Velación', names: 'Sandra y Raúl Ambriz' },
  { label: 'Lazo', names: 'Carlos Coronado y Carolina Henry' },
  { label: 'Anillos', names: 'Marisol Urías y Héctor Díaz' },
  { label: 'Arras', names: 'Fernando Coronado y Leslie Ibarra' },
];
const invitationAvoidColors = [
  { name: 'Beige', value: '#f1dfc7' },
  { name: 'Blanco', value: '#ffffff' },
  { name: 'Crema', value: '#fff1d6' },
  { name: 'Rojo', value: '#c5161d' },
];

watch(
  [queryName, queryCompanionCount, queryCompanionNames],
  ([name, companionCount, names]) => {
    if (!name) return;

    guestName.value = name;
    additionalGuestCount.value = companionCount;
    companionNames.value = [names[0] || '', names[1] || ''];
    submittedName.value = name;
    submittedCompanions.value = names.slice(0, companionCount);
  },
  { immediate: true },
);

function isFullName(value) {
  const name = normalizeName(value);

  return name.length >= 3 && name.split(' ').length >= 2;
}

function submitName() {
  const name = normalizeName(guestName.value);
  const nameParts = name.split(' ');

  if (name.length < 3 || nameParts.length < 2) {
    nameError.value = 'Escribe tu nombre y apellido para continuar.';
    companionError.value = '';
    return;
  }

  const companions = companionNames.value
    .slice(0, additionalGuestCount.value)
    .map(normalizeName);

  if (companions.some((companion) => !isFullName(companion))) {
    companionError.value = 'Escribe el nombre y apellido de cada acompañante.';
    return;
  }

  nameError.value = '';
  companionError.value = '';
  submittedName.value = name;
  submittedCompanions.value = companions;

  const query = {
    nombre: name,
    acompanantes: String(additionalGuestCount.value),
  };

  companions.forEach((companion, index) => {
    query[`acompanante${index + 1}`] = companion;
  });

  router.replace({ path: '/asistencia', query });
  nextTick(() => invitationCard.value?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
}

function editName() {
  submittedName.value = '';
  submittedCompanions.value = [];
  nameError.value = '';
  companionError.value = '';
  router.replace('/asistencia');
}

async function getInvitationCanvas() {
  if (!invitationCard.value) return null;

  await document.fonts?.ready;
  const { default: html2canvas } = await import('html2canvas');
  const card = invitationCard.value;
  const exportHost = document.createElement('div');
  const exportCard = card.cloneNode(true);

  exportHost.className = 'invitation-export-host';
  exportCard.classList.add('preview-invitation--export');
  exportHost.appendChild(exportCard);
  document.body.appendChild(exportHost);

  const images = [...exportCard.querySelectorAll('img')];

  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve();

      return new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    }),
  );

  await document.fonts?.ready;

  try {
    return await html2canvas(exportCard, {
      backgroundColor: '#f3efe7',
      height: 760,
      logging: false,
      scale: exportCanvasScale,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      width: 430,
    });
  } finally {
    exportHost.remove();
  }
}

async function exportAsImage() {
  isExporting.value = true;

  try {
    const canvas = await getInvitationCanvas();
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `invitacion-renee-gabriel-${normalizeName(submittedName.value).toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } finally {
    isExporting.value = false;
  }
}

async function exportAsPdf() {
  isExporting.value = true;

  try {
    const canvas = await getInvitationCanvas();
    if (!canvas) return;

    const { jsPDF } = await import('jspdf');
    const imageData = canvas.toDataURL('image/png');
    const cssPixelToMm = 25.4 / 96;
    const pdfWidth = (canvas.width / exportCanvasScale) * cssPixelToMm;
    const pdfHeight = (canvas.height / exportCanvasScale) * cssPixelToMm;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, pageHeight);
    pdf.save(`invitacion-renee-gabriel-${normalizeName(submittedName.value).toLowerCase().replace(/\s+/g, '-')}.pdf`);
  } finally {
    isExporting.value = false;
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
            ¿Cómo debemos recibirte?
          </h2>
          <p class="mt-5 max-w-md text-[#6f5b50]">
            Escriba su nombre completo y si tiene el de sus acompañantes
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
            <p v-if="nameError" id="name-error" class="mt-[9px] text-[13px] text-[#a85845]" role="alert">
              {{ nameError }}
            </p>

            <fieldset class="mt-9 border-0 p-0">
              <legend class="block font-sans text-[10px] font-bold tracking-[.18em] text-[#512301] uppercase">¿Deseas agregar acompañantes?</legend>
              <div class="mt-3.5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Cantidad de acompañantes">
                <label
                  v-for="option in [0, 1, 2]"
                  :key="option"
                  class="relative flex min-h-[88px] cursor-pointer flex-col items-center justify-center border border-folio-line bg-[rgba(247,244,238,0.5)] text-[#7c7469] transition-[border-color,background,color] duration-[180ms] hover:border-folio-gold hover:bg-[#ebe7df] hover:text-[#512301] focus-within:outline focus-within:outline-2 focus-within:outline-[rgba(173,147,99,0.5)] focus-within:outline-offset-2"
                  :class="{ 'border-folio-gold bg-[#ebe7df] text-[#512301]': additionalGuestCount === option }"
                >
                  <input
                    v-model.number="additionalGuestCount"
                    type="radio"
                    name="acompanantes"
                    :value="option"
                    class="absolute h-px w-px opacity-0"
                    @change="companionError = ''"
                  />
                  <span class="font-serif text-[31px] leading-[.8]">{{ option }}</span>
                  <span class="mt-2.5 font-sans text-[9px] font-bold tracking-[.1em] uppercase">
                    {{ option === 0 ? 'Solo yo' : option === 1 ? '1 persona' : '2 personas' }}
                  </span>
                </label>
              </div>
            </fieldset>

            <div v-if="additionalGuestCount" class="mt-[22px] grid gap-[17px]">
              <div v-for="index in additionalGuestCount" :key="index">
                <label class="block font-sans text-[10px] font-bold tracking-[.18em] text-[#512301] uppercase" :for="`companion-${index}`">
                  Acompañante {{ index }}
                </label>
                <input
                  :id="`companion-${index}`"
                  v-model="companionNames[index - 1]"
                  class="mt-[5px] w-full border-0 border-b border-[#bdb4a5] bg-transparent px-0 pb-3.5 pt-3 font-serif text-[23px] text-[#512301] outline-none transition-colors duration-[180ms] placeholder:text-[#a69d90] focus:border-folio-gold aria-[invalid=true]:border-[#a85845] max-[520px]:text-2xl"
                  type="text"
                  :name="`acompanante-${index}`"
                  autocomplete="name"
                  maxlength="80"
                  :placeholder="`Nombre completo del acompañante ${index}`"
                  :aria-invalid="Boolean(companionError)"
                  @input="companionError = ''"
                />
              </div>
            </div>

            <p v-if="companionError" class="mt-[9px] text-[13px] text-[#a85845]" role="alert">
              {{ companionError }}
            </p>

            <button class="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-sm border border-[#512301] bg-[#512301] px-[25px] py-3.5 font-sans text-[10px] font-bold tracking-[.2em] text-[#fbfaf6] uppercase transition-[background,box-shadow,transform] duration-[180ms] hover:-translate-y-0.5 hover:bg-[#6d3914] hover:shadow-[0_14px_28px_-20px_rgba(81,35,1,0.7)] sm:w-auto" type="submit">
              Generar mi invitación
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






          <div v-if="submittedName" class="mt-8 grid min-h-[540px] place-items-center bg-[linear-gradient(rgba(173,147,99,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(173,147,99,0.08)_1px,transparent_1px),#ece8df] bg-[length:28px_28px] p-[clamp(18px,4vw,42px)] max-[520px]:min-h-[420px]">
            <article
              ref="invitationCard"
              class="preview-invitation"
              :data-guest-count="invitationNames.length"
              :data-guest-density="invitationNameDensity"
            >
              <div class="preview-invitation__envelope" aria-hidden="true"></div>
              <div class="preview-invitation__paper">
                <div class="preview-invitation__masthead">
                  <span>Renée &amp; Gabriel</span>
                  <span>21 · 11 · 2026</span>
                </div>

                <div class="preview-invitation__intro">
                  <img
                    class="preview-invitation__monogram"
                    :src="assetPath('/images/monograma.png')"
                    alt="Monograma de Renée y Gabriel"
                  />
                  <p class="preview-invitation__overline">Siempre tuyo, siempre mío,<br />siempre nuestro.</p>
                  <p class="preview-invitation__blessing">Con la bendición de Dios<br />y nuestros padres</p>
                </div>

                <div class="preview-invitation__parents">
                  <div>
                    <span>Padres de Renée</span>
                    <p>Francisca Imelda Urías Alcalá</p>
                    <p>Martín Ricardo Millanes Gaxiola</p>
                  </div>
                  <div>
                    <span>Padres de Gabriel</span>
                    <p>María Medina Laborín</p>
                    <p>Carlos Coronado Medina</p>
                  </div>
                </div>

                <div class="preview-invitation__couple">
                  <p>Tenemos el honor de invitarte a celebrar</p>
                  <h3>Renée <i>&amp;</i> Gabriel</h3>
                </div>

                <div class="preview-invitation__guest">
                  <span>Esta invitación es para</span>
                  <div>
                    <p v-for="(name, index) in invitationNames" :key="`${name}-${index}`">
                      {{ name }}
                    </p>
                  </div>
                </div>

                <div class="preview-invitation__date">
                  <span>Sábado 21 de noviembre de 2026</span>
                  <i aria-hidden="true"></i>
                  <span>Hermosillo, Sonora</span>
                </div>

                <div class="preview-invitation__events">
                  <div>
                    <span>Ceremonia religiosa</span>
                    <strong>4:00 PM</strong>
                    <small>Iglesia Nuestro Señor de Jesús</small>
                  </div>
                  <div>
                    <span>Recepción</span>
                    <strong>7:45 PM</strong>
                    <small>Villa Toscana</small>
                  </div>
                </div>

                <div class="preview-invitation__sponsors">
                  <span>Padrinos de nuestra celebración</span>
                  <div>
                    <p v-for="sponsor in invitationSponsors" :key="sponsor.label">
                      <strong>{{ sponsor.names }}</strong>
                      <small>Padrinos de {{ sponsor.label }}</small>
                    </p>
                  </div>
                </div>

                <div class="preview-invitation__details">
                  <span>Detalles</span>
                  <div class="preview-invitation__details-grid">
                    <div>
                      <span>Código de vestimenta</span>
                      <strong>Elegancia rigurosa</strong>
                    </div>
                    <div>
                      <span>Colores a evitar</span>
                      <div class="preview-invitation__avoid-colors" aria-label="Beige, blanco, crema y rojo">
                        <i v-for="color in invitationAvoidColors" :key="color.name" :style="{ backgroundColor: color.value }" :title="color.name"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="preview-invitation__footer">
                  <span>Respetuosamente no niños</span>
                  <span>Renée &amp; Gabriel · 21.11.2026</span>
                </div>
              </div>
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
              <p class="mt-1 text-xs text-[#6f5b50]">Elige el formato que prefieras.</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button class="inline-flex min-h-[38px] items-center gap-1.5 rounded-sm border border-[#bdb4a5] bg-transparent px-3 py-[9px] font-sans text-[9px] font-extrabold tracking-[.12em] text-[#512301] uppercase transition-colors duration-[180ms] hover:border-folio-gold hover:bg-[#ebe7df] disabled:cursor-wait disabled:opacity-55 [&_.material-symbols-outlined]:text-[17px]" type="button" :disabled="isExporting" @click="exportAsImage">
                <span class="material-symbols-outlined text-[17px]" aria-hidden="true">image</span>
                PNG
              </button>
              <button class="inline-flex min-h-[38px] items-center gap-1.5 rounded-sm border border-[#bdb4a5] bg-transparent px-3 py-[9px] font-sans text-[9px] font-extrabold tracking-[.12em] text-[#512301] uppercase transition-colors duration-[180ms] hover:border-folio-gold hover:bg-[#ebe7df] disabled:cursor-wait disabled:opacity-55 [&_.material-symbols-outlined]:text-[17px]" type="button" :disabled="isExporting" @click="exportAsPdf">
                <span class="material-symbols-outlined text-[17px]" aria-hidden="true">picture_as_pdf</span>
                PDF
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
