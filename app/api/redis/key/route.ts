import { NextRequest, NextResponse } from 'next/server';

const mockData: Record<string, { type: string; value: unknown; ttl: number }> = {
  'user:1001': {
    type: 'hash',
    ttl: 3600,
    value: {
      id: '1001',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'admin',
      createdAt: '2024-01-15T10:30:00Z',
    },
  },
  'user:1002': {
    type: 'hash',
    ttl: -1,
    value: {
      id: '1002',
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'user',
      createdAt: '2024-02-20T14:15:00Z',
    },
  },
  'session:abc123': {
    type: 'string',
    ttl: 1800,
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDAxIiwiaWF0IjoxNzA5MDAwMDAwfQ.signature',
  },
  'cache:products': {
    type: 'list',
    ttl: 300,
    value: [
      '{"id":1,"name":"Widget A","price":29.99}',
      '{"id":2,"name":"Widget B","price":49.99}',
      '{"id":3,"name":"Widget C","price":19.99}',
    ],
  },
  'cache:categories': {
    type: 'set',
    ttl: 600,
    value: ['electronics', 'clothing', 'books', 'home', 'sports'],
  },
  'leaderboard': {
    type: 'zset',
    ttl: -1,
    value: [
      { member: 'player1', score: 9500 },
      { member: 'player2', score: 8750 },
      { member: 'player3', score: 7200 },
      { member: 'player4', score: 6100 },
    ],
  },
  'counter:visits': {
    type: 'string',
    ttl: -1,
    value: '142857',
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const data = mockData[key];
    if (!data) {
      return NextResponse.json({
        key,
        type: 'string',
        ttl: -1,
        value: `Value for key: ${key}`,
      });
    }

    return NextResponse.json({ key, ...data });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch key' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, ttl } = body;

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true, key, value, ttl });
  } catch {
    return NextResponse.json({ error: 'Failed to update key' }, { status: 500 });
  }
}
