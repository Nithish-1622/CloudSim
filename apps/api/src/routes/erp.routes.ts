import { FastifyInstance } from 'fastify';
import { prisma } from '@cloudsim/database';
import { RedisService } from '../services/redis.service';
import { ChaosService } from '../services/chaos.service';

export async function erpRoutes(fastify: FastifyInstance) {
  // ERP Auth Login
  fastify.post('/api/erp/auth/login', async (request, reply) => {
    const { email } = (request.body as any) || {};
    return reply.send({
      success: true,
      token: `erp-jwt-token-${Date.now()}`,
      user: { email: email || 'student1@university.edu', role: 'STUDENT' },
    });
  });

  // Get Student Profile (GET /api/erp/students/:id)
  fastify.get('/api/erp/students/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const chaos = await ChaosService.getConfig();
    const cacheKey = `erp:student:${id}`;

    if (!chaos.cacheDisabled) {
      const cached = await RedisService.get(cacheKey);
      if (cached) {
        reply.header('X-Cache', 'HIT');
        return reply.send(JSON.parse(cached));
      }
    }

    reply.header('X-Cache', 'MISS');
    let student = null;
    try {
      if (process.env.DATABASE_URL) {
        student = await prisma.student.findFirst({
          where: { OR: [{ id }, { email: `${id}@university.edu` }] },
        });
      }
    } catch (err) {}

    const result = student || {
      id,
      name: 'Alice Johnson',
      email: `${id}@university.edu`,
      department: 'Computer Science',
      year: 3,
      gpa: 3.85,
    };

    if (!chaos.cacheDisabled) {
      await RedisService.set(cacheKey, JSON.stringify(result), 60);
    }

    return reply.send(result);
  });

  // Get Student Attendance (GET /api/erp/students/:id/attendance)
  fastify.get('/api/erp/students/:id/attendance', async (request, reply) => {
    const { id } = request.params as { id: string };
    reply.header('X-Cache', 'MISS');

    let records: any[] = [];
    try {
      if (process.env.DATABASE_URL) {
        records = await prisma.attendance.findMany({ take: 10 });
      }
    } catch (err) {}

    return reply.send({
      studentId: id,
      totalClasses: 45,
      attendedClasses: 42,
      percentage: 93.3,
      records,
    });
  });

  // Get Student Marks (GET /api/erp/students/:id/marks)
  fastify.get('/api/erp/students/:id/marks', async (request, reply) => {
    const { id } = request.params as { id: string };
    reply.header('X-Cache', 'MISS');

    let marks: any[] = [];
    try {
      if (process.env.DATABASE_URL) {
        marks = await prisma.mark.findMany({ take: 10 });
      }
    } catch (err) {}

    return reply.send({
      studentId: id,
      gpa: 3.85,
      marks: marks.length > 0 ? marks : [
        { subject: 'Cloud Computing', score: 92, maxScore: 100, grade: 'A' },
        { subject: 'Database Systems', score: 88, maxScore: 100, grade: 'A-' },
      ],
    });
  });

  // Get Timetable (GET /api/erp/students/:id/timetable)
  fastify.get('/api/erp/students/:id/timetable', async (request, reply) => {
    const { id } = request.params as { id: string };
    const chaos = await ChaosService.getConfig();
    const cacheKey = `erp:timetable:${id}`;

    if (!chaos.cacheDisabled) {
      const cached = await RedisService.get(cacheKey);
      if (cached) {
        reply.header('X-Cache', 'HIT');
        return reply.send(JSON.parse(cached));
      }
    }

    reply.header('X-Cache', 'MISS');
    let timetable: any[] = [];
    try {
      if (process.env.DATABASE_URL) {
        timetable = await prisma.timetable.findMany({ take: 10 });
      }
    } catch (err) {}

    const result = {
      studentId: id,
      semester: 'Fall 2026',
      schedule: timetable.length > 0 ? timetable : [
        { dayOfWeek: 'MONDAY', subject: 'Distributed Systems', room: 'Hall A1', timeSlot: '09:00 - 10:30' },
        { dayOfWeek: 'TUESDAY', subject: 'Database Architectures', room: 'Lab B3', timeSlot: '11:00 - 12:30' },
      ],
    };

    if (!chaos.cacheDisabled) {
      await RedisService.set(cacheKey, JSON.stringify(result), 120);
    }

    return reply.send(result);
  });

  // Get Student Fees (GET /api/erp/students/:id/fees)
  fastify.get('/api/erp/students/:id/fees', async (request, reply) => {
    const { id } = request.params as { id: string };
    reply.header('X-Cache', 'MISS');

    let fees: any[] = [];
    try {
      if (process.env.DATABASE_URL) {
        fees = await prisma.fee.findMany({ take: 5 });
      }
    } catch (err) {}

    return reply.send({
      studentId: id,
      totalDue: 4500.0,
      currency: 'USD',
      fees: fees.length > 0 ? fees : [
        { amount: 4500.0, dueDate: '2026-10-15', status: 'PAID', semester: 'Fall 2026' },
      ],
    });
  });

  // Get Notifications (GET /api/erp/notifications)
  fastify.get('/api/erp/notifications', async (request, reply) => {
    reply.header('X-Cache', 'MISS');
    let notifications: any[] = [];
    try {
      if (process.env.DATABASE_URL) {
        notifications = await prisma.notification.findMany({ take: 10 });
      }
    } catch (err) {}

    return reply.send(
      notifications.length > 0
        ? notifications
        : [
            { id: '1', title: 'Exam Schedule Released', message: 'Semester end exams start Nov 10.', read: false },
          ]
    );
  });
}
