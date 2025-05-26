import * as github from '@/client/github'
import * as utils from '@/client/utils'
import * as parser from '@/parser/parser'
import * as thing from './thing'
import * as toc from './toc'

export const mainSheetName = 'ToC'
export const defaultHeight = 21

function makeOrCleanSheet(
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  name: string,
): GoogleAppsScript.Spreadsheet.Sheet {
  let sheet = spreadsheet.getSheetByName(name)
  if (sheet == null) {
    const names = spreadsheet.getSheets().map(s => s.getName())
    const index = names.findIndex(n => name.localeCompare(n) < 0)
    const pos = index !== -1 ? Math.max(2, index) : spreadsheet.getSheets().length + 1
    sheet = spreadsheet.insertSheet(name, <GoogleAppsScript.Integer>pos)
  }
  const lastRow = sheet.getLastRow()
  const lastColumn = sheet.getLastColumn()
  if (lastRow >= 1) {
    sheet.getRange(1, 1, lastRow, lastColumn).clearContent()
  }

  sheet.getFilter()?.remove()
  sheet.getBandings().forEach(b => b.remove())

  return sheet
}

function putMetaRow(sheet: GoogleAppsScript.Spreadsheet.Sheet, url: string): void {
  const meta = [url]
  sheet.getRange(1, 1, 1, meta.length).setValues([meta])
}

function getMetaRow(sheet: GoogleAppsScript.Spreadsheet.Sheet): [string] {
  return <[string]>sheet.getRange(1, 1, 1, 1).getValues()[0]
}

export function loadTopOfContent(
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  url: string,
): void {
  const [owner, repo] = utils.parseOwnerRepo(url)
  const readme = github.fetchReadme(owner, repo)
  const tableOfContents = parser.extractTableOfContents(readme)

  const sheet = makeOrCleanSheet(spreadsheet, mainSheetName)
  putMetaRow(sheet, url)

  const builder = new toc.ToCBuilder()
  tableOfContents.forEach(({ name, offset, total }) => builder.addThing(name, offset, total))
  const rows = builder.build()
  if (rows.length === 0) {
    return
  }

  const range = sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)

  range.setValues(rows)
  range.createFilter()
  range.applyRowBanding(SpreadsheetApp.BandingTheme.GREEN, false, false)
  sheet.protect().setWarningOnly(true)

  const helper =
    '1. Choose the cell with the thing\n2. Open the "Awesome Things" menu\n3. Click "Load Thing"'
      .split('\n')
      .map(l => [l])
  sheet.getRange(2, sheet.getLastColumn() + 2, helper.length, 1).setValues(helper)

  spreadsheet.setActiveSheet(sheet)
}

export function loadSection(
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  section: string,
): void {
  // Load and insert data
  const mainSheet = spreadsheet.getSheetByName(mainSheetName)
  if (!mainSheet) {
    throw new Error(`${mainSheetName} not found`)
  }
  const [url] = getMetaRow(mainSheet)
  const [owner, repo] = utils.parseOwnerRepo(url)
  const readme = github.fetchReadme(owner, repo)
  const things = parser.extractThings(readme, section)
  if (things.length === 0) {
    throw new Error('Things not found')
  }

  const sheet = makeOrCleanSheet(spreadsheet, section)
  sheet.setColumnWidth(1, <GoogleAppsScript.Integer>defaultHeight)
  const headers = new thing.ThingBuilder().headers()
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])

  for (const { name, url, desc, additionalUrls } of things) {
    try {
      const supportedUrl = utils.isSupportedUrl(url)
        ? url
        : (additionalUrls.find(u => utils.isSupportedUrl(u)) ?? url)

      const {
        repository,
        lastCommit,
        lastTag,
        totalTags,
        lastRelease,
        totalReleases,
        issueStats,
        pullRequestStats,
        mentionableUsers,
      } = github.metaByUrl(supportedUrl)
      const line = new thing.ThingBuilder()
        .setAvatar(repository.avatar)
        .setName(repository.name)
        .setHtmlUrl(repository.htmlUrl)
        .setFullName(repository.fullName)
        .setDescription(repository.description)
        .setStars(repository.stars)
        .setLastCommittedAt(lastCommit.commitedAt)
        .setCreatedAt(repository.createdAt)
        .setIsFork(repository.isFork)
        .setIsArchived(repository.isArchived)
        .setTopics(repository.topics)
        .setHomepageUrl(repository.homepageUrl)
        .setLastTag(lastTag.version)
        .setTotalTags(totalTags)
        .setLastRelease(lastRelease.name)
        .setLastReleaseAt(lastRelease.publishedAt)
        .setTotalReleases(totalReleases)
        .setTotalIssues(issueStats.totalOpen, issueStats.totalClosed)
        .setTotalPullRequests(pullRequestStats.totalOpen, pullRequestStats.totalClosed)
        .setMentionableUsers(mentionableUsers)
        .build()

      sheet.appendRow(line)
    } catch (e) {
      console.error(`${name} error`, e)
      sheet.appendRow(['', name, url, desc, e])
    }
  }

  const range = sheet.getDataRange()
  range.createFilter()
  range.applyRowBanding(SpreadsheetApp.BandingTheme.GREEN, false, false)
}

export function cleanThings(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet): void {
  spreadsheet
    .getSheets()
    .filter(s => s.getName() !== mainSheetName)
    .forEach(sheet => spreadsheet.deleteSheet(sheet))
}
