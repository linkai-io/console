export let NSRecords = [
  { record: 'NA', value: 0 },
  { record: 'A', value: 1 },
  { record: 'NS', value: 2 },
  { record: 'MD', value: 3 },
  { record: 'MF', value: 4 },
  { record: 'CNAME', value: 5 },
  { record: 'SOA', value: 6 },
  { record: 'MB', value: 7 },
  { record: 'MG', value: 8 },
  { record: 'MR', value: 9 },
  { record: 'NULL', value: 10 },
  { record: 'PTR', value: 12 },
  { record: 'HINFO', value: 13 },
  { record: 'MINFO', value: 14 },
  { record: 'MX', value: 15 },
  { record: 'TXT', value: 16 },
  { record: 'RP', value: 17 },
  { record: 'AFSDB', value: 18 },
  { record: 'X25', value: 19 },
  { record: 'ISDN', value: 20 },
  { record: 'RT', value: 21 },
  { record: 'NSAPPTR', value: 23 },
  { record: 'SIG', value: 24 },
  { record: 'KEY', value: 25 },
  { record: 'PX', value: 26 },
  { record: 'GPOS', value: 27 },
  { record: 'AAAA', value: 28 },
  { record: 'LOC', value: 29 },
  { record: 'NXT', value: 30 },
  { record: 'EID', value: 31 },
  { record: 'NIMLOC', value: 32 },
  { record: 'SRV', value: 33 },
  { record: 'ATMA', value: 34 },
  { record: 'NAPTR', value: 35 },
  { record: 'KX', value: 36 },
  { record: 'CERT', value: 37 },
  { record: 'DNAME', value: 39 },
  { record: 'OPT', value: 41 },
  { record: 'DS', value: 43 },
  { record: 'SSHFP', value: 44 },
  { record: 'RRSIG', value: 46 },
  { record: 'NSEC', value: 47 },
  { record: 'DNSKEY', value: 48 },
  { record: 'DHCID', value: 49 },
  { record: 'NSEC3', value: 50 },
  { record: 'TLSA', value: 52 },
  { record: 'SMIMEA', value: 53 },
  { record: 'HIP', value: 55 },
  { record: 'NINFO', value: 56 },
  { record: 'RKEY', value: 57 },
  { record: 'TALINK', value: 58 },
  { record: 'CDS', value: 59 },
  { record: 'CDNSKEY', value: 60 },
  { record: 'OPENPGPKEY', value: 61 },
  { record: 'CSYNC', value: 62 },
  { record: 'SPF', value: 99 },
  { record: 'UINFO', value: 100 },
  { record: 'UID', value: 101 },
  { record: 'GID', value: 102 },
  { record: 'UNSPEC', value: 103 },
  { record: 'NID', value: 104 },
  { record: 'L32', value: 105 },
  { record: 'L64', value: 106 },
  { record: 'LP', value: 107 },
  { record: 'EUI48', value: 108 },
  { record: 'EUI64', value: 109 },
  { record: 'URI', value: 256 },
  { record: 'CAA', value: 257 },
  { record: 'AVC', value: 258 },
  { record: 'IXFR', value: 251 },
  { record: 'AXFR', value: 252 },
  { record: 'ANY', value: 255 }
];

export function formatWebLink(value) {
  // little sanity check here...
  if (!value.startsWith('http')) {
    return 'about:blank';
  }
  return value;
}

export function formatNSRecord(record) {
  let found = NSRecords.find(e => e.value === record);
  if (found !== null) {
    return found.record;
  }
  return 'Unknown';
}
