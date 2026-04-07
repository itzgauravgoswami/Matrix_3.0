import React from 'react'; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; 
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; 
import 'react-syntax-highlighter/dist/esm/styles/prism/onedark.css'; 
import { Copy, Check } from 'lucide-react'; 

export default function CodeHighlighter({ 
  code, 
  language = 'java', 
  title = '',
  showCopy = true 
}) {
  const [copied, setCopied] = React.useState(false); 

  const handleCopy = () => {
    navigator.clipboard.writeText(code); 
    setCopied(true); 
    setTimeout(() => setCopied(false), 2000); 
  }; 

  // Enhanced styling with guaranteed colors
  const enhancedStyle = {
    'hljs': {
      display: 'block',
      overflowX: 'auto',
      padding: '16px',
      background: '#1a1a2e',
      color: '#e0e0e0',
      fontSize: '13px',
      lineHeight: '1.6',
      fontFamily: '"Fira Code", "Courier New", monospace',
    },
    'hljs-attr': { color: '#61afef' },
    'hljs-literal': { color: '#56b6f2' },
    'hljs-meta': { color: '#abb2bf' },
    'hljs-meta-string': { color: '#98c379' },
    'hljs-number': { color: '#d19a66' },
    'hljs-operator': { color: '#abb2bf' },
    'hljs-punctuation': { color: '#abb2bf' },
    'hljs-property': { color: '#61afef' },
    'hljs-regexp': { color: '#e06c75' },
    'hljs-string': { color: '#98c379' },
    'hljs-char.escape_': { color: '#98c379' },
    'hljs-subst': { color: '#e06c75' },
    'hljs-symbol': { color: '#c678dd' },
    'hljs-variable': { color: '#e06c75' },
    'hljs-variable.constant_': { color: '#d19a66' },
    'hljs-title': { color: '#61afef' },
    'hljs-title.class_': { color: '#e5c07b' },
    'hljs-title.class_.inherited_': { color: '#98c379' },
    'hljs-title.function_': { color: '#61afef' },
    'hljs-params': { color: '#abb2bf' },
    'hljs-built_in': { color: '#e5c07b' },
    'hljs-builtin-name': { color: '#e5c07b' },
    'hljs-keyword': { color: '#c678dd' },
    'hljs-selector-tag': { color: '#e06c75' },
    'hljs-literal': { color: '#56b6f2' },
    'hljs-section': { color: '#61afef' },
    'hljs-link': { color: '#98c379' },
    'hljs-quote': { color: '#5c6370' },
    'hljs-comment': { color: '#5c6370' },
    'hljs-doctag': { color: '#c678dd' },
    'hljs-emphasis': { fontStyle: 'italic' },
    'hljs-strong': { fontWeight: 'bold' },
    'hljs-code': { color: '#e06c75' },
    'hljs-addition': { color: '#98c379', backgroundColor: 'rgba(152, 195, 121, 0.1)' },
    'hljs-deletion': { color: '#e06c75', backgroundColor: 'rgba(224, 108, 117, 0.1)' },
  }; 

  return (
    <div className="w-full my-4 rounded-lg overflow-hidden border border-slate-700/50 bg-slate-900/50 shadow-lg">
      {/* Header */}
      {(title || showCopy) && (
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-b border-slate-700/50">
          {title && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                {title}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {language}
              </span>
            </div>
          )}
          {showCopy && (
            <button
              onClick={handleCopy}
              className="ml-auto p-2 hover:bg-slate-700/50 rounded-md transition-colors flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200"
              title="Copy code"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Code */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={enhancedStyle}
          customStyle={{
            background: '#1a1a2e',
            padding: '16px',
            margin: '0',
            fontSize: '13px',
            lineHeight: '1.6',
            fontFamily: '"Fira Code", "Courier New", monospace',
            color: '#e0e0e0',
          }}
          wrapLines={true}
          wrapLongLines={true}
          lineProps={{
            style: {
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap',
              color: '#e0e0e0',
            },
          }}
          showLineNumbers={false}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  ); 
}
