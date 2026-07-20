<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const baseURL = useRuntimeConfig().app.baseURL;

function assetPath(path) {
  const basePath = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

  return `${basePath}${path}`;
}

const slides = [
  { src: assetPath('/images/slide-1.webp'), alt: 'Foto de Renée y Gabriel 1' },
  { src: assetPath('/images/slide-2.webp'), alt: 'Foto de Renée y Gabriel 2' },
  {
    src: assetPath('/images/slide-3.webp'),
    alt: 'Foto de Renée y Gabriel 3',
    mobile: true,
  },
  {
    src: assetPath('/images/slide-4.webp'),
    alt: 'Foto de Renée y Gabriel 4',
    mobile: true,
  },
  {
    src: assetPath('/images/slide-5.webp'),
    alt: 'Foto de Renée y Gabriel 5',
    mobile: true,
  },
  { src: assetPath('/images/slide-6.webp'), alt: 'Foto de Renée y Gabriel 6' },
  { src: assetPath('/images/slide-7.webp'), alt: 'Foto de Renée y Gabriel 7' },
  {
    src: assetPath('/images/slide-8.webp'),
    alt: 'Foto de Renée y Gabriel 8',
    mobile: true,
  },
  {
    src: assetPath('/images/slide-9.webp'),
    alt: 'Foto de Renée y Gabriel 9',
    mobile: true,
  },
];

const schedule = [
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

const parents = [
  {
    label: 'Papás de Renée',
    names: ['Francisca Imelda Urías Alcalá', 'Martín Ricardo Millanes Gaxiola'],
  },
  {
    label: 'Papás de Gabriel',
    names: ['María Medina Laborín', 'Carlos Coronado Medina'],
  },
];

const sponsors = [
  { label: 'Velación', names: 'Sandra y Raúl Ambriz', detail: 'Padrinos de velación.', icon: 'favorite' },
  { label: 'Lazo', names: 'Carlos Coronado y Carolina Henry', detail: 'Padrinos de lazo.', icon: 'all_inclusive' },
  { label: 'Anillos', names: 'Marisol Urías y Héctor Díaz', detail: 'Padrinos de anillos.', icon: 'join' },
  { label: 'Arras', names: 'Fernando Coronado y Leslie Ibarra', detail: 'Padrinos de arras.', icon: 'groups' },
];

const avoidColors = [
  { name: 'Beige', value: '#f1dfc7' },
  { name: 'Blanco', value: '#ffffff' },
  { name: 'Crema', value: '#fff1d6' },
  { name: 'Rojo', value: '#c5161d' },
];

const isMobile = ref(false);
const currentSlide = ref(0);
const visibleSlides = computed(() =>
  isMobile.value ? slides.filter((slide) => slide.mobile) : slides,
);
let carouselTimer;
let mobileQuery;

function updateMobileState(event) {
  isMobile.value = event.matches;
}

function goToSlide(index) {
  currentSlide.value =
    (index + visibleSlides.value.length) % visibleSlides.value.length;
}

function nextSlide() {
  goToSlide(currentSlide.value + 1);
}

function prevSlide() {
  goToSlide(currentSlide.value - 1);
}

function restartTimer() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(nextSlide, 5000);
}

function scrollToSection(selector) {
  const target = document.querySelector(selector);

  if (!target) return;

  window.scrollTo({
    top: target.offsetTop - 92,
    behavior: 'smooth',
  });
}

watch(isMobile, () => {
  currentSlide.value = 0;
  restartTimer();
});

onMounted(() => {
  mobileQuery = window.matchMedia('(max-width: 900px)');
  isMobile.value = mobileQuery.matches;
  mobileQuery.addEventListener('change', updateMobileState);
  restartTimer();

  if (window.location.hash) {
    nextTick(() => scrollToSection(window.location.hash));
  }
});

onBeforeUnmount(() => {
  clearInterval(carouselTimer);
  mobileQuery?.removeEventListener('change', updateMobileState);
});
</script>

