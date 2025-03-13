import * as handlers from '@/handlers/handlers'

function onOpen(): void {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu('Awesome Things')
    .addItem('Load Table of Contents', 'loadTopOfContent')
    .addItem('Load Thing', 'loadThing')
    .addItem('Clean things', 'cleanThings')
    .addToUi()
}

function loadTopOfContent(): void {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()

  const ui = SpreadsheetApp.getUi()
  const response = ui.prompt(
    'Warning',
    `Enter the link to the awesome-xxx repository\nSomething like: https://github.com/vinta/awesome-python`,
    ui.ButtonSet.OK_CANCEL,
  )
  if (response.getSelectedButton() === ui.Button.OK) {
    const repo = response.getResponseText()

    handlers.loadTopOfContent(spreadsheet, repo)
  }
}

function loadThing(): void {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = spreadsheet.getActiveSheet()
  if (sheet.getName() !== handlers.mainSheetName) {
    throw new Error(`Only for ${handlers.mainSheetName} sheet allowed`)
  }

  const selectedValue = sheet.getActiveRange()?.getValue()
  if (!selectedValue) {
    throw new Error('No selected value')
  }

  handlers.loadSection(spreadsheet, selectedValue)
}

function cleanThings(): void {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()

  const ui = SpreadsheetApp.getUi()
  const response = ui.alert('Warning', 'Clean all things?', ui.ButtonSet.YES_NO)

  if (response === ui.Button.YES) {
    handlers.cleanThings(spreadsheet)
  }
}
