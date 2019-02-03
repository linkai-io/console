import { formatDate } from 'fullcalendar';

export function unixNanoToDate(ns) {
  if (ns === undefined || ns === 0) {
    return 'Unknown time';
  }
  return new Date(ns / 1000000).toString();
}

export function unixNanoToMinDate(ns) {
  if (ns === undefined || ns === 0) {
    return 'Unknown time';
  }
  let d = new Date(ns / 1000000);
  return formatMinDate(d);
}

export function unixTimeToMinDate(ms) {
  if (ms === undefined || ms === 0) {
    return 'Unknown time';
  }
  let d = new Date();
  d.setMilliseconds(ms);
  return formatMinDate(d);
}

export function formatMinDate(dateValue) {
  return (
    [
      dateValue.getFullYear(),
      dateValue.getMonth() + 1,
      dateValue.getDate()
    ].join('/') +
    ' ' +
    [
      dateValue.getHours(),
      new String(dateValue.getMinutes()).padStart(2, '0'),
      new String(dateValue.getSeconds()).padStart(2, '0')
    ].join(':')
  );
}
