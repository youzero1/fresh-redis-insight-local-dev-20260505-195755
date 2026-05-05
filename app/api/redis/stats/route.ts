import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stats = {
      totalKeys: 12,
      usedMemory: '2.5 MB',
      usedMemoryPeak: '3.1 MB',
      connectedClients: 3,
      totalCommands: 145231,
      opsPerSecond: 42,
      hitRate: 94.7,
      keysByType: {
        string: 4,
        hash: 3,
        list: 2,
        set: 1,
        zset: 1,
        stream: 0,
      },
      keysByTTL: {
        noExpiry: 6,
        lessThan1Min: 1,
        lessThan1Hour: 3,
        moreThan1Hour: 2,
      },
      serverInfo: {
        version: '7.2.4',
        mode: 'standalone',
        os: 'Linux 5.15.0',
        arch: 'x86_64',
        uptimeDays: 14,
      },
    };

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
