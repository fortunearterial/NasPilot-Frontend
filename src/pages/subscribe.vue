<script setup lang="ts">
import SubscribeListView from '@/views/subscribe/SubscribeListView.vue'
import SubscribePopularView from '@/views/subscribe/SubscribePopularView.vue'
import { SubscribeMovieTabs, SubscribeTvTabs, SubscribeGameTabs } from '@/router/menu'
import router from '@/router'

const route = useRoute()

const subType = route.meta.subType?.toString()
const subId = ref(route.query.id as string)
const activeTab = ref(route.query.tab)

function jumpTab(type: string, tab: string) {
  router.push('/subscribe/' + type + '?tab=' + tab)
}
</script>

<template>
  <div>
    <VTabs v-model="activeTab" v-if="subType == 'MOVIE'">
      <VTab v-for="item in SubscribeMovieTabs" :value="item.tab" @to="jumpTab('movie', item.tab)">
        <span class="mx-5">{{ item.title }}</span>
      </VTab>
    </VTabs>
    <VTabs v-model="activeTab" v-if="subType == 'TV'">
      <VTab v-for="item in SubscribeTvTabs" :value="item.tab" @to="jumpTab('tv', item.tab)">
        <span class="mx-5">{{ item.title }}</span>
      </VTab>
    </VTabs>
    <VTabs v-model="activeTab" v-if="subType == 'GAME'">
      <VTab v-for="item in SubscribeGameTabs" :value="item.tab" @to="jumpTab('game', item.tab)">
        <span class="mx-5">{{ item.title }}</span>
      </VTab>
    </VTabs>

    <VWindow v-model="activeTab" class="mt-5 disable-tab-transition" :touch="false">
      <VWindowItem value="mysub">
        <transition name="fade-slide" appear>
          <SubscribeListView :type="subType" :subid="subId" />
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
