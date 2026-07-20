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
  const exportHost = document.createElement('div');
  const exportCard = invitationCard.value.cloneNode(true);

  exportCard.classList.add('export-capture');
  exportHost.className = 'invitation-export-host';
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
      backgroundColor: '#f7f4ee',
      height: exportCard.offsetHeight,
      logging: false,
      scale: exportCanvasScale,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      width: exportCard.offsetWidth,
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
  <div class="attendance-page min-h-screen pb-16">
    <header class="site-header fixed left-0 top-0 z-50 w-full">
      <div class="header-shell page-shell">
        <NuxtLink to="/" class="brand-link" aria-label="Volver al inicio">
          <span class="header-mark" aria-hidden="true">
            <img class="brand-logo" :src="assetPath('/images/monograma.png')" alt="" />
          </span>
          <span class="brand-title">Renée &amp; Gabriel</span>
        </NuxtLink>

        <NuxtLink to="/#asistencia" class="attendance-back-link">
          <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          Volver
        </NuxtLink>
      </div>
    </header>

    <main class="page-shell attendance-main pt-32 md:pt-40">
      <div class="attendance-intro mx-auto max-w-3xl text-center">
        <span class="kicker">INVITACION</span>
        <h1 class="mt-5 font-serif text-[48px] leading-[.9] text-primary md:text-[76px]">
          Confirma tu asistencia
        </h1>
      </div>

      <div class="attendance-layout mx-auto mt-12 max-w-[1240px]">
        <section class="attendance-form-panel">
          <span class="attendance-step">01 <span>de 01</span></span>
          <h2 class="mt-8 font-serif text-4xl leading-none text-primary md:text-5xl">
            ¿Cómo debemos recibirte?
          </h2>
          <p class="mt-5 max-w-md text-muted">
            Escriba su nombre completo y si tiene el de sus acompañantes
          </p>

          <form class="mt-10" @submit.prevent="submitName">
            <label class="attendance-label" for="guest-name">Nombre completo</label>
            <input
              id="guest-name"
              v-model="guestName"
              class="attendance-input"
              type="text"
              name="nombre"
              autocomplete="name"
              maxlength="80"
              placeholder="Ej. María Fernanda López"
              :aria-invalid="Boolean(nameError)"
              :aria-describedby="nameError ? 'name-error' : undefined"
              @input="nameError = ''"
            />
            <p v-if="nameError" id="name-error" class="attendance-error" role="alert">
              {{ nameError }}
            </p>

            <fieldset class="mt-9 border-0 p-0">
              <legend class="attendance-label">¿Deseas agregar acompañantes?</legend>
              <div class="companion-options" role="radiogroup" aria-label="Cantidad de acompañantes">
                <label
                  v-for="option in [0, 1, 2]"
                  :key="option"
                  class="companion-option"
                  :class="{ 'is-selected': additionalGuestCount === option }"
                >
                  <input
                    v-model.number="additionalGuestCount"
                    type="radio"
                    name="acompanantes"
                    :value="option"
                    @change="companionError = ''"
                  />
                  <span class="companion-number">{{ option }}</span>
                  <span class="companion-caption">
                    {{ option === 0 ? 'Solo yo' : option === 1 ? '1 persona' : '2 personas' }}
                  </span>
                </label>
              </div>
            </fieldset>

            <div v-if="additionalGuestCount" class="companion-fields">
              <div v-for="index in additionalGuestCount" :key="index">
                <label class="attendance-label" :for="`companion-${index}`">
                  Acompañante {{ index }}
                </label>
                <input
                  :id="`companion-${index}`"
                  v-model="companionNames[index - 1]"
                  class="attendance-input companion-input"
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

            <p v-if="companionError" class="attendance-error" role="alert">
              {{ companionError }}
            </p>

            <button class="action-button action-button-primary mt-7 w-full sm:w-auto" type="submit">
              Generar mi invitación
              <span class="material-symbols-outlined ml-2 text-[18px]" aria-hidden="true">arrow_forward</span>
            </button>
          </form>
        </section>

        <section class="attendance-preview-panel" aria-labelledby="preview-title">
          <div class="flex items-center justify-between gap-4">
            <div>
              <span class="kicker">02 · Vista previa</span>
              <h2 id="preview-title" class="mt-3 font-serif text-3xl text-primary md:text-4xl">
                Tu invitación
              </h2>
            </div>
            <span v-if="submittedName" class="preview-ready">
              {{ invitationNames.length }} {{ invitationNames.length === 1 ? 'persona' : 'personas' }}
            </span>
          </div>






          <div v-if="submittedName" class="preview-stage mt-8">
            <article
              ref="invitationCard"
              class="personal-invitation"
              :data-guest-count="invitationNames.length"
            >
              <div class="invitation-frame">
                <div class="invitation-topline">
                  <span>Renée y Gabriel
                  </span>
                  <span>21 · 11 · 2026</span>
                </div>

                <div class="invitation-center">
                  <img
                    class="invitation-logo"
                    :src="assetPath('/images/monograma.png')"
                    alt="Monograma de Renée y Gabriel"
                  />
                  <p class="invitation-kicker">Con mucha alegría</p>
                  <p class="invitation-copy">Te invitamos a celebrar el comienzo de nuestra historia</p>
                  <h3 class="invitation-couple">Renée <i>&amp;</i><br />Gabriel</h3>
                  <div class="invitation-rule" aria-hidden="true"></div>
                  <p class="invitation-guest-label">Esta invitación es para</p>
                  <div class="invitation-guests">
                    <p v-for="(name, index) in invitationNames" :key="`${name}-${index}`" class="invitation-guest">
                      {{ name }}
                    </p>
                  </div>
                </div>

                <div class="invitation-details">
                  <div>
                    <span>Fecha</span>
                    <strong>Sábado 21 de noviembre<br />de 2026</strong>
                  </div>
                  <div>
                    <span>Lugar</span>
                    <strong>Villa Toscana<br />Hermosillo, Sonora</strong>
                  </div>
                </div>
                <p class="invitation-footer">Ceremonia religiosa · 4:00 PM</p>
              </div>
            </article>
          </div>








          <div v-else class="preview-empty mt-8">
            <div class="preview-empty-mark" aria-hidden="true">
              <span class="material-symbols-outlined">favorite</span>
            </div>
            <p class="kicker">Aún no hay nombre</p>
            <p class="mt-3 max-w-xs text-center text-sm text-muted">
              Completa el formulario para ver aparecer tu invitación personal.
            </p>
          </div>

          <div v-if="submittedName" class="preview-actions mt-7">
            <div>
              <p class="text-sm font-semibold text-primary">Descarga tu invitación</p>
              <p class="mt-1 text-xs text-muted">Elige el formato que prefieras.</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button class="export-button" type="button" :disabled="isExporting" @click="exportAsImage">
                <span class="material-symbols-outlined" aria-hidden="true">image</span>
                PNG
              </button>
              <button class="export-button" type="button" :disabled="isExporting" @click="exportAsPdf">
                <span class="material-symbols-outlined" aria-hidden="true">picture_as_pdf</span>
                PDF
              </button>
              <button class="export-button export-button-quiet" type="button" @click="editName">
                <span class="material-symbols-outlined" aria-hidden="true">edit</span>
                Editar
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
