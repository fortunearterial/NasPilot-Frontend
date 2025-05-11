<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { api, localApi } from '@/api'

const { t } = useI18n()

// 从 provide 中获取全局设置
const globalSettings: any = inject('globalSettings')

// 系统环境变量
const localSystemEnv = ref<any>({})

// 是否在线
const isOnline = ref(false)

// 延时
const ping = ref(0)

// 弹窗
const appsMenu = ref(false)

// 查询客户端在线状态
async function queryClientStatus() {
  setInterval(async () => {
    try {
      let date = new Date()
      const result: { [key: string]: any } = await localApi.get('system/global', {
        params: {
          token: 'naspilot',
        },
      })

      localSystemEnv.value = result.data
      isOnline.value = true
      ping.value = new Date().getTime() - date.getTime()
    } catch (error) {
      console.log(error)
      isOnline.value = false
      ping.value = 0
    }
  }, 5000)
}

// 下载 Agent
function downloadAgent() {
  window.open(`https://naspilot.oss-cn-shanghai.aliyuncs.com/naspilot-${globalSettings?.VERSION}.zip`, '_blank')
}

// 启动 Agent
function startAgent() {
  window.open(`naspilot://`, '_blank')
}

onMounted(() => {
  queryClientStatus()
})
</script>

<template>
  <VMenu v-model="appsMenu" width="400" transition="scale-transition" close-on-content-click class="agent-menu" scrim>
    <!-- Menu Activator -->
    <template #activator="{ props }">
      <IconBtn v-if="isOnline" v-bind="props">
        <VIcon icon="mdi-play" class="text-success" />
      </IconBtn>
      <IconBtn v-else v-bind="props">
        <VIcon icon="mdi-stop" class="text-error" />
      </IconBtn>
    </template>
    <!-- Menu Content -->
    <VCard>
      <VCardItem class="py-3">
        <VCardTitle>{{ t('agent.title') }}</VCardTitle>
        <template #append>
          <IconBtn @click="appsMenu = false">
            <VIcon icon="mdi-close" />
          </IconBtn>
        </template>
      </VCardItem>
      <VDivider />
      <div class="agent-list-container">
        <div class="h-full overflow-y-auto">
          <VListItem lines="two" class="mb-1">
            <template #prepend>
              <VAvatar rounded>
                <VIcon icon="mdi-laptop" size="large"></VIcon>
              </VAvatar>
            </template>
            <div>
              <div class="text-body-1 text-high-emphasis break-words whitespace-break-spaces">
                {{ t('agent.title') }} {{ localSystemEnv?.VERSION }}
              </div>
              <div class="text-caption mt-1.5">
                {{ isOnline ? t('agent.online') : t('agent.offline') }}
              </div>
              <div v-if="isOnline" class="text-sm text-primary mt-1.5">PING: {{ ping }} ms</div>
            </div>
          </VListItem>
        </div>
      </div>
      <VDivider />
      <div class="pa-3">
        <div class="grid grid-cols-2 gap-3">
          <VCard
            flat
            class="pa-2 d-flex align-center cursor-pointer transition-transform duration-300 hover:-translate-y-1 border h-full"
            hover
            @click="downloadAgent()"
          >
            <VAvatar variant="text" size="48" rounded="lg">
              <VIcon color="primary" icon="mdi-download" size="24" />
            </VAvatar>
            <div>
              <div class="text-body-1 text-high-emphasis font-weight-medium">{{ t('agent.download') }}</div>
              <div class="text-caption text-medium-emphasis">{{ globalSettings?.VERSION }}</div>
            </div>
          </VCard>
          <VCard
            flat
            class="pa-2 d-flex align-center cursor-pointer transition-transform duration-300 hover:-translate-y-1 border h-full"
            hover
            @click="startAgent()"
          >
            <VAvatar variant="text" size="48" rounded="lg">
              <VIcon color="primary" icon="mdi-play" size="24" />
            </VAvatar>
            <div>
              <div class="text-body-1 text-high-emphasis font-weight-medium">{{ t('agent.start') }}</div>
            </div>
          </VCard>
        </div>
      </div>
    </VCard>
  </VMenu>
</template>

<style scoped>
.agent-list-container {
  overflow: hidden;
  max-block-size: 50vh;
}
</style>
