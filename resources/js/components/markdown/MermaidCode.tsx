import React, { useState, useRef, Fragment, useEffect, useCallback } from 'react';
import mermaid from 'mermaid';
import { getCodeString } from 'rehype-rewrite';

interface CodeProps {
  inline?: boolean;
  children?: React.ReactNode[];
  className?: string;
  node?: any;
  [key: string]: any;
}

const randomid = () => parseInt(String(Math.random() * 1e15), 10).toString(36);

export const MermaidCode: React.FC<CodeProps> = ({ 
  inline, 
  children = [], 
  className, 
  ...props 
}) => {
  const demoid = useRef(`dome${randomid()}`);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const isMermaid = className && /^language-mermaid/.test(className.toLowerCase());
  const code = children
    ? getCodeString(props.node?.children || [])
    : (children[0] as string) || '';

  useEffect(() => {
    if (container && isMermaid && demoid.current && code) {
      mermaid
        .render(demoid.current, code)
        .then(({ svg, bindFunctions }) => {
          console.log('svg:', svg);
          container.innerHTML = svg;
          if (bindFunctions) {
            bindFunctions(container);
          }
        })
        .catch((error) => {
          console.log('error:', error);
        });
    }
  }, [container, isMermaid, code, demoid]);

  const refElement = useCallback((node: HTMLElement | null) => {
    if (node !== null) {
      setContainer(node);
    }
  }, []);

  if (isMermaid) {
    return (
      <Fragment>
        <code id={demoid.current} style={{ display: 'none' }} />
        <code className={className} ref={refElement} data-name="mermaid" />
      </Fragment>
    );
  }
  return <code className={className}>{children}</code>;
};
