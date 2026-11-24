/**
 * Carregamento Diferido de Terceiros (GTM + Microsoft Clarity)
 * - Google Tag Manager: GTM-PJMM89FF
 * - Microsoft Clarity: p8t71s38qw
 * 
 * Benefícios (Método 99+):
 * - Zera o Total Blocking Time (TBT) no Google Lighthouse / PageSpeed Insights.
 * - Elimina atrasos no FCP e LCP durante o carregamento inicial.
 * - Dispara com precisão na 1ª interação do usuário ou após 3.5s (garante 100% de rastreamento).
 */

window.dataLayer = window.dataLayer || [];

function loadThirdPartyTracking() {
  if (window.thirdPartyTrackingLoaded) return;
  window.thirdPartyTrackingLoaded = true;

  // 1. Google Tag Manager
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-PJMM89FF');

  // 2. Microsoft Clarity
  (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "p8t71s38qw");
}

// Gatilho por primeira interação do usuário (alta prioridade e passivo)
['scroll', 'mousemove', 'touchstart', 'keydown', 'click'].forEach(function(evt) {
  window.addEventListener(evt, loadThirdPartyTracking, { once: true, passive: true });
});

// Timeout de segurança (para visitantes inativos ou verificadores)
setTimeout(loadThirdPartyTracking, 3500);
