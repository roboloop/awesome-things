import { RepositoryMetaQuery, RepositoryMetaQueryVariables } from '../generated/types'
import query from '../queries/repository_meta.graphql'
import * as utils from './utils'

export interface Repository {
  avatar: string
  name: string
  fullName: string
  description: string
  defaultBranch: string
  topics: string[]

  stars: number

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

export interface Release {
  name?: string
  publishedAt?: string
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

  lastRelease: Release
  totalReleases: number

  issueStats: IssueStats
  pullRequestStats: IssueStats

  mentionableUsers: number
}

const host = 'api.github.com'
const defaultHeaders = {
  Accept: 'application/vnd.github+json',
  Authorization: 'Bearer ' + import.meta.env.VITE_GITHUB_TOKEN,
  'X-GitHub-Api-Version': '2022-11-28',
}

export function fetchReadme(owner: string, repo: string): string {
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'get',
    headers: defaultHeaders,
  }
  const url = `https://${host}/repos/${owner}/${repo}/readme`
  const response = UrlFetchApp.fetch(url, options)
  const data = JSON.parse(response.getContentText())
  const bytes = Utilities.base64Decode(data.content)

  return Utilities.newBlob(bytes).getDataAsString()
}

function metadataByGraphql(owner: string, name: string): Metadata {
  const variables: RepositoryMetaQueryVariables = {
    owner,
    name,
  }

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'post',
    headers: defaultHeaders,
    payload: JSON.stringify({ query, variables }),
  }

  const url = `https://${host}/graphql`
  const response = UrlFetchApp.fetch(url, options)
  const json: { data: RepositoryMetaQuery } = JSON.parse(response.getContentText())
  const repository = json.data.repository
  if (repository === null || repository === undefined) {
    throw new Error('Repository not found')
  }

  return {
    repository: {
      avatar: repository.owner.avatarUrl,
      name: repository.name,
      fullName: repository.nameWithOwner,
      description: repository.description ?? '',
      defaultBranch: repository.defaultBranchRef?.name ?? '',
      topics:
        repository.repositoryTopics.nodes
          ?.map(n => n?.topic.name)
          ?.filter(n => typeof n === 'string') ?? [],

      stars: repository.stargazerCount,

      isFork: repository.isFork,
      isArchived: repository.isArchived,

      htmlUrl: repository.url,
      homepageUrl: repository.homepageUrl,

      updatedAt: repository.updatedAt,
      createdAt: repository.createdAt,
    },
    issueStats: {
      totalOpen: repository.open_issues.totalCount,
      totalClosed: repository.closed_issues.totalCount,
    },
    pullRequestStats: {
      totalOpen: repository.open_pull_requests.totalCount,
      totalClosed: repository.closed_pull_requests.totalCount,
    },
    lastCommit: {
      commitedAt:
        (repository.defaultBranchRef?.target as { __typename: 'Commit'; committedDate: string })
          ?.committedDate ?? '',
    },
    lastRelease: {
      name: repository.latestRelease?.name ?? '',
      publishedAt: repository.latestRelease?.publishedAt ?? '',
    },
    lastTag: {
      version: repository.latestTag?.edges?.[0]?.node?.name,
    },
    totalReleases: repository.releases.totalCount,
    totalTags: repository.tags?.totalCount ?? 0,
    mentionableUsers: repository.mentionableUsers.totalCount,
  }
}

export function metaByUrl(url: string): Metadata {
  if (!utils.isSupportedUrl(url)) {
    throw new Error('This is not GitHub repository')
  }

  const [owner, repo] = utils.parseOwnerRepo(url)

  return metadataByGraphql(owner, repo)
}
