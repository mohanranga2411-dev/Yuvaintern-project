export const PAGE_SIZE = 12;

export const CATEGORIES = [
  'Sarees',
  'Mundu & Veshti',
  'Kurtas',
  'Salwar Suits',
  'Lehengas',
  'Kids Ethnic',
  'Dupattas',
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free size', '2-3Y', '4-5Y', '6-7Y', '8-9Y'];

export const SORTS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'new', label: 'Newest' },
  { value: 'name', label: 'Name A to Z' },
];

export const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
