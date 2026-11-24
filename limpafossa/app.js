(() => {
  'use strict';

  const basePhone = '5519982245688';

  const cities = [
    ['americana', 'Americana'],
    ['araras', 'Araras'],
    ['artur-nogueira', 'Artur Nogueira'],
    ['campinas', 'Campinas'],
    ['capivari', 'Capivari'],
    ['charqueada', 'Charqueada'],
    ['conchal', 'Conchal'],
    ['cordeiropolis', 'Cordeirópolis'],
    ['cosmopolis', 'Cosmópolis'],
    ['elias-fausto', 'Elias Fausto'],
    ['engenheiro-coelho', 'Engenheiro Coelho'],
    ['holambra', 'Holambra'],
    ['hortolandia', 'Hortolândia'],
    ['indaiatuba', 'Indaiatuba'],
    ['iracemapolis', 'Iracemápolis'],
    ['itapira', 'Itapira'],
    ['itirapina', 'Itirapina'],
    ['jaguariuna', 'Jaguariúna'],
    ['leme', 'Leme'],
    ['limeira', 'Limeira'],
    ['mogi-guacu', 'Mogi Guaçu'],
    ['mogi-mirim', 'Mogi Mirim'],
    ['monte-mor', 'Monte Mor'],
    ['nova-odessa', 'Nova Odessa'],
    ['paulinia', 'Paulínia'],
    ['pedreira', 'Pedreira'],
    ['piracicaba', 'Piracicaba'],
    ['rio-claro', 'Rio Claro'],
    ['rio-das-pedras', 'Rio das Pedras'],
    ['santa-barbara-doeste', "Santa Bárbara d'Oeste"],
    ['santa-gertrudes', 'Santa Gertrudes'],
    ['santo-antonio-de-posse', 'Santo Antônio de Posse'],
    ['sumare', 'Sumaré'],
    ['valinhos', 'Valinhos']
  ].map(([slug, name]) => ({ slug, name }));

  const defaultCity = cities.find(c => c.slug === 'limeira');
  const params = new URLSearchParams(window.location.search);

  function normalize(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  const bySlug = new Map(cities.map(c => [c.slug, c]));
  const byNormalizedName = new Map(cities.map(c => [normalize(c.name), c]));

  function detectCity() {
    const paramCity = params.get('cidade');
    if (paramCity) {
      const clean = normalize(paramCity);
      if (byNormalizedName.has(clean)) return byNormalizedName.get(clean);
      if (bySlug.has(paramCity.toLowerCase())) return bySlug.get(paramCity.toLowerCase());
      const formatted = paramCity
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      return { slug: paramCity.toLowerCase(), name: formatted };
    }

    const searchTerms = [
      params.get('utm_term'),
      params.get('utm_campaign'),
      params.get('utm_content'),
      params.get('keyword'),
      params.get('loc_physical_ms')
    ].filter(Boolean).join(' ');

    if (searchTerms) {
      const normTerms = normalize(searchTerms);
      for (const city of cities) {
        if (normTerms.includes(normalize(city.name))) {
          return city;
        }
      }
    }

    return defaultCity;
  }

  const selected = detectCity();

  // Atualiza todos os nós com [data-city] com o nome da cidade
  document.querySelectorAll('[data-city]').forEach(el => {
    el.textContent = selected.name;
  });

  // Atualiza título da página e meta tags com correspondência exata da palavra-chave dos anúncios
  document.title = `Limpa Fossa ${selected.name} e Região | Atendimento Rápido | GITEX`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute(
      'content',
      `Limpa fossa ${selected.name} e região com atendimento rápido e caminhão auto vácuo. Orçamento gratuito pelo WhatsApp da GITEX.`
    );
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Renderiza a lista de cidades sem destacar nenhuma como sede (todas em padrão uniforme)
  const citiesListEl = document.getElementById('cities-list');
  if (citiesListEl) {
    citiesListEl.innerHTML = cities
      .map(c => `<li>${c.name}</li>`)
      .join('');
  }

  // ============================================================
  // RASTREADOR OFICIAL OFFLINE GOOGLE ADS + SUPABASE (ZWC)
  // ============================================================
  const query = params;
  const identifiers = {
    gclid: query.get('gclid'),
    gbraid: query.get('gbraid'),
    wbraid: query.get('wbraid')
  };
  const adsAccount = query.get('ads_account');
  const hasGoogleIdentifier = Object.values(identifiers).some(Boolean);
  const storageKey = 'gads_offline_reference_v1';

  let stored;
  try {
    stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
  } catch (_) {}

  let reference = stored?.reference || null;

  const identifiersChanged =
    !stored ||
    stored?.adsAccount !== adsAccount ||
    Object.keys(identifiers).some((key) => stored?.[key] !== identifiers[key]);

  if (hasGoogleIdentifier && (!reference || identifiersChanged)) {
    const random = crypto.getRandomValues(new Uint32Array(3));

    reference =
      'G' +
      Array.from(random, (value) => value.toString(36).toUpperCase())
        .join('')
        .slice(0, 7)
        .padEnd(7, '0');

    localStorage.setItem(
      storageKey,
      JSON.stringify({ ...identifiers, adsAccount, reference })
    );
  }

  if (hasGoogleIdentifier) {
    fetch(
      'https://mqkfshhcabuhjtxdntid.supabase.co/functions/v1/attribution-capture',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_code: reference,
          ...identifiers,
          ads_account: adsAccount,
          landing_url: window.location.href
        }),
        keepalive: true
      }
    ).catch(() => {});
  }

  const invisibleAlphabet = ['\u200B', '\u200C', '\u200D', '\u2060'];

  const invisibleReference = reference
    ? '\u2063\u2063' +
      Array.from(reference, (character) => {
        const code = character.charCodeAt(0);
        return [6, 4, 2, 0]
          .map((shift) => invisibleAlphabet[(code >> shift) & 3])
          .join('');
      }).join('') +
      '\u2064\u2064'
    : '';

  // Mensagem pré-programada para o WhatsApp (sem ponto final no fim para que o ZWC fique colado imediatamente após 'Fossa')
  const baseMessage = 'Olá, vi o anúncio de vocês no *Google* e gostaria de um orçamento para limpeza de fossa';

  // Pré-atualiza os links de WhatsApp na inicialização da página
  document.querySelectorAll('[data-whatsapp]').forEach(link => {
    try {
      const url = new URL(`https://api.whatsapp.com/send`);
      url.searchParams.set('phone', basePhone);
      url.searchParams.set('text', baseMessage + invisibleReference);
      link.href = url.toString();
    } catch (_) {}
  });

  document.querySelectorAll('[data-whatsapp]').forEach(link => {
    link.addEventListener(
      'click',
      () => {
        const position = link.dataset.position || 'unknown';
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'whatsapp_click',
          service: 'limpeza_de_fossa',
          city: selected.slug,
          position: position,
          reference: reference || 'direto'
        });

        const url = new URL(`https://api.whatsapp.com/send`);
        url.searchParams.set('phone', basePhone);
        url.searchParams.set('text', baseMessage + invisibleReference);
        link.href = url.toString();
      },
      { passive: true }
    );
  });

  // Listener global de segurança para interceptar links de WhatsApp e anexar ZWC
  document.addEventListener(
    'click',
    (event) => {
      const link = event.target.closest('a[href*="api.whatsapp.com"]');
      if (!link || !invisibleReference) return;

      try {
        const url = new URL(link.href);
        const currentMessage = url.searchParams.get('text') || baseMessage;

        if (!currentMessage.includes('\u2063\u2063')) {
          url.searchParams.set('text', currentMessage + invisibleReference);
          link.href = url.toString();
        }
      } catch (_) {}
    },
    true
  );

  // ============================================================
  // CARROSSEL INFINITO DE AVALIAÇÕES (1 CARD POR VEZ, SEM REBOBINAR)
  // ============================================================
  function initReviewsCarousel() {
    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const viewport = document.getElementById('carousel-viewport');

    if (!track || !prevBtn || !nextBtn || !viewport) return;

    let isAnimating = false;

    function getStepWidth() {
      const card = track.firstElementChild;
      if (!card) return 0;
      const cardRect = card.getBoundingClientRect();
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.gap) || 20;
      return cardRect.width + gap;
    }

    function slideNext() {
      if (isAnimating) return;
      const step = getStepWidth();
      if (step <= 0) return;

      isAnimating = true;
      track.style.transition = 'transform 0.42s cubic-bezier(0.25, 1, 0.5, 1)';
      track.style.transform = `translateX(-${step}px)`;

      const onEnd = () => {
        track.removeEventListener('transitionend', onEnd);
        clearTimeout(safetyTimeout);
        track.style.transition = 'none';
        track.appendChild(track.firstElementChild);
        track.style.transform = 'translateX(0)';
        void track.offsetWidth; // Força repaint
        isAnimating = false;
      };

      const safetyTimeout = setTimeout(onEnd, 480);
      track.addEventListener('transitionend', onEnd, { once: true });
    }

    function slidePrev() {
      if (isAnimating) return;
      const step = getStepWidth();
      if (step <= 0) return;

      isAnimating = true;
      // Move o último elemento para a primeira posição antes de animar
      track.insertBefore(track.lastElementChild, track.firstElementChild);
      track.style.transition = 'none';
      track.style.transform = `translateX(-${step}px)`;
      void track.offsetWidth; // Força repaint

      // Agora anima deslizando para a direita (0)
      track.style.transition = 'transform 0.42s cubic-bezier(0.25, 1, 0.5, 1)';
      track.style.transform = 'translateX(0)';

      const onEnd = () => {
        track.removeEventListener('transitionend', onEnd);
        clearTimeout(safetyTimeout);
        track.style.transition = 'none';
        isAnimating = false;
      };

      const safetyTimeout = setTimeout(onEnd, 480);
      track.addEventListener('transitionend', onEnd, { once: true });
    }

    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      slideNext();
    });

    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      slidePrev();
    });

    // Suporte a Touch Swipe no Mobile
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;

    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const diffX = touchStartX - touchEndX;
      const diffY = Math.abs(touchStartY - touchEndY);

      // Só dispara se o movimento horizontal for maior que o vertical
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > diffY) {
        if (diffX > 0) {
          slideNext();
        } else {
          slidePrev();
        }
      }
    }, { passive: true });
  }

  // ============================================================
  // EXIBIÇÃO SUAVE DOS BOTÕES FLUTUANTES APÓS 2 SEGUNDOS
  // ============================================================
  setTimeout(() => {
    const floatingBtn = document.querySelector('.floating-whatsapp');
    if (floatingBtn) floatingBtn.classList.add('is-visible');

    const mobileBar = document.querySelector('.mobile-bottom-bar');
    if (mobileBar) mobileBar.classList.add('is-visible');
  }, 2000);

  // ============================================================
  // ANIMAÇÕES DE ENTRADA AO SCROLL IDÊNTICAS AO PROJETO QUALITYCAR
  // Baseadas em ScrollTrigger.batch, autoAlpha: 0, y: 36 e power2.out
  // Apenas nas seções abaixo do Hero (Hero preservado para LCP 100)
  // ============================================================
  // ============================================================
  // ANIMAÇÕES DE ENTRADA AO SCROLL SUAVES (ZERO ACELERAÇÃO NO FINAL)
  // Usando a função STAGGER nativa do GSAP para todas as listas de itens
  // e curva senoidal pura (sine.out) com entrada única e estável (once: true)
  // Apenas abaixo do Hero (Hero estático para LCP 100 no Lighthouse)
  // ============================================================
  function initScrollAnimations() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // 1. BLOCOS INDIVIDUAIS (Cabeçalhos, textos e caixas centrais)
    const singleBlocks = [
      { trigger: '.services-section', el: '.services-section .section-header' },
      { trigger: '.services-section', el: '.services-section .mascote-wrapper' },
      { trigger: '.services-section', el: '.services-section .services-center-cta' },
      { trigger: '.equipment-section', el: '.equipment-layout > div:first-child' },
      { trigger: '.reviews-section', el: '.reviews-header' },
      { trigger: '.reviews-section', el: '.reviews-section .carousel-wrapper' },
      { trigger: '.reviews-section', el: '.carousel-controls-bottom' },
      { trigger: '.why-section', el: '.why-layout > div:first-child' },
      { trigger: '.why-section', el: '.why-image-box' },
      { trigger: '.cities-section', el: '.cities-header' },
      { trigger: '.faq-section', el: '.faq-header' },
      { trigger: '.site-footer', el: '.copyright-bar' }
    ];

    singleBlocks.forEach(item => {
      const el = document.querySelector(item.el);
      const trig = document.querySelector(item.trigger);
      if (!el || !trig) return;

      gsap.fromTo(el,
        { autoAlpha: 0, y: 22 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'sine.out',
          scrollTrigger: {
            trigger: trig,
            start: 'top 85%',
            once: true
          }
        }
      );
    });

    // 2. LISTAS DE ITENS USANDO A FUNÇÃO STAGGER NATIVA DO GSAP
    const staggerLists = [
      // Passos do atendimento (Cards 1, 2 e 3)
      {
        trigger: '.steps-flow-grid',
        items: '.steps-flow-grid .step-card',
        stagger: 0.12,
        y: 24,
        duration: 0.8
      },
      // Imagens da estrutura técnica
      {
        trigger: '.equipment-images',
        items: '.equipment-images .equipment-img-card',
        stagger: 0.14,
        y: 24,
        duration: 0.8
      },
      // Lista de diferenciais (Por que escolher a GITEX)
      {
        trigger: '.why-features-list',
        items: '.why-features-list li',
        stagger: 0.08,
        y: 18,
        duration: 0.75
      },
      // Grade de cidades atendidas (cascata suave e uniforme)
      {
        trigger: '.cities-list',
        items: '.cities-list li',
        stagger: { each: 0.02, from: 'start' },
        y: 16,
        duration: 0.65
      },
      // Perguntas frequentes (FAQ)
      {
        trigger: '.faq-list',
        items: '.faq-list .faq-item',
        stagger: 0.1,
        y: 20,
        duration: 0.75
      },
      // Colunas do rodapé
      {
        trigger: '.site-footer',
        items: '.site-footer .footer-grid > div',
        stagger: 0.12,
        y: 22,
        duration: 0.8
      }
    ];

    staggerLists.forEach(list => {
      const trig = document.querySelector(list.trigger);
      const items = document.querySelectorAll(list.items);
      if (!trig || !items.length) return;

      gsap.fromTo(items,
        { autoAlpha: 0, y: list.y },
        {
          autoAlpha: 1,
          y: 0,
          duration: list.duration,
          ease: 'sine.out',
          stagger: list.stagger,
          scrollTrigger: {
            trigger: trig,
            start: 'top 85%',
            once: true
          }
        }
      );
    });

    const refreshScroll = () => {
      window.requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    };

    window.addEventListener('load', refreshScroll, { once: true });
    window.setTimeout(refreshScroll, 200);
    window.setTimeout(refreshScroll, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initReviewsCarousel();
      initScrollAnimations();
    });
  } else {
    initReviewsCarousel();
    initScrollAnimations();
  }

})();

