'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Prism from 'prismjs';

// Import additional languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-sql';

// Language aliases for common variations
const languageAliases: Record<string, string> = {
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'sh': 'bash',
  'shell': 'bash',
  'zsh': 'bash',
  'yml': 'yaml',
  'md': 'markdown',
  'html': 'markup',
  'xml': 'markup',
  'svg': 'markup',
};

// Friendly display names
const languageNames: Record<string, string> = {
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'jsx': 'JSX',
  'tsx': 'TSX',
  'css': 'CSS',
  'json': 'JSON',
  'python': 'Python',
  'bash': 'Bash',
  'markdown': 'Markdown',
  'yaml': 'YAML',
  'sql': 'SQL',
  'markup': 'HTML',
  'plaintext': 'Plain Text',
};

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export default function CodeBlock({
  code,
  language = 'plaintext',
  showLineNumbers = true,
  className = '',
}: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  // Normalize language name
  const normalizedLang = languageAliases[language.toLowerCase()] || language.toLowerCase();
  const displayName = languageNames[normalizedLang] || language.toUpperCase();

  // Check if language is supported
  const isSupported = normalizedLang in Prism.languages || normalizedLang === 'plaintext';
  const finalLang = isSupported ? normalizedLang : 'plaintext';

  useEffect(() => {
    if (codeRef.current && finalLang !== 'plaintext') {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, finalLang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Split code into lines for line numbers
  const lines = code.split('\n');
  // Remove trailing empty line if present
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  return (
    <div className={`code-block ${className}`}>
      {/* Header with language and copy button */}
      <div className="code-block-header">
        <span className="code-block-lang">{displayName}</span>
        <button
          className="code-block-copy"
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="code-block-content">
        {showLineNumbers && (
          <div className="code-line-numbers" aria-hidden="true">
            {lines.map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        )}
        <pre className={`language-${finalLang}`}>
          <code ref={codeRef} className={`language-${finalLang}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}

// Inline code component (simpler, no highlighting)
export function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="inline-code">{children}</code>;
}
