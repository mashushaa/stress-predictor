import React from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  const getMarkdownText = () => {
    // Простая настройка для marked
    marked.setOptions({
      breaks: true,
      gfm: true
    });
    
    return { __html: marked(content) };
  };

  return (
    <div 
      className={`prose prose-sm max-w-none markdown-content ${className}`}
      dangerouslySetInnerHTML={getMarkdownText()} 
      style={{
        // Кастомные стили для markdown элементов
        '--tw-prose-body': 'hsl(var(--muted-foreground))',
        '--tw-prose-headings': 'hsl(var(--foreground))',
        '--tw-prose-bold': 'hsl(var(--foreground))',
        '--tw-prose-bullets': 'hsl(var(--muted-foreground))',
      } as React.CSSProperties}
    />
  );
};

export default MarkdownRenderer;