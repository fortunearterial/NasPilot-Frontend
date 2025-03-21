<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'
import type { DownloaderConf, Site } from '@/api/types'
import { doneNProgress, startNProgress } from '@/api/nprogress'
import { numberValidator, requiredValidator } from '@/@validators'
import { mediaTypeItems, httpOptions } from '@/api/constants'
import api from '@/api'
import { useDisplay } from 'vuetify'
import { useConfirm } from 'vuetify-use-dialog'

// 显示器宽度
const display = useDisplay()

// 确认框
const createConfirm = useConfirm()

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
  rss: '',
  cookie: '',
  ua: '',
  pri: 0,
  is_active: true,
  limit_interval: 0,
  limit_seconds: 0,
  name: '',
  domain: '',
  downloader: '',
  types: [],
  rss_mapping: '',
  browse: '',
  browse_config: {
    fields: {
    },
  },
  search: '',
  search_config: {
    fields: {
    },
  },
})

// 提示框
const $toast = useToast()

// 维护类型
const siteType = ref('cookie')

// 是否限流
const isLimit = ref(false)

// 状态下拉项
const statusItems = [
  { title: '启用', value: true },
  { title: '停用', value: false },
]

// 生成1到50的优先级下拉框选项
const priorityItems = ref(
  Array.from({ length: 100 }, (_, i) => i + 1).map(item => ({
    title: item,
    value: item,
  })),
)

// 下载器选项
const downloaderOptions = ref<{ title: string; value: string }[]>([])

// 配置类型
const configType = ref('rss')

async function loadDownloaderSetting() {
  try {
    const downloaders: DownloaderConf[] = await api.get('download/clients')
    downloaderOptions.value = [
      { title: '默认', value: '' },
      ...downloaders.map((item: { name: any }) => ({
        title: item.name,
        value: item.name,
      })),
    ]
  } catch (error) {
    console.error('加载下载器设置失败:', error)
  }
}

// 查询站点信息
async function fetchSiteInfo() {
  try {
    siteForm.value = await api.get(`site/${props.siteid}`)
    siteForm.value.proxy = siteForm.value.proxy === 1
    siteForm.value.render = siteForm.value.render === 1
  } catch (error) {
    console.error(error)
  }
}

// 调用API 新增站点
async function addSite() {
  if (!siteForm.value?.url) return
  startNProgress()
  try {
    const result: { [key: string]: string } = await api.post('site/', siteForm.value)
    if (result.success) {
      $toast.success('新增站点成功')
      emit('save')
    } else {
      $toast.error(`新增站点失败：${result.message}`)
    }
  } catch (error) {
    console.error(error)
  }
  doneNProgress()
}

// 调用API删除站点信息
async function deleteSiteInfo() {
  const isConfirmed = await createConfirm({
    title: '确认',
    content: `是否确认删除站点？`,
  })

  if (!isConfirmed) return

  try {
    const result: { [key: string]: any } = await api.delete(`site/${siteForm.value?.id}`)
    if (result.success) emit('remove')
    else $toast.error(`${siteForm.value?.name} 删除失败：${result.message}`)
  } catch (error) {
    $toast.error(`${siteForm.value?.name} 删除失败！`)
    console.error(error)
  }
}

// 调用API更新站点信息
async function updateSiteInfo() {
  startNProgress()
  try {
    if (isLimit.value) {
      siteForm.value.limit_interval = siteForm.value.limit_interval || 0
      siteForm.value.limit_count = siteForm.value.limit_count || 0
      siteForm.value.limit_seconds = siteForm.value.limit_seconds || 0
    } else {
      siteForm.value.limit_interval = 0
      siteForm.value.limit_count = 0
      siteForm.value.limit_seconds = 0
    }
    const result: { [key: string]: any } = await api.put('site/', siteForm.value)
    if (result.success) {
      $toast.success(`${siteForm.value?.name} 更新成功！`)
      emit('save')
    } else {
      $toast.error(`${siteForm.value?.name} 更新失败：${result.message}`)
    }
  } catch (error) {
    $toast.error(`${siteForm.value?.name} 更新失败！`)
    console.error(error)
  }
  doneNProgress()
}

