export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates vehicle registration number.
 * Supports Indian format (e.g. TN 01 AB 1234, MH 02 CK 9876) and international alphanumeric plates.
 */
export function isValidRegPlate(reg: string): boolean {
  if (!reg || typeof reg !== 'string') return false;
  const clean = reg.trim().toUpperCase();
  const indianPattern = /^[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{0,3}\s?[0-9]{4}$/;
  const globalPattern = /^[A-Z0-9\s-]{4,14}$/;
  return indianPattern.test(clean) || (globalPattern.test(clean) && clean.length >= 4);
}

export function validateRegPlate(reg: string): ValidationResult {
  if (!reg || !reg.trim()) {
    return { valid: false, error: 'Registration number is required.' };
  }
  if (!isValidRegPlate(reg)) {
    return { valid: false, error: 'Invalid registration format. Example: TN 01 AB 1234.' };
  }
  return { valid: true };
}

/**
 * Validates 17-character ISO VIN (Vehicle Identification Number)
 */
export function isValidVIN(vin: string): boolean {
  if (!vin) return false;
  const clean = vin.trim().toUpperCase();
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(clean);
}

export function validateVIN(vin: string): ValidationResult {
  if (!vin || !vin.trim()) {
    return { valid: false, error: 'Chassis VIN number is required.' };
  }
  if (!isValidVIN(vin)) {
    return { valid: false, error: 'VIN must be exactly 17 alphanumeric characters (excluding letters I, O, Q).' };
  }
  return { valid: true };
}

/**
 * Validates odometer reading (prevents negative mileage, and enforces non-decreasing rule unless authorized)
 */
export function isValidOdometer(
  newOdo: number,
  previousOdo?: number,
  isAuthorizedCorrection: boolean = false
): ValidationResult {
  if (typeof newOdo !== 'number' || isNaN(newOdo)) {
    return { valid: false, error: 'Odometer must be a valid number.' };
  }
  if (newOdo < 0) {
    return { valid: false, error: 'Odometer cannot be negative.' };
  }
  if (previousOdo !== undefined && newOdo < previousOdo && !isAuthorizedCorrection) {
    return {
      valid: false,
      error: `New mileage (${newOdo.toLocaleString()} km) cannot be lower than current vehicle reading (${previousOdo.toLocaleString()} km). Authorized correction required for rollback.`
    };
  }
  return { valid: true };
}

/**
 * Validates financial expenses and service charges (prevents negative costs)
 */
export function isValidCost(amount: number): ValidationResult {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { valid: false, error: 'Amount must be a numeric value.' };
  }
  if (amount < 0) {
    return { valid: false, error: 'Cost cannot be negative.' };
  }
  if (amount > 100000000) {
    return { valid: false, error: 'Amount exceeds permissible transaction ceiling (₹10,00,00,000).' };
  }
  return { valid: true };
}

/**
 * Validates email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validates contact telephone number
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Validates date strings (must be valid ISO or YYYY-MM-DD)
 */
export function isValidDate(dateStr: string): ValidationResult {
  if (!dateStr) {
    return { valid: false, error: 'Date is required.' };
  }
  const timestamp = Date.parse(dateStr);
  if (isNaN(timestamp)) {
    return { valid: false, error: 'Invalid date format.' };
  }
  return { valid: true };
}

/**
 * Validates document expiration date against issue date
 */
export function isValidDocumentExpiry(expiryDate: string, issueDate?: string): ValidationResult {
  const expiryCheck = isValidDate(expiryDate);
  if (!expiryCheck.valid) return expiryCheck;

  if (issueDate) {
    const issueCheck = isValidDate(issueDate);
    if (!issueCheck.valid) return issueCheck;

    const issueTime = new Date(issueDate).getTime();
    const expiryTime = new Date(expiryDate).getTime();

    if (expiryTime <= issueTime) {
      return { valid: false, error: 'Document expiry date must be strictly after the issue date.' };
    }
  }
  return { valid: true };
}

/**
 * Checks for duplicate vehicle registration within the same organization
 */
export function isDuplicateRegPlate(
  plate: string,
  orgId: string,
  vehicles: Array<{ id?: string; registrationNumber: string; organizationId?: string }>,
  currentVehicleId?: string
): boolean {
  const normalized = plate.replace(/\s+/g, '').toUpperCase();
  return vehicles.some(v => {
    if (currentVehicleId && v.id === currentVehicleId) return false;
    const vOrg = v.organizationId || 'org_01';
    if (vOrg !== orgId) return false;
    return v.registrationNumber.replace(/\s+/g, '').toUpperCase() === normalized;
  });
}

/**
 * Validates uploaded files (type and size restrictions)
 */
export function isValidFileUpload(
  file: { name: string; size: number; type?: string },
  maxSizeMb: number = 10
): ValidationResult {
  const maxBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum ${maxSizeMb}MB limit.` };
  }

  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return { valid: false, error: `Unsupported file format (${ext}). Allowed: PDF, JPG, PNG, WEBP.` };
  }

  return { valid: true };
}
