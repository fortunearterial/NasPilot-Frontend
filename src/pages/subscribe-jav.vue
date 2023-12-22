<script setup lang="ts">
import api from '@/api'
import SubscribeListView from '@/views/subscribe/SubscribeListView.vue'

const route = useRoute()

const activeTab = ref(route.params.tab)

// 数据列表
const tabs = ref<string[]>(['全部'])

// 获取订阅列表数据
async function fetchData() {
  try {
    tabs.value = ['全部'].concat(await api.get('plugin/AVSubscriber/get_av_list'))
  }
  catch (error) {
    tabs.value = ['全部']
    console.error(error)
  }
}

// 加载时获取数据
onBeforeMount(fetchData)
</script>

<template>
  <div>
    <VTabs
      v-model="activeTab"
      show-arrows
    >
      <VTab v-for="item in tabs" :key="item" :value="item">
        {{ item }}
      </VTab>
    </VTabs>
    <VDivider />

    <VWindow
      v-model="activeTab"
      class="mt-5 disable-tab-transition"
      :touch="false"
    >
      <VWindowItem value="全部">
        <transition name="fade-slide" appear>
          <SubscribeListView type="Jav" />
        </transition>
      </VWindowItem>

      <VWindowItem v-for="item in tabs" :key="item" :value="item">
        <transition name="fade-slide" appear>
          <SubscribeListView type="Jav" :keyword="item" />
        </transition>
      </VWindowItem>
    </VWindow>
  </div>
</template>
