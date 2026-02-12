/**
 * Pace calculation utilities for running and cycling
 * Pace = duration (minutes) / distance = min per unit (mi or km)
 */

/**
 * Parse duration string (HH:MM:SS, MM:SS, or minutes) to total minutes
 * @param {string|number} duration - "42:30", "1:05:00", or 42.5
 * @returns {number} Total minutes
 */
export const parseDurationToMinutes = (duration) => {
  if (typeof duration === 'number' && !isNaN(duration)) {
    return duration;
  }
  if (typeof duration !== 'string') return 0;
  const parts = duration.trim().split(':').map(Number);
  if (parts.length === 1) return parts[0] || 0;
  if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
  if (parts.length === 3) return (parts[0] || 0) * 60 + (parts[1] || 0) + (parts[2] || 0) / 60;
  return 0;
};

/**
 * Format minutes as MM:SS
 * @param {number} totalMinutes
 * @returns {string} "8:24"
 */
export const formatPace = (totalMinutes) => {
  const totalSeconds = Math.round(totalMinutes * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate average pace from distance and duration
 * @param {number} distance - Distance in miles or km
 * @param {number} durationMinutes - Total duration in minutes
 * @param {'mi'|'km'} unit - Distance unit
 * @returns {{ paceMinPerUnit: number, formatted: string, unitLabel: string }|null}
 */
export const calculatePace = (distance, durationMinutes, unit = 'mi') => {
  if (!distance || distance <= 0 || !durationMinutes || durationMinutes <= 0) {
    return null;
  }
  const paceMinPerUnit = durationMinutes / distance;
  const unitLabel = unit === 'mi' ? 'min/mi' : 'min/km';
  return {
    paceMinPerUnit,
    formatted: `${formatPace(paceMinPerUnit)} ${unitLabel}`,
    unitLabel
  };
};
