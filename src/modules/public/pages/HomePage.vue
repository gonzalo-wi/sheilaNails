<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Sparkles, Clock, Star, CheckCircle } from 'lucide-vue-next'
import Button from '@/shared/components/ui/Button.vue'
import type { Servicio } from '@/shared/types'
import { serviciosApi } from '@/modules/admin/api'

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
    servicios.value = await serviciosApi.getAllPublic()
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
                  <p class="text-neutral-400">La Paz 559, Ciudadela</p>
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
          
          <!-- Map embed -->
          <div class="card bg-neutral-800/50 backdrop-blur-sm border border-neutral-800 overflow-hidden min-h-[400px] reveal-item p-0" :class="contactVisible ? 'is-visible' : ''" style="transition-delay: 150ms">
            <iframe
              src="https://maps.google.com/maps?q=La+Paz+559,+Ciudadela,+Buenos+Aires,+Argentina&z=16&output=embed"
              width="100%"
              height="400"
              style="border:0; filter: invert(90%) hue-rotate(180deg);"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Ubicación Nails Deni - La Paz 559, Ciudadela"
            />
          </div>
        </div>

        <!-- Footer Links -->
        <div class="pt-12 border-t border-neutral-800">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-display text-2xl font-bold text-gradient mb-2">Nails Deni</h3>
              <p class="text-neutral-500 text-sm">© 2024 Todos los derechos reservados</p>
            </div>
            
            <div class="flex items-center gap-6">
              <!-- Instagram -->
              <a href="#" aria-label="Instagram" class="w-10 h-10 rounded-full bg-neutral-800 hover:bg-primary-500/20 border border-neutral-700 hover:border-primary-500/50 flex items-center justify-center text-neutral-400 hover:text-primary-400 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <!-- Facebook -->
              <a href="#" aria-label="Facebook" class="w-10 h-10 rounded-full bg-neutral-800 hover:bg-primary-500/20 border border-neutral-700 hover:border-primary-500/50 flex items-center justify-center text-neutral-400 hover:text-primary-400 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <!-- WhatsApp -->
              <a href="#" aria-label="WhatsApp" class="w-10 h-10 rounded-full bg-neutral-800 hover:bg-green-500/20 border border-neutral-700 hover:border-green-500/50 flex items-center justify-center text-neutral-400 hover:text-green-400 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
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
