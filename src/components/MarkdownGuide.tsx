export const markdownGuide = [
  {
    category: 'Headers',
    examples: [
      { syntax: '# Heading 1', result: 'Creates the largest heading' },
      { syntax: '## Heading 2', result: 'Creates a medium heading' },
      { syntax: '### Heading 3', result: 'Creates a smaller heading' },
    ],
  },
  {
    category: 'Text Formatting',
    examples: [
      { syntax: '**bold text**', result: 'Makes text bold' },
      { syntax: '*italic text*', result: 'Makes text italic' },
      { syntax: '`inline code`', result: 'Displays code in monospace' },
      { syntax: '***bold and italic***', result: 'Combines bold and italic' },
    ],
  },
  {
    category: 'Lists',
    examples: [
      { syntax: '* Item 1\n* Item 2\n* Item 3', result: 'Creates a bulleted list' },
      { syntax: '1. First\n2. Second\n3. Third', result: 'Creates a numbered list (Note: Use "1." for all)' },
    ],
  },
  {
    category: 'Links & Images',
    examples: [
      { syntax: '[Link text](https://example.com)', result: 'Creates a clickable link' },
      { syntax: '![Alt text](image-url.jpg)', result: 'Embeds an image' },
    ],
  },
  {
    category: 'Code Blocks',
    examples: [
      { syntax: '```\ncode here\n```', result: 'Creates a multi-line code block' },
      { syntax: '```javascript\nconst x = 5;\n```', result: 'Syntax-highlighted code block' },
    ],
  },
  {
    category: 'Blockquotes',
    examples: [
      { syntax: '> This is a quote', result: 'Creates an indented blockquote' },
      { syntax: '> Quote line 1\n> Quote line 2', result: 'Multi-line blockquote' },
    ],
  },
  {
    category: 'Separators',
    examples: [
      { syntax: '---', result: 'Creates a horizontal line' },
      { syntax: '***', result: 'Alternative horizontal line' },
    ],
  },
  {
    category: 'Paragraphs',
    examples: [
      { syntax: 'Line 1\n\nLine 2', result: 'Double line break creates a new paragraph' },
      { syntax: 'Line with  \nbreak', result: 'Two spaces + line break = soft line break' },
    ],
  },
];

interface MarkdownGuideProps {
  onClose?: () => void;
  compact?: boolean;
}

export default function MarkdownGuide({ onClose, compact = false }: MarkdownGuideProps) {
  if (compact) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-sm text-blue-900">Markdown Syntax Guide</h4>
          {onClose && (
            <button
              onClick={onClose}
              className="text-blue-600 hover:text-blue-800 text-lg"
            >
              ✕
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-2">
            <p className="font-mono bg-white p-2 rounded border border-blue-100"># Heading 1</p>
            <p className="font-mono bg-white p-2 rounded border border-blue-100">## Heading 2</p>
            <p className="font-mono bg-white p-2 rounded border border-blue-100">**bold**</p>
          </div>
          <div className="space-y-2">
            <p className="font-mono bg-white p-2 rounded border border-blue-100">*italic*</p>
            <p className="font-mono bg-white p-2 rounded border border-blue-100">`code`</p>
            <p className="font-mono bg-white p-2 rounded border border-blue-100">[link](url)</p>
          </div>
          <div className="space-y-2">
            <p className="font-mono bg-white p-2 rounded border border-blue-100">* List item</p>
            <p className="font-mono bg-white p-2 rounded border border-blue-100">&gt; Quote</p>
            <p className="font-mono bg-white p-2 rounded border border-blue-100">```code```</p>
          </div>
          <div className="text-gray-600 space-y-2">
            <p>- Unordered list</p>
            <p>- Use -- for soft break</p>
            <p>- Empty line for paragraph</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Markdown Guide</h1>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-8">
        {markdownGuide.map((section) => (
          <div key={section.category} className="border-b pb-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">{section.category}</h2>
            <div className="space-y-4">
              {section.examples.map((example, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono bg-gray-100 p-3 rounded border border-gray-200 overflow-x-auto">
                      {example.syntax}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 pt-3">{example.result}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Pro Tip:</strong> Use double line breaks to create paragraphs. Single line breaks
          don't create new paragraphs in Markdown.
        </p>
      </div>
    </div>
  );
}
