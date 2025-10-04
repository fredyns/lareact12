import { normalizeMarkdown } from '@/utils/markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ShowMarkdownProps {
  label: string;
  value: string | null | undefined;
}

export function ShowMarkdown({ label, value }: ShowMarkdownProps) {
  return (
    <div className="mt-2">
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">{label}</h3>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {value ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: (props) => <h1 className="mt-6 mb-2 text-2xl font-bold" {...props} />,
              h2: (props) => <h2 className="mt-5 mb-2 text-xl font-bold" {...props} />,
              h3: (props) => <h3 className="mt-4 mb-2 text-lg font-bold" {...props} />,
              h4: (props) => <h4 className="mt-3 mb-1 text-base font-bold" {...props} />,
              h5: (props) => <h5 className="mt-3 mb-1 text-sm font-bold" {...props} />,
              h6: (props) => <h6 className="mt-3 mb-1 text-xs font-bold" {...props} />,
              code({
                inline,
                children,
                ...props
              }: {
                inline?: boolean;
                children?: React.ReactNode;
              } & React.HTMLAttributes<HTMLElement>) {
                if (inline) {
                  return (
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <pre className="my-4 overflow-x-auto rounded-md bg-muted p-4">
                    <code className="font-mono text-sm" {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              p: (props) => <p className="my-2" {...props} />,
              a: (props) => <a className="text-primary underline hover:text-primary/80" {...props} />,
              ul: (props) => <ul className="my-4 list-disc pl-5" {...props} />,
              ol: (props) => <ol className="my-4 list-decimal pl-5" {...props} />,
              li: (props) => <li className="my-1" {...props} />,
              blockquote: (props) => (
                <blockquote
                  className="my-4 border-l-4 border-muted-foreground pl-4 text-muted-foreground italic"
                  {...props}
                />
              ),
              hr: (props) => <hr className="my-6 border-muted" {...props} />,
              img: (props) => (
                <img className="my-4 h-auto max-w-full rounded-md" {...props} alt={props.alt || ''} />
              ),
              table: (props) => (
                <div className="my-4 overflow-x-auto">
                  <table className="w-full border-collapse" {...props} />
                </div>
              ),
              thead: (props) => <thead className="bg-muted/50" {...props} />,
              tbody: (props) => <tbody {...props} />,
              tr: (props) => <tr className="border-b border-border" {...props} />,
              th: (props) => <th className="px-4 py-2 text-left font-medium" {...props} />,
              td: (props) => <td className="px-4 py-2" {...props} />,
            }}
          >
            {normalizeMarkdown(value)}
          </ReactMarkdown>
        ) : (
          <div className="rounded-lg bg-muted/50 p-4 text-muted-foreground">-</div>
        )}
      </div>
    </div>
  );
}
