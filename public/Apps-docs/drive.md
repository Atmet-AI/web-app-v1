# Google Drive

Google Drive is a cloud storage solution for uploading, sharing, and collaborating on files across devices, with robust search and offline access

- **Category:** file management & storage
- **Auth:** OAUTH2
- **Composio Managed App Available?** Yes
- **Tools:** 90
- **Triggers:** 7
- **Slug:** `GOOGLEDRIVE`
- **Version:** 20260721_00

## Frequently Asked Questions

### How do I set up custom Google OAuth credentials for Google Drive?

For a step-by-step guide on creating and configuring your own Google OAuth credentials with Composio, see [How to create OAuth2 credentials for Google Apps](https://composio.dev/auth/googleapps).

### Why am I seeing "App is blocked" when connecting Google Drive?

The OAuth client is requesting scopes that Google hasn't verified for that client. This usually happens when you add extra scopes beyond the defaults.

Remove the additional scopes from your auth config, or create your own OAuth app and submit the scopes for verification. See [How to create OAuth2 credentials for Google Apps](https://composio.dev/auth/googleapps).

### Why am I getting "Google Drive API has not been used in project" error?

When using custom OAuth credentials, the Google Drive API must be enabled in the Google Cloud project that owns those credentials. Enable it in Google Cloud Console under APIs & Services, wait a few minutes, and retry.

### Why am I getting "Error 400: invalid_scope"?

The requested scopes are invalid or incorrectly formatted in the authorization URL. Verify your scope values against the [Google OAuth scopes docs](https://developers.google.com/identity/protocols/oauth2). If you're creating auth configs programmatically, see the [programmatic auth config guide](/docs/programmatic-auth-configs).

### Why does the OAuth consent screen show "Composio" instead of my app?

By default, the consent screen uses Composio's OAuth app. To show your own app name and logo, create your own OAuth app and set a custom redirect URL. See [White-labeling authentication](/docs/white-labeling-authentication#using-your-own-oauth-apps).

### Why am I getting 401 errors on tool calls?

The user's access token is no longer valid. Common causes: the user revoked access, changed their password or 2FA, a Workspace admin policy changed, or Google's refresh token limit (~50 per account) was exceeded. Re-authenticating the user typically resolves this.

## Tools

### Add file sharing preference (Deprecated)

**Slug:** `GOOGLEDRIVE_ADD_FILE_SHARING_PREFERENCE`

DEPRECATED: Use GOOGLEDRIVE_CREATE_PERMISSION instead; use GOOGLEDRIVE_UPDATE_PERMISSION to modify existing permissions (avoids duplicate entries). Modifies sharing permissions for an existing Google Drive file, granting a specified role to a user, group, domain, or 'anyone'. Bulk calls may trigger 403 rateLimitExceeded (~100 req/100s/user); use jittered exponential backoff.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string ("owner" | "organizer" | "fileOrganizer" | "writer" | "commenter" | "reader") | Yes | Permission role to grant. Accepted values: 'reader', 'commenter', 'writer', 'fileOrganizer', 'organizer', 'owner'. Invalid strings cause validation failures. |
| `type` | string ("user" | "group" | "domain" | "anyone") | Yes | Type of grantee for the permission. Using 'anyone' with 'writer' or 'owner' broadly exposes the document — confirm before applying. Admin policies may block 'anyone' or domain-wide sharing. For type='anyone' with role='reader', the link must be explicitly shared; files are not publicly searchable. |
| `domain` | string | No | Domain to grant permission to (e.g., 'example.com'). Required if 'type' is 'domain'. |
| `file_id` | string | Yes | Unique identifier of the file to update sharing settings for. Must be an alphanumeric string containing only letters, numbers, hyphens, and underscores (no slashes, spaces, or other special characters). Use GOOGLEDRIVE_FIND_FILE or GOOGLEDRIVE_LIST_FILES to get valid file IDs from your Google Drive. For shared drive membership, supply the shared drive ID, not an individual document ID. |
| `email_address` | string | No | Email address of the user or group. Required if 'type' is 'user' or 'group'. |
| `transfer_ownership` | boolean | No | Whether to transfer ownership to the specified user. Required when role is 'owner'. Only a single user can be specified in the request when transferring ownership. Ownership transfer is difficult to reverse — obtain explicit confirmation before setting true. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Insert File Parent (v2)

**Slug:** `GOOGLEDRIVE_ADD_PARENT`

Tool to add a parent folder for a file using Google Drive API v2. Use when you need to add a file to an additional folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The ID of the parent folder to add. This is the folder that will become a parent of the file. |
| `fileId` | string | Yes | The ID of the file to add a parent folder to. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. Default is false. |
| `supportsTeamDrives` | boolean | No | Deprecated: Use supportsAllDrives instead. |
| `enforceSingleParent` | boolean | No | Deprecated: Adding files to multiple folders is no longer supported. Use shortcuts instead. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Insert Property (v2 API)

**Slug:** `GOOGLEDRIVE_ADD_PROPERTY`

Tool to add a property to a file, or update it if it already exists (v2 API). Use when you need to attach custom key-value metadata to a Google Drive file.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt` | string ("json" | "media" | "proto") | No | Data format for response. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token. |
| `xgafv` | string ("1" | "2") | No | V1 error format values. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. |
| `fileId` | string | Yes | The ID of the file. |
| `callback` | string | No | JSONP callback function name. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. 'media', 'multipart'). |
| `visibility` | string ("PRIVATE" | "PUBLIC") | No | Property visibility values. |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks. |
| `access_token` | string | No | OAuth access token. |
| `property_key` | string | Yes | The key of this property. |
| `property_value` | string | Yes | The value of this property. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. 'raw', 'multipart'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Copy file (Deprecated)

**Slug:** `GOOGLEDRIVE_COPY_FILE`

DEPRECATED: Use GOOGLEDRIVE_COPY_FILE_ADVANCED instead. Duplicates an existing file (not folders) in Google Drive by `file_id`; copy lands in same folder as original — use GOOGLEDRIVE_MOVE_FILE afterward for precise placement. Copy receives a new `file_id`; update stored references accordingly. For shared drives, requires organizer/manager rights.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The unique identifier for the file on Google Drive that you want to copy. This ID can be retrieved from the file's shareable link or via other Google Drive API calls. Pass only the raw ID, not a full URL. Name-based searches may return multiple files — confirm the correct `file_id` before calling. |
| `new_title` | string | No | The title to assign to the new copy of the file. If not provided, the copied file will have the same title as the original, prefixed with 'Copy of '. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Copy file with advanced options

**Slug:** `GOOGLEDRIVE_COPY_FILE_ADVANCED`

Creates a copy of a file and applies any requested updates with patch semantics. Use when you need to duplicate a file with advanced options like label inclusion, visibility settings, or custom metadata.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt` | string ("json" | "media" | "proto") | No | Data format for response. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token. |
| `name` | string | No | The name of the copied file. If not provided, the copied file will have the same name as the original, prefixed with 'Copy of '. |
| `xgafv` | string ("1" | "2") | No | V1 error format options. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. Use comma-separated field paths. |
| `fileId` | string | Yes | The ID of the file to copy. This is the unique identifier for the file on Google Drive. |
| `parents` | array | No | The IDs of the parent folders which contain the file. If not specified as part of a copy request, the file inherits any discoverable parents of the source file. |
| `starred` | boolean | No | Whether the user has starred the file. |
| `trashed` | boolean | No | Whether the file has been trashed. |
| `callback` | string | No | JSONP callback parameter. |
| `mimeType` | string | No | The MIME type of the file. Google Drive attempts to automatically detect an appropriate value from uploaded content, if no value is provided. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `properties` | object | No | A collection of arbitrary key-value pairs which are visible to all apps. Entries with null values are cleared in update and copy requests. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. 'media', 'multipart'). |
| `createdTime` | string | No | The time at which the file was created (RFC 3339 date-time). |
| `description` | string | No | A short description of the copied file. |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `ocrLanguage` | string | No | A language hint for OCR processing during image import (ISO 639-1 code). |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks for improved readability. |
| `access_token` | string | No | OAuth access token. |
| `modifiedTime` | string | No | The last time the file was modified by anyone (RFC 3339 date-time). Note that setting modifiedTime will also update modifiedByMeTime for the user. |
| `appProperties` | object | No | A collection of arbitrary key-value pairs which are private to the requesting app. Entries with null values are cleared in update and copy requests. These properties can only be retrieved using an authenticated request with an OAuth 2 client ID. |
| `includeLabels` | string | No | A comma-separated list of IDs of labels to include in the labelInfo part of the response. |
| `folderColorRgb` | string | No | The color for a folder or a shortcut to a folder as an RGB hex string. The supported colors are published in the folderColorPalette field of the About resource. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. 'raw', 'multipart'). |
| `writersCanShare` | boolean | No | Whether users with only writer permission can modify the file's permissions. Not populated for items in shared drives. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. |
| `supportsTeamDrives` | boolean | No | Deprecated: Use supportsAllDrives instead. |
| `enforceSingleParent` | boolean | No | Deprecated. Copying files into multiple folders is no longer supported. Use shortcuts instead. |
| `keepRevisionForever` | boolean | No | Whether to set the 'keepForever' field in the new head revision. This is only applicable to files with binary content in Google Drive. Only 200 revisions for the file can be kept forever. If the limit is reached, try deleting pinned revisions. |
| `ignoreDefaultVisibility` | boolean | No | Whether to ignore the domain's default visibility settings for the created file. Domain administrators can choose to make all uploaded files visible to the domain by default; this parameter bypasses that behavior for the request. Permissions are still inherited from parent folders. |
| `includePermissionsForView` | string | No | Specifies which additional view's permissions to include in the response. Only 'published' is supported. |
| `copyRequiresWriterPermission` | boolean | No | Whether the options to copy, print, or download this file should be disabled for readers and commenters. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Comment

**Slug:** `GOOGLEDRIVE_CREATE_COMMENT`

Tool to create a comment on a file in Google Drive. Returns a nested `data` object; extract `data.id` for the resulting comment identifier. Omit `anchor` and `quoted_file_content_*` for general file-level comments.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `anchor` | string | No | A JSON string defining the region of the document to which the comment is anchored. Format: {"region": {"kind": "drive#commentRegion", "<classifier>": <value>, "rev": "head"}}. Supported classifiers: (1) "line" for text lines (e.g., "line": 12), (2) "page" for page numbers (e.g., "page": {"p": 0}), (3) "txt" for text ranges (e.g., "txt": {"o": 100, "l": 50}), (4) "rect" for rectangles in images (e.g., "rect": {"x": 10, "y": 20, "w": 100, "h": 50}), (5) "time" for video timestamps (e.g., "time": {"t": "00:01:30"}), (6) "matrix" for spreadsheet cells (e.g., "matrix": {"c": 2, "r": 5}). Note: On blob files, only unanchored comments are supported. Google Workspace editors may treat API-set anchors as unanchored. |
| `content` | string | Yes | The plain text content of the comment. |
| `file_id` | string | Yes | The ID of the file. The `id` field from GOOGLEDOCS_SEARCH_DOCUMENTS results can be used directly without conversion. |
| `quoted_file_content_value` | string | No | The quoted content itself. |
| `quoted_file_content_mime_type` | string | No | The MIME type of the quoted content. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Shared Drive

**Slug:** `GOOGLEDRIVE_CREATE_DRIVE`

Tool to create a new shared drive. Use when you need to programmatically create a new shared drive for collaboration or storage.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | The name of this shared drive. |
| `hidden` | boolean | No | Whether the shared drive is hidden from default view. |
| `themeId` | string | No | The ID of the theme from which the background image and color will be set. The set of possible driveThemes can be retrieved from a drive.about.get response. When not specified on a drive.drives.create request, a random theme is chosen from which the background image and color are set. This is a write-only field; it can only be set on requests that don't set colorRgb or backgroundImageFile. |
| `colorRgb` | string | No | The color of this shared drive as an RGB hex string. It can only be set on a drive.drives.update request that does not set themeId. |
| `requestId` | string | No | Optional. An ID for idempotent creation of a shared drive. If not provided, a UUID will be auto-generated. Each requestId can only be used ONCE to successfully create a drive. If retrying a request that succeeded previously with the same requestId, the existing drive will be returned. |
| `backgroundImageFile` | object | No | An image file and cropping parameters from which a background image for this shared drive is set. This is a write only field; it can only be set on drive.drives.update requests that don't set themeId. When specified, all fields of the backgroundImageFile must be set. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create File or Folder

**Slug:** `GOOGLEDRIVE_CREATE_FILE`

Creates a new file or folder in Google Drive. Supports both metadata-only creation (for folders and empty documents) and file upload with content. When file_to_upload is provided, uploads the actual file bytes; otherwise creates an empty file. Native Google file types (Docs, Sheets, Forms, etc.) and folders are created as empty shells when no content is provided; content must be added manually afterward. Newly created files are private by default — set sharing permissions afterward for collaboration. For shared-drive folders, use this tool with the target folder ID in `parents` rather than GOOGLEDRIVE_CREATE_FOLDER.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | The name of the file. While optional, providing a meaningful name is strongly recommended. If not specified, Google Drive will create the file with name 'Untitled'. |
| `fields` | string | No | A comma-separated list of fields to include in the response. |
| `parents` | array | No | Google Drive folder ID (not folder name) where the file will be created. Must be a list with exactly one folder ID (e.g., ['1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs07X8ygaR']). Folder IDs are long alphanumeric strings, not human-readable names. Use GOOGLEDRIVE_FIND_FOLDER or GOOGLEDRIVE_LIST_FILES to look up folder IDs by name. If omitted, the file is created in My Drive root. |
| `starred` | boolean | No | Whether the user has starred the file. |
| `mimeType` | string ("application/vnd.google-apps.folder" | "application/vnd.google-apps.document" | "application/vnd.google-apps.spreadsheet" | "application/vnd.google-apps.presentation" | "application/vnd.google-apps.drawing" | "application/vnd.google-apps.form" | "application/vnd.google-apps.script" | "application/vnd.google-apps.shortcut" | "application/vnd.google-apps.site" | "application/vnd.google-apps.map" | "application/vnd.google-apps.jam" | "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "application/vnd.oasis.opendocument.text" | "application/rtf" | "text/plain" | "text/html" | "text/markdown" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" | "application/vnd.oasis.opendocument.spreadsheet" | "text/csv" | "text/tab-separated-values" | "application/vnd.openxmlformats-officedocument.presentationml.presentation" | "application/vnd.oasis.opendocument.presentation" | "image/jpeg" | "image/png" | "image/gif" | "image/bmp" | "image/webp" | "image/svg+xml" | "image/tiff" | "video/mp4" | "video/x-msvideo" | "video/quicktime" | "video/x-ms-wmv" | "video/webm" | "audio/mpeg" | "audio/wav" | "audio/ogg" | "application/zip" | "application/vnd.rar" | "application/x-tar" | "application/gzip" | "application/x-7z-compressed" | "application/json" | "application/xml" | "application/x-yaml" | "application/epub+zip" | "application/octet-stream") | No | Common MIME types for Google Drive file creation. |
| `description` | string | No | A short description of the file. |
| `file_to_upload` | object | No | Optional file content to upload. If provided, the file will be created with the actual content from this upload. If omitted, creates an empty file (for folders) or empty Google Workspace document. Use this when you need to upload actual file bytes (images, PDFs, documents, etc.). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create a File from Text

**Slug:** `GOOGLEDRIVE_CREATE_FILE_FROM_TEXT`

Creates a new file in Google Drive from provided text content (up to 10MB), supporting various formats including automatic conversion to Google Workspace types. Returns flat metadata fields (`id`, `mimeType`, `name`) at the top level — not nested under a `file` object. Created files are private by default; use a sharing tool afterward for collaborative access. Rapid successive calls may trigger `403 rateLimitExceeded` or `429 userRateLimitExceeded`; apply exponential backoff between retries. Does not support shared-drive targets in all cases.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_name` | string | Yes | Required. Desired name for the new file on Google Drive. Also accepts 'title' or 'name' as aliases. |
| `mime_type` | string | No | MIME type for the new file, determining how Google Drive interprets its content. Must exactly match the content type — a mismatched value (e.g., `text/plain` for HTML) breaks Drive previews and downstream conversion. |
| `parent_id` | string | No | IMPORTANT: Must be a valid Google Drive folder ID that exists and you have access to. Do NOT pass folder names - only folder IDs work. If omitted, the file is created in the root of 'My Drive'. To get a folder ID from a folder name, use GOOGLEDRIVE_FIND_FOLDER first. Also accepts 'folder_id' or 'parent_folder_id' as aliases. |
| `text_content` | string | Yes | Required. Plain text content to be written into the new file. Also accepts 'content', 'body', or 'text' as aliases. Only the documented aliases (`content`, `body`, `text`) are accepted; undocumented keys like `file_content` cause an 'Invalid request data' error. Must be UTF-8 encoded. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create a folder

**Slug:** `GOOGLEDRIVE_CREATE_FOLDER`

Creates a new folder in Google Drive, optionally within an EXISTING parent folder specified by its ID or name. The parent folder MUST already exist - use GOOGLEDRIVE_FIND_FOLDER first to verify the parent exists or find its ID. Google Drive permits duplicate folder names, so always store and reuse the folder ID returned by this action rather than relying on names for future lookups.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name for the new folder. This is a required field. |
| `parent_id` | string | No | ID or exact name of an EXISTING parent folder. IMPORTANT: The parent folder MUST already exist - this action will NOT create parent folders automatically. If you need to create nested folders, first use GOOGLEDRIVE_FIND_FOLDER to verify the parent exists, or create it with a separate call. If a name is provided, the action searches for a folder with that exact name. If omitted, the folder is created in the Drive root. Must be non-trashed, accessible, and an actual folder (not a file) — shared drive root IDs are not valid. Use GOOGLEDRIVE_FIND_FOLDER to verify before calling. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Permission

**Slug:** `GOOGLEDRIVE_CREATE_PERMISSION`

Tool to create a permission for a file or shared drive. Use when you need to share a file or folder with users, groups, domains, or make it publicly accessible. **Warning:** Concurrent permissions operations on the same file are not supported; only the last update is applied.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string ("owner" | "organizer" | "fileOrganizer" | "writer" | "commenter" | "reader") | Yes | The role granted by this permission. Valid values are: owner, organizer, fileOrganizer, writer, commenter, reader. |
| `type` | string ("user" | "group" | "domain" | "anyone") | Yes | The type of the grantee. When creating a permission, if type is 'user' or 'group', you must provide an emailAddress. When type is 'domain', you must provide a domain. There isn't extra information required for 'anyone' type. |
| `domain` | string | No | The domain to which this permission refers. Required when type is 'domain'. |
| `file_id` | string | Yes | The ID of the file or shared drive. |
| `email_address` | string | No | The email address of the user or group to which this permission refers. Required when type is 'user' or 'group'. |
| `email_message` | string | No | A plain text custom message to include in the notification email. |
| `expiration_time` | string | No | The time at which this permission will expire (RFC 3339 date-time). Expiration times can only be set on user and group permissions, must be in the future, and cannot be more than a year in the future. |
| `transfer_ownership` | boolean | No | Whether to transfer ownership to the specified user and downgrade the current owner to a writer. This parameter is required as an acknowledgement of the side effect. |
| `supports_all_drives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. |
| `allow_file_discovery` | boolean | No | Whether the permission allows the file to be discovered through search. This is only applicable for permissions of type 'domain' or 'anyone'. |
| `move_to_new_owners_root` | boolean | No | This parameter will only take effect if the item is not in a shared drive and the request is attempting to transfer the ownership of the item. If set to true, the item will be moved to the new owner's My Drive root folder and all prior parents removed. If set to false, parents are not changed. |
| `send_notification_email` | boolean | No | Whether to send a notification email when sharing to users or groups. This defaults to true for users and groups, and is not allowed for other requests. It must not be disabled for ownership transfers. |
| `use_domain_admin_access` | boolean | No | Issue the request as a domain administrator; if set to true, then the requester will be granted access if the file ID parameter refers to a shared drive and the requester is an administrator of the domain to which the shared drive belongs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Permissions Batch

**Slug:** `GOOGLEDRIVE_CREATE_PERMISSIONS_BATCH`

Creates multiple permissions for files or shared drives in a single batch request. Use this action when you need to share multiple files with users, or share a single file with multiple users or groups simultaneously. Each permission in the batch can target a different file and specify different access levels. Batch operations are more efficient than creating permissions individually, with a maximum of 100 permissions per batch.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `permissions` | array | Yes | A list of permissions to create. Each permission specifies the file_id, type, role, and other details. Maximum 100 permissions per batch request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Reply

**Slug:** `GOOGLEDRIVE_CREATE_REPLY`

Tool to create a reply to a comment in Google Drive. Use when you need to respond to an existing comment on a file.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string ("resolve" | "reopen") | No | The action the reply performed to the parent comment. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. |
| `content` | string | Yes | The plain text content of the reply. HTML content is not supported. |
| `file_id` | string | Yes | The ID of the file. |
| `comment_id` | string | Yes | The ID of the comment. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Shortcut to File/Folder

**Slug:** `GOOGLEDRIVE_CREATE_SHORTCUT_TO_FILE`

Tool to create a shortcut to a file or folder in Google Drive. Use when you need to link to an existing Drive item from another location without duplicating it. The shortcut receives its own distinct file ID (capture from response). No parent folder parameter exists; use GOOGLEDRIVE_MOVE_FILE after creation to place the shortcut in the desired location.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | The name of the shortcut. |
| `target_id` | string | Yes | The ID of the file or folder that this shortcut points to. |
| `includeLabels` | string | No | A comma-separated list of IDs of labels to include in the labelInfo part of the response. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. Recommended to set to true if interacting with shared drives. |
| `keepRevisionForever` | boolean | No | Whether to set the 'keepForever' field in the new head revision. |
| `ignoreDefaultVisibility` | boolean | No | Whether to ignore the domain's default visibility settings for the created file. |
| `includePermissionsForView` | string ("published") | No | Enum for includePermissionsForView parameter. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Team Drive (Deprecated)

**Slug:** `GOOGLEDRIVE_CREATE_TEAM_DRIVE`

Tool to create a Team Drive. Deprecated: Use drives.create instead. Use when you need to create a Team Drive for collaboration.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | The name of this Team Drive. This is a required field. |
| `themeId` | string | No | The ID of the theme from which the background image and color will be set. The set of possible teamDriveThemes can be retrieved from a drive.about.get response. When not specified on a drive.teamdrives.create request, a random theme is chosen from which the background image and color are set. This is a write-only field; it can only be set on requests that don't set colorRgb or backgroundImageFile. |
| `colorRgb` | string | No | The color of this Team Drive as an RGB hex string. It can only be set on a drive.teamdrives.update request that does not set themeId. |
| `requestId` | string | No | Optional. An ID for idempotent creation of a Team Drive. If not provided, a UUID will be auto-generated. Each requestId can only be used ONCE to successfully create a Team Drive. If retrying a request that succeeded previously with the same requestId, the existing Team Drive will be returned or a 409 error will occur. |
| `backgroundImageFile` | object | No | An image file and cropping parameters from which a background image for this Team Drive is set. This is a write only field; it can only be set on drive.teamdrives.update requests that don't set themeId. When specified, all fields of the backgroundImageFile must be set. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Child (v2)

**Slug:** `GOOGLEDRIVE_DELETE_CHILD`

Tool to remove a child from a folder using Google Drive API v2. Use when you need to remove a file from a specific folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt` | string ("json" | "media" | "proto") | No | Data format for response. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token. |
| `xgafv` | string ("1" | "2") | No | V1 error format enum. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. |
| `childId` | string | Yes | The ID of the child. |
| `callback` | string | No | JSONP |
| `folderId` | string | Yes | The ID of the folder. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. "media", "multipart"). |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks. |
| `access_token` | string | No | OAuth access token. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. "raw", "multipart"). |
| `enforceSingleParent` | boolean | No | Deprecated: If an item is not in a shared drive and its last parent is removed, the item is placed under its owner's root. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Comment

**Slug:** `GOOGLEDRIVE_DELETE_COMMENT`

Permanently deletes a comment thread (and all its replies) from a Google Drive file — this action is irreversible. To remove only a single reply within a thread, use GOOGLEDRIVE_DELETE_REPLY instead. Verify the exact comment content and comment_id before calling.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file. |
| `comment_id` | string | Yes | The ID of the comment. Comment IDs are different from file IDs and have a distinct format (e.g., 'AAAByC37kko'). You must obtain the comment ID from the LIST_COMMENTS or CREATE_COMMENT actions. Do NOT use the file ID here. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Shared Drive

**Slug:** `GOOGLEDRIVE_DELETE_DRIVE`

Tool to permanently delete a shared drive. Use when you need to remove a shared drive and its contents (if specified).

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `driveId` | string | Yes | The ID of the shared drive. |
| `allowItemDeletion` | boolean | No | Whether any items inside the shared drive should also be deleted. This option is only supported when `useDomainAdminAccess` is also set to `true`. |
| `useDomainAdminAccess` | boolean | No | Issue the request as a domain administrator; if set to true, then the requester will be granted access if they are an administrator of the domain to which the shared drive belongs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete file

**Slug:** `GOOGLEDRIVE_DELETE_FILE`

DEPRECATED: Use GOOGLEDRIVE_GOOGLE_DRIVE_DELETE_FOLDER_OR_FILE_ACTION instead. Tool to permanently delete a file owned by the user without moving it to trash. Use when permanent deletion is required. If the file belongs to a shared drive, the user must be an organizer on the parent folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileId` | string | Yes | The ID of the file to delete. This permanently removes the file without moving it to trash. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. Set to true if the file might be in a shared drive. |
| `enforceSingleParent` | boolean | No | Deprecated parameter. If an item is not in a shared drive and its last parent is deleted but the item itself is not, the item is placed under its owner's root. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Parent (v2)

**Slug:** `GOOGLEDRIVE_DELETE_PARENT`

Tool to remove a parent from a file using Google Drive API v2. Use when you need to remove a file from a specific folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt` | string ("json" | "media" | "proto") | No | Data format for response. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token. |
| `xgafv` | string ("1" | "2") | No | V1 error format enum. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. |
| `fileId` | string | Yes | The ID of the file. |
| `callback` | string | No | JSONP |
| `parentId` | string | Yes | The ID of the parent. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. "media", "multipart"). |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks. |
| `access_token` | string | No | OAuth access token. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. "raw", "multipart"). |
| `enforceSingleParent` | boolean | No | Deprecated: If an item is not in a shared drive and its last parent is removed, the item is placed under its owner's root. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Permission

**Slug:** `GOOGLEDRIVE_DELETE_PERMISSION`

Deletes a permission from a file by permission ID. Deletion is irreversible — confirm the target user, group, or permission type before executing. IMPORTANT: You must first call GOOGLEDRIVE_LIST_PERMISSIONS to get valid permission IDs. To fully revoke public access, the type='anyone' (link-sharing) permission must be explicitly deleted; revoking other permissions leaves the file publicly accessible via link. Use when you need to revoke access for a specific user or group from a file.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file or shared drive. |
| `permission_id` | string | Yes | The unique ID of the permission to delete. IMPORTANT: You MUST first call GOOGLEDRIVE_LIST_PERMISSIONS with the file_id to retrieve valid permission IDs. Permission IDs are opaque identifiers assigned by Google (e.g., '18394857362947583', 'anyoneWithLink') and cannot be guessed. Do NOT use placeholder values like 'any' or '1234'. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. |
| `useDomainAdminAccess` | boolean | No | Issue the request as a domain administrator; if set to true, then the requester will be granted access if the file ID parameter refers to a shared drive and the requester is an administrator of the domain to which the shared drive belongs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Property (v2 API)

**Slug:** `GOOGLEDRIVE_DELETE_PROPERTY`

Tool to delete a property from a file using Google Drive API v2. Use when you need to remove custom key-value metadata from a file.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt` | string ("json" | "media" | "proto") | No | Data format for response. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token. |
| `xgafv` | string ("1" | "2") | No | V1 error format values. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. |
| `fileId` | string | Yes | The ID of the file. |
| `callback` | string | No | JSONP callback function name. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. 'media', 'multipart'). |
| `visibility` | string | No | The visibility of the property. If specified, only deletes the property if it has this visibility level. |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks. |
| `propertyKey` | string | Yes | The key of the property to delete. |
| `access_token` | string | No | OAuth access token. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. 'raw', 'multipart'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Reply

