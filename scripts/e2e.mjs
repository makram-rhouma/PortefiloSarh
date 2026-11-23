// End-to-end smoke test with the locally installed Chrome.
// Usage: node scripts/e2e.mjs [baseUrl] [screenshotDir]
import { chromium } from 'playwright-core'

const base = process.argv[2] || 'http://localhost:5173'
const shots = process.argv[3]
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: chrome })
const fails = []
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg) }
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

for (const width of [320, 360, 375, 390, 414, 430, 768, 1024, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: 860 }, hasTouch: width < 768, isMobile: width < 768 })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(base, { waitUntil: 'networkidle' })
  await wait(2000)
  for (const y of [0, 0.25, 0.5, 0.75, 1]) {
    await page.evaluate((f) => scrollTo(0, document.body.scrollHeight * f), y); await wait(250)
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  check(overflow <= 0, `${width}px: no horizontal scroll (overflow ${overflow}px)`)
  const smallTargets = await page.evaluate(() => [...document.querySelectorAll('main button, header button, footer a, #gallery button')]
    .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 40 || r.width < 40) }).map((e) => e.textContent?.trim() || e.getAttribute('aria-label')))
  check(smallTargets.length === 0, `${width}px: tap targets >= 40px ${smallTargets.slice(0, 5).join(' | ')}`)
  const vids = await page.evaluate(() => [...document.querySelectorAll('#dance video')].every((v) => v.getBoundingClientRect().width <= innerWidth && v.getBoundingClientRect().height <= innerHeight))
  check(vids, `${width}px: videos fit the screen`)
  if (width < 1024) {
    const dock = page.locator('nav[aria-label="Quick navigation"]')
    await page.evaluate(() => document.getElementById('gallery').scrollIntoView({ behavior: 'instant' })); await wait(700)
    check(await dock.isVisible(), `${width}px: bottom dock visible while scrolled`)
    check((await dock.locator('[aria-current]').textContent()) === 'Gallery', `${width}px: dock highlights the visible section`)
    await dock.getByText('Journey').click(); await wait(1200)
    check((await dock.locator('[aria-current]').textContent()) === 'Journey' && await page.evaluate(() => Math.abs(document.getElementById('journey').getBoundingClientRect().top) < 120), `${width}px: dock item scrolls to its section`)
    const dockOk = await page.evaluate(() => { scrollTo({ top: document.body.scrollHeight, behavior: "instant" }); return new Promise((r) => setTimeout(() => {
      const top = document.querySelector('nav[aria-label="Quick navigation"]').getBoundingClientRect().top
      const copy = [...document.querySelectorAll('footer p')].pop().getBoundingClientRect().bottom
      r(copy <= top) }, 600)) })
    check(dockOk, `${width}px: dock never covers the footer at the end of the page`)
  } else {
    check(!(await page.locator('nav[aria-label="Quick navigation"]').isVisible()), `${width}px: dock hidden on desktop`)
  }
  if (shots) {
    await page.evaluate(() => scrollTo(0, 0)); await wait(400)
    await page.screenshot({ path: `${shots}/home-${width}.png` })
  }
  if (width < 1024) {
    await page.evaluate(() => scrollTo(0, 0))
    await page.locator('button[aria-controls="mobile-menu"]').click(); await wait(900)
    const dialog = page.getByRole('dialog')
    check(await dialog.isVisible(), `${width}px: mobile menu opens`)
    if (shots && width === 375) await page.screenshot({ path: `${shots}/menu-375.png` })
    for (let i = 0; i < 15; i++) await page.keyboard.press('Tab')
    check(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]')), `${width}px: focus trapped in menu`)
    await page.keyboard.press('Escape'); await wait(900)
    check(!(await dialog.count()), `${width}px: Escape closes menu`)
  }
  check(errors.length === 0, `${width}px: no JS errors ${errors.join(' | ')}`)
  await ctx.close()
}

