# Officina do Doce

Site responsivo dedicado à divulgação e encomenda de bem-casados, com Vite, JavaScript e CSS. A página reúne apresentação, carrossel de fotos de bem-casados, sobre e contato.

## Executar e publicar

```sh
npm install
npm run dev
npm run build
```

O servidor informa a URL local. A versão publicável fica em `dist/`; publique essa pasta em hospedagem estática com HTTPS. `npm run preview` permite conferir o build.

## Editar

Os conteúdos estão em `src/config.js`: bem-casados, descrições, imagens, apresentação, WhatsApp, Instagram e região. Coloque as fotos em `public/images/bem-casados/` (também aceita subpastas). A lista `src/product-images.js` é gerada automaticamente ao iniciar o servidor, construir ou testar o projeto. Durante `npm run dev`, adicionar ou remover imagens também atualiza a lista. Em produção, gere um novo build e publique para incluir arquivos novos. Formatos: JPEG, JPG, JFIF, PNG, WebP, AVIF e GIF.

- `logo`: caminho do logotipo configurado, exibido sem recorte junto ao nome da empresa.
- `whatsapp`: número internacional com DDD. Quando válido, ativa o link com a mensagem inicial do briefing. Enquanto vazio, os links de orçamento levam à seção de contato, que informa a futura disponibilização do canal.
- `instagram`: URL HTTPS completa do perfil. Só aparece se válida.
- `region`: cidade e região, ocultas enquanto vazias.
- `illustrative`: mantenha `true` em imagens geradas. Troque para `false` ao inserir fotos reais autorizadas e atualize o texto alternativo.

O logotipo, o WhatsApp e o Instagram já estão configurados. Não foram inventados sabores, preços, prazos, depoimentos ou história institucional.

## Personalização de cores

A seção **Personalize** usa uma base fotográfica criada com IA a partir da referência em `public/images/modifica/` para simular separadamente a cor do papel e da fita. Há cores sugeridas, seletores de cor livre, restauração das cores iniciais e envio da combinação (nomes e códigos HEX) no link de orçamento pelo WhatsApp. O site não envia mensagens automaticamente.

Imagem e cores iniciais ficam em `site.customizer`, em `src/config.js`. As paletas são independentes: `colors.paper` contém as cores dos papéis e `colors.ribbon` as cores das fitas. A prévia é aproximada e não confirma disponibilidade de materiais. O processamento acontece no navegador, sem upload. O renderizador em `src/material-renderer.js` troca as cores dos materiais em luz linear, preservando textura, sombras e reflexos, sem contornos desenhados. A base usa cores técnicas de identificação e não deve ser substituída diretamente por uma foto comum. Detalhes e prompt em `docs/personalizacao.md`.

Os testes verificam mudanças independentes do papel e da fita, preservação de um ponto do fundo, restauração e mensagem de orçamento.

### Print e WhatsApp

A combinação gera um PNG local com a prévia, nomes e códigos das cores e contato da empresa. O botão **Compartilhar imagem e mensagem** aparece quando o navegador aceita compartilhar arquivos pela Web Share API (HTTPS em produção). O visitante escolhe WhatsApp e a conversa da Officina do Doce no menu do dispositivo; esse compartilhamento não fixa automaticamente o destinatário. O suporte a texto junto ao arquivo depende do aplicativo receptor, por isso as cores também ficam escritas na própria imagem.

**Baixar print da combinação** fica disponível como alternativa: baixe, abra a conversa pelo botão do WhatsApp e anexe o PNG manualmente. O link `wa.me` contém somente texto. O site não envia arquivos ou mensagens automaticamente e não utiliza servidor para armazenar os prints. Cancelar o compartilhamento não perde a seleção.

Referência técnica: [Web Share API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API).

## Verificação

Com o servidor em `http://127.0.0.1:5173`:

```sh
npx playwright install chromium
npm test
```

Testes do carrossel de bem-casados, teclado, menu móvel, contatos, remoção das demais categorias e ausência de rolagem horizontal em 320, 390, 768, 1024 e 1440 px. Capturas em `test-results/` (ignorado pelo Git).

Fotos de bem-casados fornecidas pela empresa, com carregamento tardio abaixo do destaque; Google Fonts com fontes alternativas locais. Não há formulário, rastreamento, carrinho ou pagamento: as encomendas são tratadas pelo WhatsApp. Os arquivos de imagens das antigas categorias permanecem preservados no projeto, mas não são exibidos no site.
