import Link from 'next/link';

// Temporarily hardcode logo until database is set up properly
export default function DynamicLogo() {
    // TODO: Replace with database fetch when settings table is ready
    const logoUrl = 'https://i.imgur.com/ErzVbOc.png';

    return (
        <Link href="/" className="flex items-center flex-shrink-0 hover:opacity-90 transition">
            <img
                src={logoUrl}
                alt="Telegram Kanalları"
                width={350}
                height={100}
                style={{
                    width: '350px',
                    height: '100px',
                    objectFit: 'contain'
                }}
            />
        </Link>
    );
}
