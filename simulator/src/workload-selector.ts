import { ApplicationType } from '@cloudsim/shared';
import { WorkloadOperation } from './scenarios/types';
import { STUDENT_ERP_OPERATIONS } from './scenarios/student-erp';
import { CRM_OPERATIONS } from './scenarios/crm';
import { ECOMMERCE_OPERATIONS } from './scenarios/ecommerce';

export function selectWorkloadOperation(app: ApplicationType): WorkloadOperation {
  let operations: WorkloadOperation[];

  switch (app) {
    case 'student_erp':
      operations = STUDENT_ERP_OPERATIONS;
      break;
    case 'crm':
      operations = CRM_OPERATIONS;
      break;
    case 'ecommerce':
      operations = ECOMMERCE_OPERATIONS;
      break;
    default:
      operations = STUDENT_ERP_OPERATIONS;
  }

  const random = Math.random() * 100;
  let cumulative = 0;

  for (const op of operations) {
    cumulative += op.weight;
    if (random <= cumulative) {
      return op;
    }
  }

  return operations[0];
}
