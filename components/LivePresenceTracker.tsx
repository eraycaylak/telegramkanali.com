'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LivePresenceTracker() {
    const hasJoined = useRef(false);

    useEffect(() => {
        if (hasJoined.current) return;
        hasJoined.current = true;

        const visitorId = 'v_' + Math.random().toString(36).substring(2, 10);
        const channel = supabase.channel('site_presence');

        channel
            .on('presence', { event: 'sync' }, () => {
                // Sadece track ediyoruz
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    try {
                        await channel.track({
                            user_id: visitorId,
                            online_at: new Date().toISOString(),
                        });
                    } catch (e) {
                        console.error('Presence track error', e);
                    }
                }
            });

        return () => {
            hasJoined.current = false;
            supabase.removeChannel(channel);
        };
    }, []);

    return null; // Arayüzü olmayan bileşen, her sayfada arkaplanda çalışacak.
}
