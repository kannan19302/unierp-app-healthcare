// One-off cutover: copy field-service rows from the core UniERP database into
// this service's own database. Idempotent (upsert by id). Run per environment:
//   CORE_DATABASE_URL=... DATABASE_URL=... node scripts/migrate-from-core.mjs
import pg from 'pg';

const CORE = process.env.CORE_DATABASE_URL;
const OWN = process.env.DATABASE_URL;
if (!CORE || !OWN) {
  console.error('Set CORE_DATABASE_URL and DATABASE_URL');
  process.exit(1);
}

const TABLES = [
  'patients',
  'practitioners',
  'appointments',
  'prescriptions',
  'drug_register',
  'medical_encounters',
];

const core = new pg.Client({ connectionString: CORE });
const own = new pg.Client({ connectionString: OWN });
await core.connect();
await own.connect();

// Cutover may run after core already archived its tables (_archived_*).
async function coreTable(t) {
  const r = await core.query(`SELECT to_regclass('${t}') x`);
  return r.rows[0].x ? t : `"_archived_${t}"`;
}

for (const table of TABLES) {
  const { rows } = await core.query(`SELECT * FROM ${await coreTable(table)}`);
  let copied = 0;
  for (const row of rows) {
    const cols = Object.keys(row);
    const params = cols.map((_, i) => `$${i + 1}`).join(', ');
    const updates = cols.filter((c) => c !== 'id').map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ');
    await own.query(
      `INSERT INTO ${table} (${cols.map((c) => `"${c}"`).join(', ')}) VALUES (${params})
       ON CONFLICT (id) DO UPDATE SET ${updates}`,
      cols.map((c) => row[c]),
    );
    copied++;
  }
  const { rows: [{ count }] } = await own.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
  console.log(`${table}: copied ${copied} (core) -> ${count} rows (service)`);
  if (count < rows.length) {
    console.error(`Row count mismatch on ${table}!`);
    process.exitCode = 1;
  }
}

await core.end();
await own.end();
console.log('Done.');
