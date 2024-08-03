<script setup lang="ts">
import api from '@/api'
import SubscribeListView from '@/views/subscribe/SubscribeListView.vue'
import SubscribePopularView from '@/views/subscribe/SubscribePopularView.vue'
import router from '@/router'

const route = useRoute()

const subType = route.meta.subType?.toString()
const subId = ref(route.query.id as string)
const activeTab = ref(route.query.tab)

// 数据列表
const tabs = ref<any>()

// 加载时获取数据
onBeforeMount(async () => {
  // 获取订阅列表数据
  try {
    tabs.value = await api.get('plugin/AVSubscriber/get_av_list')
  } catch (error) {
    tabs.value = ['全部']
    console.error(error)
  }
})

function jumpJavTab(tab: string) {
  router.push('/subscribe/jav?tab=' + tab)
}
</script>

<template>
  <div>
    <VTabs v-model="activeTab" show-arrows>
      <VTab v-for="item in tabs" :value="item.tab" @to="jumpJavTab(item.tab)">
        <span class="mx-5">{{ item.title }}</span>
      </VTab>
    </VTabs>

    <VWindow v-model="activeTab" class="mt-5 disable-tab-transition" :touch="false">
      <VWindowItem v-for="item in tabs" :key="item.tab" :value="item.tab">
        <transition name="fade-slide" appear>
          <SubscribeListView :type="subType" :subid="subId" :keyword="item" />
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
