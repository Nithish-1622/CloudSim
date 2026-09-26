export interface WorkloadOperation {
  name: string;
  weight: number; // Percentage 0 - 100
  method: 'GET' | 'POST';
  pathTemplate: (vUserId: string, state: Record<string, any>) => string;
  bodyFactory?: (vUserId: string, state: Record<string, any>) => any;
}
