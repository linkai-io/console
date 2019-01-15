export function unixNanoToDate(ns) {
  if (ns === undefined || ns === 0) {
    return 'Unknown time';
  }
  return new Date(ns / 1000000).toString();
}
