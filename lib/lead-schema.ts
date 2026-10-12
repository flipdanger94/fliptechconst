import { z } from 'zod';
export const leadSchema = z.object({
 fullName: z.string().trim().min(2,'Please enter your full name.').max(100),
 email: z.email('Please enter a valid work email.').max(254),
 company: z.string().trim().min(2,'Please enter your company name.').max(150),
 requestType: z.enum(['review','new']),
 website: z.string().trim().max(500).default(''),
 phone: z.string().trim().max(40).default(''),
 details: z.string().trim().max(3000).default(''),
 consent: z.boolean().refine(v=>v,'Please agree to the Privacy Policy.'),
 honeypot: z.string().max(0).default(''),
 requestId: z.uuid(),
 source: z.string().max(1000).default(''),
 utm: z.record(z.string().max(80),z.string().max(200)).default({}),
}).superRefine((v,ctx)=> { if(v.requestType==='review' && !/^https?:\/\//i.test(v.website)) ctx.addIssue({code:'custom',path:['website'],message:'Enter your website URL, starting with https://.'}); if(v.website){try{const u=new URL(v.website);if(!['https:','http:'].includes(u.protocol)||!u.hostname.includes('.'))throw Error();}catch{ctx.addIssue({code:'custom',path:['website'],message:'Enter a valid public website URL.'});}} });
export type LeadInput = z.input<typeof leadSchema>;
