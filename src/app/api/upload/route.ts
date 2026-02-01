
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
    try {
        const data = await req.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = file.name.split('.').pop();
        const filename = `proof-${uniqueSuffix}.${ext}`;

        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'verification');
        await mkdir(uploadDir, { recursive: true });

        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Return the public URL
        const url = `/uploads/verification/${filename}`;
        return NextResponse.json({ url });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
