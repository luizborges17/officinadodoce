import { productImages } from './product-images.js';

// Edite aqui os conteúdos e os canais de contato.
export const site = {
  name: 'Officina do Doce',
  logo: '/images/logo/ChatGPT Image 13 de set. de 2026, 19_48_01.png',
  whatsapp: '5516991547539',
  instagram: 'https://www.instagram.com/officina.do.doce/',
  region: '',
  message: 'Ola Vim atraves do site',
  customizer: {
    image: '/images/personalizacao/base-materiais.webp',
    paper: '#493024',
    ribbon: '#e6cda0',
    colors: {
      paper: [
        { name: 'Chocolate', value: '#493024' },
        { name: 'Champanhe', value: '#e6cda0' },
        { name: 'Marfim', value: '#f5efdf' },
        { name: 'Rosé', value: '#dca5ad' },
        { name: 'Verde sálvia', value: '#95a58b' },
        { name: 'Azul sereno', value: '#8aa9c4' },
        { name: 'Bordô', value: '#792f43' },
        { name: 'Branco', value: '#ffffff' },
        { name: 'Azul claro', value: '#add8e6' },
        { name: 'Azul Royal', value: '#4169e1' },
        { name: 'Verde', value: '#438c4a' },
        { name: 'Vermelho', value: '#c92b32' },
        { name: 'Amarelo', value: '#f5d34f' },
        { name: 'Rosa bebê', value: '#f3c4d3' },
        { name: 'Verde pistache', value: '#b3c583' },
        { name: 'Rosa cereja', value: '#de3163' },
        { name: 'Rose gold', value: '#b76e79' },
        { name: 'Marsala', value: '#80434b' }
      ],
      ribbon: [
        { name: 'Branco', value: '#ffffff' },
        { name: 'Palha', value: '#e6cda0' },
        { name: 'Verde pistache', value: '#b3c583' },
        { name: 'Verde musgo', value: '#667047' },
        { name: 'Vermelho', value: '#c92b32' },
        { name: 'Rosa', value: '#e4a0b7' },
        { name: 'Pink', value: '#e83e8c' },
        { name: 'Azul claro', value: '#add8e6' },
        { name: 'Azul marinho', value: '#203864' },
        { name: 'Marrom', value: '#493024' },
        { name: 'Dourada', value: '#c7a34b' },
        { name: 'Fendi', value: '#a89b8c' },
        { name: 'Salmão', value: '#eaa18f' }
      ]
    }
  },
  hero: { image: productImages['bem-casados'][0], alt: 'Bem-casados da Officina do Doce', illustrative: false },
  about: {
    image: productImages['bem-casados'][1], alt: 'Detalhes dos bem-casados da Officina do Doce', illustrative: false,
    text: 'Acreditamos que celebrar é uma forma de guardar o que importa. Um encontro, um abraço, uma nova história. E a doçura faz parte dessas lembranças.',
    detail: 'Na Officina do Doce, nossos bem-casados acompanham momentos especiais com delicadeza e cuidado em cada detalhe. Uma lembrança para compartilhar carinho com quem faz parte da sua história.'
  },
  products: [
    { id: 'bem-casados', title: 'Bem-casados', description: 'Um gesto de carinho para compartilhar a felicidade de um novo começo. Conheça nossos bem-casados e encontre inspiração para a sua celebração.', flavorNote: 'Disponíveis nos sabores tradicional e laranja. O bem-casado de laranja é um lançamento original da Officina do Doce.', images: productImages['bem-casados'] }
  ]
};

export function whatsappUrl(number, message = site.message) {
  const digits = number.replace(/\D/g, '');
  return /^\d{10,15}$/.test(digits) ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : '';
}
export function instagramUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && ['instagram.com', 'www.instagram.com'].includes(url.hostname) && url.pathname.length > 1 ? url.href : ''; } catch { return ''; }
}
