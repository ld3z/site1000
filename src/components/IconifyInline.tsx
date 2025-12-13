import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Icon } from '@iconify/react';

export default function IconifyInline() {
  useEffect(() => {
    const containerSelectors = ['.rp-content', 'main', '#app', 'body'];
    const roots: Array<any> = [];

    function resolveIconToken(token: string): string | null {
      if (!token) return null;
      // Support both `prefix:icon` and `prefix-icon` tokens
      if (token.includes(':')) return token;
      const parts = token.split('-');
      if (parts.length < 2) return null;
      const prefix = parts.shift();
      const name = parts.join('-');
      return `${prefix}:${name}`;
    }

    function walk(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const regex = /:([a-z0-9][a-z0-9:\-]*[a-z0-9]):/gi;
        let match: RegExpExecArray | null;
        const parent = node.parentElement;
        if (!parent) return;
        // don't transform inside elements that are already icon spans
        if (parent.classList && parent.classList.contains('iconify-shortcode')) return;
        const frag = document.createDocumentFragment();
        let lastIndex = 0;
        const text = node.textContent || '';
        regex.lastIndex = 0;
        let any = false;
        while ((match = regex.exec(text)) !== null) {
          any = true;
          const matched = match[0];
          const token = match[1];
          const before = text.slice(lastIndex, match.index);
          if (before) frag.appendChild(document.createTextNode(before));
          const iconSpan = document.createElement('span');
          iconSpan.className = 'iconify-shortcode d-inline-block';
          const resolved = resolveIconToken(token);
          if (resolved) {
            iconSpan.setAttribute('data-icon', resolved);
          } else {
            iconSpan.textContent = matched;
          }
          frag.appendChild(iconSpan);
          lastIndex = match.index + matched.length;
        }
        if (any) {
          const after = text.slice(lastIndex);
          if (after) frag.appendChild(document.createTextNode(after));
          parent.replaceChild(frag, node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tag = el.tagName.toLowerCase();
        // Skip code blocks and other areas where replacements are not desired
        if (['code', 'pre', 'textarea', 'script', 'style', 'svg'].includes(tag)) return;
        for (let i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i]);
        }
      }
    }

    function renderIcons() {
      const spans = document.querySelectorAll('span.iconify-shortcode[data-icon]');
      spans.forEach(span => {
        if ((span as HTMLElement).dataset.rendered) return;
        const icon = span.getAttribute('data-icon')!;
        try {
          // Render Icon into the span using a dedicated root
          const root = createRoot(span);
          root.render(React.createElement(Icon, { icon, inline: true }));
          (span as HTMLElement).dataset.rendered = '1';
          roots.push(root);
        } catch (e) {
          // If rendering fails, leave the raw token text visible
          console.error('Iconify render error', e);
        }
      });
    }

    // Sanitize head: remove any :token: occurrences from title, meta content, and JSON-LD scripts
    function sanitizeHead() {
      const tokenRegex = /:([a-z0-9][a-z0-9:\-]*[a-z0-9]):/gi;

      try {
        // Title element
        if (document.title) {
          const cleaned = document.title.replace(tokenRegex, '').trim();
          if (cleaned !== document.title) document.title = cleaned;
        }
        const titleEl = document.querySelector('head title');
        if (titleEl && titleEl.textContent) {
          const cleaned = titleEl.textContent.replace(tokenRegex, '').trim();
          if (cleaned !== titleEl.textContent) titleEl.textContent = cleaned;
        }

        // Meta tags with content attribute
        const metas = Array.from(document.head.querySelectorAll('meta[content]')) as HTMLMetaElement[];
        metas.forEach(m => {
          if (m.content && tokenRegex.test(m.content)) {
            m.content = m.content.replace(tokenRegex, '').trim();
          }
        });

        // Other meta tags (property/name) that might have content in attributes
        const metaProps = Array.from(document.head.querySelectorAll('meta[property], meta[name]')) as HTMLMetaElement[];
        metaProps.forEach(m => {
          const attr = m.getAttribute('content');
          if (attr && tokenRegex.test(attr)) {
            m.setAttribute('content', attr.replace(tokenRegex, '').trim());
          }
        });

        // JSON-LD scripts: attempt to parse and sanitize string values; fallback to text replacement
        const jsonLdScripts = Array.from(document.head.querySelectorAll('script[type="application/ld+json"]')) as HTMLScriptElement[];
        jsonLdScripts.forEach(s => {
          const txt = s.textContent || '';
          if (!txt) return;
          let replaced = txt;
          try {
            const obj = JSON.parse(txt);
            function sanitizeObj(o: any): any {
              if (o == null) return o;
              if (typeof o === 'string') return o.replace(tokenRegex, '').trim();
              if (Array.isArray(o)) return o.map(sanitizeObj);
              if (typeof o === 'object') {
                const out: any = {};
                Object.keys(o).forEach(k => {
                  out[k] = sanitizeObj(o[k]);
                });
                return out;
              }
              return o;
            }
            const cleanedObj = sanitizeObj(obj);
            replaced = JSON.stringify(cleanedObj);
          } catch (e) {
            // If JSON.parse fails, just do a string replace
            replaced = txt.replace(tokenRegex, '').trim();
          }
          if (replaced !== txt) {
            s.textContent = replaced;
          }
        });

        // Any other head text nodes (rare): perform a generic replace on textContent of head children
        Array.from(document.head.childNodes).forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            const cleaned = text.replace(tokenRegex, '').trim();
            if (cleaned !== text) node.textContent = cleaned;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Attributes like title on link elements
            const el = node as Element;
            if (el.hasAttribute && el.hasAttribute('title')) {
              const t = el.getAttribute('title') || '';
              const cleaned = t.replace(tokenRegex, '').trim();
              if (cleaned !== t) el.setAttribute('title', cleaned);
            }
          }
        });
      } catch (e) {
        // Keep silent on head sanitization errors to avoid breaking the page
        // eslint-disable-next-line no-console
        console.error('sanitizeHead error', e);
      }
    }

    const observers: MutationObserver[] = [];
    const rootElements = containerSelectors.map(sel => document.querySelector(sel)).filter(Boolean) as Element[];
    if (rootElements.length === 0) rootElements.push(document.body);
    rootElements.forEach(rootEl => {
      walk(rootEl);
    });
    renderIcons();

    const mo = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes.forEach(n => {
          walk(n);
        });
      });
      renderIcons();
    });
    observers.push(mo);
    rootElements.forEach(el => mo.observe(el, { childList: true, subtree: true }));

    // Sanitize head initially and also observe head mutations to keep it clean
    sanitizeHead();
    const headObserver = new MutationObserver(() => {
      sanitizeHead();
    });
    headObserver.observe(document.head, { childList: true, subtree: true, characterData: true });
    observers.push(headObserver);

    return () => {
      observers.forEach(o => o.disconnect());
      roots.forEach(r => {
        try { r.unmount(); } catch {}
      });
    };
  }, []);

  return null;
}