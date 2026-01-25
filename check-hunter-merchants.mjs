import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking merchant-hunter relationships...\n')
  
  // Get all hunters
  const hunters = await prisma.hunter.findMany({
    include: {
      hunterMerchants: {
        include: {
          merchant: true
        }
      }
    }
  })
  
  console.log(`Found ${hunters.length} hunters:\n`)
  
  for (const hunter of hunters) {
    console.log(`👤 ${hunter.email} (${hunter.firstName} ${hunter.lastName})`)
    console.log(`   Merchants: ${hunter.hunterMerchants.length}`)
    
    if (hunter.hunterMerchants.length > 0) {
      for (const hm of hunter.hunterMerchants) {
        const merchant = hm.merchant
        console.log(`   - ${merchant.businessName || merchant.name} (${merchant.businessAddress}) - Status: ${merchant.status}`)
      }
    }
    console.log('')
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
