import escapeStringRegexp from 'escape-string-regexp'

export interface Thing {
  name: string
  desc: string
  url: string
}

export interface TableOfContents {
  name: string
  offset: number
  total: number
}

function extractRawSection(content: string, section: string): string | null {
  const firstRegex = new RegExp(`^#+ ${escapeStringRegexp(section)}$`, 'im')
  const secondRegex = /^#+ /m

  const firstMatch = content.match(firstRegex)
  if (!firstMatch) {
    return null
  }

  const startIndex = firstMatch.index! + firstMatch[0].length
  const remainingText = content.slice(startIndex)

  const secondMatch = remainingText.match(secondRegex)
  const endIndex = secondMatch ? startIndex + secondMatch.index! : content.length

  return content.slice(startIndex, endIndex).trim()
}

const matchThing = /\s\[(?<name>[^\]]+)\]\((?<url>[^)]+)\)\s*-\s*(?<desc>.+)$/

export function extractTableOfContents(content: string): TableOfContents[] {
  return content
    .split('\n')
    .map(l => l.match(/^(?<offset>#+)\s(?<name>.+)$/))
    .filter(m => m !== null)
    .map(m => ({
      name: m.groups!.name,
      offset: m.groups!.offset.length,
    }))
    .map(o => ({
      ...o,
      raw: extractRawSection(content, o.name),
    }))
    .filter(o => o.raw !== null)
    .map(o => ({
      name: o.name,
      offset: o.offset,
      total: o
        .raw!.split('\n')
        .map(l => l.match(matchThing))
        .filter(m => m !== null).length,
    }))
}