**Slug:** `GOOGLEDRIVE_DELETE_REPLY`

Tool to delete a specific reply by reply ID. Deletion is irreversible; obtain explicit user confirmation before calling. Removes only the targeted reply, not the full comment thread — use GOOGLEDRIVE_DELETE_COMMENT to remove the entire thread.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file. |
| `reply_id` | string | Yes | The ID of the reply. Confirm correct target using createdTime and author alongside reply_id, as multiple similar replies may exist on the same comment. |
| `comment_id` | string | Yes | The ID of the comment. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Revision

**Slug:** `GOOGLEDRIVE_DELETE_REVISION`

Tool to permanently delete a file revision. Use when you need to remove a specific version of a binary file (images, videos, etc.). Cannot delete revisions for Google Docs/Sheets or the last remaining revision.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file. |
| `revision_id` | string | Yes | The ID of the revision to delete. You can obtain revision IDs by calling GOOGLEDRIVE_LIST_REVISIONS. Important: You can only delete revisions for files with binary content (images, videos, etc.), not Google Docs or Sheets. You cannot delete the last remaining revision of a file. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Team Drive (Deprecated)

**Slug:** `GOOGLEDRIVE_DELETE_TEAM_DRIVE`

Tool to permanently delete a Team Drive. Deprecated: Use drives.delete instead. Use when you need to remove a Team Drive using the legacy endpoint.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `teamDriveId` | string | Yes | The ID of the Team Drive to delete. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Download a file from Google Drive

