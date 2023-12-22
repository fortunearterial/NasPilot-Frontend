<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'
import { useConfirm } from 'vuetify-use-dialog'
import type { Site } from '@/api/types'
import { doneNProgress, startNProgress } from '@/api/nprogress'
import { numberValidator, requiredValidator, urlPathValidator, urlValidator } from '@/@validators'
import api from '@/api'

// 输入参数
const props = defineProps({
  siteid: Number,
  oper: String,
})

// 注册事件
const emit = defineEmits(['save', 'remove', 'close'])

// 站点编辑表单数据
const siteForm = ref<Site>({
  id: props.siteid ?? 0,
  url: '',
  types: [],
  feed: {
    method: 'GET',
    path: '',
    body: '',
    rule: '',
  },
  search: {
    method: 'GET',
    path: '',
    body: '',
    rule: '',
  },
  xpath: '',
  cookie: '',
  ua: '',
  pri: 0,
  is_active: true,
  limit_interval: 0,
  limit_seconds: 0,
  name: '',
  domain: '',
})

// 提示框
const $toast = useToast()

// 确认框
const deleteConfirm = useConfirm()

// 状态下拉项
const statusItems = [
  { title: '启用', value: true },
  { title: '停用', value: false },
]

// 生成1到50的优先级下拉框选项
const priorityItems = ref(
  Array.from({ length: 50 }, (_, i) => i + 1).map(item => ({
    title: item,
    value: item,
  })),
)

// 请求方式下拉框选项
const httpMethodItems = [
  { title: 'HTTP GET', value: 'GET' },
  { title: 'HTTP POST', value: 'POST' },
]

// 订阅方式下拉框选项
const feedMethodItems = [
  { title: 'RSS', value: 'RSS' },
  { title: 'HTTP GET', value: 'GET' },
]

// 适用类型下拉框选项
const mediaTypeItems = [
  { title: '电影', value: 'MOVIE' },
  { title: '电视剧', value: 'TV' },
  { title: '动漫', value: 'ANIME' },
  { title: '游戏', value: 'GAME' },
]

// 下载器下拉框选项
const downloaderItems = [
  { title: 'qBittorrent', value: 'qbittorrent' },
  { title: 'Transmission', value: 'transmission' },
  { title: 'Aria2', value: 'aria2' },
]

// 监控输入参数
watchEffect(async () => {
  if (props.siteid)
    fetchSiteInfo()
})

// 查询站点信息
async function fetchSiteInfo() {
  try {
    siteForm.value = await api.get(`site/${props.siteid}`)
    siteForm.value.proxy = siteForm.value.proxy === 1
    siteForm.value.render = siteForm.value.render === 1
  }
  catch (error) {
    console.error(error)
  }
}

// 调用API 新增站点
async function addSite() {
  if (!siteForm.value?.url)
    return
  startNProgress()
  try {
    const result: { [key: string]: string } = await api.post('site/', siteForm.value)
    if (result.success) {
      $toast.success('新增站点成功')
      emit('save')
    }

    else { $toast.error(`新增站点失败：${result.message}`) }
  }
  catch (error) {
    console.error(error)
  }
  doneNProgress()
}

// 调用API删除站点信息
async function deleteSiteInfo() {
  const isConfirmed = await deleteConfirm({
    title: '确认',
    content: `是否确认删除【${siteForm.value?.name}】?`,
    confirmationText: '确认',
    cancellationText: '取消',
    dialogProps: {
      maxWidth: '50rem',
    },
    confirmationButtonProps: {
      variant: 'tonal',
    },
  })

  if (!isConfirmed)
    return

  try {
    const result: { [key: string]: any } = await api.delete(`site/${siteForm.value?.id}`)
    if (result.success)
      emit('remove')

    else $toast.error(`${siteForm.value?.name} 删除失败：${result.message}`)
  }
  catch (error) {
    $toast.error(`${siteForm.value?.name} 删除失败！`)
    console.error(error)
  }
}

