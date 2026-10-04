import { fetch, Agent } from 'undici';

export interface RequestExecutionResult {
  endpoint: string;
  operationName: string;
  statusCode: number;
  latencyMs: number;
  success: boolean;
  bytesReceived: number;
  cacheHit: boolean;
  errorMessage?: string;
}

const dispatcher = new Agent({
  keepAliveTimeout: 10000,
  keepAliveMaxTimeout: 30000,
  connections: 200,
});

export async function executeRequest(
  baseUrl: string,
  simulationId: string,
  virtualUserId: string,
  operationName: string,
  path: string,
  method: 'GET' | 'POST',
  body?: any
): Promise<RequestExecutionResult> {
  const url = `${baseUrl}${path}`;
  const requestId = `req-${Math.random().toString(36).substring(2, 9)}`;
  const startTime = performance.now();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-request-id': requestId,
    'x-simulation-id': simulationId,
    'x-virtual-user-id': virtualUserId,
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      dispatcher,
    });

    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    const cacheHeader = response.headers.get('x-cache');
    const cacheHit = cacheHeader?.toUpperCase() === 'HIT';

    const text = await response.text();
    const bytesReceived = Buffer.byteLength(text, 'utf-8');

    return {
      endpoint: path.split('?')[0],
      operationName,
      statusCode: response.status,
      latencyMs,
      success: response.status >= 200 && response.status < 400,
      bytesReceived,
      cacheHit,
    };
  } catch (error: any) {
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    return {
      endpoint: path.split('?')[0],
      operationName,
      statusCode: 500,
      latencyMs,
      success: false,
      bytesReceived: 0,
      cacheHit: false,
      errorMessage: error?.message || 'Network request failed',
    };
  }
}