**Slug:** `GOOGLEDRIVE_DOWNLOAD_FILE`

Downloads a file from Google Drive by its ID. For Google Workspace documents (Docs, Sheets, Slides), optionally exports to a specified `mime_type`. For other file types, downloads in their native format regardless of mime_type. Examples: Export a Google Doc to plain text: {"file_id": "1N2o5xQWmAbCdEfGhIJKlmnOPq", "mime_type": "text/plain"} Download a Google Sheet as CSV: {"file_id": "1ZyXwVuTsRqPoNmLkJiHgFeDcB", "mime_type": "text/csv"}

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileId` | string | Yes | The unique identifier of the file to be downloaded from Google Drive. Must be a valid Google Drive file ID containing only alphanumeric characters, hyphens, and underscores. File paths with slashes (/) are not valid. This ID can typically be found in the file's URL in Google Drive or obtained from API calls that list files. |
| `mime_type` | string ("application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "application/vnd.oasis.opendocument.text" | "application/rtf" | "application/pdf" | "text/plain" | "application/zip" | "application/epub+zip" | "text/html" | "text/markdown" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" | "application/vnd.oasis.opendocument.spreadsheet" | "text/csv" | "text/tab-separated-values" | "application/vnd.openxmlformats-officedocument.presentationml.presentation" | "application/vnd.oasis.opendocument.presentation" | "image/jpeg" | "image/png" | "image/svg+xml" | "application/vnd.google-apps.script+json" | "application/vnd.google-apps.vid") | No | ONLY for Google Workspace documents (Docs, Sheets, Slides, Drawings). Specifies the export format. Has NO effect on regular files (PDFs, images, videos, Office documents, etc.) - they are always downloaded in their native format. Google Forms and Maps cannot be downloaded as they do not support exports through the Drive API. If omitted for Google Workspace files, defaults to PDF. Different Workspace types support different formats. Use application/pdf for universal compatibility. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Download file content (Deprecated)

**Slug:** `GOOGLEDRIVE_DOWNLOAD_FILE2`

DEPRECATED: Use GOOGLEDRIVE_DOWNLOAD_FILE_OPERATION instead. Tool to download file content as a long-running operation. Use when you need to download files from Google Drive. Operations are valid for 24 hours from the time of creation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file to download |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Download file via operation

**Slug:** `GOOGLEDRIVE_DOWNLOAD_FILE_OPERATION`

Tool to download file content using long-running operations. Use when you need to download Google Vids files or export Google Workspace documents as part of a long-running operation. Operations are valid for 24 hours from creation. Returns a response containing `downloaded_file_content.s3url` — a short-lived S3 URL; fetch the actual file bytes from that URL promptly after the call.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file to download. This is a required parameter. The file_id can be found in the file's Google Drive URL or obtained from API calls that list files. |
| `mime_type` | string | No | The MIME type for exporting Google Workspace documents (Google Docs, Sheets, Slides, etc.) to different formats. Only applicable to Google Workspace documents (not blob files like PDFs, images, videos). If provided for a non-Google Workspace file, this parameter will be ignored to prevent API errors. Common export formats: 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' (Word), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' (Excel). |
| `revision_id` | string | No | The ID of the revision to download. If not specified, the current head revision will be downloaded. This field can only be set when downloading blob files, Google Docs, and Google Sheets. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Edit File

**Slug:** `GOOGLEDRIVE_EDIT_FILE`

Updates an existing Google Drive file with binary content by overwriting its entire content with new text (max 10MB). IMPORTANT: This action only works with files that have binary content (text files, PDFs, images, etc.). It does NOT support editing Google Workspace native files (Google Docs, Sheets, Slides, etc.). For Google Workspace files, use the Google Docs API, Google Sheets API, or Google Slides API directly. Preserves the original file_id (unlike GOOGLEDRIVE_UPLOAD_FILE which creates a new ID).

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | Yes | New textual content to overwrite the existing file; will be UTF-8 encoded for upload. Overwrites the entire file body — partial edits are not possible, so reconstruct the full desired content before calling. Back up with GOOGLEDRIVE_COPY_FILE before irreversible edits. |
| `file_id` | string | Yes | ID of the Google Drive file to update. Only works with files that have binary content (e.g., .txt, .json, .pdf, .jpg files uploaded to Drive). Does NOT support Google Workspace native files (Docs, Sheets, Slides) even if they appear as spreadsheets or documents - those must be edited via Google Docs/Sheets/Slides APIs. Use GOOGLEDRIVE_FIND_FILE to retrieve an existing file's ID; using an upload action instead would create a duplicate with a different ID. |
| `mime_type` | string | No | MIME type of the content being uploaded. Must match the actual format of the content being uploaded (not the existing file type). Cannot be a Google Workspace MIME type (application/vnd.google-apps.*). Valid examples: text/plain, text/html, application/json, application/pdf, image/jpeg. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Empty Trash

**Slug:** `GOOGLEDRIVE_EMPTY_TRASH`

Tool to permanently and irreversibly delete ALL trashed files in the user's Google Drive or a specified shared drive. Recovery is impossible after execution — no Drive tool can restore items once trash is emptied. Affects every item in trash across the entire account or shared drive, not just files from the current workflow. Always obtain explicit user confirmation and clarify that recovery is impossible before executing. Provide driveId to target a specific shared drive's trash; omit to empty the user's root trash.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `driveId` | string | No | If set, empties the trash of the provided shared drive. This parameter is ignored if the item is not in a shared drive. |
| `enforceSingleParent` | boolean | No | Deprecated: If an item is not in a shared drive and its last parent is deleted but the item itself is not, the item will be placed under its owner's root. This parameter is ignored if the item is not in a shared drive. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Export Google Workspace file

**Slug:** `GOOGLEDRIVE_EXPORT_GOOGLE_WORKSPACE_FILE`

Exports a Google Workspace document to the requested MIME type and returns exported file content. Use when you need to export Google Docs, Sheets, Slides, Drawings, or Apps Script files to a specific format. Note: The exported content is limited to 10MB by Google Drive API.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileId` | string | Yes | The ID of the Google Workspace file to export. Must be a valid file ID for a Google Docs, Sheets, Slides, Drawings, or Apps Script file. |
| `mimeType` | string ("application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "application/vnd.oasis.opendocument.text" | "application/rtf" | "application/pdf" | "text/plain" | "application/zip" | "application/epub+zip" | "text/markdown" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" | "application/vnd.oasis.opendocument.spreadsheet" | "text/csv" | "text/tab-separated-values" | "application/vnd.openxmlformats-officedocument.presentationml.presentation" | "application/vnd.oasis.opendocument.presentation" | "image/jpeg" | "image/png" | "image/svg+xml" | "application/vnd.google-apps.script+json") | Yes | The MIME type of the format requested for this export. Supported formats depend on the source file type: Google Docs -> DOCX, ODT, RTF, PDF, TXT, HTML (ZIP), EPUB, Markdown; Google Sheets -> XLSX, ODS, PDF, CSV, TSV, HTML (ZIP); Google Slides -> PPTX, ODP, PDF, TXT, JPG, PNG, SVG; Google Drawings -> PDF, JPG, PNG, SVG; Apps Script -> JSON. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Find file

**Slug:** `GOOGLEDRIVE_FIND_FILE`

The comprehensive Google Drive search tool that handles all file and folder discovery needs. Use this for any file finding task - from simple name searches to complex queries with date filters, MIME types, permissions, custom properties, folder scoping, and more. Searches across My Drive and shared drives with full metadata support. Examples: - Find PDFs: q="mimeType = 'application/pdf'" - Find recent files: q="modifiedTime > '2024-01-01T00:00:00'" - Search by name: q="name contains 'report'" - Files in folder: folderId="abc123" or q="'FOLDER_ID' in parents"

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | Query string to filter file results. Accepts both simple text searches and full Google Drive query syntax.          **Simple Text Search:** Bare text (e.g., "SAM RFP") is auto-converted to fullText search. Bare email addresses are auto-converted to owner search.          **Full Query Syntax:** 'field operator value' combined with 'and', 'or', 'not'          **Operators:** =, !=, <, >, <=, >=, contains, in          **Common Fields:**         - `name` - File name (exact match with = or partial match with contains)         - `fullText` - File content search         - `mimeType` - File type (e.g., 'application/pdf', 'application/vnd.google-apps.folder')         - `modifiedTime`, `createdTime` - Dates (RFC 3339: '2024-01-01T00:00:00')         - `parents` - Folder IDs containing the file         - `owners`, `writers` - User email addresses (MUST use 'in' operator, NOT colon syntax)         - `properties`, `appProperties` - Custom metadata          **Boolean Filter Fields (sharedWithMe, trashed, starred):**         These fields require explicit `= true` or `= false` syntax:         - `sharedWithMe = true` - Find files shared with you by others         - `sharedWithMe = false` - Find files NOT shared with you (your own files)         - `trashed = true` - Find files in trash         - `trashed = false` - Exclude trashed files from results         - `starred = true` - Find starred/favorited files         - `starred = false` - Find non-starred files          Combine with other conditions using 'and':         - "sharedWithMe = true and name contains 'report'" - Find shared files with 'report' in name         - "sharedWithMe = true and mimeType = 'application/pdf'" - Find shared PDF files         - "starred = true and modifiedTime > '2024-01-01T00:00:00'" - Find recently modified starred files          **Query Complexity Limits:**         Queries with many OR clauses (typically >5-10) may fail with 'The query is too complex' error.          **Name Field Usage:**         Wildcards (*) are NOT supported. Use 'contains' operator for partial matching.          **User Email Searches:**         - CORRECT: "'user@example.com' in owners" or "'user@example.com' in writers" or "'user@example.com' in readers"         - INCORRECT: "owner:user@example.com" (colon syntax is NOT supported and will cause errors)         - Always use the 'in' operator with quoted email addresses for user-based searches          **Special Syntax:**         - Dates: RFC 3339 format (time zone defaults to UTC)         - Apostrophes/quotes in values: Automatically escaped. You can write "name = 'Jan'26'" or "name = 'Valentine's Day'" without manual escaping.         - Grouping: Use parentheses for OR: "(mimeType contains 'image/' or mimeType contains 'video/')"         - Custom properties: "properties has { key='department' and value='sales' }"          **IMPORTANT - Root Folder ('My Drive'):**         'My Drive' is NOT a searchable folder name. To work with the root folder, use the 'root' alias: folder_id='root' or "'root' in parents" in your query.          |
| `fields` | string | No | Selector specifying which fields to include in a partial response. Use '*' for all fields.  **Default Behavior (Recommended for Discovery):** When omitted, returns essential file discovery fields: id, name, mimeType, size, modifiedTime, createdTime, parents, webViewLink, trashed, starred. This lightweight default is optimized for file search/discovery use cases without verbose permission or capability metadata.  **Format:** For file fields, use 'files(field1,field2,...)' format. For example: 'files(id,name,mimeType)'. Top-level response fields (kind, nextPageToken, incompleteSearch) can be used directly.  **Note:** Bare field names like 'id,name,mimeType' will be automatically wrapped in 'files()' for convenience. The 'editors' field is not valid in Drive API v3; use 'permissions' instead for access control information. |
| `spaces` | string | No | A comma-separated list of spaces to query. Supported values are 'drive', 'appDataFolder' and 'photos'. |
| `corpora` | string ("user" | "drive" | "domain" | "allDrives") | No | Specifies which collections of files to search. Defaults to 'allDrives' (searches My Drive + all accessible shared drives).          **Values:**         - `user` - Search only user's personal My Drive         - `domain` - Search all files shared within Google Workspace domain         - `drive` - Search specific shared drive (requires 'driveId' parameter and 'includeItemsFromAllDrives' must be true)         - `allDrives` - Search My Drive + all accessible shared drives (DEFAULT, requires 'includeItemsFromAllDrives' to be true)          **When to Use:**         - Personal files only: Use 'user'         - Organization-wide: Use 'domain'         - Specific shared drive: Use 'drive' with 'driveId'         - Maximum coverage: Use 'allDrives' (auto-enables supportsAllDrives and includeItemsFromAllDrives)          |
| `driveId` | string | No | ID of the shared drive to search. When provided, 'corpora' will automatically be set to 'drive' (mutually exclusive with corpora='allDrives'). Required if 'corpora' is 'drive'. |
| `orderBy` | string | No | Comma-separated sort keys. Ascending by default; add 'desc' for descending. Cannot be used when query (q) contains fullText search terms.          **Valid Keys:**         - `createdTime`, `modifiedTime`, `modifiedByMeTime` - Dates         - `viewedByMeTime`, `sharedWithMeTime` - Activity dates         - `name`, `name_natural` - File name (natural: file1, file2, file10)         - `folder` - Folder hierarchy         - `quotaBytesUsed` - Storage size (NOTE: 'size' is NOT valid, use 'quotaBytesUsed')         - `starred` - Starred status         - `recency` - Recent activity (combines view time and modification time for relevance-based sorting)          **Important:** 'size' is NOT a valid sort key. Use 'quotaBytesUsed' to sort by file size.          **Restriction:** Sorting is not supported when the query contains fullText searches (e.g., "fullText contains 'keyword'"). Omit orderBy when using fullText queries.          |
| `pageSize` | integer | No | The maximum number of files to return per page. |
| `folder_id` | string | No | ID of a specific folder to search within. This automatically adds "'folder_id' in parents" to the query. Can be combined with the 'q' parameter to further filter results within the folder. Use 'root' to search within the user's root folder (My Drive). Note: 'My Drive' is not a searchable folder name - use 'root' alias instead. |
| `pageToken` | string | No | The token for continuing a previous list request on the next page. IMPORTANT: This must be the exact opaque string from a previous response's 'nextPageToken' field - do not modify, truncate, URL-encode, or construct tokens manually. Invalid or corrupted tokens will result in API errors. |
| `include_labels` | string | No | A comma-separated list of label IDs to include in the `labelInfo` part of the response for each file. Empty strings are automatically treated as omitted. |
| `pagetoken_dropped` | boolean | No | Indicates whether the page token was dropped from the request. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. If 'includeItemsFromAllDrives' is true, this must also be true. |
| `original_email_query` | string | No | The original email query before transformation. |
| `editors_field_removed` | boolean | No | Indicates whether the editors field was removed from the request. |
| `email_query_transformed` | boolean | No | Indicates whether an email query was transformed into a search filter. |
| `orderby_size_transformed` | boolean | No | Indicates whether the orderBy size value was transformed. |
| `original_bare_text_query` | string | No | The original bare text query before transformation. |
| `includeItemsFromAllDrives` | boolean | No | Whether both My Drive and shared drive items should be included in results. Must be true when corpora is 'drive' or 'allDrives'. If true, 'supportsAllDrives' should also be true. |
| `emailaddress_field_removed` | boolean | No | Indicates whether the email address field was removed from the request. |
| `original_invalid_pagetoken` | string | No | The original invalid page token that was dropped. |
| `bare_text_query_transformed` | boolean | No | Indicates whether a bare text query was transformed into a search filter. |
| `include_permissions_for_view` | string | No | Specifies which additional view's permissions to include in the response. Must be either omitted entirely or set to 'published'. Empty strings are automatically treated as omitted. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Find folder

