// Genera drizzle/migrations.js con el SQL de cada migración incluido como texto.
// Así la app no depende de plugins de Babel ni de configuraciones especiales de Metro.
// Se ejecuta después de "drizzle-kit generate" (ver script db:generate en package.json).
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'drizzle');
const journalPath = path.join(dir, 'meta', '_journal.json');

if (!fs.existsSync(journalPath)) {
  console.error('No existe drizzle/meta/_journal.json. Ejecuta primero: npx drizzle-kit generate');
  process.exit(1);
}

const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
const migrations = {};

for (const entry of journal.entries) {
  const key = `m${String(entry.idx).padStart(4, '0')}`;
  migrations[key] = fs.readFileSync(path.join(dir, `${entry.tag}.sql`), 'utf8');
}

const out =
  '// Archivo generado por scripts/inline-migrations.js. No editar a mano.\n' +
  `export default ${JSON.stringify({ journal, migrations }, null, 2)};\n`;

fs.writeFileSync(path.join(dir, 'migrations.js'), out);
console.log(`drizzle/migrations.js generado (${journal.entries.length} migración/es)`);
