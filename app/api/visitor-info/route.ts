import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    // Get IP from headers (works behind Netlify/Vercel proxy)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || req.headers.get('x-real-ip')
        || req.headers.get('cf-connecting-ip')
        || 'unknown';

    // Get country/city from Netlify/Vercel geo headers
    const country = req.headers.get('x-vercel-ip-country')
        || req.headers.get('x-nf-client-connection-ip')
        || req.headers.get('cf-ipcountry')
        || null;

    const city = req.headers.get('x-vercel-ip-city')
        || null;

    return NextResponse.json({
        ip,
        country,
        city
    });
}
