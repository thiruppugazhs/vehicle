export function isValidRegPlate(reg: string): boolean {
  // Standard Indian and global alphanumeric registration syntax
  const pattern = /^[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{0,3}\s?[0-9]{4}$/i;
  return pattern.test(reg.trim()) || reg.trim().length >= 5;
}

export function isValidVIN(vin: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin.trim());
}
