import { site, whatsappUrl, instagramUrl } from './config.js';
import { customizerMarkup, mountCustomizer } from './customizer.js';

const escape = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const arrow = '<span aria-hidden="true">↗</span>';
const flower = '<span class="flower" aria-hidden="true">✳</span>';
const navigation = [['inicio', 'Início'], ['bem-casados', 'Bem-casados'], ['personalizar', 'Personalize'], ['sobre', 'Sobre'], ['contato', 'Contato']];
const links = navigation.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('');
const brand = `${site.logo ? `<img class="brand-image" src="${escape(site.logo)}" alt="" width="64" height="64" />` : ''}<span class="brand-wordmark"><span class="brand-text">${escape(site.name)}</span><span class="brand-caption">FEITO PARA CELEBRAR</span></span>`;
const photo = (item, className = '', eager = false) => `<img class="${className}" src="${escape(item.image)}" alt="${escape(item.alt)}" width="800" height="800" loading="${eager ? 'eager' : 'lazy'}" ${eager ? 'fetchpriority="high"' : ''} decoding="async" />`;
const caption = (item) => item.illustrative ? '<span class="photo-note">Imagem ilustrativa</span>' : '';
const whatsapp = whatsappUrl(site.whatsapp);
const instagram = instagramUrl(site.instagram);

document.querySelector('#app').innerHTML = `
  <div class="announcement">Pequenas delicadezas. Grandes lembranças. <span aria-hidden="true">✦</span></div>
  <header class="header">
    <div class="header-inner wrap">
      <a class="brand" href="#inicio" aria-label="Officina do Doce — início">${brand}</a>
      <nav class="desktop-nav" aria-label="Navegação principal">${links}</nav>
      <a class="button header-cta" href="${escape(whatsapp)}" target="_blank" rel="noopener noreferrer">Solicitar orçamento ${arrow}</a>
      <button class="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button>
    </div>
    <nav id="mobile-nav" class="mobile-nav" aria-label="Navegação móvel" hidden>${links}<a class="button" href="${escape(whatsapp)}" target="_blank" rel="noopener noreferrer">Solicitar orçamento ${arrow}</a></nav>
  </header>
  <main id="conteudo">
    <section class="hero wrap" id="inicio" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="little-line"></span> DOÇURA EM CADA DETALHE</p>
        <h1 id="hero-title">Bem-casados para momentos <em>inesquecíveis.</em></h1>
        <p class="hero-description">Bem-casados para celebrar o amor e presentear seus convidados com uma lembrança especial.</p>
        <div class="hero-actions"><a class="button" href="#bem-casados">Conheça nossos bem-casados <span aria-hidden="true">→</span></a><a class="text-link" href="${escape(whatsapp)}" target="_blank" rel="noopener noreferrer">Solicitar orçamento ${arrow}</a></div>
        <div class="hero-signature">${flower}<span>Feito com carinho.<br><strong>Para ficar na memória.</strong></span></div>
      </div>
      <figure class="hero-visual">${photo(site.hero, '', true)}<div class="image-badge"><span>PARA MOMENTOS</span>${flower}<span>ESPECIAIS</span></div><figcaption>${caption(site.hero)}</figcaption></figure>
    </section>
    <section class="section wrap" id="bem-casados" aria-labelledby="bem-casados-title">
      <div class="section-heading"><div><p class="eyebrow">NOSSOS BEM-CASADOS</p><h2 id="bem-casados-title">Uma doce forma de <em>agradecer.</em></h2></div><p>Para encantar à primeira vista.<br>E fazer parte das melhores lembranças.</p></div>
      <div class="products">${site.products.map((p, i) => `<article class="product"><div class="product-photo" role="region" aria-roledescription="carrossel" aria-label="${escape(p.title)}" data-carousel="${escape(p.id)}" tabindex="0">${photo({ image: p.images[0], alt: `${p.title} — foto 1 de ${p.images.length}` })}<div class="carousel-controls"><button type="button" data-step="-1" aria-label="Foto anterior de ${escape(p.title)}">←</button><button type="button" data-step="1" aria-label="Próxima foto de ${escape(p.title)}">→</button></div></div><div class="product-details"><div class="product-title"><span class="number">0${i + 1}</span><h3>${escape(p.title)}</h3></div><p>${escape(p.description)}</p><a class="text-link" href="#contato">Encomende seus bem-casados ${arrow}</a></div></article>`).join('')}</div>
    </section>
    <section class="about section" id="sobre" aria-labelledby="sobre-title"><div class="wrap about-grid"><figure class="about-photo">${photo(site.about)}<figcaption>${caption(site.about)}</figcaption><span class="about-label">O carinho está nos detalhes.</span></figure><div class="about-copy"><p class="eyebrow">SOBRE A OFFICINA DO DOCE</p><h2 id="sobre-title">Bem-casados feitos para celebrar.<br><em>Parte da sua história.</em></h2><p>${escape(site.about.text)}</p><p>${escape(site.about.detail)}</p><div class="about-signature">${flower}<span>Doçura que aproxima.<br>Memórias que ficam.</span></div></div></div></section>
    <section class="contact section" id="contato" aria-labelledby="contato-title"><div class="wrap contact-inner">${flower}<p class="eyebrow">SEU PRÓXIMO MOMENTO ESPECIAL COMEÇA AQUI</p><h2 id="contato-title">Bem-casados para a sua <em>celebração?</em></h2><p>Solicite um orçamento de bem-casados para o seu evento.<br class="desktop-break"> Vamos conversar sobre os detalhes dessa lembrança especial.</p><div class="contact-actions">${whatsapp ? `<a class="button" href="${escape(whatsapp)}" target="_blank" rel="noopener noreferrer">WhatsApp: (16) 99154-7539 ${arrow}</a>` : '<p class="contact-unavailable">Nosso canal de orçamentos será disponibilizado em breve.</p>'}${instagram ? `<a class="text-link" href="${escape(instagram)}" target="_blank" rel="noopener noreferrer">Instagram: @officina.do.doce ${arrow}</a>` : ''}</div>${site.region ? `<p class="region">${escape(site.region)}</p>` : ''}</div></section>
  </main>
  <footer><div class="wrap footer-main"><a class="brand" href="#inicio">${brand}</a><p>Bem-casados para celebrar<br>os grandes momentos da vida.</p><nav aria-label="Navegação do rodapé"><a href="#bem-casados">Bem-casados</a><a href="#sobre">Sobre</a><a href="#contato">Contato</a></nav>${instagram ? `<a class="text-link" href="${escape(instagram)}" target="_blank" rel="noopener noreferrer">Instagram ${arrow}</a>` : flower}</div><div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} ${escape(site.name)}. Todos os direitos reservados.</span><span>Feito para celebrar <span class="cherry" aria-hidden="true">♥</span></span></div></footer>
`;

