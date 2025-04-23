function run() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()

  // @ts-expect-error no import, because of apps script building
  loadSection(spreadsheet, '')
  // @ts-expect-error no import, because of apps script building
  fetchGraphQLRepository()
}
