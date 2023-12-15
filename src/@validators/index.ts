import type { ValidationRule } from 'vuetify/types/services/validation'

// 必输校验
export const requiredValidator: ValidationRule = (value: any) => !!value || '此项为必填项'

// 数字校验
export const numberValidator: ValidationRule = (value: any) => !isNaN(value) || '请输入数字'

// 网址校验
export const urlValidator: ValidationRule = (value: any) => /^(https|http|ftp)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(:[0-9]{1,5})?(\/[\S]*)?$/.test(value) || '请输入网址'

export const urlPathValidator: ValidationRule = (value: any) => /^(\/[\S]*)?$/.test(value) || '请输入路径'
