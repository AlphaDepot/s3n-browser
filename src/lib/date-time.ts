import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

/**
 * Returns a human-readable string representing the time from the given date to now.
 *
 * @param {Date} [date] - The date to calculate the time from. If not provided, a default message is returned.
 * @returns {string} A string representing the relative time from the given date to now, or a default message if no date is provided.
 */
export const timeFromNow = (date?: Date) => {
  if (!date) {
    return 'No time available';
  }

  dayjs.extend(relativeTime);
  return dayjs(date).fromNow();
};

/**
 * Converts a given number of seconds into a formatted time string (HH:mm:ss).
 *
 * @param {number} seconds - The number of seconds to convert.
 * @returns {string} A string representing the formatted time in HH:mm:ss format.
 */
export const secondsToTime = (seconds: number) => {
  dayjs.extend(duration);
  const dur = dayjs.duration(seconds, 'seconds');
  return `${String(dur.hours()).padStart(2, '0')}:${String(dur.minutes()).padStart(2, '0')}:${String(dur.seconds()).padStart(2, '0')}`;
};
