import { OpenAIFetchPayload, fetchChatCompletion } from './api'
import { parseStream } from './parser'
import type { HandlerPayload, Provider } from '@/types/provider'

export const handlePrompt: Provider['handlePrompt'] = async (payload, signal?: AbortSignal) => {
  if (payload.botId === 'chat_continuous')
    return handleChatCompletion(payload, signal)
  if (payload.botId === 'chat_single')
    return handleChatCompletion(payload, signal)
}

export const handleRapidPrompt: Provider['handleRapidPrompt'] = async (prompt, globalSettings) => {
  const rapidPromptPayload = {
    conversationId: 'temp',
    conversationType: 'chat_single',
    botId: 'temp',
    globalSettings: {
      ...globalSettings,
      model: 'gpt-3.5-turbo',
      temperature: 0.4,
      maxTokens: 2048,
      top_p: 1,
      stream: false,
    },
    botSettings: {},
    prompt,
    messages: [{ role: 'user', content: prompt }],
  } as HandlerPayload
  const result = await handleChatCompletion(rapidPromptPayload)
  if (typeof result === 'string')
    return result
  return ''
}

const handleChatCompletion = async (payload: HandlerPayload, signal?: AbortSignal) => {
  console.log('handleChatCompletion', payload)

  const isAzure = (payload.globalSettings.model as string).startsWith('azure')
  const model = isAzure
    ? (payload.globalSettings.model as string).substring("azure-".length)
    : (payload.globalSettings.model as string)
  const apiKey = isAzure
    ? process.env.AZURE_API_KEY
    : process.env.OPENAI_API_KEY
  const fetchOptions: OpenAIFetchPayload = isAzure
    ? { // isAzure === true
      endpointURL: `https://luotianyi-openai.openai.azure.com/openai/deployments/${model.replace(/\./g, '-')}/chat/completions?api-version=2023-05-15`,
      body: {
        messages: payload.messages,
        temperature: payload.globalSettings.temperature as number,
      },
      headers: {
        'Content-Type': 'application/json',
        'api-key': `${apiKey}`,
      },
      signal
    }
    : { // isAzure === false
      endpointURL: 'https://api.openai.com/v1/chat/completions',
      body: {
        model,
        messages: payload.messages,
        temperature: payload.globalSettings.temperature as number,
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      signal
    }

  const response = await fetchChatCompletion(fetchOptions)
  if (!response.ok) {
    const responseJson = await response.json()
    console.log('responseJson', responseJson)
    const errMessage = responseJson.error?.message || response.statusText || 'Unknown error'
    throw new Error(errMessage, { cause: responseJson.error })
  }
  const isStream = response.headers.get('content-type')?.includes('text/event-stream')
  if (isStream) {
    return parseStream(response)
  } else {
    const resJson = await response.json()
    return resJson.choices[0].message.content as string
  }
}
