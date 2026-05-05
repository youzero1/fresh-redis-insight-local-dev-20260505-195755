import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { host, port, password, db } = body;

    if (!host || !port) {
      return NextResponse.json({ error: 'Host and port are required' }, { status: 400 });
    }

    // Simulate connection test (in production, use ioredis)
    const connectionInfo = {
      host: host || 'localhost',
      port: parseInt(port) || 6379,
      db: parseInt(db) || 0,
      hasPassword: !!password,
      connected: true,
      serverVersion: '7.2.4',
      usedMemory: '2.5 MB',
      connectedClients: 3,
      uptimeSeconds: 86400,
    };

    return NextResponse.json({ success: true, info: connectionInfo });
  } catch {
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 });
  }
}
