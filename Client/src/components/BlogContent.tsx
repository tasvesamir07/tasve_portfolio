'use client'

import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

export default function BlogContent({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-bold text-white mt-8 mb-4" {...props}>{children}</h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xl font-bold text-white mt-6 mb-3" {...props}>{children}</h3>
          ),
          p: ({ children, ...props }) => (
            <p className="text-gray-400 text-base leading-relaxed mb-4" {...props}>{children}</p>
          ),
          a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline transition-colors" {...props}>{children}</a>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className
            if (isInline) {
              return <code className="bg-white/5 text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
            }
            return (
              <code className={className} {...props}>{children}</code>
            )
          },
          pre: ({ children, ...props }) => (
            <pre className="bg-[#0a0c14] border border-white/5 rounded-xl p-4 overflow-x-auto text-sm font-mono mb-6" {...props}>{children}</pre>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside text-gray-400 mb-4 space-y-1" {...props}>{children}</ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside text-gray-400 mb-4 space-y-1" {...props}>{children}</ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-gray-400" {...props}>{children}</li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-cyan-400/30 pl-4 italic text-gray-400 mb-4" {...props}>{children}</blockquote>
          ),
          img: ({ src, alt, ...props }) => (
            <img src={src} alt={alt || ''} className="rounded-xl w-full my-6" loading="lazy" {...props} />
          ),
          hr: (props) => <hr className="border-white/5 my-8" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