<template>
  <div
    class="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_10%,rgba(206,190,157,0.16),transparent_29rem),radial-gradient(circle_at_90%_55%,rgba(190,176,149,0.12),transparent_32rem),linear-gradient(180deg,#f7f4ee_0%,#efebe3_58%,#e6e1d7_100%)] text-[#512301]"
  >
    <header
      class="fixed left-0 top-0 z-50 w-full border-b border-[rgba(181,171,155,0.55)] bg-[rgba(247,244,238,0.9)] shadow-[0_12px_32px_-30px_rgba(39,35,30,0.55)] backdrop-blur-[18px]"
    >
      <div
        class="mx-auto grid h-[82px] w-[calc(100%-48px)] max-w-[1560px] grid-cols-[minmax(230px,1fr)_auto_minmax(230px,1fr)] items-center gap-6 max-[900px]:flex max-[900px]:h-[70px] max-[900px]:w-[calc(100%-32px)] max-[900px]:justify-between max-[600px]:h-[66px] max-[600px]:w-[calc(100%-24px)] max-[600px]:gap-2.5"
      >
        <a
          href="#inicio"
          class="inline-flex min-w-[230px] items-center justify-self-start gap-3.5 text-[#512301] max-[600px]:min-w-0 max-[600px]:gap-2"
          aria-label="Inicio"
          @click.prevent="scrollToSection('#inicio')"
        >
          <span
            class="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full border border-[rgba(168,142,95,0.65)] bg-folio-paper max-[600px]:h-[38px] max-[600px]:w-[38px]"
            aria-hidden="true"
          >
            <img
              class="h-[36px] w-[36px] object-contain max-[600px]:h-[30px] max-[600px]:w-[30px]"
              :src="assetPath('/images/monograma.png')"
              alt=""
            />
          </span>
          <span class="min-w-0">
            <strong
              class="block overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[31px] font-medium leading-[.9] tracking-[-.035em] max-[1100px]:text-[27px] max-[600px]:text-[21px]"
              >Renée <i class="text-[.72em] font-normal">&amp;</i> Gabriel</strong
            >
          </span>
        </a>

        <nav
          class="flex items-center justify-center gap-[clamp(16px,2vw,34px)] max-[900px]:hidden"
          aria-label="Navegación de la invitación"
        >
          <a
            class="relative py-8 pb-[29px] font-serif text-[19px] font-medium leading-none tracking-normal text-[#512301] transition-colors duration-[180ms] after:absolute after:inset-x-0 after:bottom-[22px] after:h-px after:origin-center after:scale-x-0 after:bg-folio-gold after:content-[''] after:transition-transform after:duration-[180ms] hover:text-folio-gold hover:after:scale-x-100"
            href="#inicio"
            @click.prevent="scrollToSection('#inicio')"
            >Inicio</a
          >
          <a
            class="relative py-8 pb-[29px] font-serif text-[19px] font-medium leading-none tracking-normal text-[#512301] transition-colors duration-[180ms] after:absolute after:inset-x-0 after:bottom-[22px] after:h-px after:origin-center after:scale-x-0 after:bg-folio-gold after:content-[''] after:transition-transform after:duration-[180ms] hover:text-folio-gold hover:after:scale-x-100"
            href="#asistencia"
            @click.prevent="scrollToSection('#asistencia')"
            >Asistencia</a
          >
          <a
            class="relative py-8 pb-[29px] font-serif text-[19px] font-medium leading-none tracking-normal text-[#512301] transition-colors duration-[180ms] after:absolute after:inset-x-0 after:bottom-[22px] after:h-px after:origin-center after:scale-x-0 after:bg-folio-gold after:content-[''] after:transition-transform after:duration-[180ms] hover:text-folio-gold hover:after:scale-x-100"
            href="#familia"
            @click.prevent="scrollToSection('#familia')"
            >Familia</a
          >
          <a
            class="relative py-8 pb-[29px] font-serif text-[19px] font-medium leading-none tracking-normal text-[#512301] transition-colors duration-[180ms] after:absolute after:inset-x-0 after:bottom-[22px] after:h-px after:origin-center after:scale-x-0 after:bg-folio-gold after:content-[''] after:transition-transform after:duration-[180ms] hover:text-folio-gold hover:after:scale-x-100"
            href="#padrinos"
            @click.prevent="scrollToSection('#padrinos')"
            >Padrinos</a
          >
          <a
            class="relative py-8 pb-[29px] font-serif text-[19px] font-medium leading-none tracking-normal text-[#512301] transition-colors duration-[180ms] after:absolute after:inset-x-0 after:bottom-[22px] after:h-px after:origin-center after:scale-x-0 after:bg-folio-gold after:content-[''] after:transition-transform after:duration-[180ms] hover:text-folio-gold hover:after:scale-x-100"
            href="#musica"
            @click.prevent="scrollToSection('#musica')"
            >Nuestra canción</a
          >
          <a
            class="relative py-8 pb-[29px] font-serif text-[19px] font-medium leading-none tracking-normal text-[#512301] transition-colors duration-[180ms] after:absolute after:inset-x-0 after:bottom-[22px] after:h-px after:origin-center after:scale-x-0 after:bg-folio-gold after:content-[''] after:transition-transform after:duration-[180ms] hover:text-folio-gold hover:after:scale-x-100"
            href="#info"
            @click.prevent="scrollToSection('#info')"
            >Detalles</a
          >
        </nav>
        
      </div>
    </header>

    <main class="pb-20 pt-[82px] max-[900px]:pt-[70px]">
      <section
        id="inicio"
        class="mx-auto grid min-h-[calc(100svh-82px)] w-[calc(100%-48px)] max-w-[1560px] grid-cols-[minmax(0,1fr)_minmax(280px,320px)] items-center gap-[clamp(16px,1.6vw,24px)] pb-[74px] pt-[42px] max-[1100px]:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] max-[900px]:block max-[900px]:min-h-0 max-[900px]:w-[calc(100%-32px)] max-[900px]:pb-0 max-[900px]:pt-[52px] max-[600px]:w-[calc(100%-24px)] max-[600px]:pt-10"
      >
        <div class="hidden" aria-hidden="true"></div>

        <div
          class="relative grid h-[760px] place-items-center max-[1100px]:h-[700px] max-[900px]:h-[750px] max-[600px]:h-[675px]"
        >
          <div
            class="absolute inset-0 overflow-hidden border border-[rgba(174,165,151,0.7)] bg-[#d9d4ca] shadow-[0_28px_70px_-48px_rgba(39,35,30,0.6)] before:absolute before:inset-[15px] before:z-[4] before:border before:border-[rgba(251,250,246,0.55)] before:content-[''] before:pointer-events-none max-[900px]:top-0 max-[600px]:before:inset-[9px]"
            aria-label="Galería de Renée y Gabriel"
          >
            <div
              v-for="(slide, index) in visibleSlides"
              :key="slide.src"
              class="absolute inset-0 opacity-0 transition-opacity duration-[900ms]"
              :class="{ 'opacity-100': currentSlide === index }"
            >
              <img
                class="h-full w-full scale-[1.02] object-cover grayscale-[.18] sepia-[.12] contrast-[.93] transition-transform duration-[7000ms]"
                :src="slide.src"
                :alt="slide.alt"
                :loading="isMobile || index === 0 ? 'eager' : 'lazy'"
                decoding="async"
                :class="{ 'scale-[1.06]': currentSlide === index }"
              />
            </div>
            <div
              class="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(39,35,30,0.42),rgba(39,35,30,0.08)_48%,rgba(39,35,30,0.26))]"
              aria-hidden="true"
            ></div>
            <div
              class="absolute bottom-[27px] right-[29px] z-[6] flex items-center gap-[13px] font-sans text-[8px] font-bold tracking-[.14em] text-folio-paper uppercase max-[600px]:bottom-[17px] max-[600px]:right-[18px]"
            >
              <button
                class="grid h-[31px] w-[31px] text-white place-items-center rounded-full border border-white text-inherit transition-colors duration-[180ms] hover:bg-black"
                type="button"
                aria-label="Imagen anterior"
                @click="prevSlide(); restartTimer()"
              >
                <span class="material-symbols-outlined text-[15px]">west</span>
              </button>


              <span  class="text-white text-sm">{{ String(currentSlide + 1).padStart(2, '0') }} / {{ String(visibleSlides.length).padStart(2, '0') }}</span>
              <button
                class=" text-white grid h-[31px] w-[31px] place-items-center rounded-full border border-white text-inherit transition-colors duration-[180ms] hover:bg-black"
                type="button"
                aria-label="Imagen siguiente"
                @click="nextSlide(); restartTimer()"
              >
                <span class="material-symbols-outlined text-[15px]">east</span>
              </button>
            </div>
          </div>
        </div>

        <aside
          class="flex h-[760px] flex-col items-center justify-start border border-[rgba(174,165,151,0.7)] bg-[rgba(251,250,246,0.78)] px-8 pb-[48px] pt-[4px] text-center shadow-[0_28px_70px_-56px_rgba(39,35,30,0.5)] max-[1100px]:h-[700px] max-[1100px]:pt-[34px] max-[900px]:h-auto max-[900px]:py-[42px] max-[600px]:px-6 max-[600px]:py-[34px]"
          aria-label="Resumen de la invitación"
        >
          <img
            class=""
            :src="assetPath('/images/monograma.png')"
            alt="Monograma de Renée y Gabriel"
          />
          <div
            class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-[18px] font-sans text-[8px] font-bold tracking-[.22em] text-folio-overline uppercase max-[600px]:gap-3"
          >
            <span class="h-px bg-folio-line"></span>
            <strong class="text-sm">21 de noviembre 2026</strong>
            <span class="h-px bg-folio-line"></span>
          </div>
          <h1
            class="my-6 mb-[31px] font-serif text-[clamp(48px,4.6vw,72px)] font-medium leading-[.78] tracking-[-.06em] text-folio-brown max-[600px]:my-[19px] max-[600px]:mb-6 max-[600px]:text-[clamp(46px,15vw,62px)]"
          >
            Renée <i class="text-[.66em] font-normal">&amp;</i><br />Gabriel
          </h1>
          <div
            class="grid w-full grid-cols-2 gap-[18px] border-t border-folio-line pt-5 max-[600px]:gap-3 max-[600px]:pt-4"
          >
            <div class="text-left">
              <span class="block font-sans text-[8px] font-bold tracking-[.2em] text-folio-overline uppercase">Ceremonia</span>
              <strong class="mt-3 block font-serif text-3xl font-medium leading-none text-folio-brown">4:00 PM</strong>
            </div>
            <div class="border-l border-folio-line pl-[18px] text-left max-[600px]:pl-3">
              <span class="block font-sans text-[8px] font-bold tracking-[.2em] text-folio-overline uppercase">Lugar</span>
              <strong class="mt-3 block font-serif text-3xl font-medium leading-none text-folio-brown">Villa Toscana</strong>
            </div>
          </div>
          <NuxtLink
            to="/asistencia"
            class="bg-[#512301]  text-white text-sm mt-[37px] inline-flex min-h-[55px] w-[min(100%,212px)] items-center justify-center bg-folio-brown font-sans text-[9px] font-bold tracking-[.2em] text-folio-paper uppercase transition-[background,transform] duration-[180ms] hover:-translate-y-0.5 hover:bg-folio-ink max-[600px]:mt-7"
          >
            Confirmar asistencia
          </NuxtLink>
        </aside>
      </section>

      <section
        id="evento"
        class="mx-auto mt-[clamp(90px,12vw,170px)] w-[calc(100%-48px)] max-w-[1560px] scroll-mt-[102px] max-[900px]:w-[calc(100%-32px)] max-[600px]:w-[calc(100%-24px)]"
      >
        <div
          class="mb-11 grid grid-cols-[minmax(0,1fr)_minmax(250px,0.5fr)] items-end gap-10 max-[900px]:grid-cols-1 max-[900px]:items-start max-[900px]:gap-5"
        >
          <div>
            <span class="font-sans text-[9px] font-bold tracking-[.2em] text-folio-overline uppercase">01 / Detalles</span>
            <h2 class="mt-[13px] max-w-[700px] font-serif text-[clamp(43px,5vw,75px)] font-medium leading-[.85] tracking-[-.055em]">Cronograma y Ubicacion</h2>
          </div>
        </div>

        <div class="grid grid-cols-[.9fr_1.1fr] gap-3.5 max-[900px]:grid-cols-1">
          <article
            class="min-h-[470px] border border-folio-line bg-folio-paper p-[clamp(27px,4vw,52px)] shadow-[0_24px_60px_-56px_rgba(39,35,30,0.7)] max-[600px]:min-h-0 max-[600px]:px-5 max-[600px]:py-[27px]"
          >
            <div class="flex items-center justify-between gap-3.5 border-b border-folio-line pb-4">
              <span class="font-sans text-[9px] font-bold tracking-[.2em] text-folio-overline uppercase">Ceremonia &amp; recepción</span>
              <span class="font-sans text-[8px] tracking-[.12em] text-folio-muted">21—11—26</span>
            </div>
            <div class="grid grid-cols-[72px_minmax(0,1fr)] gap-[22px] pt-[37px] max-[600px]:grid-cols-[59px_minmax(0,1fr)] max-[600px]:gap-[13px] max-[600px]:pt-[29px]">
              <span class="pt-[5px] font-sans text-[10px] font-bold tracking-[.08em] text-folio-gold uppercase">04:00 PM</span>
              <div>
                <p class="mb-[7px] font-sans text-[9px] tracking-[.14em] text-folio-overline uppercase">Ceremonia religiosa</p>
                <h3 class="m-0 font-serif text-[clamp(29px,3vw,42px)] font-medium leading-[.88] tracking-[-.035em] text-[#512301] max-[600px]:text-[32px]">Iglesia de Nuestro<br />Señor Jesús</h3>
                <a
                  class="mt-3.5 inline-flex items-center gap-[5px] text-[11px] text-folio-overline underline decoration-1 underline-offset-4 transition-colors hover:text-[#512301] [&_.material-symbols-outlined]:text-sm"
                  href="https://www.google.com/maps/search/?api=1&query=Iglesia%20Nuestro%20Se%C3%B1or%20de%20Jes%C3%BAs%20Hermosillo%20Sonora"
                  target="_blank"
                  rel="noreferrer"
                >Ver ubicación <span class="material-symbols-outlined">north_east</span></a>
              </div>
            </div>
            <div class="ml-[94px] mt-[31px] h-px w-[calc(100%-94px)] bg-folio-line max-[600px]:ml-[72px] max-[600px]:w-[calc(100%-72px)]" aria-hidden="true"></div>
            <div class="grid grid-cols-[72px_minmax(0,1fr)] gap-[22px] pt-[37px] max-[600px]:grid-cols-[59px_minmax(0,1fr)] max-[600px]:gap-[13px] max-[600px]:pt-[29px]">
              <span class="pt-[5px] font-sans text-[10px] font-bold tracking-[.08em] text-folio-gold uppercase">07:00 PM</span>
              <div>
                <p class="mb-[7px] font-sans text-[9px] tracking-[.14em] text-folio-overline uppercase">Recepción</p>
                <h3 class="m-0 font-serif text-[clamp(29px,3vw,42px)] font-medium leading-[.88] tracking-[-.035em] text-[#512301] max-[600px]:text-[32px]">Villa Toscana</h3>
                <p class="mt-[13px] font-serif text-lg leading-[1.05] text-folio-muted max-[600px]:text-base">C. Quintero Arce 280, Puerta Grande,<br />83246 Hermosillo, Son.</p>
                <a
                  class="mt-3.5 inline-flex items-center gap-[5px] text-[11px] text-folio-overline underline decoration-1 underline-offset-4 transition-colors hover:text-[#512301] [&_.material-symbols-outlined]:text-sm"
                  href="https://www.google.com/maps/search/?api=1&query=Eventos%20Villa%20Toscana%20Hermosillo"
                  target="_blank"
                  rel="noreferrer"
                >Ver ubicación <span class="material-symbols-outlined">north_east</span></a>
              </div>
            </div>
          </article>

          <article
            class="flex min-h-[470px] flex-col border border-folio-line bg-[#e8e4da] p-[clamp(27px,4vw,52px)] shadow-[0_24px_60px_-56px_rgba(39,35,30,0.7)] max-[600px]:min-h-0 max-[600px]:px-5 max-[600px]:py-[27px]"
          >
            <div class="relative min-h-[320px] flex-1 overflow-hidden border border-[rgba(170,160,145,0.65)] bg-[#d8d2c5] max-[600px]:min-h-[270px]">
              <iframe
                class="h-full min-h-[320px] w-full border-0 grayscale-[.8] sepia-[.15] contrast-[.9] max-[600px]:min-h-[270px]"
                title="Mapa de Eventos Villa Toscana"
                loading="lazy"
                allowfullscreen
                referrerpolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3486.9636703074916!2d-111.009019!3d29.077218499999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86ce83f2b6598fd7%3A0x3193509b3b6d3a7d!2sEventos%20Villa%20Toscana!5e0!3m2!1ses-419!2smx!4v1781115194446!5m2!1ses-419!2smx"
              ></iframe>
              <span class="absolute bottom-3.5 right-3.5 bg-[rgba(251,250,246,0.88)] px-2.5 py-2 font-sans text-[9px] tracking-[.1em] text-[#512301] uppercase">Villa Toscana · Hermosillo</span>
            </div>
            <div class="flex items-center gap-[11px] pt-5">
              <span class="material-symbols-outlined text-folio-gold" aria-hidden="true">location_on</span>
              <p class="m-0 font-serif text-lg leading-none text-folio-muted">C. Quintero Arce 280, Puerta Grande,
                83246 Hermosillo, Son.</p>
            </div>
          </article>

          <article
            class="col-span-full grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(300px,390px)] gap-3.5 max-[900px]:col-auto max-[900px]:grid-cols-1"
          >
            <div class="border border-folio-line bg-[rgba(247,245,239,0.85)] p-[clamp(27px,4vw,52px)] shadow-[0_24px_60px_-56px_rgba(39,35,30,0.7)] max-[600px]:px-5 max-[600px]:py-[27px]">
              <div class="flex items-center justify-between gap-3.5 border-b border-folio-line pb-4">
                <span class="font-sans text-[9px] font-bold tracking-[.2em] text-folio-overline uppercase">Cronograma</span>
                <span class="material-symbols-outlined text-[22px] text-folio-gold" aria-hidden="true">schedule</span>
              </div>
              <div class="mt-[35px] grid gap-0 max-[600px]:mt-7">
                <div
                  v-for="(item, index) in schedule"
                  :key="item.time"
                  class="relative grid grid-cols-[76px_18px_minmax(0,1fr)] gap-4 pb-[30px] last:pb-0 max-[600px]:grid-cols-[61px_16px_minmax(0,1fr)] max-[600px]:gap-3 max-[600px]:pb-[24px]"
                >
                  <span class="pt-0.5 font-sans text-[9px] font-bold tracking-[.07em] text-folio-gold uppercase">{{ item.time }}</span>
                  <span
                    class="relative mt-0.5 block h-[10px] w-[10px] rounded-full border-2 border-folio-paper bg-folio-gold shadow-[0_0_0_1px_#a88e5f] after:absolute after:left-[3px] after:top-[10px] after:w-px after:bg-folio-line after:content-['']"
                    :class="index < schedule.length - 1 ? 'after:h-[calc(100%+20px)]' : 'after:h-0'"
                    aria-hidden="true"
                  ></span>
                  <div
                    class="pb-[24px] max-[600px]:pb-[20px]"
                    :class="index < schedule.length - 1 ? 'border-b border-folio-line' : ''"
                  >
                    <h3 class="m-0 font-serif text-[clamp(28px,2.7vw,39px)] font-medium leading-[.88] tracking-[-.035em] text-[#512301]">{{ item.title }}</h3>
                    <p class="mt-2 font-serif text-[18px] leading-none text-folio-muted max-[600px]:text-[17px]">{{ item.detail }}</p>
                    <a v-if="item.link" class="mt-3 inline-flex items-center gap-[5px] text-[9px] text-folio-overline underline underline-offset-4 transition-colors hover:text-[#512301]" :href="item.link" target="_blank" rel="noreferrer">Ver ubicación</a>
                  </div>
                </div>
              </div>
            </div>
            <div
              id="asistencia"
              class="relative flex min-h-[520px] scroll-mt-[102px] flex-col items-center justify-center border border-folio-line bg-[linear-gradient(135deg,transparent_19px,rgba(168,142,95,0.16)_20px,transparent_21px)] bg-[length:42px_42px] bg-folio-paper px-8 py-12 text-center shadow-[0_25px_65px_-52px_rgba(39,35,30,0.7)] before:absolute before:left-5 before:top-5 before:h-[96px] before:w-[96px] before:rounded-full before:border before:border-[rgba(168,142,95,0.55)] before:content-[''] after:absolute after:bottom-5 after:right-5 after:h-[96px] after:w-[96px] after:rounded-full after:border after:border-[rgba(168,142,95,0.55)] after:content-[''] max-[900px]:min-h-[420px] max-[600px]:min-h-[390px] max-[600px]:px-5 max-[600px]:py-[42px] max-[600px]:before:left-[13px] max-[600px]:before:top-[13px] max-[600px]:before:h-[70px] max-[600px]:before:w-[70px] max-[600px]:after:bottom-[13px] max-[600px]:after:right-[13px] max-[600px]:after:h-[70px] max-[600px]:after:w-[70px]"
            >
              <div
                class="absolute -top-[31px] grid h-16 w-16 rotate-[5deg] place-items-center rounded-full border border-[rgba(130,111,79,0.8)] bg-[#b7aa93] font-serif text-[15px] text-[#675a49]"
                aria-hidden="true"
              >
                R&amp;G
              </div>
              <span class="font-sans text-[9px] font-bold tracking-[.2em] text-folio-overline uppercase">ASISTENCIA</span>
              <h2 class="mx-[18px] mt-3.5 max-w-[330px] font-serif text-[clamp(39px,4vw,55px)] font-medium leading-[.85] tracking-[-.055em] text-[#512301] max-[600px]:text-[47px]">Agradecemos la confirmación de tu asistencia</h2>
              <NuxtLink
                to="/asistencia"
                class="bg-[#512301]  text-white text-sm mt-[26px] inline-flex items-center justify-center gap-2.5 border border-folio-ink px-[18px] py-[13px] font-sans text-[9px] font-bold tracking-[.16em] text-[#512301] uppercase transition-[background,color,transform] duration-[180ms] hover:-translate-y-0.5 hover:bg-folio-ink hover:text-folio-paper"
              >
                Confirmar asistencia
                <span class="material-symbols-outlined text-base" aria-hidden="true">north_east</span>
              </NuxtLink>
              <span class="absolute bottom-[25px] font-sans text-[8px] font-bold tracking-[.2em] text-folio-muted uppercase max-[600px]:bottom-[19px] max-[600px]:text-[7px]">Renée &amp; Gabriel · 21.11.2026</span>
            </div>
          </article>
        </div>
      </section>

      <section
        id="familia"
        class="mx-auto mt-[clamp(90px,12vw,170px)] w-[calc(100%-48px)] max-w-[1560px] scroll-mt-[102px] max-[900px]:w-[calc(100%-32px)] max-[600px]:w-[calc(100%-24px)]"
      >
        <div class="mx-auto mb-11 block max-w-[700px] text-center">
          <div>
            <span class="font-sans text-[9px] font-bold tracking-[.2em] text-folio-overline uppercase">02 / Familia</span>
            <h2 class="mt-[13px] max-w-[700px] font-serif text-[clamp(43px,5vw,75px)] font-medium leading-[.85] tracking-[-.055em] max-[600px]:text-[clamp(42px,13vw,62px)]">Nuestros padres</h2>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3.5 max-[600px]:grid-cols-1">
          <article
            v-for="(parent, index) in parents"
            :key="parent.label"
            class="min-h-[300px] border border-folio-line bg-[rgba(251,250,246,0.68)] p-[43px_clamp(27px,5vw,75px)] text-center shadow-[0_24px_60px_-56px_rgba(39,35,30,0.7)] max-[600px]:min-h-[245px] max-[600px]:px-5 max-[600px]:py-[35px]"
            :class="{ 'bg-folio-paper': index === 0 }"
          >
            <span class="mb-[21px] block text-lg text-folio-gold" aria-hidden="true">✦</span>
            <span class="font-sans text-[9px] font-bold tracking-[.2em] text-folio-overline uppercase">{{ parent.label }}</span>
            <div class="mt-[22px]">
              <p v-for="name in parent.names" :key="name" class="my-2 font-serif text-[clamp(24px,3vw,35px)] leading-[.95] text-[#512301] max-[600px]:text-[28px]">{{ name }}</p>
            </div>
          </article>
        </div>
      </section>

      <section
        id="padrinos"
        class="mx-auto mt-[clamp(90px,12vw,170px)] w-[calc(100%-48px)] max-w-[1560px] scroll-mt-[102px] max-[900px]:w-[calc(100%-32px)] max-[600px]:w-[calc(100%-24px)]"
      >
        <div class="mb-11 grid grid-cols-[minmax(0,1fr)_minmax(250px,0.5fr)] items-end gap-10 max-[900px]:grid-cols-1 max-[900px]:items-start max-[900px]:gap-5">
          <div>
            <span class="font-sans text-[9px] font-bold tracking-[.2em] text-folio-overline uppercase">03 / Padrinos</span>
            <h2 class="mt-[13px] max-w-[700px] font-serif text-[clamp(43px,5vw,75px)] font-medium leading-[.85] tracking-[-.055em] max-[600px]:text-[clamp(42px,13vw,62px)]">Personas que nos acompañan</h2>
          </div>
          <p class="max-w-[410px] font-serif text-[21px] leading-[1.08] text-folio-muted max-[600px]:text-[19px]">Con cariño compartimos los nombres de quienes estarán cerca de nosotros en este día.</p>
        </div>

        <div class="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2 max-[600px]:grid-cols-1">
          <article
            v-for="(sponsor, index) in sponsors"
            :key="sponsor.label"
            class="min-h-[245px] border border-folio-line bg-[rgba(251,250,246,0.68)] p-[28px_24px] shadow-[0_24px_60px_-56px_rgba(39,35,30,0.7)] max-[600px]:min-h-[205px]"
            :class="{ 'bg-[rgba(239,235,226,0.78)]': index % 2 === 1 }"
          >
            <span class="material-symbols-outlined mb-7 block text-2xl text-folio-gold" aria-hidden="true">{{ sponsor.icon }}</span>
            <span class="font-sans text-[9px] font-bold tracking-[.2em] text-folio-overline uppercase">{{ sponsor.label }}</span>
            <h3 class="mt-3.5 font-serif text-[29px] font-medium leading-[.88] tracking-[-.035em] text-[#512301]">{{ sponsor.names }}</h3>
            <p class="mt-3 font-serif text-[17px] text-folio-muted">{{ sponsor.detail }}</p>
          </article>
        </div>
      </section>

      <section
        id="musica"
        class="mx-auto mt-[clamp(100px,14vw,190px)] grid w-[calc(100%-48px)] max-w-[1560px] grid-cols-[.7fr_1.3fr] gap-3.5 scroll-mt-[102px] max-[900px]:grid-cols-1 max-[900px]:w-[calc(100%-32px)] max-[600px]:w-[calc(100%-24px)]"
      >
        <div class="flex min-h-[460px] flex-col justify-center border border-folio-line bg-folio-paper p-[clamp(28px,5vw,62px)] max-[900px]:min-h-[390px] max-[600px]:min-h-[360px]">

          <h2 class="mt-[13px] max-w-[700px] font-serif text-[clamp(43px,4vw,63px)] font-medium leading-[.85] tracking-[-.055em] text-[#512301] max-[600px]:text-[clamp(42px,13vw,62px)]">Escucha nuestra cancion</h2>
        </div>
        <div class="relative min-h-[460px] overflow-hidden border border-[rgba(39,35,30,0.5)] bg-white max-[900px]:min-h-[390px] max-[600px]:min-h-[360px] after:absolute after:inset-[17px] after:border after:border-[rgba(251,250,246,0.45)] after:content-[''] after:pointer-events-none">
          <img class="h-full w-full object-cover sepia-[.3] saturate-[.7] brightness-[.74]" :src="assetPath('/images/slide-7.webp')" alt="Renée y Gabriel" loading="lazy" />
          <div class="absolute inset-0 z-[2] flex flex-col justify-end bg-[linear-gradient(0deg,rgba(28,21,15,0.74),transparent_68%)] p-[clamp(30px,5vw,68px)] text-folio-paper">
            <span class="text-white font-sans text-[9px] font-bold tracking-[.2em] uppercase">Renée &amp; Gabriel</span>
            <a
              class="material-symbols-outlined relative z-[3] mt-7 grid h-[49px] w-[49px] place-items-center rounded-full border border-[rgba(251,250,246,0.72)] bg-white text-[22px] text-[#512301] transition-transform duration-[180ms] hover:scale-105"
              href="https://open.spotify.com/intl-es/track/3zl7j5ua8mF4JDYuxrfo01"
              target="_blank"
              rel="noreferrer"
              aria-label="Reproducir canción"
            >play_arrow</a>
          </div>
        </div>
      </section>

      <section
        id="regalos"
        class="mx-auto mt-[clamp(90px,12vw,170px)] w-[calc(100%-48px)] max-w-[1560px] scroll-mt-[102px] max-[900px]:w-[calc(100%-32px)] max-[600px]:w-[calc(100%-24px)]"
      >
        <div class="grid min-h-[300px] grid-cols-[.5fr_1.5fr] items-center gap-10 border border-folio-line bg-[rgba(251,250,246,0.8)] p-[clamp(30px,6vw,76px)] shadow-[0_24px_60px_-56px_rgba(39,35,30,0.7)] max-[900px]:grid-cols-[150px_minmax(0,1fr)] max-[600px]:block max-[600px]:px-[23px] max-[600px]:pb-[38px] max-[600px]:pt-8">
          <div class="grid h-[90px] w-[120px] place-items-center border border-[rgba(168,142,95,0.7)] text-folio-gold max-[900px]:mx-auto max-[600px]:mb-7 max-[600px]:ml-0 max-[600px]:h-[70px] max-[600px]:w-[95px]" aria-hidden="true">
            <span class="material-symbols-outlined text-[34px]">redeem</span>
          </div>
          <div>
            <span class="font-sans text-[9px] font-bold tracking-[.2em] text-folio-overline uppercase">Con cariño</span>
            <h2 class="mt-[13px] max-w-[700px] font-serif text-[clamp(43px,5vw,70px)] font-medium leading-[.85] tracking-[-.055em] max-[600px]:text-[clamp(42px,13vw,62px)]">Mesa de regalos</h2>
            <p class="mt-[19px] max-w-[410px] font-serif text-xl leading-[1.08] text-folio-muted max-[600px]:text-[19px]">Si deseas hacernos un regalo, puedes encontrar nuestra mesa de regalos aquí.</p>
            <a class="mt-[22px] inline-flex items-center justify-center gap-2.5 border border-folio-ink px-[18px] py-[13px] font-sans text-[9px] font-bold tracking-[.16em] text-[#512301] uppercase transition-[background,color,transform] duration-[180ms] hover:-translate-y-0.5 hover:bg-folio-ink hover:text-folio-paper" href="https://mesaderegalos.liverpool.com.mx/milistaderegalos/51972633" target="_blank" rel="noreferrer">
              Ver mesa <span class="material-symbols-outlined text-base">north_east</span>
            </a>
          </div>
        </div>
      </section>

      <section
        id="info"
        class="mx-auto mt-[clamp(90px,12vw,170px)] w-[calc(100%-48px)] max-w-[1560px] scroll-mt-[102px] max-[900px]:w-[calc(100%-32px)] max-[600px]:w-[calc(100%-24px)]"
      >
        <div class="mx-auto mb-11 block max-w-[700px] text-center">
          <div>
            <span class="font-sans text-[9px] font-bold tracking-[.2em] text-folio-overline uppercase">04 / Detalles</span>
            <h2 class="mt-[13px] max-w-[700px] font-serif text-[clamp(43px,5vw,75px)] font-medium leading-[.85] tracking-[-.055em] max-[600px]:text-[clamp(42px,13vw,62px)]">Para celebrar en armonía</h2>
          </div>
          <p class="mx-auto mt-5 max-w-[410px] font-serif text-[21px] leading-[1.08] text-folio-muted max-[600px]:text-[19px]">Te compartimos algunos detalles importantes para disfrutar la noche con nosotros.</p>
        </div>

        <div class="grid grid-cols-[1.15fr_.85fr] gap-3.5 max-[900px]:grid-cols-1">
          <article class="relative min-h-[430px] border border-folio-line bg-folio-paper p-[clamp(28px,5vw,58px)] shadow-[0_24px_60px_-56px_rgba(39,35,30,0.7)] max-[600px]:min-h-[390px] max-[600px]:px-[22px] max-[600px]:py-7">
            <div class="mb-[29px] grid h-[47px] w-[47px] place-items-center border border-folio-gold text-folio-gold" aria-hidden="true"><span class="material-symbols-outlined">styler</span></div>
            <span class="font-sans text-[9px] font-bold tracking-[.2em] text-folio-overline uppercase">Código de vestimenta</span>
            <h3 class="mt-3.5 font-serif text-[clamp(36px,4vw,54px)] font-medium leading-[.88] tracking-[-.035em] text-[#512301]">Elegancia rigurosa</h3>
            <div class="my-7 h-px w-[45px] bg-folio-gold" aria-hidden="true"></div>
            <p class="m-0 font-sans text-[9px] tracking-[.16em] text-folio-overline uppercase">Evitar colores</p>
            <div class="mt-3.5 flex gap-3" aria-label="Colores a evitar">
              <span v-for="color in avoidColors" :key="color.name" class="inline-block h-8 w-8 rounded-full border-2 border-folio-paper shadow-[0_0_0_1px_rgba(39,35,30,0.35)]" :style="{ backgroundColor: color.value }" :title="color.name"></span>
            </div>
            <p class="mt-3 font-serif text-lg text-folio-muted">Beige, blanco, crema, tonos similares y rojo.</p>
            <div class="mt-[25px] flex items-center gap-3.5 border-t border-folio-line pt-[19px]">
              <span class="inline-block h-8 w-8 rounded-full border-2 border-folio-paper bg-[#d4af37] shadow-[0_0_0_1px_rgba(39,35,30,0.35)]" title="Dorado"></span>
              <div><p class="m-0 font-sans text-[9px] tracking-[.16em] text-folio-overline uppercase">Color mamá de la novia</p><strong class="mt-1 block font-serif text-2xl font-medium text-[#512301]">Dorado</strong></div>
            </div>
          </article>

          <article class="relative flex min-h-[430px] flex-col justify-center border border-folio-line bg-[#e8e3d9] p-[clamp(28px,5vw,58px)] shadow-[0_24px_60px_-56px_rgba(39,35,30,0.7)] after:absolute after:bottom-7 after:right-7 after:h-[115px] after:w-[115px] after:rounded-full after:border after:border-[rgba(168,142,95,0.55)] after:content-[''] max-[600px]:min-h-[390px] max-[600px]:px-[22px] max-[600px]:py-7 max-[600px]:after:bottom-7 max-[600px]:after:right-7">
            <span class="absolute right-8 top-[29px] font-serif text-2xl text-folio-gold">02</span>
            <span class="font-sans text-[9px] font-bold tracking-[.2em] text-folio-overline uppercase">Invitación</span>
            <h3 class="mt-3.5 font-serif text-[clamp(42px,4.5vw,66px)] font-medium leading-[.88] tracking-[-.035em] text-[#512301] max-[600px]:text-[53px]">Respetuosamente<br />no niños</h3>
            <span class="my-[22px] mt-8 block h-px w-[45px] bg-folio-gold" aria-hidden="true"></span>
            <p class="max-w-[330px] font-serif text-[19px] leading-[1.05] text-folio-muted">Agradecemos mucho tu comprensión para compartir esta celebración únicamente con adultos.</p>
            <div class="mt-7 flex items-start gap-[13px] border-t border-folio-line pt-[18px]">
              <span class="material-symbols-outlined text-[22px] text-folio-gold" aria-hidden="true">hotel</span>
              <div><span class="font-sans text-[9px] tracking-[.16em] text-folio-overline uppercase">Hospedaje</span><strong class="mt-1 block font-serif text-[22px] font-medium text-[#512301]">Opciones para invitados</strong><p class="mt-[3px] font-sans text-[10px] tracking-[.11em] text-folio-muted">LISTA DE OPCIONES</p></div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <nav
      class="fixed bottom-[max(9px,env(safe-area-inset-bottom))] left-[10px] right-[10px] z-50 hidden justify-around border border-[rgba(173,147,99,0.42)] bg-[rgba(251,250,246,0.94)] shadow-[0_18px_42px_-24px_rgba(81,35,1,0.45)] backdrop-blur-[14px] max-[900px]:flex max-[600px]:bottom-[max(8px,env(safe-area-inset-bottom))]"
      aria-label="Navegación rápida"
    >
      <a class="flex min-w-[68px] flex-1 flex-col items-center gap-[3px] px-1 pb-[7px] pt-2 text-[#512301] transition-colors duration-[180ms] hover:bg-[#512301] hover:text-[#fbfaf6] max-[600px]:px-1 max-[600px]:py-[7px]" href="#inicio" @click.prevent="scrollToSection('#inicio')"><span class="material-symbols-outlined text-[19px]">home</span><small class="font-sans text-[8px] font-bold tracking-[.08em] uppercase">Inicio</small></a>
      <a class="flex min-w-[68px] flex-1 flex-col items-center gap-[3px] px-1 pb-[7px] pt-2 text-[#512301] transition-colors duration-[180ms] hover:bg-[#512301] hover:text-[#fbfaf6] max-[600px]:px-1 max-[600px]:py-[7px]" href="#evento" @click.prevent="scrollToSection('#evento')"><span class="material-symbols-outlined text-[19px]">event</span><small class="font-sans text-[8px] font-bold tracking-[.08em] uppercase">Cronograma</small></a>
      <a class="flex min-w-[68px] flex-1 flex-col items-center gap-[3px] px-1 pb-[7px] pt-2 text-[#512301] transition-colors duration-[180ms] hover:bg-[#512301] hover:text-[#fbfaf6] max-[600px]:px-1 max-[600px]:py-[7px]" href="#familia" @click.prevent="scrollToSection('#familia')"><span class="material-symbols-outlined text-[19px]">family_group</span><small class="font-sans text-[8px] font-bold tracking-[.08em] uppercase">Familia</small></a>
      <a class="flex min-w-[68px] flex-1 flex-col items-center gap-[3px] px-1 pb-[7px] pt-2 text-[#512301] transition-colors duration-[180ms] hover:bg-[#512301] hover:text-[#fbfaf6] max-[600px]:px-1 max-[600px]:py-[7px]" href="#info" @click.prevent="scrollToSection('#info')"><span class="material-symbols-outlined text-[19px]">info</span><small class="font-sans text-[8px] font-bold tracking-[.08em] uppercase">Detalles</small></a>
      <NuxtLink class="flex min-w-[68px] flex-1 flex-col items-center gap-[3px] px-1 pb-[7px] pt-2 text-[#512301] transition-colors duration-[180ms] hover:bg-[#512301] hover:text-[#fbfaf6] max-[600px]:px-1 max-[600px]:py-[7px]" to="/asistencia"><span class="material-symbols-outlined text-[19px]">open_in_new</span><small class="font-sans text-[8px] font-bold tracking-[.08em] uppercase">Asistencia</small></NuxtLink>
    </nav>
  </div>
</template>
