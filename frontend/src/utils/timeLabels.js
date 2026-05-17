export function formatDueDate(value) {
  if (!value) {
    return 'Not set';
  }

  const sourceDate = new Date(value);

  if (Number.isNaN(sourceDate.getTime())) {
    return 'Invalid date';
  }

  // The project demo is Pakistan-based; use PKT so emulator timezone differences
  // do not show a correct deadline with the wrong AM/PM label.
  const pakistanOffsetMs = 5 * 60 * 60 * 1000;
  const date = new Date(sourceDate.getTime() + pakistanOffsetMs);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const hours24 = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;

  return `${day} ${month}, ${hours12}:${minutes} ${period} PKT`;
}

export function formatTimeRemaining(value, status) {
  if (!value) {
    return 'No deadline';
  }

  if (status === 'Resolved') {
    return 'Completed';
  }

  const diffMs = new Date(value).getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const hours = Math.floor(absMs / (60 * 60 * 1000));
  const minutes = Math.floor((absMs % (60 * 60 * 1000)) / (60 * 1000));
  const label = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return diffMs < 0 ? `Overdue by ${label}` : `${label} remaining`;
}

export function isComplaintOverdue(complaint) {
  return Boolean(
    complaint?.dueAt &&
      complaint.status !== 'Resolved' &&
      new Date(complaint.dueAt).getTime() < Date.now(),
  );
}
