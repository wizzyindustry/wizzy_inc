import ReactMarkdown, { type Components } from 'react-markdown';

const components: Components = {
  h2: ({ children }) => <h2 className="mt-8 mb-3 text-xl font-semibold">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-6 mb-2 text-lg font-semibold">{children}</h3>,
  p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mb-4 list-disc space-y-1 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1 pl-6">{children}</ol>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-4"
      {...(href?.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  ),
};

/**
 * Renders admin-written markdown on the server (no client JS).
 * Raw HTML in the markdown is ignored (`skipHtml`), so content can't inject scripts.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown skipHtml components={components}>
      {children}
    </ReactMarkdown>
  );
}
