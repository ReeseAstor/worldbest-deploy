import { NextResponse } from 'next/server';

// Import version from package.json (loaded at build time)
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

interface MemoryStats {
  heapUsedMB: number;
  heapTotalMB: number;
  rssMB: number;
  externalMB: number;
  percentUsed: number;
  status: 'ok' | 'warning' | 'critical';
}

interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  responseTimeMs: number;
  system: {
    uptime: number;
    uptimeFormatted: string;
    nodeVersion: string;
    platform: string;
    arch: string;
  };
  memory: MemoryStats;
  environment: string;
  version: string;
  checks: {
    server: 'ok' | 'error';
    memory: 'ok' | 'warning' | 'critical';
  };
}

/**
 * Health check endpoint for monitoring and load balancers
 * 
 * Returns:
 * - 200 OK: Application is healthy
 * - 503 Service Unavailable: Application is unhealthy
 * 
 * Provides detailed system information including:
 * - System uptime
 * - Memory usage statistics
 * - Node.js version
 * - Environment indicator
 * - Response time measurement
 */
export async function GET() {
  const startTime = performance.now();
  
  try {
    const memoryStats = getMemoryStats();
    const uptimeSeconds = process.uptime();
    
    // Determine overall health status
    const overallStatus = memoryStats.status === 'critical' ? 'degraded' : 'healthy';
    
    const healthReport: HealthReport = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      system: {
        uptime: uptimeSeconds,
        uptimeFormatted: formatUptime(uptimeSeconds),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      memory: memoryStats,
      environment: process.env.NODE_ENV || 'development',
      version: APP_VERSION,
      checks: {
        server: 'ok',
        memory: memoryStats.status,
      },
    };

    // Update response time after all calculations
    healthReport.responseTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    return NextResponse.json(healthReport, { 
      status: overallStatus === 'healthy' ? 200 : 200, // Still return 200 for degraded
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Response-Time': `${healthReport.responseTimeMs}ms`,
      },
    });
  } catch (error) {
    const responseTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTimeMs,
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: {
          server: 'error',
        },
      }, 
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Response-Time': `${responseTimeMs}ms`,
        },
      }
    );
  }
}

/**
 * Get detailed memory usage statistics
 */
function getMemoryStats(): MemoryStats {
  const memUsage = process.memoryUsage();
  
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100;
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100;
  const rssMB = Math.round(memUsage.rss / 1024 / 1024 * 100) / 100;
  const externalMB = Math.round(memUsage.external / 1024 / 1024 * 100) / 100;
  const percentUsed = Math.round((heapUsedMB / heapTotalMB) * 100);

  let status: 'ok' | 'warning' | 'critical' = 'ok';
  if (percentUsed > 95) {
    status = 'critical';
  } else if (percentUsed > 85) {
    status = 'warning';
  }

  return {
    heapUsedMB,
    heapTotalMB,
    rssMB,
    externalMB,
    percentUsed,
    status,
  };
}

/**
 * Format uptime in a human-readable format
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

// Support HEAD requests for simple health checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
