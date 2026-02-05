const { Client } = require('pg');
const fs = require('fs');

const ref = 'vznjqbneooufjhfkeicd';
const password = 'vkt59ur355s2vMDe';

// Try all known Supabase pooler regions
const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'ap-south-1', 'ca-central-1', 'sa-east-1', 'me-south-1'
];

async function tryConnect(host, port, user) {
  const client = new Client({
    host, port, user,
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });
  try {
    await client.connect();
    const res = await client.query('SELECT 1 as ok');
    await client.end();
    return true;
  } catch (e) {
    return e.message;
  }
}

async function main() {
  // Try all regions with pooler
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    for (const port of [6543, 5432]) {
      const user = `postgres.${ref}`;
      const result = await tryConnect(host, port, user);
      if (result === true) {
        console.log(`SUCCESS: ${host}:${port} user=${user}`);
        return;
      }
      // Only log non-DNS errors
      if (!result.includes('ENOTFOUND') && !result.includes('Tenant')) {
        console.log(`${region}:${port} => ${result}`);
      }
    }
  }
  console.log('No pooler worked. Trying direct...');
  
  // Try direct connection
  const directResult = await tryConnect(`db.${ref}.supabase.co`, 5432, 'postgres');
  console.log(`Direct: ${directResult}`);
}

main().catch(console.error);
