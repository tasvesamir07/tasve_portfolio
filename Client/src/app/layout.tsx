import type { Metadata } from "next";
import { Outfit, Fira_Code } from "next/font/google";
import "./globals.css";
import ParticleBg from "@/components/ParticleBg";
import CustomCursor from "@/components/CustomCursor";
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
        title: `${data.name} | ${data.title}`,
        description: data.description,
        keywords: [data.name, "Web Developer", "Software Engineer", "React", "Next.js", "Framer Motion", "Tailwind CSS"],
        authors: [{ name: data.name }],
      }
    }
  } catch (err) {
    console.error('Metadata fetch failed:', err)
  }
  return {
    title: "Samir Anik | Creative Software Engineer & Full-Stack Developer",
    description: "Portfolio of Samir Anik - showcasing dynamic web projects, custom high-end animations, and modern API integrations.",
    keywords: ["Samir Anik", "Web Developer", "Software Engineer", "React", "Next.js", "Framer Motion", "Tailwind CSS"],
    authors: [{ name: "Samir Anik" }],
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
      </body>
    </html>
  );
}
