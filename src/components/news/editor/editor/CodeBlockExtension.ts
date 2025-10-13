import { Node } from '@tiptap/core';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

// Import common language support
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markdown';

export interface CodeBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    syntaxCode: {
      setSyntaxCode: (options: { language: string; code: string }) => ReturnType;
    };
  }
}

export const SyntaxCode = Node.create<CodeBlockOptions>({
  name: 'syntaxCode',

  group: 'block',

  content: 'text*',

  marks: '',

  code: true,

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      language: {
        default: 'javascript',
        parseHTML: element => element.getAttribute('data-language'),
        renderHTML: attributes => {
          return {
            'data-language': attributes.language,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre[data-code-block]',
        preserveWhitespace: 'full',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const language = node.attrs.language || 'javascript';
    const code = node.textContent;
    
    // Syntax highlight the code
    let highlightedCode = code;
    try {
      if (Prism.languages[language]) {
        highlightedCode = Prism.highlight(code, Prism.languages[language], language);
      }
    } catch (error) {
      console.error('Prism highlighting error:', error);
    }

    return [
      'div',
      {
        class: 'code-block-wrapper',
        style: 'position: relative; margin: 1rem 0;',
      },
      [
        'div',
        {
          class: 'code-block-header',
          style: 'background: hsl(var(--muted)); padding: 0.5rem 1rem; border-radius: 0.5rem 0.5rem 0 0; display: flex; justify-content: space-between; align-items: center;',
        },
        [
          'span',
          {
            class: 'code-language',
            style: 'font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: hsl(var(--muted-foreground));',
          },
          language,
        ],
        [
          'button',
          {
            class: 'copy-code-button',
            'data-code': code,
            onclick: `
              const code = this.getAttribute('data-code');
              navigator.clipboard.writeText(code).then(() => {
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                setTimeout(() => { this.textContent = originalText; }, 2000);
              });
            `,
            style: 'background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); border: none; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.75rem; cursor: pointer;',
          },
          'Copy',
        ],
      ],
      [
        'pre',
        {
          'data-code-block': '',
          'data-language': language,
          class: 'code-block',
          style: 'background: #2d2d2d; padding: 1rem; border-radius: 0 0 0.5rem 0.5rem; overflow-x: auto; margin: 0;',
          ...this.options.HTMLAttributes,
          ...HTMLAttributes,
        },
        [
          'code',
          {
            class: `language-${language}`,
            innerHTML: highlightedCode,
          },
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setSyntaxCode:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              language: options.language,
            },
            content: [
              {
                type: 'text',
                text: options.code,
              },
            ],
          });
        },
    };
  },
});
