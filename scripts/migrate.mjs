import postgres from 'postgres';
import { readFile } from 'node:fs/promises';
const sql=postgres(process.env.DATABASE_URL,{ssl:'require',max:1});
try { await sql.unsafe(await readFile(new URL('../db/schema.sql',import.meta.url),'utf8')); console.log('Lead database ready.'); } finally { await sql.end(); }
