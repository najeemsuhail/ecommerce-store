const BLOCKED_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'link',
  'meta',
  'base',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
  'canvas',
  'svg',
];

const BLOCKED_TAG_PATTERN = new RegExp(
  `<(?:${BLOCKED_TAGS.join('|')})\\b[^>]*>[\\s\\S]*?<\\/(?:${BLOCKED_TAGS.join('|')})>|<(?:${BLOCKED_TAGS.join('|')})\\b[^>]*\\/?>`,
  'gi'
);

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'a',
  'img',
  'div',
  'span',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
]);

const ALLOWED_ATTRS = new Set(['href', 'src', 'alt', 'title', 'target', 'rel']);

function sanitizeTagAttributes(rawAttrs: string) {
  const attrs: string[] = [];

  rawAttrs.replace(
    /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(".*?"|'.*?'|[^\s"'=<>`]+))?/g,
    (match, attrName: string, attrValue?: string) => {
      const normalizedName = attrName.toLowerCase();
      if (!ALLOWED_ATTRS.has(normalizedName)) {
        return '';
      }

      if (!attrValue) {
        return '';
      }

      const unwrappedValue = attrValue.replace(/^['"]|['"]$/g, '');

      if (
        (normalizedName === 'href' || normalizedName === 'src') &&
        /^\s*javascript:/i.test(unwrappedValue)
      ) {
        return '';
      }

      if (normalizedName === 'target' && unwrappedValue === '_blank') {
        attrs.push(`target="_blank"`, `rel="noopener noreferrer"`);
        return '';
      }

      attrs.push(`${normalizedName}="${unwrappedValue.replace(/"/g, '&quot;')}"`);
      return '';
    }
  );

  return attrs.length > 0 ? ` ${Array.from(new Set(attrs)).join(' ')}` : '';
}

export function sanitizeRichHtml(html: string | null | undefined) {
  if (!html) {
    return '';
  }

  return html
    .replace(BLOCKED_TAG_PATTERN, '')
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/<\s*\/?\s*html\b[^>]*>/gi, '')
    .replace(/<\s*\/?\s*head\b[^>]*>/gi, '')
    .replace(/<\s*\/?\s*body\b[^>]*>/gi, '')
    .replace(/<\s*\/?\s*!doctype\b[^>]*>/gi, '')
    .replace(/<([a-z0-9]+)([^>]*)>/gi, (match, tagName: string, rawAttrs: string) => {
      const normalizedTag = tagName.toLowerCase();

      if (!ALLOWED_TAGS.has(normalizedTag)) {
        return '';
      }

      return `<${normalizedTag}${sanitizeTagAttributes(rawAttrs)}>`;
    })
    .replace(/<\/([a-z0-9]+)>/gi, (match, tagName: string) => {
      const normalizedTag = tagName.toLowerCase();
      return ALLOWED_TAGS.has(normalizedTag) ? `</${normalizedTag}>` : '';
    });
}

export function stripHtml(html: string | null | undefined) {
  return sanitizeRichHtml(html)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
