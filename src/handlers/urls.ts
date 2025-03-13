import * as utils from '@/client/utils'

export function generateStarsExplorerUrl(url: string) {
  const startExplorerUrl = import.meta.env.VITE_STARS_EXPLORER_URL
  const [owner, repo] = utils.parseOwnerRepo(url)

  return startExplorerUrl ? `http://${startExplorerUrl}/#/${owner}/${repo}` : ''
}
