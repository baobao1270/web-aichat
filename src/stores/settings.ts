import { action, atom, map } from 'nanostores'
import { db } from './storage/settings'
import { getProviderById, providerMetaList } from './provider'
import type { SettingsPayload } from '@/types/provider'

export const providerSettingsMap = map<Record<string, SettingsPayload>>({})
export const globalAbortController = atom<AbortController | null>(null)

export const rebuildSettingsStore = async() => {
  const exportData = await db.exportData()
  const defaultData = defaultSettingsStore()
  const data: Record<string, SettingsPayload> = {}
  providerMetaList.forEach((provider) => {
    data[provider.id] = {
      ...defaultData[provider.id] || {},
      ...exportData?.[provider.id] || {},
    }
  })
  data.general = exportData?.general || {}
  providerSettingsMap.set(data)
}

export const getSettingsByProviderId = (id: string) => {
  return providerSettingsMap.get()[id] || {}
}

export const setSettingsByProviderId = action(
  providerSettingsMap,
  'setSettingsByProviderId',
  (map, id: string, payload: SettingsPayload) => {
    const mergedSettings = {
      ...defaultSettingsByProviderId(id),
      ...payload,
    }
    map.setKey(id, mergedSettings)
    db.setItem(id, mergedSettings)
  },
)

export const defaultSettingsStore = () => {
  const defaultSettings: Record<string, SettingsPayload> = {}
  providerMetaList.forEach((provider) => {
    defaultSettings[provider.id] = defaultSettingsByProviderId(provider.id)
  })
  return defaultSettings
}

export const defaultSettingsByProviderId = (id: string) => {
  const provider = getProviderById(id)
  if (!provider || !provider.globalSettings)
    return {}
  const globalSettings = provider.globalSettings
  const defaultSettings: SettingsPayload = {}
  globalSettings.forEach((setting) => {
    if (setting.default)
      defaultSettings[setting.key] = setting.default
  })
  return defaultSettings
}