**Slug:** `GOOGLEDRIVE_FIND_FOLDER`

Tool to find a folder in Google Drive by its name and optionally a parent folder. Use when you need to locate a specific folder to perform further actions like creating files in it or listing its contents.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `starred` | boolean | No | Set to true to search for folders that are starred, or false for those that are not. |
| `name_exact` | string | No | The exact name of the folder to search for as a string. This search is case-sensitive. Do not pass numbers - convert to string if needed. |
| `name_contains` | string | No | A substring to search for within folder names as a string. This search is case-insensitive. |
| `modified_after` | string | No | Search for folders modified after a specific date and time. The timestamp must be in RFC 3339 format (e.g., '2023-01-15T10:00:00Z' or '2023-01-15T10:00:00.000Z'). |
| `parent_folder_id` | string | No | The ID of the parent folder to search within. Only folders directly inside this parent folder will be returned. You can find parent folder IDs by first searching for the parent folder by name. Supports folders in both My Drive and Shared Drives. |
| `name_not_contains` | string | No | A substring to exclude from folder names as a string. Folders with names containing this substring will not be returned. This search is case-insensitive. |
| `full_text_contains` | string | No | A string to search for within the folder's name or description (NOT the content of files inside the folder). This search is case-insensitive. Note: Google Drive's fullText search on folders only matches the folder's own metadata, not files contained within. |
| `full_text_not_contains` | string | No | A string to exclude from the folder's name or description (NOT the content of files inside the folder). This search is case-insensitive. Note: Google Drive's fullText search on folders only matches the folder's own metadata, not files contained within. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Generate File IDs

**Slug:** `GOOGLEDRIVE_GENERATE_IDS`

Generates a set of file IDs which can be provided in create or copy requests. Use when you need to pre-allocate IDs for new files or copies.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | The type of items for which the IDs can be used. For example, 'files' or 'shortcuts'. |
| `count` | integer | No | The number of IDs to return. Value must be between 1 and 1000, inclusive. |
| `space` | string | No | The space in which the IDs can be used. Supported values are 'drive' and 'appDataFolder'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get about

**Slug:** `GOOGLEDRIVE_GET_ABOUT`

Tool to retrieve information about the user, the user's Drive, and system capabilities. Use when you need to check storage quotas, user details, or supported import/export formats. Note: storageQuota reflects My Drive (personal) storage only — it does not cover shared drives; use GOOGLEDRIVE_LIST_SHARED_DRIVES and GOOGLEDRIVE_GET_DRIVE for shared drive quotas. A successful response confirms base Drive read access only; write access and shared drive access must be verified separately.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | string | No | A comma-separated list of fields to include in the response. Use `*` to include all fields. Supported fields in Drive API v3: kind, user, storageQuota, importFormats, exportFormats, maxImportSizes, maxUploadSize, appInstalled, canCreateDrives, canCreateTeamDrives (deprecated), driveThemes, teamDriveThemes (deprecated), folderColorPalette. Note: rootFolderId was removed in v3 and is not supported. Note: storageQuota sub-fields (limit, usage, usageInDrive, usageInDriveTrash) are returned as strings representing bytes — convert to numeric types before arithmetic. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get App

**Slug:** `GOOGLEDRIVE_GET_APP`

Tool to get information about a specific Drive app by ID. Use 'self' as the app ID to get information about the calling app.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `appId` | string | Yes | The ID of the app. Use 'self' to refer to the calling app. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Change (v2 - Deprecated)

**Slug:** `GOOGLEDRIVE_GET_CHANGE`

Tool to get a specific change by ID from Google Drive v2 API. Deprecated: Use changes.getStartPageToken and changes.list to retrieve recent changes instead.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt` | string ("json" | "media" | "proto") | No | Data format for response. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token. |
| `xgafv` | string ("1" | "2") | No | V1 error format. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. |
| `driveId` | string | No | The shared drive from which the change will be returned. |
| `callback` | string | No | JSONP |
| `changeId` | string | Yes | The ID of the change. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. 'media', 'multipart'). |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks. |
| `teamDriveId` | string | No | Deprecated: Use `driveId` instead. |
| `access_token` | string | No | OAuth access token. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. 'raw', 'multipart'). |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. |
| `supportsTeamDrives` | boolean | No | Deprecated: Use `supportsAllDrives` instead. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Changes Start Page Token

**Slug:** `GOOGLEDRIVE_GET_CHANGES_START_PAGE_TOKEN`

Tool to get the starting pageToken for listing future changes in Google Drive. Returns only a token — pass it to GOOGLEDRIVE_LIST_CHANGES to retrieve actual changes. Persist this token; losing it requires a full rescan. The token is forward-looking: GOOGLEDRIVE_LIST_CHANGES may return no results if no changes have occurred since issuance. For simple recent-file lookups, prefer GOOGLEDRIVE_FIND_FILE; use this tool only for incremental change-feed workflows.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `driveId` | string | No | The ID of the shared drive for which the starting pageToken for listing future changes from that shared drive will be returned. |
| `teamDriveId` | string | No | Deprecated: Use driveId instead. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. Defaults to false. |
| `supportsTeamDrives` | boolean | No | Deprecated: Use supportsAllDrives instead. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Child Reference (v2)

**Slug:** `GOOGLEDRIVE_GET_CHILD`

Tool to get a specific child reference for a folder using Drive API v2. Use when you need to verify a specific file exists as a child of a folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt` | string ("json" | "media" | "proto") | No | Data format for response. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token. |
| `xgafv` | string ("1" | "2") | No | V1 error format options. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. |
| `childId` | string | Yes | The ID of the child. |
| `callback` | string | No | JSONP callback parameter. |
| `folderId` | string | Yes | The ID of the folder. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. 'media', 'multipart'). |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks. |
| `access_token` | string | No | OAuth access token. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. 'raw', 'multipart'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Comment

**Slug:** `GOOGLEDRIVE_GET_COMMENT`

Tool to get a comment by ID. Use when you need to retrieve a specific comment from a Google Drive file and have both the file ID and comment ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileId` | string | Yes | The ID of the file. |
| `commentId` | string | Yes | The ID of the comment. |
| `includeDeleted` | boolean | No | Whether to return deleted comments. Deleted comments will not include their original content. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Shared Drive

**Slug:** `GOOGLEDRIVE_GET_DRIVE`

Tool to get a shared drive by ID. Use when you need to retrieve information about a specific shared drive. To discover drive_ids, use GOOGLEDRIVE_LIST_SHARED_DRIVES first; GOOGLEDRIVE_GET_ABOUT reflects overall user storage, not individual shared drive details. Permission changes may have a brief propagation delay before appearing in results.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `drive_id` | string | Yes | The ID of the shared drive. |
| `use_domain_admin_access` | boolean | No | Issue the request as a domain administrator; if set to true, then the requester will be granted access if they are an administrator of the domain to which the shared drive belongs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get File Metadata

**Slug:** `GOOGLEDRIVE_GET_FILE_METADATA`

Tool to get a file's metadata by ID. Use to verify `mimeType`, `parents`, and `trashed` status before destructive operations (delete/move/export), or to confirm `mimeType='application/vnd.google-apps.document'` before calling GOOGLEDOCS_* tools (non-native files require GOOGLEDRIVE_DOWNLOAD_FILE). Only returns metadata visible to the connected account; public access requires GOOGLEDRIVE_ADD_FILE_SHARING_PREFERENCE. High-frequency calls risk `403 rateLimitExceeded`; apply exponential backoff.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | string | No | Comma-separated list of fields to include in the response. Use this for partial responses to request only specific metadata fields. Common fields: id, name, mimeType, webViewLink, webContentLink, createdTime, modifiedTime, size, quotaBytesUsed, parents, owners, permissions. Use '*' to return all available fields. Note: The deprecated v2 field 'alternateLink' is automatically migrated to 'webViewLink'. Example: 'id,name,mimeType,webViewLink,createdTime,modifiedTime'. Most fields (webViewLink, parents, owners, size, modifiedTime, etc.) are omitted by default — explicitly list required fields or use '*' (increases latency). `md5Checksum` is null for native Google Workspace files (Docs/Sheets/Slides); use `mimeType` to classify items — folders use `mimeType='application/vnd.google-apps.folder'` and Workspace files return `size=null`. `modifiedTime` is RFC 3339 UTC format. |
| `fileId` | string | Yes | The Google Drive file ID (an opaque alphanumeric string like '1a2b3c4d5e6f7g8h9i0j'), NOT a file name. If you only have a file name, use GOOGLEDRIVE_FIND_FILE or GOOGLEDRIVE_LIST_FILES to get the file ID first. |
| `includeLabels` | string | No | A comma-separated list of IDs of labels to include in the labelInfo part of the response. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. Defaults to true to ensure files in shared drives are accessible. |
| `includePermissionsForView` | string | No | Specifies which additional view's permissions to include in the response. Only 'published' is supported. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Property (v2)

**Slug:** `GOOGLEDRIVE_GET_FILE_PROPERTY`

Tool to get a property by its key using Google Drive API v2. Use when you need to retrieve a specific custom property attached to a file.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileId` | string | Yes | The ID of the file. |
| `visibility` | string | No | The visibility of the property. Allowed values are PRIVATE (default) and PUBLIC. Private properties can only be retrieved using an authenticated request. |
| `propertyKey` | string | Yes | The key of the property. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get File (v2 API) (Deprecated)

**Slug:** `GOOGLEDRIVE_GET_FILE_V2`

DEPRECATED: Use GetFileMetadata instead. Tool to get a file's metadata or content by ID from Google Drive API v2. Use when you need file metadata with alt=json, or file content with alt=media.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt` | string ("json" | "media" | "proto") | No | Data format for response. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token. |
| `xgafv` | string ("1" | "2") | No | V1 error format values. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. |
| `fileId` | string | Yes | The ID for the file in question. This is a required parameter and cannot be empty. |
| `callback` | string | No | JSONP callback function name. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `projection` | string ("BASIC" | "FULL") | No | Projection parameter values (deprecated). |
| `revisionId` | string | No | Specifies the Revision ID that should be downloaded. Ignored unless alt=media is specified. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. 'media', 'multipart'). |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks. |
| `access_token` | string | No | OAuth access token. |
| `includeLabels` | string | No | A comma-separated list of IDs of labels to include in the labelInfo part of the response. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. 'raw', 'multipart'). |
| `acknowledgeAbuse` | boolean | No | Whether the user is acknowledging the risk of downloading known malware or other abusive files. |
| `updateViewedDate` | boolean | No | Deprecated: Use files.update with modifiedDateBehavior=noChange, updateViewedDate=true and an empty request body. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. |
| `supportsTeamDrives` | boolean | No | Deprecated: Use supportsAllDrives instead. |
| `includePermissionsForView` | string | No | Specifies which additional view's permissions to include in the response. Only 'published' is supported. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Parent Reference (v2)

**Slug:** `GOOGLEDRIVE_GET_PARENT`

Tool to get a specific parent reference for a file using Drive API v2. Use when you need to retrieve information about a specific parent folder of a file.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt` | string ("json" | "media" | "proto") | No | Data format for response. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token. |
| `xgafv` | string ("1" | "2") | No | V1 error format options. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. |
| `fileId` | string | Yes | The ID of the file. |
| `callback` | string | No | JSONP callback parameter. |
| `parentId` | string | Yes | The ID of the parent. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. 'media', 'multipart'). |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks. |
| `access_token` | string | No | OAuth access token. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. 'raw', 'multipart'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Permission

**Slug:** `GOOGLEDRIVE_GET_PERMISSION`

Gets a permission by ID. Use this tool to retrieve a specific permission for a file or shared drive. Newly created or updated permissions on shared drives may have a brief propagation delay before appearing.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | string | No | Selector specifying which fields to include in a partial response. Use 'fields=*' to return all available fields for the permission resource. |
| `file_id` | string | Yes | The ID of the file. |
| `permission_id` | string | Yes | The numeric ID of the permission. Note: The 'me' alias is NOT supported by the Google Drive permissions API. You must provide an actual numeric permission ID (e.g., '12345678901234567890'). Use the LIST_PERMISSIONS action to get permission IDs for a file. |
| `supports_all_drives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. |
| `use_domain_admin_access` | boolean | No | Issue the request as a domain administrator; if set to true, then the requester will be granted access if the file ID parameter refers to a shared drive and the requester is an administrator of the domain to which the shared drive belongs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Permission ID for Email

