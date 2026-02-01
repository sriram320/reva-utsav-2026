import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { passes, users, credits } from '@/db/schema'; // Import credits
import { eq, and } from 'drizzle-orm';

// POST /api/passes
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { passType, amountPaid, couponCode, isRevaStudent, srn, department } = body;
        // EXPECTED amountPaid from frontend should match (Price - Credits)

        if (!passType) {
            return NextResponse.json({ error: 'Pass type required' }, { status: 400 });
        }

        const userId = parseInt(session.user.id);

        // Calculate expected price
        let basePrice = 499; // Default
        if (passType === 'Access All Areas') basePrice = 2000;
        if (passType === 'Reva Student') basePrice = 1000;

        // Check for credits
        const userCredits = await db.select().from(credits).where(and(eq(credits.userId, userId), eq(credits.used, false)));
        const totalCredit = userCredits.reduce((sum, c) => sum + c.amount, 0);

        const expectedPrice = Math.max(0, basePrice - totalCredit);

        // Simple validation (Front-end should send final amount, but we verify)
        // Note: strict check might fail if frontend sends something else, so we can be lenient or strict.
        // Let's rely on `amountPaid` passed from frontend but verify it's not LESS than allowed.
        if (parseInt(amountPaid) < expectedPrice) {
            // Allow small margin or just strict? Strict.
            return NextResponse.json({ error: `Invalid amount. Expected ${expectedPrice} but got ${amountPaid}` }, { status: 400 });
        }

        let status = 'active';

        // Reva Student Validation Logic
        if (isRevaStudent) {
            if (!session.user.email?.endsWith('@reva.edu.in')) {
                return NextResponse.json({ error: 'Must use a valid @reva.edu.in email for Reva Student Pass' }, { status: 403 });
            }
            if (!srn || !department) {
                return NextResponse.json({ error: 'SRN and Department are required for Reva Students' }, { status: 400 });
            }

            status = 'pending_verification'; // Scenario 2 & 4

            // Update user profile with SRN/Dept
            await db.update(users)
                .set({ srn, department })
                .where(eq(users.id, userId));
        }

        // Generate unique pass ID
        const passId = `REVA-${passType.toUpperCase().substring(0, 3)}-${Date.now().toString().substring(7)}`;

        // Create pass
        const [newPass] = await db.insert(passes).values({
            userId,
            passType,
            passId,
            amountPaid: parseInt(amountPaid),
            status: status,
            couponCode: couponCode || null
        }).returning();

        // MARK CREDITS AS USED
        if (totalCredit > 0 && status !== 'failed') { // If purchase success
            await db.update(credits)
                .set({ used: true })
                .where(and(eq(credits.userId, userId), eq(credits.used, false)));
        }

        // Return logic
        const responseData: any = {
            success: true,
            pass: newPass,
            message: 'Pass purchased successfully.',
            creditsUsed: totalCredit
        };

        if (status === 'pending_verification') {
            responseData.message = 'Pass purchased used using REVA Email. Pending Admin Approval.';
            // Scenario 4: "Verification Pending"
        } else if (totalCredit > 0) {
            responseData.message += ` Used ₹${totalCredit} in credits!`; // Scenario 4 (Fair Upgrade)
        }

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Pass purchase error:', error);
        return NextResponse.json({ error: 'Failed to purchase pass' }, { status: 500 });
    }
}

// GET /api/passes - Get user's passes
export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userPasses = await db
            .select()
            .from(passes)
            .where(eq(passes.userId, parseInt(session.user.id)));

        return NextResponse.json({ passes: userPasses });
    } catch (error) {
        console.error('Passes GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
