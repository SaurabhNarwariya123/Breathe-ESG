// All factors in kg CO2e per unit
// Sources: DEFRA 2024 (published July 2024), GHG Protocol, CEA India 2023-24
// NOTE: Verify against DEFRA 2026 tables when published (usually June each year)
// DEFRA spreadsheet: https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors

// UK grid average 2024 — DEFRA 2024 (down from 0.233 in 2023 due to more renewables)
const ELECTRICITY_KG_PER_KWH = 0.181;

// India grid average 2023-24 — CEA CO2 baseline document
const ELECTRICITY_KG_PER_KWH_INDIA = 0.708;

const FUEL_FACTORS = {
  diesel: 2.68,      // kg CO2e per litre  — DEFRA 2024 (unchanged)
  petrol: 2.31,      // kg CO2e per litre  — DEFRA 2024 (unchanged)
  gasoline: 2.31,    // alias for petrol (US naming)
  naturalgas: 2.02,  // kg CO2e per m3     — DEFRA 2024 (unchanged)
  lpg: 1.51,         // kg CO2e per litre  — DEFRA 2024 (unchanged)
};

const TRAVEL_FACTORS = {
  // Flights: kg CO2e per passenger-km (includes RFI multiplier x1.9) — DEFRA 2024
  air_short: 0.246,   // < 1500 km  (was 0.255 in 2023 — newer, more efficient aircraft)
  air_long:  0.185,   // >= 1500 km (was 0.195 in 2023)

  // India domestic flights use same DEFRA short-haul factor (no India-specific ICAO data)
  air_india_domestic: 0.246,

  // Hotels: kg CO2e per room-night — DEFRA 2024 (slight reduction from grid decarbonisation)
  hotel: 28.5,        // global average (was 30.0 in 2023)

  // Ground transport — DEFRA 2024 (UK fleet average)
  taxi:  0.189,       // kg CO2e per km (was 0.21 — more EVs/hybrids in fleet)
  car:   0.153,       // kg CO2e per km (was 0.17)
  train: 0.035,       // kg CO2e per km (was 0.041 — UK grid cleaner)
  bus:   0.082,       // kg CO2e per km (was 0.089)

  // India-specific ground transport — GHG Protocol / MoEFCC 2023
  auto_rickshaw: 0.092,  // kg CO2e per km — 3-wheeler petrol (India)
  india_taxi:    0.142,  // kg CO2e per km — smaller cars, India fleet average
  india_train:   0.014,  // kg CO2e per pkm — Indian Railways (electric+diesel mix, very efficient)
  india_bus:     0.045,  // kg CO2e per km — India state bus average
};

module.exports = { ELECTRICITY_KG_PER_KWH, ELECTRICITY_KG_PER_KWH_INDIA, FUEL_FACTORS, TRAVEL_FACTORS };
