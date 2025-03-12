import * as github from '@/client/github'
import * as utils from '@/client/utils'
import * as parser from '@/parser/parser'
import * as toc from './toc'

export const mainSheetName = 'ToC'

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

  const builder = new toc.ToCBuilder()
  tableOfContents.forEach(({ name, offset, total }) => builder.addThing(name, offset, total))
  const rows = builder.build()

  const sheet = makeOrCleanSheet(spreadsheet, mainSheetName)
  putMetaRow(sheet, url)
  const range = sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)

  range.setValues(rows)
  range.createFilter()
  range.applyRowBanding(SpreadsheetApp.BandingTheme.GREEN, false, false)
  sheet.protect().setWarningOnly(true)

  const helper = '1. Choose the cell with the thing\n2. Open the "Awesome Things" menu\n3. Click "Load Thing"'
    .split('\n')
    .map(l => [l])
  sheet.getRange(2, sheet.getLastColumn() + 2, helper.length, 1).setValues(helper)

  spreadsheet.setActiveSheet(sheet)
}


export function cleanThings(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet): void {
  spreadsheet
    .getSheets()
    .filter(s => s.getName() !== mainSheetName)
    .forEach(sheet => spreadsheet.deleteSheet(sheet))
}
