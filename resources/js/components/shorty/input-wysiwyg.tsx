import { Label } from '@/components/ui/label';
import { Editor as TinyMCEEditor } from 'tinymce';
import React, { lazy, Suspense } from 'react';

// Lazy load TinyMCE Editor to reduce initial bundle size
const Editor = lazy(() => 
  import('@tinymce/tinymce-react').then(module => ({ 
    default: module.Editor 
  }))
);

interface InputWysiwygProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  initialValue?: string;
  height?: number;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export function InputWysiwyg({
  id,
  label,
  value,
  onChange,
  initialValue = '',
  height = 300,
  error,
  required = false,
  disabled = false,
  loading = false,
}: InputWysiwygProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Suspense fallback={
        <div className="animate-pulse bg-muted rounded border" style={{ height: height }}>
          <div className="p-4 space-y-3">
            <div className="h-8 bg-muted-foreground/20 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
              <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
              <div className="h-4 bg-muted-foreground/20 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      }>
        <Editor
          id={id}
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
          licenseKey="gpl"
          initialValue={initialValue}
          disabled={disabled || loading}
          init={{
            height: height,
            menubar: false,
            branding: false,
            promotion: false,
            plugins: [
              'advlist',
              'autolink',
              'lists',
              'link',
              'image',
              'charmap',
              'anchor',
              'searchreplace',
              'visualblocks',
              'code',
              'fullscreen',
              'insertdatetime',
              'media',
              'table',
              'help',
              'wordcount',
            ],
            toolbar:
              'undo redo | formatselect | ' +
              'bold italic backcolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style:
              'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; font-size: 14px }',
            setup: (editor: TinyMCEEditor) => {
              editor.on('change', () => {
                onChange(editor.getContent());
              });
            },
          }}
          onEditorChange={onChange}
        />
      </Suspense>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
