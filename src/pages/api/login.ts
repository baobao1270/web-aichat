import type { APIRoute } from 'astro'
import { getServerEnv } from '@/server-env';
import { connectDb } from '@/models/db'
import type { User } from '@/models/entity';
import * as argon2 from 'argon2';
import { SignJWT } from 'jose';

function redirect(location: string = '/login?error=invalid-email-or-password') {
    return new Response(null, {
        status: 302,
        headers: {
            location,
        },
    })
}

export const post: APIRoute = async({ request, cookies }) => {
    const dbContext = await connectDb();

    const form = await request.formData();
    const email = (form.get('email') || '') as string;
    const password = (form.get('password') || '') as string;

    const collection = dbContext.db.collection<User>('users');
    const user = await collection.findOne({ email });
    if (!user) return redirect();
    const passwordCorrect = await argon2.verify(user.passwordHash, password)
    if (!passwordCorrect) return redirect();

    const token = await new SignJWT({ email })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(new TextEncoder().encode(getServerEnv().JWT_KEY));
    
    cookies.set('session_token', token, { httpOnly: true, path: '/' });
    return redirect('/');
}
