// Deterministic seed data with deliberate edge cases (see EDGE_CASES below).
function mulberry(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry(2026);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => Math.round(min + rand() * (max - min));

const COLORS = [
  ['Kasavu Ivory', '#f5ecd0', '#b8860b'],
  ['Temple Maroon', '#7a1f2b', '#e3b448'],
  ['Peacock Teal', '#0f6b6b', '#f0d27a'],
  ['Turmeric', '#e0a21c', '#7a3b00'],
  ['Indigo Night', '#25306b', '#d8c27a'],
  ['Jasmine White', '#f7f5ef', '#0b5d3b'],
  ['Coconut Green', '#2f7d4f', '#f3e3a1'],
  ['Rose Clay', '#c96f6f', '#fff1d6'],
];

const SHAPES = {
  Sarees: 'M62 14h76l10 180H52z',
  'Mundu & Veshti': 'M56 30h88v164H56z',
  Kurtas: 'M72 16h56l32 44-16 20v114H56V80L40 60z',
  'Salwar Suits': 'M72 16h56l28 40-14 20v118H58V76L44 56z',
  Lehengas: 'M76 16h48l8 60 44 118H24l44-118z',
  'Kids Ethnic': 'M80 40h40l24 30-12 14v90H68V84L56 70z',
};

export function art(bg, accent, category) {
  const d = SHAPES[category] || SHAPES.Kurtas;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240"><rect width="200" height="240" fill="#efe6d2"/><path d="${d}" fill="${bg}" stroke="${accent}" stroke-width="4" transform="translate(0 12)"/><path d="M60 170h80" stroke="${accent}" stroke-width="6" transform="translate(0 12)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const SPEC = {
  Sarees: { sizes: ['Free size'], price: [2400, 18500], types: ['Kasavu Saree', 'Set Saree', 'Tissue Saree', 'Handloom Saree'], fabrics: ['Cotton', 'Tissue', 'Silk Blend'] },
  'Mundu & Veshti': { sizes: ['S', 'M', 'L', 'XL', 'XXL'], price: [900, 4200], types: ['Set Mundu', 'Double Mundu', 'Veshti', 'Mundu & Shirt Set'], fabrics: ['Cotton', 'Handloom Cotton'] },
  Kurtas: { sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], price: [1100, 5200], types: ['Straight Kurta', 'Anarkali Kurta', 'Kurta Set', 'Nehru Jacket Kurta'], fabrics: ['Cotton', 'Linen', 'Chanderi'] },
  'Salwar Suits': { sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], price: [1800, 7400], types: ['Salwar Suit', 'Palazzo Suit', 'Churidar Suit'], fabrics: ['Cotton', 'Georgette', 'Crepe'] },
  Lehengas: { sizes: ['XS', 'S', 'M', 'L', 'XL'], price: [6500, 38000], types: ['Festive Lehenga', 'Half Saree', 'Bridal Lehenga'], fabrics: ['Silk', 'Brocade', 'Net'] },
  'Kids Ethnic': { sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'], price: [700, 3200], types: ['Pattu Pavada', 'Kids Kurta Set', 'Kids Mundu Set'], fabrics: ['Cotton', 'Silk Blend'] },
};

function make(id, category) {
  const spec = SPEC[category];
  const [colorName, bg, accent] = pick(COLORS);
  const fabric = pick(spec.fabrics);
  const type = pick(spec.types);
  const price = Math.round(between(...spec.price) / 50) * 50;
  const discounted = rand() < 0.4;
  const reviews = between(0, 240);
  return {
    id,
    name: `${colorName} ${fabric} ${type}`,
    category,
    fabric,
    colorName,
    price,
    mrp: discounted ? Math.round((price * 1.25) / 50) * 50 : price,
    sizes: spec.sizes,
    stock: rand() < 0.1 ? 0 : between(2, 40),
    rating: reviews === 0 ? 0 : Math.round((3.4 + rand() * 1.6) * 10) / 10,
    reviews,
    image: art(bg, accent, category),
    description: `${fabric} ${type.toLowerCase()} in ${colorName.toLowerCase()} with a hand-finished border, made for Kerala festivals and everyday wear.`,
    daysOld: between(1, 400),
  };
}

const plan = [
  ['Sarees', 10],
  ['Mundu & Veshti', 8],
  ['Kurtas', 10],
  ['Salwar Suits', 8],
  ['Lehengas', 6],
  ['Kids Ethnic', 6],
];

let nextId = 1;
const generated = plan.flatMap(([cat, n]) => Array.from({ length: n }, () => make(nextId++, cat)));

// Hand-made edge cases for the UI to survive.
const EDGE_CASES = [
  {
    ...make(1001, 'Sarees'),
    name:
      'Handwoven Balaramapuram Double-Layer Kasavu Heritage Wedding Collection Saree with Real Zari Border, Pallu Tassels, Contrast Blouse Piece and Gift Box Packaging (Limited Festive Edition 2026)',
  },
  { ...make(1002, 'Kurtas'), name: 'Plain Cotton Kurta (photo coming soon)', image: null, description: '', sizes: [] },
  { ...make(1003, 'Salwar Suits'), name: 'Sold-out Chanderi Palazzo Suit', stock: 0, reviews: 0, rating: 0 },
  { ...make(1004, 'Lehengas'), name: 'Royal Bridal Zari Lehenga', price: 124999, mrp: 149999, stock: 2 },
];

export const PRODUCTS = [...generated, ...EDGE_CASES];

export const SIZE_GUIDE = {
  guides: {
    women: {
      label: 'Women (bust, waist, hip)',
      measure: { key: 'chest', label: 'Bust (cm)' },
      columns: [['chest', 'Bust'], ['waist', 'Waist'], ['hip', 'Hip']],
      rows: [
        { size: 'XS', chest: [80, 84], waist: [62, 66], hip: [86, 90] },
        { size: 'S', chest: [85, 89], waist: [67, 71], hip: [91, 95] },
        { size: 'M', chest: [90, 94], waist: [72, 76], hip: [96, 100] },
        { size: 'L', chest: [95, 99], waist: [77, 81], hip: [101, 105] },
        { size: 'XL', chest: [100, 106], waist: [82, 88], hip: [106, 112] },
        { size: 'XXL', chest: [107, 113], waist: [89, 95], hip: [113, 119] },
      ],
    },
    men: {
      label: 'Men (chest, waist)',
      measure: { key: 'chest', label: 'Chest (cm)' },
      columns: [['chest', 'Chest'], ['waist', 'Waist']],
      rows: [
        { size: 'S', chest: [86, 91], waist: [74, 79] },
        { size: 'M', chest: [92, 97], waist: [80, 85] },
        { size: 'L', chest: [98, 103], waist: [86, 91] },
        { size: 'XL', chest: [104, 109], waist: [92, 97] },
        { size: 'XXL', chest: [110, 116], waist: [98, 104] },
      ],
    },
    kids: {
      label: 'Kids (height)',
      measure: { key: 'height', label: 'Height (cm)' },
      columns: [['height', 'Height']],
      rows: [
        { size: '2-3Y', height: [92, 98] },
        { size: '4-5Y', height: [104, 110] },
        { size: '6-7Y', height: [116, 122] },
        { size: '8-9Y', height: [128, 134] },
      ],
    },
  },
  categoryMap: {
    Sarees: 'women',
    'Mundu & Veshti': 'men',
    Kurtas: 'women',
    'Salwar Suits': 'women',
    Lehengas: 'women',
    'Kids Ethnic': 'kids',
    Dupattas: 'women',
  },
};
