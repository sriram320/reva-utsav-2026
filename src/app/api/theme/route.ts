import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const [themeColorSetting] = await db.select()
            .from(settings)
            .where(eq(settings.key, 'theme_color'))
            .limit(1);

        const themeColor = themeColorSetting?.value || '#F7941D';

        // Generate CSS with the custom theme color
        const css = `
:root {
    --secondary: ${themeColor};
    --accent: ${themeColor};
}
        `.trim();

        return new NextResponse(css, {
            headers: {
                'Content-Type': 'text/css',
                'Cache-Control': 'public, max-age=60', // Cache for 1 minute
            },
        });
    } catch (error) {
        console.error('Theme API error:', error);
        // Return default theme on error
        return new NextResponse(':root { --secondary: #F7941D; --accent: #F7941D; }', {
            headers: {
                'Content-Type': 'text/css',
            },
        });
    }
}
