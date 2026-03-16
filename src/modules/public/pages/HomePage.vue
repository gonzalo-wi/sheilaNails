<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Sparkles, Clock, Star, CheckCircle } from 'lucide-vue-next'
import Button from '@/shared/components/ui/Button.vue'
import type { Servicio } from '@/shared/types'

const servicios = ref<Servicio[]>([])
const loading = ref(true)

// ——— Counter Animation ———
const statsRef = ref<HTMLElement | null>(null)
const statsAnimated = ref(false)
const counter1 = ref(0)   // → 5000
const counter2 = ref(0)   // → 15
const counter3 = ref(0)   // → 49 (display as /10 = 4.9)

const displayCounter3 = computed(() => (counter3.value / 10).toFixed(1))

function easeOutCubic(t: number) { return 1 - (1 - t) ** 3 }

function countUp(target: number, duration: number, setter: (v: number) => void) {
  const t0 = performance.now()
  function tick(t: number) {
    const p = Math.min((t - t0) / duration, 1)
    setter(Math.round(target * easeOutCubic(p)))
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

// ——— Scroll Reveal ———
const serviciosSectionRef = ref<HTMLElement | null>(null)
const testimoniosSectionRef = ref<HTMLElement | null>(null)
const faqSectionRef = ref<HTMLElement | null>(null)
const contactSectionRef = ref<HTMLElement | null>(null)
const ctaSectionRef = ref<HTMLElement | null>(null)

const serviciosVisible = ref(false)
const testimoniosVisible = ref(false)
const faqVisible = ref(false)
const contactVisible = ref(false)
const ctaVisible = ref(false)

function observe(el: HTMLElement | null, cb: () => void, threshold = 0.15) {
  if (!el) return
  const obs = new IntersectionObserver(entries => {
    if (entries[0]?.isIntersecting) { cb(); obs.disconnect() }
  }, { threshold })
  obs.observe(el)
}

const testimonios = [
  {
    nombre: 'María González',
    texto: 'Excelente atención y calidad. Mis uñas quedaron perfectas, tal como las quería. ¡Re vuelvo!',
    rating: 5,
  },
  {
    nombre: 'Sofía Martínez',
    texto: 'El mejor lugar de uñas en Buenos Aires. Profesionales, atentas y siempre con las últimas tendencias.',
    rating: 5,
  },
  {
    nombre: 'Lucía Rodríguez',
    texto: 'Me hicieron un diseño increíble para mi casamiento. Quedé enamorada del resultado. Súper recomendable.',
    rating: 5,
  },
]

const faqs = [
  {
    pregunta: '¿Cuánto dura un servicio de manicura?',
    respuesta: 'Una manicura clásica dura aproximadamente 45 minutos, mientras que servicios más elaborados pueden tomar hasta 2 horas.',
  },
  {
    pregunta: '¿Cuánto tiempo duran las uñas esculpidas?',
    respuesta: 'Con el cuidado apropiado, las uñas esculpidas pueden durar de 3 a 4 semanas antes de necesitar un relleno.',
  },
  {
    pregunta: '¿Puedo cancelar o reprogramar mi turno?',
    respuesta: 'Sí, podés cancelar o reprogramar tu turno con hasta 24 horas de anticipación sin cargo.',
  },
  {
    pregunta: '¿Qué métodos de pago aceptan?',
    respuesta: 'Aceptamos efectivo, tarjetas de débito/crédito y transferencias bancarias.',
  },
]

onMounted(async () => {
  try {
    servicios.value = [
      {
        id: 1,
        nombre: 'Manicura Clásica',
        descripcion: 'Cuidado completo de manos con esmaltado tradicional',
        duracion: 45,
        precio: 3500,
        categoria: 'Manicura',
        activo: true,
        requiereSena: false,
      },
      {
        id: 2,
        nombre: 'Manicura Semipermanente',
        descripcion: 'Esmaltado de larga duración con gel UV',
        duracion: 60,
        precio: 5500,
        categoria: 'Manicura',
        activo: true,
        requiereSena: false,
      },
      {
        id: 3,
        nombre: 'Uñas Esculpidas',
        descripcion: 'Extensión de uñas con gel o acrílico',
        duracion: 120,
        precio: 12000,
        categoria: 'Esculpidas',
        activo: true,
        requiereSena: true,
      },
      {
        id: 4,
        nombre: 'Nail Art',
        descripcion: 'Diseños personalizados y decoraciones especiales',
        duracion: 90,
        precio: 8000,
        categoria: 'Diseño',
        activo: true,
        requiereSena: false,
      },
      {
        id: 5,
        nombre: 'Pedicura Spa',
        descripcion: 'Tratamiento completo de pies con exfoliación e hidratación',
        duracion: 75,
        precio: 6500,
        categoria: 'Pedicura',
        activo: true,
        requiereSena: false,
      },
      {
        id: 6,
        nombre: 'Kapping',
        descripcion: 'Recubrimiento en gel para fortalecer uñas naturales',
        duracion: 60,
        precio: 6000,
        categoria: 'Tratamiento',
        activo: true,
        requiereSena: false,
      },
    ]
  } catch (error) {
    console.error('Error al cargar servicios:', error)
  } finally {
    loading.value = false
  }

  // Stats counter – fires when stats block enters viewport
  observe(statsRef.value, () => {
    if (statsAnimated.value) return
    statsAnimated.value = true
    countUp(5000, 2200, v => counter1.value = v)
    countUp(15,   1500, v => counter2.value = v)
    countUp(49,   1900, v => counter3.value = v)  // 49 → 4.9
  }, 0.6)

  // Section scroll-reveal observers
  observe(serviciosSectionRef.value,   () => serviciosVisible.value   = true)
  observe(testimoniosSectionRef.value, () => testimoniosVisible.value = true)
  observe(faqSectionRef.value,         () => faqVisible.value         = true)
  observe(contactSectionRef.value,     () => contactVisible.value     = true)
  observe(ctaSectionRef.value,         () => ctaVisible.value         = true)
})

function scrollToServicios() {
  document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="min-h-screen bg-neutral-950">
    <!-- Hero Section con Background Image -->
    <section class="relative h-screen flex items-center overflow-hidden">
      <!-- Background Image con Overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <!-- Placeholder para imagen de hero en producción -->
        <div class="absolute inset-0 opacity-30">
          <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1920')] bg-cover bg-center" />
        </div>
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
      </div>

      <!-- Floating Orbs / Particles -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="orb orb-1" />
        <div class="orb orb-2" />
        <div class="orb orb-3" />
        <div class="orb orb-4" />
        <!-- Sparkle dots -->
        <div v-for="n in 12" :key="n" class="sparkle" :style="{ '--x': `${(n * 137.5) % 100}%`, '--y': `${(n * 97.3) % 100}%`, '--d': `${(n * 0.7).toFixed(1)}s`, '--size': `${2 + (n % 3)}px` }" />
      </div>

      <!-- Content -->
      <div class="container-custom relative z-10">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="font-display text-display-xl md:text-display-2xl font-bold text-white mb-6 animate-fade-in-up">
            Donde el arte encuentra
            <span class="text-gradient block mt-2">la elegancia</span>
          </h1>
          <p class="text-xl md:text-2xl text-neutral-300 mb-12 max-w-2xl mx-auto animate-fade-in-up" style="animation-delay: 0.1s">
            Transformá tus manos con técnicas de vanguardia, productos premium y atención personalizada
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style="animation-delay: 0.2s">
            <RouterLink to="/turnos">
              <Button size="lg" class="w-full sm:w-auto min-w-[200px] hover-glow">
                <Sparkles class="mr-2" :size="20" />
                Reservar turno
              </Button>
            </RouterLink>
            <Button 
              variant="outline" 
              size="lg" 
              class="w-full sm:w-auto min-w-[200px] !text-white !border-white/20 hover:!border-primary-500 hover:!bg-white/5"
              @click="scrollToServicios()"
            >
              Explorar servicios
            </Button>
          </div>

          <!-- Stats -->
          <div ref="statsRef" class="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-white/10">
            <div class="text-center">
              <div class="text-4xl font-bold text-gradient mb-1 tabular-nums">{{ counter1.toLocaleString('es-AR') }}+</div>
              <div class="text-sm text-neutral-400">Clientas satisfechas</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-gradient mb-1 tabular-nums">{{ counter2 }}+</div>
              <div class="text-sm text-neutral-400">Años de experiencia</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-gradient mb-1 tabular-nums">{{ displayCounter3 }}</div>
              <div class="text-sm text-neutral-400">Rating promedio</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div class="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div class="w-1.5 h-2 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>

    <!-- Servicios Section -->
    <section id="servicios" ref="serviciosSectionRef" class="py-24 bg-neutral-950 relative">
      <!-- Background Gradient -->
      <div class="absolute inset-0 bg-gradient-radial from-primary-950/20 via-transparent to-transparent opacity-50" />
      
      <div class="container-custom relative z-10">
        <div class="text-center mb-16 reveal-item" :class="serviciosVisible ? 'is-visible' : ''">
          <h2 class="section-title">
            Nuestros servicios
          </h2>
          <p class="section-subtitle">
            Descubrí nuestra amplia gama de tratamientos diseñados para realzar tu belleza natural
          </p>
        </div>

        <div v-if="loading" class="text-center py-20">
          <div class="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto" />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(servicio, idx) in servicios"
            :key="servicio.id"
            class="card-hover group cursor-pointer bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 reveal-item"
            :class="serviciosVisible ? 'is-visible' : ''"
            :style="{ transitionDelay: serviciosVisible ? `${idx * 80}ms` : '0ms' }"
          >
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-xl font-semibold text-white group-hover:text-gradient transition-all duration-300">
                {{ servicio.nombre }}
              </h3>
              <div class="text-right">
                <div class="text-2xl font-bold text-gradient">${{ (servicio.precio / 1000).toFixed(1) }}k</div>
                <div class="text-xs text-neutral-500">ARS</div>
              </div>
            </div>
            
            <p class="text-neutral-400 mb-6">{{ servicio.descripcion }}</p>
            
            <div class="flex items-center justify-between pt-4 border-t border-neutral-800">
              <div class="flex items-center text-sm text-neutral-500">
                <Clock :size="16" class="mr-2 text-primary-500" />
                {{ servicio.duracion }} min
              </div>
              <RouterLink 
                to="/turnos" 
                class="text-primary-500 hover:text-primary-400 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                Reservar
                <span class="text-lg">→</span>
              </RouterLink>
            </div>
          </div>
        </div>

        <div class="mt-12 text-center">
          <RouterLink to="/turnos">
            <Button size="lg" variant="outline" class="!text-white !border-primary-500/30 hover:!bg-primary-500/10">
              Ver todos los servicios
            </Button>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Testimonios Section -->
    <section ref="testimoniosSectionRef" class="py-24 bg-neutral-900 relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 40px 40px;" />
      </div>

      <div class="container-custom relative z-10">
        <div class="text-center mb-16 reveal-item" :class="testimoniosVisible ? 'is-visible' : ''">
          <h2 class="section-title">
            Lo que dicen nuestras clientas
          </h2>
          <p class="section-subtitle">
            Miles de clientas confían en nosotras para lucir uñas perfectas
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(testimonio, index) in testimonios"
            :key="index"
            class="card bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover-lift reveal-item"
            :class="testimoniosVisible ? 'is-visible' : ''"
            :style="{ transitionDelay: testimoniosVisible ? `${index * 120}ms` : '0ms' }"
          >
            <!-- Stars -->
            <div class="flex items-center gap-1 mb-4">
              <Star
                v-for="i in testimonio.rating"
                :key="i"
                :size="18"
                class="text-primary-500 fill-primary-500"
              />
            </div>
            
            <!-- Testimonial Text -->
            <p class="text-neutral-300 mb-6 italic leading-relaxed">
              "{{ testimonio.texto }}"
            </p>
            
            <!-- Author -->
            <div class="flex items-center gap-3 pt-4 border-t border-neutral-700">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                {{ testimonio.nombre.charAt(0) }}
              </div>
              <div>
                <p class="font-semibold text-white">{{ testimonio.nombre }}</p>
                <p class="text-xs text-neutral-500">Cliente verificada</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section id="faq" ref="faqSectionRef" class="py-24 bg-neutral-950">
      <div class="container-custom">
        <div class="text-center mb-16 reveal-item" :class="faqVisible ? 'is-visible' : ''">
          <h2 class="section-title">
            Preguntas frecuentes
          </h2>
          <p class="section-subtitle">
            Respondemos tus dudas más comunes
          </p>
        </div>

        <div class="max-w-3xl mx-auto space-y-3">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="card bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 hover:border-primary-500/30 transition-all duration-300 reveal-item"
            :class="faqVisible ? 'is-visible' : ''"
            :style="{ transitionDelay: faqVisible ? `${index * 100}ms` : '0ms' }"
          >
            <div class="flex items-start gap-4">
              <div class="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle :size="18" class="text-primary-500" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-white mb-3">
                  {{ faq.pregunta }}
                </h3>
                <p class="text-neutral-400 leading-relaxed">
                  {{ faq.respuesta }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contacto/Footer Section -->
    <section id="contacto" ref="contactSectionRef" class="py-24 bg-neutral-900 border-t border-neutral-800">
      <div class="container-custom">
        <div class="grid md:grid-cols-2 gap-16 mb-16">
          <!-- Info -->
          <div class="reveal-item" :class="contactVisible ? 'is-visible' : ''">
            <h2 class="font-display text-4xl font-bold text-white mb-6">
              Visitanos
            </h2>
            <p class="text-neutral-400 mb-10 text-lg">
              Estamos ubicadas en pleno centro de Buenos Aires, con fácil acceso en transporte público
            </p>
            
            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                  <span class="text-primary-500">📍</span>
                </div>
                <div>
                  <h3 class="font-semibold text-white mb-1">Dirección</h3>
                  <p class="text-neutral-400">Av. Corrientes 1234, CABA</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                  <span class="text-primary-500">📞</span>
                </div>
                <div>
                  <h3 class="font-semibold text-white mb-1">Teléfono</h3>
                  <p class="text-neutral-400">+54 11 1234-5678</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                  <span class="text-primary-500">📧</span>
                </div>
                <div>
                  <h3 class="font-semibold text-white mb-1">Email</h3>
                  <p class="text-neutral-400">info@nailsstudio.com</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                  <span class="text-primary-500">🕐</span>
                </div>
                <div>
                  <h3 class="font-semibold text-white mb-1">Horarios</h3>
                  <p class="text-neutral-400">Lun - Vie: 9:00 - 20:00</p>
                  <p class="text-neutral-400">Sábados: 10:00 - 18:00</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Map Placeholder -->
          <div class="card bg-neutral-800/50 backdrop-blur-sm border border-neutral-800 flex items-center justify-center min-h-[400px] reveal-item" :class="contactVisible ? 'is-visible' : ''" style="transition-delay: 150ms">
            <div class="text-center">
              <div class="text-6xl mb-4">🗺️</div>
              <p class="text-neutral-400 text-lg">Mapa interactivo</p>
              <p class="text-sm text-neutral-600 mt-2">Google Maps integrado</p>
            </div>
          </div>
        </div>

        <!-- Footer Links -->
        <div class="pt-12 border-t border-neutral-800">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-display text-2xl font-bold text-gradient mb-2">Nails Studio</h3>
              <p class="text-neutral-500 text-sm">© 2024 Todos los derechos reservados</p>
            </div>
            
            <div class="flex items-center gap-6">
              <a href="#" class="text-neutral-400 hover:text-primary-500 transition-colors">Instagram</a>
              <a href="#" class="text-neutral-400 hover:text-primary-500 transition-colors">Facebook</a>
              <a href="#" class="text-neutral-400 hover:text-primary-500 transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Final -->
    <section ref="ctaSectionRef" class="py-20 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 relative overflow-hidden">
      <!-- Shimmer Effect -->
      <div class="absolute inset-0 bg-gradient-shimmer opacity-50" />
      
      <div class="container-custom text-center relative z-10 reveal-item" :class="ctaVisible ? 'is-visible' : ''">
        <h2 class="font-display text-4xl md:text-5xl font-bold text-white mb-6">
          ¿Lista para tener uñas increíbles?
        </h2>
        <p class="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Reservá tu turno ahora y descubrí por qué somos las favoritas
        </p>
        <RouterLink to="/turnos">
          <Button variant="secondary" size="lg" class="hover-lift shadow-glow-lg">
            <Sparkles class="mr-2" :size="20" />
            Reservar mi turno ahora
          </Button>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ——— Scroll Reveal ——————————————————————————————————— */
.reveal-item {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ——— Floating Orbs ————————————————————————————————— */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  animation: orbFloat linear infinite;
}
.orb-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%);
  top: -100px; left: -100px;
  animation-duration: 18s;
  animation-delay: 0s;
}
.orb-2 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(219,39,119,0.12) 0%, transparent 70%);
  bottom: -80px; right: 10%;
  animation-duration: 22s;
  animation-delay: -5s;
}
.orb-3 {
  width: 250px; height: 250px;
  background: radial-gradient(circle, rgba(244,114,182,0.1) 0%, transparent 70%);
  top: 30%; right: -60px;
  animation-duration: 15s;
  animation-delay: -9s;
}
.orb-4 {
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%);
  bottom: 20%; left: 15%;
  animation-duration: 20s;
  animation-delay: -3s;
}

@keyframes orbFloat {
  0%   { transform: translate(0, 0) scale(1); }
  25%  { transform: translate(30px, -20px) scale(1.05); }
  50%  { transform: translate(-15px, 35px) scale(0.97); }
  75%  { transform: translate(20px, 15px) scale(1.03); }
  100% { transform: translate(0, 0) scale(1); }
}

/* ——— Sparkle Dots ————————————————————————————————— */
.sparkle {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: rgba(236, 72, 153, 0.6);
  animation: sparklePulse 3s ease-in-out infinite;
  animation-delay: var(--d);
}

@keyframes sparklePulse {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50%       { opacity: 1; transform: scale(1.4); }
}
</style>
