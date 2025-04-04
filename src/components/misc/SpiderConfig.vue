<script lang="ts" setup>
// 定义输入变量
const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
  syncText: String,
})

// 注册事件
const emit = defineEmits(['sync'])

async function sync() {
  emit('sync')
}
</script>

<template>
  <VRow>
    <VCol cols="6" md="6">
      <VSwitch
        v-model="props.config.torrent_in_detail"
        label="`种子列表`在`列表详情页`"
        hint="如果站点种子列表在详情页，则需要额外配置列表的获取配置"
      />
    </VCol>
    <VCol cols="6" md="6" class="text-right">
      <VBtn @click="sync" variant="outlined">{{ syncText }}</VBtn>
    </VCol>
  </VRow>
  <VRow v-if="props.config.torrent_in_detail">
    <VCol cols="12" md="12">
      <VTextField
        v-model="props.config.list"
        label="列表配置"
        hint='用于获取种子列表集合，参考：{"selector": "table.tablesorter > tbody > tr"}'
        persistent-hint
      />
    </VCol>
    <VCol cols="12" md="12">
      <VTextField
        v-model="props.config.list_fields.title"
        label="列表标题配置"
        hint='用于获取各种子的标题，参考：{"selector":"td.title > a"}'
        persistent-hint
      />
    </VCol>
    <VCol cols="12" md="12">
      <VTextField
        v-model="props.config.list_fields.details"
        label="列表详情地址配置"
        hint='用于获取各种子的详情地址，参考：{"selector":"td.title > a","attribute":"href"}'
        persistent-hint
      />
    </VCol>
  </VRow>
  <VRow>
    <VCol cols="12" md="12">
      <VTextField
        v-model="props.config.torrent"
        label="种子列表配置"
        hint='用于获取种子列表集合，参考：{"selector": "table.tablesorter > tbody > tr"}'
        persistent-hint
      />
    </VCol>
    <VCol cols="12" md="12">
      <VTextField
        v-model="props.config.torrent_fields.id"
        label="种子唯一标识配置"
        hint='用于获取各种子的唯一标识，参考：{"selector":"a[href*=\"/topics/list/sort_id/\"]","attribute":"href","filters":[{"name":"re_search","args":["\\d+",0]}]}'
        persistent-hint
      />
    </VCol>
    <VCol cols="12" md="12">
      <VTextField
        v-model="props.config.torrent_fields.title"
        label="种子标题配置"
        hint='用于获取各种子的标题，参考：{"selector":"td.title > a"}'
        persistent-hint
      />
    </VCol>
    <VCol cols="12" md="12">
      <VTextField
        v-model="props.config.torrent_fields.details"
        label="种子详情地址配置"
        hint='用于获取各种子的详情地址，参考：{"selector":"td.title > a","attribute":"href"}'
        persistent-hint
      />
    </VCol>
    <VCol cols="12" md="12">
      <VTextField
        v-model="props.config.torrent_fields.download"
        label="种子下载地址配置"
        hint='用于获取各种子的下载地址，参考：{"selector":"a.download-arrow.arrow-magnet","attribute":"href"}'
        persistent-hint
      />
    </VCol>
    <VCol cols="12" md="12">
      <VTextField
        v-model="props.config.torrent_fields.date"
        label="种子发布日期配置"
        hint='用于获取各种子的下载地址，参考：{"selector":"td:nth-child(1) > span","optional":true}'
        persistent-hint
      />
    </VCol>
    <VCol cols="12" md="12">
      <VTextField
        v-model="props.config.torrent_fields.size"
        label="种子大小配置"
        hint='用于获取各种子的大小，参考：{"selector":"td:nth-child(5)"}'
        persistent-hint
      />
    </VCol>
    <VCol cols="12" md="12">
      <VTextField
        v-model="props.config.torrent_fields.seeders"
        label="种子做种数配置"
        hint='用于获取各种子的种子数，参考：{"selector":"td:nth-child(6)"}'
        persistent-hint
      />
    </VCol>
    <VCol cols="12" md="12">
      <VTextField
        v-model="props.config.torrent_fields.leechers"
        label="种子下载数配置"
        hint='用于获取各种子的下载数，参考：{"selector":"td:nth-child(7)"}'
        persistent-hint
      />
    </VCol>
    <VCol cols="12" md="12">
      <VTextField
        v-model="props.config.torrent_fields.grabs"
        label="种子完成数配置"
        hint='用于获取各种子的完成数，参考：{"selector":"td:nth-child(8)"}'
        persistent-hint
      />
    </VCol>
    <VCol cols="12" md="12">
      <VTextField
        v-model="props.config.torrent_fields.labels"
        label="种子标签配置"
        hint='用于获取各种子的标签，参考：{"selector":"td:nth-child(9)"}'
        persistent-hint
      />
    </VCol>
    <VCol cols="12" md="12">
      <VTextField
        v-model="props.config.torrent_fields.category"
        label="种子分类配置"
        hint='用于获取各种子的分类，参考：{"selector":"td:nth-child(10)"}'
        persistent-hint
      />
    </VCol>
  </VRow>
</template>
