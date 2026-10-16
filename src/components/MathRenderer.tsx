'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  block?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, block = false, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    try {
      // If it contains $ or $$, parse segments
      // Replace $$...$$ with block math, $...$ with inline math
      const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

      return parts.map((part) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2).trim();
          try {
            return katex.renderToString(math, { displayMode: true, throwOnError: false });
          } catch {
            return part;
          }
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1).trim();
          try {
            return katex.renderToString(math, { displayMode: false, throwOnError: false });
          } catch {
            return part;
          }
        }
        // If block=true and string has no $, render as raw KaTeX math expression
        if (block && !content.includes('$')) {
          try {
            return katex.renderToString(content, { displayMode: true, throwOnError: false });
          } catch {
            return content;
          }
        }
        // Render regular text with line breaks
        return part.replace(/\n/g, '<br/>');
      }).join('');
    } catch {
      return content;
    }
  }, [content, block]);

  return (
    <span
      className={`math-rendered ${block ? 'block my-3 text-center overflow-x-auto' : 'inline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
