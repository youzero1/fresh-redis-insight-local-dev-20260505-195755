import { NextRequest, NextResponse } from 'next/server';

const mockKeys = [
  { key: 'user:1001', type: 'hash', ttl: 3600, size: 256 },
  { key: 'user:1002', type: 'hash', ttl: -1, size: 312 },
  { key: 'session:abc123', type: 'string', ttl: 1800, size: 128 },
  { key: 'session:def456', type: 'string', ttl: 900, size: 96 },
  { key: 'cache:products', type: 'list', ttl: 300, size: 4096 },
  { key: 'cache:categories', type: 'set', ttl: 600, size: 512 },
  { key: 'queue:emails', type: 'list', ttl: -1, size: 2048 },
  { key: 'config:app', type: 'hash', ttl: -1, size: 192 },
  { key: 'leaderboard', type: 'zset', ttl: -1, size: 8192 },
  { key: 'counter:visits', type: 'string', ttl: -1, size: 16 },
  { key: 'lock:process', type: 'string', ttl: 30, size: 32 },
  { key: 'pubsub:channel1', type: 'string', ttl: -1, size: 64 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get('pattern') || '*';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filtered = mockKeys;
    if (pattern && pattern !== '*') {
      const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'), 'i');
      filtered = mockKeys.filter(k => regex.test(k.key));
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return NextResponse.json({
      keys: paginated,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch keys' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true, deleted: key });
  } catch {
    return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 });
  }
}
