import { WorkloadOperation } from './types';

export const STUDENT_ERP_OPERATIONS: WorkloadOperation[] = [
  {
    name: 'ERP Login',
    weight: 30,
    method: 'POST',
    pathTemplate: () => '/api/erp/auth/login',
    bodyFactory: (vUserId) => ({
      email: `student${(parseInt(vUserId, 36) % 15) + 1}@university.edu`,
      password: 'password123',
    }),
  },
  {
    name: 'Get Student Profile',
    weight: 20,
    method: 'GET',
    pathTemplate: (vUserId) => {
      const studentIdx = (parseInt(vUserId, 36) % 15) + 1;
      return `/api/erp/students/student-${studentIdx}`;
    },
  },
  {
    name: 'Get Student Attendance',
    weight: 15,
    method: 'GET',
    pathTemplate: (vUserId) => {
      const studentIdx = (parseInt(vUserId, 36) % 15) + 1;
      return `/api/erp/students/student-${studentIdx}/attendance`;
    },
  },
  {
    name: 'Get Student Marks',
    weight: 15,
    method: 'GET',
    pathTemplate: (vUserId) => {
      const studentIdx = (parseInt(vUserId, 36) % 15) + 1;
      return `/api/erp/students/student-${studentIdx}/marks`;
    },
  },
  {
    name: 'Get Timetable',
    weight: 10,
    method: 'GET',
    pathTemplate: (vUserId) => {
      const studentIdx = (parseInt(vUserId, 36) % 15) + 1;
      return `/api/erp/students/student-${studentIdx}/timetable`;
    },
  },
  {
    name: 'Get Fees Summary',
    weight: 5,
    method: 'GET',
    pathTemplate: (vUserId) => {
      const studentIdx = (parseInt(vUserId, 36) % 15) + 1;
      return `/api/erp/students/student-${studentIdx}/fees`;
    },
  },
  {
    name: 'Get Notifications',
    weight: 5,
    method: 'GET',
    pathTemplate: () => '/api/erp/notifications',
  },
];
