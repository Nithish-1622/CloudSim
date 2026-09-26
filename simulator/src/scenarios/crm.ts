import { WorkloadOperation } from './types';

export const CRM_OPERATIONS: WorkloadOperation[] = [
  {
    name: 'CRM Login',
    weight: 25,
    method: 'POST',
    pathTemplate: () => '/api/crm/auth/login',
    bodyFactory: () => ({
      email: 'admin@cloudsim.local',
      password: 'password123',
    }),
  },
  {
    name: 'Get Customer List',
    weight: 25,
    method: 'GET',
    pathTemplate: () => '/api/crm/customers',
  },
  {
    name: 'Get Customer Detail',
    weight: 15,
    method: 'GET',
    pathTemplate: (vUserId) => {
      const idx = (parseInt(vUserId, 36) % 5) + 1;
      return `/api/crm/customers/customer-${idx}`;
    },
  },
  {
    name: 'Get Lead Pipeline',
    weight: 15,
    method: 'GET',
    pathTemplate: () => '/api/crm/leads',
  },
  {
    name: 'Create New Lead',
    weight: 10,
    method: 'POST',
    pathTemplate: () => '/api/crm/leads',
    bodyFactory: (vUserId) => ({
      title: `Inbound Cloud Inquiry #${vUserId.slice(0, 4)}`,
      value: Math.floor(Math.random() * 50000) + 10000,
      status: 'NEW',
      source: 'Simulation Generator',
    }),
  },
  {
    name: 'Get Opportunities',
    weight: 5,
    method: 'GET',
    pathTemplate: () => '/api/crm/opportunities',
  },
  {
    name: 'Get Revenue Reports',
    weight: 5,
    method: 'GET',
    pathTemplate: () => '/api/crm/reports',
  },
];