**Slug:** `GOOGLEDRIVE_GET_PERMISSION_ID_FOR_EMAIL`

Tool to get the permission ID for an email address using the Drive API v2. Use when you need to convert an email address to its corresponding permission ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt` | string ("json" | "media" | "proto") | No | Data format for response. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token. |
| `email` | string | Yes | The email address for which to return a permission ID |
| `xgafv` | string ("1" | "2") | No | V1 error format options. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. |
| `callback` | string | No | JSONP callback parameter. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. 'media', 'multipart'). |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks. |
| `access_token` | string | No | OAuth access token. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. 'raw', 'multipart'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Reply

**Slug:** `GOOGLEDRIVE_GET_REPLY`

Tool to get a specific reply to a comment on a file. Use when you need to retrieve the details of a particular reply.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileId` | string | Yes | The ID of the file. |
| `replyId` | string | Yes | The ID of the reply. |
| `commentId` | string | Yes | The ID of the comment. |
| `includeDeleted` | boolean | No | Whether to return deleted replies. Deleted replies will not include their original content. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Revision

**Slug:** `GOOGLEDRIVE_GET_REVISION`

Tool to get a specific revision's metadata (name, modifiedTime, keepForever, etc.) by revision ID. Returns metadata only — not file content. Use a separate download tool to retrieve file content or restore a revision.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file. |
| `revision_id` | string | Yes | The ID of the revision. |
| `acknowledge_abuse` | boolean | No | Whether the user is acknowledging the risk of downloading known malware or other abusive files. This is only applicable when the alt parameter is set to media and the user is the owner of the file or an organizer of the shared drive in which the file resides. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Team Drive (Deprecated)

**Slug:** `GOOGLEDRIVE_GET_TEAM_DRIVE`

Tool to get metadata about a Team Drive by ID. Deprecated: Use the drives.get endpoint instead.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `teamDriveId` | string | Yes | The ID of the Team Drive |
| `useDomainAdminAccess` | boolean | No | Issue the request as a domain administrator; if set to true, then the requester will be granted access if they are an administrator of the domain to which the Team Drive belongs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete folder or file

**Slug:** `GOOGLEDRIVE_GOOGLE_DRIVE_DELETE_FOLDER_OR_FILE_ACTION`

Tool to delete a file or folder in Google Drive. Use when you need to permanently remove a specific file or folder using its ID. Note: This action is irreversible. Deleting a folder permanently removes all nested files and subfolders.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileId` | string | Yes | The ID of the file or folder to delete. This is a required field. |
| `supportsAllDrives` | boolean | No | Whether the application supports both My Drives and shared drives. If false or unspecified, the file is attempted to be deleted from the user's My Drive. If true, the item will be deleted from shared drives as well if necessary. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Hide Shared Drive

**Slug:** `GOOGLEDRIVE_HIDE_DRIVE`

Tool to hide a shared drive from the default view. Use when you want to remove a shared drive from the user's main Google Drive interface without deleting it.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `drive_id` | string | Yes | The ID of the shared drive. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Insert Child Into Folder (v2)

**Slug:** `GOOGLEDRIVE_INSERT_CHILD`

Tool to insert a file into a folder using Drive API v2. Use when you need to add an existing file to a folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The ID of the child file to insert into the folder. |
| `alt` | string ("json" | "media" | "proto") | No | Data format for response. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token. |
| `xgafv` | string ("1" | "2") | No | V1 error format options. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. |
| `callback` | string | No | JSONP callback parameter. |
| `folderId` | string | Yes | The ID of the folder. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. 'media', 'multipart'). |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks. |
| `access_token` | string | No | OAuth access token. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. 'raw', 'multipart'). |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. |
| `supportsTeamDrives` | boolean | No | Deprecated: Use supportsAllDrives instead. |
| `enforceSingleParent` | boolean | No | Deprecated: Adding files to multiple folders is no longer supported. Use shortcuts instead. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Access Proposals

**Slug:** `GOOGLEDRIVE_LIST_ACCESS_PROPOSALS`

Tool to list pending access proposals on a file. Use when you need to retrieve access proposals for a specific file. Note: Only approvers can list access proposals; non-approvers will receive a 403 error.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileId` | string | Yes | The ID of the file to list access proposals for |
| `pageSize` | integer | No | The number of results per page |
| `pageToken` | string | No | The continuation token on the list of access requests |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Approvals

**Slug:** `GOOGLEDRIVE_LIST_APPROVALS`

Tool to list approvals on a file for workflow-based access control. Use when you need to retrieve all approvals associated with a specific file in Google Drive.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileId` | string | Yes | The ID of the file to list approvals for |
| `pageSize` | integer | No | The maximum number of approvals to return per page |
| `pageToken` | string | No | A pagination token returned as 'nextPageToken' from a previous list approvals response. Must be an exact, unmodified token from a prior API call - do not construct, encode, or guess token values. Only provide this parameter when paginating through results. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Changes

**Slug:** `GOOGLEDRIVE_LIST_CHANGES`

Tool to list the changes for a user or shared drive. Use when a full incremental change feed is needed (for simple recent-file lookups, prefer GOOGLEDRIVE_FIND_FILE instead). Tracks modifications such as creations, deletions, or permission changes. The pageToken is optional - if not provided, the current start page token will be automatically fetched; an empty result is valid if no recent activity has occurred. Example usage: ```json { "pageToken": "22633", "pageSize": 100, "includeRemoved": true } ``` Returns changes with timestamps, file IDs, and modification details. Paginate by following `nextPageToken` until it is absent — stopping early will silently omit changes. Save `newStartPageToken` to monitor future changes efficiently.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `spaces` | string | No | A comma-separated list of spaces to query within the corpora. Supported values are 'drive' and 'appDataFolder'. |
| `driveId` | string | No | The shared drive from which changes will be returned. If specified the change IDs will be reflective of the shared drive; use the combined drive ID and change ID as an identifier. When driveId is provided, supportsAllDrives is automatically set to true. |
| `pageSize` | integer | No | The maximum number of changes to return per page. |
| `pageToken` | string | No | The token for continuing a previous list request on the next page. Must be a valid token from a previous LIST_CHANGES response's 'nextPageToken' field or from the get_changes_start_page_token action. If not provided, the current start page token will be automatically fetched and used. Tokens can become stale — always use a fresh token from GOOGLEDRIVE_GET_CHANGES_START_PAGE_TOKEN or the most recent prior response to avoid missed or duplicate changes. Paginate until nextPageToken is absent; stopping early silently omits changes. |
| `includeLabels` | string | No | A comma-separated list of IDs of labels to include in the `labelInfo` part of the response. |
| `includeRemoved` | boolean | No | Whether to include changes indicating that items have been removed from the list of changes, for example by deletion or loss of access. |
| `restrictToMyDrive` | boolean | No | Whether to restrict the results to changes inside the My Drive hierarchy. This omits changes to files such as those in the Application Data folder or shared files which have not been added to My Drive. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. Must be true when driveId is specified (will be automatically set to true when driveId is provided). |
| `includeCorpusRemovals` | boolean | No | Whether changes should include the file resource if the file is still accessible by the user at the time of the request, even when a file was removed from the list of changes and there will be no further change entries for this file. Note: When set to true, includeRemoved must also be true (will be automatically set). |
| `includeItemsFromAllDrives` | boolean | No | Whether both My Drive and shared drive items should be included in results. Must be true when driveId is specified (will be automatically set to true when driveId is provided). |
| `includePermissionsForView` | string | No | Specifies which additional view's permissions to include in the response. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Folder Children (v2)

**Slug:** `GOOGLEDRIVE_LIST_CHILDREN_V2`

Tool to list a folder's children using Google Drive API v2. Use when you need to retrieve all files and folders within a specific folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | Query string for searching children. |
| `alt` | string ("json" | "media" | "proto") | No | Data format for response enum. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token. |
| `xgafv` | string ("1" | "2") | No | V1 error format enum. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. This endpoint returns ChildReference objects, NOT full File objects. Valid ChildReference fields are: 'id' (child ID), 'selfLink' (link to this reference), 'kind' (resource type), 'childLink' (link to the child). File-level fields like 'title', 'modifiedDate', 'fileSize', 'alternateLink', 'mimeType' are NOT valid. Example: 'items(id,childLink),nextPageToken' |
| `orderBy` | string | No | A comma-separated list of sort keys. Valid keys are 'createdDate', 'folder', 'lastViewedByMeDate', 'modifiedByMeDate', 'modifiedDate', 'quotaBytesUsed', 'recency', 'sharedWithMeDate', 'starred', and 'title'. Each key sorts ascending by default, but may be reversed with the 'desc' modifier. Example usage: ?orderBy=folder,modifiedDate desc,title. |
| `callback` | string | No | JSONP callback parameter. |
| `folderId` | string | Yes | The ID of the folder. |
| `pageToken` | string | No | Page token for children. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `maxResults` | integer | No | Maximum number of children to return. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. 'media', 'multipart'). |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks. |
| `access_token` | string | No | OAuth access token. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. 'raw', 'multipart'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Comments

**Slug:** `GOOGLEDRIVE_LIST_COMMENTS`

Tool to list all comments for a file in Google Drive. Results are paginated; iterate using nextPageToken until absent to retrieve all comments. Filtering by author, content, or other criteria must be done client-side. Use commentId, createdTime, and author from results to uniquely identify comments before acting on them.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | string | No | A comma-separated list of fields to include in the response. Use `*` to include all fields. Prefer selective field masks (e.g., 'comments(id,content,author)') over '*' to reduce payload size and latency. |
| `fileId` | string | Yes | The ID of the file. Equivalent to the Google Docs document_id; pass it here under the fileId parameter name. |
| `pageSize` | integer | No | The maximum number of comments to return per page. |
| `pageToken` | string | No | The token for continuing a previous list request on the next page. This should be set to the value of 'nextPageToken' from the previous response. Comments may be added or modified during pagination on active files; use startModifiedTime to bound the window if consistency is required. |
| `includeDeleted` | boolean | No | Whether to include deleted comments. Deleted comments will not include their original content. |
| `startModifiedTime` | string | No | The minimum value of 'modifiedTime' for the result comments (RFC 3339 date-time). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List File Labels

**Slug:** `GOOGLEDRIVE_LIST_FILE_LABELS`

Tool to list the labels already applied to a file in Google Drive. An empty labels array is a valid response indicating no labels are applied, not an error. This tool shows only applied labels; label_id and field_id values required by other Drive label tools must be obtained from admin configuration.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file. |
| `page_token` | string | No | Token to retrieve a specific page of results. |
| `max_results` | integer | No | The maximum number of labels to return per page. Default is 100. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Properties (v2 API)

**Slug:** `GOOGLEDRIVE_LIST_FILE_PROPERTIES`

Tool to list a file's properties in Google Drive API v2. Use when you need to retrieve custom properties (key-value pairs) attached to a file.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt` | string ("json" | "media" | "proto") | No | Data format for response. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token. |
| `xgafv` | string ("1" | "2") | No | V1 error format values. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. |
| `fileId` | string | Yes | The ID of the file. This is a required parameter and cannot be empty. |
| `callback` | string | No | JSONP callback function name. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. 'media', 'multipart'). |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks. |
| `access_token` | string | No | OAuth access token. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. 'raw', 'multipart'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Files and Folders (Deprecated)

**Slug:** `GOOGLEDRIVE_LIST_FILES`

DEPRECATED: Use GOOGLEDRIVE_FIND_FILE instead. Tool to list a user's files and folders in Google Drive. Use this to search or browse for files and folders based on various criteria.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | A query string for filtering the file results. Supports operators 'and', 'or', 'not'. VALID query terms: 'name' (contains, =, !=), 'fullText' (contains), 'mimeType' (contains, =, !=), 'modifiedTime' (<=, <, =, !=, >, >=), 'viewedByMeTime' (<=, <, =, !=, >, >=), 'trashed' (=, !=), 'starred' (=, !=), 'parents' (in), 'owners' (in), 'writers' (in), 'readers' (in), 'sharedWithMe' (=, !=), 'createdTime' (<=, <, =, !=, >, >=), 'properties' (has), 'appProperties' (has), 'visibility' (=, !=), 'shortcutDetails.targetId' (=, !=). IMPORTANT: 'id' is NOT a valid query term - you cannot search by file ID using this parameter. To get a specific file by ID, use the 'Get File Metadata' action instead. Example: "name contains 'important' and mimeType = 'application/vnd.google-apps.folder'". |
| `fields` | string | No | Selector specifying which file fields to include in the response. Provide a comma-separated list of file field names (e.g., 'id,name,mimeType,webViewLink'). The action will automatically format this into the proper API format 'files(field1,field2,...)'. Common file fields include: id, name, description, mimeType, webViewLink, webContentLink, size, createdTime, modifiedTime, parents, owners, permissions. To also include the pagination token, add 'nextPageToken' to the list. NOTE: Google Drive API v2 field names are automatically converted to v3 equivalents (e.g., alternateLink→webViewLink, downloadUrl→webContentLink, title→name, createdDate→createdTime, modifiedDate→modifiedTime). |
| `spaces` | string | No | A comma-separated list of spaces to query within the corpora. Supported values are 'drive' and 'appDataFolder'. 'drive' represents files in My Drive and shared drives, while 'appDataFolder' represents the application's private data folder. |
| `corpora` | string | No | Specifies the bodies of items (files/documents) to which the query applies. Supported values are 'user', 'domain', 'drive', and 'allDrives'. It's generally more efficient to use 'user' or 'drive' instead of 'allDrives'. Defaults to 'user'. |
| `driveId` | string | No | The ID of the shared drive to search. This is used when `corpora` is set to 'drive'. |
| `orderBy` | string | No | A comma-separated list of sort keys. Valid keys are: 'createdTime', 'folder', 'modifiedByMeTime', 'modifiedTime', 'name', 'name_natural', 'quotaBytesUsed', 'recency', 'sharedWithMeTime', 'starred', 'viewedByMeTime'. IMPORTANT: Use 'quotaBytesUsed' to sort by file size (do NOT use 'size' - it is not a valid key). Each key sorts in ascending order by default, but can be reversed with the 'desc' modifier (e.g., 'modifiedTime desc'). |
| `folderId` | string | No | ID of a specific folder to list files from. This is a convenience parameter that automatically adds "'folder_id' in parents" to the query. Cannot be used together with a custom 'q' parameter. |
| `pageSize` | integer | No | The maximum number of files to return per page. The value must be between 1 and 1000, inclusive. Defaults to 100. |
| `pageToken` | string | No | The token for continuing a previous list request on the next page. This MUST be set to the value of 'nextPageToken' from the previous response. Do not manually construct or modify pageToken values as they are opaque tokens generated by the API. If the token is rejected, pagination should be restarted from the first page. |
| `includeLabels` | string | No | A comma-separated list of label IDs to include in the `labelInfo` part of the response for each file. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. Defaults to false. If true, then `includeItemsFromAllDrives` can be used to extend the search to all drives. |
| `includeItemsFromAllDrives` | boolean | No | Whether to include items from both My Drive and shared drives. This is relevant when `corpora` is 'user' or 'domain'. Defaults to false. |
| `includePermissionsForView` | string | No | Include additional permissions for a specific view. The only valid value is 'published', which includes permissions for files with published content. Omit this parameter if you don't need published view permissions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Permissions

