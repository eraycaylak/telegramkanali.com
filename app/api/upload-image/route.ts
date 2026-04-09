import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabaseAdmin';

// Genel amaçlı resim yükleme API'si
// Blog ve Trend admin formları tarafından kullanılır
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'uploads';

        if (!file || !file.size) {
            return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
        }

        // 10MB limit
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'Dosya 10MB limitini aşıyor' }, { status: 400 });
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        if (!allowedExts.includes(ext)) {
            return NextResponse.json({ error: 'Desteklenmeyen dosya türü' }, { status: 400 });
        }

        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { data, error } = await getAdminClient()
            .storage
            .from('assets')
            .upload(fileName, buffer, {
                contentType: file.type || `image/${ext}`,
                cacheControl: '31536000',
                upsert: false,
            });

        if (error) {
            console.error('[UPLOAD-API] Storage error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const { data: urlData } = getAdminClient()
            .storage
            .from('assets')
            .getPublicUrl(data.path);

        return NextResponse.json({ url: urlData.publicUrl });
    } catch (err: any) {
        console.error('[UPLOAD-API] Exception:', err);
        return NextResponse.json({ error: err.message || 'Yükleme hatası' }, { status: 500 });
    }
}