// Language switching, RTL, scroll position, persistence
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 860 }, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto(base, { waitUntil: 'networkidle' }); await wait(2000)
  await page.evaluate(() => document.getElementById('skills').scrollIntoView({ behavior: 'instant' })); await wait(800)
  const before = await page.evaluate(() => document.getElementById('skills').getBoundingClientRect().top)
  await page.locator('footer [aria-pressed]').filter({ hasText: /^ar$/ }).click(); await wait(800)
  const after = await page.evaluate(() => document.getElementById('skills').getBoundingClientRect().top)
  check(await page.evaluate(() => document.documentElement.dir === 'rtl' && document.documentElement.lang === 'ar'), 'AR sets dir=rtl and lang=ar')
  check((await page.evaluate(() => scrollY)) > 1000, `language switch does not jump to top (section moved ${Math.round(after - before)}px)`)
  check((await page.locator('#skills h2').textContent()) === 'ما أحمله معي على متن الطائرة', 'AR content translated')
  check(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'AR: no horizontal scroll')
  if (shots) { await page.evaluate(() => scrollTo(0, 0)); await wait(500); await page.screenshot({ path: `${shots}/ar-390.png` }) }
  await page.reload({ waitUntil: 'networkidle' }); await wait(500)
  check(await page.evaluate(() => document.documentElement.lang === 'ar'), 'language choice remembered after reload')
  for (const [l, h] of [['fr', 'Ce que j’apporte à bord'], ['es', 'Lo que aporto a bordo'], ['en', 'What I bring on board']]) {
    await page.locator('footer [aria-pressed]').filter({ hasText: new RegExp(`^${l}$`) }).click(); await wait(300)
    check((await page.locator('#skills h2').textContent()) === h, `${l.toUpperCase()} content translated`)
  }
  await ctx.close()
}

// Gallery, lightbox, video, QR, form validation (desktop)
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(base, { waitUntil: 'networkidle' }); await wait(2000)
  const all = await page.locator('#gallery li').count()
  await page.locator('#gallery [aria-pressed]', { hasText: 'Fitness' }).click(); await wait(600)
  const fit = await page.locator('#gallery li').count()
  check(all > fit && fit > 0, `gallery filter (all ${all} -> fitness ${fit})`)
  await page.locator('#gallery li button').first().click(); await wait(600)
  check(await page.getByRole('dialog').isVisible(), 'lightbox opens')
  await page.keyboard.press('ArrowRight'); await wait(400)
  await page.keyboard.press('Escape'); await wait(800)
  check(!(await page.getByRole('dialog').count()), 'lightbox closes with Escape')
  await page.locator('#gallery [aria-pressed]', { hasText: 'Zumba' }).click(); await wait(500)
  await page.locator('#gallery li button').first().click(); await wait(600)
  check(await page.getByRole('dialog').locator('video').count() === 1, 'video opens in the gallery overlay')
  await page.keyboard.press('Escape'); await wait(800)

  await page.evaluate(() => document.getElementById('dance').scrollIntoView({ behavior: 'instant' })); await wait(600)
  await page.locator('#dance button[aria-label="Play video"]').first().click(); await wait(2500)
  const t = await page.evaluate(() => document.querySelector('#dance video').currentTime)
  check(t > 0.3, `dance video plays (t=${t.toFixed(2)}s)`)

  const qr = await page.locator('#contact svg[aria-label^="QR"]').getAttribute('aria-label')
  check(!!qr && !/localhost/.test(qr), `QR points to production (${qr})`)

  await page.evaluate(() => document.getElementById('contact').scrollIntoView({ behavior: 'instant' }))
  await page.locator('#contact form button[type=submit]').click(); await wait(300)
  check((await page.locator('#e-name').textContent()) === 'This field is required.', 'form: required validation')
  await page.fill('#c-name', 'Test'); await page.fill('#c-email', 'bad'); await page.fill('#c-message', 'short')
  await page.locator('#contact form button[type=submit]').click(); await wait(300)
  check((await page.locator('#e-email').textContent())?.includes('valid'), 'form: email validation')
  check((await page.locator('#e-message').textContent())?.includes('10'), 'form: length validation')
  if (shots) await page.screenshot({ path: `${shots}/contact-1280.png` })
  await ctx.close()
}

// Reduced motion: no loader
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 860 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto(base, { waitUntil: 'networkidle' })
  check(!(await page.locator('[aria-label="Loading portfolio"]').count()), 'reduced motion skips the loader')
  await ctx.close()
}

// SPA deep link
{
  const page = await browser.newPage()
  const res = await page.goto(`${base}/admin`, { waitUntil: 'networkidle' })
  await wait(1500)
  check(res.status() === 200 && (await page.locator('input[type=password]').count()) === 1, '/admin loads (login form) on direct visit')
  await page.close()
}

await browser.close()
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED')
process.exit(fails.length ? 1 : 0)
