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
    top: target.offsetTop - 84,
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
  <div class="font-sans text-[16px] leading-6">
    <header class="site-header fixed left-0 top-0 z-50 w-full">
      <div class="header-shell page-shell">
        <a
          href="#"
          class="brand-link"
          aria-label="Inicio"
          @click.prevent="scrollToSection('#inicio')"
        >
          <span class="header-mark" aria-hidden="true">
            <img
              class="brand-logo"
              :src="assetPath('/images/monograma.png')"
              alt=""
            />
          </span>
          <span class="min-w-0">
            <span class="brand-title">Renée &amp; Gabriel</span>
          </span>
        </a>

        <nav class="header-nav" aria-label="Navegación superior">
          <a href="#evento" @click.prevent="scrollToSection('#evento')"
            >Evento</a
          >
          <a href="#asistencia" @click.prevent="scrollToSection('#asistencia')"
            >asistencia</a
          >
          <a href="#familia" @click.prevent="scrollToSection('#familia')"
            >Familia</a
          >
          <a href="#padrinos" @click.prevent="scrollToSection('#padrinos')"
            >Padrinos</a
          >
          <a href="#regalos" @click.prevent="scrollToSection('#regalos')"
            >Regalos</a
          >
        </nav>

        <p class="header-date">
          <span>21</span>
          <span>Nov</span>
          <span>2026</span>
        </p>
      </div>
    </header>

    <main class="pb-32 pt-24">
      <section id="inicio" class="hero page-shell">
        <div class="hero-media soft-shadow">
          <div class="absolute inset-0">
            <div
              v-for="(slide, index) in visibleSlides"
              :key="slide.src"
              class="hero-slide"
              :class="{ 'is-active': currentSlide === index }"
            >
              <img
                :src="slide.src"
                :alt="slide.alt"
                :loading="isMobile || index === 0 ? 'eager' : 'lazy'"
                decoding="async"
              />
              <div class="hero-overlay"></div>
            </div>
          </div>

          <button
            aria-label="Imagen anterior"
            type="button"
            class="carousel-control absolute left-5 top-1/2 z-20 -translate-y-1/2"
            @click="
              prevSlide();
              restartTimer();
            "
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>

          <button
            aria-label="Imagen siguiente"
            type="button"
            class="carousel-control absolute right-5 top-1/2 z-20 -translate-y-1/2"
            @click="
              nextSlide();
              restartTimer();
            "
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>

          <div
            class="carousel-dots absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2.5"
            aria-label="Seleccionar imagen"
          >
            <button
              v-for="(slide, index) in visibleSlides"
              :key="`${slide.src}-dot`"
              :aria-label="`Imagen ${index + 1}`"
              :aria-pressed="currentSlide === index"
              type="button"
              class="carousel-dot"
              :class="{ 'is-active': currentSlide === index }"
              @click="
                goToSlide(index);
                restartTimer();
              "
            ></button>
          </div>
        </div>

        <aside class="hero-card soft-shadow">
          <img
            class="hero-logo mb-6"
            :src="assetPath('/images/monograma.png')"
            alt="Logo R y G"
          />
          <span class="kicker">21 de noviembre 2026</span>

          <h1
            class="mt-4 font-serif text-[52px] leading-[56px] italic text-primary md:text-[76px] md:leading-[78px]"
          >
            Renée <span class="not-italic">&amp;</span><br />
            Gabriel
          </h1>

          <div class="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="info-chip text-left">
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary"
              >
                Ceremonia
              </p>
              <p class="mt-1 font-serif text-xl text-primary">4:00 PM</p>
            </div>
            <div class="info-chip text-left">
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary"
              >
                Lugar
              </p>
              <p class="mt-1 font-serif text-xl text-primary">Villa Toscana</p>
            </div>
          </div>

          <NuxtLink to="/asistencia" class="action-button action-button-primary mt-8">
            Confirmar asistencia
          </NuxtLink>
        </aside>
      </section>

      <section id="evento" class="page-shell mt-16 md:mt-20">
        <div class="mx-auto max-w-3xl text-center">
          <span class="kicker">Evento</span>
          <h2
            class="mt-4 font-serif text-[34px] leading-tight text-primary md:text-[48px]"
          >
            Detalles del día
          </h2>
          <p class="mt-4 text-muted">
            Primero nos acompañas en la ceremonia religiosa y después
            continuamos la celebración en Villa Toscana.
          </p>
        </div>

        <div class="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.08fr_.92fr]">
          <div
            class="rounded-[24px] border border-outline/50 bg-surface/80 p-3 soft-shadow"
          >
            <iframe
              title="Mapa de Eventos Villa Toscana"
              class="aspect-[4/3] w-full rounded-[18px]"
              loading="lazy"
              allowfullscreen
              referrerpolicy="no-referrer-when-downgrade"
              style="border: 0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3486.9636703074916!2d-111.009019!3d29.077218499999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86ce83f2b6598fd7%3A0x3193509b3b6d3a7d!2sEventos%20Villa%20Toscana!5e0!3m2!1ses-419!2smx!4v1781115194446!5m2!1ses-419!2smx"
            ></iframe>

            <div class="grid gap-5 p-5 md:grid-cols-2">
              <div>
                <p
                  class="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary"
                >
                  Recepción
                </p>
                <h3 class="mt-2 font-serif text-2xl text-primary">
                  Villa Toscana
                </h3>
                <p class="mt-2 text-muted">
                  C. Quintero Arce 280, Puerta Grande, 83246 Hermosillo, Son.
                </p>
              </div>
              <div>
                <p
                  class="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary"
                >
                  Ceremonia religiosa
                </p>
                <h3 class="mt-2 font-serif text-2xl text-primary">
                  Iglesia de Nuestro Señor Jesús
                </h3>
                <p class="mt-2 text-muted">
                  Nos vemos primero en misa y después seguimos con la
                  celebración.
                </p>
              </div>
            </div>
          </div>

          <div
            class="rounded-[24px] border border-outline/50 bg-surface/80 px-6 py-8 soft-shadow"
          >
            <div class="text-center lg:text-left">
              <span class="kicker">Cronograma</span>
              <h3
                class="mt-4 font-serif text-[32px] leading-tight text-primary"
              >
                Programa
              </h3>
            </div>

            <div class="mt-8 space-y-0">
              <div class="grid grid-cols-[74px_28px_minmax(0,1fr)] gap-4">
                <span
                  class="pt-1 text-[13px] font-semibold uppercase tracking-[.08em] text-primary"
                  >4:00 PM</span
                >
                <div class="relative flex justify-center">
                  <div class="timeline-line absolute bottom-0 top-2"></div>
                  <span class="timeline-dot relative mt-1"></span>
                </div>
                <div class="border-b border-outline/40 pb-6">
                  <h4 class="font-serif text-2xl text-primary">
                    Ceremonia religiosa
                  </h4>
                  <p class="mt-1 text-muted">Iglesia Nuestro Señor de Jesús.</p>
                  <a
                    class="mt-2 inline-flex text-sm font-semibold text-secondary underline decoration-secondary/30 underline-offset-4"
                    href="https://www.google.com/maps/search/?api=1&query=Iglesia%20Nuestro%20Se%C3%B1or%20de%20Jes%C3%BAs%20Hermosillo%20Sonora"
                    target="_blank"
                    rel="noreferrer"
                    >Ver ubicación</a
                  >
                </div>
              </div>

              <div class="grid grid-cols-[74px_28px_minmax(0,1fr)] gap-4">
                <span
                  class="pt-6 text-[13px] font-semibold uppercase tracking-[.08em] text-primary"
                  >7:00 PM</span
                >
                <div class="relative flex justify-center">
                  <div class="timeline-line absolute bottom-0 top-0"></div>
                  <span class="timeline-dot relative mt-6"></span>
                </div>
                <div class="border-b border-outline/40 py-6">
                  <h4 class="font-serif text-2xl text-primary">
                    Cóctel de bienvenida
                  </h4>
                  <p class="mt-1 text-muted">Kiosko Villa Toscana.</p>
                  <a
                    class="mt-2 inline-flex text-sm font-semibold text-secondary underline decoration-secondary/30 underline-offset-4"
                    href="https://www.google.com/maps/search/?api=1&query=Eventos%20Villa%20Toscana%20Hermosillo"
                    target="_blank"
                    rel="noreferrer"
                    >Ver ubicación</a
                  >
                </div>
              </div>

              <div class="grid grid-cols-[74px_28px_minmax(0,1fr)] gap-4">
                <span
                  class="pt-6 text-[13px] font-semibold uppercase tracking-[.08em] text-primary"
                  >7:45 PM</span
                >
                <div class="relative flex justify-center">
                  <div class="timeline-line absolute bottom-0 top-0"></div>
                  <span class="timeline-dot relative mt-6"></span>
                </div>
                <div class="border-b border-outline/40 py-6">
                  <h4 class="font-serif text-2xl text-primary">Recepción</h4>
                </div>
              </div>

              <div class="grid grid-cols-[74px_28px_minmax(0,1fr)] gap-4">
                <span
                  class="pt-6 text-[13px] font-semibold uppercase tracking-[.08em] text-primary"
                  >8:00 PM</span
                >
                <div class="relative flex justify-center">
                  <div class="timeline-line absolute bottom-0 top-0"></div>
                  <span class="timeline-dot relative mt-6"></span>
                </div>
                <div class="border-b border-outline/40 py-6">
                  <h4 class="font-serif text-2xl text-primary">Cena</h4>
                </div>
              </div>

              <div class="grid grid-cols-[74px_28px_minmax(0,1fr)] gap-4">
                <span
                  class="pt-6 text-[13px] font-semibold uppercase tracking-[.08em] text-primary"
                  >9:30 PM</span
                >
                <div class="relative flex justify-center">
                  <div class="timeline-line absolute bottom-0 top-0"></div>
                  <span class="timeline-dot relative mt-6"></span>
                </div>
                <div class="border-b border-outline/40 py-6">
                  <h4 class="font-serif text-2xl text-primary">Vals</h4>
                </div>
              </div>

              <div class="grid grid-cols-[74px_28px_minmax(0,1fr)] gap-4">
                <span
                  class="pt-6 text-[13px] font-semibold uppercase tracking-[.08em] text-primary"
                  >1:00 AM</span
                >
                <div class="relative flex justify-center">
                  <div class="timeline-line absolute bottom-8 top-0"></div>
                  <span class="timeline-dot relative mt-6"></span>
                </div>
                <div class="pt-6">
                  <h4 class="font-serif text-2xl text-primary">Final</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="asistencia" class="page-shell mt-16 md:mt-20">
        <div
          class="rounded-[28px] border border-outline/50 bg-surface/80 px-6 py-14 text-center soft-shadow md:px-10"
        >
          <h2
            class="mt-3 font-serif text-[34px] leading-tight text-primary md:text-[48px]"
          >
            Confirma tu asistencia
          </h2>
          <p class="mx-auto mt-4 max-w-xl text-muted">
            Ayúdanos confirmando tu asistencia
          </p>

          <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <NuxtLink to="/asistencia" class="action-button action-button-primary">
              Confirmar asistencia
            </NuxtLink>
            <a
              class="action-button action-button-secondary"
              href="#evento"
              @click.prevent="scrollToSection('#evento')"
              >Ver cronograma</a
            >
          </div>
        </div>
      </section>

      <section id="familia" class="page-shell mt-16 md:mt-20">
        <div
          class="rounded-[28px] border border-outline/50 bg-surface/80 px-6 py-14 soft-shadow md:px-10"
        >
          <div class="mx-auto max-w-3xl text-center">
            <h2
              class="mt-4 font-serif text-[34px] leading-tight text-primary md:text-[48px]"
            >
              Ceremonia religiosa
            </h2>
          </div>

          <div class="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            <article
              class="rounded-[24px] border border-outline/50 bg-cream/70 p-8 text-center"
            >
              <span
                class="material-symbols-outlined text-[34px] text-primary"
                aria-hidden="true"
                >family_restroom</span
              >
              <p
                class="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary"
              >
                Papás de Renée
              </p>
              <div class="mt-4 space-y-2">
                <p class="font-serif text-2xl leading-tight text-primary">
                  Francisca Imelda Urías Alcalá
                </p>
                <p class="font-serif text-2xl leading-tight text-primary">
                  Martín Ricardo Millanes Gaxiola
                </p>
              </div>
            </article>

            <article
              class="rounded-[24px] border border-outline/50 bg-cream/70 p-8 text-center"
            >
              <span
                class="material-symbols-outlined text-[34px] text-primary"
                aria-hidden="true"
                >family_restroom</span
              >
              <p
                class="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary"
              >
                Papás de Gabriel
              </p>
              <div class="mt-4 space-y-2">
                <p class="font-serif text-2xl leading-tight text-primary">
                  María Medina Laborín
                </p>
                <p class="font-serif text-2xl leading-tight text-primary">
                  Carlos Coronado Medina
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="padrinos" class="page-shell mt-16 md:mt-20">
        <div
          class="floral-panel rounded-[28px] border border-outline/50 px-6 py-14 soft-shadow md:px-10"
        >
          <div class="relative mx-auto max-w-3xl text-center">
            <h2
              class="mt-4 font-serif text-[34px] leading-tight text-primary md:text-[48px]"
            >
              Padrinos
            </h2>
          </div>

          <div
            class="relative mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <article class="sponsor-card">
              <svg
                class="h-7 w-7 text-primary"
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path
                  d="M16 5.5c-5 3.1-8.2 8.7-8.2 15.1v5.2h16.4v-5.2C24.2 14.2 21 8.6 16 5.5Z"
                />
                <path d="M11.5 18.8c1.1-1.5 2.6-2.3 4.5-2.3s3.4.8 4.5 2.3" />
                <path
                  d="M12.3 25.8V21c0-2.1 1.7-3.7 3.7-3.7s3.7 1.6 3.7 3.7v4.8"
                />
                <path d="M13.7 7.4 16 3.7l2.3 3.7" />
                <path d="M10 25.8c.9-4.8 3-8.4 6-10.7 3 2.3 5.1 5.9 6 10.7" />
              </svg>
              <p
                class="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary"
              >
                Velación
              </p>
              <h3 class="mt-2 font-serif text-2xl text-primary">
                Sandra y Raúl Ambriz
              </h3>
              <p class="mt-2 text-muted">Padrinos de velación.</p>
            </article>
            <article class="sponsor-card">
              <svg
                class="h-7 w-7 text-primary"
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M6.7 20.5c3.4-4.7 6.7-7 9.8-7 3.2 0 6 2.5 8.8 7" />
                <path
                  d="M6.7 20.5c2.6 4 5.7 5.7 9.3 5.2 3.8-.6 6.8-2.3 9.3-5.2"
                />
                <path
                  d="M13 14.2c-2.1-3.7-4-5.3-5.6-4.7-1.3.5-1.2 2.1.1 3.4 1.4 1.5 3.2 1.9 5.5 1.3Z"
                />
                <path
                  d="M19 14.2c2.1-3.7 4-5.3 5.6-4.7 1.3.5 1.2 2.1-.1 3.4-1.4 1.5-3.2 1.9-5.5 1.3Z"
                />
                <path d="M16 13.5v12.3" />
              </svg>
              <p
                class="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary"
              >
                Lazo
              </p>
              <h3 class="mt-2 font-serif text-2xl text-primary">
                Carlos Coronado y Carolina Henry
              </h3>
              <p class="mt-2 text-muted">Padrinos de lazo.</p>
            </article>
            <article class="sponsor-card">
              <svg
                class="h-7 w-7 text-primary"
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="14" cy="18.5" r="6.5" />
                <circle cx="20" cy="18.5" r="6.5" />
                <path d="M10.8 12.9 14 7.1l3.2 5.8" />
                <path d="M16.8 12.9 20 7.1l3.2 5.8" />
                <path d="M12.2 7.1h3.6" />
                <path d="M18.2 7.1h3.6" />
              </svg>
              <p
                class="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary"
              >
                Anillos
              </p>
              <h3 class="mt-2 font-serif text-2xl text-primary">
                Marisol Urías y Héctor Díaz
              </h3>
              <p class="mt-2 text-muted">Padrinos de anillos.</p>
            </article>
            <article class="sponsor-card">
              <svg
                class="h-7 w-7 text-primary"
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path
                  d="M8.2 18.5c0-3.2 2.6-5.8 5.8-5.8h4c3.2 0 5.8 2.6 5.8 5.8v5.2H8.2v-5.2Z"
                />
                <path d="M10.5 16.5c1.5 1.2 3.3 1.8 5.5 1.8s4-.6 5.5-1.8" />
                <circle cx="12.1" cy="11.2" r="2.2" />
                <circle cx="16" cy="9.2" r="2.2" />
                <circle cx="19.9" cy="11.2" r="2.2" />
                <path d="M9.4 23.7c1.7 1.5 3.9 2.3 6.6 2.3s4.9-.8 6.6-2.3" />
              </svg>
              <p
                class="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary"
              >
                Arras
              </p>
              <h3 class="mt-2 font-serif text-2xl text-primary">
                Fernando Coronado y Leslie Ibarra
              </h3>
              <p class="mt-2 text-muted">Padrinos de arras.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="musica" class="page-shell mt-16 md:mt-20">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <div
            class="rounded-[28px] border border-outline/50 bg-surface/80 p-8 soft-shadow md:p-10"
          >
            <span class="kicker">Nuestra canción</span>
            <h2
              class="mt-4 font-serif text-[34px] leading-tight text-primary md:text-[48px]"
            >
              Escucha la canción de la boda
            </h2>
            <p class="mt-4 text-muted">
              La invitación también tendrá un momento especial para escuchar
              nuestra canción y acompañar la experiencia.
            </p>
            <a
              class="action-button action-button-primary mt-8"
              href="https://vt.tiktok.com/ZSX64fHqU/"
              target="_blank"
              rel="noreferrer"
              >Ver referencia</a
            >
          </div>

          <div
            class="music-shell rounded-[28px] border border-outline/50 bg-[#26170e] p-4 soft-shadow"
          >
            <div
              class="music-stage relative min-h-[420px] overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_50%_20%,rgba(255,250,247,.22),transparent_18rem),linear-gradient(145deg,#5b3c22,#1e120b)] p-6 text-cream md:min-h-[520px]"
            >
              <div
                class="absolute inset-x-8 top-10 h-56 rounded-full bg-[rgba(255,250,247,.12)] blur-3xl"
              ></div>
              <div
                class="relative mx-auto flex h-[390px] max-w-[230px] flex-col justify-end overflow-hidden rounded-[34px] border-[10px] border-[#100b08] bg-cover bg-center p-5 text-center shadow-2xl md:h-[470px] md:max-w-[270px]"
                :style="{
                  backgroundImage: `linear-gradient(180deg, rgba(255, 250, 247, 0.14), rgba(81, 35, 1, 0.72)), url('${assetPath('/images/slide-7.webp')}')`,
                }"
              >
                <p
                  class="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/80"
                >
                  Renée &amp; Gabriel
                </p>
                <h3 class="mt-2 font-serif text-3xl italic leading-tight">
                  Escucha nuestra canción
                </h3>
                <span
                  class="material-symbols-outlined mx-auto mt-5 grid h-12 w-12 place-items-center rounded-full bg-cream/90 text-primary"
                  >play_arrow</span
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="regalos" class="page-shell mt-16 md:mt-20">
        <div
          class="rounded-[28px] border border-outline/50 bg-surface/80 px-6 py-14 soft-shadow md:px-10"
        >
          <div
            class="grid grid-cols-1 items-center gap-10 lg:grid-cols-[.85fr_1.15fr]"
          >
            <div class="mx-auto flex flex-col items-center text-center">
              <div class="envelope-icon" aria-hidden="true">
                <span class="money-mark">$</span>
              </div>
              <p
                class="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary"
              >
                Con cariño
              </p>
              <h2
                class="mt-3 font-serif text-[34px] leading-tight text-primary md:text-[48px]"
              >
                Mesa de regalos
              </h2>
            </div>

            <div class="grid gap-4">
              <article
                class="flex min-h-[210px] flex-col items-center justify-center rounded-[24px] border border-outline/50 bg-cream/70 p-8 text-center md:p-10"
              >
                <span class="material-symbols-outlined text-primary"
                  >redeem</span
                >
                <p class="mt-5 max-w-xl text-muted">
                  Si deseas hacernos un regalo, puedes encontrar nuestra mesa de
                  regalos aquí.
                </p>
                <a
                  class="action-button action-button-primary mt-6"
                  href="https://mesaderegalos.liverpool.com.mx/milistaderegalos/51972633"
                  target="_blank"
                  rel="noreferrer"
                  >Ver mesa</a
                >
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="info" class="page-shell mt-16 md:mt-20">
        <div class="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_.8fr_.8fr]">
          <article
            class="rounded-[24px] border border-outline/50 bg-surface/80 p-6 soft-shadow"
          >
            <span class="material-symbols-outlined text-primary">styler</span>
            <p
              class="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary"
            >
              Código de vestimenta
            </p>
            <h3 class="mt-2 font-serif text-3xl text-primary">
              Elegancia rigurosa
            </h3>
            <div class="mt-6">
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary"
              >
                Evitar colores
              </p>
              <div
                class="mt-3 flex flex-wrap gap-3"
                aria-label="Colores a evitar"
              >
                <span class="color-dot bg-[#f1dfc7]" title="Beige"></span>
                <span class="color-dot bg-[#ffffff]" title="Blanco"></span>
                <span class="color-dot bg-[#fff1d6]" title="Crema"></span>
                <span class="color-dot bg-[#c5161d]" title="Rojo"></span>
              </div>
              <p class="mt-3 text-sm text-muted">
                Beige, blanco, crema, tonos similares y rojo.
              </p>
            </div>
            <div class="mt-6">
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary"
              >
                Color mamá de la novia
              </p>
              <div class="mt-3 flex items-center gap-3">
                <span class="color-dot bg-[#d4af37]" title="Dorado"></span>
                <p class="font-serif text-xl text-primary">Dorado</p>
              </div>
            </div>
          </article>

          <article
            class="rounded-[24px] border border-outline/50 bg-surface/80 p-6 soft-shadow"
          >
            <span class="material-symbols-outlined text-primary">hotel</span>
            <p
              class="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary"
            >
              Hospedaje
            </p>
            <h3 class="mt-2 font-serif text-2xl text-primary">
              Opciones para invitados
            </h3>
            <p class="mt-2 text-muted">LISTA DE OPCIONES</p>
          </article>

          <article
            class="rounded-[24px] border border-outline/50 bg-surface/80 p-6 soft-shadow"
          >
            <p
              class="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary"
            >
              Invitación
            </p>
            <h3 class="mt-2 font-serif text-2xl text-primary">
              Respetuosamente no niños
            </h3>
          </article>
        </div>
      </section>
    </main>

    <nav
      class="mobile-bottom-nav fixed bottom-5 left-1/2 z-50 -translate-x-1/2"
      aria-label="Navegación principal"
    >
      <div
        class="bottom-pill glass flex items-center gap-1 rounded-full px-2 py-2 shadow-lg"
      >
        <a
          class="nav-link rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary transition hover:bg-surface-soft"
          href="#inicio"
          @click.prevent="scrollToSection('#inicio')"
          >Inicio</a
        >
        <a
          class="nav-link rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted transition hover:bg-surface-soft hover:text-primary"
          href="#evento"
          @click.prevent="scrollToSection('#evento')"
          >Evento</a
        >
        <a
          class="nav-link rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted transition hover:bg-surface-soft hover:text-primary"
          href="#padrinos"
          @click.prevent="scrollToSection('#padrinos')"
          >Padrinos</a
        >
        <a
          class="nav-link rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted transition hover:bg-surface-soft hover:text-primary"
          href="#regalos"
          @click.prevent="scrollToSection('#regalos')"
          >Regalos</a
        >
        <a
          class="nav-link rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted transition hover:bg-surface-soft hover:text-primary"
          href="#asistencia"
          @click.prevent="scrollToSection('#asistencia')"
          >asistencia</a
        >
        <a
          class="nav-link rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted transition hover:bg-surface-soft hover:text-primary"
          href="#info"
          @click.prevent="scrollToSection('#info')"
          >Info</a
        >
      </div>
    </nav>
  </div>
</template>
