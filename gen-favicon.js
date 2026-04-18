const sharp = require('sharp');
const fs = require('fs');

const src = 'C:/Users/erayc/OneDrive/Desktop/googlepic/telegramkanalicomifsakanallaritelegramifsalar.jpg';

function circleMask(size) {
    const r = size / 2;
    return Buffer.from(
        `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="white"/></svg>`
    );
}

async function run() {
    // icon.png — 512x512 yuvarlak seffaf
    await sharp(src)
        .resize(512, 512, { fit: 'cover', position: 'centre' })
        .composite([{ input: circleMask(512), blend: 'dest-in' }])
        .png()
        .toFile('app/icon.png');
    console.log('icon.png OK');

    // apple-icon.png — 180x180
    await sharp(src)
        .resize(180, 180, { fit: 'cover', position: 'centre' })
        .composite([{ input: circleMask(180), blend: 'dest-in' }])
        .png()
        .toFile('public/apple-icon.png');
    console.log('apple-icon.png OK');

    // favicon.ico — 16/32/48 RGBA
    const sizes = [16, 32, 48];
    const pngs = await Promise.all(sizes.map(s =>
        sharp(src)
            .resize(s, s, { fit: 'cover', position: 'centre' })
            .composite([{ input: circleMask(s), blend: 'dest-in' }])
            .ensureAlpha()
            .png()
            .toBuffer()
    ));

    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(sizes.length, 4);

    const dirs = pngs.map((buf, i) => {
        const e = Buffer.alloc(16);
        e.writeUInt8(sizes[i], 0);
        e.writeUInt8(sizes[i], 1);
        e.writeUInt8(0, 2);
        e.writeUInt8(0, 3);
        e.writeUInt16LE(1, 4);
        e.writeUInt16LE(32, 6);
        e.writeUInt32LE(buf.length, 8);
        return e;
    });

    let offset = 6 + 16 * sizes.length;
    dirs.forEach((e, i) => { e.writeUInt32LE(offset, 12); offset += pngs[i].length; });

    fs.writeFileSync('app/favicon.ico', Buffer.concat([header, ...dirs, ...pngs]));
    console.log('favicon.ico OK — seffaf daire RGBA');
}

run().catch(console.error);
