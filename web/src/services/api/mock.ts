import { sleep } from '@/lib/utils'

export interface ApiEvent {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  status: number
  duration: number
  timestamp: Date
  success: boolean
  region: string
}

export interface InsightCard {
  id: string
  title: string
  value: string
  change: number
  trend: 'up' | 'down' | 'stable'
  description: string
  sparkline: number[]
}

export interface SystemMetric {
  label: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
}

export interface TrafficDataPoint {
  time: string
  requests: number
  errors: number
  latency: number
}

export interface EndpointStat {
  name: string
  calls: number
  fill: string
}

const ENDPOINTS = [
  '/api/health',
  '/api/institutions',
  '/api/events',
  '/api/citizen/check',
  '/api/playbooks/search',
  '/api/agent/triage',
  '/api/agent/defender',
  '/api/hitl/pending',
  '/api/agent/route',
  '/api/agent/investigate',
]

const REGIONS = ['us-east-1', 'eu-west-1', 'sa-east-1', 'ap-northeast-1']

let eventCounter = 1000

export function generateEvent(): ApiEvent {
  const method = ['GET', 'POST', 'GET', 'GET', 'POST', 'PUT'][
    Math.floor(Math.random() * 6)
  ] as ApiEvent['method']
  const success = Math.random() > 0.08
  return {
    id: `req_${(eventCounter++).toString(36)}`,
    method,
    endpoint: ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)],
    status: success ? (method === 'POST' ? 201 : 200) : [400, 404, 500][Math.floor(Math.random() * 3)],
    duration: success ? Math.floor(Math.random() * 280) + 12 : Math.floor(Math.random() * 800) + 200,
    timestamp: new Date(),
    success,
    region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
  }
}

export function getMockInsights(): InsightCard[] {
  return [
    {
      id: 'perf',
      title: 'API Performance',
      value: '+12%',
      change: 12,
      trend: 'up',
      description: 'Improved this week vs last week',
      sparkline: [62, 58, 67, 71, 68, 74, 79, 76, 82, 85, 88, 92],
    },
    {
      id: 'uptime',
      title: 'Uptime',
      value: '99.97%',
      change: 0.02,
      trend: 'up',
      description: 'No downtime in the last 7 days',
      sparkline: [100, 100, 99.8, 100, 100, 100, 99.9, 100, 100, 100, 100, 99.97],
    },
    {
      id: 'latency',
      title: 'Avg Latency',
      value: '84 ms',
      change: -18,
      trend: 'up',
      description: '18ms faster than last week',
      sparkline: [142, 138, 125, 118, 112, 107, 98, 95, 91, 88, 86, 84],
    },
    {
      id: 'requests',
      title: 'Requests Today',
      value: '14,832',
      change: 8,
      trend: 'up',
      description: 'Peak at 09:14 AM (847 req/min)',
      sparkline: [320, 480, 720, 840, 790, 650, 580, 710, 820, 760, 690, 847],
    },
  ]
}

export function getMockTrafficData(): TrafficDataPoint[] {
  const points: TrafficDataPoint[] = []
  const base = new Date()
  base.setHours(base.getHours() - 11)
  for (let i = 0; i < 24; i++) {
    const hour = new Date(base)
    hour.setMinutes(i * 30)
    const peak = i >= 8 && i <= 16
    points.push({
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      requests: peak ? Math.floor(Math.random() * 600) + 400 : Math.floor(Math.random() * 200) + 50,
      errors: Math.floor(Math.random() * 18),
      latency: peak ? Math.floor(Math.random() * 60) + 60 : Math.floor(Math.random() * 40) + 30,
    })
  }
  return points
}

export function getMockEndpointStats(): EndpointStat[] {
  return [
    { name: '/api/events', calls: 4230, fill: 'var(--color-events)' },
    { name: '/api/health', calls: 3180, fill: 'var(--color-health)' },
    { name: '/api/citizen', calls: 2760, fill: 'var(--color-citizen)' },
    { name: '/api/agent', calls: 2190, fill: 'var(--color-agent)' },
    { name: '/api/hitl', calls: 1470, fill: 'var(--color-hitl)' },
  ]
}

export function getMockSystemMetrics(): SystemMetric[] {
  return [
    { label: 'Uptime', value: 99.97, unit: '%', status: 'healthy' },
    { label: 'Avg Response', value: 84, unit: 'ms', status: 'healthy' },
    { label: 'Active Monitors', value: 12, unit: '', status: 'healthy' },
    { label: 'Success Rate', value: 98.4, unit: '%', status: 'healthy' },
    { label: 'Error Rate', value: 1.6, unit: '%', status: 'warning' },
    { label: 'CPU Usage', value: 34, unit: '%', status: 'healthy' },
  ]
}

export function getMockLogs(): ApiEvent[] {
  return Array.from({ length: 40 }, (_, i) => {
    const success = Math.random() > 0.1
    const method = ['GET', 'POST', 'GET', 'POST', 'PUT', 'DELETE'][
      Math.floor(Math.random() * 6)
    ] as ApiEvent['method']
    const ts = new Date()
    ts.setMinutes(ts.getMinutes() - i * 3 - Math.floor(Math.random() * 3))
    return {
      id: `req_${(9000 - i).toString(36)}`,
      method,
      endpoint: ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)],
      status: success ? (method === 'POST' ? 201 : 200) : [400, 500][Math.floor(Math.random() * 2)],
      duration: success ? Math.floor(Math.random() * 250) + 15 : Math.floor(Math.random() * 600) + 300,
      timestamp: ts,
      success,
      region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
    }
  })
}

export async function mockApiRequest(
  endpoint: string,
  method: string,
  body?: string
): Promise<{ status: number; data: unknown; duration: number }> {
  await sleep(600 + Math.random() * 800)
  const success = Math.random() > 0.15
  const duration = Math.floor(Math.random() * 200) + 40
  if (!success) {
    return {
      status: 500,
      duration,
      data: { error: 'Internal Server Error', message: 'Mock error for demo purposes', code: 'MOCK_ERR' },
    }
  }
  const responses: Record<string, unknown> = {
    '/api/health': { status: 'ok', mode: 'mock', version: '0.1.0', uptime: 847293 },
    '/api/institutions': {
      data: [
        { id: 'digecam', name: 'DIGECAM', sector: 'defense', severity: 'critical', monitored: true },
        { id: 'mintrab', name: 'MINTRAB', sector: 'labor', severity: 'medium', monitored: true },
        { id: 'mspas', name: 'MSPAS', sector: 'health', severity: 'high', monitored: true },
        { id: 'renap', name: 'RENAP', sector: 'civil', severity: 'medium', monitored: false },
      ],
    },
    '/api/events': {
      data: [
        { id: 'evt_001', institution: 'DIGECAM', severity: 'critical', status: 'published', created_at: '2026-04-12T14:23:00Z' },
        { id: 'evt_002', institution: 'MINTRAB', severity: 'medium', status: 'pending_review', created_at: '2026-05-03T09:11:00Z' },
      ],
    },
    '/api/citizen/check': { matches: 1, prefix: body ? JSON.parse(body || '{}').hash_prefix : 'a1b2c', playbook: 'rotate-credentials' },
    '/api/hitl/pending': { count: 3, events: [{ id: 'evt_003', severity: 'high', institution: 'MSPAS' }] },
  }
  return {
    status: method === 'POST' ? 201 : 200,
    duration,
    data: responses[endpoint] ?? { message: 'OK', endpoint, method, timestamp: new Date().toISOString() },
  }
}