document.querySelector('#sobre').insertAdjacentHTML('beforebegin', customizerMarkup(escape));
mountCustomizer();

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() { mobileNav.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Abrir menu'); }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; mobileNav.hidden = !open; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); });
mobileNav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); } });
matchMedia('(min-width: 1001px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { document.querySelectorAll('.desktop-nav a').forEach(a => { if (a.hash === `#${entry.target.id}`) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); }); } }); }, { rootMargin: '-15% 0px -65% 0px' });
navigation.forEach(([id]) => observer.observe(document.getElementById(id)));

// Cada carrossel preserva sua altura e seu estado.
document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const product = site.products.find(item => item.id === carousel.dataset.carousel);
  const image = carousel.querySelector('img');
  const counter = carousel.querySelector('.carousel-counter');
  let current = 0;
  const advance = step => {
    current = (current + step + product.images.length) % product.images.length;
    image.src = product.images[current];
    image.alt = product.title + ' — foto ' + (current + 1) + ' de ' + product.images.length;
    if (counter) counter.textContent = (current + 1) + ' / ' + product.images.length;
  };
  carousel.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => advance(Number(button.dataset.step))));
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      advance(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  let touchStart;
  carousel.addEventListener('touchstart', event => {
    const touch = event.changedTouches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  carousel.addEventListener('touchend', event => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) advance(dx < 0 ? 1 : -1);
    touchStart = undefined;
  }, { passive: true });
  carousel.addEventListener('touchcancel', () => { touchStart = undefined; }, { passive: true });
});
