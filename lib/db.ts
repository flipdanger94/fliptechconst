import postgres from 'postgres';
let connection: ReturnType<typeof postgres> | undefined;
export function db() { if(!process.env.DATABASE_URL) throw new Error('Lead storage is not configured.'); return connection ??= postgres(process.env.DATABASE_URL,{max:3,ssl:'require',prepare:false}); }
