import { Label } from '@/components/ui/label';
import { normalizeMarkdown } from '@/utils/markdown';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface InputMarkdownProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export function InputMarkdown({
  id,
  label,
  value,
  onChange,
  rows = 12,
  placeholder = "Enter markdown text...\n\nExamples:\n# Heading 1\n## Heading 2\n**Bold text**\n*Italic text*\n~~Strikethrough~~\n\n- List item 1\n- List item 2\n\n> Blockquote\n\n`inline code`\n\n```\ncode block\n```",
  error,
  required = false,
  disabled = false,
  loading = false,
}: InputMarkdownProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Editor */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Editor</Label>
          <textarea
            id={id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled || loading}
            className={`flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-destructive' : ''}`}
          />
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Preview</Label>
          <div className="prose prose-sm dark:prose-invert min-h-[300px] max-w-none overflow-auto rounded-md border border-input bg-background p-3">
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ ...props }) => <h1 className="mt-6 mb-2 text-2xl font-bold" {...props} />,
                  h2: ({ ...props }) => <h2 className="mt-5 mb-2 text-xl font-bold" {...props} />,
                  h3: ({ ...props }) => <h3 className="mt-4 mb-2 text-lg font-bold" {...props} />,
                  h4: ({ ...props }) => <h4 className="mt-3 mb-1 text-base font-bold" {...props} />,
                  h5: ({ ...props }) => <h5 className="mt-3 mb-1 text-sm font-bold" {...props} />,
                  h6: ({ ...props }) => <h6 className="mt-3 mb-1 text-xs font-bold" {...props} />,
                  code({
                    inline,
                    children,
                    ...props
                  }: React.ClassAttributes<HTMLElement> &
                    React.HTMLAttributes<HTMLElement> & {
                      inline?: boolean;
                      className?: string;
                      children?: React.ReactNode;
                    }) {
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
                  p: ({ ...props }) => <p className="my-2" {...props} />,
                  a: ({ ...props }) => (
                    <a className="text-primary underline hover:text-primary/80" {...props} />
                  ),
                  ul: ({ ...props }) => <ul className="my-4 list-disc pl-6" {...props} />,
                  ol: ({ ...props }) => <ol className="my-4 list-decimal pl-6" {...props} />,
                  li: ({ ...props }) => <li className="my-1" {...props} />,
                  blockquote: ({ ...props }) => (
                    <blockquote
                      className="my-4 border-l-4 border-muted-foreground pl-4 text-muted-foreground italic"
                      {...props}
                    />
                  ),
                  hr: ({ ...props }) => <hr className="my-6 border-muted" {...props} />,
                  img: ({ ...props }) => (
                    <img className="my-4 h-auto max-w-full rounded-md" {...props} alt={props.alt || ''} />
                  ),
                  table: ({ ...props }) => (
                    <div className="my-4 overflow-x-auto">
                      <table className="w-full border-collapse" {...props} />
                    </div>
                  ),
                  thead: ({ ...props }) => <thead className="bg-muted/50" {...props} />,
                  tbody: ({ ...props }) => <tbody {...props} />,
                  tr: ({ ...props }) => <tr className="border-b border-border" {...props} />,
                  th: ({ ...props }) => <th className="px-4 py-2 text-left font-medium" {...props} />,
                  td: ({ ...props }) => <td className="px-4 py-2" {...props} />,
                }}
              >
                {normalizeMarkdown(value)}
              </ReactMarkdown>
            ) : (
              <div className="text-sm text-muted-foreground">Preview will appear here...</div>
            )}
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
