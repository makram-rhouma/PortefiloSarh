// Captures review screenshots of a deployed URL. Usage: node scripts/screens.mjs <url> <outDir>
import { chromium } from 'playwright-core'
const [base, out] = process.argv.slice(2)
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const go = async (page, id, off = 0) => { await page.evaluate(([i, o]) => { document.getElementById(i).scrollIntoView({ behavior: 'instant' }); scrollBy(0, o) }, [id, off]); await wait(1300) }
const mobile = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }

const d = await b.newPage({ viewport: { width: 1440, height: 900 } })
await d.goto(base, { waitUntil: 'networkidle' }); await wait(3500)
await d.screenshot({ path: `${out}/1-desktop-home.png` })
await d.goto(`${base}/admin`, { waitUntil: 'networkidle' }); await wait(1500)
await d.screenshot({ path: `${out}/6-desktop-admin.png` })

const ctx = await b.newContext(mobile)
const m = await ctx.newPage()
await m.goto(base, { waitUntil: 'networkidle' }); await wait(3500)
await m.screenshot({ path: `${out}/2-mobile-home-dock.png` })
await go(m, 'gallery'); await m.screenshot({ path: `${out}/3-mobile-gallery.png` })
await m.locator('#gallery li button').nth(3).click(); await wait(900); await m.screenshot({ path: `${out}/3b-mobile-lightbox.png` }); await m.keyboard.press('Escape'); await wait(800)
await go(m, 'dance'); await m.screenshot({ path: `${out}/4-mobile-dance.png` })
await go(m, 'videos'); await m.screenshot({ path: `${out}/4c-mobile-videos.png` })
await go(m, 'about'); await m.screenshot({ path: `${out}/2c-mobile-about.png` })
await go(m, 'contact', 650); await m.screenshot({ path: `${out}/4b-mobile-contact-qr.png` })
await m.locator('footer button[aria-haspopup]').click(); await m.locator('footer [data-lang=ar]').click(); await wait(600)
await m.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await wait(800); await m.screenshot({ path: `${out}/2b-mobile-home-arabic.png` })
await m.goto(`${base}/admin`, { waitUntil: 'networkidle' }); await wait(1500)
await m.screenshot({ path: `${out}/5-mobile-admin.png` })
await b.close()
