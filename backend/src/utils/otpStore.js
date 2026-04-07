// In-memory store for pending registrations awaiting OTP verification
// Structure: email → { name, password, otp, expiresAt }
const pending = new Map();

/**
 * Create a pending registration entry and return the generated OTP.
 * TTL defaults to 10 minutes.
 */
export const createPendingRegistration = (email, { name, password }, ttlMs = 10 * 60 * 1000) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  pending.set(email, { name, password, otp, expiresAt: Date.now() + ttlMs });
  return otp;
};

export const getPendingRegistration = (email) => pending.get(email);

export const deletePendingRegistration = (email) => pending.delete(email);
