// Lightweight Markdown-style `[text](url)` link parser — no external
// markdown library needed for this one syntax. Only http(s) URLs are
// accepted so a malformed match never produces a broken/unsafe href.
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

// Splits `text` on LINK_PATTERN matches and returns a React node array:
// plain text segments pass through unchanged, matched segments become
// styled <a> tags. Preserves everything else (incl. newlines, for callers
// using `whitespace-pre-line`) since only the matched spans are replaced.
export function parseInlineLinks(text) {
  if (!text) return text;

  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  LINK_PATTERN.lastIndex = 0;
  while ((match = LINK_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const [, label, url] = match;
    nodes.push(
      <a
        key={key++}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#185FA5] underline"
      >
        {label}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
