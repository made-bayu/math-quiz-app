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
      const trimmed = content.trim();

      // Case 1: The entire content is a raw LaTeX formula (e.g. starts with \begin, f(x) =, \frac, y =, etc.)
      const containsLatexCommands = /\\[a-zA-Z]+/.test(trimmed);
      const hasDollarDelimiters = trimmed.includes('$');

      if (!hasDollarDelimiters && containsLatexCommands) {
        try {
          return katex.renderToString(trimmed, {
            displayMode: block,
            throwOnError: false,
            output: 'html',
          });
        } catch {
          // fallback to segmented parsing
        }
      }

      // Case 2: Segmented content with $...$ or $$...$$
      const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

      return parts
        .map((part) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            const math = part.slice(2, -2).trim();
            try {
              return katex.renderToString(math, {
                displayMode: true,
                throwOnError: false,
                output: 'html',
              });
            } catch {
              return part;
            }
          } else if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1).trim();
            try {
              return katex.renderToString(math, {
                displayMode: false,
                throwOnError: false,
                output: 'html',
              });
            } catch {
              return part;
            }
          }

          // Check if this individual part contains unescaped LaTeX commands
          if (/\\[a-zA-Z]+/.test(part.trim())) {
            try {
              return katex.renderToString(part.trim(), {
                displayMode: false,
                throwOnError: false,
                output: 'html',
              });
            } catch {
              return part.replace(/\n/g, '<br/>');
            }
          }

          // Plain text with line breaks
          return part.replace(/\n/g, '<br/>');
        })
        .join('');
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
