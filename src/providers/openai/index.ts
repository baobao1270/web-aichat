import {
  handlePrompt,
  handleRapidPrompt,
} from './handler'
import type { Provider } from '@/types/provider'

const providerOpenAI = () => {
  const provider: Provider = {
    id: 'provider-openai',
    icon: 'i-simple-icons-openai', // @unocss-include
    name: 'OpenAI',
    globalSettings: [
      {
        key: 'model',
        name: '模型',
        description: 'AI 模型名称',
        type: 'select',
        options: [
          { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' },
          { value: 'gpt-3.5-turbo-0301', label: 'gpt-3.5-turbo-0301' },
          { value: 'azure-gpt-35-turbo', label: 'azure-gpt-35-turbo (VIP)' },
          // { value: 'gpt-4', label: 'gpt-4' },
          // { value: 'gpt-4-0314', label: 'gpt-4-0314' },
          // { value: 'gpt-4-32k', label: 'gpt-4-32k' },
          // { value: 'gpt-4-32k-0314', label: 'gpt-4-32k-0314' },
        ],
        default: 'gpt-3.5-turbo',
      },
      {
        key: 'temperature',
        name: '话痨度',
        type: 'slider',
        description: '话痨度越低，AI 说话越简洁，反之说话越详细。默认值为 1。',
        min: 0,
        max: 2,
        default: 0.7,
        step: 0.01,
      }
    ],
    bots: [
      {
        id: 'chat_continuous',
        type: 'chat_continuous',
        name: 'Continuous Chat',
        settings: [],
      }
    ],
    handlePrompt,
    handleRapidPrompt,
  }
  return provider
}

export default providerOpenAI
