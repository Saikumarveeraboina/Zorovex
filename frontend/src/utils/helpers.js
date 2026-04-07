// ── Date & Trial Helpers ─────────────────────────────────────

export const TRIAL_DAYS = 30;

/**
 * Calculate how many trial days are remaining
 * @param {string|Date} trialStart
 * @returns {number} days remaining (0 if expired)
 */
export const getTrialDaysRemaining = (trialStart) => {
  if (!trialStart) return TRIAL_DAYS;
  const start = new Date(trialStart);
  const now = new Date();
  const diffMs = now - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const remaining = TRIAL_DAYS - diffDays;
  return Math.max(0, remaining);
};

/**
 * Check if trial is expired
 */
export const isTrialExpired = (trialStart) => {
  return getTrialDaysRemaining(trialStart) === 0;
};

/**
 * Format a date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format trial end date
 */
export const getTrialEndDate = (trialStart) => {
  if (!trialStart) return '';
  const end = new Date(trialStart);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return formatDate(end);
};

/**
 * Get difficulty color class
 */
export const getDifficultyClass = (difficulty) => {
  const map = {
    Easy: 'badge-easy',
    Medium: 'badge-medium',
    Hard: 'badge-hard',
  };
  return map[difficulty] || 'badge-medium';
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

/**
 * Truncate string
 */
export const truncate = (str, max = 80) =>
  str && str.length > max ? str.slice(0, max) + '…' : str;

/**
 * Parse comma-separated string to array
 */
export const parseCSV = (str) =>
  str
    ? str.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

/**
 * Generate initials from name
 */
export const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
};
