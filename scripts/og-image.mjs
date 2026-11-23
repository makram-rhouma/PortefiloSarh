// Renders public/og-image.jpg (1200x630) and public/apple-touch-icon.png with local Chrome.
import { chromium } from 'playwright-core'
import { readFileSync } from 'node:fs'
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
const poster = 'data:image/webp;base64,' + readFileSync('public/media/video/sarah-2-poster.webp').toString('base64')
const p = await b.newPage({ viewport: { width: 1200, height: 630 } })
await p.setContent(`<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Allura&family=Fraunces:opsz,wght@9..144,400&family=Manrope:wght@600&display=block"></head>
<body style="margin:0;width:1200px;height:630px;background:#121014;color:#f7f1ea;font-family:Manrope;overflow:hidden;position:relative">
<div style="position:absolute;inset:-80px;filter:blur(40px);background:radial-gradient(40% 50% at 15% 25%,#ff2e9366,transparent 70%),radial-gradient(35% 45% at 70% 30%,#b79bff55,transparent 70%),radial-gradient(30% 40% at 40% 95%,#d8ff3e33,transparent 70%),radial-gradient(60% 60% at 50% 50%,#5a1430,transparent 80%)"></div>
<div style="position:absolute;left:70px;top:90px;width:700px">
<div style="font-family:Allura;font-size:110px;line-height:1">Sarah Jaballah</div>
<div style="margin-top:26px;color:#d8ff3e;letter-spacing:.2em;font-size:18px;text-transform:uppercase">Cabin Crew · Guest Experience · Dance &amp; Fitness</div>
<div style="margin-top:28px;font-family:Fraunces;font-size:44px;line-height:1.1">Creating Memorable Experiences Through Professionalism, Passion &amp; Energy.</div></div>
<img src="${poster}" style="position:absolute;right:70px;top:60px;width:288px;height:510px;object-fit:cover;border-radius:28px;border:2px solid #ff2e9388">
</body></html>`, { waitUntil: 'networkidle' })
await p.screenshot({ path: 'public/og-image.jpg', type: 'jpeg', quality: 85 })
const i = await b.newPage({ viewport: { width: 180, height: 180 } })
await i.setContent(`<body style="margin:0">${readFileSync('public/favicon.svg', 'utf8').replace('<svg ', '<svg width="180" height="180" ')}</body>`)
await i.screenshot({ path: 'public/apple-touch-icon.png' })
await b.close()
