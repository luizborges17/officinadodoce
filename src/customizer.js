import { site, whatsappUrl } from './config.js';
import { prepareMaterialFrame, renderMaterialFrame } from './material-renderer.js';
import { setupCombinationSharing } from './share-combination.js';

export function mountCustomizer() {
  const config = site.customizer;
  const section = document.querySelector('#personalizar');
  const canvas = section.querySelector('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const controls = section.querySelectorAll('input[type="color"]');
  const status = section.querySelector('.customizer-status');
  const send = section.querySelector('.customizer-send');
  const sharing = setupCombinationSharing(section);
  let materialFrame;
  let pendingFrame;
  const values = { paper: config.paper, ribbon: config.ribbon };
  const name = (part, value) => config.colors[part].find(color => color.value === value)?.name || value.toUpperCase();

  function update() {
    sharing.invalidate();
    controls.forEach(input => {
      input.value = values[input.name];
      const selected = config.colors[input.name].find(color => color.value === values[input.name]);
      section.querySelector(`[data-value="${input.name}"]`).textContent = `${selected?.name || 'Cor livre'} · ${values[input.name].toUpperCase()}`;
    });
    section.querySelectorAll('[data-swatch]').forEach(button => button.setAttribute('aria-pressed', String(values[button.dataset.part] === button.dataset.swatch)));
    const description = `Papel ${name('paper', values.paper)} e fita ${name('ribbon', values.ribbon)}`;
    canvas.setAttribute('aria-label', `Simulação de bem-casado: ${description.toLowerCase()}`);
    const message = `Olá! Gostaria de um orçamento de bem-casados com esta combinação de cores:\nPapel: ${name('paper', values.paper)} (${values.paper.toUpperCase()})\nFita: ${name('ribbon', values.ribbon)} (${values.ribbon.toUpperCase()})\nPodem confirmar a disponibilidade?`;
    if (send) send.href = whatsappUrl(site.whatsapp, message);
    if (!materialFrame) return;
    cancelAnimationFrame(pendingFrame);
    pendingFrame = requestAnimationFrame(() => {
      const pixels = renderMaterialFrame(materialFrame, values.paper, values.ribbon);
      context.putImageData(new ImageData(pixels, canvas.width, canvas.height), 0, 0);
      canvas.dataset.paper = values.paper;
      canvas.dataset.ribbon = values.ribbon;
      sharing.prepare(canvas, {
        company: site.name, whatsapp: site.whatsapp, message,
        paper: `${name('paper', values.paper)} (${values.paper.toUpperCase()})`,
        ribbon: `${name('ribbon', values.ribbon)} (${values.ribbon.toUpperCase()})`,
        paperHex: values.paper, ribbonHex: values.ribbon
      });
    });
  }

  const image = new Image();
  image.onload = () => {
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    context.drawImage(image, 0, 0);
    materialFrame = prepareMaterialFrame(context.getImageData(0, 0, canvas.width, canvas.height));
    context.clearRect(0, 0, canvas.width, canvas.height);
    section.querySelectorAll('fieldset, .customizer-reset').forEach(element => element.disabled = false);
    status.textContent = 'Prévia pronta. Escolha as cores do papel e da fita.';
    update();
  };
  image.onerror = () => { status.textContent = 'Não foi possível carregar a prévia. Recarregue a página para tentar novamente.'; };
  image.src = config.image;
  controls.forEach(input => input.addEventListener('input', () => { values[input.name] = input.value; update(); }));
  section.querySelectorAll('[data-swatch]').forEach(button => button.addEventListener('click', () => { values[button.dataset.part] = button.dataset.swatch; update(); }));
  section.querySelector('.customizer-reset').addEventListener('click', () => { values.paper = config.paper; values.ribbon = config.ribbon; update(); });
  update();
}

export function customizerMarkup(escape) {
  const config = site.customizer;
  return `<section class="section customizer" id="personalizar" aria-labelledby="customizer-title"><div class="wrap">
    <div class="section-heading"><div><p class="eyebrow">DO SEU JEITO</p><h2 id="customizer-title">Um bem-casado com <em>suas cores.</em></h2></div><p>Combine o papel e a fita.<br> Imagine os detalhes da sua celebração.</p></div>
    <div class="customizer-grid"><figure class="customizer-preview"><canvas width="900" height="900" role="img" aria-label="Prévia do bem-casado personalizado">Prévia do bem-casado com as cores escolhidas.</canvas><figcaption>Prévia ilustrativa criada com IA a partir da foto de referência.</figcaption></figure>
    <div class="customizer-options">${[['paper', 'Cor do papel'], ['ribbon', 'Cor da fita']].map(([part, title], i) => `<fieldset disabled><legend><span class="number">0${i + 1}</span> ${title}</legend><div class="color-swatches">${config.colors[part].map(color => `<button type="button" class="color-swatch" data-part="${part}" data-swatch="${color.value}" style="--swatch:${color.value}" aria-label="${title}: ${escape(color.name)}" aria-pressed="false" title="${escape(color.name)}"><span aria-hidden="true"></span></button>`).join('')}</div><div class="custom-color"><label for="color-${part}">Outra cor <input id="color-${part}" type="color" name="${part}" value="${config[part]}" /></label><output data-value="${part}" for="color-${part}"></output></div></fieldset>`).join('')}
    <p class="customizer-note">As cores na tela são aproximadas. A disponibilidade de papéis e fitas será confirmada no orçamento.</p>
    <div class="customizer-actions"><button class="button customizer-share" type="button" hidden disabled>Compartilhar imagem e mensagem</button>${whatsappUrl(site.whatsapp) ? '<a class="button customizer-send" target="_blank" rel="noopener noreferrer">Pedir esta combinação pelo WhatsApp <span aria-hidden="true">↗</span></a>' : '<a class="button" href="#contato">Consultar esta combinação</a>'}<button class="text-link customizer-download" type="button" disabled>Baixar print da combinação</button><p class="customizer-share-help"></p><p class="customizer-share-status" role="status"></p><button class="text-link customizer-reset" type="button" disabled>Restaurar cores iniciais</button></div>
    <p class="customizer-status" role="status">Carregando a prévia…</p></div></div></div></section>`;
}
