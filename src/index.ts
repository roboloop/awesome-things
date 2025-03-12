import * as handlers from '@/handlers/handlers'

function onOpen(): void {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu('Awesome Things')
    .addItem('Load Table of Contents', 'loadTopOfContent')
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

