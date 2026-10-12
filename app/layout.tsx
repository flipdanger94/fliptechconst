import type { Metadata } from 'next';
import './globals.css';
import { site } from '@/lib/config';
import { AnalyticsConsent } from '@/components/analytics';
export const metadata: Metadata={ metadataBase:new URL(site.url),title:{default:'Construction Website Design for US Contractors | FLIPTECH',template:'%s | FLIPTECH'},description:'Modern, mobile-friendly websites for US contractors and remodeling companies. Work directly with Alexander Push. Request a free 3-point website review.',openGraph:{type:'website',siteName:'FLIPTECH',locale:'en_US',images:[{url:'/opengraph-image',width:1200,height:630}]},twitter:{card:'summary_large_image'},robots:{index:!!process.env.NEXT_PUBLIC_SITE_URL,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<AnalyticsConsent/></body></html>}
