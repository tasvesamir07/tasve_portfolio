import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export default async function Image() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data } = await supabase.from('profile').select('name, title').limit(1).single()

    const name = data?.name || 'Md. Tasve Al Samir'
    const title = data?.title || 'Full Stack Engineer'

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #07090e 0%, #0f121d 50%, #1a1040 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.15)',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(6, 182, 212, 0.12)',
            filter: 'blur(90px)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontFamily: '"Fira Code", monospace',
              fontSize: 24,
              color: '#06b6d4',
              letterSpacing: '0.1em',
              marginBottom: 16,
            }}
          >
            ~ Hello World, I&apos;m
          </span>
          <span
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontSize: 72,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              textAlign: 'center',
            }}
          >
            {name}
          </span>
          <span
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontSize: 36,
              fontWeight: 700,
              background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
              backgroundClip: 'text',
              color: 'transparent',
              marginTop: 12,
            }}
          >
            {title}
          </span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  } catch {
    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#07090e',
          color: '#ffffff',
          fontSize: 48,
          fontWeight: 700,
          fontFamily: '"Outfit", sans-serif',
        }}
      >
        Md. Tasve Al Samir
      </div>,
      { width: 1200, height: 630 },
    )
  }
}
