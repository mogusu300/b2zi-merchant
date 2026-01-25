import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const email = process.argv[2]
if (!email) {
  console.error('Usage: node find-merchant.mjs <email>')
  process.exit(2)
}
;(async ()=>{
  try {
    const m = await prisma.merchant.findUnique({ where: { email } })
    console.log(JSON.stringify(m, null, 2))
  } catch (e) {
    console.error('Query error', e)
  } finally {
    await prisma.$disconnect()
  }
})()
