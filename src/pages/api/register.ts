import type { APIRoute } from 'astro'
import { connectDb } from '@/models/db'
import type { User } from '@/models/entity';
import * as argon2 from 'argon2';

function redirect(location: string = '/register?error=unknown') {
    return new Response(null, {
        status: 302,
        headers: {
            location,
        },
    })
}

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const post: APIRoute = async({ request }) => {
    const dbContext = await connectDb();

    const form = await request.formData();
    const email = (form.get('email') || '') as string;
    const password = (form.get('password') || '') as string;
    const repeatPassword = (form.get('repeat_password') || '') as string;

    if (!email || !password || !repeatPassword) return redirect('/register?error=empty-fields')
    if (password.length < 8) return redirect('/register?error=password-too-short')
    if (password.length > 256) return redirect('/register?error=password-too-long')
    if (email.length > 128) return redirect('/register?error=email-too-long')
    if (!EMAIL_REGEX.test(email)) return redirect('/register?error=invalid-email')
    if (password !== repeatPassword) return redirect('/register?error=passwords-not-match')
    const collection = await dbContext.db.collection<User>('users');
    const user = await collection.findOne<User>({ email });
    if (user) return redirect('/register?error=email-already-exists');
    const passwordHash = await argon2.hash(password);
    await collection.insertOne({
        email, passwordHash,
        memberships: []
    });

    return redirect('/login?success=registered');
}
