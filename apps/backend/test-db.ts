import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Starting Database Test ---')

  // 1. Create a new user
  const newUser = await prisma.user.create({
    data: {
      email: `test-${Math.random()}@example.com`,
      name: 'Test User',
      passwordHash: 'hashedpassword123',
    },
  })
  console.log('✅ Created user:', newUser)

  // 2. Fetch all users
  const allUsers = await prisma.user.findMany()
  console.log('📋 All users in Supabase:', allUsers)
}

main()
  .catch((e) => console.error('❌ Error:', e))
  .finally(async () => await prisma.$disconnect())