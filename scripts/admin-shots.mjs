// Screenshots of the admin UI with a mocked session (no password needed, nothing is written).
// The browser gets a fake session; is_admin is answered "true"; every other REST read is forwarded
// to Supabase with the public key, so pages show real public data. Writes are blocked.
// Usage: node scripts/admin-shots.mjs <baseUrl> <outDir>
import { chromium } from 'playwright-core'
const [base, out] = process.argv.slice(2)
const REF = 'ggeoajnesslmmpvqbumq'
const KEY = 'sb_publishable_8SUStHDi1Nt8gyY4XWCY0g_VYO5mqWw'
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
const exp = Math.floor(Date.now() / 1000) + 3600 * 24
const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'sarahjaballh@gmail.com', app_metadata: {}, user_metadata: {} }
const token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: user.id, role: 'authenticated', exp, email: user.email })}.sig`
const session = { access_token: token, refresh_token: 'x', token_type: 'bearer', expires_in: 86400, expires_at: exp, user }

const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
async function shoot(viewport, mobile, shots) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile })
  await ctx.addInitScript(([k, v]) => localStorage.setItem(k, v), [`sb-${REF}-auth-token`, JSON.stringify(session)])
  await ctx.route(`https://${REF}.supabase.co/**`, async (route) => {
    const req = route.request()
    if (req.url().includes('/rpc/is_admin')) return route.fulfill({ json: true })
    if (req.url().includes('/auth/v1/user')) return route.fulfill({ json: user })
    if (req.method() !== 'GET' && req.method() !== 'HEAD' && !req.url().includes('/rpc/')) return route.fulfill({ status: 403, json: { message: 'blocked in screenshot mode' } })
    const headers = { ...req.headers(), authorization: `Bearer ${KEY}`, apikey: KEY }
    return route.fulfill({ response: await route.fetch({ headers }) })
  })
  const p = await ctx.newPage()
  for (const [path, name, act] of shots) {
    await p.goto(`${base}/admin/${path}`, { waitUntil: 'networkidle' }); await wait(1500)
    if (act) { await act(p); await wait(900) }
    await p.screenshot({ path: `${out}/${name}.png` })
  }
  await ctx.close()
}
await shoot({ width: 1440, height: 900 }, false, [
  ['', 'admin-desktop-overview'], ['media', 'admin-desktop-media'],
  ['experiences', 'admin-desktop-experiences', (p) => p.locator('main li button[aria-expanded]').first().click()],
])
await shoot({ width: 390, height: 844 }, true, [
  ['', 'admin-mobile-overview'], ['media', 'admin-mobile-media'],
  ['content', 'admin-mobile-content'],
  ['', 'admin-mobile-drawer', (p) => p.locator('header button[aria-expanded]').click()],
])
await b.close()
console.log('admin screenshots done')
