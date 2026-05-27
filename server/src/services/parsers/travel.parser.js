/**
 * Corporate travel CSV parser.
 *
 * Format: Concur/Navan-style expense export.
 * Categories: air, hotel, ground (taxi/car/train/bus).
 *
 * Distances: sometimes given, sometimes only airport codes.
 * When distance is absent for flights we use a lookup table of
 * common city-pair great-circle distances.
 */
const { parse } = require('csv-parse/sync');
const { SCOPES, SOURCE_TYPES } = require('../../config/constants');
const { TRAVEL_FACTORS } = require('../../utils/emissionFactors');

// Approximate great-circle distances (km) for common airport pairs
// keyed as "ORIG-DEST" (alphabetical order for symmetric lookup)
const AIRPORT_DISTANCE_KM = {
  'BOM-DEL': 1150, 'BLR-DEL': 1740, 'BOM-BLR': 980,
  'BOM-HYD': 710,  'DEL-HYD': 1250, 'BLR-HYD': 500,
  'LHR-JFK': 5540, 'LHR-CDG': 340,  'JFK-LAX': 3980,
  'DXB-BOM': 1930, 'DXB-DEL': 2200, 'SIN-BOM': 5200,
};

const airportKey = (a, b) => [a, b].sort().join('-');

const getFlightDistance = (origin, dest) => {
  if (!origin || !dest) return null;
  return AIRPORT_DISTANCE_KM[airportKey(origin.toUpperCase(), dest.toUpperCase())] || null;
};

const calcFlightCo2 = (distanceKm) => {
  if (!distanceKm) return null;
  const factor = distanceKm < 1500 ? TRAVEL_FACTORS.air_short : TRAVEL_FACTORS.air_long;
  return +(distanceKm * factor).toFixed(4);
};

const parseTravel = (buffer) => {
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
      const category = (row.category || '').toLowerCase();
      let co2eKg = null;
      let description = '';
      let quantity = null;
      let unit = '';

      if (category === 'air') {
        const distKm = parseFloat(row.distance_km) || getFlightDistance(row.origin, row.destination);
        if (!distKm) throw new Error('Flight distance unknown and airport pair not in lookup table');
        co2eKg = calcFlightCo2(distKm);
        quantity = distKm;
        unit = 'km';
        description = `Flight ${row.origin || '?'} → ${row.destination || '?'}`;

      } else if (category === 'hotel') {
        const nights = parseFloat(row.nights || row.quantity);
        if (isNaN(nights) || nights <= 0) throw new Error('Invalid hotel nights');
        co2eKg = +(nights * TRAVEL_FACTORS.hotel).toFixed(4);
        quantity = nights;
        unit = 'nights';
        description = `Hotel: ${row.hotel_name || row.destination || 'Unknown'}`;

      } else if (['taxi', 'car', 'train', 'bus', 'ground'].includes(category)) {
        const distKm = parseFloat(row.distance_km || row.quantity);
        if (isNaN(distKm) || distKm <= 0) throw new Error('Invalid ground distance');
        const factor = TRAVEL_FACTORS[category] || TRAVEL_FACTORS.taxi;
        co2eKg = +(distKm * factor).toFixed(4);
        quantity = distKm;
        unit = 'km';
        description = `Ground (${category}): ${row.origin || ''} → ${row.destination || ''}`;

      } else {
        throw new Error(`Unknown travel category: ${category}`);
      }

      results.push({
        sourceType: SOURCE_TYPES.TRAVEL,
        scope: SCOPES.SCOPE_3,
        rawData: row,
        description,
        date: row.travel_date ? new Date(row.travel_date) : null,
        quantity,
        unit,
        kgEq: quantity,
        factorSource: `DEFRA 2023 / GHG Protocol – ${category}`,
        co2eKg,
        flagReason: null,
      });
    } catch (e) {
      errors.push({ row: idx + 2, message: e.message });
    }
  });

  return { results, errors };
};

module.exports = { parseTravel };
