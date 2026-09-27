// Preparar o arquivo antes do clique mantém a ativação exigida pelo compartilhamento nativo.
export function combinationCard(canvas, { company, paper, ribbon, whatsapp }) {
  const card = document.createElement('canvas');
  card.width = 1000; card.height = 1210;
  const ctx = card.getContext('2d');
  ctx.fillStyle = '#faf7f0'; ctx.fillRect(0, 0, card.width, card.height);
  ctx.fillStyle = '#644335'; ctx.font = '36px Georgia';
  ctx.fillText(company, 50, 60);
  ctx.drawImage(canvas, 50, 95, 900, 900);
  ctx.font = '26px Arial';
  ctx.fillText(`Papel: ${paper}`, 50, 1040, 900);
  ctx.fillText(`Fita: ${ribbon}`, 50, 1082, 900);
  ctx.font = '18px Arial';
  ctx.fillText('Prévia ilustrativa. Cores e materiais sujeitos à confirmação.', 50, 1130, 900);
  if (whatsapp) ctx.fillText(`WhatsApp da ${company}: +${whatsapp}`, 50, 1165, 900);
  return card;
}

export function setupCombinationSharing(section) {
  const share = section.querySelector('.customizer-share');
  const download = section.querySelector('.customizer-download');
  const help = section.querySelector('.customizer-share-help');
  const status = section.querySelector('.customizer-share-status');
  let file, text, generation = 0;
  function invalidate() {
    generation++;
    file = null;
    share.disabled = download.disabled = true;
    status.textContent = '';
  }
  function prepare(canvas, description) {
    const version = generation;
    const card = combinationCard(canvas, description);
    card.toBlob(blob => {
      if (version !== generation) return;
      if (!blob) { status.textContent = 'Não foi possível gerar a imagem. Altere uma cor para tentar novamente.'; return; }
      file = new File([blob], `bem-casado-${description.paperHex.slice(1)}-${description.ribbonHex.slice(1)}.png`, { type: 'image/png' });
      text = description.message;
      let compatible = false;
      try { compatible = !!navigator.share && !!navigator.canShare?.({ files: [file] }); } catch { /* Usar download. */ }
      share.hidden = !compatible;
      share.disabled = false;
      download.disabled = false;
      help.textContent = compatible
        ? 'Compartilhe a imagem e a mensagem: escolha o WhatsApp e selecione a conversa da Officina do Doce. Você também pode baixar o print para anexar.'
        : 'Para enviar com a imagem: baixe o print, abra a conversa pelo botão do WhatsApp e anexe o arquivo baixado. O link de conversa leva apenas a mensagem de texto.';
    }, 'image/png');
  }
  share.addEventListener('click', async () => {
    if (!file) return;
    share.disabled = true;
    try {
      await navigator.share({ files: [file], text, title: 'Meu bem-casado — Officina do Doce' });
      status.textContent = 'Compartilhamento aberto. Confira a imagem, a mensagem e o destinatário no aplicativo escolhido.';
    } catch (error) {
      status.textContent = error.name === 'AbortError'
        ? 'Compartilhamento cancelado. Sua combinação continua aqui.'
        : 'O compartilhamento não foi concluído. Baixe o print e anexe na conversa do WhatsApp.';
    } finally { share.disabled = !file; }
  });
  download.addEventListener('click', () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url; link.download = file.name;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    status.textContent = 'Print preparado para download. Anexe o arquivo na conversa do WhatsApp junto à mensagem.';
  });
  return { invalidate, prepare };
}
