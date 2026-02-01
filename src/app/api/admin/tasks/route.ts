
import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { tasks, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/tasks - List tasks
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(req.url);
        const assignedTo = url.searchParams.get('assignedTo');

        let query = db.select({
            id: tasks.id,
            title: tasks.title,
            description: tasks.description,
            status: tasks.status,
            assignedToName: users.name,
            createdAt: tasks.createdAt
        })
            .from(tasks)
            .leftJoin(users, eq(tasks.assignedTo, users.id))
            .orderBy(desc(tasks.createdAt));

        // If filtering by specific user (e.g. Volunteer viewing their own tasks)
        // @ts-ignore
        if (assignedTo) query = query.where(eq(tasks.assignedTo, parseInt(assignedTo)));

        const allTasks = await query;
        return NextResponse.json({ tasks: allTasks });
    } catch (e) { return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 }); }
}

// POST /api/admin/tasks - Assign Task
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { title, description, assignedTo } = await req.json();

        await db.insert(tasks).values({
            title,
            description,
            assignedTo: parseInt(assignedTo as string),
            status: 'Pending'
        });

        return NextResponse.json({ success: true });
    } catch (e) { return NextResponse.json({ error: 'Failed to assign task' }, { status: 500 }); }
}
// PATCH /api/admin/tasks - Update Task Status
export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id, status } = await req.json();
        const taskId = parseInt(id);

        // Check if task exists and ownership
        const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
        if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

        // Volunteers can only mark as "Pending Verification"
        const user = session.user as any;
        if (user.role === 'volunteer') {
            if (task.assignedTo !== parseInt(user.id)) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }
            if (status !== 'Pending Verification') {
                return NextResponse.json({ error: 'Volunteers can only request verification' }, { status: 403 });
            }
        } else if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await db.update(tasks).set({ status }).where(eq(tasks.id, taskId));

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Task update error:", e);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}
