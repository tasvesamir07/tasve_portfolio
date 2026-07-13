import type { Metadata } from 'next'
import { Outfit, Fira_Code } from 'next/font/google'
import './globals.css'
import ParticleBg from '@/components/ParticleBg'
import CustomCursor from '@/components/CustomCursor'
import { Analytics } from '@vercel/analytics/react'
import { getSupabase } from '@/lib/supabase'
import { ThemeProvider } from '@/lib/theme'
import PwaRegister from '@/components/PwaRegister'
import { WebVitalsReporter } from '@/components/WebVitals'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
})

const firaCode = Fira_Code({
  variable: '--font-fira-code',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = getSupabase()
    const { data } = await supabase
      .from('profile')
      .select('name, title, description')
      .limit(1)
      .single()
    if (data) {
      return {
        metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
        title: `${data.name} | ${data.title}`,
        description: data.description,
        keywords: [
          data.name,
          'Web Developer',
          'Software Engineer',
          'React',
          'Next.js',
          'Framer Motion',
          'Tailwind CSS',
        ],
        authors: [{ name: data.name }],
        openGraph: {
          title: data.name,
          description: data.description,
          type: 'website',
          locale: 'en_US',
          siteName: data.name,
          images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
        },
        twitter: {
          card: 'summary_large_image',
          title: data.name,
          description: data.description,
          images: ['/opengraph-image'],
        },
      }
    }
  } catch (err) {
    console.error('Metadata fetch failed:', err)
  }
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: 'Samir Anik | Creative Software Engineer & Full-Stack Developer',
    description:
      'Portfolio of Samir Anik - showcasing dynamic web projects, custom high-end animations, and modern API integrations.',
    keywords: [
      'Md. Tasve Al Samir',
      'Web Developer',
      'Software Engineer',
      'React',
      'Next.js',
      'Framer Motion',
      'Tailwind CSS',
    ],
    authors: [{ name: 'Md. Tasve Al Samir' }],
    openGraph: {
      title: 'Samir Anik | Creative Software Engineer & Full-Stack Developer',
      description:
        'Portfolio of Samir Anik - showcasing dynamic web projects, custom high-end animations, and modern API integrations.',
      type: 'website',
      locale: 'en_US',
      siteName: 'Samir Anik',
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Samir Anik | Creative Software Engineer & Full-Stack Developer',
      description:
        'Portfolio of Samir Anik - showcasing dynamic web projects, custom high-end animations, and modern API integrations.',
      images: ['/opengraph-image'],
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${firaCode.variable} scroll-smooth antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function(){try{
              var t=localStorage.getItem('theme');
              if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);
            }catch(e){}})();
            window.addEventListener('error', function(e) {
              var msg = e.message || '';
              var target = e.target || {};
              var isChunkError = msg.indexOf('ChunkLoadError') !== -1 || 
                                 msg.indexOf('Loading chunk') !== -1 ||
                                 (target.tagName === 'SCRIPT' && target.src && target.src.indexOf('/_next/static/chunks/') !== -1);
              if (isChunkError) {
                window.location.reload();
              }
            }, true);
          `,
        }} />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#06b6d4" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Md. Tasve Al Samir',
              alternateName: 'Samir Anik',
              description: 'Creative Software Engineer & Full-Stack Developer specializing in React, Next.js, TypeScript, and Node.js.',
              knowsAbout: ['Software Engineering', 'Full-Stack Development', 'React', 'Next.js', 'TypeScript', 'Node.js'],
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://tasvesamir.vercel.app',
            }),
          }}
        />
      </head>
      <body className="font-sans min-h-screen relative overflow-x-hidden">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <ThemeProvider>
          <ParticleBg />
          <CustomCursor />
          <div className="relative z-10">
            {children}
          </div>
          <Analytics />
          <PwaRegister />
          <WebVitalsReporter />
        </ThemeProvider>
      </body>
    </html>
  )
}
