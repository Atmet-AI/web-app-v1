# Google Sheets

Google Sheets is a cloud-based spreadsheet tool enabling real-time collaboration, data analysis, and integration with other Google Workspace apps

- **Category:** spreadsheets
- **Auth:** OAUTH2
- **Composio Managed App Available?** Yes
- **Tools:** 53
- **Triggers:** 16
- **Slug:** `GOOGLESHEETS`
- **Version:** 20260721_00

## Frequently Asked Questions

### How do I set up custom Google OAuth credentials for Google Sheets?

For a step-by-step guide on creating and configuring your own Google OAuth credentials with Composio, see [How to create OAuth2 credentials for Google Apps](https://composio.dev/auth/googleapps).

### Why am I seeing "App is blocked" when connecting Google Sheets?

The OAuth client is requesting scopes that Google hasn't verified for that client. This usually happens when you add extra scopes beyond the defaults.

Remove the additional scopes from your auth config, or create your own OAuth app and submit the scopes for verification. See [How to create OAuth2 credentials for Google Apps](https://composio.dev/auth/googleapps).

### Why am I getting "Google Sheets API has not been used in project" error?

When using custom OAuth credentials, the Google Sheets API must be enabled in the Google Cloud project that owns those credentials. Enable it in Google Cloud Console under APIs & Services, wait a few minutes, and retry.

### Why am I getting "Error 400: invalid_scope"?

The requested scopes are invalid or incorrectly formatted in the authorization URL. Verify your scope values against the [Google OAuth scopes docs](https://developers.google.com/identity/protocols/oauth2). If you're creating auth configs programmatically, see the [programmatic auth config guide](/docs/programmatic-auth-configs).

### Why does the OAuth consent screen show "Composio" instead of my app?

By default, the consent screen uses Composio's OAuth app. To show your own app name and logo, create your own OAuth app and set a custom redirect URL. See [White-labeling authentication](/docs/white-labeling-authentication#using-your-own-oauth-apps).

### Why am I getting 401 errors on tool calls?

The user's access token is no longer valid. Common causes: the user revoked access, changed their password or 2FA, a Workspace admin policy changed, or Google's refresh token limit was exceeded. Re-authenticating the user typically resolves this.

### Why am I getting "Quota Exhausted" or "rate limit exhausted"?

Google enforces per-minute and daily request quotas. These errors may also appear as a 429. If you're using Composio's default OAuth app, you share that quota with other users, which can cause limits to be hit faster. Use your own OAuth app credentials to get a dedicated quota, and add exponential backoff and retries to handle transient rate limits.

## Tools

### Add Sheet to Existing Spreadsheet

**Slug:** `GOOGLESHEETS_ADD_SHEET`

Adds a new sheet to a spreadsheet. Supports three sheet types: GRID, OBJECT, and DATA_SOURCE. SHEET TYPES: - GRID (default): Standard spreadsheet with rows/columns. Use properties to set dimensions, tab color, etc. - OBJECT: Sheet containing a chart. Requires objectSheetConfig with chartSpec (basicChart or pieChart). - DATA_SOURCE: Sheet connected to BigQuery. Requires dataSourceConfig with bigQuery spec and bigquery.readonly OAuth scope. OTHER NOTES: - Sheet names must be unique; use forceUnique=true to auto-append suffix (_2, _3) if name exists - For tab colors, use EITHER rgbColor OR themeColor, not both - Avoid 'index' when creating sheets in parallel (causes errors) - OBJECT sheets are created via addChart with position.newSheet=true - DATA_SOURCE sheets require bigquery.readonly OAuth scope Use cases: Add standard grid sheet, create chart on dedicated sheet, connect to BigQuery data source.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | No | The name for the new sheet tab. Must be unique within the spreadsheet. Example: "Q3 Report", "Sales Data 2025". This is a convenience parameter - alternatively, you can set this via properties.title. Note: sheet_name is also accepted as an alias for title. |
| `properties` | object | No | Advanced sheet properties (grid dimensions, tab color, position, etc.). For simple cases, just use the 'title' parameter directly. Use this for additional customization. |
| `force_unique` | boolean | No | When True (default), automatically ensures the sheet name is unique by appending a numeric suffix (e.g., '_2', '_3') if the requested name already exists. This makes the action resilient to retries and parallel workflows. When False, the action fails with an error if a sheet with the same name already exists. |
| `spreadsheet_id` | string | Yes | REQUIRED. Cannot be empty. The ID of the target spreadsheet where the new sheet will be added. This is the long alphanumeric string in the Google Sheet URL (e.g., '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'). Use 'Search Spreadsheets' action to find the spreadsheet ID by name if you don't have it. |
| `data_source_config` | object | No | Configuration for creating a DATA_SOURCE sheet.  DATA_SOURCE sheets connect to external data sources like BigQuery. The API uses addDataSource request which automatically creates the associated sheet.  IMPORTANT: Requires additional OAuth scope: bigquery.readonly |
| `object_sheet_config` | object | No | Configuration for creating an OBJECT sheet (a sheet containing a chart).  To create an OBJECT sheet, you must provide chart configuration. The API uses addChart with position.newSheet=true to create the chart on its own sheet. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Aggregate Column Data

**Slug:** `GOOGLESHEETS_AGGREGATE_COLUMN_DATA`

Searches for rows where a specific column matches a value and performs mathematical operations on data from another column.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `operation` | string ("sum" | "average" | "count" | "min" | "max" | "percentage") | Yes | The mathematical operation to perform on the target column values. |
| `sheet_name` | string | Yes | The name of the specific sheet within the spreadsheet. Matching is case-insensitive. If no exact match is found, partial matches will be attempted (e.g., 'overview' will match 'Overview 2025'). |
| `search_value` | string | No | The exact value to search for in the search column. Case-sensitive by default. If not provided (or if search_column is not provided), all rows in the target column will be aggregated without filtering. |
| `search_column` | string | No | The column to search in for filtering rows. Can be a letter (e.g., 'A', 'B') or column name from header row (e.g., 'Region', 'Department'). If not provided, all rows in the target column will be aggregated without filtering. |
| `target_column` | string | Yes | The column to aggregate data from. Can be a letter (e.g., 'C', 'D') or column name from header row (e.g., 'Sales', 'Revenue'). |
| `case_sensitive` | boolean | No | Whether the search should be case-sensitive. |
| `has_header_row` | boolean | No | Whether the first row contains column headers. If True, column names can be used for search_column and target_column. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Sheets spreadsheet. |
| `percentage_total` | number | No | For percentage operation, the total value to calculate percentage against. If not provided, uses sum of all values in target column. |
| `additional_filters` | array | No | Extra column=value conditions applied with AND logic on top of search_column/search_value. Use this to filter on multiple columns simultaneously. Example: [{"column": "Region", "value": "APAC"}] combined with search_column=Product/search_value=Beacon returns only rows where Product=Beacon AND Region=APAC. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Append Dimension

**Slug:** `GOOGLESHEETS_APPEND_DIMENSION`

Tool to append new rows or columns to a sheet, increasing its size. Use when you need to add empty rows or columns to an existing sheet.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `length` | integer | Yes | The number of rows or columns to append. |
| `sheet_id` | integer | Yes | The numeric ID of the sheet (not the sheet name). This is a non-negative integer found in the sheet's URL as the 'gid' parameter (e.g., gid=0) or in the sheet properties. The first sheet in a spreadsheet typically has sheet_id=0. |
| `dimension` | string ("ROWS" | "COLUMNS") | Yes | Specifies whether to append rows or columns. |
| `spreadsheet_id` | string | Yes | The ID of the spreadsheet. |
| `response_ranges` | array | No | Limits the ranges of the spreadsheet to include in the response. |
| `response_include_grid_data` | boolean | No | True if grid data should be included in the response (if includeSpreadsheetInResponse is true). |
| `include_spreadsheet_in_response` | boolean | No | True if the updated spreadsheet should be included in the response. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Auto-Resize Rows or Columns

**Slug:** `GOOGLESHEETS_AUTO_RESIZE_DIMENSIONS`

Auto-fit column widths or row heights for a dimension range using batchUpdate.autoResizeDimensions. Use when you need to automatically adjust row heights or column widths to fit content after writing data.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sheet_id` | integer | No | The numeric ID of the sheet to resize. Either sheet_id or sheet_name must be provided. If both are provided, sheet_name takes precedence and will be resolved to sheet_id. |
| `dimension` | string ("ROWS" | "COLUMNS") | Yes | The dimension to auto-resize. Use 'ROWS' to auto-fit row heights or 'COLUMNS' to auto-fit column widths. |
| `end_index` | integer | Yes | The zero-based end index of the dimension range to resize (exclusive). Must be greater than start_index. For example, to resize columns A-C, use start_index=0 and end_index=3. |
| `sheet_name` | string | No | The name of the sheet to resize. Either sheet_id or sheet_name must be provided. Using sheet_name is recommended as it's more intuitive. If both sheet_id and sheet_name are provided, sheet_name takes precedence. |
| `start_index` | integer | Yes | The zero-based start index of the dimension range to resize (inclusive). For columns, 0 = column A. For rows, 0 = row 1. |
| `spreadsheet_id` | string | Yes | The ID of the spreadsheet containing the sheet to resize. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Batch Clear Values By Data Filter

**Slug:** `GOOGLESHEETS_BATCH_CLEAR_VALUES_BY_DATA_FILTER`

Clears one or more ranges of values from a spreadsheet using data filters. The caller must specify the spreadsheet ID and one or more DataFilters. Ranges matching any of the specified data filters will be cleared. Only values are cleared -- all other properties of the cell (such as formatting, data validation, etc..) are kept.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dataFilters` | array | Yes | The DataFilters used to determine which ranges to clear. |
| `spreadsheetId` | string | Yes | The ID of the spreadsheet to update. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Batch get spreadsheet

**Slug:** `GOOGLESHEETS_BATCH_GET`

Retrieves data from specified cell ranges in a Google Spreadsheet.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ranges` | array | No | A list of cell ranges in A1 notation from which to retrieve data. If this list is omitted, empty, or contains only empty strings, all data from the first sheet of the spreadsheet will be fetched. Empty strings in the list are automatically filtered out. Supported formats: (1) Bare sheet name like 'Sheet1' to get all data from that sheet, (2) Sheet with range like 'Sheet1!A1:B2', (3) Just cell reference like 'A1:B2' (uses first sheet). For sheet names with spaces or special characters, enclose in single quotes (e.g., "'My Sheet'" or "'My Sheet'!A1:B2"). IMPORTANT: For large sheets, always use bounded ranges with explicit row limits (e.g., 'Sheet1!A1:Z10000' instead of 'Sheet1!A:Z'). Unbounded column ranges like 'A:Z' on sheets with >10,000 rows may cause timeouts or errors. If you need all data from a large sheet, fetch in chunks of 10,000 rows at a time. |
| `majorDimension` | string ("DIMENSION_UNSPECIFIED" | "ROWS" | "COLUMNS") | No | The major dimension for organizing data in results. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet from which data will be retrieved. This is the ID found in the spreadsheet URL after /d/. You can provide either the spreadsheet ID directly or a full Google Sheets URL (the ID will be extracted automatically). |
| `valueRenderOption` | string ("FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA") | No | How values should be rendered in the output. FORMATTED_VALUE: Values are calculated and formatted (default). UNFORMATTED_VALUE: Values are calculated but not formatted. FORMULA: Values are not calculated; the formula is returned instead. |
| `dateTimeRenderOption` | string ("SERIAL_NUMBER" | "FORMATTED_STRING") | No | How dates and times should be rendered in the output. SERIAL_NUMBER: Dates are returned as serial numbers (default). FORMATTED_STRING: Dates returned as formatted strings. |
| `empty_strings_filtered` | boolean | No | Indicates whether empty strings were filtered from the response. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Batch update spreadsheet (Deprecated)

**Slug:** `GOOGLESHEETS_BATCH_UPDATE`

DEPRECATED: Use GOOGLESHEETS_VALUES_UPDATE instead. Write values to ONE range in a Google Sheet, or append as new rows if no start cell is given. IMPORTANT - This tool does NOT accept the Google Sheets API's native batch format: - WRONG: {"data": [{"range": "...", "values": [[...]]}], ...} - CORRECT: {"sheet_name": "...", "values": [[...]], "first_cell_location": "...", ...} To update MULTIPLE ranges, make SEPARATE CALLS to this tool for each range. Features: - Auto-expands grid for large datasets (prevents range errors) - Set first_cell_location to write at a specific position (e.g., "A1", "B5") - Omit first_cell_location to append values as new rows at the end Requirements: Target sheet must exist and spreadsheet must contain at least one worksheet.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `values` | array | Yes | A 2D array of cell values where each inner array represents a row. Values can be strings, numbers, booleans, or None/null for empty cells. Ensure columns are properly aligned across rows. |
| `sheet_name` | string | Yes | The name of the specific sheet (tab) within the spreadsheet to update (required, separate from cell reference). Case-insensitive matching is supported (e.g., 'sheet1' will match 'Sheet1'). Note: Default sheet names are locale-dependent (e.g., 'Sheet1' in English, 'Foglio1' in Italian, 'Hoja 1' in Spanish, '시트1' in Korean, 'Feuille 1' in French). If you specify a common default name like 'Sheet1' and it doesn't exist, the action will automatically use the first sheet in the spreadsheet. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Sheets spreadsheet to be updated. Must be an alphanumeric string (with hyphens and underscores allowed) typically 44 characters long. Can be found in the spreadsheet URL between '/d/' and '/edit'. Example: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit' has ID '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'. |
| `value_input_option` | string ("RAW" | "USER_ENTERED") | No | How input data should be interpreted. 'USER_ENTERED': Values are parsed as if typed by a user (e.g., strings may become numbers/dates, formulas are calculated). 'RAW': Values are stored exactly as provided without parsing (e.g., '123' stays as string, '=SUM(A1:B1)' is not calculated). |
| `first_cell_location` | string | No | The starting cell for the update range, specified as a single cell in A1 notation WITHOUT sheet prefix (e.g., 'A1', 'B2', 'AA931'). The update will extend from this cell to the right and down based on the provided values. Sheet name must be provided separately in the 'sheet_name' field. If omitted or set to null, values are appended as new rows to the sheet. Note: Use only a single cell reference (e.g., 'AA931'), NOT a range (e.g., 'AA931:AF931') or sheet-prefixed notation (e.g., 'Sheet1!A1'). |
| `include_values_in_response` | boolean | No | If set to True, the response will include the updated values in the 'spreadsheet.responses[].updatedData' field. The updatedData object contains 'range' (A1 notation), 'majorDimension' (ROWS), and 'values' (2D array of the actual cell values after the update). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Batch Update Values by Data Filter

**Slug:** `GOOGLESHEETS_BATCH_UPDATE_VALUES_BY_DATA_FILTER`

Tool to update values in ranges matching data filters. Use when you need to update specific data in a Google Sheet based on criteria rather than fixed cell ranges.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | array | Yes | The new values to apply to the spreadsheet. If more than one range is matched by the specified DataFilter the specified values are applied to all of those ranges. Can be provided as a JSON string or as a list of DataFilterValueRange objects. |
| `spreadsheetId` | string | Yes | The ID of the spreadsheet to update. |
| `valueInputOption` | string ("INPUT_VALUE_OPTION_UNSPECIFIED" | "RAW" | "USER_ENTERED") | Yes | How the input data should be interpreted. RAW: Values are stored exactly as entered, without parsing. USER_ENTERED: Values are parsed as if typed by a user (numbers stay numbers, strings prefixed with '=' become formulas, etc.). INPUT_VALUE_OPTION_UNSPECIFIED: Default input value option is not specified. |
| `includeValuesInResponse` | boolean | No | Determines if the update response should include the values of the cells that were updated. By default, responses do not include the updated values. |
| `responseValueRenderOption` | string ("FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA") | No | Determines how values in the response should be rendered. The default render option is FORMATTED_VALUE. |
| `responseDateTimeRenderOption` | string ("SERIAL_NUMBER" | "FORMATTED_STRING") | No | Determines how dates, times, and durations in the response should be rendered. This is ignored if responseValueRenderOption is FORMATTED_VALUE. The default dateTime render option is SERIAL_NUMBER. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Clear Basic Filter

**Slug:** `GOOGLESHEETS_CLEAR_BASIC_FILTER`

Tool to clear the basic filter from a sheet. Use when you need to remove an existing basic filter from a specific sheet within a Google Spreadsheet.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sheet_id` | integer | Yes | The ID of the sheet on which the basic filter should be cleared. |
| `spreadsheet_id` | string | Yes | The ID of the spreadsheet. |
| `response_ranges` | array | No | Limits the ranges included in the response spreadsheet. Only applicable when include_spreadsheet_in_response is true. |
| `response_include_grid_data` | boolean | No | True if grid data should be returned in the response. Only applicable when include_spreadsheet_in_response is true. |
| `include_spreadsheet_in_response` | boolean | No | Determines if the update response should include the spreadsheet resource. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Clear spreadsheet values

**Slug:** `GOOGLESHEETS_CLEAR_VALUES`

Clears cell content (preserving formatting and notes) from a specified A1 notation range in a Google Spreadsheet; the range must correspond to an existing sheet and cells.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `range` | string | Yes | The A1 notation of the range to clear values from (e.g., 'Sheet1!A1:B2', 'MySheet!C:C', or 'A1:D5'). If the sheet name is omitted (e.g., 'A1:B2'), the operation applies to the first visible sheet. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet from which to clear values. This ID can be found in the URL of the spreadsheet. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Chart in Google Sheets

**Slug:** `GOOGLESHEETS_CREATE_CHART`

Create a chart in a Google Sheets spreadsheet using the specified data range and chart type. Conditional requirements: - Provide either a simple chart via chart_type + data_range (basicChart), OR supply a full chart_spec supporting all chart types. Exactly one approach should be used. - When using chart_spec, set exactly one of the union fields (basicChart | pieChart | bubbleChart | candlestickChart | histogramChart | waterfallChart | treemapChart | orgChart | scorecardChart).

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | No | Optional title for the chart. |
| `sheet_id` | integer | Yes | The numeric sheetId (not the sheet name/title) of the worksheet where the chart will be created. This is a unique integer identifier for the sheet within the spreadsheet. The first/default sheet typically has sheetId=0. IMPORTANT: Use 'Get Spreadsheet Info' action to retrieve valid sheetIds - look for sheets[].properties.sheetId in the response. The sheetId must exist in the target spreadsheet; using an ID from a different spreadsheet will fail. |
| `subtitle` | string | No | Optional subtitle for the chart. |
| `chart_spec` | object | No | Optional full ChartSpec object to send to the Google Sheets API. Use this to support ALL chart types and advanced options. Must set exactly one of: basicChart, pieChart, bubbleChart, candlestickChart, histogramChart, treemapChart, waterfallChart, orgChart, scorecardChart. See https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/charts#ChartSpec. |
| `chart_type` | string ("BAR" | "LINE" | "AREA" | "COLUMN" | "SCATTER" | "COMBO" | "STEPPED_AREA" | "PIE" | "HISTOGRAM" | "BUBBLE" | "CANDLESTICK" | "TREEMAP" | "WATERFALL" | "ORG" | "SCORECARD") | Yes | Type of chart to create. Supported types: BAR, LINE, AREA, COLUMN, SCATTER, COMBO, STEPPED_AREA, PIE, HISTOGRAM, BUBBLE, CANDLESTICK, TREEMAP, WATERFALL, ORG, SCORECARD. Case-insensitive and whitespace-tolerant. |
| `data_range` | string | Yes | A single contiguous range of data for the chart in A1 notation (e.g., 'A1:C10' or 'Sheet1!B2:D20'). Must be a single continuous range - comma-separated multi-ranges (e.g., 'A1:A10,C1:C10') are not supported. When chart_spec is not provided, the first column is used as the domain/labels and the remaining columns as series. IMPORTANT: PIE charts require at least 2 columns - the first column for category labels (domain) and the second column for numeric values (series). Single-column ranges are not supported for PIE charts. |
| `x_axis_title` | string | No | Optional title for the X-axis. |
| `y_axis_title` | string | No | Optional title for the Y-axis. |
| `background_red` | number | No | Red component of chart background color (0.0-1.0). If not specified, uses default. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Sheets spreadsheet where the chart will be created. Must be the actual spreadsheet ID from the URL (e.g., '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'), NOT the spreadsheet name or title. Find it in the URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit |
| `background_blue` | number | No | Blue component of chart background color (0.0-1.0). If not specified, uses default. |
| `legend_position` | string | No | Position of the chart legend. Options: BOTTOM_LEGEND, TOP_LEGEND, LEFT_LEGEND, RIGHT_LEGEND, NO_LEGEND. |
| `background_green` | number | No | Green component of chart background color (0.0-1.0). If not specified, uses default. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create a Google Sheet

**Slug:** `GOOGLESHEETS_CREATE_GOOGLE_SHEET1`

Creates a new Google Spreadsheet in Google Drive. If a title is provided, the spreadsheet will be created with that name. If no title is provided, Google will create a spreadsheet with a default name like 'Untitled spreadsheet'. Optionally create the spreadsheet in a specific folder by providing either: - folder_id: The Google Drive folder ID (preferred, unambiguous) - folder_name: The folder name (searches for exact match; if multiple folders match, returns choices) If neither folder_id nor folder_name is provided, the spreadsheet is created in the root Drive folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | No | The title for the new Google Sheet. If omitted, Google will create a spreadsheet with a default name like 'Untitled spreadsheet'. |
| `folder_id` | string | No | Google Drive folder ID where the spreadsheet should be created. If provided, the spreadsheet will be moved to this folder after creation. Takes precedence over folder_name. |
| `folder_name` | string | No | Google Drive folder name where the spreadsheet should be created. If provided and folder_id is not provided, the action will search for a folder with this exact name. If multiple folders match, you'll receive a list to choose from. If no folder matches, an error is returned. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create spreadsheet column

**Slug:** `GOOGLESHEETS_CREATE_SPREADSHEET_COLUMN`

Creates a new column in a Google Spreadsheet. Specify the target sheet using sheet_id (numeric) or sheet_name (text). If neither is provided, defaults to the first sheet (sheet_id=0).

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sheet_id` | integer | No | The numeric identifier of the specific sheet (tab) within the spreadsheet. Defaults to 0 (the first sheet) if neither sheet_id nor sheet_name is provided. Use GOOGLESHEETS_GET_SHEET_NAMES or GOOGLESHEETS_FIND_WORKSHEET_BY_TITLE to obtain the sheet_id from a sheet name. |
| `sheet_name` | string | No | The name (title) of the sheet/tab where the column will be added. If provided, the action will look up the sheet_id automatically. If both sheet_id and sheet_name are provided, sheet_id takes precedence. |
| `insert_index` | integer | No | The 0-based index at which the new column will be inserted. For example, an index of 0 inserts the column before the current first column (A), and an index of 1 inserts it between the current columns A and B. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet where the column will be created. |
| `response_ranges` | array | No | Limits the ranges of the spreadsheet to include in the response. Only used if includeSpreadsheetInResponse is true. |
| `inherit_from_before` | boolean | No | If true, the new column inherits properties (e.g., formatting, width) from the column immediately to its left (the preceding column). If false (default), it inherits from the column immediately to its right (the succeeding column). This is ignored if there is no respective preceding or succeeding column. |
| `response_include_grid_data` | boolean | No | If true, grid data will be included in the response (only used if includeSpreadsheetInResponse is true). |
| `include_spreadsheet_in_response` | boolean | No | If true, the updated spreadsheet will be included in the response. Defaults to true if not specified. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create spreadsheet row

**Slug:** `GOOGLESHEETS_CREATE_SPREADSHEET_ROW`

Inserts a new, empty row into a specified sheet of a Google Spreadsheet at a given index, optionally inheriting formatting from the row above.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sheet_id` | integer | No | The numeric identifier of the sheet (tab) within the spreadsheet where the row will be inserted. This ID (gid) is found in the URL of the spreadsheet (e.g., '0' for the first sheet). Either sheet_id or sheet_name must be provided. |
| `sheet_name` | string | No | The human-readable name of the sheet (tab) within the spreadsheet where the row will be inserted (e.g., 'Sheet1'). Either sheet_id or sheet_name must be provided. If both are provided, sheet_id takes precedence. |
| `insert_index` | integer | No | The 0-based index at which the new row should be inserted. For example, an index of 0 inserts the row at the beginning of the sheet. If the index is greater than the current number of rows, the row is appended. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet. Can be provided as the ID (e.g., '1qpyC0XzHc_-_d824s2VfopkHh7D0jW4aXCS1D_AlGA') or as a full URL (the ID will be extracted automatically). |
| `response_ranges` | array | No | Limits the ranges included in the response spreadsheet. Only meaningful when include_spreadsheet_in_response is True. Use A1 notation (e.g., ['Sheet1!A1:D10']). |
| `inherit_from_before` | boolean | No | If True, the newly inserted row will inherit formatting and properties from the row immediately preceding its insertion point. If False, it will have default formatting. |
| `response_include_grid_data` | boolean | No | If True, grid data will be included in the response spreadsheet. Only meaningful when include_spreadsheet_in_response is True. Default is False. |
| `include_spreadsheet_in_response` | boolean | No | If True, the response will include the full updated Spreadsheet resource. Default behavior includes the spreadsheet when this parameter is not specified. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Chart from Google Sheets

**Slug:** `GOOGLESHEETS_DELETE_CHART`

Delete an existing chart from a Google Sheets spreadsheet. Use this action when you need to remove a chart that is no longer needed or needs to be replaced. This action is irreversible — once a chart is deleted, it cannot be recovered. The chart data source (the cells containing the data) remains unchanged; only the chart visualization is removed.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chart_id` | integer | Yes | The unique numeric identifier of the chart to delete (also known as objectId or chartId). This is the chart's ID within the spreadsheet, not the sheet ID. You can retrieve chart IDs using the 'Get Spreadsheet Info' action - look for sheets[].charts[].chartId in the response. Each chart has a unique ID that persists until the chart is deleted. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Sheets spreadsheet containing the chart to delete. Must be the actual spreadsheet ID from the URL (e.g., '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'), NOT the spreadsheet name or title. Find it in the URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Dimension (Rows/Columns)

**Slug:** `GOOGLESHEETS_DELETE_DIMENSION`

Tool to delete specified rows or columns from a sheet in a Google Spreadsheet. Use when you need to remove a range of rows or columns.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sheet_id` | integer | No | The unique numeric ID of the sheet (not the index/position). This ID is assigned by Google Sheets and does not change when sheets are reordered. Use GOOGLESHEETS_GET_SPREADSHEET_INFO to find the sheet ID, or use sheet_name instead. Either sheet_id or sheet_name must be provided. |
| `dimension` | string ("ROWS" | "COLUMNS") | No | The dimension to delete (ROWS or COLUMNS). |
| `end_index` | integer | No | The zero-based end index of the range to delete, exclusive. Must be greater than start_index and at most equal to the sheet's current row/column count. Note: Cannot delete all rows or columns from a sheet - at least one row and one column must remain. |
| `sheet_name` | string | No | The name/title of the sheet from which to delete the dimension. Using sheet_name is recommended as it's more intuitive than sheet_id. Either sheet_id or sheet_name must be provided. |
| `start_index` | integer | No | The zero-based start index of the range to delete, inclusive. Must be less than end_index and within the sheet's current row/column count. Note: Cannot delete all rows or columns from a sheet - at least one row and one column must remain. |
| `spreadsheet_id` | string | Yes | The ID of the spreadsheet. |
| `response_ranges` | array | No | Limits the ranges of cells included in the response spreadsheet. |
| `delete_dimension_request` | object | No | The details for the delete dimension request object. |
| `response_include_grid_data` | boolean | No | True if grid data should be returned. This parameter is ignored if a field mask was set in the request. |
| `include_spreadsheet_in_response` | boolean | No | Determines if the update response should include the spreadsheet resource. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Sheet

**Slug:** `GOOGLESHEETS_DELETE_SHEET`

Tool to delete a sheet (worksheet) from a spreadsheet. Use when you need to remove a specific sheet from a Google Sheet document.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sheetId` | integer | Yes | The ID of the sheet to delete. Note: A spreadsheet must contain at least one sheet, so you cannot delete the last remaining sheet. If the sheet is of DATA_SOURCE type, the associated DataSource is also deleted. |
| `spreadsheetId` | string | Yes | The ID of the spreadsheet from which to delete the sheet. |
| `responseRanges` | array | No | Limits which ranges are returned when includeSpreadsheetInResponse is true. Only meaningful if includeSpreadsheetInResponse is set to true. Ranges should be in A1 notation (e.g., 'Sheet1!A1:B10'). |
| `responseIncludeGridData` | boolean | No | True if grid data should be returned in the response spreadsheet. Only meaningful when includeSpreadsheetInResponse is true and no field mask is set on the request. |
| `includeSpreadsheetInResponse` | boolean | No | Determines if the spreadsheet resource should be returned in the response. If true, the response includes the updated spreadsheet resource with all its sheets, properties, and metadata. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Execute SQL on Spreadsheet

**Slug:** `GOOGLESHEETS_EXECUTE_SQL`

DEPRECATED: Use direct Google Sheets actions instead: - GOOGLESHEETS_VALUES_GET / GOOGLESHEETS_BATCH_GET for reads - GOOGLESHEETS_VALUES_UPDATE / GOOGLESHEETS_UPDATE_VALUES_BATCH / GOOGLESHEETS_SPREADSHEETS_VALUES_APPEND for writes Execute SQL queries against Google Sheets tables. Supports SELECT, INSERT, UPDATE, DELETE operations and WITH clauses (CTEs) with familiar SQL syntax. Tables are automatically detected and mapped from the spreadsheet structure.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sql` | string | Yes | Complete SQL query to execute. Must begin with SELECT, INSERT, UPDATE, DELETE, or WITH. Supports Common Table Expressions (CTEs) using WITH clause for complex queries. Note: WITH clauses require the sqlglot library for full support; simple SELECT/INSERT/UPDATE/DELETE operations work without it. Use table names (sheet names) in FROM/INTO clauses, not A1 range notation. The query must include proper SQL clauses (e.g., SELECT columns FROM table, not just a column name or condition). Example: SELECT * FROM "Sheet1" WHERE A = 'value' (correct) instead of just A = 'value' (incorrect). |
| `dry_run` | boolean | No | Preview changes without applying them (for write operations) |
| `delete_method` | string ("clear" | "remove_rows") | No | For DELETE operations: 'clear' preserves row structure, 'remove_rows' shifts data up |
| `spreadsheet_id` | string | Yes | The unique alphanumeric ID of the Google Spreadsheet extracted from the URL. Format: A long string of letters, numbers, hyphens, and underscores (typically 44 characters). Find it in the URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit. Must be a valid ID - values like 'auto' are NOT valid and will fail. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Find and Replace in Spreadsheet

**Slug:** `GOOGLESHEETS_FIND_REPLACE`

Tool to find and replace text in a Google Spreadsheet. Use when you need to fix formula errors, update values, or perform bulk text replacements across cells. Common use cases: - Fix #ERROR! cells by replacing with empty string or correct formula - Update old values with new ones across multiple cells - Fix formula references or patterns - Clean up data formatting issues

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `find` | string | Yes | The text to find. Can be a literal string or a regular expression pattern. |
| `range` | string | No | A1 notation range string to search within (e.g., 'A1:B10', 'Sheet1!A1:B10'). When using A1 notation with a sheet name, you must also provide range_sheet_id to specify the numeric sheet ID (the API requires numeric IDs). Alternatively, use the GridRange parameters (range_sheet_id with optional row/column indices) for explicit numeric control. Mutually exclusive with sheet_id and all_sheets. |
| `replace` | string | Yes | The text to replace the found instances with. |
| `sheetId` | integer | No | The numeric ID of the sheet to search the entire sheet (e.g., 0 for the first sheet). Mutually exclusive with sheet_name, range/range_sheet_id parameters, and all_sheets. You must specify exactly one scope: either sheet_id (entire sheet), sheet_name, range/range_sheet_id (specific range), or all_sheets. |
| `allSheets` | boolean | No | Whether to search across all sheets in the spreadsheet. Mutually exclusive with sheet_id and range parameters. |
| `matchCase` | boolean | No | Whether the search should be case-sensitive. |
| `sheetName` | string | No | The name/title of the sheet (tab) to search within (e.g., 'Sheet1', 'Sales Data'). The sheet name will be resolved to its numeric sheet ID. Mutually exclusive with sheet_id, range/range_sheet_id parameters, and all_sheets. |
| `endRowIndex` | integer | No | The end row (0-indexed, exclusive) of the range. Only used when range_sheet_id is provided without a 'range' parameter. |
| `rangeSheetId` | integer | No | The numeric sheet ID for a GridRange-based search. Required when using the 'range' parameter with A1 notation. Can also be used alone or with row/column index parameters to define a specific range. Mutually exclusive with sheet_id and all_sheets. |
| `searchByRegex` | boolean | No | Whether to treat the find text as a regular expression. |
| `spreadsheetId` | string | Yes | The ID of the spreadsheet to update. |
| `startRowIndex` | integer | No | The start row (0-indexed, inclusive) of the range. Only used when range_sheet_id is provided without a 'range' parameter. |
| `endColumnIndex` | integer | No | The end column (0-indexed, exclusive) of the range. Column A = 0, B = 1, etc. Only used when range_sheet_id is provided without a 'range' parameter. |
| `includeFormulas` | boolean | No | Whether to include cells with formulas in the search. If true, formulas are searched and can be replaced. If false, only cell values (not formulas) are searched. If not specified, the default API behavior applies (both formulas and values are searched). |
| `matchEntireCell` | boolean | No | Whether to match only cells that contain the entire search term. |
| `startColumnIndex` | integer | No | The start column (0-indexed, inclusive) of the range. Column A = 0, B = 1, etc. Only used when range_sheet_id is provided without a 'range' parameter. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Find worksheet by title (Deprecated)

**Slug:** `GOOGLESHEETS_FIND_WORKSHEET_BY_TITLE`

DEPRECATED: Use GetSpreadsheetInfo instead. Finds a worksheet by its exact, case-sensitive title within a Google Spreadsheet; returns a boolean indicating if found and the matched worksheet's metadata when found, or None when not found.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet from the URL (e.g., https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit). Important: This is NOT the spreadsheet's display name/title. It is the long alphanumeric string (typically 40-45 characters) from the URL containing only letters, numbers, hyphens, and underscores. |
| `worksheet_title` | string | Yes | The exact, case-sensitive title of the worksheet (tab name) to find. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Format cell

**Slug:** `GOOGLESHEETS_FORMAT_CELL`

Applies text and background cell formatting to a specified range in a Google Sheets worksheet.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `red` | number | No | Red component of the background color (0.0-1.0). |
| `blue` | number | No | Blue component of the background color (0.0-1.0). |
| `bold` | boolean | No | Apply bold formatting. |
| `green` | number | No | Green component of the background color (0.0-1.0). |
| `range` | string | No | OPTION 1: Cell range in A1 notation (RECOMMENDED). Supports: single cells ('A1', 'F9'), cell ranges ('A1:B5'), entire columns ('A', 'I:J'), entire rows ('1', '1:5'). Also accepts sheet-prefixed ranges ('Sheet1!A1', 'Instagram Calendar!A1:E1') for convenience - if provided, the sheet prefix is stripped and ignored. The actual sheet used is determined by the sheet_name or worksheet_id parameter. Provide EITHER this field OR all four index fields below, not both. |
| `italic` | boolean | No | Apply italic formatting. |
| `font_size` | integer | No | Font size in points. |
| `text_link` | string | No | Cell-level text link URI. Must include a URI scheme, such as 'https://' or 'mailto:'. |
| `underline` | boolean | No | Apply underline formatting. |
| `sheet_name` | string | No | The worksheet name/title (e.g., 'Sheet1', 'Q3 Report'). Provide either this field OR worksheet_id, not both. If both are provided, sheet_name takes precedence and will be resolved to worksheet_id. |
| `text_color` | string | No | Text color as 6-digit hex. |
| `font_family` | string | No | Font family. |
| `padding_top` | integer | No | Top padding in pixels. |
| `border_color` | string | No | Border color as 6-digit hex. |
| `border_style` | string ("DOTTED" | "DASHED" | "SOLID" | "SOLID_MEDIUM" | "SOLID_THICK" | "NONE" | "DOUBLE") | No | Border styles supported by Google Sheets. |
| `padding_left` | integer | No | Left padding in pixels. |
| `worksheet_id` | integer | No | The worksheet identifier. Accepts EITHER: (1) The sheetId from the Google Sheets API (a large number like 1534097477, obtainable via GOOGLESHEETS_GET_SPREADSHEET_INFO), OR (2) The 0-based positional index of the worksheet (0 for first sheet, 1 for second, etc.). The action will first try to match by sheetId, then fall back to matching by index. Defaults to 0 (first sheet). Provide either this field OR sheet_name, not both. |
| `end_row_index` | integer | No | OPTION 2: 0-based index of the row AFTER the last row (exclusive). Required if 'range' is not provided. Must provide ALL four index fields together. |
| `padding_right` | integer | No | Right padding in pixels. |
| `strikethrough` | boolean | No | Apply strikethrough formatting. |
| `wrap_strategy` | string ("OVERFLOW_CELL" | "LEGACY_WRAP" | "CLIP" | "WRAP") | No | How text wraps within cells. |
| `padding_bottom` | integer | No | Bottom padding in pixels. |
| `spreadsheet_id` | string | Yes | Identifier of the Google Sheets spreadsheet. |
| `text_direction` | string ("LEFT_TO_RIGHT" | "RIGHT_TO_LEFT") | No | Text direction in a cell. |
| `start_row_index` | integer | No | OPTION 2: 0-based row index (row 1 = index 0, row 9 = index 8). Required if 'range' is not provided. Must provide ALL four index fields together. |
| `background_alpha` | number | No | Background alpha from 0.0 to 1.0. |
| `background_color` | string | No | Background color as 6-digit hex. |
| `end_column_index` | integer | No | OPTION 2: 0-based index of the column AFTER the last column (exclusive). Required if 'range' is not provided. Must provide ALL four index fields together. |
| `number_format_type` | string ("TEXT" | "NUMBER" | "PERCENT" | "CURRENCY" | "DATE" | "TIME" | "DATE_TIME" | "SCIENTIFIC") | No | How number values should be represented to the user. |
| `start_column_index` | integer | No | OPTION 2: 0-based column index (A = 0, B = 1, F = 5). Required if 'range' is not provided. Must provide ALL four index fields together. |
| `vertical_alignment` | string ("TOP" | "MIDDLE" | "BOTTOM") | No | Vertical alignment of text in a cell. |
| `text_rotation_angle` | integer | No | Text rotation angle from -90 to 90. |
| `horizontal_alignment` | string ("LEFT" | "CENTER" | "RIGHT") | No | Horizontal alignment of text in a cell. |
| `number_format_pattern` | string | No | Optional number/date pattern. |
| `hyperlink_display_type` | string ("LINKED" | "PLAIN_TEXT") | No | How a hyperlink should be displayed in a cell. |
| `text_rotation_vertical` | boolean | No | Make text read top to bottom. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Batch Get Spreadsheet Values (Deprecated)

**Slug:** `GOOGLESHEETS_GET_BATCH_VALUES`

DEPRECATED: Use GOOGLESHEETS_BATCH_GET instead. Tool to return one or more ranges of values from a spreadsheet. Use when you need to retrieve data from multiple ranges in a single request.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ranges` | array | Yes | The A1 notation or R1C1 notation of the ranges to retrieve values from. Specify one or more ranges (e.g., ['Sheet1!A1:B10', 'Sheet2!C1:D5']). For sheet names with spaces or special characters, wrap in single quotes (e.g., "'My Sheet'!A1:B10"). |
| `spreadsheet_id` | string | Yes | The ID of the spreadsheet to retrieve data from. This is the unique identifier found in the spreadsheet URL between '/d/' and '/edit' (e.g., '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'). |
| `major_dimension` | string ("DIMENSION_UNSPECIFIED" | "ROWS" | "COLUMNS") | No | The major dimension for results. |
| `value_render_option` | string ("FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA") | No | How values should be rendered in the output. |
| `date_time_render_option` | string ("SERIAL_NUMBER" | "FORMATTED_STRING") | No | How dates, times, and durations should be represented in the output. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get conditional format rules

**Slug:** `GOOGLESHEETS_GET_CONDITIONAL_FORMAT_RULES`

List conditional formatting rules for each sheet (or a selected sheet) in a normalized, easy-to-edit form. Use when you need to view, audit, or prepare to modify conditional format rules.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sheet_id` | integer | No | Optional filter: return rules only for the sheet with this exact numeric sheetId. If not provided, returns rules for all sheets. If both sheet_title and sheet_id are provided, sheet_id takes precedence. |
| `sheet_title` | string | No | Optional filter: return rules only for the sheet with this exact title. If not provided, returns rules for all sheets. |
| `spreadsheet_id` | string | Yes | Unique identifier of the Google Spreadsheet, typically found in its URL. |
| `exclude_tables_in_banded_ranges` | boolean | No | True if tables should be excluded in the banded ranges. False if not set. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Data Validation Rules

**Slug:** `GOOGLESHEETS_GET_DATA_VALIDATION_RULES`

Tool to extract data validation rules from a Google Sheets spreadsheet. Use when you need to understand dropdown lists, allowed values, custom formulas, or other validation constraints for cells.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ranges` | array | No | Optional list of A1 ranges to scan. If omitted, the entire sheet(s) will be scanned. WARNING: Scanning entire large sheets may be slow. |
| `sheetId` | integer | No | Optional sheet ID to filter by. If omitted, all sheets will be scanned. |
| `sheetTitle` | string | No | Optional sheet title to filter by. If omitted, all sheets will be scanned. |
| `includeEmpty` | boolean | No | If true, include cells without validation rules in the output. Default is false. |
| `spreadsheetId` | string | Yes | The ID of the spreadsheet to request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get sheet names

**Slug:** `GOOGLESHEETS_GET_SHEET_NAMES`

Lists all worksheet names from a specified Google Spreadsheet (which must exist), useful for discovering sheets before further operations.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `exclude_hidden` | boolean | No | When True, hidden sheets will be excluded from the results. When False (default), all sheets including hidden ones are returned. Hidden sheets are sheets that have been hidden via the 'Hide sheet' option in Google Sheets UI. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet (alphanumeric string, typically 44 characters). Extract only the ID portion from URLs - do not include leading/trailing slashes, '/edit' suffixes, query parameters, or URL fragments. From 'https://docs.google.com/spreadsheets/d/1qpyC0XzvTcKT6EISywY/edit#gid=0', use only '1qpyC0XzvTcKT6EISywY'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Spreadsheet by Data Filter

**Slug:** `GOOGLESHEETS_GET_SPREADSHEET_BY_DATA_FILTER`

Returns the spreadsheet at the given ID, filtered by the specified data filters. Use this tool when you need to retrieve specific subsets of data from a Google Sheet based on criteria like A1 notation, developer metadata, or grid ranges. Important: This action is designed for filtered data retrieval. While it accepts empty filters and returns full metadata in that case, GOOGLESHEETS_GET_SPREADSHEET_INFO is the recommended action for unfiltered spreadsheet retrieval.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dataFilters` | array | No | The DataFilters used to select which ranges to retrieve. Supports A1 notation (e.g., 'Sheet1!A1:B2'), developer metadata lookup, or grid range filters. If empty or omitted, returns full spreadsheet metadata. Recommended: Use GOOGLESHEETS_GET_SPREADSHEET_INFO for unfiltered retrieval as it is the dedicated action for that purpose. |
| `spreadsheetId` | string | Yes | The ID of the spreadsheet to request. |
| `includeGridData` | boolean | No | True if grid data should be returned. Ignored if a field mask is set. |
| `excludeTablesInBandedRanges` | boolean | No | True if tables should be excluded in the banded ranges. False if not set. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get spreadsheet info

**Slug:** `GOOGLESHEETS_GET_SPREADSHEET_INFO`

Retrieves metadata for a Google Spreadsheet using its ID. By default, returns essential information (ID, title, sheet properties) to avoid payload size issues. Use the fields parameter for comprehensive metadata or specific fields.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | string | No | Optional. Field mask specifying which fields to return. Uses Google's field mask syntax (comma-separated, dot-notation for nested fields). If not specified, a default mask returning common fields (spreadsheet ID, title, sheet properties) is applied to avoid payload size issues. For full metadata, use '*' (not recommended for large spreadsheets). When set, includeGridData is ignored. Examples: 'sheets.properties(sheetId,title)', 'properties.title,sheets.properties.sheetId'. |
| `ranges` | array | No | Optional. The ranges to retrieve from the spreadsheet, specified using A1 notation (e.g., 'Sheet1!A1:D5', 'Sheet2!A1:C4'). Multiple ranges can be requested simultaneously. If not specified, metadata for the entire spreadsheet is returned without grid data. |
| `spreadsheet_id` | string | No | Required. The Google Sheets spreadsheet ID or full URL. Accepts either the ID alone (e.g., '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms') or a full Google Sheets URL (e.g., 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit'). The ID will be automatically extracted from URLs. Note: Published/embedded URLs (containing '/d/e/2PACX-...') are not supported. |
| `include_grid_data` | boolean | No | Optional. If true, grid data will be returned. This parameter is ignored if a field mask was set in the request. When false or not specified, only metadata is returned without cell values. |
| `exclude_tables_in_banded_ranges` | boolean | No | Optional. If true, tables within banded ranges will be omitted from the response. Default is false when not specified. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Table Schema

**Slug:** `GOOGLESHEETS_GET_TABLE_SCHEMA`

DEPRECATED: Use GOOGLESHEETS_GET_SHEET_NAMES and GOOGLESHEETS_GET_SPREADSHEET_INFO for sheet structure metadata, and GOOGLESHEETS_VALUES_GET for direct range inspection. This action is used to get the schema of a table in a Google Spreadsheet, call this action to get the schema of a table in a spreadsheet BEFORE YOU QUERY THE TABLE. Analyze table structure and infer column names, types, and constraints. Uses statistical analysis of sample data to determine the most likely data type for each column. Call this action after calling the LIST_TABLES action to get the schema of a table in a spreadsheet.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sheet_name` | string | No | Sheet/tab name if table_name is ambiguous across multiple sheets |
| `table_name` | string | Yes | Table name from LIST_TABLES response OR the visible Google Sheets tab name (e.g., 'Sales Data', 'Projections'). Use 'auto' to analyze the largest/most prominent table. |
| `sample_size` | integer | No | Number of rows to sample for type inference |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet. Must be a valid Google Sheets ID (typically a 44-character alphanumeric string). Do NOT use 'auto' - only 'table_name' supports auto-detection. You can get this ID from the spreadsheet URL or from SEARCH_SPREADSHEETS action. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Insert Dimension in Google Sheet

**Slug:** `GOOGLESHEETS_INSERT_DIMENSION`

Tool to insert new rows or columns into a sheet at a specified location. Use when you need to add empty rows or columns within an existing Google Sheet.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `spreadsheet_id` | string | Yes | The ID of the spreadsheet to update. |
| `response_ranges` | array | No | Limits the ranges of the spreadsheet to include in the response. |
| `insert_dimension` | object | Yes | The details for the insert dimension request. |
| `response_include_grid_data` | boolean | No | True if grid data should be included in the response (if includeSpreadsheetInResponse is true). |
| `include_spreadsheet_in_response` | boolean | No | True if the updated spreadsheet should be included in the response. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Charts in Google Sheets

**Slug:** `GOOGLESHEETS_LIST_CHARTS`

Lists all charts in a Google Sheets spreadsheet across all sheets, returning chart_id, sheet metadata, chart type, title, and position. Use this action when you need to discover what charts exist in a spreadsheet, retrieve chart IDs for update or delete operations, or inspect chart configurations. The default field mask in GOOGLESHEETS_GET_SPREADSHEET_INFO omits chart data, making this dedicated action necessary for chart discovery.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chart_id` | integer | No | Optional. Filter to a specific chart by its numeric chart ID. When provided, returns only the matching chart if it exists in the spreadsheet. |
| `sheet_id` | integer | No | Optional. Filter results to a single sheet's charts by providing the numeric sheet ID (not the sheet name). When omitted, returns charts from all sheets in the spreadsheet. |
| `include_spec` | boolean | No | When true, include the full ChartSpec dictionary for each chart (contains all chart configuration details including series, axes, colors, etc.). When false (default), return only a compact summary with chart_id, type, title, and position. Set to false to keep responses small. |
| `spreadsheet_id` | string | Yes | Required. The Google Sheets spreadsheet ID or full URL. Accepts either the ID alone (e.g., '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms') or a full Google Sheets URL (e.g., 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit'). The ID will be automatically extracted from URLs. Note: Published/embedded URLs (containing '/d/e/2PACX-...') are not supported. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Tables in Spreadsheet

**Slug:** `GOOGLESHEETS_LIST_TABLES`

DEPRECATED: Use GOOGLESHEETS_GET_SHEET_NAMES for tab discovery and GOOGLESHEETS_GET_SPREADSHEET_INFO for full sheet metadata. This action is used to list all tables in a Google Spreadsheet, call this action to get the list of tables in a spreadsheet. Discover all tables in a Google Spreadsheet by analyzing sheet structure and detecting data patterns. Uses heuristic analysis to find header rows, data boundaries, and table structures.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `min_rows` | integer | No | Minimum number of data rows to consider a valid table |
| `min_columns` | integer | No | Minimum number of columns to consider a valid table |
| `min_confidence` | number | No | Minimum confidence score (0.0-1.0) to consider a valid table |
| `spreadsheet_id` | string | Yes | The actual Google Spreadsheet ID (not a placeholder or spreadsheet name). Find it in the spreadsheet URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit. It is the alphanumeric string between '/d/' and '/edit' (e.g., '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'). IMPORTANT: Do NOT pass the spreadsheet name - only pass the alphanumeric ID from the URL. Do NOT pass template placeholders like '{{spreadsheet_id}}', '<spreadsheet_id>', or 'your-spreadsheet-id-here'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Look up spreadsheet row

**Slug:** `GOOGLESHEETS_LOOKUP_SPREADSHEET_ROW`

Finds the first row in a Google Spreadsheet where a cell's entire content exactly matches the query string, searching within a specified A1 notation range or the first sheet by default.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Exact text value to find; matches the entire content of a cell in a row. |
| `range` | string | No | A1 notation range to search within. Supports cell ranges (e.g., 'Sheet1!A1:D5'), column-only ranges (e.g., 'Sheet1!A:Z'), and row-only ranges (e.g., 'Sheet1!1:1'). Defaults to the first sheet if omitted. IMPORTANT: Sheet names with spaces must be single-quoted (e.g., "'My Sheet'!A1:Z"). Bare sheet names without ranges (e.g., 'Sheet1') are not supported - always specify a range. |
| `case_sensitive` | boolean | No | If `True`, the query string search is case-sensitive. |
| `spreadsheet_id` | string | Yes | Identifier of the Google Spreadsheet to search. |
| `value_render_option` | string ("FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA") | No | How cell values are rendered in the returned row data. unformatted: raw values without display formatting — dates appear as serial numbers, e.g. 46009.47 (default, keeps consistency with UPSERT). formatted: display-formatted values — dates appear as strings, e.g. '2025-12-18'. formula: raw formulas instead of computed values. |
| `normalize_whitespace` | boolean | No | If `True`, strips leading and trailing whitespace from cell values before matching. This helps match cells like ' TOTAL ' or 'TOTAL ' when searching for 'TOTAL'. |
| `date_time_render_option` | string | No | How dates and times are represented. FORMATTED_STRING: human-readable strings (e.g. '2025-12-18 11:17'). SERIAL_NUMBER: Excel-style serial numbers. Works with all value_render_option settings. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Move or Resize Chart in Google Sheets

**Slug:** `GOOGLESHEETS_MOVE_CHART`

Move or resize an existing chart on a Google Sheets spreadsheet. Use this action when you need to reposition a chart to a different location on the same or different sheet, move it to a brand-new sheet, or change its size. This action wraps the updateEmbeddedObjectPosition batchUpdate request type and supports three positioning modes: moving to a new sheet, moving to an existing sheet, or repositioning via pixel-perfect overlay coordinates.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chart_id` | integer | Yes | The unique numeric identifier of the chart to move within the spreadsheet. This is the chartId value (also known as objectId) returned when the chart was created or can be retrieved using GOOGLESHEETS_LIST_CHARTS or 'Get Spreadsheet Info' action (look for sheets[].charts[].chartId in the response). The chart must already exist in the specified spreadsheet. |
| `new_sheet` | boolean | No | Set to true to move the chart to a brand-new sheet. Google Sheets will automatically create and name the new sheet. This is mutually exclusive with target_sheet_id and anchor_sheet_id. |
| `width_pixels` | integer | No | Width of the chart in pixels. Only valid when anchor_sheet_id is provided. If omitted, Google Sheets preserves the existing width. |
| `height_pixels` | integer | No | Height of the chart in pixels. Only valid when anchor_sheet_id is provided. If omitted, Google Sheets preserves the existing height. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Sheets spreadsheet containing the chart to move. Must be the actual spreadsheet ID from the URL (e.g., '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'), NOT the spreadsheet name or title. Find it in the URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit |
| `anchor_sheet_id` | integer | No | The numeric sheetId of the sheet to anchor the chart onto when repositioning via overlay coordinates. Required if any of anchor_row_index, anchor_column_index, offset_x_pixels, offset_y_pixels, width_pixels, or height_pixels is provided. This is mutually exclusive with new_sheet and target_sheet_id. |
| `offset_x_pixels` | integer | No | Horizontal pixel offset from the anchor cell. Only valid when anchor_sheet_id is provided. If omitted, Google Sheets preserves the existing horizontal offset. |
| `offset_y_pixels` | integer | No | Vertical pixel offset from the anchor cell. Only valid when anchor_sheet_id is provided. If omitted, Google Sheets preserves the existing vertical offset. |
| `target_sheet_id` | integer | No | The numeric sheetId of an existing sheet to move the chart to. The chart's anchor position on that sheet will remain unchanged. This is mutually exclusive with new_sheet and anchor_sheet_id. Use 'Get Spreadsheet Info' to retrieve valid sheetIds. |
| `anchor_row_index` | integer | No | The 0-based row index of the anchor cell for overlay positioning. Required if anchor_sheet_id is set. Must be used together with anchor_column_index. |
| `anchor_column_index` | integer | No | The 0-based column index of the anchor cell for overlay positioning. Required if anchor_sheet_id is set. Must be used together with anchor_row_index. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Mutate conditional format rules

**Slug:** `GOOGLESHEETS_MUTATE_CONDITIONAL_FORMAT_RULES`

Add, update, delete, or reorder conditional format rules on a Google Sheet. Use when you need to create, modify, or remove conditional formatting without manually building batchUpdate requests. Supports four operations: ADD (create new rule), UPDATE (replace existing rule), DELETE (remove rule), MOVE (reorder rules by changing index).

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rule` | object | No | Conditional format rule specification. |
| `index` | integer | No | Zero-based index for the operation. Required for UPDATE, DELETE, MOVE. Optional for ADD (defaults to end of list). |
| `sheet_id` | integer | Yes | The unique numeric identifier of the sheet/tab to modify (NOT a zero-based index). This is a specific ID assigned by Google Sheets when the sheet is created, not the position of the sheet. You MUST first call GOOGLESHEETS_GET_SPREADSHEET_INFO to retrieve the actual sheetId values from the 'sheets' array in the response. Common mistake: Do not assume sheet_id=0 exists - while some spreadsheets may have a sheet with ID 0, many do not. |
| `new_index` | integer | No | Destination index for MOVE operation. Required when operation is MOVE. |
| `operation` | string ("ADD" | "UPDATE" | "DELETE" | "MOVE") | Yes | Operation type: ADD (add new rule), UPDATE (replace rule), DELETE (remove rule), MOVE (change rule order/index). |
| `spreadsheet_id` | string | Yes | The ID of the spreadsheet containing the sheet to modify. Found in the Google Sheets URL between '/d/' and '/edit'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Query Spreadsheet Table

**Slug:** `GOOGLESHEETS_QUERY_TABLE`

DEPRECATED: Use GOOGLESHEETS_VALUES_GET / GOOGLESHEETS_BATCH_GET for table reads and GOOGLESHEETS_LOOKUP_SPREADSHEET_ROW for row lookup/filter workflows. Execute SQL-like SELECT queries against Google Spreadsheet tables. Table names correspond to sheet/tab names visible at the bottom of the spreadsheet. Use GOOGLESHEETS_LIST_TABLES first to discover available table names if unknown. Supports WHERE conditions, ORDER BY, LIMIT clauses.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sql` | string | Yes | SQL SELECT query. The table name is the Google Sheets tab/sheet name (visible at the bottom of the spreadsheet). Use GOOGLESHEETS_LIST_TABLES to discover available table names if unknown. Supported: SELECT cols FROM table WHERE conditions ORDER BY col LIMIT n. Table names must be quoted with double quotes if they contain spaces or are numeric-only (e.g., SELECT * FROM "My Sheet" or SELECT * FROM "415"). |
| `spreadsheet_id` | string | Yes | The unique identifier of a native Google Sheets file. Found in the spreadsheet URL after /d/ (e.g., '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'). Only native Google Sheets files (MIME type: application/vnd.google-apps.spreadsheet) are supported. Files uploaded to Google Drive that are not native Google Sheets (such as Excel .xlsx files, PDFs, or Google Docs) will not work even if they can be viewed in Google Sheets. |
| `include_formulas` | boolean | No | Whether to return formula text instead of calculated values for formula columns |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Search Developer Metadata

**Slug:** `GOOGLESHEETS_SEARCH_DEVELOPER_METADATA`

Tool to search for developer metadata in a spreadsheet. Use when you need to find specific metadata entries based on filters.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dataFilters` | array | Yes | The data filters describing the criteria used to determine which DeveloperMetadata entries to return. |
| `spreadsheetId` | string | Yes | The ID of the spreadsheet to retrieve metadata from. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Search Spreadsheets

**Slug:** `GOOGLESHEETS_SEARCH_SPREADSHEETS`

Search for Google Spreadsheets using various filters including name, content, date ranges, and more.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | No | Search query to filter spreadsheets. Behavior depends on the 'search_type' parameter. For advanced searches, use Google Drive query syntax with fields like 'name contains', 'fullText contains', or boolean filters like 'sharedWithMe = true'. DO NOT use spreadsheet IDs as search terms. Leave empty to get all spreadsheets. |
| `order_by` | string | No | Sort order (comma-separated list for multi-field sorting). Valid fields: createdTime, folder, modifiedByMeTime, modifiedTime, name, name_natural, quotaBytesUsed, recency, sharedWithMeTime, starred, viewedByMeTime. Append ' desc' for descending order (default is ascending). Examples: 'modifiedTime desc', 'folder,name', 'starred,modifiedTime desc'. |
| `page_token` | string | No | Token for retrieving the next page of results. Use the 'next_page_token' value from a previous response to get subsequent pages. Leave empty to get the first page. |
| `max_results` | integer | No | Maximum number of spreadsheets to return (1-1000). Defaults to 10. |
| `search_type` | string ("name" | "content" | "both") | No | How to search: 'name' searches filenames only (prefix matching from the START of filenames), 'content' uses fullText search which searches file content, name, description, and metadata (Google Drive API limitation: cannot search content exclusively without also matching filenames), 'both' explicitly searches both name OR content with an OR condition. Note: 'name' search only matches from the START of filenames (e.g., 'Budget' finds 'Budget 2024' but NOT 'Q1 Budget'). |
| `starred_only` | boolean | No | Whether to return only starred spreadsheets. Defaults to False. |
| `created_after` | string | No | Return spreadsheets created after this date. Use RFC 3339 format like '2024-01-01T00:00:00Z'. |
| `modified_after` | string | No | Return spreadsheets modified after this date. Use RFC 3339 format like '2024-01-01T00:00:00Z'. |
| `shared_with_me` | boolean | No | Whether to return only spreadsheets shared with the current user. Defaults to False. |
| `include_trashed` | boolean | No | Whether to include spreadsheets in trash. Defaults to False. |
| `include_shared_drives` | boolean | No | Whether to include spreadsheets from shared drives you have access to. Defaults to True. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Set Basic Filter

**Slug:** `GOOGLESHEETS_SET_BASIC_FILTER`

Tool to set a basic filter on a sheet in a Google Spreadsheet. Use when you need to filter or sort data within a specific range on a sheet.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | object | Yes | The filter to set. |
| `spreadsheetId` | string | Yes | The ID of the spreadsheet. |
| `responseRanges` | array | No | Limits the ranges included in the response spreadsheet. Meaningful only if includeSpreadsheetInResponse is true. |
| `responseIncludeGridData` | boolean | No | True if grid data should be returned. Meaningful only if includeSpreadsheetInResponse is true. Ignored if a field mask was set in the request. |
| `includeSpreadsheetInResponse` | boolean | No | Determines if the updated spreadsheet resource appears in the response. Default is false. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Set Data Validation Rule

**Slug:** `GOOGLESHEETS_SET_DATA_VALIDATION_RULE`

Tool to set or clear data validation rules (including dropdowns) on a range in Google Sheets. Use when you need to apply dropdown lists, range-based dropdowns, or custom formula validation to cells.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mode` | string ("SET" | "CLEAR") | Yes | Operation mode: 'SET' applies a validation rule to the range, 'CLEAR' removes any existing validation from the range. |
| `strict` | boolean | No | Whether to reject invalid data (true) or show a warning (false). Default is true. |
| `values` | array | No | List of allowed values for dropdown. Required when validation_type='ONE_OF_LIST'. Each item becomes a dropdown option. |
| `formula` | string | No | Custom formula for validation. Required when validation_type='CUSTOM_FORMULA'. Formula should evaluate to TRUE/FALSE. Example: '=A1>10'. |
| `sheet_id` | integer | Yes | The unique sheet ID (numeric identifier) where the validation rule will be applied. The first sheet created in a spreadsheet typically has ID 0, while additional sheets get unique IDs (e.g., 1534097477). If a sheet is deleted, its ID is never reused - so if the original first sheet (ID 0) was deleted, attempting to use 0 will fail. Always verify the actual sheet ID exists using GOOGLESHEETS_GET_SPREADSHEET_INFO action (check 'sheets[].properties.sheetId' field). |
| `end_row_index` | integer | Yes | Ending row index (0-based, exclusive) for the validation range. To apply to row 1 only, use start_row_index=0 and end_row_index=1. |
| `input_message` | string | No | Optional message shown to the user when they select the cell. Helpful hint about what values are expected. |
| `show_custom_ui` | boolean | No | Whether to show a dropdown UI for list-based validation. Default is true. Set to true for dropdown lists. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Sheets spreadsheet. Can be found in the spreadsheet URL between '/d/' and '/edit'. |
| `source_range_a1` | string | No | Source range in A1 notation for dropdown values. Required when validation_type='ONE_OF_RANGE'. Example: 'Sheet1!A1:A10' or 'A1:A10'. |
| `start_row_index` | integer | Yes | Starting row index (0-based, inclusive) for the validation range. Row 1 is index 0. |
| `validation_type` | string ("ONE_OF_LIST" | "ONE_OF_RANGE" | "CUSTOM_FORMULA" | "NUMBER_GREATER" | "NUMBER_GREATER_THAN_EQ" | "NUMBER_LESS" | "NUMBER_LESS_THAN_EQ" | "NUMBER_EQ" | "NUMBER_NOT_EQ" | "NUMBER_BETWEEN" | "NUMBER_NOT_BETWEEN" | "TEXT_CONTAINS" | "TEXT_NOT_CONTAINS" | "TEXT_EQ" | "TEXT_NOT_EQ" | "TEXT_IS_EMAIL" | "TEXT_IS_URL" | "DATE_EQ" | "DATE_BEFORE" | "DATE_AFTER" | "DATE_ON_OR_BEFORE" | "DATE_ON_OR_AFTER" | "DATE_BETWEEN" | "DATE_NOT_BETWEEN" | "DATE_NOT_EQ" | "DATE_IS_VALID" | "BLANK" | "NOT_BLANK" | "BOOLEAN") | No | Type of validation rule to apply. Required when mode='SET'. Dropdown types: 'ONE_OF_LIST' (dropdown from list), 'ONE_OF_RANGE' (dropdown from range). Number validations: 'NUMBER_GREATER', 'NUMBER_GREATER_THAN_EQ', 'NUMBER_LESS', 'NUMBER_LESS_THAN_EQ', 'NUMBER_EQ', 'NUMBER_NOT_EQ', 'NUMBER_BETWEEN', 'NUMBER_NOT_BETWEEN'. Text validations: 'TEXT_CONTAINS', 'TEXT_NOT_CONTAINS', 'TEXT_EQ', 'TEXT_NOT_EQ', 'TEXT_IS_EMAIL', 'TEXT_IS_URL' (Note: TEXT_STARTS_WITH and TEXT_ENDS_WITH are only for conditional formatting, not data validation). Date validations: 'DATE_EQ', 'DATE_BEFORE', 'DATE_AFTER', 'DATE_ON_OR_BEFORE', 'DATE_ON_OR_AFTER', 'DATE_BETWEEN', 'DATE_NOT_BETWEEN', 'DATE_NOT_EQ', 'DATE_IS_VALID'. Other: 'BLANK', 'NOT_BLANK', 'BOOLEAN', 'CUSTOM_FORMULA'. |
| `condition_values` | array | No | Generic list of condition values for validation types that require specific values (e.g., NUMBER_GREATER requires one value, NUMBER_BETWEEN requires two values, TEXT_CONTAINS requires one value). For simple validations like TEXT_IS_EMAIL, BLANK, NOT_BLANK, BOOLEAN, DATE_IS_VALID, this can be omitted. Each value should be a string that will be parsed by Google Sheets. |
| `end_column_index` | integer | Yes | Ending column index (0-based, exclusive) for the validation range. To apply to column A only, use start_column_index=0 and end_column_index=1. |
| `start_column_index` | integer | Yes | Starting column index (0-based, inclusive) for the validation range. Column A is index 0. |
| `filtered_rows_included` | boolean | No | Whether to apply validation to rows hidden by filters. Default is false. Set to true to ensure validation applies to both visible and filtered rows. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create sheet from JSON

**Slug:** `GOOGLESHEETS_SHEET_FROM_JSON`

DEPRECATED: Use GOOGLESHEETS_CREATE_GOOGLE_SHEET1 + GOOGLESHEETS_UPDATE_VALUES_BATCH (or GOOGLESHEETS_VALUES_UPDATE / GOOGLESHEETS_SPREADSHEETS_VALUES_APPEND) instead. Creates a new Google Spreadsheet and populates its first worksheet from `sheet_json`. When data is provided, the first item's keys establish the headers. An empty list creates an empty worksheet.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | The desired title for the new Google Spreadsheet. |
| `sheet_json` | array | Yes | A list of dictionaries representing the rows of the sheet. Each dictionary must have the same set of keys, which will form the header row. Values can be strings, numbers, booleans, or null (represented as empty cells). An empty list [] is allowed and will create a spreadsheet with an empty worksheet. |
| `sheet_name` | string | Yes | The name for the first worksheet within the newly created spreadsheet. This name will appear as a tab at the bottom of the sheet. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Sort Range

**Slug:** `GOOGLESHEETS_SORT_RANGE`

Sorts data within a specified range in a Google Sheet based on one or more sort criteria. Use this action when you need to reorder rows in a range by column values, with support for multi-level (cascading) sorts.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `range` | object | Yes | The range to sort. All cells in this range will be reordered based on the sort specifications. |
| `sortSpecs` | array | Yes | The sort order per column. Later specifications are used when values are equal in the earlier specifications (cascading sort). At least one sort specification is required. |
| `responseRanges` | array | No | Limits the ranges included in the response spreadsheet. Meaningful only if includeSpreadsheetInResponse is true. |
| `spreadsheet_id` | string | Yes | The ID of the spreadsheet. |
| `responseIncludeGridData` | boolean | No | True if grid data should be returned. Meaningful only if includeSpreadsheetInResponse is true. |
| `includeSpreadsheetInResponse` | boolean | No | Determines if the updated spreadsheet resource appears in the response. Default is false. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Copy Sheet to Another Spreadsheet

**Slug:** `GOOGLESHEETS_SPREADSHEETS_SHEETS_COPY_TO`

Tool to copy a single sheet from a spreadsheet to another spreadsheet. Use when you need to duplicate a sheet into a different spreadsheet.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sheet_id` | integer | Yes | The ID of the sheet to copy. |
| `spreadsheet_id` | string | Yes | The ID of the spreadsheet containing the sheet to copy. |
| `destination_spreadsheet_id` | string | Yes | The ID of the spreadsheet to copy the sheet to. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Append Values to Spreadsheet

**Slug:** `GOOGLESHEETS_SPREADSHEETS_VALUES_APPEND`

Tool to append values to a spreadsheet. Use when you need to add new data to the end of an existing table in a Google Sheet.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `range` | string | Yes | A1 notation range used to locate a logical table. New rows are appended after the last row of that table within this range. First call GOOGLESHEETS_GET_SHEET_NAMES with this exact spreadsheet_id and use one of the returned sheet names; sheet names are case-sensitive and default names like 'Sheet1' are unsafe guesses. Valid formats: exact sheet name only (e.g., 'Sales Data'), sheet-qualified column range (e.g., 'Sales Data!A:D'), or sheet-qualified cell range (e.g., 'Sales Data!A1:D100'). Do not pass bare ranges like 'A:F' or 'A1:D100' because they omit the sheet name. If the needed sheet is not returned, create it or ask the user instead of inventing a name. Sheet names with spaces need single quotes (auto-added). IMPORTANT: The append may land in different columns than specified due to API table detection. For strict column placement, use GOOGLESHEETS_SPREADSHEETS_VALUES_UPDATE instead. Always check updates.updatedRange in the response to verify where data was actually written. |
| `values` | array | Yes | 2D array of values to append. Typically, each inner list is a ROW (majorDimension=ROWS). Use null/None for empty cells. |
| `spreadsheetId` | string | Yes | The spreadsheet ID (typically 44 characters containing letters, numbers, hyphens, and underscores). Found in the URL between /d/ and /edit. NOT the sheet name (tab name) - that belongs in the 'range' parameter. |
| `majorDimension` | string ("ROWS" | "COLUMNS") | No | How to interpret the 2D values array. Use ROWS for row-wise data (most common for appends). Use COLUMNS for column-wise data. Example: if A1=1,B1=2,A2=3,B2=4 then majorDimension=ROWS yields [[1,2],[3,4]] and majorDimension=COLUMNS yields [[1,3],[2,4]]. |
| `insertDataOption` | string ("OVERWRITE" | "INSERT_ROWS") | No | How the input data should be inserted. |
| `valueInputOption` | string ("RAW" | "USER_ENTERED") | Yes | How the input data should be interpreted. |
| `includeValuesInResponse` | boolean | No | Determines if the update response should include the values of the cells that were appended. By default, responses do not include the updated values. |
| `responseValueRenderOption` | string ("FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA") | No | Determines how values in the response should be rendered. The default render option is FORMATTED_VALUE. |
| `responseDateTimeRenderOption` | string ("SERIAL_NUMBER" | "FORMATTED_STRING") | No | Determines how dates, times, and durations in the response should be rendered. This is ignored if responseValueRenderOption is FORMATTED_VALUE. The default dateTime render option is SERIAL_NUMBER. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Batch Clear Spreadsheet Values

**Slug:** `GOOGLESHEETS_SPREADSHEETS_VALUES_BATCH_CLEAR`

Tool to clear one or more ranges of values from a spreadsheet. Use when you need to remove data from specific cells or ranges while keeping formatting and other properties intact.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ranges` | array | Yes | The ranges to clear, in A1 notation (e.g., 'Sheet1!A1:B2') or R1C1 notation. Each range should be a clean string without surrounding brackets or extra quotes. Valid examples: 'Sheet1!A1:B2', 'A1:Z100', 'Sheet1'. Invalid examples: "['Sheet1!A1:B2']", '[Sheet1!A1]'. |
| `spreadsheet_id` | string | Yes | The ID of the spreadsheet to update. Can be either a spreadsheet ID or a full Google Sheets URL (the ID will be extracted automatically). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Batch Get Spreadsheet Values by Data Filter

**Slug:** `GOOGLESHEETS_SPREADSHEETS_VALUES_BATCH_GET_BY_DATA_FILTER`

Tool to return one or more ranges of values from a spreadsheet that match the specified data filters. Use when you need to retrieve specific data sets based on filtering criteria rather than entire sheets or fixed ranges.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dataFilters` | array | Yes | Required. An array of data filter objects used to match ranges of values to retrieve. Each filter can specify either 'a1Range' (e.g., 'Sheet1!A1:B5') or 'gridRange'. Must be provided as a list, e.g., [{'a1Range': 'Sheet1!A1:B5'}]. A single filter object will be automatically wrapped in a list. |
| `spreadsheetId` | string | Yes | The ID of the spreadsheet to retrieve data from. This is the unique identifier found in the spreadsheet URL (e.g., in 'https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit', the ID is the SPREADSHEET_ID part). Typical Google Sheets IDs are approximately 44 characters long and contain alphanumeric characters, hyphens, and underscores. |
| `majorDimension` | string ("ROWS" | "COLUMNS") | No | The major dimension that results should use. For example, if the spreadsheet data is: A1=1,B1=2,A2=3,B2=4, then a request that selects that range and sets majorDimension=ROWS returns [[1,2],[3,4]], whereas a request that sets majorDimension=COLUMNS returns [[1,3],[2,4]]. |
| `valueRenderOption` | string ("FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA") | No | How values should be represented in the output. The default render option is FORMATTED_VALUE. |
| `dateTimeRenderOption` | string ("SERIAL_NUMBER" | "FORMATTED_STRING") | No | How dates, times, and durations should be represented in the output. This is ignored if valueRenderOption is FORMATTED_VALUE. The default dateTime render option is SERIAL_NUMBER. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Chart in Google Sheets

**Slug:** `GOOGLESHEETS_UPDATE_CHART`

Update the specification of an existing chart in a Google Sheets spreadsheet. Use this action when you need to modify an existing chart's properties such as its title, chart type, data ranges, colors, axes, or other visual settings. This action updates the chart's specification but does not change its position or size on the sheet.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chart_id` | integer | Yes | The unique numeric identifier of the chart to update within the spreadsheet. This is the chartId value returned when the chart was created or can be retrieved using the 'Get Spreadsheet Info' action (look for sheets[].charts[].chartId in the response). The chart must already exist in the specified spreadsheet. |
| `chart_spec` | object | Yes | The complete ChartSpec object defining the updated chart specification. This replaces the chart's existing specification but does not move or resize the chart. Must set exactly one chart type field: basicChart, pieChart, bubbleChart, candlestickChart, histogramChart, treemapChart, waterfallChart, orgChart, or scorecardChart. To change chart position or size, use a separate UpdateEmbeddedObjectPosition request. See https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/charts#ChartSpec |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Sheets spreadsheet containing the chart to update. Must be the actual spreadsheet ID from the URL (e.g., '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'), NOT the spreadsheet name or title. Find it in the URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Dimension Properties (Hide/Unhide & Resize)

**Slug:** `GOOGLESHEETS_UPDATE_DIMENSION_PROPERTIES`

Tool to hide/unhide rows or columns and set row heights or column widths. Use when you need to change visibility or pixel sizing of dimensions in a Google Sheet.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sheet_id` | integer | No | The numeric ID of the sheet (tab). Either sheet_id or sheet_name must be provided. If both are provided, sheet_name will be resolved to sheet_id and override this value. |
| `dimension` | string ("ROWS" | "COLUMNS") | Yes | Whether to update rows or columns. |
| `end_index` | integer | Yes | The zero-based end index (exclusive) of the dimension range to update. For example, to update rows 5-9, use start_index=5 and end_index=10. |
| `pixel_size` | integer | No | The height (for rows) or width (for columns) in pixels. Must be a positive integer. At least one of hidden_by_user or pixel_size must be provided. |
| `sheet_name` | string | No | The name of the sheet (tab). If provided, this will be resolved to the numeric sheet_id using GOOGLESHEETS_GET_SPREADSHEET_INFO. Either sheet_id or sheet_name must be provided. |
| `start_index` | integer | Yes | The zero-based start index (inclusive) of the dimension range to update. For rows, 0 is the first row; for columns, 0 is column A. |
| `hidden_by_user` | boolean | No | Whether to hide (true) or unhide (false) the specified rows/columns. At least one of hidden_by_user or pixel_size must be provided. |
| `spreadsheet_id` | string | Yes | The ID of the spreadsheet to update. |
| `response_ranges` | array | No | Limits the ranges included in the response spreadsheet (only if includeSpreadsheetInResponse is true). |
| `response_include_grid_data` | boolean | No | Whether to include grid data in the response (only if includeSpreadsheetInResponse is true). |
| `include_spreadsheet_in_response` | boolean | No | Whether to include the updated spreadsheet in the response. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Sheet Properties

**Slug:** `GOOGLESHEETS_UPDATE_SHEET_PROPERTIES`

Tool to update properties of a sheet (worksheet) within a Google Spreadsheet, such as its title, index, visibility, tab color, or grid properties. Use this when you need to modify the metadata or appearance of a specific sheet.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `spreadsheetId` | string | Yes | The ID of the spreadsheet containing the sheet to update. |
| `responseRanges` | array | No | Limits the ranges included in the response spreadsheet. Meaningful only if includeSpreadsheetInResponse is true. Ranges should be in A1 notation (e.g., 'Sheet1!A1:B2'). |
| `updateSheetProperties` | object | Yes | The details of the sheet properties to update. |
| `responseIncludeGridData` | boolean | No | True if grid data should be returned. Meaningful only if includeSpreadsheetInResponse is true. When true, the response will include cell data for the specified ranges. |
| `includeSpreadsheetInResponse` | boolean | No | Determines if the update response should include the spreadsheet resource. When true, the response will include the full updated spreadsheet. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Spreadsheet Properties

**Slug:** `GOOGLESHEETS_UPDATE_SPREADSHEET_PROPERTIES`

Tool to update SPREADSHEET-LEVEL properties such as the spreadsheet's title, locale, time zone, or auto-recalculation settings. Use when you need to modify the overall configuration of a Google Spreadsheet. NOTE: To update individual SHEET properties (like renaming a specific sheet/tab), use GOOGLESHEETS_UPDATE_SHEET_PROPERTIES instead.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | string | Yes | Field mask specifying which properties to update (comma-separated for multiple fields). Supports nested paths using dot notation (e.g., 'iterativeCalculationSettings.maxIterations') per Protocol Buffers FieldMask specification. The root 'properties' is implied and must not be included. Special case: When updating 'spreadsheetTheme', use the field mask 'spreadsheetTheme' (not nested paths like 'spreadsheetTheme.primaryFontFamily') and provide the complete theme object with all required fields. Wildcard '*' updates all properties. |
| `properties` | object | Yes | The spreadsheet-level properties to update (e.g., title, locale, timeZone, autoRecalc). At least one field within properties must be set. NOTE: To update individual sheet/tab properties (like renaming a specific sheet), use GOOGLESHEETS_UPDATE_SHEET_PROPERTIES instead. |
| `spreadsheetId` | string | Yes | The ID of the spreadsheet to update. |
| `responseRanges` | array | No | Limits the ranges included in the response spreadsheet. Only meaningful if includeSpreadsheetInResponse is true. Ranges should be in A1 notation (e.g., 'Sheet1!A1:B2'). |
| `responseIncludeGridData` | boolean | No | Determines if grid data (cell values) should be included in the response. Only meaningful if includeSpreadsheetInResponse is true. When true, the response will include cell data for the specified ranges or entire spreadsheet. |
| `includeSpreadsheetInResponse` | boolean | No | Determines if the update response should include the full spreadsheet resource. When true, the response will include the entire updated spreadsheet with all sheets, properties, and metadata. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Batch update spreadsheet values

**Slug:** `GOOGLESHEETS_UPDATE_VALUES_BATCH`

Tool to set values in one or more ranges of a spreadsheet. Use when you need to update multiple ranges in a single operation for better performance.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | array | Yes | The new values to apply to the spreadsheet. Each ValueRange specifies a range and the values to write to that range. Multiple ranges can be updated in a single request. |
| `spreadsheet_id` | string | Yes | The ID of the spreadsheet to update. This ID can be found in the URL of the spreadsheet (e.g., https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit). Must be a valid Google Sheets spreadsheet ID. |
| `valueInputOption` | string ("INPUT_VALUE_OPTION_UNSPECIFIED" | "RAW" | "USER_ENTERED") | Yes | How the input data should be interpreted. RAW: Values are stored exactly as entered, without parsing. USER_ENTERED: Values are parsed as if typed by a user (numbers stay numbers, strings prefixed with '=' become formulas, etc.). INPUT_VALUE_OPTION_UNSPECIFIED: Default input value option is not specified. |
| `includeValuesInResponse` | boolean | No | Determines if the update response should include the values of the cells that were updated. By default, responses do not include the updated values. |
| `responseValueRenderOption` | string ("FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA") | No | Determines how values in the response should be rendered. Only used if includeValuesInResponse is true. FORMATTED_VALUE (default): Values are formatted as displayed in the UI. UNFORMATTED_VALUE: Values are unformatted. FORMULA: Formulas are not evaluated. |
| `responseDateTimeRenderOption` | string ("SERIAL_NUMBER" | "FORMATTED_STRING") | No | Determines how dates, times, and durations in the response should be rendered. Only used if includeValuesInResponse is true. SERIAL_NUMBER (default): Dates are returned as numbers. FORMATTED_STRING: Dates are returned as formatted strings. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Upsert Rows (Smart Update/Insert)

**Slug:** `GOOGLESHEETS_UPSERT_ROWS`

Upsert rows - update existing rows by key, append new ones. Automatically handles column mapping and partial updates. Use for: CRM syncs (match Lead ID), transaction imports (match Transaction ID), inventory updates (match SKU), calendar syncs (match Event ID). Features: - Auto-adds missing columns to sheet - Partial column updates (only update Phone + Status, preserve other columns) - Column order doesn't matter (auto-maps by header name) - Prevents duplicates by matching key column Example inputs: - Contact update: keyColumn='Email', headers=['Email','Phone','Status'], data=[['john@ex.com','555-0101','Active']] - Inventory sync: keyColumn='SKU', headers=['SKU','Stock','Price'], data=[['WIDGET-001',50,9.99],['GADGET-002',30,19.99]] - CRM lead update: keyColumn='Lead ID', headers=['Lead ID','Score','Status'], data=[['L-12345',85,'Hot']] - Partial update: keyColumn='Email', headers=['Email','Phone'] (only updates Phone, preserves Name/Address/etc)

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rows` | array | Yes | 2D array of data rows to upsert. IMPORTANT: If 'headers' is NOT provided, the FIRST row is treated as column headers and remaining rows as data - so you need at least 2 rows (1 header + 1 data). If 'headers' IS provided separately, then ALL rows in this array are treated as data rows. Each row should have the same number of values as headers. If a row has MORE values than headers: with strict_mode=true (default), an error is returned showing which rows are affected; with strict_mode=false, extra values are silently truncated. If a row has FEWER values than headers, an error is returned during execution. Cell values can be strings, numbers, booleans, or null. Example with headers provided: headers=['Email','Status'], rows=[['john@ex.com','Active']] (1 data row). Example without headers: rows=[['Email','Status'],['john@ex.com','Active']] (row 1 = headers, row 2 = data). |
| `headers` | array | No | List of column names for the data. These will be matched against sheet headers. If a column doesn't exist in the sheet, it will be added automatically. Order doesn't need to match sheet order. Can be auto-derived from the first row in 'rows' if not provided. Example inputs: ['Email', 'Phone', 'Status'] for contact updates, ['Lead ID', 'Name', 'Score'] for CRM, ['SKU', 'Stock', 'Price'] for inventory. |
| `keyColumn` | string | No | The column NAME (header text) to use as unique identifier for matching rows. Must be an actual header name from the sheet (e.g., 'Email', 'Lead ID', 'SKU'), NOT a column letter (e.g., 'A', 'B', 'C'). If you provide a column letter like 'A', it will be automatically converted to the header name at that column position. If neither 'key_column' nor 'key_column_index' is provided, defaults to the first column (index 0). |
| `sheetName` | string | Yes | The name of the sheet/tab within the spreadsheet. Note: Google Sheets creates default sheets with localized names based on account language (e.g., 'Sheet1' for English, '工作表1' for Chinese, 'Hoja1' for Spanish, 'Feuille1' for French, 'Planilha1' for Portuguese, 'Лист1' for Russian). If you specify a common default name and the sheet is not found, the action will automatically use the first sheet if only one exists. |
| `strictMode` | boolean | No | Controls how rows with mismatched column counts are handled. When True (default), an error is returned if any row has more values than headers - the error message shows exactly which rows are affected and what values would need to be removed. When False, extra values are silently truncated to match the header count. Set to False only if you explicitly want automatic truncation of extra values. |
| `tableStart` | string | No | Cell where the table starts (where headers are located). Defaults to 'A1'. Use this if your table is offset (e.g., 'C5', 'D10'). |
| `spreadsheetId` | string | Yes | The ID of the spreadsheet. Must be a non-empty string, typically a 44-character alphanumeric string found in the spreadsheet URL. |
| `key_column_index` | string | No | The 0-based column index to use as unique identifier for matching rows. Alternative to 'key_column' - will be converted to column name using headers. If neither 'key_column' nor 'key_column_index' is provided, defaults to 0 (first column). Example: 0 for first column, 1 for second column. |
| `normalization_message` | string | No | Internal field to track input normalization (e.g., row truncation). Not part of API. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get spreadsheet values

**Slug:** `GOOGLESHEETS_VALUES_GET`

Returns a range of values from a spreadsheet. Use when you need to read data from specific cells or ranges in a Google Sheet.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `range` | string | Yes | The A1 notation or R1C1 notation of the range to retrieve values from. If the sheet name contains spaces or special characters, wrap the sheet name in single quotes (e.g., "'My Sheet'!A1:B2"). Without single quotes, the API will return a 400 error for sheet names with spaces. Examples: 'Sheet1!A1:B3', "'Sheet With Spaces'!A1:D5", 'A1:D5' (no sheet name uses first visible sheet), 'Sheet1!A:A' (entire column), 'SheetName' (entire sheet). |
| `end_row` | integer | No | 1-based row number to stop reading at (inclusive). Use with start_row for pagination to avoid large response errors. Example: start_row=501, end_row=1000 fetches rows 501-1000. |
| `start_row` | integer | No | 1-based row number to start reading from (inclusive). Use with end_row for pagination to avoid large response errors. Example: start_row=1, end_row=500 fetches the first 500 rows. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet from which to retrieve values. This is the long alphanumeric string found in the spreadsheet URL between '/d/' and '/edit' (e.g., '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'). WARNING: Do NOT use the spreadsheet name or title (e.g., 'My Sales Report'); you must use the actual ID from the URL. |
| `major_dimension` | string ("DIMENSION_UNSPECIFIED" | "ROWS" | "COLUMNS") | No | The major dimension for results. |
| `value_render_option` | string ("FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA") | No | How values should be rendered in the output. FORMATTED_VALUE: Values are calculated and formatted (default). UNFORMATTED_VALUE: Values are calculated but not formatted. FORMULA: Values are not calculated; the formula is returned instead. |
| `date_time_render_option` | string ("SERIAL_NUMBER" | "FORMATTED_STRING") | No | How dates, times, and durations should be represented in the output. SERIAL_NUMBER: Dates are returned as serial numbers (default). FORMATTED_STRING: Dates returned as formatted strings. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update spreadsheet values

**Slug:** `GOOGLESHEETS_VALUES_UPDATE`

Tool to set values in a range of a Google Spreadsheet. Use when you need to update or overwrite existing cell values in a specific range.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `range` | string | Yes | The A1 notation of the range to update values in (e.g., 'Sheet1!A1:C2', 'MySheet!C:C', or 'A1:D5'). Must be actual cell references, not placeholder values. If the sheet name is omitted (e.g., 'A1:B2'), the operation applies to the first visible sheet. IMPORTANT: The range must not exceed the sheet's grid dimensions. By default, new sheets have 1000 rows and 26 columns (A-Z). If you need to write to columns beyond Z (e.g., AA, AB), first expand the sheet using GOOGLESHEETS_APPEND_DIMENSION or check the current dimensions using GOOGLESHEETS_GET_SPREADSHEET_INFO. |
| `values` | array | Yes | The data to write. This is an array of arrays, the outer array representing all the data and each inner array representing a major dimension. Each item in the inner array corresponds with one cell. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet to update. This ID can be found in the URL of the spreadsheet (e.g., https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit). Must be a non-empty string. |
| `major_dimension` | string ("ROWS" | "COLUMNS") | No | The major dimension of the values. ROWS (default) means each inner array is a row of values. COLUMNS means each inner array is a column of values. Defaults to ROWS if unspecified. |
| `auto_expand_sheet` | boolean | No | If True (default), automatically expands the sheet's dimensions (adds columns/rows) when the target range exceeds the current grid limits. If False, the operation will fail with an error if the range exceeds grid limits. |
| `value_input_option` | string ("RAW" | "USER_ENTERED") | Yes | How the input data should be interpreted. RAW: Values are stored exactly as entered, without parsing (dates, formulas, etc. remain as strings). USER_ENTERED: Values are parsed as if typed by a user (numbers stay numbers, strings prefixed with '=' become formulas, etc.). |
| `include_values_in_response` | boolean | No | Determines if the update response should include the values of the cells that were updated. By default, responses do not include the updated values. |
| `response_value_render_option` | string ("FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA") | No | Determines how values in the response should be rendered. Only used if includeValuesInResponse is true. FORMATTED_VALUE (default): Values are formatted as displayed in the UI. UNFORMATTED_VALUE: Values are unformatted (numbers, booleans, formulas). FORMULA: Formulas are not evaluated and remain as text. |
| `response_datetime_render_option` | string ("SERIAL_NUMBER" | "FORMATTED_STRING") | No | Determines how dates, times, and durations in the response should be rendered. Only used if includeValuesInResponse is true. SERIAL_NUMBER (default): Dates are returned as numbers. FORMATTED_STRING: Dates are returned as strings formatted per the cell's locale. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |


## Triggers

### Aggregate Metric Changed

**Slug:** `GOOGLESHEETS_AGGREGATE_METRIC_CHANGED_TRIGGER`

**Type:** poll

Triggers when an aggregate metric (SUM/COUNT/AVG/MIN/MAX) changes in a Google Sheets spreadsheet.
    This trigger monitors an aggregate calculation on a target column (optionally filtered by a search column/value)
    and fires when the calculated result changes.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `case_sensitive` | boolean | No | Whether the search should be case-sensitive when filtering by search_column and search_value. |
| `has_header_row` | boolean | No | Whether the first row contains column headers. If True, column names can be used for search_column and target_column. |
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `operation` | string | Yes | The mathematical operation to perform on the target column values. Supported operations: sum, average, count, min, max, percentage. |
| `percentage_total` | number | No | For percentage operation, the total value to calculate percentage against. If not provided, uses sum of all values in target column. |
| `search_column` | string | No | The column to search in for filtering rows. Can be a letter (e.g., 'A', 'B') or column name from header row (e.g., 'Region', 'Department'). If not provided, all rows in the target column will be aggregated without filtering. |
| `search_value` | string | No | The exact value to search for in the search column. Case-sensitive by default. If not provided (or if search_column is not provided), all rows in the target column will be aggregated without filtering. |
| `sheet_name` | string | Yes | The name of the specific sheet within the spreadsheet to monitor. Matching is case-insensitive. If no exact match is found, partial matches will be attempted (e.g., 'overview' will match 'Overview 2025'). |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Sheets spreadsheet to monitor. This is the long alphanumeric string found in the spreadsheet URL between '/d/' and '/edit'. |
| `target_column` | string | Yes | The column to aggregate data from. Can be a letter (e.g., 'C', 'D') or column name from header row (e.g., 'Sales', 'Revenue'). |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `current_result` | number | Yes | The current aggregate metric value |
| `detected_at` | string | Yes | ISO timestamp when the change was detected |
| `event_type` | string | No | Type of event that occurred |
| `matching_rows_count` | integer | Yes | Number of rows that matched the search condition |
| `operation` | string | Yes | The aggregation operation performed |
| `previous_result` | number | Yes | The previous aggregate metric value |
| `processed_values_count` | integer | Yes | Number of values that were processed in the aggregation |
| `search_details` | object | Yes | Details of the search/filter used to select rows prior to aggregation |
| `sheet_name` | string | Yes | The sheet name |
| `spreadsheet_id` | string | Yes | The spreadsheet ID |

### Cell Range Values Changed

**Slug:** `GOOGLESHEETS_CELL_RANGE_VALUES_CHANGED_TRIGGER`

**Type:** poll

Triggers when values in a specified A1 range change in Google Sheets.
    This trigger monitors a specific cell or range of cells and fires when any values change.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `range` | string | Yes | The A1 notation of the range to monitor for changes (can be a single cell or multi-cell range). If the sheet name contains spaces or special characters, wrap the sheet name in single quotes. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet to monitor. This is the long alphanumeric string found in the spreadsheet URL between '/d/' and '/edit'. |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `current_values` | array | Yes | The current values in the range |
| `detected_at` | string | Yes | ISO timestamp when the change was detected |
| `event_type` | string | No | Type of event that occurred |
| `previous_values` | array | Yes | The previous values in the range |
| `range` | string | Yes | The A1 notation of the monitored range |
| `spreadsheet_id` | string | Yes | The spreadsheet ID |

### Conditional Format Rule Changed

**Slug:** `GOOGLESHEETS_CONDITIONAL_FORMAT_RULE_CHANGED_TRIGGER`

**Type:** poll

Triggers when conditional formatting rules change in a Google Spreadsheet.
    Detects when rules are added, updated, or removed.
    Uses snapshot-based diffing to detect changes between polls.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `sheet_id` | integer | No | Optional filter: monitor only the sheet with this exact numeric sheetId. If not provided, monitors all sheets. If both sheet_title and sheet_id are provided, sheet_id takes precedence. |
| `sheet_title` | string | No | Optional filter: monitor only the sheet with this exact title. If not provided, monitors all sheets. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet to monitor for conditional formatting rule changes |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `change_type` | string | Yes | Type of change: 'added', 'updated', or 'removed' |
| `detected_at` | string | Yes | ISO timestamp when the change was detected |
| `rules` | array | Yes | List of rules that changed |
| `spreadsheet_id` | string | Yes | The spreadsheet ID |

### Data Validation Rule Changed

**Slug:** `GOOGLESHEETS_DATA_VALIDATION_RULE_CHANGED_TRIGGER`

**Type:** poll

Triggers when data validation rules change (added/updated/removed) in a Google Spreadsheet.
    Uses snapshot-based diffing to detect changes between polls.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `ranges` | array | No | Optional list of A1 ranges to monitor. If omitted, the entire sheet(s) will be monitored. |
| `sheet_id` | integer | No | Optional sheet ID to filter by. If omitted, all sheets will be monitored. |
| `sheet_title` | string | No | Optional sheet title to filter by. If omitted, all sheets will be monitored. |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet to monitor for data validation rule changes. |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `change_type` | string | Yes | Type of change: 'added', 'updated', or 'removed' |
| `detected_at` | string | Yes | ISO timestamp when the change was detected |
| `rules` | array | Yes | List of validation rules that changed |
| `spreadsheet_id` | string | Yes | The spreadsheet ID |

### Developer Metadata Changed

**Slug:** `GOOGLESHEETS_DEVELOPER_METADATA_CHANGED_TRIGGER`

**Type:** poll

Triggers when developer metadata entries change (new/updated/removed) in a Google Spreadsheet.
    Uses snapshot-based diffing to detect changes between polls.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data_filters` | array | No | The data filters describing the criteria used to determine which DeveloperMetadata entries to monitor. If not specified, monitors all developer metadata. |
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet to monitor for developer metadata changes. |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `change_type` | string | Yes | Type of change: 'created', 'updated', or 'removed' |
| `detected_at` | string | Yes | ISO timestamp when the change was detected |
| `metadata_items` | array | Yes | List of metadata items that changed |
| `spreadsheet_id` | string | Yes | The spreadsheet ID |

### Filtered Range Values Changed

**Slug:** `GOOGLESHEETS_FILTERED_RANGE_VALUES_CHANGED_TRIGGER`

**Type:** poll

Polling trigger that monitors Google Sheets filtered ranges for value changes.
    Uses snapshot-based diffing to detect when values matching a data filter change.
    Emits the matched values when changes are detected.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data_filters` | array | Yes | List of data filters specifying which ranges to monitor for changes. Each filter can specify either 'a1Range' (e.g., 'Sheet1!A1:B10') or 'gridRange'. |
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `major_dimension` | string ("ROWS" | "COLUMNS") | No | The major dimension that results should use. ROWS returns [[1,2],[3,4]], COLUMNS returns [[1,3],[2,4]] |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet to monitor |
| `value_render_option` | string ("FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA") | No | How values should be represented in the output |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `change_type` | string ("created" | "updated" | "deleted") | Yes | Type of change detected |
| `detected_at` | string | Yes | ISO timestamp when the change was detected |
| `new_values` | array | Yes | Current values in the range |
| `old_values` | array | No | Previous values in the range (None if new) |
| `range_identifier` | string | Yes | The A1 notation or identifier of the range that changed |
| `spreadsheet_id` | string | Yes | The spreadsheet ID |

### New Rows in Google Sheet

**Slug:** `GOOGLESHEETS_NEW_ROWS_TRIGGER`

**Type:** poll

Simple polling trigger that monitors Google Sheets for new rows.
    Detects when new rows are added and returns the complete row data.
    Perfect for triggering any workflow based on new sheet entries.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `sheet_name` | string | No | The name of the specific sheet within the spreadsheet to monitor |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet to monitor |
| `start_row` | integer | No | The row number to start monitoring from (1-indexed, typically 2 to skip headers) |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `detected_at` | string | Yes | ISO timestamp when the row was detected |
| `row_data` | array | Yes | Complete row data as list of strings |
| `row_number` | integer | Yes | The row number in the sheet (1-indexed) |
| `sheet_name` | string | Yes | The sheet name |
| `spreadsheet_id` | string | Yes | The spreadsheet ID |

### New Sheet Added in Google Spreadsheet

**Slug:** `GOOGLESHEETS_NEW_SHEET_ADDED_TRIGGER`

**Type:** poll

Polling trigger that detects when a new sheet is added to a Google Spreadsheet.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet to monitor |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `detected_at` | string | Yes | ISO timestamp when the new sheet was detected |
| `sheet_name` | string | Yes | The name of the new sheet added |
| `spreadsheet_id` | string | Yes | The spreadsheet ID |

### New Spreadsheet Created

**Slug:** `GOOGLESHEETS_NEW_SPREADSHEET_CREATED_TRIGGER`

**Type:** poll

Triggers when a new Google Spreadsheet is created.
    This trigger monitors Google Spreadsheets and fires when new spreadsheets are detected.
    Uses timestamp filtering to efficiently detect newly created spreadsheets.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `include_shared_drives` | boolean | No | Whether to include spreadsheets from shared drives you have access to. Defaults to True. |
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `max_results` | integer | No | Maximum number of spreadsheets to check in each poll (1-1000) |
| `query` | string | No | Optional search query to filter spreadsheets. Can search by name (name contains 'Budget'), full text content (fullText contains 'sales'), or use complex queries with operators. Leave empty to monitor all spreadsheets. |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event_type` | string | No | Type of event that occurred |
| `spreadsheet` | object | Yes | The newly created Google Spreadsheet |

### Spreadsheet Metadata Changed

**Slug:** `GOOGLESHEETS_SPREADSHEET_METADATA_CHANGED_TRIGGER`

**Type:** poll

Polling trigger that detects when a Google Spreadsheet's metadata changes.
    Uses snapshot-based diffing to detect any changes in spreadsheet properties,
    sheets, named ranges, developer metadata, data sources, etc.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet to monitor for metadata changes |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `changes` | array | Yes | List of metadata changes detected |
| `current_metadata` | object | Yes | Current metadata snapshot |
| `detected_at` | string | Yes | ISO timestamp when the change was detected |
| `spreadsheet_id` | string | Yes | The spreadsheet ID |
| `spreadsheet_url` | string | No | URL to view the spreadsheet |

### Spreadsheet Properties Changed

**Slug:** `GOOGLESHEETS_SPREADSHEET_PROPERTIES_CHANGED_TRIGGER`

**Type:** poll

Polling trigger that detects when a Google Spreadsheet's top-level properties change.
    Monitors properties such as title, locale, timeZone, and autoRecalc settings.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet to monitor for property changes |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `changed_properties` | array | Yes | List of properties that changed |
| `detected_at` | string | Yes | ISO timestamp when the change was detected |
| `spreadsheet_id` | string | Yes | The spreadsheet ID |
| `spreadsheet_url` | string | No | URL to view the spreadsheet |

### Spreadsheet Row Changed

**Slug:** `GOOGLESHEETS_SPREADSHEET_ROW_CHANGED_TRIGGER`

**Type:** poll

Triggers when a looked-up spreadsheet row changes.
    This trigger monitors a specific row (located by searching for a query value within a user-specified range)
    and fires when the row's values change, when the row appears, or when the row disappears.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `case_sensitive` | boolean | No | If `True`, the query string search is case-sensitive. |
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `normalize_whitespace` | boolean | No | If `True`, strips leading and trailing whitespace from cell values before matching. This helps match cells like ' TOTAL ' or 'TOTAL ' when searching for 'TOTAL'. |
| `query` | string | Yes | Exact text value to find; matches the entire content of a cell in a row. |
| `range` | string | No | A1 notation range to search within. Supports cell ranges (e.g., 'Sheet1!A1:D5'), column-only ranges (e.g., 'Sheet1!A:Z'), and row-only ranges (e.g., 'Sheet1!1:1'). Defaults to the first sheet if omitted. IMPORTANT: Sheet names with spaces must be single-quoted (e.g., "'My Sheet'!A1:Z"). Bare sheet names without ranges (e.g., 'Sheet1') are not supported - always specify a range. |
| `spreadsheet_id` | string | Yes | Identifier of the Google Spreadsheet to monitor. |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `change_type` | string | Yes | Type of change: 'created' (row appeared), 'updated' (row values changed), or 'deleted' (row disappeared) |
| `current_row_data` | string | Yes | The current row data (empty dict if row is not found now) |
| `detected_at` | string | Yes | ISO timestamp when the change was detected |
| `event_type` | string | No | Type of event that occurred |
| `previous_row_data` | string | Yes | The previous row data (empty dict if row was not found before) |
| `query` | string | Yes | The query used to find the row |
| `range` | string | No | The A1 notation range that was searched |
| `spreadsheet_id` | string | Yes | The spreadsheet ID |

### Spreadsheet Search Match

**Slug:** `GOOGLESHEETS_SPREADSHEET_SEARCH_MATCH_TRIGGER`

**Type:** poll

Triggers when a new spreadsheet appears that matches a saved search.
    This trigger uses snapshot-based diffing to detect when spreadsheets matching
    the search criteria are newly created or become visible to the user.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `created_after` | string | No | Return spreadsheets created after this date. Use RFC 3339 format like '2024-01-01T00:00:00Z'. |
| `include_shared_drives` | boolean | No | Whether to include spreadsheets from shared drives you have access to. Defaults to True. |
| `include_trashed` | boolean | No | Whether to include spreadsheets in trash. Defaults to False. |
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `max_results` | integer | No | Maximum number of spreadsheets to check in each poll (1-100) |
| `modified_after` | string | No | Return spreadsheets modified after this date. Use RFC 3339 format like '2024-01-01T00:00:00Z'. |
| `order_by` | string | No | Order results by field. Common options: 'modifiedTime desc', 'modifiedTime asc', 'name', 'createdTime desc' |
| `query` | string | No | Search query to filter spreadsheets. Behavior depends on the 'search_type' parameter. For advanced searches, use Google Drive query syntax with fields like 'name contains', 'fullText contains', or boolean filters like 'sharedWithMe = true'. DO NOT use spreadsheet IDs as search terms. Leave empty to get all spreadsheets. |
| `search_type` | string ("name" | "content" | "both") | No | How to search: 'name' searches filenames only (prefix matching from the START of filenames), 'content' uses fullText search which searches file content, name, description, and metadata, 'both' explicitly searches both name OR content with an OR condition. |
| `shared_with_me` | boolean | No | Whether to return only spreadsheets shared with the current user. Defaults to False. |
| `starred_only` | boolean | No | Whether to return only starred spreadsheets. Defaults to False. |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event_type` | string | No | Type of event that occurred |
| `spreadsheet` | object | Yes | The spreadsheet that matches the search criteria |

### Table Query Result Changed

**Slug:** `GOOGLESHEETS_TABLE_QUERY_RESULT_CHANGED_TRIGGER`

**Type:** poll

Triggers when the result set of a saved table query changes in Google Sheets.
    Detects rows added, removed, or updated in the query output.
    This trigger monitors the result of a SQL query against a Google Sheets table
    and fires when changes are detected.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `include_formulas` | boolean | No | Whether to return formula text instead of calculated values for formula columns |
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet to query. This is the long alphanumeric string found in the spreadsheet URL between '/d/' and '/edit'. |
| `sql` | string | Yes | SQL SELECT query to execute. The table name is the Google Sheets tab/sheet name (visible at the bottom of the spreadsheet). Supported: SELECT cols FROM table WHERE conditions ORDER BY col LIMIT n. Table names must be quoted with double quotes if they contain spaces or are numeric-only (e.g., SELECT * FROM "My Sheet" or SELECT * FROM "415"). |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `changes` | array | Yes | List of detected changes |
| `detected_at` | string | Yes | ISO timestamp when the change was detected |
| `event_type` | string | No | Type of event that occurred |
| `spreadsheet_id` | string | Yes | The spreadsheet ID |
| `sql` | string | Yes | The SQL query that was executed |
| `total_rows_after` | integer | Yes | Total number of rows after the change |
| `total_rows_before` | integer | Yes | Total number of rows before the change |

### Table Schema Changed

**Slug:** `GOOGLESHEETS_TABLE_SCHEMA_CHANGED_TRIGGER`

**Type:** poll

Polling trigger that detects when a table's schema changes in Google Sheets.
    Monitors columns added/removed/renamed and inferred type/format changes.
    Uses snapshot-based diffing to compare schemas between polls.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `sample_size` | integer | No | Number of rows to sample for type inference |
| `sheet_name` | string | No | Sheet/tab name if table_name is ambiguous across multiple sheets |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet to monitor |
| `table_name` | string | Yes | Table name from LIST_TABLES response OR the visible Google Sheets tab name. Use 'auto' to monitor the largest/most prominent table. |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `change_summary` | string | Yes | Human-readable summary of the changes |
| `column_changes` | array | Yes | List of column changes detected |
| `current_column_count` | integer | Yes | Number of columns in current schema |
| `detected_at` | string | Yes | ISO timestamp when the change was detected |
| `previous_column_count` | integer | Yes | Number of columns in previous schema |
| `sheet_name` | string | Yes | Sheet name where table is located |
| `spreadsheet_id` | string | Yes | The spreadsheet ID |
| `table_name` | string | Yes | Name of the table that changed |

### Worksheet Names Changed

**Slug:** `GOOGLESHEETS_WORKSHEET_NAMES_CHANGED_TRIGGER`

**Type:** poll

Triggers when the set of worksheet/tab names changes in a Google Spreadsheet.
    Detects when sheets are added, deleted, or renamed.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `spreadsheet_id` | string | Yes | The unique identifier of the Google Spreadsheet to monitor |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `change_type` | string | Yes | Type of change: 'added', 'deleted', or 'renamed' |
| `current_names` | array | Yes | Current list of all worksheet names after the change |
| `detected_at` | string | Yes | ISO timestamp when the change was detected |
| `previous_name` | string | No | Previous name if worksheet was renamed (only for renamed events) |
| `spreadsheet_id` | string | Yes | The spreadsheet ID |
| `worksheet_name` | string | Yes | The name of the worksheet that was added, deleted, or involved in the change |
