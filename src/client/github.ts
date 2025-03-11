import * as utils from './utils'

export interface Repository {
  id: number
  avatar: string
  name: string
  fullName: string
  description: string
  defaultBranch: string
  topics: string[]

  stars: number
  openIssuesCount: number

  isFork: boolean
  isArchived: boolean

  htmlUrl: string
  homepageUrl?: string

  updatedAt: string
  createdAt: string
}

export interface Commit {
  commitedAt: string
}

export interface Tag {
  version?: string
}

interface IssueStats {
  totalOpen: number
  totalClosed: number
}

export interface Metadata {
  repository: Repository
  lastCommit: Commit
  lastTag: Tag
  totalTags: number

  issueStats: IssueStats
  pullRequestStats: IssueStats
}

const host = 'api.github.com'
const defaultHeaders = {
  Accept: 'application/vnd.github+json',
  Authorization: 'Bearer ' + import.meta.env.VITE_GITHUB_TOKEN,
  'X-GitHub-Api-Version': '2022-11-28',
}

export function fetchRepository(owner: string, repo: string): Repository {
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'get',
    headers: defaultHeaders,
  }
  try {
    const url = `https://${host}/repos/${owner}/${repo}`
    const response = UrlFetchApp.fetch(url, options)
    const data = JSON.parse(response.getContentText())
    return {
      id: data.id,
      avatar: data.owner.avatar_url,
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      defaultBranch: data.default_branch,
      topics: data.topics,

      stars: data.stargazers_count,
      openIssuesCount: data.open_issues_count,

      isFork: data.fork,
      isArchived: data.archived,

      htmlUrl: data.html_url,
      homepageUrl: data.homepage,

      updatedAt: data.updated_at,
      createdAt: data.created_at,
    }
  } catch (e) {
    console.error(`Cannot fetch ${owner}/${repo}`)
    throw e
  }
}

export function fetchFile(owner: string, repo: string, filepath: string): string {
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'get',
    headers: defaultHeaders,
  }
  const url = `https://${host}/repos/${owner}/${repo}/contents/${filepath}`
  const response = UrlFetchApp.fetch(url, options)
  const data = JSON.parse(response.getContentText())
  const bytes = Utilities.base64Decode(data.content)

  return Utilities.newBlob(bytes).getDataAsString()
}

export function fetchCommit(owner: string, repo: string, ref: string): Commit {
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'get',
    headers: defaultHeaders,
  }
  const url = `https://${host}/repos/${owner}/${repo}/commits/${ref}`
  const response = UrlFetchApp.fetch(url, options)
  const data = JSON.parse(response.getContentText())

  return {
    commitedAt: data.commit.committer.date,
  }
}

function fetchStats(
  owner: string,
  repo: string,
  model: string,
  params: { [key: string]: string },
): number {
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'get',
    headers: defaultHeaders,
  }
  params.per_page = '1'
  params.page = '1'

  const query = Object.keys(params)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
    .join('&')
  const url = `https://${host}/repos/${owner}/${repo}/${model}`
  const response = UrlFetchApp.fetch(url + '?' + query, options)
  const data = JSON.parse(response.getContentText())

  const headers = <{ [key: string]: string }>response.getHeaders()
  const links = utils.parseLinkHeader(headers['Link'] ?? '')
  const lastPage = links['last']?.match(/\bpage=(?<page>\d+)/)?.groups!.page

  return lastPage ? parseInt(lastPage) : data.length
}

export function fetchLastTag(owner: string, repo: string): Tag {
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'get',
    headers: defaultHeaders,
  }
  const url = `https://${host}/repos/${owner}/${repo}/tags`
  const query = `per_page=1&page=1`
  const response = UrlFetchApp.fetch(url + '?' + query, options)
  const data = JSON.parse(response.getContentText())

  return {
    version: data?.[0]?.name,
  }
}

export function fetchIssueStats(owner: string, repo: string): [IssueStats, IssueStats] {
  const issueStats: IssueStats = {
    totalOpen: fetchStats(owner, repo, 'issues', { state: 'open' }),
    totalClosed: fetchStats(owner, repo, 'issues', { state: 'closed' }),
  }

  const pullRequestStats: IssueStats = {
    totalOpen: fetchStats(owner, repo, 'pulls', { state: 'open' }),
    totalClosed: fetchStats(owner, repo, 'pulls', { state: 'closed' }),
  }

  return [
    {
      // Issues are included the number of real issues and the number of PRs
      totalOpen: issueStats.totalOpen - pullRequestStats.totalOpen,
      totalClosed: issueStats.totalClosed - pullRequestStats.totalClosed,
    },
    pullRequestStats,
  ]
}

export function metaByUrl(url: string): Metadata {
  const [owner, repo] = utils.parseOwnerRepo(url)
  const repository = fetchRepository(owner, repo)
  const lastCommit = fetchCommit(owner, repo, repository.defaultBranch)
  const lastTag = fetchLastTag(owner, repo)
  const totalTags = fetchStats(owner, repo, 'tags', {})
  const [issueStats, pullRequestStats] = fetchIssueStats(owner, repo)

  return {
    repository,
    lastCommit,

    lastTag,
    totalTags,

    issueStats,
    pullRequestStats,
  }
}
