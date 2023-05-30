import { For } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { useI18n } from '@/hooks'
import { platformSettingsUIList } from '@/stores/provider'
import { providerSettingsMap, setSettingsByProviderId } from '@/stores/settings'
import ThemeToggle from '../ui/ThemeToggle'
import ProviderGlobalSettings from './ProviderGlobalSettings'
import type { LoginState } from '@/models/entity'
interface Props {
  loginState: LoginState
}

export default ({ loginState }: Props) => {
  const { t } = useI18n()
  const $providerSettingsMap = useStore(providerSettingsMap)

  return (
    <div class="h-full flex flex-col bg-sidebar">
      <header class="h-14 fi border-b border-base px-4 text-xs uppercase">
        {t('settings.title')}
      </header>
      <main class="flex-1 overflow-auto">
        <For each={platformSettingsUIList}>
          {item => (
            <ProviderGlobalSettings
              config={item}
              settingsValue={() => $providerSettingsMap()[item.id]}
              setSettings={v => setSettingsByProviderId(item.id, v)}
            />
          )}
        </For>
        <div class='px-4 py-3 border transition-colors border-b-base border-l-transparent border-r-transparent border-t-transparent leading-6'>
        { loginState.login ? (
          <div>
            <p class='mb-4'>
              用户信息<br />
              <span class='text-sm'>{ loginState.email }</span>
            </p>
            <p class='mb-4'>
              订阅<br />
              { loginState.memberships?.length === 0 ? (
                <span class='text-sm text-gray-500'>您没有订阅任何服务</span>
              ) : (<span />) }
              <For each={loginState.memberships}>
                {item => (
                  <p class='text-sm text-gray-500 mb-1'>
                    { item.model }
                    { (item.until <= new Date()) ? (
                      <span class='text-red-500'> (已过期)</span>
                    ) : (
                      <span class='text-green-500'> (剩余 { Math.floor((item.until.getTime() - (new Date).getTime()) / 86400000) } 天)</span>
                    ) }
                  </p>
                )}
              </For>
            </p>
            <div>
              <a href='/logout' class='hv-foreground text-sm'>
                退出
              </a>
              <span class='px-1'>·</span>
              <a href='/redeem' class='hv-foreground text-sm'>
                兑换
              </a>
              <span class='px-1'>·</span>
              <a href='/store' class='hv-foreground text-sm'>
                商店
              </a>
              <span class='px-1'>·</span>
              <a href='/reset-password' class='hv-foreground text-sm'>
                修改密码
              </a>
            </div>
          </div>
        ) : (
          <div>
            <p class='mb-4'>您未登录</p>
            <div>
              <a href='/login' class='hv-foreground text-sm'>
                登录
              </a>
              <span class='px-1'>·</span>
              <a href='/register' class='hv-foreground text-sm'>
                注册
              </a>
              <span class='px-1'>·</span>
              <a href='/redeem' class='hv-foreground text-sm'>
                兑换
              </a>
              <span class='px-1'>·</span>
              <a href='/store' class='hv-foreground text-sm'>
                商店
              </a>
            </div>
          </div>
        ) }
        </div>
      </main>
      <footer class="h-14 fi justify-between px-3">
        <ThemeToggle />
        <div text-xs op-40 px-2>
          <a href="https://docs.anse.app" target="_blank" rel="noreferrer" class="hv-foreground">
            Docs
          </a>
          <span class="px-1"> · </span>
          <a href="https://github.com/baobao1270/web-aichat" target="_blank" rel="noreferrer" class="hv-foreground">
            Github
          </a>
        </div>
      </footer>
    </div>
  )
}
