import type { Metadata } from "next";
import { Outfit, Fira_Code } from "next/font/google";
import "./globals.css";
import ParticleBg from "@/components/ParticleBg";
import CustomCursor from "@/components/CustomCursor";
import { Analytics } from "@vercel/analytics/react"
import { getSupabase } from "@/lib/supabase";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600"]
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = getSupabase()
    const { data } = await supabase.from('profile').select('name, title, description').limit(1).single()
    if (data) {
      return {
        metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
        title: `${data.name} | ${data.title}`,
        description: data.description,
        keywords: [data.name, "Web Developer", "Software Engineer", "React", "Next.js", "Framer Motion", "Tailwind CSS"],
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
    title: "Samir Anik | Creative Software Engineer & Full-Stack Developer",
    description: "Portfolio of Samir Anik - showcasing dynamic web projects, custom high-end animations, and modern API integrations.",
    keywords: ["Md. Tasve Al Samir", "Web Developer", "Software Engineer", "React", "Next.js", "Framer Motion", "Tailwind CSS"],
    authors: [{ name: "Md. Tasve Al Samir" }],
    openGraph: {
      title: "Samir Anik | Creative Software Engineer & Full-Stack Developer",
      description: "Portfolio of Samir Anik - showcasing dynamic web projects, custom high-end animations, and modern API integrations.",
      type: 'website',
      locale: 'en_US',
      siteName: "Samir Anik",
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Samir Anik | Creative Software Engineer & Full-Stack Developer",
      description: "Portfolio of Samir Anik - showcasing dynamic web projects, custom high-end animations, and modern API integrations.",
      images: ['/opengraph-image'],
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${firaCode.variable} scroll-smooth antialiased`}
    >
      <body className="font-sans bg-[#07090e] text-gray-100 min-h-screen relative overflow-x-hidden">
        <ParticleBg />
        <CustomCursor />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
