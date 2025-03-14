import * as urls from '@/handlers/urls'

export class ThingBuilder {
  private avatar?: string
  private name?: string
  private htmlUrl?: string
  private fullName?: string
  private description?: string
  private stars?: number
  private openIssuesCount?: number
  private lastCommittedAt?: string
  private createdAt?: string
  private isFork?: boolean
  private isArchived?: boolean
  private topics: string[] = []
  private homepageUrl?: string
  private lastTag?: string
  private totalTags?: number
  private lastRelease?: string
  private totalReleases?: number
  private totalOpenIssues?: number
  private totalClosedIssues?: number
  private totalOpenPullRequests?: number
  private totalClosedPullRequests?: number

  setAvatar(url: string): this {
    this.avatar = url
    return this
  }

  setName(name: string): this {
    this.name = name
    return this
  }

  setFullName(fullName: string): this {
    this.fullName = fullName
    return this
  }

  setHtmlUrl(url: string): this {
    this.htmlUrl = url
    return this
  }

  setDescription(description: string): this {
    this.description = description
    return this
  }

  setStars(stars: number): this {
    this.stars = stars
    return this
  }

  setOpenIssuesCount(count: number): this {
    this.openIssuesCount = count
    return this
  }

  setLastCommittedAt(lastCommittedAt: string): this {
    this.lastCommittedAt = lastCommittedAt
    return this
  }

  setCreatedAt(createdAt: string): this {
    this.createdAt = createdAt
    return this
  }

  setIsFork(isFork: boolean): this {
    this.isFork = isFork
    return this
  }

  setIsArchived(isArchived: boolean): this {
    this.isArchived = isArchived
    return this
  }

  setTopics(topics: string[]): this {
    this.topics = topics
    return this
  }

  setHomepageUrl(url?: string): this {
    this.homepageUrl = url
    return this
  }

  setLastTag(lastTag?: string): this {
    this.lastTag = lastTag

    return this
  }

  setTotalTags(totalTags: number): this {
    this.totalTags = totalTags

    return this
  }

  setLastRelease(lastRelease?: string): this {
    this.lastRelease = lastRelease

    return this
  }

  setTotalReleases(totalReleases: number): this {
    this.totalReleases = totalReleases

    return this
  }

  setTotalIssues(totalOpen: number, totalClosed: number): this {
    this.totalOpenIssues = totalOpen
    this.totalClosedIssues = totalClosed

    return this
  }

  setTotalPullRequests(totalOpen: number, totalClosed: number): this {
    this.totalOpenPullRequests = totalOpen
    this.totalClosedPullRequests = totalClosed

    return this
  }

  private doBuild(): object {
    const s = '|'
    return {
      avatar: this.avatar ? `=IMAGE("${this.avatar}", 1)` : '',
      name: this.name || '',
      fullName:
        this.htmlUrl && this.fullName ? `=HYPERLINK("${this.htmlUrl}", "${this.fullName}")` : '',
      description: this.description || '',

      stars: this.stars || '',
      issues:
        typeof this.totalOpenIssues === 'number' && typeof this.totalClosedIssues === 'number'
          ? `${this.totalOpenIssues}${s}${this.totalClosedIssues}${s}${this.totalOpenIssues + this.totalClosedIssues}`
          : '',
      pullRequests:
        typeof this.totalOpenPullRequests === 'number' &&
        typeof this.totalClosedPullRequests === 'number'
          ? `${this.totalOpenPullRequests}${s}${this.totalClosedPullRequests}${s}${this.totalOpenPullRequests + this.totalClosedPullRequests}`
          : '',
      lastTag: this.lastTag || '',
      totalTags: typeof this.totalTags === 'number' ? this.totalTags : '',
      lastRelease: this.lastRelease || '',
      totalReleases: typeof this.totalReleases === 'number' ? this.totalReleases : '',
      lastCommitAt: this.lastCommittedAt ? new Date(this.lastCommittedAt) : '',
      createdAt: this.createdAt ? new Date(this.createdAt) : '',

      topics: this.topics.join(', '),
      homepageUrl: this.homepageUrl || '',
      isFork: this.isFork !== undefined ? this.isFork : '',
      isArchived: this.isArchived !== undefined ? this.isArchived : '',

      explorerUrl: this.htmlUrl ? urls.generateStarsExplorerUrl(this.htmlUrl) : '',
    }
  }

  build(): (string | number | boolean | Date | undefined)[] {
    return Object.values(this.doBuild())
  }

  headers(): string[] {
    return Object.keys(this.doBuild())
  }
}
