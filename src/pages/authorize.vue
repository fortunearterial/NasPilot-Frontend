<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/oauth'
import logo from '@images/logo.png'

const route = useRoute()

// 记录窗口是否由脚本打开
let isWindowOpenedByScript = false

onMounted(() => {
  // 获取所有查询参数
  console.log('OAuth query params:', route.query)
  
  // 检查是否是通过window.open打开的窗口
  isWindowOpenedByScript = window.opener != null
})

// 应用信息和权限数据
const appInfo = ref({
  name: 'NasPilot Agent',
  icon: logo,
  permissions: [
    '查看您的个人信息（姓名、邮箱）',
    '访问您的文件和存储',
    '管理您的设备和应用设置'
  ]
})



// 处理授权逻辑
async function authorize() {
  console.log('用户授权了应用')
  const result = await api.get('/authorize', {
    params: route.query
  })
  console.info(result)
  window.location.href = result.data.redirect_uri
}

// 处理拒绝逻辑
async function deny() {
  console.log('用户拒绝了授权')
  
  // 尝试多种方式关闭页面
  try {
    // 方法1: 尝试常规关闭
    window.close()
    
    // 方法2: 如果是在iframe中，尝试通知父窗口关闭
    if (window.parent && window.parent !== window) {
      window.parent.postMessage('close-oauth-window', '*')
    }
    
    // 方法3: 如果有opener，尝试通知opener关闭
    if (window.opener) {
      window.opener.postMessage('oauth-denied', '*')
    }
    
    // 方法4: 如果以上方法都失败，重定向到空白页面
    setTimeout(() => {
      // 如果页面还在，重定向到空白页面
      document.body.innerHTML = '<div style="text-align:center;padding:50px;">授权已拒绝，您可以关闭此页面</div>'
      document.title = '授权已拒绝'
      // 或者重定向到首页
      // window.location.href = '/'
    }, 100)
  } catch (e) {
    console.error('关闭页面失败', e)
    // 显示拒绝信息
    document.body.innerHTML = '<div style="text-align:center;padding:50px;">授权已拒绝，您可以关闭此页面</div>'
    document.title = '授权已拒绝'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img class="mx-auto h-12 w-auto" :src="logo" alt="NasPilot Logo" />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        应用授权请求
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="mb-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <img class="h-12 w-12 rounded-full" :src="appInfo.icon" alt="应用图标" />
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">{{ appInfo.name }}</h3>
              <p class="text-sm text-gray-500">请求访问您的账户</p>
            </div>
          </div>
        </div>

        <div class="border-t border-b border-gray-200 py-4 my-4">
          <h4 class="text-sm font-medium text-gray-700 mb-3">此应用将能够：</h4>
          <ul class="space-y-3">
            <li v-for="(permission, index) in appInfo.permissions" :key="index" class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <p class="ml-3 text-sm text-gray-700">
                {{ permission }}
              </p>
            </li>
          </ul>
        </div>

        <div class="text-sm text-gray-500 mb-6">
          <p>授权此应用将允许它代表您执行操作。您可以随时在账户设置中撤销访问权限。</p>
        </div>

        <div class="flex items-center justify-between">
          <button @click="deny" type="button" class="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            拒绝
          </button>
          <button @click="authorize" type="button" class="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            授权访问
          </button>
        </div>
      </div>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500">
          <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
            查看隐私政策
          </a>
          &nbsp;·&nbsp;
          <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
            服务条款
          </a>
        </p>
      </div>
    </div>
  </div>
</template>