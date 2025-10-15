import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitStore>()

export function rateLimit(
  request: NextRequest,
  limit: number = 10,
  windowMs: number = 60000
): NextResponse | null {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  
  const record = store.get(ip)
  
  if (!record || now > record.resetTime) {
    store.set(ip, {
      count: 1,
      resetTime: now + windowMs
    })
    return null
  }
  
  if (record.count >= limit) {
    return NextResponse.json(
      { 
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(record.resetTime)
        }
      }
    )
  }
  
  record.count++
  return null
}

// تنظيف السجلات القديمة كل 5 دقائق
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(ip)
      }
    }
  }, 5 * 60 * 1000)
}