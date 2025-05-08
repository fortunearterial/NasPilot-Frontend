<script setup lang="ts">
import { debounce } from 'lodash-es'
import { VForm } from 'vuetify/components/VForm'
import { useAuthStore, useUserStore } from '@/stores'
import { authState, userState } from '@/stores/types'
import { requiredValidator } from '@/@validators'
import { api } from '@/api'
import router from '@/router'
import logo from '@images/logo.png'
import { useTheme } from 'vuetify'
import { checkPrefersColorSchemeIsDark } from '@/@core/utils'
import { urlBase64ToUint8Array } from '@/@core/utils/navigator'
import { saveLocalTheme } from '@/@core/utils/theme'
import { useRoute } from 'vue-router'

// 认证 Store
const authStore = useAuthStore()
//用户 Store
const userStore = useUserStore()

// 在表单定义后添加获取 URL 参数的逻辑
const route = useRoute()

// 表单
const form = ref({
  username: '',
  password: '',
  confirm_password: '',
  sms_code: '',
  rmd_code: '',
})

const refForm = ref<InstanceType<typeof VForm> | null>(null)

// 密码输入
const isPasswordVisible = ref(false)

// 错误信息
const errorMessage = ref('')

// 背景图片 URL 和预加载 URL
const backgroundImages = ref<string[]>([])
const activeImageIndex = ref(0)

// 用户名称输入框
const usernameInput = ref()

// Interval定时器
let intervalTimer: NodeJS.Timeout | null = null

// 获取背景图片
async function fetchBackgroundImage() {
  try {
    backgroundImages.value = await api.get('/login/wallpapers')
  } catch (e) {
    console.log(e)
  }
}

// 添加密码一致性验证函数
const confirmPasswordValidator = (value: string) => {
  return value === form.value.password || '两次输入的密码不一致'
}

// 订阅推送通知
async function subscribeForPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.ready
    // 获取订阅信息
    const subscription = await registration.pushManager.getSubscription().then(function (subscription) {
      if (subscription === null) {
        const convertedVapidKey = urlBase64ToUint8Array(import.meta.env.VITE_PUBLIC_VAPID_KEY)
        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        })
      } else {
        return subscription
      }
    })
    // 发送订阅请求
    try {
      await api.post('/message/webpush/subscribe', subscription)
    } catch (e) {
      console.log(e)
    }
  }
}

// 登录后处理
async function afterLogon(superuser: boolean) {
  console.info('authStore.originalPath', authStore.originalPath)
  // 跳转到首页
  router.push('/')
}

// 注册
function logon() {
  errorMessage.value = ''

  // 进行表单校验
  if (!form.value.username || !form.value.password || !form.value.confirm_password || !form.value.sms_code) {
    return
  }
  if (form.value.password !== form.value.confirm_password) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }

  // 用户名密码
  const formData = new FormData()

  formData.append('name', form.value.username)
  formData.append('password', form.value.password)
  formData.append('confirm_password', form.value.confirm_password)
  formData.append('sms_code', form.value.sms_code)
  formData.append('recommend_code', form.value.rmd_code)

  // 请求token
  api
    .post('/logon', formData, {
      headers: {
        Accept: 'application/json', // 设置 Accept 类型
      },
    })
    .then((response: any) => {
      console.log(response.success, response.success === false)
      if (response.success === false) {
        errorMessage.value = response.message
        return
      }

      const authPayLoad: authState = {
        token: response.access_token,
        remember: false,
      }

      const userPayload: userState = {
        superUser: response.super_user,
        userID: response.user_id,
        userName: response.user_name,
        avatar: response.avatar,
        level: response.level,
        permissions: response.permissions,
      }

      authStore.login(authPayLoad)
      userStore.loginUser(userPayload)

      // 登录后处理
      afterLogon(userPayload.superUser)
    })
    .catch((error: any) => {
      // 注册失败，显示错误提示
      if (!error.response) errorMessage.value = '注册失败，请检查网络连接！'
      else if (error.response.status === 401) errorMessage.value = '注册失败，请检查用户名、密码或双重验证是否正确！'
      else if (error.response.status === 403) errorMessage.value = '注册失败，您没有权限访问！'
      else if (error.response.status === 500) errorMessage.value = '注册失败，服务器错误！'
      else errorMessage.value = `注册失败 ${error.response.status}，请检查用户名、密码或双重验证码是否正确！`
    })
}

