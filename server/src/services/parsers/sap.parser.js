/**
 * SAP flat-file CSV parser.
 *
 * Format: IDoc-style flat export with German-influenced column names,
 * plant codes, mixed units, and DD.MM.YYYY dates.
 *
 * Relevant movement types for fuel:
 *   201 = goods issue to cost center (fuel consumed)
 *   551 = scrapping / write-off (ignore)
 */
const { parse } = require('csv-parse/sync');
const { SCOPES, SOURCE_TYPES } = require('../../config/constants');
const { FUEL_FACTORS } = require('../../utils/emissionFactors');
const { toLitres } = require('../../utils/unitConverter');

const FUEL_MATERIALS = ['DIESEL', 'PETROL', 'GASOLINE', 'LPG', 'NATURALGAS', 'NAT GAS'];

const parseSapDate = (raw) => {
  if (!raw) return null;
  // DD.MM.YYYY
  const m = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`);
  // YYYYMMDD (SAP internal)
  if (/^\d{8}$/.test(raw)) {
    return new Date(`${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`);
  }
  return new Date(raw);
};

const detectFuelType = (maktx = '') => {
  const text = maktx.toUpperCase();
  for (const f of ['DIESEL', 'PETROL', 'GASOLINE', 'LPG']) {
    if (text.includes(f)) return f.toLowerCase();
  }
  if (text.includes('GAS')) return 'naturalgas';
  return null;
};

const parseSap = (buffer) => {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  const results = [];
  const errors = [];

  records.forEach((row, idx) => {
    try {
      // Only process goods-issue movements for fuel
      if (row.BWART !== '201') return;

      const maktx = (row.MAKTX || '').toUpperCase();
      const isFuel = FUEL_MATERIALS.some((f) => maktx.includes(f));
      if (!isFuel) return;

      const rawQty = parseFloat(row.MENGE);
      if (isNaN(rawQty) || rawQty <= 0) throw new Error('Invalid quantity MENGE');

      const unit = (row.MEINS || '').trim();
      const litres = toLitres(rawQty, unit);
      if (litres === null) throw new Error(`Unknown unit: ${unit}`);

      const fuelType = detectFuelType(row.MAKTX);
      const factor = FUEL_FACTORS[fuelType] || FUEL_FACTORS.diesel;
      const co2eKg = +(litres * factor).toFixed(4);

      const suspicious = co2eKg > 50000; // flag very large single entries

      results.push({
        sourceType: SOURCE_TYPES.SAP,
        scope: SCOPES.SCOPE_1,
        rawData: row,
        description: `${row.MAKTX} — Plant ${row.WERKS} / CC ${row.KOSTL}`,
        date: parseSapDate(row.BLDAT),
        quantity: rawQty,
        unit,
        kgEq: litres,
        factorSource: `DEFRA 2023 – ${fuelType}`,
        co2eKg,
        flagReason: suspicious ? 'Unusually high emission value (>50t CO2e)' : null,
      });
    } catch (e) {
      errors.push({ row: idx + 2, message: e.message });
    }
  });

  return { results, errors };
};

module.exports = { parseSap };
