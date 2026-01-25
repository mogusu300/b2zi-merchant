/**
 * Debug script to check if hunter account exists in database
 * Run this from the backend directory with: node check-hunter-account.mjs
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all hunters
    const hunters = await prisma.merchantHunter.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        password: true,
        createdAt: true,
      },
    });

    console.log('\n📋 HUNTERS IN DATABASE:');
    console.log('=======================\n');

    if (hunters.length === 0) {
      console.log('❌ NO HUNTERS FOUND IN DATABASE\n');
    } else {
      for (let i = 0; i < hunters.length; i++) {
        const h = hunters[i];
        console.log(`${i + 1}. ${h.firstName} ${h.lastName}`);
        console.log(`   Email: ${h.email}`);
        console.log(`   Phone: ${h.phone}`);
        console.log(`   ID: ${h.id}`);
        console.log(`   Password hash exists: ${!!h.password}`);
        console.log(`   Password hash (first 20 chars): ${h.password?.substring(0, 20)}...`);
        console.log(`   Created: ${h.createdAt}`);
        console.log('');
      }
    }

    // Count merchants per hunter
    const hunterStats = await prisma.merchantHunter.findMany({
      select: {
        id: true,
        email: true,
        _count: {
          select: { merchants: true },
        },
      },
    });

    console.log('\n📊 MERCHANTS LINKED TO HUNTERS:');
    console.log('=================================\n');

    hunterStats.forEach((hunter, idx) => {
      console.log(`${idx + 1}. ${hunter.email}`);
      if (hunter._count.merchants === 0) {
        console.log(`   ❌ No merchants linked`);
      } else {
        console.log(`   ✅ ${hunter._count.merchants} merchant(s)`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
