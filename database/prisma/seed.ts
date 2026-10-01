import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Load .env automatically if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valParts] = trimmed.split('=');
        const keyName = key.trim();
        const val = valParts.join('=').trim();
        if (!process.env[keyName]) {
          process.env[keyName] = val;
        }
      }
    }
  }
}

const urlsToTry = [
  process.env.DATABASE_URL,
  'postgresql://cloudsim:cloudsim_secret@localhost:5432/cloudsim_db?schema=public',
  'postgresql://postgres:postgres@localhost:5432/cloudsim_db?schema=public',
  'postgresql://postgres:cloudsim_secret@localhost:5432/cloudsim_db?schema=public',
].filter(Boolean) as string[];

let prisma: PrismaClient | null = null;

async function getPrismaClient(): Promise<PrismaClient> {
  for (const url of urlsToTry) {
    try {
      const client = new PrismaClient({ datasources: { db: { url } } });
      await client.$queryRaw`SELECT 1`;
      process.env.DATABASE_URL = url;
      return client;
    } catch (e) {
      // Try next URL candidate
    }
  }
  return new PrismaClient();
}

async function main() {
  console.log('🌱 Starting CloudSim database seed...');
  const db = await getPrismaClient();

  // 1. Create Default User & Project
  const user = await db.user.upsert({
    where: { email: 'admin@cloudsim.local' },
    update: {},
    create: {
      email: 'admin@cloudsim.local',
      passwordHash: '$2b$10$e8Z4b3z1r0T0yPz1u0v1.e0c1b2a3d4e5f6g7h8i9j0k', // mock hash
      name: 'CloudSim Admin',
      role: 'ADMIN',
    },
  });

  const project = await db.project.upsert({
    where: { id: 'default-project-id' },
    update: {},
    create: {
      id: 'default-project-id',
      name: 'Default Simulation Workspace',
      description: 'Primary project sandbox for workload performance analysis.',
      userId: user.id,
    },
  });

  // 2. Initialize Default Chaos Config
  await db.chaosConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      latencyInjectionMs: 0,
      errorInjectionPercentage: 0,
      cacheDisabled: false,
      trafficSpikeActive: false,
    },
  });

  // 3. Seed Students ERP
  console.log('  Seeding Student ERP data...');
  const studentNames = [
    'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Evan Wright',
    'Fiona Gallagher', 'George Clark', 'Hannah Abbott', 'Ian Malcolm', 'Julia Roberts',
    'Kevin Bacon', 'Laura Croft', 'Michael Scott', 'Nora Jones', 'Oscar Wilde'
  ];

  const departments = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Business Admin'];

  for (let i = 0; i < studentNames.length; i++) {
    const student = await db.student.upsert({
      where: { email: `student${i + 1}@university.edu` },
      update: {},
      create: {
        name: studentNames[i],
        email: `student${i + 1}@university.edu`,
        department: departments[i % departments.length],
        year: (i % 4) + 1,
        gpa: parseFloat((3.0 + (i % 10) * 0.1).toFixed(2)),
      },
    });

    // Attendance
    await db.attendance.createMany({
      data: [
        { studentId: student.id, date: new Date('2026-09-20'), status: 'PRESENT', subject: 'Cloud Computing' },
        { studentId: student.id, date: new Date('2026-09-21'), status: 'PRESENT', subject: 'Database Systems' },
        { studentId: student.id, date: new Date('2026-09-22'), status: 'LATE', subject: 'Algorithms' },
      ],
      skipDuplicates: true,
    });

    // Marks
    await db.mark.createMany({
      data: [
        { studentId: student.id, subject: 'Cloud Computing', score: 92, maxScore: 100, grade: 'A' },
        { studentId: student.id, subject: 'Database Systems', score: 88, maxScore: 100, grade: 'A-' },
        { studentId: student.id, subject: 'Operating Systems', score: 85, maxScore: 100, grade: 'B+' },
      ],
      skipDuplicates: true,
    });

    // Fees
    await db.fee.createMany({
      data: [
        { studentId: student.id, amount: 4500.0, dueDate: new Date('2026-10-15'), status: 'PAID', semester: 'Fall 2026' },
        { studentId: student.id, amount: 4500.0, dueDate: new Date('2027-02-15'), status: 'PENDING', semester: 'Spring 2027' },
      ],
      skipDuplicates: true,
    });

    // Notifications
    await db.notification.createMany({
      data: [
        { studentId: student.id, title: 'Exam Schedule Out', message: 'Final semester exam schedule has been published.' },
        { studentId: student.id, title: 'Fee Reminder', message: 'Spring 2027 fee payment window is now open.' },
      ],
      skipDuplicates: true,
    });
  }

  // Timetables
  for (const dept of departments) {
    for (let yr = 1; yr <= 4; yr++) {
      await db.timetable.createMany({
        data: [
          { department: dept, year: yr, dayOfWeek: 'MONDAY', subject: 'Distributed Systems', room: 'Hall A1', timeSlot: '09:00 - 10:30' },
          { department: dept, year: yr, dayOfWeek: 'TUESDAY', subject: 'Database Architectures', room: 'Lab B3', timeSlot: '11:00 - 12:30' },
          { department: dept, year: yr, dayOfWeek: 'WEDNESDAY', subject: 'Web Infrastructure', room: 'Hall C2', timeSlot: '14:00 - 15:30' },
        ],
        skipDuplicates: true,
      });
    }
  }

  // 4. Seed CRM Data
  console.log('  Seeding CRM data...');
  const crmCompanies = [
    { name: 'Acme Corp', industry: 'Retail', email: 'contact@acme.com' },
    { name: 'Stark Tech', industry: 'Defense & AI', email: 'sales@starktech.com' },
    { name: 'Wayne Enterprises', industry: 'Logistics', email: 'info@wayne.com' },
    { name: 'Cyberdyne Systems', industry: 'Robotics', email: 'leads@cyberdyne.io' },
    { name: 'Initech LLC', industry: 'Finance', email: 'support@initech.org' },
  ];

  for (const c of crmCompanies) {
    const customer = await db.customer.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: `${c.name} Executive`,
        email: c.email,
        company: c.name,
        industry: c.industry,
        status: 'ACTIVE',
      },
    });

    await db.lead.createMany({
      data: [
        { customerId: customer.id, title: `${c.name} Cloud Migration`, value: 150000.0, status: 'QUALIFIED', source: 'Web Portal' },
        { customerId: customer.id, title: `${c.name} Support SLA Contract`, value: 45000.0, status: 'CONTACTED', source: 'Inbound Sales' },
      ],
      skipDuplicates: true,
    });

    await db.opportunity.createMany({
      data: [
        { customerId: customer.id, name: `${c.name} Enterprise Deal`, amount: 250000.0, stage: 'NEGOTIATION', probability: 0.8, closeDate: new Date('2026-11-30') },
      ],
      skipDuplicates: true,
    });
  }

  // 5. Seed E-Commerce Products
  console.log('  Seeding E-Commerce data...');
  const products = [
    { name: 'CloudSim Pro Wireless Router', sku: 'ROUTER-PRO-01', category: 'Networking', price: 199.99, stock: 450, description: 'High-speed Wi-Fi 6E cloud managed router.' },
    { name: 'Server Rack Power Supply Unit 850W', sku: 'PSU-850W-02', category: 'Hardware', price: 149.50, stock: 120, description: '80 Plus Gold modular server PSU.' },
    { name: 'NVMe Gen4 Cloud Storage SSD 2TB', sku: 'SSD-NVME-2TB', category: 'Storage', price: 179.00, stock: 800, description: 'Ultra-fast read/write PCIe 4.0 internal storage.' },
    { name: 'Developer Mechanical Keyboard RGB', sku: 'KB-DEV-RGB', category: 'Peripherals', price: 129.99, stock: 300, description: 'Hot-swappable tactile mechanical keyboard.' },
    { name: '4K UltraWide Monitor 34 inch', sku: 'MON-4K-34', category: 'Monitors', price: 499.00, stock: 75, description: 'Ergonomic 144Hz IPS display for high efficiency.' },
  ];

  for (const p of products) {
    await db.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  });
