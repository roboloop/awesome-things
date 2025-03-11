const githubRegex = new RegExp(`github.com/(?<owner>[^/]+)\\/(?<repo>[^/]+)\\/?$`)

export function parseOwnerRepo(url: string): [string, string] {
  const match = url.match(githubRegex)
  if (match === null) {
    throw new Error('Cannot match owner and repo')
  }
  const owner = match.groups!.owner
  const repo = match.groups!.repo

  return [owner, repo]
}

export interface LinkSet {
  [key: string]: string
}

export function parseLinkHeader(header: string): LinkSet {
  if (!header) {
    return {}
  }

  return Object.fromEntries(
    header
      .split(/,/)
      .map(l => l.match(/<(?<link>[^>]+)>.+rel="(?<rel>[^"]+)/))
      .filter(m => m !== null)
      .map(m => [m.groups!.rel, m.groups!.link]),
  )
}
