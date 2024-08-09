<script setup lang="ts">
import api from '@/api'
import SubscribeListViewH from '@/views/subscribe/SubscribeListViewH.vue'
import SubscribePopularView from '@/views/subscribe/SubscribePopularView.vue'
import { SubscribeJavTabs } from '@/router/menu'
import router from '@/router'

const route = useRoute()

const subType = route.meta.subType?.toString()
const subId = ref(route.query.id as string)
const activeTab = ref(route.query.tab)

// 数据列表
const tabs = ref<any>()

// 加载时获取数据
onBeforeMount(async () => {
  tabs.value = SubscribeJavTabs
  // 获取订阅列表数据
  try {
    let avs: any = await api.get('plugin/AVSubscriber/get_av_list')
    avs.splice(0, 0, 1, 0)
    Array.prototype.splice.apply(tabs.value, avs)
  } catch (error) {
    tabs.value = SubscribeJavTabs
    console.error(error)
  }
})

function jumpTab(tab: string) {
  router.push('/subscribe/jav?tab=' + tab)
}
</script>

<template>
  <div>
    <VTabs v-model="activeTab" show-arrows>
      <VTab v-for="item in tabs" :value="item.tab" @to="jumpTab(item.tab)">
        <span class="mx-5">{{ item.title }}</span>
      </VTab>
    </VTabs>

    <VWindow v-model="activeTab" class="mt-5 disable-tab-transition" :touch="false">
      <VWindowItem v-for="item in tabs" :key="item.tab" :value="item.tab">
        <transition name="fade-slide" appear>
          <SubscribeListViewH :type="subType" :subid="subId" :keyword="item.title" />
        </transition>
      </VWindowItem>
      <VWindowItem value="popular">
        <transition name="fade-slide" appear>
          <SubscribePopularView :type="subType" />
        </transition>
      </VWindowItem>
    </VWindow>
  </div>
</template>
