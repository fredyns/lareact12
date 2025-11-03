import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidChartProps {
  code: string;
}

export function MermaidChart({ code }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const diagramId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderDiagram = async () => {
      try {
        // Initialize mermaid
        mermaid.initialize({ startOnLoad: true, theme: 'default' });

        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Create a wrapper div for the diagram
        const wrapper = document.createElement('div');
        wrapper.id = diagramId.current;
        wrapper.className = 'mermaid';
        wrapper.textContent = code;

        if (containerRef.current) {
          containerRef.current.appendChild(wrapper);
        }

        // Render the diagram
        await mermaid.contentLoaded();
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="rounded bg-destructive/10 p-4 text-sm text-destructive">Failed to render diagram</div>`;
        }
      }
    };

    renderDiagram();
  }, [code]);

  return <div ref={containerRef} className="flex justify-center my-4" />;
}
