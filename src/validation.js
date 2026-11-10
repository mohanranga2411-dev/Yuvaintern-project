// Shared by the form and the mock API so client and "server" agree on the rules.
export const STEP_KEYS = ['personal', 'measurements', 'delivery'];

const inRange = (value, min, max) => {
  if (value === '' || value === undefined || value === null) return false;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
};

export function validateStep(step, v) {
  const e = {};
  if (step === 'personal') {
    if (!v.fullName?.trim() || v.fullName.trim().length < 2) e.fullName = 'Enter your full name (at least 2 characters).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email || '')) e.email = 'Enter a valid email address, for example name@example.com.';
    if (!/^[6-9]\d{9}$/.test(v.phone || '')) e.phone = 'Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.';
  }
  if (step === 'measurements') {
    if (!v.category) e.category = 'Choose the garment type you shop for most.';
    if (!inRange(v.chest, 50, 150)) e.chest = 'Enter chest or bust between 50 and 150 cm.';
    if (!inRange(v.waist, 40, 150)) e.waist = 'Enter waist between 40 and 150 cm.';
    if (!inRange(v.height, 80, 220)) e.height = 'Enter height between 80 and 220 cm.';
    if (!v.fit) e.fit = 'Choose how you like your clothes to fit.';
  }
  if (step === 'delivery') {
    if (!v.address?.trim() || v.address.trim().length < 10) e.address = 'Enter your full address (at least 10 characters).';
    if (!v.city?.trim()) e.city = 'Enter your city.';
    if (!/^[1-9]\d{5}$/.test(v.pincode || '')) e.pincode = 'Enter a 6-digit PIN code, for example 695001.';
    if (!v.consent) e.consent = 'Please agree to save your details so we can use them.';
  }
  return e;
}

export function validateAll(v) {
  return STEP_KEYS.reduce((acc, s) => ({ ...acc, ...validateStep(s, v) }), {});
}

export const EMPTY_PROFILE = {
  fullName: '',
  email: '',
  phone: '',
  category: '',
  chest: '',
  waist: '',
  height: '',
  fit: '',
  address: '',
  city: 'Thiruvananthapuram',
  pincode: '',
  consent: false,
};
