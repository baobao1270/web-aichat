import { callProviderHandler } from '@/logics/conversation'
import type { APIRoute } from 'astro'
import type { HandlerPayload } from '@/types/provider'
import type { ErrorMessage } from '@/types/message'
import { jwtVerify } from 'jose'
import { getServerEnv } from '@/server-env'
import { connectDb } from '@/models/db'
import type { User } from '@/models/entity'

function humanFriendlyError(header: any, message: any, status: number = 500) {
  return new Response(JSON.stringify({ error: { code: header, message } }), { status })
}

export const post: APIRoute = async({ params, request, cookies }) => {
  const providerId = params.provider as string
  const body = await request.json() as HandlerPayload

  try {
    const sessionToken = cookies.get('session_token').value || ''
    try {
      const { payload } = await jwtVerify(sessionToken, new TextEncoder().encode(getServerEnv().JWT_KEY))
      const email = payload.email as string
      const dbContext = await connectDb()
      const collection = dbContext.db.collection<User>('users')
      const user = await collection.findOne({ email })
      if (!user) {
        return humanFriendlyError(
          '登录验证失败',
          '您尚未登录或登录信息损坏。找不到您的用户名，您是否已经注销账户？如果不是，请点击右侧边栏按钮重新登录，如果问题仍然存在，请清除浏览器缓存后重试。',
          403,
        )
      }
      const permissions = user.memberships.filter(m => m.until > new Date()).map(m => m.model)
      if (body.globalSettings.model) {
        if (!permissions.includes(body.globalSettings.model as string)) {
          return humanFriendlyError(
            '您没有权限访问该模型',
            '您没有权限访问该模型。请购买兑换码并点击右侧边栏按钮兑换，如果您已购买并兑换，请清除浏览器缓存再登录重试。',
            401,
          )
        }
      }
    } catch (e) {
      return humanFriendlyError(
        '登录验证失败',
        '您尚未登录或登录信息损坏。请点击右侧边栏按钮重新登录，如果问题仍然存在，请清除浏览器缓存后重试。',
        403,
      )
    }

    if (!providerId) throw new Error('Provider ID is required')
    const providerResponse = await callProviderHandler(providerId, body)
    const isStream = providerResponse instanceof ReadableStream
    return new Response(providerResponse, {
      headers: {
        'Content-Type': isStream ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8',
      },
    })
  } catch (e) {
    const error = e as Error
    const cause = error?.cause as ErrorMessage
    console.error(e)
    return new Response(JSON.stringify({
      error: cause,
    }), {
      status: 500,
    })
  }
}
