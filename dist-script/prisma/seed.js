"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed.ts
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const saltRounds = 10;
async function main() {
    console.log('Start seeding...');
    const passwordAdmin = await bcryptjs_1.default.hash('admin123', saltRounds);
    const passwordManager = await bcryptjs_1.default.hash('manager123', saltRounds);
    const passwordMember = await bcryptjs_1.default.hash('member123', saltRounds);
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
    });
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
    });
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
    });
    console.log('Seeding finished.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