**Slug:** `GOOGLEDRIVE_LIST_PERMISSIONS`

Tool to list a file's permissions. Use when you need to retrieve all permissions associated with a specific file or shared drive.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileId` | string | Yes | The ID of the file or shared drive. Must be a non-empty string. |
| `pageSize` | integer | No | The maximum number of permissions to return per page. When not set for files in a shared drive, at most 100 results will be returned. When not set for files that are not in a shared drive, the entire list will be returned. |
| `pageToken` | string | No | The token for continuing a previous list request on the next page. This should be set to the value of 'nextPageToken' from the previous response. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. Default: false |
| `useDomainAdminAccess` | boolean | No | Issue the request as a domain administrator; if set to true, then theRequester will be granted access if the file ID parameter refers to a shared drive and the requester is an administrator of the domain to which the shared drive belongs. |
| `includePermissionsForView` | string | No | Specifies which additional view's permissions to include in the response. Only 'published' is supported. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Replies to Comment

**Slug:** `GOOGLEDRIVE_LIST_REPLIES`

Tool to list replies to a comment in Google Drive. Use this when you need to retrieve all replies associated with a specific comment on a file.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | string | No | Selector specifying which fields to include in a partial response. Use '*' for all fields or e.g. 'replies(id,content),nextPageToken' |
| `file_id` | string | Yes | The ID of the file. |
| `page_size` | integer | No | The maximum number of replies to return per page. |
| `comment_id` | string | Yes | The ID of the comment. |
| `page_token` | string | No | The token for continuing a previous list request on the next page. This should be set to the value of 'nextPageToken' from the previous response. |
| `include_deleted` | boolean | No | Whether to include deleted replies. Deleted replies will not include their original content. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List File Revisions

**Slug:** `GOOGLEDRIVE_LIST_REVISIONS`

Tool to list a file's revision metadata (not content) in Google Drive. Drive may prune old revisions, so history may be incomplete for frequently edited files. Filter client-side for specific revisionIds; do not assume the last entry is the active version.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileId` | string | Yes | The ID of the file. |
| `pageSize` | integer | No | The maximum number of revisions to return per page. |
| `pageToken` | string | No | The token for continuing a previous list request on the next page. This should be set to the value of 'nextPageToken' from the previous response. Continue paginating until `nextPageToken` is absent; stopping early silently omits revisions. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. Defaults to false. Must be set to `true` for shared drive files; omitting it causes `fileId` resolution failures on shared drives. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Shared Drives

**Slug:** `GOOGLEDRIVE_LIST_SHARED_DRIVES`

Tool to list the user's shared drives. Use when you need to get a list of all shared drives accessible to the authenticated user. Results may differ from the web UI due to admin policies; listing a drive does not guarantee access to its contents. Paginated calls may trigger 403 rateLimitExceeded or 429 tooManyRequests; apply exponential backoff when iterating many pages.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | Query string for searching shared drives using Google Drive query syntax (e.g., "name contains 'ProjectX'" or "createdTime > '2023-01-01T00:00:00'"). Query format: query_term operator values. Common query terms: name, createdTime, memberCount, organizerCount, hidden. Common operators: contains, =, >, <, >=, !=. String values must be enclosed in single quotes. Special characters (apostrophes, backslashes) must be escaped. Multiple terms can be combined with 'and'/'or' operators and parentheses for grouping. |
| `pageSize` | integer | No | Maximum number of shared drives to return per page. Maximum allowed value is 1000. Paginate by passing the returned nextPageToken back as pageToken until no nextPageToken is returned to avoid silently missing drives. |
| `pageToken` | string | No | Page token for shared drives. |
| `useDomainAdminAccess` | boolean | No | Issue the request as a domain administrator. If set to true, then all shared drives of the domain in which the requester is an administrator are returned. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Team Drives (Deprecated)

**Slug:** `GOOGLEDRIVE_LIST_TEAM_DRIVES`

Tool to list Team Drives (deprecated, use List Shared Drives instead). Use when you need to retrieve Team Drives using the legacy endpoint.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | Query string for searching Team Drives. |
| `alt` | string ("json" | "media" | "proto") | No | Data format for response. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. |
| `xgafv` | string ("1" | "2") | No | V1 error format values. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. |
| `callback` | string | No | JSONP callback. |
| `pageSize` | integer | No | Maximum number of Team Drives to return per page. |
| `pageToken` | string | No | Page token for Team Drives. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. 'media', 'multipart'). |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks. |
| `access_token` | string | No | OAuth access token. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. 'raw', 'multipart'). |
| `useDomainAdminAccess` | boolean | No | Issue the request as a domain administrator; if set to true, then all Team Drives of the domain in which the requester is an administrator are returned. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Modify File Labels

**Slug:** `GOOGLEDRIVE_MODIFY_FILE_LABELS`

Modifies the set of labels applied to a file. Returns a list of the labels that were added or modified. Use when you need to programmatically change labels on a Google Drive file, such as adding, updating, or removing them.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `kind` | string | No | This is always drive#modifyLabelsRequest. |
| `file_id` | string | Yes | The ID of the file. |
| `label_modifications` | array | Yes | The list of modifications to apply to the labels on the file. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Move File

**Slug:** `GOOGLEDRIVE_MOVE_FILE`

Tool to move a file from one folder to another in Google Drive. To truly move (not just copy the parent), always provide both `add_parents` (destination folder ID) and `remove_parents` (source folder ID); omitting `remove_parents` leaves the file in multiple folders. Useful for reorganizing files, including newly created Google Docs/Sheets that default to Drive root.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file to move. Must be a non-empty string. |
| `add_parents` | string | No | The ID of the single destination folder (e.g., '1FmTIJYwTENUDXOKyNJp7OmcRBvP_6DmT'). Must be a valid Google Drive folder ID consisting of alphanumeric characters, hyphens, and underscores. Folder names are not accepted. |
| `ocr_language` | string | No | A language hint for OCR processing during image import (ISO 639-1 code). |
| `include_labels` | string | No | A comma-separated list of IDs of labels to include in the `labelInfo` part of the response. |
| `remove_parents` | string | No | A comma-separated list of parent folder IDs to remove the file from. Use this to specify the source folder. |
| `supports_all_drives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. Set to true if moving files to or from a shared drive. |
| `keep_revision_forever` | boolean | No | Whether to set the 'keepForever' field in the new head revision. This is only applicable to files with binary content in Google Drive. |
| `include_permissions_for_view` | string | No | Specifies which additional view's permissions to include in the response. Only 'published' is supported. |
| `use_content_as_indexable_text` | boolean | No | Whether to use the uploaded content as indexable text. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Export or download a file

**Slug:** `GOOGLEDRIVE_PARSE_FILE`

DEPRECATED: Exports Google Workspace files (max 10MB) to a specified format using `mime_type`, or downloads other file types; use `GOOGLEDRIVE_DOWNLOAD_FILE` instead.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The unique ID of the file stored in Google Drive that you want to export or download. |
| `mime_type` | string ("application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "application/vnd.oasis.opendocument.text" | "application/rtf" | "application/pdf" | "text/plain" | "application/zip" | "application/epub+zip" | "text/markdown" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" | "application/vnd.oasis.opendocument.spreadsheet" | "text/csv" | "text/tab-separated-values" | "application/vnd.openxmlformats-officedocument.presentationml.presentation" | "application/vnd.oasis.opendocument.presentation" | "image/jpeg" | "image/png" | "image/svg+xml" | "application/vnd.google-apps.script+json" | "video/mp4") | No | Target MIME type for exporting Google Workspace files only. Supported exports by source type: Google Docs -> DOCX, ODT, RTF, PDF, TXT, ZIP (HTML), EPUB, MD; Google Sheets -> XLSX, ODS, PDF, ZIP (HTML), CSV, TSV; Google Slides -> PPTX, ODP, PDF, TXT, JPG, PNG, SVG; Google Drawings -> PDF, JPG, PNG, SVG; Apps Script -> JSON. If omitted, a default format is used: Docs->PDF, Sheets->XLSX, Slides->PDF, Drawings->PDF. For non-Workspace files (PDFs, images, text files, etc.), this parameter is ignored and the file is downloaded in its native format. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Patch Permission

**Slug:** `GOOGLEDRIVE_PATCH_PERMISSION`

Tool to update a permission using patch semantics. Use when you need to modify specific fields of an existing permission without affecting other fields. **Warning:** Concurrent permissions operations on the same file are not supported; only the last update is applied.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string ("owner" | "organizer" | "fileOrganizer" | "writer" | "reader") | No | Permission roles that can be granted in Google Drive. |
| `file_id` | string | Yes | The ID for the file or shared drive. |
| `with_link` | boolean | No | Whether the link is required for this permission. Set to true for 'anyone with the link' access (not publicly discoverable), or false for publicly discoverable access. |
| `permission_id` | string | Yes | The ID for the permission. Use 'anyone' for public link permissions, or specific permission IDs for user/group/domain permissions. You can get permission IDs by calling GOOGLEDRIVE_LIST_PERMISSIONS. |
| `expiration_date` | string | No | The time at which this permission will expire (RFC 3339 date-time). Can only be set on user and group permissions. The date must be in the future and cannot be more than a year in the future. |
| `additional_roles` | array | No | Additional roles for this user. Only 'commenter' is currently allowed. |
| `remove_expiration` | boolean | No | Whether to remove the expiration date. Set to true to make the permission permanent. |
| `transfer_ownership` | boolean | No | Whether changing a role to 'owner' downgrades the current owners to writers. Does nothing if the specified role is not 'owner'. Required as an acknowledgement when transferring ownership. |
| `supports_all_drives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. |
| `use_domain_admin_access` | boolean | No | Issue the request as a domain administrator; if set to true, then the requester will be granted access if the file ID parameter refers to a shared drive and the requester is an administrator of the domain to which the shared drive belongs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Patch Property (v2 API)

**Slug:** `GOOGLEDRIVE_PATCH_PROPERTY`

