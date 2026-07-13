import { getSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data: posts } = await supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(20)

    const { data: profile } = await supabase
      .from('profile')
      .select('name, title, description')
      .limit(1)
      .single()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tasvesamir.vercel.app'
    const authorName = profile?.name || 'Samir Anik'
    const authorTitle = profile?.title || 'Software Engineer'
    const feedDescription = profile?.description || 'Blog about software engineering and web development.'

    const items = (posts || []).map((post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      ${post.tags ? post.tags.split(',').map((t: string) => `      <category>${t.trim()}</category>`).join('\n') : ''}
    </item>`).join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${authorName} | ${authorTitle}</title>
    <link>${siteUrl}</link>
    <description>${feedDescription}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch {
    return new Response('<rss version="2.0"><channel><title>Feed</title></channel></rss>', {
      headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    })
  }
}
