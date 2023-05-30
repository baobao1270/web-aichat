import type { APIRoute } from 'astro'
import { getServerEnv } from '@/server-env';
import { connectDb } from '@/models/db'
import type { RedeemToken, User } from '@/models/entity';
import * as argon2 from 'argon2';
import { jwtVerify } from 'jose';

function redirect(location: string) {
    return new Response(null, {
        status: 302,
        headers: {
            location,
        },
    })
}

export const post: APIRoute = async({ request, cookies }) => {
    const dbContext = await connectDb();
    const sessionToken = cookies.get('session_token').value || '';
    if (!sessionToken) return redirect('/login');
    let userEmail = '';
    try {
        const { payload } = await jwtVerify(sessionToken, new TextEncoder().encode(getServerEnv().JWT_KEY));
        userEmail = payload.email as string;
    } catch (e) {
        return redirect('/login');
    }

    const userCollection = dbContext.db.collection<User>('users');
    const user = await userCollection.findOne({ email: userEmail });
    if (!user) return redirect('/login');

    const form = await request.formData();
    const code = (form.get('code') || '') as string;
    if (!code) return redirect('/redeem?error=invalid');
    if (code === '') return redirect('/redeem?error=invalid');
    const redeemTokenCollection = dbContext.db.collection<RedeemToken>('redeemTokens');
    const redeemToken = await redeemTokenCollection.findOne({ code });
    if (!redeemToken) return redirect('/redeem?error=invalid');
    const redeemCodeInDb = redeemToken.code;
    if (redeemCodeInDb !== code) return redirect('/redeem?error=invalid');

    if (redeemToken.remainTimes <= 0) return redirect('/redeem?error=used-up');

    // Substract the remain times
    redeemTokenCollection.updateMany({ code: redeemCodeInDb }, { $set: { remainTimes: redeemToken.remainTimes - 1 } });

    // Add the membership
    let newMembership = user.memberships.filter(m => m.until > new Date());  // First, filter all not expired memberships
    console.log('newMembership post-filter', newMembership);
    if (newMembership.map(m => m.model).includes(redeemToken.model)) {
        // Extend the membership duration
        newMembership = newMembership.map(m => {
            if (m.model === redeemToken.model) {
                return {
                    model: m.model,
                    until: new Date(m.until.getTime() + redeemToken.durationDays * 24 * 60 * 60 * 1000),
                };
            }
            return m;
        });
    } else {
        // Add a new membership
        newMembership.push({
            model: redeemToken.model,
            until: new Date(new Date().getTime() + redeemToken.durationDays * 24 * 60 * 60 * 1000),
        });
    }
    console.log('newMembership post-done', newMembership);
    userCollection.updateMany({ email: userEmail }, { $set: { memberships: newMembership } });

    // By the way, clear the redeem token
    redeemTokenCollection.deleteMany({ remainTimes: 0 });
    return redirect('/redeem?success=true');
}