// 调用API更新站点信息
async function updateSiteInfo() {
  startNProgress()
  try {
    const result: { [key: string]: any } = await api.put('site/', siteForm.value)
    if (result.success) {
      $toast.success(`${siteForm.value?.name} 更新成功！`)
      emit('save')
    }
    else { $toast.error(`${siteForm.value?.name} 更新失败：${result.message}`) }
  }
  catch (error) {
    $toast.error(`${siteForm.value?.name} 更新失败！`)
    console.error(error)
  }
  doneNProgress()
}
</script>

<template>
  <VDialog
    scrollable
    max-width="60rem"
  >
    <VCard
      :title="`${props.oper === 'add' ? '新增' : '编辑'}站点${props.oper !== 'add' ? ` - ${siteForm.name}` : ''}`"
      class="rounded-t"
    >
      <DialogCloseBtn @click="emit('close')" />
      <VCardText class="pt-2">
        <VForm @submit.prevent="() => {}">
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="siteForm.name"
                label="站点名称"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              cols="6"
              md="3"
            >
              <VSelect
                v-model="siteForm.is_active"
                :items="statusItems"
                label="状态"
              />
            </VCol>
            <VCol
              cols="6"
              md="3"
            >
              <VSelect
                v-model="siteForm.pri"
                label="优先级"
                :items="priorityItems"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="siteForm.url"
                label="站点地址"
                :rules="[requiredValidator, urlValidator]"
              />
            </VCol>
            <VCol
              cols="6"
              md="3"
            >
              <VSelect
                v-model="siteForm.types"
                label="适用类型"
                multiple
                :items="mediaTypeItems"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              cols="6"
              md="3"
            >
              <VSelect
                v-model="siteForm.downloader"
                label="下载器"
                :items="downloaderItems"
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol v-if="siteForm.feed" cols="3">
              <VSelect
                v-model="siteForm.feed.method"
                label="FEED方式"
                :items="feedMethodItems"
              />
            </VCol>
            <VCol v-if="siteForm.feed" cols="9">
              <VTextField
                v-model="siteForm.feed.path"
                label="FEED地址路径，页码用'{page}'代替"
                :rules="[urlPathValidator]"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol v-if="siteForm.search" cols="3">
              <VSelect
                v-model="siteForm.search.method"
                label="SEARCH方式"
                :items="httpMethodItems"
              />
            </VCol>
            <VCol v-if="siteForm.search" cols="9">
              <VTextField
                v-model="siteForm.search.path"
                label="SEARCH地址路径，搜索关键字用'{keyword}'代替"
                :rules="[urlPathValidator]"
              />
            </VCol>
            <VCol v-if="siteForm.search && siteForm.search.method === 'POST'" cols="12">
              <VTextarea
                v-model="siteForm.search.body"
                label="SEARCH请求体"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextarea
                v-model="siteForm.xpath"
                label="XPATH规则"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextarea
                v-model="siteForm.cookie"
                label="站点Cookie"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="siteForm.ua"
                label="站点User-Agent"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="siteForm.limit_interval"
                label="单位周期（秒）"
                :rules="[numberValidator]"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="siteForm.limit_count"
                label="访问次数"
                :rules="[numberValidator]"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="siteForm.limit_seconds"
                label="访问间隔（秒）"
                :rules="[numberValidator]"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <VSwitch
                v-model="siteForm.proxy"
                label="代理"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VSwitch
                v-model="siteForm.render"
                label="仿真"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <VCardActions>
        <VBtn
          v-if="props.oper === 'add'"
          @click="emit('close')"
        >
          取消
        </VBtn>
        <VBtn
          v-else
          color="error"
          @click="deleteSiteInfo"
        >
          删除
        </VBtn>
        <VSpacer />
        <VBtn
          v-if="props.oper === 'add'"
          color="primary"
          variant="tonal"
          @click="addSite"
        >
          新增
        </VBtn>
        <VBtn
          v-else
          color="primary"
          variant="tonal"
          @click="updateSiteInfo"
        >
          保存
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
