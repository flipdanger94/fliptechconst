import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { Resend } from 'resend';
import { db } from '@/lib/db';
import { leadSchema } from '@/lib/lead-schema';
export const runtime='nodejs';
export async function POST(req: Request) {
 const origin=req.headers.get('origin');
 if(!origin || origin!==new URL(req.url).origin) return NextResponse.json({error:'This request is not allowed.'},{status:403});
 if(!req.headers.get('content-type')?.includes('application/json')) return NextResponse.json({error:'Expected JSON.'},{status:415});
 if(Number(req.headers.get('content-length')||0)>16000) return NextResponse.json({error:'Request is too large.'},{status:413});
 const raw=await req.text(); if(raw.length>16000)return NextResponse.json({error:'Request is too large.'},{status:413});
 let json;try{json=JSON.parse(raw)}catch{return NextResponse.json({error:'Invalid request.'},{status:400})}
 const parsed=leadSchema.safeParse(json);
 if(!parsed.success)return NextResponse.json({error:'Please check your form fields.'},{status:400});
 if(!process.env.DATABASE_URL || !process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !process.env.LEAD_NOTIFICATION_EMAIL) return NextResponse.json({error:'The request service is not configured yet. Please try again later.'},{status:503});
 const v=parsed.data;
 try {
 const sql=db();
 const existing=await sql`SELECT id FROM leads WHERE id=${v.requestId}`;
 if(existing.length)return NextResponse.json({ok:true});
 // Durable email-based throttling avoids trusting arbitrary client IP headers.
 const key=createHash('sha256').update(v.email.toLowerCase()).digest('hex');
 const limit=await sql`INSERT INTO lead_rate_limits (key,expires_at) VALUES (${key},NOW()+INTERVAL '1 hour') ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN lead_rate_limits.expires_at<NOW() THEN 1 ELSE lead_rate_limits.attempts+1 END, expires_at=CASE WHEN lead_rate_limits.expires_at<NOW() THEN NOW()+INTERVAL '1 hour' ELSE lead_rate_limits.expires_at END RETURNING attempts`;
 if(limit[0].attempts>4)return NextResponse.json({error:'Too many requests. Please try again in an hour.'},{status:429});
 await sql`INSERT INTO leads(id,full_name,email,company,request_type,website,phone,details,consent,source,utm) VALUES(${v.requestId},${v.fullName},${v.email.toLowerCase()},${v.company},${v.requestType},${v.website},${v.phone},${v.details},true,${v.source},${sql.json(v.utm)}) ON CONFLICT(id) DO NOTHING`;
 const sent=await new Resend(process.env.RESEND_API_KEY).emails.send({from:process.env.EMAIL_FROM,to:process.env.LEAD_NOTIFICATION_EMAIL,replyTo:v.email,subject:'FLIPTECH: new website inquiry',text:`Name: ${v.fullName}\nCompany: ${v.company}\nEmail: ${v.email}\nType: ${v.requestType}\nWebsite: ${v.website}\nPhone: ${v.phone}\nDetails: ${v.details}`},{idempotencyKey:v.requestId});
 await sql`UPDATE leads SET notification_status=${sent.error?'failed':'sent'},notified_at=${sent.error?null:new Date()} WHERE id=${v.requestId}`;
 // Storage is authoritative: notification failure must not lose or duplicate a lead.
 return NextResponse.json({ok:true});
 } catch { return NextResponse.json({error:'We could not save your request. Please try again.'},{status:500}); }
}
