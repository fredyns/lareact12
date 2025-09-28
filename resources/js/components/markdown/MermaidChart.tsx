import React, { useRef, useEffect } from 'react';
import mermaid from 'mermaid';

interface MermaidChartProps {
  code: string;
}

export const MermaidChart: React.FC<MermaidChartProps> = ({ code }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && code) {
      const id = `mermaid-${Math.random().toString(36).slice(2)}`;
      mermaid.render(id, code).then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      }).catch(() => {
        if (ref.current) {
          ref.current.innerHTML = `<pre><code>${code}</code></pre>`;
        }
      });
    }
  }, [code]);

  return <div ref={ref} className="mermaid-chart" />;
};
