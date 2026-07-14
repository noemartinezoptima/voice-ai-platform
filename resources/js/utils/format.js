export function formatDuration(seconds) {
  if (!seconds || seconds < 0) {
    return '0s';
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
