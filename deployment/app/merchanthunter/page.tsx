import { readFileSync } from 'fs'
import { join } from 'path'

async function getPWAHtml() {
  try {
    const filePath = join(process.cwd(), 'public/merchanthunter/index.html')
    let html = readFileSync(filePath, 'utf-8')
    
    // Rewrite asset paths
    html = html
      .replace(/src="\/assets\//g, 'src="/merchanthunter/assets/')
      .replace(/href="\/assets\//g, 'href="/merchanthunter/assets/')
      .replace(/src="\/service-worker\.js/g, 'src="/merchanthunter/service-worker.js')
      .replace(/href="\/manifest\.json/g, 'href="/merchanthunter/manifest.json')
      .replace(/href="\/icon/g, 'href="/merchanthunter/icon')
      .replace(/href="\/apple-icon/g, 'href="/merchanthunter/apple-icon')
    
    return html
  } catch (error) {
    return '<h1>Error loading PWA</h1>'
  }
}

export default async function MerchantHunter() {
  const html = await getPWAHtml()
  
  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
}
