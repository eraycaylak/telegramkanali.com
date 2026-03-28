const fs = require('fs');
const path = require('path');

const proxyCode = `
// Dynamically instantiate the client per-request to avoid Vercel build-time caching placeholders
const adminClient = new Proxy({} as any, {
    get: (target, prop) => {
        const client = getAdminClient();
        return client[prop as keyof typeof client];
    }
});
`;

const files = [
    'app/actions/admin.ts',
    'app/actions/trends.ts',
    'app/actions/tokens.ts',
    'app/actions/settings.ts'
];

files.forEach(relativePath => {
    const fullPath = path.join(__dirname, relativePath);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // If the file does not have `const adminClient =`, insert the proxy after imports
        if (!content.includes('const adminClient =')) {
            content = content.replace(/import { getAdminClient } from '@\/lib\/supabaseAdmin';/, 
                `import { getAdminClient } from '@/lib/supabaseAdmin';\n${proxyCode}\n`
            );
            fs.writeFileSync(fullPath, content);
            console.log(`Restored adminClient as a proxy in ${relativePath}`);
        }
    }
});
