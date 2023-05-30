export interface OpenAIFetchPayload {
  endpointURL: string
  body: Record<string, any>
  headers: Record<string, string>
  signal?: AbortSignal
}

export const fetchChatCompletion = async(payload: OpenAIFetchPayload) => {
  const initOptions = {
    headers: { ...payload.headers },
    method: 'POST',
    body: JSON.stringify(payload.body),
    signal: payload.signal,
  }
  return fetch(payload.endpointURL, initOptions)
}
