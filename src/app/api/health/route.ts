import { NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring and load balancers
 * 
 * Returns:
 * - 200 OK: Application is healthy
 * - 503 Service Unavailable: Application is unhealthy
 */
export async function GET() {
  try {
    // Basic health checks
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      checks: {
        server: 'ok',
        memory: checkMemoryUsage(),
      }
    };

    return NextResponse.json(healthStatus, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 503 }
    );
  }
}

/**
 * Check memory usage and return status
 */
function checkMemoryUsage(): string {
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const percentUsed = Math.round((heapUsedMB / heapTotalMB) * 100);

  if (percentUsed > 90) {
    return 'warning';
  }
  return 'ok';
}

// Support HEAD requests for simple health checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