async function syncFromBrowse() {
  siteForm.value.search_config = JSON.parse(JSON.stringify(siteForm.value.browse_config))
}

onMounted(async () => {
  if (props.oper !== 'add') {
    await fetchSiteInfo()
    if (siteForm.value.limit_interval || siteForm.value.limit_count || siteForm.value.limit_seconds)
      isLimit.value = true
    if (siteForm.value.apikey) siteType.value = 'api'
  }
  await loadDownloaderSetting()
})
</script>

<template>
  <VDialog scrollable :close-on-back="false" persistent eager max-width="50rem" :fullscreen="!display.mdAndUp.value">
    <VCard
      :title="`${props.oper === 'add' ? '新增' : '编辑'}站点${props.oper !== 'add' ? ` - ${siteForm.name}` : ''}`"
      class="rounded-t"
    >
      <DialogCloseBtn @click="emit('close')" />
      <VDivider />
      <VCardText>
        <VForm @submit.prevent="() => {}">
          <VRow>
            <VCol cols="12" md="6">
              <VTextField
                v-model="siteForm.url"
                label="站点地址"
                :rules="[requiredValidator]"
                hint="格式：http://www.example.com/"
                persistent-hint
              />
            </VCol>
            <VCol cols="6" md="3">
              <VTextField
                v-model="siteForm.name"
                label="站点名称"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="6" md="3">
              <VSelect
                v-model="siteForm.is_active"
                :items="statusItems"
                label="状态"
                hint="站点启用/停用"
                persistent-hint
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6" md="3">
              <VSelect
                v-model="siteForm.pri"
                label="优先级"
                :items="priorityItems"
                :rules="[requiredValidator]"
                hint="优先级越小越优先"
                persistent-hint
              />
            </VCol>
            <VCol cols="6" md="3">
              <VTextField
                v-model="siteForm.timeout"
                label="超时时间（秒）"
                hint="站点请求超时时间，为0时不限制"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect
                v-model="siteForm.downloader"
                label="下载器"
                :items="downloaderOptions"
                hint="此站点使用的下载器"
                persistent-hint
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12" md="6">
              <VSelect
                v-model="siteForm.types"
                label="站点类型"
                :items="mediaTypeItems"
                multiple
                hint="此站点资源的类型"
                persistent-hint
              />
            </VCol>
          </VRow>
          <VTabs v-model="configType" show-arrows class="v-tabs-pill mt-3">
            <VTab selected-class="v-tab--selected">
              <div>
                <VIcon size="20" start icon="mdi-rss" value="rss" />
                RSS配置
              </div>
            </VTab>
            <VTab selected-class="v-tab--selected">
              <div>
                <VIcon size="20" start icon="mdi-table" value="browse" />
                列表配置
              </div>
            </VTab>
            <VTab selected-class="v-tab--selected">
              <div>
                <VIcon size="20" start icon="mdi-search" value="search" />
                搜索配置
              </div>
            </VTab>
          </VTabs>
          <VWindow v-model="configType" class="my-3 disable-tab-transition" :touch="false">
            <VWindowItem value="rss">
              <VRow>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.rss"
                    label="RSS地址"
                    hint="订阅模式为`站点RSS`时使用的订阅链接，如未自动获取需手动补充"
                    persistent-hint
                  />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="12" md="12">
                  <VTextarea
                    v-model="siteForm.rss_mapping"
                    label="RSS转标准值映射"
                    hint="当站点的RSS地址获取的XML为非标准时，可使用此映射进行转换，标准参考：https://mikanani.me/RSS/Classic"
                    persistent-hint
                  />
                </VCol>
              </VRow>
            </VWindowItem>
            <VWindowItem value="browse">
              <VRow>
                <VCol cols="3" md="3">
                  <VSelect
                    v-model="siteForm.browse_method"
                    label="请求类型"
                    :items="httpOptions"
                    hint="列表地址的请求类型"
                    persistent-hint
                  />
                </VCol>
                <VCol cols="6" md="6">
                  <VTextField
                    v-model="siteForm.browse"
                    label="列表地址"
                    hint="订阅模式为`自动`或订阅模式为`站点RSS`且没有RSS配置时使用的订阅链接"
                    persistent-hint
                  />
                </VCol>
                <VCol cols="3" md="3">
                  <VBtn @click="syncFromBrowse" variant="outlined">
                    同步至搜索配置
                  </VBtn>
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="3" md="3">
                  <VSwitch
                    v-model="siteForm.browse_config.list_in_detail"
                    label="种子列表在详情页"
                    hint="如果站点种子列表在详情页，则列表配置必须指向各详情页的a标签"
                  />
                </VCol>
                <VCol cols="9" md="9">
                  <VTextField
                    v-model="siteForm.browse_config.list"
                    label="列表配置"
                    hint='用于获取种子列表集合，参考：{"selector": "table.tablesorter > tbody > tr"}'
                    persistent-hint
                  />
                </VCol>
                
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.browse_config.fields.id"
                    label="唯一标识配置"
                    hint='用于获取各种子的唯一标识，参考：{"selector":"a[href*=\"/topics/list/sort_id/\"]","attribute":"href","filters":[{"name":"re_search","args":["\\d+",0]}]}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.browse_config.fields.title"
                    label="标题配置"
                    hint='用于获取各种子的标题，参考：{"selector":"td.title > a"}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.browse_config.fields.details"
                    label="详情地址配置"
                    hint='用于获取各种子的详情地址，参考：{"selector":"td.title > a","attribute":"href"}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.browse_config.fields.download"
                    label="下载地址配置"
                    hint='用于获取各种子的下载地址，参考：{"selector":"a.download-arrow.arrow-magnet","attribute":"href"}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.browse_config.fields.date_added"
                    label="发布日期配置"
                    hint='用于获取各种子的下载地址，参考：{"selector":"td:nth-child(1) > span","optional":true}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.browse_config.fields.size"
                    label="种子大小配置"
                    hint='用于获取各种子的大小，参考：{"selector":"td:nth-child(5)"}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.browse_config.fields.seeders"
                    label="种子数配置"
                    hint='用于获取各种子的种子数，参考：{"selector":"td:nth-child(6)"}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.browse_config.fields.leechers"
                    label="下载数配置"
                    hint='用于获取各种子的下载数，参考：{"selector":"td:nth-child(7)"}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.browse_config.fields.grabs"
                    label="完成数配置"
                    hint='用于获取各种子的完成数，参考：{"selector":"td:nth-child(8)"}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.browse_config.fields.labels"
                    label="标签配置"
                    hint='用于获取各种子的标签，参考：{"selector":"td:nth-child(9)"}'
                    persistent-hint
                  />
                </VCol>
              </VRow>
            </VWindowItem>
            <VWindowItem value="search">
              <VRow>
                <VCol cols="3" md="3">
                  <VSelect
                    v-model="siteForm.search_method"
                    label="请求类型"
                    :items="httpOptions"
                    hint="搜索地址的请求类型"
                    persistent-hint
                  />
                </VCol>
                <VCol cols="6" md="6">
                  <VTextField
                    v-model="siteForm.search"
                    label="搜索地址"
                    hint="搜索资源时使用的链接地址"
                    persistent-hint
                  />
                </VCol>
                <VCol cols="3" md="3">
                  <VBtn @click="syncFromBrowse" variant="outlined">
                    一键同步列表配置
                  </VBtn>
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.search_config.list"
                    label="列表配置"
                    hint='用于获取种子列表集合，参考：{"selector": "table.tablesorter > tbody > tr"}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.search_config.fields.id"
                    label="唯一标识配置"
                    hint='用于获取各种子的唯一标识，参考：{"selector":"a[href*=\"/topics/list/sort_id/\"]","attribute":"href","filters":[{"name":"re_search","args":["\\d+",0]}]}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.search_config.fields.title"
                    label="标题配置"
                    hint='用于获取各种子的标题，参考：{"selector":"td.title > a"}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.search_config.fields.details"
                    label="详情地址配置"
                    hint='用于获取各种子的详情地址，参考：{"selector":"td.title > a","attribute":"href"}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.search_config.fields.download"
                    label="下载地址配置"
                    hint='用于获取各种子的下载地址，参考：{"selector":"a.download-arrow.arrow-magnet","attribute":"href"}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.search_config.fields.date"
                    label="发布日期配置"
                    hint='用于获取各种子的下载地址，参考：{"selector":"td:nth-child(1) > span","optional":true}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.search_config.fields.size"
                    label="种子大小配置"
                    hint='用于获取各种子的大小，参考：{"selector":"td:nth-child(5)"}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.search_config.fields.seeders"
                    label="种子数配置"
                    hint='用于获取各种子的种子数，参考：{"selector":"td:nth-child(6)"}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.search_config.fields.leechers"
                    label="下载数配置"
                    hint='用于获取各种子的下载数，参考：{"selector":"td:nth-child(7)"}'
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    v-model="siteForm.search_config.fields.grabs"
                    label="完成数配置"
                    hint='用于获取各种子的完成数，参考：{"selector":"td:nth-child(8)"}'
                    persistent-hint
                  />
                </VCol>
              </VRow>
            </VWindowItem>
          </VWindow>
          <VTabs v-model="siteType" show-arrows class="v-tabs-pill mt-3">
            <VTab selected-class="v-tab--selected">
              <div>
                <VIcon size="20" start icon="mdi-cookie" value="cookie" />
                Cookie
              </div>
            </VTab>
            <VTab selected-class="v-tab--selected">
              <div>
                <VIcon size="20" start icon="mdi-api" value="api" />
                API
              </div>
            </VTab>
          </VTabs>
          <VWindow v-model="siteType" class="my-3 disable-tab-transition" :touch="false">
            <VWindowItem value="cookie">
              <VRow>
                <VCol cols="12">
                  <VTextarea
                    v-model="siteForm.cookie"
                    label="站点Cookie"
                    hint="站点请求头中的Cookie信息"
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model="siteForm.ua"
                    label="站点User-Agent"
                    hint="获取Cookie的浏览器对应的User-Agent"
                    persistent-hint
                  />
                </VCol>
              </VRow>
            </VWindowItem>
            <VWindowItem value="api">
              <VRow>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="siteForm.token"
                    label="请求头（Authorization）"
                    hint="站点请求头中的Authorization信息，特殊站点需要"
                    persistent-hint
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="siteForm.apikey"
                    label="令牌（API Key）"
                    hint="站点的访问API Key，特殊站点需要"
                    persistent-hint
                  />
                </VCol>
              </VRow>
            </VWindowItem>
          </VWindow>
          <VRow>
            <VCol cols="12" md="4">
              <VSwitch v-model="isLimit" label="限制站点访问频率" />
            </VCol>
          </VRow>
          <VRow v-if="isLimit">
            <VCol cols="12" md="4">
              <VTextField
                v-model="siteForm.limit_interval"
                label="单位周期（秒）"
                :rules="[numberValidator]"
                hint="限流控制的单位周期时长"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model="siteForm.limit_count"
                label="周期内访问次数"
                :rules="[numberValidator]"
                hint="单位周期内允许的访问次数"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model="siteForm.limit_seconds"
                label="访问间隔（秒）"
                :rules="[numberValidator]"
                hint="每次访问需要间隔的最小时间"
                persistent-hint
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12" md="6">
              <VSwitch v-model="siteForm.proxy" label="使用代理访问" hint="使用代理服务器访问该站点" persistent-hint />
            </VCol>
            <VCol cols="12" md="6">
              <VSwitch
                v-model="siteForm.render"
                label="浏览器仿真"
                hint="使用浏览器模拟真实访问该站点"
                persistent-hint
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <VCardActions class="pt-3">
        <VBtn v-if="props.oper !== 'add'" color="error" @click="deleteSiteInfo" variant="outlined" class="me-3">
          删除
        </VBtn>
        <VSpacer />
        <VBtn
          v-if="props.oper === 'add'"
          color="primary"
          variant="elevated"
          @click="addSite"
          prepend-icon="mdi-plus"
          class="px-5"
        >
          新增
        </VBtn>
        <VBtn
          v-else
          color="primary"
          variant="elevated"
          @click="updateSiteInfo"
          prepend-icon="mdi-content-save"
          class="px-5"
        >
          保存
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
