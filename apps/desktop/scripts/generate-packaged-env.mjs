import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const names = [
  'NXCORE_AGENT_RUNTIME',
  'NXCORE_SAAS_API_URL',
  'NXCORE_KNOWLEDGE_ROUTER_ENABLED',
  'NXCORE_KNOWLEDGE_INGEST_DEBOUNCE_MS',
  'NXCORE_CONNECTOR_POLL_MS',
  'NXCORE_INGEST_FILTER_ENABLED',
  'NXCORE_INGEST_FILTER_MODE',
  'NXCORE_NANGO_URL',
  'NXCORE_NANGO_SECRET',
  'NXCORE_NANGO_GMAIL_CONFIG_KEY',
  'NXCORE_NANGO_GOOGLE_CLIENT_ID',
  'NXCORE_NANGO_GOOGLE_CLIENT_SECRET',
  'NXCORE_NANGO_NOTION_CLIENT_ID',
  'NXCORE_NANGO_NOTION_CLIENT_SECRET',
  'NXCORE_NANGO_OUTLOOK_CLIENT_ID',
  'NXCORE_NANGO_OUTLOOK_CLIENT_SECRET',
  'NXCORE_NANGO_OUTLOOK_CONFIG_KEY',
]

// GitHub vars 可能连引号一起存（vars.X = "pi"），剥掉包裹引号再下发，
// 否则 gateway 的整数/布尔解析在打包版里直接崩（Invalid NXCORE_NANGO_CONNECTOR_POLL_MS）。
const value = (name) => process.env[name].replace(/^"(.*)"$/, '$1')

// 发布构建（tag 触发）要求配置完整；本地/分支验证构建可显式开启
// ALLOW_EMPTY_PACKAGED_ENV=1，缺失项写成空串，仅用于验证打包链路。
const allowEmpty = process.env.ALLOW_EMPTY_PACKAGED_ENV === '1'
const missing = names.filter((name) => !process.env[name])
if (missing.length && !allowEmpty) {
  throw new Error(`Missing packaged environment variables: ${missing.join(', ')}`)
}

const values = Object.fromEntries(names.map((name) => {
  const raw = process.env[name]
  return [name, raw ? value(name) : '']
}))

const output = resolve(process.cwd(), 'build', 'packaged-env.json')
await mkdir(dirname(output), { recursive: true })
await writeFile(output, `${JSON.stringify(values, null, 2)}\n`)
if (missing.length) {
  console.log(`Wrote ${names.length} packaged environment variables (${missing.length} empty; ALLOW_EMPTY_PACKAGED_ENV=1) to ${output}`)
} else {
  console.log(`Wrote ${names.length} packaged environment variables to ${output}`)
}
