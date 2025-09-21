"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed.ts
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const saltRounds = 10;
async function main() {
    console.log('Start seeding...');
    const users = [
        {
            email: 'admin@company.com',
            name: 'Dante Alighieri',
            password: 'admin123',
            role: 'admin',
            department: 'Management',
        },
        {
            email: 'manager@company.com',
            name: 'Gerente de Projeto',
            password: 'manager123',
            role: 'manager',
            department: 'Development',
        },
        {
            email: 'member@company.com',
            name: 'Membro da Equipe',
            password: 'member123',
            role: 'member',
            department: 'Development',
        },
    ];
    for (const u of users) {
        const hashedPassword = await bcrypt_1.default.hash(u.password, saltRounds);
        await prisma.user.create({
            data: {
                email: u.email,
                name: u.name,
                password: hashedPassword,
                role: u.role,
                department: u.department,
                status: 'active',
            },
        });
    }
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
