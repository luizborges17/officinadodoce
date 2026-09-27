# Base de materiais da personalização

Arquivo utilizado: `public/images/personalizacao/base-materiais.webp` (900 × 900, WebP sem perdas).

Criado com a ferramenta integrada `image_gen` a partir de `public/images/modifica/f6557afc-d0b2-4876-9621-d7e4366a5e94.jfif`. A referência do usuário permanece preservada. A interface identifica a nova imagem como uma prévia ilustrativa criada com IA.

A imagem técnica usa papel vermelho e fita azul sobre fundo neutro. Essas cores não são exibidas ao visitante: `src/material-renderer.js` separa as contribuições dos materiais em luz linear, troca suas cores e mantém as variações de iluminação. Não há caminhos desenhados, contornos ampliados, stroke nem máscaras geométricas. A prévia final é montada no navegador, incluindo cores livres.

Ao substituir esta base, manter a codificação de materiais, o fundo neutro e ausência de reflexos coloridos entre superfícies. Uma fotografia comum não é intercambiável com esta base técnica sem preparação.

Prompt utilizado:

Use case: precise-object-edit. Input image is an edit target and reference of a single wrapped Brazilian bem-casado. Create a realistic product photo for a color customization application. Preserve the original package silhouette, small squat square sweet size, crinkled crepe-paper texture, bow with satin loops and hanging tails, three-quarter angle and natural lighting. Reframe the product larger centered in a square 1024x1024 composition, with comfortable clear margins around the ENTIRE bow and package. CRITICAL TECHNICAL MATERIAL COLORS: change ALL the paper material to vivid deeply saturated PURE RED (red channel high, green and blue very low), change ALL the ribbon, knot, loops and tails to vivid deeply saturated PURE BLUE (blue channel high, red and green very low). These are temporary segmentation colors to be recolored in code. Keep red-paper and blue-ribbon materials clearly separated, perfectly natural contact boundaries with no outline strokes. Fine subtle paper creases, true satin directional highlights and realistic occlusion shadows. BACKGROUND AND TABLE must be entirely achromatic light neutral gray, neutral gray contact shadow, white neutral light, NO beige, NO warm cast, NO red or blue reflected color spill on background or shadows, NO colored reflection from one material onto the other. Do not add decoration, labels, lettering, logos, extra objects, colored borders or cartoon rendering. Photorealism, crisp fine material texture. Preserve structure of the reference as much as possible.
