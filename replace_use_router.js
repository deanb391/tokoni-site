const fs = require('fs');
const files = [
    "c:/Users/hp/Desktop/Projects/tokoni/context/PostPublishContext.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/components/Header.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/components/ProductCard.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/components/ExpandedPostContainer.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/components/chats/ChatsSidebar.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/signup/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/signin/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/saved/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/profile/[userId]/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/product/[slug]/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/payment/success/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/payment/failed/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/onboarding/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/menu/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/feed/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/dashboard/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/dashboard/subscription/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/dashboard/sponsorship/[id]/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/dashboard/product/sponsor/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/dashboard/post/add/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/dashboard/product/add/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/complete-profile/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/chats/[chatId]/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/auth/callback/page.tsx",
    "c:/Users/hp/Desktop/Projects/tokoni/app/admin/page.tsx"
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    const regex = /import\s+\{([^}]+)\}\s+from\s+['"]next\/navigation['"];?/g;
    
    content = content.replace(regex, (match, importsString) => {
        const imports = importsString.split(',').map(s => s.trim()).filter(s => s.length > 0);
        
        if (imports.includes('useRouter')) {
            const otherImports = imports.filter(i => i !== 'useRouter');
            let replacement = `import { useRouter } from 'nextjs-toploader/app';\n`;
            if (otherImports.length > 0) {
                replacement += `import { ${otherImports.join(', ')} } from 'next/navigation';`;
            }
            return replacement;
        }
        return match; 
    });
    
    fs.writeFileSync(file, content);
});
console.log('Done replacing useRouter');
