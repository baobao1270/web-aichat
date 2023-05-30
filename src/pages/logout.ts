import type { APIRoute } from 'astro'

export const get: APIRoute = async({ cookies }) => {
    cookies.delete('session_token', { path: '/' });
    return new Response(null, {
        status: 302,
        headers: {
            location: '/',
        },
    })
}