Tool to update a property on a file using PATCH semantics (v2 API). Use when you need to partially update custom key-value metadata attached to a Google Drive file.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt` | string ("json" | "media" | "proto") | No | Data format for response. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token. |
| `value` | string | No | The value of this property. |
| `xgafv` | string ("1" | "2") | No | V1 error format values. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. |
| `fileId` | string | Yes | The ID of the file. |
| `callback` | string | No | JSONP callback function name. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. 'media', 'multipart'). |
| `visibility` | string ("PRIVATE" | "PUBLIC") | No | Property visibility values. |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks. |
| `propertyKey` | string | Yes | The key of the property to update. |
| `access_token` | string | No | OAuth access token. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. 'raw', 'multipart'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Resumable Upload

**Slug:** `GOOGLEDRIVE_RESUMABLE_UPLOAD`

Tool to start and complete a Google Drive resumable upload session. Use for files larger than ~5 MB to avoid timeouts or size-limit failures. HTTP 308 means continue the session from the correct byte offset; HTTP 410 means the session expired and a full restart with a new session is required.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | No | Optional file ID if updating an existing file instead of creating a new one. |
| `metadata` | object | No | JSON metadata for the Drive File resource (e.g., {'name': 'photo.jpg', 'parents': ['folderId']}). To convert to a Google Docs MIME type, set metadata.mimeType to the target Docs type but send the real file MIME type as the upload content type — using the Docs MIME type as upload content type causes invalidContentType errors. |
| `chunkSize` | integer | No | Chunk size in bytes; must be a multiple of 256 KB. |
| `queryParams` | object | No | Optional Drive query parameters. |
| `file_to_upload` | object | Yes | File to upload to Google Drive via resumable upload. |
| `folder_to_upload_to` | string | No | Optional folder ID where NEW files should be uploaded. Only used during file creation, not updates. Will be added to metadata.parents. Must reference a valid, non-trashed folder ID; invalid or trashed IDs silently place files at root. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Stop Watch Channel

**Slug:** `GOOGLEDRIVE_STOP_WATCH_CHANNEL`

Tool to stop watching resources through a specified channel. Use this when you want to stop receiving notifications for a previously established watch. Both `id` and `resourceId` must be saved from the original watch response — they cannot be retrieved after the fact.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The ID of the channel to stop. |
| `kind` | string | No | Identifies this as a notification channel used to watch for changes to a resource. |
| `token` | string | No | An arbitrary string delivered to the target address with each notification delivered over this channel. |
| `params` | object | No | Additional parameters controlling delivery channel behavior. |
| `address` | string | No | The address where notifications are delivered for this channel. |
| `payload` | boolean | No | A Boolean value to indicate whether payload is wanted. |
| `expiration` | string | No | Date and time of notification channel expiration, expressed as a Unix timestamp, in milliseconds. |
| `resourceId` | string | Yes | The ID of the resource being watched. |
| `channelType` | string ("web_hook" | "webhook") | No | The type of delivery mechanism used for this channel. |
| `resourceUri` | string | No | A version-specific identifier for the watched resource. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Trash File

**Slug:** `GOOGLEDRIVE_TRASH_FILE`

Tool to move a file or folder to trash (soft delete). Use when you need to delete a file but want to allow recovery via UNTRASH_FILE. This action is distinct from permanent deletion and provides a safer cleanup workflow.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | string | No | Comma-separated list of fields to include in the response. Use to limit the amount of data returned. If omitted, returns basic file metadata. |
| `file_id` | string | Yes | The ID of the file to trash. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. Defaults to true. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Unhide Shared Drive

**Slug:** `GOOGLEDRIVE_UNHIDE_DRIVE`

Tool to unhide a shared drive. Use when you need to restore a shared drive to the default view.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `driveId` | string | Yes | The ID of the shared drive. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Untrash File

**Slug:** `GOOGLEDRIVE_UNTRASH_FILE`

Tool to restore a file from the trash. Use when you need to recover a deleted file. This action updates the file's metadata to set the 'trashed' property to false. Only works while the file remains in trash — recovery is impossible after trash is emptied via GOOGLEDRIVE_EMPTY_TRASH or auto-purged by policy.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file to untrash. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Comment

**Slug:** `GOOGLEDRIVE_UPDATE_COMMENT`

Tool to update an existing comment on a Google Drive file. Use when you need to change the content of a comment. NOTE: The 'resolved' field is read-only in the Google Drive API. To resolve or reopen a comment, use CREATE_REPLY with action='resolve' or action='reopen'.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | string | No | Selector specifying which fields to include in a partial response. The API documentation states this is required. If not specified by the user, this action defaults to '*' to retrieve all fields, ensuring the API requirement is met. Example: 'id,content,resolved'. |
| `content` | string | No | The plain text content of the comment. This field is used to update the comment's text. If not provided, the existing content will be retained unless 'resolved' is being updated. |
| `file_id` | string | Yes | The ID of the file. |
| `resolved` | boolean | No | NOTE: The 'resolved' field is READ-ONLY in the Google Drive API. To resolve or reopen a comment, use the CREATE_REPLY action with action='resolve' or action='reopen'. This parameter is kept for backwards compatibility but will be silently ignored by the API. |
| `comment_id` | string | Yes | The ID of the comment to update. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Shared Drive

**Slug:** `GOOGLEDRIVE_UPDATE_DRIVE`

Tool to update the metadata for a shared drive. Use when you need to modify properties like the name, theme, background image, or restrictions of a shared drive.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | The new name for the shared drive. |
| `hidden` | boolean | No | Whether the shared drive is hidden from the default view. |
| `driveId` | string | Yes | The ID of the shared drive to update. |
| `themeId` | string | No | The ID of a theme to apply to the shared drive. Cannot be set if colorRgb or backgroundImageFile are set. |
| `colorRgb` | string | No | The color of this shared drive as an RGB hex string (e.g., "#FF0000"). Cannot be set if themeId is set. |
| `restrictions` | object | No | A set of restrictions to apply to the shared drive. |
| `backgroundImageFile` | object | No | An image file and cropping parameters for the shared drive's background. Cannot be set if themeId is set. |
| `useDomainAdminAccess` | boolean | No | If set to true, the request is issued as a domain administrator. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update File Metadata (PATCH v2)

**Slug:** `GOOGLEDRIVE_UPDATE_FILE_METADATA_PATCH`

Tool to update file metadata using the Drive API v2 PATCH method. Use when you need to modify file properties like title, description, or labels using patch semantics.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ocr` | boolean | No | Whether to attempt OCR on .jpg, .png, .gif, or .pdf uploads. |
| `title` | string | No | The title of the file. Used to change the name of the file. |
| `fileId` | string | Yes | The ID of the file to update. |
| `labels` | object | No | A group of labels for the file. For example: {'starred': true, 'trashed': false, 'restricted': false, 'viewed': true}. |
| `pinned` | boolean | No | Whether to pin the new revision. A file can have a maximum of 200 pinned revisions. |
| `mimeType` | string | No | The MIME type of the file. |
| `addParents` | string | No | Comma-separated list of parent IDs to add. |
| `properties` | array | No | The list of properties. |
| `description` | string | No | A short description of the file. |
| `newRevision` | boolean | No | Whether a blob upload should create a new revision. If not set, a new revision is created. |
| `ocrLanguage` | string | No | If ocr is true, hints at the language to use. Valid values are BCP 47 codes. |
| `modifiedDate` | string | No | Last time this file was modified by anyone (RFC 3339 date-time). Requires setModifiedDate=true. |
| `includeLabels` | string | No | A comma-separated list of IDs of labels to include in the labelInfo part of the response. |
| `indexableText` | object | No | Indexable text attributes for the file (can be used to improve fulltext queries). |
| `removeParents` | string | No | Comma-separated list of parent IDs to remove. |
| `setModifiedDate` | boolean | No | Whether to set the modified date using the value supplied in the request body. |
| `writersCanShare` | boolean | No | Whether writers can share the document with other users. |
| `updateViewedDate` | boolean | No | Whether to update the view date after successfully updating the file. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. Defaults to true. |
| `timedTextLanguage` | string | No | The language of the timed text. |
| `timedTextTrackName` | string | No | The timed text track name. |
| `includePermissionsForView` | string | No | Specifies which additional view's permissions to include in the response. Only 'published' is supported. |
| `useContentAsIndexableText` | boolean | No | Whether to use the content as indexable text. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Property (v2 API)

**Slug:** `GOOGLEDRIVE_UPDATE_FILE_PROPERTY`

Tool to update a property on a file using Google Drive API v2. Use when you need to modify an existing custom property attached to a file.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `alt` | string ("json" | "media" | "proto") | No | Data format for response. |
| `key` | string | No | API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token. |
| `xgafv` | string ("1" | "2") | No | V1 error format values. |
| `fields` | string | No | Selector specifying which fields to include in a partial response. |
| `fileId` | string | Yes | The ID of the file. |
| `callback` | string | No | JSONP callback function name. |
| `quotaUser` | string | No | Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. |
| `uploadType` | string | No | Legacy upload protocol for media (e.g. 'media', 'multipart'). |
| `visibility` | string ("PRIVATE" | "PUBLIC") | No | Visibility options for the property. |
| `oauth_token` | string | No | OAuth 2.0 token for the current user. |
| `prettyPrint` | boolean | No | Returns response with indentations and line breaks. |
| `propertyKey` | string | Yes | The key of the property. |
| `access_token` | string | No | OAuth access token. |
| `property_value` | string | No | The value of this property. |
| `upload_protocol` | string | No | Upload protocol for media (e.g. 'raw', 'multipart'). |
| `property_visibility` | string ("PRIVATE" | "PUBLIC") | No | Visibility options for the property. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update File (Metadata)

**Slug:** `GOOGLEDRIVE_UPDATE_FILE_PUT`

Updates file metadata. Uses PATCH semantics (partial update) as per Google Drive API v3 — only explicitly provided fields are updated, so omit fields you do not intend to overwrite. Use this tool to modify attributes of an existing file like its name, description, or parent folders. To move a file, supply add_parents and remove_parents together; omitting remove_parents creates multiple parents, omitting add_parents can orphan the file. Bulk updates may trigger 429 Too Many Requests; apply exponential backoff. Note: supports metadata updates only; file content updates are not yet implemented.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | The name of the file. Google Drive does not enforce name uniqueness within a folder; duplicate names are allowed and can cause ambiguous results when searching by name. |
| `fileId` | string | Yes | The ID of the file to update. |
| `starred` | boolean | No | Whether the user has starred the file. |
| `mime_type` | string | No | The MIME type of the file. Google Drive will attempt to automatically detect an appropriate value from uploaded content if no value is provided. The value cannot be changed unless a new revision is uploaded. |
| `add_parents` | string | No | Comma-separated list of folder IDs (not folder names) to add as parents. Folder IDs are alphanumeric strings typically 20+ characters long (e.g., '1A2B3C4D5E6F7G8H9I0J'). Folder names will not work and will cause a 'Parent folder not found' error. Moving a file requires pairing with remove_parents (source folder ID); omitting remove_parents results in multiple parents. Reparenting to a shared folder changes collaborator access to that folder's permissions. |
| `description` | string | No | A short description of the file. |
| `ocr_language` | string | No | A language hint for OCR processing during image import (ISO 639-1 code). |
| `remove_parents` | string | No | Comma-separated list of folder IDs (not folder names) to remove as parents. Folder IDs are alphanumeric strings typically 20+ characters long (e.g., '1A2B3C4D5E6F7G8H9I0J'). Folder names will not work and will cause a 'Parent folder not found' error. |
| `writers_can_share` | boolean | No | Whether writers can share the document with other users. |
| `supports_all_drives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. Defaults to true to ensure compatibility with shared drive files. |
| `keep_revision_forever` | boolean | No | Whether to set this revision of the file to be kept forever. This is only applicable to files with binary content in Google Drive. Only 200 revisions for the file can be kept forever. If the limit is reached, try deleting pinned revisions. |
| `use_domain_admin_access` | boolean | No | Whether the requesting application is using domain-wide delegation to access content belonging to a user in a different domain. This is only applicable to files with binary content in Google Drive. |
| `viewers_can_copy_content` | boolean | No | Whether viewers are prevented from copying content of the file. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update File Revision Metadata

**Slug:** `GOOGLEDRIVE_UPDATE_FILE_REVISION_METADATA`

Updates ONLY the metadata properties of a specific file revision (keepForever, published, publishAuto, publishedOutsideDomain). IMPORTANT: This action does NOT update file content. To update file content, use EDIT_FILE or UPDATE_FILE_PUT instead. This action requires BOTH file_id AND revision_id parameters. Use LIST_REVISIONS to get available revision IDs for a file. Valid parameters: file_id (required), revision_id (required), keep_forever, published, publish_auto, published_outside_domain. Invalid parameters (use other actions): file_contents, mime_type, content, name - these are NOT supported by this action.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | Required. The ID of the file whose revision metadata you want to update. Use LIST_FILES or FIND_FILE to get the file ID. |
| `published` | boolean | No | Whether this revision is published. This is only applicable to Docs Editors files. |
| `keepForever` | boolean | No | Whether to keep this revision forever, even if it is no longer the head revision. If not set, the revision will be automatically purged 30 days after newer content is uploaded. This can be set on a maximum of 200 revisions for a file. This field is only applicable to files with binary content in Drive. |
| `publishAuto` | boolean | No | Whether subsequent revisions will be automatically republished. This is only applicable to Docs Editors files. |
| `revision_id` | string | Yes | Required. The ID of the revision to update. Use LIST_REVISIONS to get available revision IDs for a file. |
| `publishedOutsideDomain` | boolean | No | Whether this revision is published outside the domain. This is only applicable to Docs Editors files. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Permission

**Slug:** `GOOGLEDRIVE_UPDATE_PERMISSION`

Tool to update a permission with patch semantics. Use when you need to modify an existing permission for a file or shared drive. Inherited or domain-managed permissions may not be editable; verify editability with GOOGLEDRIVE_LIST_PERMISSIONS before updating.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileId` | string | Yes | The ID of the file or shared drive. |
| `permission` | object | Yes | The permission resource to update. Only 'role' and 'expirationTime' can be updated. Role changes take effect immediately and can be difficult to reverse; confirm intent before applying. |
| `permissionId` | string | Yes | The ID of the permission. For anyone-type permissions, use 'anyone' as the permission ID. |
| `removeExpiration` | boolean | No | Whether to remove the expiration date. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. Must be set to true when operating on shared drives; omitting this causes the request to fail. |
| `transferOwnership` | boolean | No | Whether to transfer ownership to the specified user and downgrade the current owner to a writer. This parameter is required as an acknowledgement of the side effect when set to true. |
| `useDomainAdminAccess` | boolean | No | Issue the request as a domain administrator; if set to true, then the requester will be granted access if the file ID parameter refers to a shared drive and the requester is an administrator of the domain to which the shared drive belongs. |
| `enforceExpansiveAccess` | boolean | No | Whether the request should enforce expansive access rules. This field is deprecated, it is recommended to use `permissionDetails` instead. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Reply

**Slug:** `GOOGLEDRIVE_UPDATE_REPLY`

Tool to update a reply to a comment on a Google Drive file. Use when you need to modify the content of an existing reply.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | string | No | Selector specifying which fields to include in a partial response. If not provided, defaults to '*' to return all fields. |
| `content` | string | Yes | The new plain text content of the reply. |
| `file_id` | string | Yes | The ID of the file. |
| `reply_id` | string | Yes | The ID of the reply. |
| `comment_id` | string | Yes | The ID of the comment. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Team Drive (Deprecated)

**Slug:** `GOOGLEDRIVE_UPDATE_TEAM_DRIVE`

Tool to update a Team Drive's metadata. Deprecated: Use the drives.update endpoint instead. Use when you need to modify Team Drive properties.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | The name of this Team Drive. |
| `themeId` | string | No | The ID of the theme from which the background image and color will be set. This is a write-only field; it can only be set on requests that don't set colorRgb or backgroundImageFile. |
| `colorRgb` | string | No | The color of this Team Drive as an RGB hex string. It can only be set on a drive.teamdrives.update request that does not set themeId. |
| `teamDriveId` | string | Yes | The ID of the Team Drive to update. |
| `restrictions` | object | No | A set of restrictions that apply to this Team Drive or items inside this Team Drive. |
| `backgroundImageFile` | object | No | An image file and cropping parameters from which a background image for this Team Drive is set. This is a write only field; it can only be set on drive.teamdrives.update requests that don't set themeId. |
| `useDomainAdminAccess` | boolean | No | Issue the request as a domain administrator; if set to true, then the requester will be granted access if they are an administrator of the domain to which the Team Drive belongs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Upload File

**Slug:** `GOOGLEDRIVE_UPLOAD_FILE`

