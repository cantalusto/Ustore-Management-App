// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const saltRounds = 10

async function main() {
  console.log('Start seeding...')

  const passwordAdmin = await bcrypt.hash('admin123', saltRounds)
  const passwordManager = await bcrypt.hash('manager123', saltRounds)
  const passwordMember = await bcrypt.hash('member123', saltRounds)

  await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {}, // não atualiza nada se já existir
    create: {
      email: 'admin@company.com',
      name: 'Dante Alighieri',
      password: passwordAdmin,
      role: 'admin',
      department: 'Management',
      status: 'active',
    },
  })

  await prisma.user.upsert({
    where: { email: 'manager@company.com' },
    update: {},
    create: {
      email: 'manager@company.com',
      name: 'Gerente de Projeto',
      password: passwordManager,
      role: 'manager',
      department: 'Development',
      status: 'active',
    },
  })

  await prisma.user.upsert({
    where: { email: 'member@company.com' },
    update: {},
    create: {
      email: 'member@company.com',
      name: 'Membro da Equipe',
      password: passwordMember,
      role: 'member',
      department: 'Development',
      status: 'active',
    },
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
