/**
 * Utility / electricity CSV parser.
 *
 * Format: portal CSV export from a utility provider.
 * Billing periods don't align with calendar months; we store the period
 * start as activityDate and handle partial-month overlap in reporting.
 *
 * Units expected: kWh, MWh, GWh.
 */
const { parse } = require('csv-parse/sync');
const { SCOPES, SOURCE_TYPES } = require('../../config/constants');
const { ELECTRICITY_KG_PER_KWH } = require('../../utils/emissionFactors');
const { toKwh } = require('../../utils/unitConverter');

const parseUtility = (buffer) => {
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
      const rawQty = parseFloat(row.kwh_consumed || row.consumption || row.energy_kwh);
      if (isNaN(rawQty) || rawQty <= 0) throw new Error('Missing or invalid consumption value');

      const unit = (row.unit || 'kWh').trim();
      const kwh = toKwh(rawQty, unit);
      if (kwh === null) throw new Error(`Unknown energy unit: ${unit}`);

      const co2eKg = +(kwh * ELECTRICITY_KG_PER_KWH).toFixed(4);
      const suspicious = kwh > 500000; // >500 MWh for a single billing row

      results.push({
        sourceType: SOURCE_TYPES.UTILITY,
        scope: SCOPES.SCOPE_2,
        rawData: row,
        description: `Electricity – ${row.site_name || row.account_number || 'Unknown site'}`,
        date: row.billing_period_start ? new Date(row.billing_period_start) : null,
        quantity: rawQty,
        unit,
        kgEq: kwh,
        factorSource: 'DEFRA 2023 – UK grid electricity (0.233 kg CO2e/kWh)',
        co2eKg,
        flagReason: suspicious ? 'Very high consumption (>500 MWh) – verify meter data' : null,
      });
    } catch (e) {
      errors.push({ row: idx + 2, message: e.message });
    }
  });

  return { results, errors };
};

module.exports = { parseUtility };
