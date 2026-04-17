import UsdtPaymentsClient from './UsdtPaymentsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'USDT Ödemeleri | Admin Panel',
};

export const dynamic = 'force-dynamic';

export default function UsdtPaymentsPage() {
    return <UsdtPaymentsClient />;
}