Uploads a file (max 5MB) to Google Drive, placing it in the specified folder or root if no valid folder ID is provided. Always creates a new file (never updates existing); use GOOGLEDRIVE_EDIT_FILE to update with a stable file_id. Uploaded files are private by default; configure sharing via GOOGLEDRIVE_ADD_FILE_SHARING_PREFERENCE.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_to_upload` | object | Yes | File to upload to Google Drive (max 5MB). Use a clear filename and accurate MIME type, for example `application/pdf`; incorrect values can cause Drive to convert or misrender the file. |
| `folder_to_upload_to` | string | No | Optional ID of the target Google Drive folder; can be obtained using 'Find Folder' or similar actions. Invalid or missing IDs silently fall back to Drive root with no error — resolve the correct folder ID first using GOOGLEDRIVE_FIND_FILE. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Upload File from URL to Drive

**Slug:** `GOOGLEDRIVE_UPLOAD_FROM_URL`

Tool to fetch a file from a provided URL server-side and upload it into Google Drive. Use when you need to reliably persist externally hosted files into Drive without client-side downloads or temporary storage.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name for the file in Google Drive, including extension (e.g., 'report.pdf', 'image.png'). |
| `mime_type` | string | No | Target MIME type for the file in Google Drive. If not specified, Drive auto-detects from content. Google Workspace MIME types (application/vnd.google-apps.*) trigger automatic conversion from compatible source formats: google-apps.document converts Word/ODT/HTML/RTF/TXT/PDF/images (OCR); google-apps.spreadsheet converts Excel/ODS/CSV/TSV; google-apps.presentation converts PowerPoint/ODP. Conversion requires the source content to be in a compatible format. Incompatible formats will cause upload errors. |
| `source_url` | string | Yes | HTTPS URL of the file to download and upload to Google Drive. Must be publicly accessible or include necessary authentication in source_headers. |
| `verify_ssl` | boolean | No | Whether to verify SSL certificates when downloading from HTTPS URLs. Set to false to bypass SSL verification for URLs with certificate issues (expired certificates, hostname mismatches, self-signed certificates). Only disable for trusted sources. |
| `source_headers` | object | No | Optional HTTP headers to include when downloading from source_url. Use for authentication tokens, signed URLs, or CDN-specific headers. |
| `parent_folder_id` | string | No | ID of the parent folder in Google Drive. If not specified, the file will be uploaded to the root of My Drive. |
| `supports_all_drives` | boolean | No | Whether the request supports both My Drives and shared drives. Defaults to true for broader compatibility. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Upload/Update File Content

**Slug:** `GOOGLEDRIVE_UPLOAD_UPDATE_FILE`

Tool to update file content in Google Drive by uploading new binary content. Use when you need to replace the contents of an existing file with new file data.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileId` | string | Yes | The ID of the file to update with new content. |
| `addParents` | string | No | Comma-separated list of parent folder IDs to add. |
| `uploadType` | string | No | The type of upload request. 'media' for simple upload (content only), 'multipart' for metadata + content, 'resumable' for large files. |
| `ocrLanguage` | string | No | Language hint for OCR processing (ISO 639-1 code, e.g., 'en'). |
| `removeParents` | string | No | Comma-separated list of parent folder IDs to remove. |
| `file_to_upload` | object | Yes | The file content to upload. |
| `supportsAllDrives` | boolean | No | Whether the app supports both My Drives and shared drives. Defaults to true. |
| `keepRevisionForever` | boolean | No | Whether to set the 'keepForever' field in the new head revision. |
| `useContentAsIndexableText` | boolean | No | Whether to use the uploaded content as indexable text for search. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Watch Drive Changes

**Slug:** `GOOGLEDRIVE_WATCH_CHANGES`

Tool to subscribe to changes for a user or shared drive in Google Drive. Use when you need to monitor a Google Drive for modifications and receive notifications at a specified webhook URL. Notifications may be batched rather than per-change; design handlers to be idempotent and fetch all changes since the last known page_token on each notification.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | A unique string that identifies this channel. UUIDs are recommended. Must be unique per active channel; reusing an ID can cause missed, delayed, or duplicate notifications. |
| `type` | string | Yes | The type of delivery mechanism for notifications. |
| `token` | string | No | An arbitrary string that will be delivered with each notification. Can be used for verification. |
| `params` | object | No | Optional parameters for the notification channel. Example: {"ttl": "3600"} for a 1-hour time-to-live (actual support depends on Google API). |
| `spaces` | string | No | A comma-separated list of spaces to query within the corpora. Supported values are 'drive' and 'appDataFolder'. |
| `address` | string | Yes | The URL where notifications are to be delivered. Must be a publicly reachable HTTPS URL with a valid SSL certificate; HTTP, localhost, and private network endpoints are rejected by the API. |
| `drive_id` | string | No | The shared drive from which changes will be returned. If specified, change IDs will be specific to the shared drive. |
| `page_size` | integer | No | The maximum number of changes to return per page. |
| `expiration` | integer | No | Timestamp in milliseconds since the epoch for when the channel should expire. If not set, channel may not expire or have a default expiration. Channels are invalidated after expiry; re-establish the watch with a new channel before or after expiration to avoid missed changes. |
| `page_token` | string | No | The token for continuing a previous list request on the next page. This should be set to the value of 'nextPageToken' from the previous response or to the response from the getStartPageToken method. Persist this token per channel so change processing can resume correctly after restarts or interruptions. |
| `include_labels` | string | No | A comma-separated list of IDs of labels to include in the labelInfo part of the response. |
| `include_removed` | boolean | No | Whether to include changes indicating that items have been removed from the list of changes (e.g., by deletion or loss of access). |
| `supports_all_drives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. Recommended to set to true if driveId is used or if interactions with shared drives are expected. |
| `restrict_to_my_drive` | boolean | No | Whether to restrict the results to changes inside the My Drive hierarchy. This omits changes to files like those in the Application Data folder or shared files not added to My Drive. |
| `include_corpus_removals` | boolean | No | Whether changes should include the file resource if the file is still accessible by the user at the time of the request, even when a file was removed from the list of changes. |
| `include_permissions_for_view` | string | No | Specifies which additional view's permissions to include in the response. |
| `include_items_from_all_drives` | boolean | No | Whether both My Drive and shared drive items should be included in results. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Watch File for Changes

**Slug:** `GOOGLEDRIVE_WATCH_FILE`

Tool to subscribe to push notifications for changes to a specific file. Use when you need to monitor a file for modifications and receive real-time notifications at a webhook URL.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | A UUID or similar unique string that identifies this notification channel (max 64 characters). |
| `type` | string ("web_hook" | "webhook") | Yes | The type of delivery mechanism used for this channel. |
| `token` | string | No | An arbitrary string delivered to the target address with each notification for verification (max 256 characters). |
| `fileId` | string | Yes | The ID of the file to watch for changes. |
| `params` | object | No | Additional parameters controlling delivery channel behavior. |
| `address` | string | Yes | The HTTPS address where notifications are delivered for this channel. Must have a valid SSL certificate. |
| `payload` | boolean | No | Whether payload data should be included in notifications. |
| `expiration` | integer | No | Date and time of notification channel expiration as Unix timestamp in milliseconds. Default: 3600 seconds, max: 86400 seconds for files. |
| `includeLabels` | string | No | A comma-separated list of IDs of labels to include in the labelInfo part of the response. |
| `acknowledgeAbuse` | boolean | No | Whether the user is acknowledging the risk of downloading known malware or other abusive files. Only applicable to file owner/organizer. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. |
| `supportsTeamDrives` | boolean | No | Deprecated. Use supportsAllDrives instead. |
| `includePermissionsForView` | string | No | Specifies which additional view's permissions to include in the response. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |


## Triggers

### Comment Added (Docs/Sheets/Slides)

**Slug:** `GOOGLEDRIVE_COMMENT_ADDED_TRIGGER`

**Type:** poll

Triggers when a new comment is added to Google Docs, Sheets, or Slides.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | No | If provided, monitor comments only for this specific file ID. If omitted, the trigger scans recent Docs/Sheets/Slides files for new comments. |
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `max_files` | integer | No | Maximum number of recent Docs/Sheets/Slides files to inspect in each poll when no file ID is specified. Values above 100 are clamped at runtime to protect Drive quota — comments.list is a per-file fanout. |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `comment_id` | string | Yes | The ID of the comment |
| `comment_text` | string | No | The plain text content of the comment |
| `commenter` | object | No | Information about the commenter (displayName, permissionId, photoLink, me). |
| `created_time` | string | No | The time the comment was created (RFC 3339) |
| `file_id` | string | Yes | The ID of the file on which the comment was added |

### File Created

**Slug:** `GOOGLEDRIVE_FILE_CREATED_TRIGGER`

**Type:** poll

Triggers when a new file is created in Google Drive.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `folder_id` | string | No | If provided, monitor only files within this folder (by folder ID). Adds the filter `'folder_id' in parents` to the query. |
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `max_results` | integer | No | Maximum number of newly-created files to emit in a single poll. Acts as an event cap, not an API page size — the trigger paginates Drive responses internally. |
| `query` | string | No | Optional Drive search query to filter files. Examples: name contains 'report', mimeType = 'application/pdf', or complex queries like name contains 'project' and mimeType != 'application/vnd.google-apps.folder'. Leave empty to monitor all files. |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `creator` | object | No | Information about the file's creator (derived as first owner if available) |
| `event_type` | string | No | Type of event that occurred |
| `file` | object | Yes | The newly created Google Drive file |

### File Deleted or Trashed

**Slug:** `GOOGLEDRIVE_FILE_DELETED_OR_TRASHED_TRIGGER`

**Type:** poll

Triggers when a file is moved to trash or permanently deleted in Drive.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `drive_id` | string | No | Optional shared drive ID to monitor. When unset, the trigger monitors My Drive plus shared drives surfaced by `include_items_from_all_drives`. |
| `include_corpus_removals` | boolean | No | Include changes where the user lost access to the file (e.g. permission removal). When false, only true deletions and trash events surface. |
| `include_items_from_all_drives` | boolean | No | Whether items from My Drive AND all visible shared drives should appear in results. |
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `page_size` | integer | No | Maximum number of changes per `changes.list` page (1-1000). |
| `restrict_to_my_drive` | boolean | No | If true, restrict results to changes inside the My Drive hierarchy. |
| `spaces` | string | No | Comma-separated list of spaces to query. Supported values are 'drive' and 'appDataFolder'. |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `deletion_timestamp` | string | Yes | Timestamp of the delete/trash event in RFC 3339 format |
| `event_type` | string | Yes | Type of deletion event. Either 'trashed' (soft-delete, recoverable from the user's trash) or 'removed' (hard-delete or, when include_corpus_removals=true, access loss). |
| `file_id` | string | Yes | ID of the file that was deleted or trashed |
| `name` | string | No | Name of the file. May be absent when the file was permanently removed (the file resource is gone, only the change record remains). |

### File Shared (Permissions Added)

**Slug:** `GOOGLEDRIVE_FILE_SHARED_PERMISSIONS_ADDED`

**Type:** poll

Triggers when new sharing permissions are granted to a file or folder.

    Uses Drive's `changes.list` endpoint with inline `permissions` in the
    `fields` mask so each change carries the file's current permission set
    provider-atomically. We diff that against `seen_permission_keys` to
    identify newly added grants. Drive page tokens are the primary cursor;
    if Drive rejects a stored token, the trigger raises `PollingTriggerError`
    without clearing state rather than silently re-baselining and dropping
    events.

    Limitation: truly ephemeral permissions (added and revoked between two
    polls without any other file modification in between) are not detected.
    Drive Activity API would catch those but requires an additional OAuth
    scope and a different payload contract.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `drive_id` | string | No | The shared drive ID to monitor. If omitted, monitors My Drive and any shared drives surfaced via include_items_from_all_drives. |
| `file_id` | string | No | If provided, only emit permission changes for this specific file or folder ID. |
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `page_size` | integer | No | Maximum number of changes to fetch per `changes.list` page (1-1000). |
| `supports_all_drives` | boolean | No | Whether to include both My Drive and shared drives when monitoring changes. |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event_type` | string | No | Type of event that occurred |
| `new_permissions` | array | No | List of newly detected permissions |

### File Updated

**Slug:** `GOOGLEDRIVE_FILE_UPDATED_TRIGGER`

**Type:** poll

Triggers when a file's metadata or content changes in Google Drive.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content_only` | boolean | No | When true, fire only on content changes (new revision) and suppress metadata-only updates such as rename or move. Relies on `headRevisionId`, which Drive only exposes for binary files — Google-native docs (Docs/Sheets/Slides) do not carry `headRevisionId` and will not fire this trigger under `content_only=true`. |
| `drive_id` | string | No | Optional shared drive ID to monitor. When unset, the trigger monitors My Drive plus shared drives surfaced by `include_items_from_all_drives`. |
| `include_items_from_all_drives` | boolean | No | Whether items from My Drive AND all visible shared drives should appear in results. |
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `page_size` | integer | No | Maximum number of changes per `changes.list` page (1-1000). |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file that changed |
| `last_modifying_user` | object | No | Information about the last user who modified the file |
| `modified_time` | string | No | The last time the file was modified (RFC 3339 date-time) |

### Google Drive Changes

**Slug:** `GOOGLEDRIVE_GOOGLE_DRIVE_CHANGES`

**Type:** poll

Triggers when changes are detected in a Google Drive.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `drive_id` | string | No | Optional shared drive ID to monitor. When unset, the trigger monitors the user's My Drive plus any shared drives surfaced by `include_items_from_all_drives`. |
| `include_items_from_all_drives` | boolean | No | Whether items from My Drive AND all visible shared drives should appear in results. Required for shared-drive coverage. |
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `restrict_to_my_drive` | boolean | No | If true, restrict results to changes inside the My Drive hierarchy even when `include_items_from_all_drives` is true. |
| `spaces` | string | No | Comma-separated list of spaces to query. Supported values are 'drive' and 'appDataFolder'. |

### New File Matching Query

**Slug:** `GOOGLEDRIVE_NEW_FILE_MATCHING_QUERY_TRIGGER`

**Type:** poll

Triggers when a new Google Drive file matches a provided query.

    This is the legacy query-centric trigger: it preserves Drive API query
    config such as ``corpora`` / ``driveId`` aliases and emits the historical
    ``file_matching_query`` event type. ``FileCreatedTrigger`` covers the
    broader "new file" case and emits ``file_created``.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `corpora` | string | No | Bodies of items to which the query applies. Supported: 'user', 'domain', 'drive', 'allDrives'. |
| `driveId` | string | No | ID of the shared drive to search (use with corpora='drive'). |
| `includeItemsFromAllDrives` | boolean | No | Include items from both My Drive and shared drives. |
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `max_results` | integer | No | Maximum number of newly-matching files to emit per poll. The trigger paginates Drive responses internally bounded by an internal page cap; this field caps emitted events, not API pages. |
| `query` | string | No | Drive query to filter files. Examples: name contains 'report', mimeType = 'application/pdf', (name contains 'Draft' and not trashed). The query is composed with a `createdTime >= <watermark>` boundary plus ID dedup so the trigger only fires for newly created files. |
| `spaces` | string | No | A comma-separated list of spaces to query within. Supported: 'drive', 'appDataFolder'. |
| `supportsAllDrives` | boolean | No | Whether the requesting application supports both My Drives and shared drives. |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event_type` | string | No | Type of event that occurred |
| `file` | object | Yes | The newly matched Drive file |
