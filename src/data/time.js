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

export function unixTimeToMinDate(sec) {
  if (sec === undefined || sec === 0) {
    return 'Unknown time';
  }
  let d = new Date(0);
  d.setSeconds(sec, 0);
  return formatMinDate(d);
}

export function unixTimeToMinMonthDayTime(sec) {
  if (sec === undefined || sec === 0) {
    return 'Unknown time';
  }
  let d = new Date(0);
  d.setSeconds(sec, 0);
  return (
    [d.getMonth() + 1, d.getDate()].join('/') +
    ' ' +
    [
      d.getHours(),
      new String(d.getMinutes()).padStart(2, '0'),
      new String(d.getSeconds()).padStart(2, '0')
    ].join(':')
  );
}

export function unixNanoToMinMonthDay(ns) {
  if (ns === undefined || ns === 0) {
    return 'Unknown time';
  }
  let d = new Date(ns / 1000000);
  return formatMinMonthDay(d);
}

export function formatMinMonthDay(dateValue) {
  return (
    [dateValue.getMonth() + 1, dateValue.getDate()].join('/') +
    ' ' +
    [
      dateValue.getHours(),
      new String(dateValue.getMinutes()).padStart(2, '0'),
      new String(dateValue.getSeconds()).padStart(2, '0')
    ].join(':')
  );
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
