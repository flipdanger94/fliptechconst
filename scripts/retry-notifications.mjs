import postgres from 'postgres';import {Resend} from 'resend';
for(const k of ['DATABASE_URL','RESEND_API_KEY','EMAIL_FROM','LEAD_NOTIFICATION_EMAIL'])if(!process.env[k])throw new Error(`Missing ${k}`);
const sql=postgres(process.env.DATABASE_URL,{ssl:'require',max:1});const resend=new Resend(process.env.RESEND_API_KEY);
try{
 const rows=await sql`SELECT * FROM leads WHERE notification_status IN ('pending','failed') ORDER BY created_at LIMIT 50`;
 let sent=0;for(const v of rows){const r=await resend.emails.send({from:process.env.EMAIL_FROM,to:process.env.LEAD_NOTIFICATION_EMAIL,replyTo:v.email,subject:'FLIPTECH: new website inquiry',text:`Name: ${v.full_name}\nCompany: ${v.company}\nEmail: ${v.email}\nType: ${v.request_type}\nWebsite: ${v.website}\nPhone: ${v.phone}\nDetails: ${v.details}`},{idempotencyKey:v.id});if(!r.error){await sql`UPDATE leads SET notification_status='sent',notified_at=NOW() WHERE id=${v.id}`;sent++;}}
 await sql`DELETE FROM lead_rate_limits WHERE expires_at<NOW()`;
 console.log(`Notifications sent: ${sent}; processed: ${rows.length}.`);
}finally{await sql.end();}
