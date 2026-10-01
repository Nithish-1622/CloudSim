import { ApplicationType } from '@cloudsim/shared';
import { selectWorkloadOperation } from './workload-selector';
import { WorkloadOperation } from './scenarios/types';

export interface VirtualUserSession {
  userId: string;
  application: ApplicationType;
  sessionToken?: string;
  state: Record<string, any>;
}

export class VirtualUser {
  public id: string;
  public application: ApplicationType;
  public state: Record<string, any> = {};

  constructor(idIndex: number, application: ApplicationType) {
    // Generate a clean logical user identifier
    this.id = `vu-${idIndex.toString(36).padStart(6, '0')}`;
    this.application = application;
  }

  public getNextAction(): {
    operation: WorkloadOperation;
    path: string;
    method: 'GET' | 'POST';
    body?: any;
  } {
    const operation = selectWorkloadOperation(this.application);
    const path = operation.pathTemplate(this.id, this.state);
    const body = operation.bodyFactory ? operation.bodyFactory(this.id, this.state) : undefined;

    return {
      operation,
      path,
      method: operation.method,
      body,
    };
  }
}
