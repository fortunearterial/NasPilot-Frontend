<script lang="ts" setup>
import api from '@/api'
import FileBrowser from '@/components/FileBrowser.vue'

const initPath = ref('/Users/jxxghp/Downloads/爱情生活 (2020)/')

const endpoints = {
  list: { url: '/filebrowser/list?path={path}', method: 'get' },
  mkdir: { url: '/filebrowser/mkdir?path={path}', method: 'get' },
  delete: { url: '/filebrowser/delete?path={path}', method: 'get' },
}
</script>

<template>
  <div>
    <FileBrowser storages="local" tree="true" :path="initPath" :endpoints="endpoints" :axios="api" />
  </div>
</template>