// 添加短信验证码相关状态
const countdown = ref(0)
const isSending = ref(false)

// 发送短信验证码
const sendSmsCode = async () => {
  if (isSending.value || countdown.value > 0) return
  if (!form.value.username) {
    errorMessage.value = '请先输入手机号'
    return
  }

  isSending.value = true
  try {
    await api.post('/user/sms/send', { phone: form.value.username })
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || '发送验证码失败'
  } finally {
    isSending.value = false
  }
}

// 自动登录
onMounted(async () => {
  form.value.rmd_code = route.query.rmd?.toString() || ''
})
</script>

<template>
  <!-- 当前背景图片 -->
  <div class="relative flex min-h-screen flex-col bg-gray-900 items-center justify-center">
    <div>
      <div
        v-for="(imageUrl, index) in backgroundImages"
        class="absolute-top-shift absolute inset-0 bg-cover bg-center transition-opacity duration-300 ease-in"
        :class="{ 'opacity-100': index === activeImageIndex, 'opacity-0': index !== activeImageIndex }"
      >
        <VImg :src="imageUrl" class="absolute inset-0 transition-opacity duration-1000" cover position="center top" />
        <div
          class="absolute inset-0"
          style="background-image: linear-gradient(rgba(45, 55, 72, 47%) 0%, rgb(26, 32, 46) 100%)"
        />
      </div>
    </div>
    <!-- 登录表单 -->
    <div class="auth-wrapper d-flex align-center justify-center">
      <VCard class="auth-card px-7 py-3 w-full h-full opacity-85" max-width="24rem">
        <VCardItem class="justify-center">
          <template #prepend>
            <div class="d-flex pe-0">
              <VImg :src="logo" width="64" height="64" />
            </div>
          </template>
          <VCardTitle class="font-weight-bold text-2xl text-uppercase"> NasPilot </VCardTitle>
        </VCardItem>
        <VCardText>
          <VForm ref="refForm" autocomplete="on" @submit.prevent="() => {}">
            <VRow>
              <!-- username -->
              <VCol cols="12">
                <VTextField
                  ref="usernameInput"
                  v-model="form.username"
                  label="手机号"
                  type="text"
                  name="username"
                  autocomplete="username"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="form.password"
                  label="密码"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  name="current-password"
                  autocomplete="current-password"
                  :append-inner-icon="isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  :rules="[requiredValidator]"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="form.confirm_password"
                  label="确认密码"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  name="confirm-password"
                  autocomplete="confirm-password"
                  :append-inner-icon="isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  :rules="[requiredValidator, confirmPasswordValidator]"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>
              <!-- code -->
              <VCol cols="12">
                <VTextField
                  ref="smsCodeInput"
                  v-model="form.sms_code"
                  label="验证码"
                  type="text"
                  name="sms_code"
                  :rules="[requiredValidator]"
                >
                  <template #append-inner>
                    <VBtn variant="text" :disabled="countdown > 0 || isSending" @click="sendSmsCode">
                      {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
                    </VBtn>
                  </template>
                </VTextField>
              </VCol>
              <!-- 推荐码 -->
              <VCol cols="12">
                <VTextField
                  ref="rmdCodeInput"
                  v-model="form.rmd_code"
                  label="推荐码"
                  type="text"
                  name="rmd_code"
                  hint="请填写推荐人的推荐码"
                  persistent-hint
                >
                </VTextField>
              </VCol>
              <VCol cols="12">
                <!-- logon button -->
                <VBtn block type="submit" @click="logon"> 注册 </VBtn>
                <VAlert v-if="errorMessage" type="error" variant="tonal" class="mt-3">
                  {{ errorMessage }}
                </VAlert>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@core/scss/pages/page-auth';

.v-card-item__prepend {
  padding-inline-end: 0 !important;
}

.absolute-top-shift {
  inset-block-start: calc(-4rem - env(safe-area-inset-top));
}

.auth-wrapper {
  overflow: hidden;
  block-size: auto;
}
</style>
