// Convert various units to a canonical kg equivalent for emission calculation

const LITRE_TO_GALLON = 0.264172;
const GALLON_TO_LITRE = 3.78541;
const M3_TO_LITRE = 1000;

const toKg = (quantity, unit) => {
  const u = unit.toLowerCase().trim();
  if (u === 'kg' || u === 'kgs') return quantity;
  if (u === 'g' || u === 'grams') return quantity / 1000;
  if (u === 'ton' || u === 'tonne' || u === 'mt') return quantity * 1000;
  if (u === 'lb' || u === 'lbs') return quantity * 0.453592;
  return null;
};

const toLitres = (quantity, unit) => {
  const u = unit.toLowerCase().trim();
  if (u === 'l' || u === 'litre' || u === 'litres' || u === 'liter' || u === 'liters') return quantity;
  if (u === 'gal' || u === 'gallon' || u === 'gallons') return quantity * GALLON_TO_LITRE;
  if (u === 'm3' || u === 'cbm') return quantity * M3_TO_LITRE;
  if (u === 'ml') return quantity / 1000;
  return null;
};

const toKwh = (quantity, unit) => {
  const u = unit.toLowerCase().trim();
  if (u === 'kwh') return quantity;
  if (u === 'mwh') return quantity * 1000;
  if (u === 'gwh') return quantity * 1_000_000;
  if (u === 'kj') return quantity / 3600;
  if (u === 'mj') return (quantity * 1000) / 3600;
  return null;
};

module.exports = { toKg, toLitres, toKwh };
