export const STANDARD_MAINTENANCE_CATEGORIES = [
  "Engine Oil",
  "Oil Filter",
  "Air Filter",
  "Fuel Filter",
  "Brake Service",
  "Brake Pad Replacement",
  "Tyre Rotation",
  "Tyre Replacement",
  "Battery",
  "AC Service",
  "Coolant",
  "Transmission",
  "Suspension",
  "Wheel Alignment",
  "General Service",
  "Inspection",
  "Other"
] as const;

export const RECOMMENDED_INTERVALS: Record<string, { months: number; km: number }> = {
  "Engine Oil": { months: 6, km: 10000 },
  "Brake Service": { months: 6, km: 15000 },
  "Tyre Rotation": { months: 6, km: 10000 },
  "General Service": { months: 12, km: 20000 }
};

export const COMMON_PARTS_CATALOG = [
  "Fully Synthetic 5W-30 Oil (4.5L)",
  "OEM Spin-on Oil Filter",
  "High-Flow Air Filter Element",
  "Ceramic Front Brake Pads",
  "Rear Brake Shoe Assembly",
  "Coolant Premix (50/50)"
];
