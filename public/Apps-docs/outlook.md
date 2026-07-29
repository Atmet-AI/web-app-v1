# Outlook

Outlook is Microsoft's email and calendaring platform integrating contacts and scheduling, enabling users to manage communications and events in a unified workspace

- **Category:** email
- **Auth:** OAUTH2, S2S_OAUTH2
- **Composio Managed App Available?** Yes
- **Tools:** 305
- **Triggers:** 5
- **Slug:** `OUTLOOK`
- **Version:** 20260724_00

## Frequently Asked Questions

### How do I set up custom OAuth credentials for Microsoft (Outlook)?

For a step-by-step guide on creating and configuring your own Microsoft (Outlook) OAuth credentials with Composio, see [How to create OAuth credentials for Microsoft (Outlook)](https://composio.dev/auth/outlook).

### Why does the Outlook new message trigger only return a message ID?

Outlook's webhooks send only the message ID on trigger events. To get the full message (subject, body, headers), call the `OUTLOOK_GET_MESSAGE` tool with that message ID.

### Why doesn't `OUTLOOK_SEND_EMAIL` return message details?

Microsoft Graph's send endpoint returns an HTTP 202 with no message details. To get the message ID and conversation ID, create a draft first with `OUTLOOK_CREATE_DRAFT`, then send it with `OUTLOOK_SEND_DRAFT`. See [Microsoft Graph docs](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0&tabs=http).

### What's the @odata.context / @odata URL?

The `@odata.context` URL provides metadata about the response (entity set, service version, and schema info) to help clients interpret the payload structure. It's primarily used for pagination and data parsing, not as a direct URL to the resource itself.

### Why do Outlook connections show "Needs Admin Approval" or "admin approval required"?

Microsoft/Outlook admin-consent issues are Microsoft 365 tenant-level approval problems, not something fixed by changing only the Composio connection. Adding delegated permissions to an Azure app registration is not the same as granting tenant admin consent. Once a tenant admin grants consent for the requested permissions, affected users should start a fresh normal Outlook connection flow with their own accounts; the admin does not need to connect every user individually.

Two concrete ways an admin can approve are:

1. **App Registration / OAuth app level:** in Microsoft Entra / Azure Portal, go to **App registrations**, open the OAuth app, go to **API permissions**, click **Grant admin consent for [Tenant Name]**, then confirm/save.
2. **Enterprise Applications / org level:** in Microsoft Entra / Azure Portal, go to **Enterprise applications**, find the Composio/Outlook app or the user's own service principal, open **Permissions** / admin-consent controls, then grant admin consent for the organization.

![Microsoft Entra API permissions page showing the Grant admin consent action](/images/kb/toolkits/outlook/outlook-admin-consent-api-permissions.png)

Microsoft may also show an in-flow `sign in as an admin` / `Connectez-vous avec ce compte` option on the OAuth screen. Treat that as a secondary path, not the first recommendation. If an admin signs in through the same OAuth attempt, that attempt may connect the admin's mailbox instead of the original user's mailbox. After tenant-wide consent is granted, the original user should start a fresh Outlook connection flow with their own account.

For custom Microsoft OAuth apps, a verified publisher can improve branding and may reduce consent friction in tenants that allow user consent for verified publishers and the requested delegated permissions. It does not remove the admin-consent requirement in every tenant; each Microsoft 365 tenant's user-consent policy and the exact scopes requested still decide whether admin approval is needed.

## Tools

### Accept calendar event invite

**Slug:** `OUTLOOK_ACCEPT_EVENT`

Accepts or tentatively accepts a calendar meeting invite on behalf of a user. Use this action when a user has received a meeting invitation and wants to indicate their attendance status (either confirmed or tentative). The organizer will receive a notification of the acceptance unless send_response is set to false.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `comment` | string | No | Optional text message to include with the response, sent to the organizer. |
| `user_id` | string | No | The user ID or userPrincipalName of the calendar owner. If not provided, uses the authenticated user (/me). |
| `event_id` | string | Yes | The unique identifier of the calendar event to respond to. |
| `response_type` | string ("accept" | "tentative") | No | Type of response: 'accept' to accept the invite, 'tentative' to tentatively accept. |
| `send_response` | boolean | No | Whether to send the response to the organizer. Set to false to accept without notifying. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Add event attachment

**Slug:** `OUTLOOK_ADD_EVENT_ATTACHMENT`

Adds an attachment to a specific Outlook calendar event. Use when you need to attach a file or nested item to an existing event.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item` | object | No | The nested item payload; required when '@odata.type' is itemAttachment. |
| `name` | string | Yes | The display name of the attachment. |
| `user_id` | string | No | The user's email address or 'me' for the authenticated user. |
| `event_id` | string | Yes | The unique opaque identifier of the calendar event (NOT an email address). This is typically a long string starting with 'AAMkA' or 'AQMkA'. Obtain it from listing or searching calendar events. |
| `odata_type` | string ("#microsoft.graph.fileAttachment" | "#microsoft.graph.itemAttachment") | Yes | Attachment type: '#microsoft.graph.fileAttachment' requires 'contentBytes'; '#microsoft.graph.itemAttachment' requires 'item'. |
| `content_bytes` | string | No | MUST be base64-encoded file contents (not plain text); required when '@odata.type' is fileAttachment. Raw/plain text must be base64-encoded first. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Add mail attachment

**Slug:** `OUTLOOK_ADD_MAIL_ATTACHMENT`

Tool to add an attachment to an email message. Use when you have a message ID and need to attach a small (<3 MB) file or reference.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item` | object | No | Embedded item (e.g., message, event) for itemAttachment; must include its own '@odata.type'. |
| `name` | string | No | Display name of the attachment (e.g., file name). Required when using content_bytes. When using the attachment field, the name is automatically inferred. |
| `user_id` | string | No | The user's principal name or 'me' for the authenticated user. |
| `isInline` | boolean | No | Set to true if the attachment should appear inline in the message body. |
| `contentId` | string | No | Content ID for inline attachments, used in HTML body references. |
| `attachment` | object | No | File to attach to the email. Either provide this field OR use 'content_bytes'. Cannot be used together with 'content_bytes'. |
| `message_id` | string | Yes | Unique Microsoft Graph message ID (opaque string like 'AAMkAGI2TAAA='). NOT an email address - this is an internal identifier returned by Microsoft Graph API operations. |
| `odata_type` | string | No | The OData type of the attachment. Required by Microsoft Graph API. Use '#microsoft.graph.fileAttachment' for file attachments, '#microsoft.graph.itemAttachment' for embedded items (messages, events, contacts). |
| `contentType` | string | No | MIME type of the attachment (e.g., 'application/pdf'). Required when using content_bytes. When using the attachment field, the mimetype is automatically inferred. |
| `contentBytes` | string | No | Base64-encoded content of the file attachment (max size 3 MB). Either provide this field OR use the 'attachment' field (recommended). Cannot be used together with 'attachment'. |
| `contentLocation` | string | No | URL location or path for reference attachments. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Batch move messages

**Slug:** `OUTLOOK_BATCH_MOVE_MESSAGES`

Batch-move up to 20 Outlook messages to a destination folder in a single Microsoft Graph $batch call. Use when moving multiple messages to avoid per-message move API calls.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The UPN (User Principal Name) of the user whose messages to move, or 'me' for the currently authenticated user. |
| `message_ids` | array | Yes | Array of message IDs to move. Maximum 20 items per batch (Microsoft Graph API limit). Each ID must be complete and untruncated. |
| `destination_id` | string | Yes | The destination folder ID, or a well-known folder name (e.g., 'inbox', 'deleteditems', 'drafts', 'sentitems'). If using a folder ID, it must be complete and untruncated. |
| `response_detail` | string ("minimal" | "full") | No | Controls how much each move sub-request returns from Microsoft Graph. 'minimal' (default) sets `Prefer: return=minimal` on each sub-request, so Graph returns 204 No Content per move — the response stays small even for the maximum 20 HTML messages. In this mode `moved_message_id` in each result is null even on success. 'full' omits the Prefer header so Graph returns the full moved-message body per sub-request and `moved_message_id` is populated. Use 'full' if you need to chain follow-up calls on the new message ID; otherwise stick with 'minimal' to avoid multi-MB batch responses. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Batch update messages

**Slug:** `OUTLOOK_BATCH_UPDATE_MESSAGES`

Batch-update up to 20 Outlook messages per call using Microsoft Graph JSON batching. Use when marking multiple messages read/unread or updating other properties to avoid per-message PATCH calls.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `updates` | array | Yes | Array of message updates to perform. Maximum 20 items per batch (Microsoft Graph API limit). For larger workloads, chunk into multiple batch calls and retry any failures. |
| `user_id` | string | No | The UPN (User Principal Name) of the user whose messages to update, or 'me' for the currently authenticated user. |
| `response_detail` | string ("minimal" | "full") | No | Controls how much each PATCH sub-request returns from Microsoft Graph. 'minimal' (default) sets `Prefer: return=minimal` on each sub-request, so Graph returns 204 No Content per update — the response stays small even for the maximum 20 HTML messages. The action's response shape (BatchItemResult.status / .success / .error_message) is unchanged. 'full' omits the Prefer header so Graph returns the full updated-message body per sub-request (status 200) — useful only if you want to inspect the raw Graph response for debugging; otherwise stick with 'minimal' to avoid multi-MB batch responses. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Calendar Event

**Slug:** `OUTLOOK_CALENDAR_CREATE_EVENT`

Creates a new Outlook calendar event, ensuring `start_datetime` is chronologically before `end_datetime`.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `body` | string | No | The body of the event. This can be in plain text or HTML format, as specified by the 'is_html' field. Optional - events can be created without a body. |
| `is_html` | boolean | No | Specifies whether the 'body' content is HTML. Set to true for HTML content; otherwise, it's treated as plain text. |
| `show_as` | string | No | The status to show on the calendar for the duration of the event. Valid values are: 'free', 'tentative', 'busy', 'oof' (out of office), 'workingElsewhere', 'unknown'. |
| `subject` | string | Yes | The subject of the calendar event. |
| `user_id` | string | No | The user identifier for the calendar owner. Must be either 'me' (for the authenticated user), a Microsoft 365 User Principal Name (e.g., user@contoso.com - must be a work/school account in the organization's verified domain), or an Azure AD object ID (GUID). Personal email addresses (Gmail, Yahoo, Outlook.com consumer accounts, etc.) are NOT valid and will result in a 404 error. |
| `location` | string | No | The physical location of the event. |
| `time_zone` | string | Yes | The time zone for the start and end times of the event. Uses Windows time zone names (e.g., 'Pacific Standard Time') or IANA time zone names (e.g., 'America/Los_Angeles'). UTC is also a valid input. |
| `categories` | array | No | A list of category names to associate with the event. The API accepts any string values. For best compatibility with Outlook UI color-coding, use category names from the user's master category list. Category names are case-insensitive and duplicates will be automatically removed. |
| `importance` | string | No | The importance of the event. Valid values are 'low', 'normal', 'high'. Defaults to 'normal'. |
| `recurrence` | object | No | The recurrence pattern and range for an event. |
| `calendar_id` | string | No | The ID of a specific calendar to create the event in. Obtainable from the list calendars action. If omitted, the event is created on the user's default calendar. |
| `end_datetime` | string | Yes | The end date and time of the event in ISO 8601 format. Time zone is specified in 'time_zone'. |
| `attendees_info` | array | No | A list of attendees for the event. Accepts multiple formats: (1) Simple email strings (e.g., ['user@example.com']), (2) Attendee objects with 'email' (required), 'name' (optional), and 'type' (optional: 'required', 'optional', 'resource', defaults to 'required'), (3) Microsoft Graph-style objects with nested 'emailAddress' containing 'address' and 'name' fields. |
| `start_datetime` | string | Yes | The start date and time of the event in ISO 8601 format. Time zone is specified in 'time_zone'. |
| `is_online_meeting` | boolean | No | Set to true to indicate that the event is an online meeting. This will automatically generate an online meeting link if 'online_meeting_provider' is set (e.g., a Microsoft Teams link). |
| `online_meeting_provider` | string | No | Specifies the online meeting provider. Currently, only 'teamsForBusiness' is supported. If 'is_online_meeting' is true and this is set, a meeting link for the provider will be created. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Cancel user's calendar event

**Slug:** `OUTLOOK_CANCEL_CALENDAR_EVENT`

Tool to cancel an event in a specific calendar for a specified user and send cancellation notifications to all attendees. Use when you need to cancel a meeting or event in a specific calendar on behalf of a user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Comment` | string | No | Optional text message sent to all attendees explaining the cancellation. |
| `user_id` | string | Yes | The user ID or userPrincipalName of the calendar owner. Use 'me' for the authenticated user. |
| `event_id` | string | Yes | The unique identifier of the event to cancel. |
| `calendar_id` | string | Yes | The unique identifier of the calendar containing the event. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Cancel user calendar group event

**Slug:** `OUTLOOK_CANCEL_CALENDAR_GROUP_CALENDAR_EVENT`

Tool to cancel an event in a user's calendar within a calendar group and send cancellation notifications to all attendees. Use when canceling a meeting or event for a specific user in a calendar that belongs to a calendar group.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `comment` | string | No | Optional text message sent to all attendees explaining the cancellation. |
| `user_id` | string | Yes | The user ID or userPrincipalName of the calendar owner. Can be 'me' for the authenticated user or a specific user identifier. |
| `event_id` | string | Yes | The unique identifier of the event to cancel. |
| `calendar_id` | string | Yes | The ID of the calendar within the calendar group. |
| `calendar_group_id` | string | Yes | The ID of the calendar group containing the target calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Cancel user calendar event

**Slug:** `OUTLOOK_CANCEL_EVENT`

Tool to cancel a calendar event for a specified user and send cancellation notifications to all attendees. Use when you need to cancel a meeting or event on behalf of a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Comment` | string | No | Optional text message sent to all attendees explaining the cancellation. |
| `user_id` | string | Yes | The user ID or userPrincipalName of the calendar owner. Use 'me' for the authenticated user. |
| `event_id` | string | Yes | The unique identifier of the calendar event to cancel. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Copy user's mail folder

**Slug:** `OUTLOOK_COPY_MAIL_FOLDER`

Tool to copy a user's mail folder and its contents to another folder. Use when you need to duplicate a folder structure for a specific user's mailbox.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | Identifier of the user. Can be the user's ID, userPrincipalName (email address), or 'me' for the authenticated user. |
| `destination_id` | string | Yes | The folder ID or a well-known folder name where the folder should be copied to. The copied folder will be placed in this destination. |
| `mail_folder_id` | string | Yes | The ID of the mail folder to copy. Can be a folder ID or a well-known folder name (e.g., 'inbox', 'drafts', 'sentitems'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Copy child mail folder

**Slug:** `OUTLOOK_COPY_ME_MAIL_FOLDER`

Tool to copy a child mail folder to a destination folder. Use when you need to duplicate a folder structure.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's id, userPrincipalName, or 'me' for the signed-in user. |
| `destination_id` | string | Yes | The folder ID of the destination folder, or a well-known folder name. You can provide either the folder's Microsoft Graph ID (e.g., 'AAMkAGI0ZjExAAA=') or use a well-known name like 'inbox', 'drafts', 'sentitems', 'deleteditems', etc. |
| `mail_folder_id` | string | Yes | The ID of the parent mail folder containing the child folder to copy. |
| `child_folder_id` | string | Yes | The ID of the child folder to copy. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Copy message to folder

**Slug:** `OUTLOOK_COPY_MESSAGE`

Tool to copy an email message to another folder within the user's mailbox. Use when duplicating messages to multiple folders for organization.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `message_id` | string | Yes | Unique ID of the Outlook email message to copy. Must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. |
| `destination_id` | string | Yes | The destination folder ID, or a well-known folder name (e.g., 'inbox', 'deleteditems', 'drafts', 'sentitems'). If using a folder ID, it must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Copy message from child folder

**Slug:** `OUTLOOK_COPY_MESSAGE_FROM_CHILD_FOLDER`

Tool to copy an email message from a child folder (nested folder) to another folder within the user's mailbox. Use when duplicating messages from nested folder structures.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, user object ID, or 'me' for the currently authenticated user. |
| `message_id` | string | Yes | Unique ID of the Outlook email message to copy. Must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. |
| `destinationId` | string | Yes | The destination folder ID, or a well-known folder name (e.g., 'inbox', 'deleteditems', 'drafts', 'sentitems', 'junkemail'). If using a folder ID, it must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the parent mail folder. Common well-known names include: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. For folder IDs, obtain them from OUTLOOK_LIST_MAIL_FOLDERS. Folder IDs are base64-encoded strings (e.g., 'AAMkAGI0ZjExAAA='). |
| `child_folder_id` | string | Yes | The ID of the child folder containing the message. Obtain this from OUTLOOK_LIST_CHILD_MAIL_FOLDERS. Child folder IDs are base64-encoded strings (e.g., 'AAMkADAwATMwMAExAAA='). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Copy user message from folder

**Slug:** `OUTLOOK_COPY_MESSAGE_FROM_MAIL_FOLDER`

Tool to copy a message from a specific user's mail folder to another folder. Use when you need to duplicate a message from a known source folder to a destination folder for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `message_id` | string | Yes | Unique ID of the Outlook email message to copy. Must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. |
| `destinationId` | string | Yes | The destination folder ID, or a well-known folder name (e.g., 'inbox', 'deleteditems', 'drafts', 'sentitems'). If using a folder ID, it must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. |
| `mail_folder_id` | string | Yes | The ID of the source mail folder containing the message. Must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. Can also use well-known folder names (e.g., 'inbox', 'drafts', 'sentitems'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create attachment upload session

**Slug:** `OUTLOOK_CREATE_ATTACHMENT_UPLOAD_SESSION`

Tool to create an upload session for large (>3 MB) message attachments. Use when you need to upload attachments in chunks.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User ID or user principal name; use 'me' for the signed-in user. |
| `message_id` | string | Yes | The unique identifier of the message to attach to. |
| `attachment_item` | object | Yes | AttachmentItem object describing the attachment in the upload session. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create attachment upload session in child folder

**Slug:** `OUTLOOK_CREATE_ATTACHMENT_UPLOAD_SESSION_IN_CHILD_FOLDER`

Tool to create an upload session for large (>3 MB) message attachments in child mail folders. Use when you need to upload attachments to messages in nested folder structures.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User ID or user principal name; use 'me' for the signed-in user. |
| `message_id` | string | Yes | The unique identifier of the message to attach to. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the parent mail folder. ONLY these specific well-known names are valid as string names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. If the folder is not one of these well-known names, you MUST use the actual folder ID - a base64-encoded string (e.g., 'AAMkAGI0ZjExAAA='). |
| `attachment_item` | object | Yes | AttachmentItem object describing the attachment in the upload session. |
| `child_folder_id` | string | Yes | The unique identifier of the child mail folder. This is a base64-encoded string (e.g., 'AAMkAGI0ZjExAAA='). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create calendar

**Slug:** `OUTLOOK_CREATE_CALENDAR`

Tool to create a new calendar in the signed-in user's mailbox. Use when organizing events into a separate calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | The display name of the new calendar. |
| `color` | string ("auto" | "lightBlue" | "lightGreen" | "lightOrange" | "lightGray" | "lightYellow" | "lightTeal" | "lightPink" | "lightBrown" | "lightPurple" | "lightRed") | No | The theme color to assign to the calendar. Supported values: auto, lightBlue, lightGreen, lightOrange, lightGray, lightYellow, lightTeal, lightPink, lightBrown, lightPurple, lightRed. |
| `user_id` | string | No | The UPN (User Principal Name) or object ID of the user where the calendar will be created. Use 'me' for the signed-in user. |
| `hex_color` | string | No | An optional hexadecimal color code for the calendar in the format '#RRGGBB'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Event in Calendar (Deprecated)

**Slug:** `OUTLOOK_CREATE_CALENDAR_EVENT`

DEPRECATED: Use OUTLOOK_CREATE_USER_CALENDAR_CALENDAR_EVENT instead. Tool to create a new event in a specific Outlook calendar. Use when you need to add an event to a particular calendar by its ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `body` | string | No | The body of the event. This can be in plain text or HTML format, as specified by the 'is_html' field. Optional - events can be created without a body. |
| `is_html` | boolean | No | Specifies whether the 'body' content is HTML. Set to true for HTML content; otherwise, it's treated as plain text. |
| `show_as` | string | No | The status to show on the calendar for the duration of the event. Valid values are: 'free', 'tentative', 'busy', 'oof' (out of office), 'workingElsewhere', 'unknown'. |
| `subject` | string | Yes | The subject of the calendar event. |
| `user_id` | string | No | The user ID (GUID) or user principal name (email) of the user. Required for S2S (app-only) authentication. If not provided, defaults to the authenticated user (/me endpoint). |
| `location` | string | No | The physical location of the event. |
| `time_zone` | string | Yes | The time zone for the start and end times of the event. Uses Windows time zone names (e.g., 'Pacific Standard Time') or IANA time zone names (e.g., 'America/Los_Angeles'). UTC is also a valid input. |
| `categories` | array | No | A list of category names to associate with the event. The API accepts any string values. For best compatibility with Outlook UI color-coding, use category names from the user's master category list. Category names are case-insensitive and duplicates will be automatically removed. |
| `importance` | string | No | The importance of the event. Valid values are 'low', 'normal', 'high'. Defaults to 'normal'. |
| `recurrence` | object | No | The recurrence pattern and range for an event. |
| `calendar_id` | string | Yes | The ID of the calendar where the event will be created. Use calendar ID from the listCalendars action. |
| `end_datetime` | string | Yes | The end date and time of the event in ISO 8601 format. Time zone is specified in 'time_zone'. |
| `attendees_info` | array | No | A list of attendees for the event. Accepts multiple formats: (1) Simple email strings (e.g., ['user@example.com']), (2) Attendee objects with 'email' (required), 'name' (optional), and 'type' (optional: 'required', 'optional', 'resource', defaults to 'required'), (3) Microsoft Graph-style objects with nested 'emailAddress' containing 'address' and 'name' fields. |
| `start_datetime` | string | Yes | The start date and time of the event in ISO 8601 format. Time zone is specified in 'time_zone'. |
| `is_online_meeting` | boolean | No | Set to true to indicate that the event is an online meeting. This will automatically generate an online meeting link if 'online_meeting_provider' is set (e.g., a Microsoft Teams link). |
| `online_meeting_provider` | string | No | Specifies the online meeting provider. Currently, only 'teamsForBusiness' is supported. If 'is_online_meeting' is true and this is set, a meeting link for the provider will be created. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create calendar event attachment

**Slug:** `OUTLOOK_CREATE_CALENDAR_EVENT_ATTACHMENT`

Tool to create a new attachment for an event in a specific calendar. Use when you need to attach a file or item to an event within a particular calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item` | object | No | The nested item payload; required when '@odata.type' is itemAttachment. |
| `name` | string | Yes | The display name of the attachment. |
| `event_id` | string | Yes | The unique opaque identifier of the calendar event (NOT an email address). This is typically a long string starting with 'AAMkA' or 'AQMkA'. Obtain it from listing or searching calendar events. |
| `odata_type` | string ("#microsoft.graph.fileAttachment" | "#microsoft.graph.itemAttachment") | Yes | Attachment type: '#microsoft.graph.fileAttachment' requires 'contentBytes'; '#microsoft.graph.itemAttachment' requires 'item'. |
| `calendar_id` | string | Yes | The unique identifier of the calendar. This is typically a long string identifying the specific calendar. |
| `contentBytes` | string | No | MUST be base64-encoded file contents (not plain text); required when '@odata.type' is fileAttachment. Raw/plain text must be base64-encoded first. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create calendar event attachment upload session

**Slug:** `OUTLOOK_CREATE_CALENDAR_EVENT_ATTACHMENT_UPLOAD_SESSION`

Tool to create an upload session for large calendar event attachments in a specific calendar. Use when attaching files larger than 3 MB to Outlook calendar events in a specific calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user ID (GUID) or user principal name (email) whose calendar contains the event. Required for S2S (app-only) authentication. If not provided, uses the authenticated user context (/me endpoint). |
| `event_id` | string | Yes | The unique identifier of the calendar event to attach the file to. Obtain from listing or searching calendar events. |
| `calendar_id` | string | Yes | The unique identifier of the calendar containing the event. Obtain from listing calendars. |
| `attachment_item` | object | Yes | AttachmentItem object specifying the type, name, and size of the attachment to upload. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create event in specific calendar

**Slug:** `OUTLOOK_CREATE_CALENDAR_EVENT_IN_CALENDAR`

Tool to create a new event in a specific calendar for a user. Use when you need to create events in a specific calendar (e.g., shared or secondary calendars).

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `end` | object | Yes | The end date, time, and time zone of the event. |
| `body` | object | No | The body content of an event. |
| `start` | object | Yes | The start date, time, and time zone of the event. |
| `subject` | string | Yes | The subject/title of the event. |
| `user_id` | string | Yes | The user identifier for the calendar owner. Must be either 'me' (for the authenticated user), a Microsoft 365 User Principal Name (e.g., user@contoso.com), or an Azure AD object ID (GUID). |
| `location` | object | No | Location information for an event. |
| `attendees` | array | No | A list of attendees for the event. Optional - events can be created without attendees. |
| `recurrence` | object | No | The recurrence pattern and range for an event. |
| `calendar_id` | string | Yes | The unique identifier of the calendar where the event will be created. This allows creating events in specific calendars (e.g., shared calendars, secondary calendars). |
| `isOnlineMeeting` | boolean | No | True to indicate that the event is an online meeting. This will automatically generate an online meeting link if onlineMeetingProvider is set. |
| `allowNewTimeProposals` | boolean | No | True if the meeting organizer allows invitees to propose a new time when responding. Default is true. |
| `onlineMeetingProvider` | string | No | The online meeting provider. Currently, only 'teamsForBusiness' is supported. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create calendar group

**Slug:** `OUTLOOK_CREATE_CALENDAR_GROUP`

Tool to create a new calendar group for a user. Use when needing to organize calendars into groups.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | The name of the calendar group. |
| `user_id` | string | Yes | The user's principal name (UPN) or object ID. Must be an actual user ID (not 'me'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user calendar group event attachment

**Slug:** `OUTLOOK_CREATE_CALENDAR_GROUP_CALENDAR_EVENT_ATTACHMENT`

Tool to create a new attachment for an event in a calendar within a calendar group for a specific user. Use when you need to attach a file or item to an event in a user's calendar group.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item` | object | No | The nested item payload; required when '@odata.type' is itemAttachment. |
| `name` | string | Yes | The display name of the attachment. |
| `user_id` | string | No | The unique identifier of the user. Can use 'me' as shortcut for authenticated user. |
| `event_id` | string | Yes | The unique opaque identifier of the calendar event (NOT an email address). This is typically a long string starting with 'AAMkA' or 'AQMkA'. Obtain it from listing or searching calendar events. |
| `odata_type` | string ("#microsoft.graph.fileAttachment" | "#microsoft.graph.itemAttachment") | Yes | Attachment type: '#microsoft.graph.fileAttachment' requires 'contentBytes'; '#microsoft.graph.itemAttachment' requires 'item'. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `content_bytes` | string | No | MUST be base64-encoded file contents (not plain text); required when '@odata.type' is fileAttachment. Raw/plain text must be base64-encoded first. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group containing the target calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create event extension

**Slug:** `OUTLOOK_CREATE_CALENDAR_GROUP_CALENDAR_EVENT_EXTENSION`

Tool to create a new open extension on a calendar event within a specific calendar group and calendar. Use when you need to store custom data with an event.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The unique identifier of the user. Can use 'me' as shortcut for authenticated user. |
| `event_id` | string | Yes | The unique identifier of the calendar event to add the extension to. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `extension_name` | string | Yes | The unique name for the extension. Must follow the format 'Com.Company.ExtensionName' (e.g., Com.Contoso.EventTest). |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group. |
| `custom_properties` | object | No | Custom properties to store in the extension as key-value pairs. Each property can be a string, number, or boolean value. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Calendar Permission

**Slug:** `OUTLOOK_CREATE_CALENDAR_PERMISSION`

Tool to create a calendar permission for a specific calendar in a calendar group. Use when granting access to a calendar for another user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string ("none" | "freeBusyRead" | "limitedRead" | "read" | "write" | "delegateWithoutPrivateEventAccess" | "delegateWithPrivateEventAccess" | "custom") | Yes | The permission role to grant. Options: none (no access), freeBusyRead (view availability only), limitedRead (view availability and titles), read (view all event details), write (view and edit events), delegateWithoutPrivateEventAccess (delegate access excluding private events), delegateWithPrivateEventAccess (full delegate access including private events), custom (custom permissions). |
| `user_id` | string | No | User ID or userPrincipalName. Use 'me' for the signed-in user. |
| `calendar_id` | string | Yes | The ID of the calendar to which the permission will be added. |
| `isRemovable` | boolean | No | True if the permission can be removed by the user, false otherwise. Optional. |
| `emailAddress` | object | Yes | Email address object containing the name and address of the person receiving the permission. |
| `calendar_group_id` | string | Yes | The ID of the calendar group containing the calendar. |
| `isInsideOrganization` | boolean | No | True if the user is inside the same organization as the calendar owner, false otherwise. Optional. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create calendar group event attachment upload session

**Slug:** `OUTLOOK_CREATE_CAL_GROUP_EVENT_ATTACH_UPLOAD`

Tool to create an upload session for large calendar group event attachments. Use when attaching files larger than 3 MB to events in calendar groups.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The user ID or user principal name. Use 'me' for the authenticated user. |
| `event_id` | string | Yes | The unique identifier of the calendar event to attach the file to. Obtain from listing or searching calendar events. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. Obtain from listing calendars in the group. |
| `attachment_item` | object | Yes | AttachmentItem object specifying the type, name, and size of the attachment to upload. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group. Obtain from listing calendar groups. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create contact

**Slug:** `OUTLOOK_CREATE_CONTACT`

Creates a new contact in a Microsoft Outlook user's contacts folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notes` | string | No | Personal notes about the contact. These notes are stored as 'personalNotes' in the Outlook contact details. |
| `userId` | string | No | Identifier for the user whose contact list will be modified. Use 'me' for the authenticated user (recommended), or provide the user's object ID (GUID) or userPrincipalName (UPN). The UPN is typically in email format (e.g., 'user@contoso.com') and must match an existing user in your Azure AD tenant. |
| `surname` | string | No | The contact's surname (last name). |
| `birthday` | string | No | The contact's birthday in 'YYYY-MM-DD' format. The time component will be set to midnight UTC (e.g., '1990-01-01' becomes '1990-01-01T00:00:00Z' in the API request). |
| `jobTitle` | string | No | The contact's job title. |
| `givenName` | string | No | The contact's given (first) name. |
| `homePhone` | string | No | The contact's home phone number. If provided, this will be stored in Outlook as a list containing this single number. |
| `categories` | array | No | A list of categories to assign to the contact. |
| `department` | string | No | The department the contact belongs to within their company. |
| `companyName` | string | No | The name of the company the contact is associated with. |
| `displayName` | string | No | The contact's display name, typically their full name. |
| `mobilePhone` | string | No | The contact's mobile phone number. |
| `businessPhones` | array | No | A list of business phone numbers for the contact. Each number should be a string. |
| `emailAddresses` | array | No | A list of email addresses for the contact. Each item must be an object with an `address` field (string) and optionally a `name` field (e.g., `[{'address': 'jane@example.com', 'name': 'Jane Doe'}]`). Plain strings are not accepted. |
| `officeLocation` | string | No | The contact's office location. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create contact folder

**Slug:** `OUTLOOK_CREATE_CONTACT_FOLDER`

Tool to create a new contact folder in the user's mailbox. Use when needing to organize contacts into custom folders.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's principal name or object ID. Use 'me' for the authenticated user. |
| `display_name` | string | Yes | The display name of the new contact folder. |
| `parent_folder_id` | string | No | The ID of the parent contact folder. If omitted, created under the default contacts folder. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user contact folder child folder

**Slug:** `OUTLOOK_CREATE_CONTACT_FOLDER_CHILD_FOLDER`

Tool to create a child contact folder within a parent contact folder for a specific user. Use when you need to organize contacts into nested folder hierarchies for a given user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. Can use 'me' as a shortcut for the authenticated user, or provide user ID or userPrincipalName. |
| `displayName` | string | Yes | The display name of the new child contact folder. |
| `contact_folder_id` | string | Yes | The ID of the parent contact folder under which to create the child folder. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create email draft

**Slug:** `OUTLOOK_CREATE_DRAFT`

Creates a new Outlook email draft with subject, body, recipients, and an optional attachment. This action creates a standalone draft for new conversations. To create a draft reply to an existing conversation/message, use the OUTLOOK_CREATE_DRAFT_REPLY action instead.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `body` | string | Yes | Content of the email draft; use `is_html` to specify if HTML or plain text. |
| `is_html` | boolean | No | Specifies if the `body` is HTML. If `False`, `body` is plain text. Set to `True` when `body` contains HTML markup; otherwise markup renders as literal text. |
| `subject` | string | Yes | Subject line for the email draft. |
| `user_id` | string | No | User ID (GUID) or user principal name (email) for S2S (app-only) authentication. Required when using application permissions. If not provided, defaults to '/me' endpoint for delegated authentication. |
| `attachment` | string | No | Optional file(s) to attach. Accepts a single file or a list of files. |
| `cc_recipients` | array | No | Optional list of CC (carbon copy) recipient email addresses. Must be provided as an array of strings, e.g., ["cc@example.com"]. |
| `to_recipients` | array | No | Optional list of primary 'To' recipient email addresses. Must be provided as an array of strings, e.g., ["user@example.com"] for a single recipient or ["user1@example.com", "user2@example.com"] for multiple recipients. Do not pass as a JSON-encoded string. Can be omitted when creating a draft to be completed later. To send the draft, at least one valid address must be present across `to_recipients`, `cc_recipients`, or `bcc_recipients`. |
| `bcc_recipients` | array | No | Optional list of BCC (blind carbon copy) recipient email addresses. Must be provided as an array of strings, e.g., ["bcc@example.com"]. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create a draft reply

**Slug:** `OUTLOOK_CREATE_DRAFT_REPLY`

Creates a draft reply in the specified user's Outlook mailbox to an existing message (identified by a valid `message_id`), optionally including a `comment` and CC/BCC recipients.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `comment` | string | No | Plain text comment to include in the body of the reply draft. |
| `user_id` | string | No | User's mailbox identifier (email or 'me') for the original message and new draft location. |
| `cc_emails` | array | No | List of email addresses to add as CC recipients to the draft reply. |
| `bcc_emails` | array | No | List of email addresses to add as BCC recipients to the draft reply. |
| `message_id` | string | Yes | Required. Unique ID of the message to reply to. Obtain this from actions like 'List Messages', 'Get Message', or 'Search Messages'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Email Rule

**Slug:** `OUTLOOK_CREATE_EMAIL_RULE`

Create email rule filter with conditions and actions

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `actions` | object | Yes | Actions to take when the rule conditions are met. |
| `user_id` | string | No | User ID or principal name for app-only (S2S) authentication. Required for application permissions. Use the user's GUID or email address (e.g., '43f0c14d-bca8-421f-b762-c3d8dd75be1f' or 'user@domain.com'). |
| `sequence` | integer | No | Order in which the rule is executed (lower numbers execute first, minimum value is 1). |
| `conditions` | object | Yes | Conditions that must be met for the rule to apply. |
| `is_enabled` | boolean | No | Whether the rule is enabled. |
| `display_name` | string | Yes | Display name for the email rule. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user calendar event attachment

**Slug:** `OUTLOOK_CREATE_EVENT_ATTACHMENT`

Tool to create a new attachment for a user's calendar event. Use when you need to attach a file or item to an existing event in a specific user's calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item` | object | No | The nested item payload; required when '@odata.type' is '#microsoft.graph.itemAttachment'. |
| `name` | string | Yes | The display name of the attachment. |
| `user_id` | string | Yes | The user's email address or user ID. Use 'me' for the authenticated user or provide the user's email address. |
| `event_id` | string | Yes | The unique opaque identifier of the calendar event. This is typically a long string starting with 'AAMkA' or 'AQMkA'. Obtain it from listing or searching calendar events. |
| `odata_type` | string ("#microsoft.graph.fileAttachment" | "#microsoft.graph.itemAttachment") | Yes | Attachment type: '#microsoft.graph.fileAttachment' requires 'contentBytes'; '#microsoft.graph.itemAttachment' requires 'item'. |
| `contentBytes` | string | No | MUST be base64-encoded file contents (not plain text); required when '@odata.type' is '#microsoft.graph.fileAttachment'. Raw/plain text must be base64-encoded first. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create event attachment upload session

**Slug:** `OUTLOOK_CREATE_EVENT_ATTACHMENT_UPLOAD_SESSION`

Tool to create an upload session for large calendar event attachments. Use when attaching files larger than 3 MB to Outlook calendar events.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User ID or user principal name; use 'me' for the authenticated user. |
| `event_id` | string | Yes | The unique identifier of the calendar event to attach the file to. Obtain from listing or searching calendar events. |
| `attachmentItem` | object | Yes | AttachmentItem object specifying the type, name, and size of the attachment to upload. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user mail folder message forward draft

**Slug:** `OUTLOOK_CREATE_FORWARD_DRAFT`

Tool to create a forward draft of an Outlook message for a specific user. Use when you need to prepare a forward email that can be edited before sending. The draft is created in the Drafts folder with the FW: prefix in the subject line.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `comment` | string | No | Optional comment to include in the body of the forward draft. This text appears before the original message content. |
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. Use 'me' to access your own mailbox or specify another user's email address. |
| `message_id` | string | Yes | The unique identifier of the message to create a forward draft for. This is a base64-encoded string typically starting with 'AAMk' or 'AQMk'. Obtain this from list messages, get message, or search messages actions. Do NOT use email addresses or conversation IDs. |
| `toRecipients` | array | No | Optional list of email addresses to set as recipients for the forward draft. Recipients can be added or modified later by updating the draft before sending. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the mail folder containing the message. Valid well-known names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. For other folders, use the base64-encoded folder ID obtained from list mail folders actions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create mail folder

**Slug:** `OUTLOOK_CREATE_MAIL_FOLDER`

Tool to create a new mail folder. Use when you need to organize email into a new folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | Identifier for the user whose mailbox the folder will be created in. Use 'me' for the authenticated user or provide the user's principal name or ID. |
| `is_hidden` | boolean | No | Indicates whether the new folder is hidden. Default is false. Once set, this property cannot be updated. |
| `display_name` | string | Yes | The display name of the new mail folder. |
| `return_existing_if_exists` | boolean | No | If true and a folder with the same name already exists, return the existing folder instead of raising an error. This makes the operation idempotent. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create message in mail folder

**Slug:** `OUTLOOK_CREATE_MAIL_FOLDER_MESSAGE`

Tool to create a new message in a specific mail folder. Use when you need to create a draft message in a particular folder (e.g., drafts, custom folders).

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `body` | object | No | Message body content with content type. |
| `subject` | string | No | The subject line of the message. |
| `user_id` | string | No | User's id, userPrincipalName, or 'me' for the signed-in user. |
| `folder_id` | string | Yes | The ID or well-known name of the mail folder where the message will be created. ONLY these specific well-known names are valid as string names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. If the folder is not one of these well-known names, you MUST use the actual folder ID - a base64-encoded string (e.g., 'AAMkAGI0ZjExAAA=') obtained from OUTLOOK_LIST_MAIL_FOLDERS or OUTLOOK_LIST_CHILD_MAIL_FOLDERS. |
| `ccRecipients` | array | No | The Cc: recipients for the message. |
| `toRecipients` | array | No | The To: recipients for the message. |
| `bccRecipients` | array | No | The Bcc: recipients for the message. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create mail folder message attachment

**Slug:** `OUTLOOK_CREATE_MAIL_FOLDER_MESSAGE_ATTACHMENT`

Tool to add an attachment to a message in a specific mail folder. Use when you need to attach a file to a message located in a particular mail folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item` | object | No | Embedded item (e.g., message, event) for itemAttachment; must include its own '@odata.type'. |
| `name` | string | No | Display name of the attachment (e.g., file name). Required when using content_bytes. When using the attachment field, the name is automatically inferred. |
| `user_id` | string | No | The user ID or user principal name (email) to access mailbox data for. Required for app-only (S2S) authentication. For delegated auth, uses /me endpoint. Can be a GUID (e.g., '43f0c14d-bca8-421f-b762-c3d8dd75be1f') or email (e.g., 'user@domain.com'). |
| `isInline` | boolean | No | Set to true if the attachment should appear inline in the message body. |
| `contentId` | string | No | Content ID for inline attachments, used in HTML body references. |
| `attachment` | object | No | File to attach to the email. Either provide this field OR use 'content_bytes'. Cannot be used together with 'content_bytes'. |
| `message_id` | string | Yes | Unique Microsoft Graph message ID (opaque string like 'AAMkAGI2TAAA='). NOT an email address - this is an internal identifier returned by Microsoft Graph API operations. |
| `odata_type` | string | No | The OData type of the attachment. Required by Microsoft Graph API. Use '#microsoft.graph.fileAttachment' for file attachments, '#microsoft.graph.itemAttachment' for embedded items (messages, events, contacts). |
| `contentType` | string | No | MIME type of the attachment (e.g., 'application/pdf'). Required when using content_bytes. When using the attachment field, the mimetype is automatically inferred. |
| `contentBytes` | string | No | Base64-encoded content of the file attachment (max size 3 MB). Either provide this field OR use the 'attachment' field (recommended). Cannot be used together with 'attachment'. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the mail folder containing the message. ONLY these specific well-known names are valid as string names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. Arbitrary folder names are NOT valid. If the folder is not one of these well-known names, you MUST use the actual folder ID - a base64-encoded string (e.g., 'AAMkAGI0ZjExAAA=') obtained from list mail folders operations. |
| `contentLocation` | string | No | URL location or path for reference attachments. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create mail folder message attachment upload session

**Slug:** `OUTLOOK_CREATE_MAIL_FOLDER_MESSAGE_ATTACHMENT_UPLOAD_SESSION`

Tool to create an upload session for large (>3 MB) message attachments in a specific mail folder. Use when you need to upload attachments in chunks to a message located in a mail folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User ID or user principal name; use 'me' for the signed-in user. |
| `message_id` | string | Yes | The unique identifier of the message to attach to. |
| `mail_folder_id` | string | Yes | The unique identifier of the mail folder containing the message. |
| `attachment_item` | object | Yes | AttachmentItem object describing the attachment in the upload session. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create User Mail Folder Message Rule

**Slug:** `OUTLOOK_CREATE_MAIL_FOLDER_MESSAGE_RULE`

Tool to create a message rule in a user's mail folder. Use when automating message processing with filters and actions.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `actions` | object | Yes | Actions to take when the rule conditions are met. |
| `user_id` | string | No | The unique identifier of the user. Can use 'me' shortcut for /me/ path or actual user ID for /users/{user_id}/ path. |
| `sequence` | integer | Yes | Order in which the rule is executed (lower numbers execute first, minimum value is 1). |
| `conditions` | object | No | Conditions that trigger the rule actions. |
| `exceptions` | object | No | Conditions that trigger the rule actions. |
| `is_enabled` | boolean | No | Whether the rule is enabled. |
| `display_name` | string | Yes | Display name for the message rule. |
| `mail_folder_id` | string | Yes | The ID of the mail folder where the message rule will be created. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create master category (Deprecated)

**Slug:** `OUTLOOK_CREATE_MASTER_CATEGORY`

DEPRECATED: Use OUTLOOK_CREATE_USER_MASTER_CATEGORY instead. Tool to create a new category in the user's master category list. Use after selecting a unique display name.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `color` | string ("preset0" | "preset1" | "preset2" | "preset3" | "preset4" | "preset5" | "preset6" | "preset7" | "preset8" | "preset9" | "preset10" | "preset11" | "preset12" | "preset13" | "preset14" | "preset15" | "preset16" | "preset17" | "preset18" | "preset19" | "preset20" | "preset21" | "preset22" | "preset23" | "preset24") | No | A pre-set color constant for the category. Allowed values: preset0 through preset24. |
| `user_id` | string | No | The user ID (GUID or email) for which to create the master category. Required for S2S (Service-to-Service) authentication. If not provided, uses /me endpoint (requires delegated authentication). |
| `display_name` | string | Yes | Unique name that identifies the category in the user's mailbox. Verify uniqueness by checking all paginated pages of OUTLOOK_GET_MASTER_CATEGORIES before creation; duplicate displayName will cause creation failure. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user calendar event extension

**Slug:** `OUTLOOK_CREATE_ME_CALENDAR_EVENT_EXTENSION`

Tool to create a new open extension on a calendar event for a specific user. Use when you need to store custom data with an event.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user identifier for the calendar owner. Must be either 'me' (for the authenticated user), a Microsoft 365 User Principal Name (e.g., user@contoso.com), or an Azure AD object ID (GUID). |
| `event_id` | string | Yes | The unique identifier of the calendar event to add the extension to. |
| `calendar_id` | string | Yes | The unique identifier of the calendar containing the event. |
| `extension_name` | string | Yes | The unique name for the extension. Must follow the format 'Com.Company.ExtensionName' (e.g., Com.Contoso.TestExtension). |
| `custom_properties` | object | No | Custom properties to store in the extension as key-value pairs. Each property can be a string, number, or boolean value. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user calendar permission

**Slug:** `OUTLOOK_CREATE_ME_CALENDAR_PERMISSION`

Tool to create a new calendar permission for a specific user's calendar. Use when you need to share another user's calendar with someone or grant access with specific permission levels.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string ("freeBusyRead" | "limitedRead" | "read" | "write") | Yes | The permission role to grant. freeBusyRead: view free/busy status only. limitedRead: view free/busy status, titles and locations. read: view all details except private events. write: view all details except private events and edit events. |
| `user_id` | string | Yes | The unique identifier of the user whose calendar permissions will be modified. Cannot use 'me' shortcut - must be actual user ID or userPrincipalName. |
| `calendar_id` | string | Yes | The unique identifier of the calendar to which permissions will be added. |
| `isRemovable` | boolean | No | Whether the permission can be removed in the future. If set to true, the recipient can later be removed from the calendar permissions. Optional parameter. |
| `emailAddress` | object | Yes | Email address information (name and address) of the person or entity to grant calendar permission to. |
| `isInsideOrganization` | boolean | No | Whether the recipient is inside the same organization as the calendar owner. Optional parameter. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create message in user's child folder

**Slug:** `OUTLOOK_CREATE_ME_CHILD_FOLDER_MESSAGE`

Tool to create a new draft message in a child folder within a user's mail folder. Use when creating messages in nested folder structures for a specific user's mailbox.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `body` | object | No | The body of the message. |
| `subject` | string | No | The subject of the message. |
| `user_id` | string | Yes | Identifier of the user. Can be the user's ID, userPrincipalName (email address), or 'me' for the authenticated user. |
| `categories` | array | No | A list of categories to assign to the message. |
| `importance` | string | No | The importance of the message. Possible values are 'low', 'normal', or 'high'. |
| `ccRecipients` | array | No | The Cc: recipients for the message. |
| `toRecipients` | array | No | The To: recipients for the message. |
| `bccRecipients` | array | No | The Bcc: recipients for the message. |
| `mail_folder_id` | string | Yes | Identifier of the parent mail folder. Must be a valid mail folder ID. |
| `child_folder_id` | string | Yes | Identifier of the child folder where the message will be created. Must be a valid child folder ID within the specified parent mail folder. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user contact in folder

**Slug:** `OUTLOOK_CREATE_ME_CONTACT_FOLDERS_CONTACTS`

Tool to create a new contact in a specific user's contact folder. Use when you need to add a contact to a particular folder for a specified user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notes` | string | No | Personal notes about the contact. These notes are stored as 'personalNotes' in the Outlook contact details. |
| `userId` | string | Yes | The unique identifier of the user whose contact folder will be modified. Can be the user's object ID (GUID) or userPrincipalName (e.g., 'user@contoso.com'). |
| `surname` | string | No | The contact's surname (last name). |
| `birthday` | string | No | The contact's birthday in 'YYYY-MM-DD' format. The time component will be set to midnight UTC (e.g., '1990-01-01' becomes '1990-01-01T00:00:00Z' in the API request). |
| `jobTitle` | string | No | The contact's job title. |
| `givenName` | string | No | The contact's given (first) name. |
| `homePhone` | string | No | The contact's home phone number. If provided, this will be stored in Outlook as a list containing this single number. |
| `categories` | array | No | A list of categories to assign to the contact. |
| `department` | string | No | The department the contact belongs to within their company. |
| `companyName` | string | No | The name of the company the contact is associated with. |
| `displayName` | string | No | The contact's display name, typically their full name. |
| `mobilePhone` | string | No | The contact's mobile phone number. |
| `businessPhones` | array | No | A list of business phone numbers for the contact. Each number should be a string. |
| `emailAddresses` | array | No | A list of email addresses for the contact. |
| `officeLocation` | string | No | The contact's office location. |
| `contactFolderId` | string | Yes | Identifier of the contact folder where the new contact will be created. Must be a valid contact folder ID obtained from 'Get Contact Folders' or 'List Contact Folders'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user contact extension

**Slug:** `OUTLOOK_CREATE_ME_CONTACT_FOLDERS_CONTACTS_EXTENSIONS`

Tool to create a new open extension on a contact within a user's contact folder. Use when you need to store custom data with a contact.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. Can be the user's object ID (GUID) or userPrincipalName (e.g., 'user@contoso.com'). |
| `contact_id` | string | Yes | The unique identifier of the contact to add the extension to. |
| `extension_name` | string | Yes | The unique name for the extension. Must follow reverse DNS format (e.g., com.contoso.extensionName). |
| `contact_folder_id` | string | Yes | The unique identifier of the contact folder containing the contact. |
| `custom_properties` | object | No | Custom properties to store in the extension as key-value pairs. Each property can be a string, number, or boolean value. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create contact extension

**Slug:** `OUTLOOK_CREATE_ME_CONTACT_FOLDERS_EXTENSIONS`

Tool to create a new open extension on a contact within a child folder. Use when you need to store custom data with a contact.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The unique identifier or user principal name (UPN) of the user. Required for S2S (app-only) authentication. If not provided, uses /me/ endpoint for delegated authentication. |
| `contact_id` | string | Yes | The unique identifier of the contact to add the extension to. |
| `extension_name` | string | Yes | The unique name for the extension. Must follow reverse DNS format (e.g., com.contoso.extensionName). |
| `child_folder_id` | string | Yes | The unique identifier of the child folder within the contact folder. |
| `contact_folder_id` | string | Yes | The unique identifier of the contact folder. |
| `custom_properties` | object | No | Custom properties to store in the extension as key-value pairs. Each property can be a string, number, or boolean value. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create contact in child folder

**Slug:** `OUTLOOK_CREATE_ME_CONTACT_IN_CHILD_FOLDER`

Tool to create a new contact in a child folder within a contact folder. Use when you need to add a contact to a specific nested folder structure.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notes` | string | No | Personal notes about the contact. These notes are stored as 'personalNotes' in the Outlook contact details. |
| `surname` | string | No | The contact's surname (last name). |
| `user_id` | string | No | The user's principal name or object ID. Use 'me' for the authenticated user. |
| `birthday` | string | No | The contact's birthday in 'YYYY-MM-DD' format. The time component will be set to midnight UTC (e.g., '1990-01-01' becomes '1990-01-01T00:00:00Z' in the API request). |
| `jobTitle` | string | No | The contact's job title. |
| `givenName` | string | No | The contact's given (first) name. |
| `homePhone` | string | No | The contact's home phone number. If provided, this will be stored in Outlook as a list containing this single number. |
| `categories` | array | No | A list of categories to assign to the contact. |
| `department` | string | No | The department the contact belongs to within their company. |
| `companyName` | string | No | The name of the company the contact is associated with. |
| `displayName` | string | No | The contact's display name, typically their full name. |
| `mobilePhone` | string | No | The contact's mobile phone number. |
| `businessPhones` | array | No | A list of business phone numbers for the contact. Each number should be a string. |
| `emailAddresses` | array | No | A list of email addresses for the contact. |
| `officeLocation` | string | No | The contact's office location. |
| `child_folder_id` | string | Yes | Identifier of the child folder within the contact folder where the new contact will be created. |
| `contact_folder_id` | string | Yes | Identifier of the parent contact folder. Must be a valid contact folder ID. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create calendar event for user

**Slug:** `OUTLOOK_CREATE_ME_EVENT`

Tool to create a new calendar event for a specific user. Use when you need to create events in a user's calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `end` | object | Yes | The end date, time, and time zone of the event. |
| `body` | object | No | The body content of an event. |
| `start` | object | Yes | The start date, time, and time zone of the event. |
| `subject` | string | Yes | The subject/title of the event. |
| `user_id` | string | No | The user identifier for the calendar owner. Must be either 'me' (for the authenticated user), a Microsoft 365 User Principal Name (e.g., user@contoso.com), or an Azure AD object ID (GUID). |
| `location` | object | No | Location information for an event. |
| `attendees` | array | No | A list of attendees for the event. Optional - events can be created without attendees. |
| `isOnlineMeeting` | boolean | No | True to indicate that the event is an online meeting. This will automatically generate an online meeting link if onlineMeetingProvider is set. |
| `allowNewTimeProposals` | boolean | No | True if the meeting organizer allows invitees to propose a new time when responding. Default is true. |
| `onlineMeetingProvider` | string | No | The online meeting provider. Currently, only 'teamsForBusiness' is supported. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create me event attachment upload session

**Slug:** `OUTLOOK_CREATE_ME_EVENT_ATTACHMENT_UPLOAD_SESSION`

Tool to create an upload session for large event attachments. Use when attaching files larger than 3 MB to the authenticated user's Outlook events.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user ID (GUID) or user principal name (email) to create the upload session for. Required for S2S (app-only) authentication. If not provided, uses the authenticated user context (/me endpoint). |
| `event_id` | string | Yes | The unique identifier of the event to attach the file to. Obtain from listing or searching events. |
| `attachment_item` | object | Yes | AttachmentItem object specifying the type, name, and size of the attachment to upload. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create forward draft

**Slug:** `OUTLOOK_CREATE_ME_FORWARD_DRAFT`

Tool to create a draft forward of an existing message. Use when you need to prepare a forward that can be edited before sending. The draft can be updated with recipients and additional content before being sent.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `comment` | string | No | Optional comment to include in the body of the forward draft. |
| `user_id` | string | No | User's mailbox identifier (email or 'me') for the original message and new draft location. |
| `message_id` | string | Yes | Required. Unique ID of the message to forward. Obtain this from actions like 'List Messages', 'Get Message', or 'Search Messages'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user Focused Inbox override

**Slug:** `OUTLOOK_CREATE_ME_INFERENCE_CLASSIFICATION_OVERRIDE`

Tool to create a Focused Inbox override for a sender identified by SMTP address for a specific user. Use when you need to configure messages from a specific sender to always be classified as focused or other for a particular user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. Can be user ID (GUID) or user principal name (UPN). |
| `classify_as` | string ("focused" | "other") | Yes | How messages from the specified sender should always be classified. Must be either 'focused' or 'other'. |
| `sender_email_address` | object | Yes | Email address information for the sender to create the override for. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create reply-all draft for mail folder message

**Slug:** `OUTLOOK_CREATE_ME_MAIL_FOLDER_MESSAGE_REPLY_ALL_DRAFT`

Deprecated: Use OUTLOOK_CREATE_REPLY_ALL_DRAFT instead, which supports both /me and /users/{user_id} endpoints with timezone support.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `comment` | string | No | Optional plain text comment to include in the body of the reply-all draft. |
| `user_id` | string | No | The user ID or principal name (email) of the user to create a reply-all draft for. Required for app-only (S2S) authentication. Use either the GUID format (e.g., '43f0c14d-bca8-421f-b762-c3d8dd75be1f') or email format (e.g., 'user@domain.com'). If not provided, defaults to '/me' endpoint for delegated authentication. |
| `message_id` | string | Yes | The unique identifier of the message to create a reply-all draft for. This is a base64-encoded string typically starting with 'AAMk' or 'AQMk'. Obtain this from list messages, get message, or search messages actions. Do NOT use email addresses or conversation IDs. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the mail folder containing the message. Valid well-known names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. For other folders, use the base64-encoded folder ID obtained from list mail folders actions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create reply-all draft for user message

**Slug:** `OUTLOOK_CREATE_ME_MESSAGE_REPLY_ALL_DRAFT`

Tool to create a draft reply-all to a user's message. Use when you need to create a draft reply to the sender and all recipients of an email message in a user's mailbox.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `comment` | string | No | Optional plain text comment to include in the body of the reply-all draft. |
| `user_id` | string | Yes | User's email address, user principal name (UPN), or 'me' for the currently authenticated user. Use 'me' to access your own mailbox or specify another user's email address. |
| `message_id` | string | Yes | The unique identifier of the message to create a reply-all draft for. This is a base64-encoded string typically starting with 'AAMk' or 'AQMk'. Obtain this from list messages, get message, or search messages actions. Do NOT use email addresses or conversation IDs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create reply-all draft for child folder message

**Slug:** `OUTLOOK_CREATE_ME_REPLY_ALL_DRAFT`

Tool to create a draft reply-all to a message in a child folder. Use when you need to create a draft reply to the sender and all recipients of a message located in a subfolder within a mail folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `comment` | string | No | Optional plain text comment to include in the body of the reply-all draft. |
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. Use 'me' to access your own mailbox or specify another user's email address. |
| `message_id` | string | Yes | The unique identifier of the message to create a reply-all draft for. This is a base64-encoded string typically starting with 'AAMk' or 'AQMk'. Obtain this from list messages, get message, or search messages actions. Do NOT use email addresses or conversation IDs. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the parent mail folder. Valid well-known names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. For other folders, use the base64-encoded folder ID obtained from list mail folders actions. |
| `child_folder_id` | string | Yes | The ID of the child folder (subfolder) within the parent mail folder. This is a base64-encoded folder ID obtained from list mail folders actions. Child folders are nested folders within a parent folder. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create reply draft

**Slug:** `OUTLOOK_CREATE_ME_REPLY_DRAFT`

Deprecated: Use OUTLOOK_CREATE_DRAFT_REPLY instead, which adds comment, cc_emails, and bcc_emails support.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's mailbox identifier. Use 'me' for the authenticated user or provide a specific user ID. |
| `message_id` | string | Yes | The unique identifier of the message to create a reply draft for. Must be a non-draft message. Typically a base64-encoded string obtained from list messages or search messages actions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create message attachment

**Slug:** `OUTLOOK_CREATE_MESSAGE_ATTACHMENT`

Tool to create an attachment for a message. Use when you need to attach a file or item to an existing message. Supports file attachments, item attachments, and reference attachments.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item` | object | No | Generic payload for item attachments. Accepts any additional fields. |
| `name` | string | Yes | The display name of the attachment. |
| `user_id` | string | No | User ID or userPrincipalName. Use 'me' for the authenticated user. For S2S connections, pass the specific user ID. |
| `isInline` | boolean | No | Set to true if the attachment should appear inline in the message body. |
| `contentId` | string | No | Content ID for inline attachments, used in HTML body references. |
| `message_id` | string | Yes | The unique identifier of the message to add the attachment to. |
| `odata_type` | string ("#microsoft.graph.fileAttachment" | "#microsoft.graph.itemAttachment" | "#microsoft.graph.referenceAttachment") | Yes | Type of attachment to create. Use '#microsoft.graph.fileAttachment' for files, '#microsoft.graph.itemAttachment' for embedded items, or '#microsoft.graph.referenceAttachment' for references. |
| `contentType` | string | No | The MIME type of the attachment (e.g., 'text/plain', 'application/pdf'). |
| `contentBytes` | string | No | Base64-encoded file contents. Required when '@odata.type' is fileAttachment. Must be valid base64. |
| `mail_folder_id` | string | No | The ID or well-known name of the parent mail folder. Common well-known names include: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', etc. For custom folders, use the actual folder ID. Optional - if not provided, the message will be accessed directly by ID. |
| `child_folder_id` | string | No | The ID of the child mail folder containing the message. This must be a base64-encoded folder ID. Only used when mail_folder_id is specified. Well-known names are NOT valid for child folders. |
| `contentLocation` | string | No | URL location or path for reference attachments. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create reply-all draft in folder

**Slug:** `OUTLOOK_CREATE_REPLY_ALL_DRAFT`

Tool to create a reply-all draft for a message in a mail folder. Use when you need to create a draft reply to all recipients of an email.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `comment` | string | No | Plain text comment to include in the body of the reply-all draft. |
| `user_id` | string | No | User's mailbox identifier (email or 'me') for the original message and new draft location. |
| `message_id` | string | Yes | Required. Unique ID of the message to reply to. Obtain this from actions like 'List Messages', 'Get Message', or 'Search Messages'. |
| `mail_folder_id` | string | Yes | Required. The unique identifier of the mail folder containing the message to reply to. Obtain this from actions like 'List Mail Folders' or 'Get Mail Folder'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create To Do task

**Slug:** `OUTLOOK_CREATE_TASK`

Tool to create a new task in Microsoft To Do within a specified task list. Use when adding tasks with title, due dates, reminders, importance levels, descriptions, categories, and linked resources.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `body` | object | No | Task body content with content type. |
| `title` | string | Yes | The title of the task. This is the main text displayed for the task. |
| `user_id` | string | No | User ID or userPrincipalName. Use 'me' for the signed-in user (delegated auth) or a specific user ID for app-only (S2S) authentication. |
| `categories` | array | No | A list of category labels to organize the task (e.g., tags for filtering or grouping tasks). |
| `importance` | string | No | The importance level of the task. Must be one of: 'low', 'normal', or 'high'. Defaults to 'normal' if not specified. |
| `dueDateTime` | object | No | Date/time with timezone information for task due dates and reminders. |
| `linkedResources` | array | No | A list of resources (documents, links, emails) associated with the task. Each resource can have a webUrl, applicationName, and displayName. |
| `reminderDateTime` | object | No | Date/time with timezone information for task due dates and reminders. |
| `todo_task_list_id` | string | Yes | The unique identifier of the task list where the task will be created. Use the List To Do task lists action to retrieve available list IDs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user calendar event attachment

**Slug:** `OUTLOOK_CREATE_USER_CALENDAR_EVENT_ATTACHMENT`

Tool to create a new attachment for an event in a specific user's calendar. Use when you need to attach a file or item to an event within a particular user's calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item` | object | No | The nested item payload; required when '@odata.type' is itemAttachment. |
| `name` | string | Yes | The display name of the attachment. |
| `user_id` | string | Yes | The user's ID or userPrincipalName (email address). This identifies the user whose calendar contains the event. |
| `event_id` | string | Yes | The unique opaque identifier of the calendar event (NOT an email address). This is typically a long string starting with 'AAMkA' or 'AQMkA'. Obtain it from listing or searching calendar events. |
| `odata_type` | string ("#microsoft.graph.fileAttachment" | "#microsoft.graph.itemAttachment") | Yes | Attachment type: '#microsoft.graph.fileAttachment' requires 'contentBytes'; '#microsoft.graph.itemAttachment' requires 'item'. |
| `calendar_id` | string | Yes | The unique identifier of the calendar containing the event. This is typically a long opaque string identifying the specific calendar. |
| `contentBytes` | string | No | MUST be base64-encoded file contents (not plain text); required when '@odata.type' is fileAttachment. Raw/plain text must be base64-encoded first. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create calendar in user's calendar group

**Slug:** `OUTLOOK_CREATE_USER_CALENDAR_GROUP_CALENDAR`

Tool to create a new calendar in a calendar group for a specific user. Use when organizing events into a separate calendar within a specific calendar group for a user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | The display name of the new calendar. |
| `color` | string ("auto" | "lightBlue" | "lightGreen" | "lightOrange" | "lightGray" | "lightYellow" | "lightTeal" | "lightPink" | "lightBrown" | "lightPurple" | "lightRed") | No | The theme color to assign to the calendar. Supported values: auto, lightBlue, lightGreen, lightOrange, lightGray, lightYellow, lightTeal, lightPink, lightBrown, lightPurple, lightRed. |
| `user_id` | string | No | The unique identifier for the user (can also be userPrincipalName). Use 'me' for the authenticated user. |
| `calendar_group_id` | string | Yes | The unique identifier for the calendar group where the calendar will be created. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user calendar group event

**Slug:** `OUTLOOK_CREATE_USER_CALENDAR_GROUP_EVENT`

Tool to create a new calendar event in a specific user's calendar within a calendar group. Use when creating events for a particular user in a calendar that belongs to a calendar group.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `end` | object | Yes | The end date, time, and time zone of the event. |
| `body` | object | No | The body content of the event. |
| `start` | object | Yes | The start date, time, and time zone of the event. |
| `showAs` | string | No | The status to show on the calendar. Valid values: 'free', 'tentative', 'busy', 'oof', 'workingElsewhere', 'unknown'. |
| `subject` | string | Yes | The subject/title of the event. |
| `user_id` | string | Yes | The user ID or user principal name (UPN) of the target user. Note: 'me' is not supported for this endpoint - you must provide an actual email address or user ID. |
| `location` | object | No | The location of an event. |
| `attendees` | array | No | List of attendees for the event. |
| `categories` | array | No | A list of category names to associate with the event. |
| `importance` | string | No | The importance of the event. Valid values: 'low', 'normal', 'high'. |
| `calendar_id` | string | Yes | The ID of the calendar within the calendar group where the event will be created. |
| `isOnlineMeeting` | boolean | No | Set to true to indicate that the event is an online meeting. |
| `calendar_group_id` | string | Yes | The ID of the calendar group containing the target calendar. |
| `onlineMeetingProvider` | string | No | The online meeting provider. Currently only 'teamsForBusiness' is supported. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user contact extension

**Slug:** `OUTLOOK_CREATE_USER_CONTACTS_EXTENSIONS`

Tool to create a new open extension on a specific user's contact. Use when you need to store custom data with a contact for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. Can be the user's object ID (GUID) or userPrincipalName (e.g., 'user@contoso.com'). |
| `contact_id` | string | Yes | The unique identifier of the contact to add the extension to. |
| `extension_name` | string | Yes | The unique name for the extension. Must follow reverse DNS format (e.g., Com.Contoso.ExtensionName). |
| `custom_properties` | object | No | Custom properties to store in the extension as key-value pairs. Each property can be a string, number, or boolean value. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user event attachment upload session

**Slug:** `OUTLOOK_CREATE_USER_EVENT_ATTACHMENT_UPLOAD_SESSION`

Deprecated: Use OUTLOOK_CREATE_ME_EVENT_ATTACHMENT_UPLOAD_SESSION instead, which supports both /me and /users/{user_id} endpoints.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | User ID or user principal name. Use the unique identifier or email address of the user whose event you want to add an attachment to. |
| `event_id` | string | Yes | The unique identifier of the calendar event to attach the file to. Obtain from listing or searching calendar events. |
| `attachment_item` | object | Yes | AttachmentItem object specifying the type, name, and size of the attachment to upload. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create calendar permission via event

**Slug:** `OUTLOOK_CREATE_USER_EVENT_CALENDAR_PERMISSION`

Tool to create a calendar permission via an event's calendar. Use when granting calendar access through an event by specifying the event ID and user email address.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string ("read" | "write" | "freeBusyRead" | "limitedRead") | Yes | The permission role to grant. Options: read (view all event details), write (view and edit events), freeBusyRead (view availability only), limitedRead (view availability and titles). |
| `user_id` | string | No | The user ID or principal name of the user. Use 'me' for the authenticated user. |
| `event_id` | string | Yes | The unique identifier of the event whose calendar will have the permission added. |
| `isRemovable` | boolean | No | True if the permission can be removed by the user, false otherwise. Optional. |
| `emailAddress` | object | Yes | Email address object containing the name and address of the person receiving the permission. |
| `isInsideOrganization` | boolean | No | True if the user is inside the same organization as the calendar owner, false otherwise. Optional. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user message extension

**Slug:** `OUTLOOK_CREATE_USER_MAIL_CHILD_FOLDER_MSG_EXT`

Tool to create a new open extension on a message in a child mail folder for any user. Use when you need to store custom data with a message in a nested folder structure.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User ID or userPrincipalName. Use 'me' for the authenticated user. |
| `message_id` | string | Yes | The unique identifier of the message to add the extension to. |
| `extension_name` | string | Yes | The unique name for the extension. Must follow the format 'Com.Company.ExtensionName' (e.g., Com.Contoso.TestExtension). |
| `mail_folder_id` | string | Yes | The unique identifier of the parent mail folder. |
| `child_folder_id` | string | Yes | The unique identifier of the child folder containing the message. |
| `custom_properties` | object | No | Custom properties to store in the extension as key-value pairs. Each property can be a string, number, or boolean value. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user mail folder message extension

**Slug:** `OUTLOOK_CREATE_USER_MAIL_FOLDER_MESSAGE_EXTENSION`

Tool to create a new open extension on a message in a user's mail folder. Use when you need to store custom data with a specific message in a user's mailbox.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. Can be the user's object ID (GUID) or userPrincipalName (e.g., 'user@contoso.com'). |
| `message_id` | string | Yes | The unique identifier of the message to add the extension to. |
| `extension_name` | string | Yes | The unique name for the extension. Must follow the format 'Com.Company.ExtensionName' (e.g., Com.Contoso.Test). |
| `mail_folder_id` | string | Yes | The unique identifier of the mail folder containing the message. |
| `custom_properties` | object | No | Custom properties to store in the extension as key-value pairs. Each property can be a string, number, or boolean value. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create reply draft for user mail folder message

**Slug:** `OUTLOOK_CREATE_USER_MAIL_FOLDER_MESSAGE_REPLY_DRAFT`

Tool to create a reply draft for a message in a user's mail folder. Use when you need to prepare a reply without sending it immediately. The draft is created in the Drafts folder and includes the RE: prefix in the subject line.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `comment` | string | No | Optional plain text comment to include in the body of the reply draft. |
| `user_id` | string | Yes | The unique identifier of the user. Use 'me' for the authenticated user, or provide a specific user principal name (email address) or user ID. |
| `message_id` | string | Yes | The unique identifier of the message to reply to. This is a base64-encoded string typically starting with 'AAMk' or 'AQMk'. Obtain this from list messages, get message, or search messages actions. Do NOT use email addresses or conversation IDs. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the mail folder containing the message. Valid well-known names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. For other folders, use the base64-encoded folder ID obtained from list mail folders actions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user mail folders child folders

**Slug:** `OUTLOOK_CREATE_USER_MAIL_FOLDERS_CHILD_FOLDERS`

Tool to create a new child folder under a specified mail folder for a user. Use when organizing email into nested folder hierarchies within a specific user's mailbox.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User's ID or userPrincipalName. The unique identifier of the user whose mailbox will contain the new child folder. |
| `isHidden` | boolean | No | Indicates whether the new child folder should be hidden. Default is false. Once set during creation, this property cannot be updated later. |
| `displayName` | string | Yes | The display name of the new child folder. This is the name that will be visible to the user in their mail client. |
| `mailFolderId` | string | Yes | The ID or well-known name of the parent mail folder under which to create the child folder. Common well-known names include: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. For folder IDs, obtain them from listing mail folders - they are base64-encoded strings (e.g., 'AQMkADAwATMwMAExLTlmNjktOWVmYS0wMAItMDAKAC4AAAPLkCuWz0mbS4RvWyTvc1LKAQDGTYrvat2PSKIu8IS9hMqyAAACAQwAAAA='). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user master category

**Slug:** `OUTLOOK_CREATE_USER_MASTER_CATEGORY`

Tool to create a new category in a user's master category list. Use when you need to add a category to organize email and calendar items for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `color` | string ("preset0" | "preset1" | "preset2" | "preset3" | "preset4" | "preset5" | "preset6" | "preset7" | "preset8" | "preset9" | "preset10" | "preset11" | "preset12" | "preset13" | "preset14" | "preset15" | "preset16" | "preset17" | "preset18" | "preset19" | "preset20" | "preset21" | "preset22" | "preset23" | "preset24") | No | A pre-set color constant for the category. Allowed values: preset0 through preset24. |
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |
| `display_name` | string | Yes | Unique name that identifies the category in the user's mailbox. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user message

**Slug:** `OUTLOOK_CREATE_USER_MESSAGE`

Tool to create a new draft message in a user's mailbox. Use when creating draft messages for a specific user or the authenticated user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `body` | object | No | The body of the message. |
| `from` | object | No | Represents a message recipient. |
| `sender` | object | No | Represents a message recipient. |
| `subject` | string | No | The subject of the message. |
| `user_id` | string | No | The user's ID, userPrincipalName (email address), or 'me' to represent the authenticated user. Creates the message in the specified user's mailbox. |
| `categories` | array | No | A list of categories to assign to the message. |
| `importance` | string ("low" | "normal" | "high") | No | Message importance levels. |
| `ccRecipients` | array | No | The Cc: recipients for the message. |
| `toRecipients` | array | No | The To: recipients for the message. |
| `bccRecipients` | array | No | The Bcc: recipients for the message. |
| `internetMessageHeaders` | array | No | Custom message headers to add to the message. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create user message attachment

**Slug:** `OUTLOOK_CREATE_USER_MESSAGE_ATTACHMENT`

Tool to create an attachment on a message in a user's mail folder. Use when you need to attach a file or item to an existing message in a specific user's mailbox.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item` | object | No | The nested item payload (message, event, or contact) with its own '@odata.type'. Required when '@odata.type' is '#microsoft.graph.itemAttachment'. |
| `name` | string | Yes | The display name of the attachment (e.g., file name like 'document.pdf' or 'image.png'). |
| `user_id` | string | Yes | The unique identifier of the user. Can be the user's UPN (user principal name) or the user's object ID. |
| `isInline` | boolean | No | Set to true if the attachment should appear inline within the message body content. |
| `contentId` | string | No | Content ID for inline attachments, used to reference the attachment within the HTML message body. |
| `message_id` | string | Yes | The unique identifier of the message to attach to. This is NOT an email address but an opaque string identifier returned by Microsoft Graph API operations. |
| `odata_type` | string ("#microsoft.graph.fileAttachment" | "#microsoft.graph.itemAttachment" | "#microsoft.graph.referenceAttachment") | Yes | The OData type of the attachment. Use '#microsoft.graph.fileAttachment' for file attachments (requires 'contentBytes'), '#microsoft.graph.itemAttachment' for embedded items like messages or events (requires 'item'), or '#microsoft.graph.referenceAttachment' for reference attachments (requires link and permission details). |
| `contentType` | string | No | The MIME type of the attachment (e.g., 'text/plain', 'application/pdf'). Optional but recommended for file attachments. |
| `contentBytes` | string | No | Base64-encoded content of the file attachment. Required when '@odata.type' is '#microsoft.graph.fileAttachment'. Must be valid base64-encoded data. |
| `mail_folder_id` | string | Yes | The unique identifier of the mail folder containing the message. This is typically a long opaque string identifying the specific folder. |
| `contentLocation` | string | No | URI indicating the content location of the attachment. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Decline calendar event

**Slug:** `OUTLOOK_DECLINE_EVENT`

Tool to decline an invitation to a calendar event. Use when the user wants to decline a meeting or event invitation. The API returns 202 Accepted with no content on success.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `comment` | string | No | Optional text message to include in the response to the event organizer explaining the decline. |
| `user_id` | string | No | The user's primary SMTP address, user principal name (UPN), or the alias 'me' (for the signed-in user) to identify the calendar owner. |
| `event_id` | string | Yes | The unique identifier of the calendar event to decline. |
| `sendResponse` | boolean | No | If true, a decline response is sent to the organizer; if false, no response is sent. Default is true. |
| `proposedNewTime` | object | No | A time period with start and end times. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete calendar

**Slug:** `OUTLOOK_DELETE_CALENDAR`

Tool to delete a calendar other than the default calendar from a user's mailbox. Use when removing calendars that are no longer needed.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |
| `calendar_id` | string | Yes | Unique identifier of the calendar to delete. Cannot be the default calendar. This ID can be obtained from List Calendars action. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete calendar event

**Slug:** `OUTLOOK_DELETE_CALENDAR_EVENT`

Tool to delete a calendar event from a user's Outlook calendar. Use when removing events that are no longer needed or were created in error.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |
| `event_id` | string | Yes | The unique identifier of the calendar event to delete. This ID can be obtained from List Events or Get Event actions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete user calendar event attachment

**Slug:** `OUTLOOK_DELETE_CALENDAR_EVENT_ATTACHMENT`

Tool to delete an attachment from an event in a specific user's calendar. Use when you need to remove a file or item attachment from an event in a calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The unique identifier of the user. Can use 'me' as shortcut for authenticated user. |
| `event_id` | string | Yes | The unique identifier of the calendar event containing the attachment to delete. |
| `calendar_id` | string | Yes | The unique identifier of the calendar containing the event. Can be obtained from listing calendars. |
| `attachment_id` | string | Yes | The unique identifier of the attachment to delete. Can be obtained from listing event attachments. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete event from specific calendar

**Slug:** `OUTLOOK_DELETE_CALENDAR_EVENT_FROM_SPECIFIC_CALENDAR`

Tool to delete an event from a specific calendar in Outlook. Use when removing events from secondary or shared calendars by providing both calendar ID and event ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user ID or email address to delete the event for. Required for S2S (Service-to-Service) authentication. If not provided, defaults to /me endpoint for delegated authentication. |
| `event_id` | string | Yes | The unique identifier of the event to delete from the specified calendar. This ID can be obtained from List Events or Get Event actions. |
| `calendar_id` | string | Yes | The unique identifier of the calendar containing the event. This ID can be obtained from List Calendars action. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete user calendar group calendar

**Slug:** `OUTLOOK_DELETE_CALENDAR_FROM_GROUP`

Tool to delete a calendar from a specific user's calendar group in Microsoft Outlook. Use when removing a calendar that belongs to a user's calendar group.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user whose calendar group calendar to delete. Can be the user's email address or user ID. |
| `calendar_id` | string | Yes | The unique identifier of the calendar to delete. Note: Default calendars with isRemovable: false cannot be deleted. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group containing the calendar to delete. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete calendar group

**Slug:** `OUTLOOK_DELETE_CALENDAR_GROUP`

Tool to delete a calendar group other than the default calendar group. Use when removing unused calendar groups from the mailbox.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |
| `calendar_group_id` | string | Yes | Unique identifier of the calendar group to delete. Cannot be used to delete the default calendar group. This ID can be obtained from List Calendar Groups action. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete user calendar group calendar event

**Slug:** `OUTLOOK_DELETE_CALENDAR_GROUP_CALENDAR_EVENT`

Tool to delete a calendar event from a specific user's calendar within a calendar group. Use when removing events from calendars organized under calendar groups for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. Must be an actual user ID, not 'me' shortcut. |
| `event_id` | string | Yes | The unique identifier of the calendar event to delete. This ID can be obtained from List Events or Get Event actions. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group containing the target calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete calendar group event attachment

**Slug:** `OUTLOOK_DELETE_CALENDAR_GROUP_EVENT_ATTACHMENT`

Tool to delete an attachment from an event in a calendar within a calendar group. Use when you need to remove a file or item attachment from an event in a specific calendar group.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the authenticated user (delegated auth) or specify a user ID/email for S2S (app-only) authentication. |
| `event_id` | string | Yes | The unique identifier of the calendar event containing the attachment to delete. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `attachment_id` | string | Yes | The unique identifier of the attachment to delete. Can be obtained from listing event attachments. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group containing the target calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Permanently Delete Calendar Group Event

**Slug:** `OUTLOOK_DELETE_CALENDAR_GROUP_EVENT_PERMANENTLY`

Tool to permanently delete a calendar event from a calendar within a calendar group. Use when you need to ensure an event cannot be restored from deleted items.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The unique identifier (GUID) or user principal name (email) of the user. Required for app-only (S2S) authentication. If not provided, defaults to /me endpoint for delegated authentication. |
| `event_id` | string | Yes | The unique identifier of the calendar event to permanently delete. The event will be permanently deleted and cannot be recovered by the user. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group containing the target calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Permanently Delete Calendar

**Slug:** `OUTLOOK_DELETE_CALENDAR_PERMANENTLY`

Permanently deletes a calendar from a user's mailbox. Unlike standard DELETE, this action makes the calendar permanently unrecoverable. Use when you need to ensure a calendar cannot be restored from deleted items.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `calendar_id` | string | Yes | Unique identifier of the calendar to permanently delete. The calendar will be permanently deleted and cannot be recovered by the user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete User Calendar Group Calendar Permission

**Slug:** `OUTLOOK_DELETE_CALENDAR_PERMISSION`

Tool to delete a calendar permission from a user's calendar within a calendar group. Use when revoking calendar sharing access for specific users.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the group. |
| `permission_id` | string | Yes | The unique identifier of the calendar permission to delete. This ID can be obtained from listing calendar permissions. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group containing the calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Permanently Delete Child Contact Folder

**Slug:** `OUTLOOK_DELETE_CHILD_CONTACT_FOLDER_PERMANENTLY`

Permanently deletes a child contact folder. Unlike standard DELETE, this action makes the folder permanently unrecoverable. Use when you need to ensure a child contact folder cannot be restored from deleted items.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `child_folder_id` | string | Yes | Unique identifier of the child contact folder to permanently delete. The folder will be permanently deleted and cannot be recovered by the user. |
| `contact_folder_id` | string | Yes | Unique identifier of the parent contact folder containing the child folder to permanently delete. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Child Folder Message

**Slug:** `OUTLOOK_DELETE_CHILD_FOLDER_MESSAGE`

Tool to delete a message from a child mail folder in Outlook. Use when removing messages from nested folder structures or cleaning up messages in subfolders.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The UPN (User Principal Name) or ID of the user; use 'me' for the signed-in user. |
| `message_id` | string | Yes | The unique identifier of the message to delete from the child folder. Typically a base64-encoded string obtained from list messages or search messages actions. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the parent mail folder. Common well-known names include: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox'. For folder IDs, use base64-encoded strings (e.g., 'AAMkAGI0ZjExAAA=') obtained from list mail folders actions. |
| `child_folder_id` | string | Yes | The ID of the child folder containing the message to delete. Must be a base64-encoded folder ID (e.g., 'AAMkADAwATMwMAExAAA=') obtained from list child folders actions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Contact

**Slug:** `OUTLOOK_DELETE_CONTACT`

Permanently deletes an existing contact, using its `contact_id` (obtainable via 'List User Contacts' or 'Get Contact'), from the Outlook contacts of the user specified by `user_id`.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The UPN (User Principal Name) or ID of the user; use 'me' for the signed-in user. |
| `contact_id` | string | Yes | Identifier of the contact to be deleted, typically obtained from 'List User Contacts' or 'Get Contact'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete contact folder

**Slug:** `OUTLOOK_DELETE_CONTACT_FOLDER`

Tool to delete a contact folder from the user's mailbox. Use when you need to remove an existing contact folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The UPN (User Principal Name) or ID of the user; use 'me' for the signed-in user. |
| `contact_folder_id` | string | Yes | Identifier of the contact folder to be deleted. Must be a valid contact folder ID obtained from 'Get Contact Folders' or 'Create Contact Folder'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete user contact folder child folder

**Slug:** `OUTLOOK_DELETE_CONTACT_FOLDER_CHILD_FOLDER`

Tool to delete a child contact folder from a parent contact folder for a specific user. Use when removing nested contact folders from a user's mailbox.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The UPN (User Principal Name) or ID of the user; use 'me' for the signed-in user. |
| `child_folder_id` | string | Yes | The unique identifier of the child contact folder to delete. This ID can be obtained from Get Contact Folders action. |
| `contact_folder_id` | string | Yes | The unique identifier of the parent contact folder. This ID can be obtained from Get Contact Folders action. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Contact from Folder

**Slug:** `OUTLOOK_DELETE_CONTACT_FOLDER_CONTACT`

Tool to permanently delete a contact from a specific contact folder. Use when removing contacts from organized folders in Outlook.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The UPN (User Principal Name) or ID of the user; use 'me' for the signed-in user. |
| `contact_id` | string | Yes | Unique identifier of the contact to delete from the folder, typically obtained from 'List User Contacts' or 'Get Contact'. |
| `contact_folder_id` | string | Yes | Unique identifier of the contact folder containing the contact to delete, typically obtained from 'Get Contact Folders'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Permanently Delete Contact Folder

**Slug:** `OUTLOOK_DELETE_CONTACT_FOLDER_PERMANENTLY`

Permanently deletes a contact folder. Unlike standard DELETE, this action makes the folder permanently unrecoverable. Use when you need to ensure a contact folder cannot be restored from deleted items.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `contact_folder_id` | string | Yes | Unique identifier of the contact folder to permanently delete. The folder will be permanently deleted and cannot be recovered by the user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Permanently Delete User Contact from Child Folder

**Slug:** `OUTLOOK_DELETE_CONTACT_FROM_CHILD_FOLDER_PERMANENTLY`

Tool to permanently delete a contact from a child folder for a specific user. Use when you need to ensure a contact cannot be restored from deleted items.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. Can be the user's email address (UPN) or their Azure AD object ID. |
| `contact_id` | string | Yes | Identifier of the contact to be permanently deleted. The contact will be permanently deleted and cannot be recovered. Must be obtained from 'List Contacts' or 'Get Contact'. |
| `child_folder_id` | string | Yes | Identifier of the child folder within the parent contact folder containing the contact to permanently delete. Must be a valid child folder ID. |
| `contact_folder_id` | string | Yes | Identifier of the parent contact folder. Must be a valid contact folder ID obtained from 'Get Contact Folders' or 'List Contact Folders'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Permanently Delete Contact from Folder

**Slug:** `OUTLOOK_DELETE_CONTACT_FROM_FOLDER_PERMANENTLY`

Permanently deletes a contact from a specific contact folder. Unlike standard DELETE, this action makes the contact permanently unrecoverable. Use when you need to ensure a contact in a folder cannot be restored from deleted items.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `contact_id` | string | Yes | Unique identifier of the contact to permanently delete. The contact will be permanently deleted and cannot be recovered by the user. |
| `contact_folder_id` | string | Yes | Unique identifier of the contact folder containing the contact to permanently delete. Must be a valid contact folder ID obtained from list or get contact folders actions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Permanently Delete Contact

**Slug:** `OUTLOOK_DELETE_CONTACT_PERMANENTLY`

Permanently deletes a contact. Unlike standard DELETE, this action makes the contact permanently unrecoverable. Use when you need to ensure a contact cannot be restored from deleted items.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `contact_id` | string | Yes | Unique identifier of the contact to permanently delete. The contact will be permanently deleted and cannot be recovered by the user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete contact extension

**Slug:** `OUTLOOK_DELETE_CONTACTS_EXTENSIONS`

Tool to delete a navigation property extension from a contact within a child folder. Use when removing custom extension data from a contact.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The unique identifier of the user. Can be the user's object ID (GUID) or userPrincipalName (e.g., 'user@contoso.com'). If not provided, uses the authenticated user context (/me endpoint). |
| `contact_id` | string | Yes | The unique identifier of the contact that has the extension to delete. |
| `extension_id` | string | Yes | The unique identifier of the extension to delete. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.TestExtension) or just the extension name (e.g., Com.Contoso.TestExtension). |
| `child_folder_id` | string | Yes | The unique identifier of the child folder within the contact folder. |
| `contact_folder_id` | string | Yes | The unique identifier of the contact folder containing the contact. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Email Rule

**Slug:** `OUTLOOK_DELETE_EMAIL_RULE`

Delete an email rule permanently; deletion is irreversible. Confirm rule details with the user before executing. Removing a rule may alter the firing order and stop-processing behavior of remaining rules.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rule_id` | string | Yes | ID of the email rule to delete. |
| `user_id` | string | No | The unique identifier of the user. Can use 'me' shortcut for /me/ path or actual user ID for /users/{user_id}/ path. Required for S2S (app-only) authentication. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete calendar event (Deprecated)

**Slug:** `OUTLOOK_DELETE_EVENT`

DEPRECATED: Use OUTLOOK_DELETE_CALENDAR_EVENT instead. Tool to delete an event from the user's calendar. Use when removing calendar events. If this is a meeting, deleting it removes it from the organizer's calendar and sends a cancellation message to all attendees. Require explicit user confirmation before calling this action.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the authenticated user or a specific user ID for S2S (app-only) authentication. |
| `event_id` | string | Yes | The unique identifier of the event to delete. This ID can be obtained from list events or get event actions. For recurring events, verify whether this ID is the series master (deletes entire series) or a specific instance (deletes one occurrence). Obtain from OUTLOOK_LIST_EVENTS, OUTLOOK_GET_EVENT, or OUTLOOK_GET_CALENDAR_VIEW. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete event attachment

**Slug:** `OUTLOOK_DELETE_EVENT_ATTACHMENT`

Tool to delete an attachment from an Outlook calendar event. Use when you need to remove a file or item attachment from an existing event.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address or 'me' for the authenticated user. |
| `event_id` | string | Yes | The unique identifier of the calendar event containing the attachment to delete. |
| `attachment_id` | string | Yes | The unique identifier of the attachment to delete. Can be obtained from listing event attachments. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete event extension

**Slug:** `OUTLOOK_DELETE_EVENT_EXTENSION`

Tool to delete an open extension from a calendar event in a calendar group. Use when removing custom extension data that is no longer needed.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user ID (GUID) or user principal name (email) of the target user. Required for S2S (app-only) authentication. If not provided, defaults to '/me' for delegated authentication. |
| `event_id` | string | Yes | The unique identifier of the calendar event containing the extension to delete. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `extension_id` | string | Yes | The unique identifier of the extension to delete. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.TestExtension) or just the extension name (e.g., Com.Contoso.TestExtension). |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group containing the calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Permanently Delete Event

**Slug:** `OUTLOOK_DELETE_EVENT_PERMANENTLY`

Permanently deletes a calendar event. Unlike standard DELETE, this action makes the event permanently unrecoverable. Use when you need to ensure an event cannot be restored from deleted items.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `event_id` | string | Yes | Unique identifier of the calendar event to permanently delete. The event will be permanently deleted and cannot be recovered by the user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete mail folder

**Slug:** `OUTLOOK_DELETE_MAIL_FOLDER`

Delete a mail folder from the user's mailbox. Use when you need to remove an existing mail folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | Identifier for the user whose mailbox contains the folder to delete. Use 'me' for the authenticated user or provide the user's principal name or ID. |
| `folder_id` | string | Yes | The Microsoft Graph folder ID (a base64-encoded string like 'AAMkAGI0ZjExAAA=') of the custom mail folder to delete. IMPORTANT: You can ONLY delete custom folders you created. System folders (Inbox, Drafts, SentItems, DeletedItems, JunkEmail, Outbox, Archive, etc.) are 'distinguished folders' and CANNOT be deleted - attempting to do so will result in an error. Use the 'List mail folders' action to find the ID of a custom folder. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Mail Folder Message

**Slug:** `OUTLOOK_DELETE_MAIL_FOLDER_MESSAGE`

Tool to delete a message from a specific mail folder in Outlook. Use when removing messages from a particular folder or cleaning up folder contents.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The UPN (User Principal Name) or ID of the user; use 'me' for the signed-in user. |
| `message_id` | string | Yes | The unique identifier of the message to delete from the mail folder. Typically a base64-encoded string obtained from list messages or search messages actions. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the mail folder containing the message. Common well-known names include: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox'. For folder IDs, use base64-encoded strings (e.g., 'AAMkAGI0ZjExAAA=') obtained from list mail folders actions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete master category

**Slug:** `OUTLOOK_DELETE_MASTER_CATEGORY`

Tool to delete a category from the user's master category list. Use when removing unused or obsolete categories from the mailbox.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |
| `category_id` | string | Yes | Unique identifier of the Outlook category to delete. This ID can be obtained from Get Master Categories action. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete User Calendars Calendar Permission

**Slug:** `OUTLOOK_DELETE_ME_CALENDAR_PERMISSION`

Tool to delete a calendar permission from a specific user's calendar. Use when revoking access to a shared calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |
| `calendar_id` | string | Yes | The unique identifier of the calendar. This ID can be obtained from List Calendars action. |
| `permission_id` | string | Yes | The unique identifier of the calendar permission to delete. This ID can be obtained from listing calendar permissions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete contact extension

**Slug:** `OUTLOOK_DELETE_ME_CONTACT_EXTENSION`

Tool to delete an open extension from a contact. Use when removing custom data extensions that are no longer needed.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the authenticated user. |
| `contact_id` | string | Yes | Unique identifier of the contact from which to delete the extension. |
| `extension-id` | string | Yes | The extension identifier. Can be the extension name or fully qualified name (e.g., 'Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.TestExtension'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete user contact folder contact extension

**Slug:** `OUTLOOK_DELETE_ME_CONTACT_FOLDER_CONTACT_EXTENSION`

Tool to delete an extension from a contact in a user's contact folder. Use when removing custom extension data from a contact.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The UPN (User Principal Name) or ID of the user; use 'me' for the signed-in user. |
| `contact_id` | string | Yes | The unique identifier of the contact that has the extension to delete. |
| `extension_id` | string | Yes | The unique identifier of the extension to delete. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.com.contoso.roamingSettings) or just the extension name (e.g., com.contoso.roamingSettings). |
| `contact_folder_id` | string | Yes | The unique identifier of the contact folder containing the contact. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete user event extension

**Slug:** `OUTLOOK_DELETE_ME_EVENT_EXTENSION`

Tool to delete an open extension from a user's calendar event. Use when removing custom extension data that is no longer needed.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |
| `event_id` | string | Yes | The unique identifier of the calendar event containing the extension to delete. |
| `extension_id` | string | Yes | The unique identifier of the extension to delete. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.Referral) or just the extension name (e.g., Com.Contoso.Referral). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete user event attachment

**Slug:** `OUTLOOK_DELETE_ME_EVENTS_ATTACHMENTS`

Tool to delete an attachment from a user's Outlook event. Use when you need to remove a file or item attachment from an existing event.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the authenticated user. |
| `event_id` | string | Yes | The unique identifier of the event containing the attachment to delete. |
| `attachment_id` | string | Yes | The unique identifier of the attachment to delete. Can be obtained from listing event attachments. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete inference classification override

**Slug:** `OUTLOOK_DELETE_ME_INFERENCE_CLASSIFICATION_OVERRIDE`

Tool to delete an inference classification override for a specific sender. Use when removing custom Focused Inbox rules that were previously set.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |
| `override_id` | string | Yes | The unique identifier of the inference classification override to delete. This ID can be obtained from the List Inference Classification Overrides action. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete mail folder child folder

**Slug:** `OUTLOOK_DELETE_ME_MAIL_FOLDER_CHILD_FOLDER`

Tool to delete a child mail folder from a parent mail folder. Use when removing nested mail folders from a user's mailbox.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |
| `mail_folder_id` | string | Yes | The unique identifier of the parent mail folder. This ID can be obtained from List Mail Folders action. |
| `child_folder_id` | string | Yes | The unique identifier of the child mail folder to delete. This ID can be obtained from List Mail Folders action. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Permanently Delete Child Mail Folder

**Slug:** `OUTLOOK_DELETE_ME_MAIL_FOLDER_CHILD_FOLDER_PERMANENTLY`

Permanently deletes a child mail folder from a parent mail folder. Unlike standard DELETE, this action makes the folder permanently unrecoverable. Use when you need to ensure a child folder cannot be restored from deleted items.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The unique identifier of the user. Use 'me' for the authenticated user, or provide the user's email address (UPN) or their Azure AD object ID. |
| `mail_folder_id` | string | Yes | Unique identifier of the parent mail folder. Must be a valid mail folder ID obtained from 'List Mail Folders' or 'List Child Mail Folders'. |
| `child_folder_id` | string | Yes | Unique identifier of the child folder to permanently delete. The folder will be permanently deleted and cannot be recovered by the user. Must be obtained from 'List Child Mail Folders'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete mail folder message rule

**Slug:** `OUTLOOK_DELETE_ME_MAIL_FOLDER_MESSAGE_RULE`

Tool to delete a message rule from a specific mail folder. Use when you need to remove an email automation rule from a folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rule_id` | string | Yes | The unique identifier of the message rule to delete. Must be obtained from a list or get operation on message rules. |
| `user_id` | string | No | The unique identifier of the user. Use 'me' as alias for the authenticated user, or provide a specific user ID or user principal name. |
| `mail_folder_id` | string | Yes | The unique identifier of the mail folder containing the message rule. Can be a well-known folder name (e.g., 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail') or a folder ID. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete user message extension

**Slug:** `OUTLOOK_DELETE_ME_MAIL_FOLDERS_CHILD_FOLDERS_MESSAGES_EXTENS`

Delete user message extension

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user or 'me' for the authenticated user. |
| `message_id` | string | Yes | The unique identifier of the message that has the extension to delete. |
| `extension_id` | string | Yes | The unique identifier of the extension to delete. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.TestExtension) or just the extension name (e.g., Com.Contoso.TestExtension). |
| `mail_folder_id` | string | Yes | The unique identifier of the mail folder containing the child folder. |
| `child_folder_id` | string | Yes | The unique identifier of the child folder within the mail folder. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Message Attachment (Deprecated)

**Slug:** `OUTLOOK_DELETE_ME_MAIL_FOLDERS_MESSAGES_ATTACHMENTS`

DEPRECATED: Use OUTLOOK_DELETE_MESSAGE_ATTACHMENT instead. Tool to delete an attachment from a message in a mail folder. Use when removing file or item attachments from messages in Outlook mail folders.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the authenticated user or a specific user ID for S2S (app-only) authentication. |
| `message_id` | string | Yes | The unique identifier of the message containing the attachment. Must be a valid base64-encoded message ID obtained from listing messages or search operations. |
| `attachment_id` | string | Yes | The unique identifier of the attachment to delete. Must be a valid attachment ID obtained from listing message attachments. |
| `mail_folder_id` | string | Yes | The unique identifier of the mail folder containing the message. Can be a well-known name ('inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox') or a base64-encoded folder ID obtained from listing mail folders. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete message extension

**Slug:** `OUTLOOK_DELETE_ME_MAIL_FOLDERS_MESSAGES_EXTENSIONS`

Tool to delete a navigation property extension from a message within a mail folder. Use when removing custom extension data from a message.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user ID or principal name. Required for app-only (S2S) authentication. If not provided, uses 'me' for delegated authentication. |
| `message_id` | string | Yes | The unique identifier of the message that has the extension to delete. |
| `extension_id` | string | Yes | The unique identifier of the extension to delete. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Composio.TestExtension) or just the extension name (e.g., Com.Composio.TestExtension). |
| `mail_folder_id` | string | Yes | The unique identifier of the mail folder containing the message. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Message Attachment

**Slug:** `OUTLOOK_DELETE_ME_MESSAGES_ATTACHMENTS`

Tool to delete an attachment from a message. Use when removing file or item attachments from messages in Outlook.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The unique identifier or user principal name (email) of the user. Required for S2S (app-only) authentication. Can be either a GUID (e.g., '43f0c14d-bca8-421f-b762-c3d8dd75be1f') or an email address (e.g., 'user@example.com'). If not provided, defaults to '/me' for delegated authentication. |
| `message_id` | string | Yes | The unique identifier of the message containing the attachment. Must be a valid base64-encoded message ID obtained from listing messages or search operations. |
| `attachment_id` | string | Yes | The unique identifier of the attachment to delete. Must be a valid attachment ID obtained from listing message attachments. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Message

**Slug:** `OUTLOOK_DELETE_MESSAGE`

Tool to permanently delete an Outlook email message by its message_id. Use when removing unwanted messages, cleaning up drafts, or performing mailbox maintenance.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The UPN (User Principal Name) or ID of the user; use 'me' for the signed-in user. |
| `message_id` | string | Yes | Unique identifier of the message to delete, typically obtained from 'List Emails' or 'Search Messages'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Message Attachment

**Slug:** `OUTLOOK_DELETE_MESSAGE_ATTACHMENT`

Tool to delete an attachment from a message in a nested mail folder structure. Use when removing attachments from messages located in child folders within mail folders.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `message_id` | string | Yes | The unique identifier of the message containing the attachment. Must be a valid message ID obtained from listing messages, not a folder ID. |
| `attachment_id` | string | Yes | The unique identifier of the attachment to delete. Obtain this ID from listing message attachments. |
| `mail_folder_id` | string | Yes | The unique identifier of the mail folder. Can be a well-known name ('inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox') or a folder ID obtained from listing mail folders. |
| `child_folder_id` | string | No | The unique identifier of the child folder within the mail folder. If provided, targets the message inside mailFolders/{id}/childFolders/{id}. If omitted, targets the message directly inside mailFolders/{id}. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete message extension

**Slug:** `OUTLOOK_DELETE_MESSAGE_EXTENSION`

Tool to delete an open extension from an Outlook message. Use when removing custom extension data that is no longer needed from a message.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The UPN (User Principal Name) or ID of the user; use 'me' for the signed-in user. |
| `message_id` | string | Yes | The unique identifier of the message containing the extension to delete. |
| `extension_id` | string | Yes | The unique identifier of the extension to delete. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.TestExtension) or just the extension name (e.g., Com.Contoso.TestExtension). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Permanently Delete Message (Folder-Scoped) (Deprecated)

**Slug:** `OUTLOOK_DELETE_MESSAGE_PERMANENTLY_FROM_FOLDER`

DEPRECATED: Use OUTLOOK_PERMANENT_DELETE_MESSAGE instead. Tool to permanently delete a message from a specific mail folder. Use when you need to irreversibly delete a message with explicit folder context. The message is moved to the Purges folder and cannot be recovered.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. This can be the user's UPN (User Principal Name) or the user object ID. |
| `message_id` | string | Yes | The unique identifier of the message to permanently delete. The message will be moved to the Purges folder and cannot be recovered. |
| `mail_folder_id` | string | Yes | The unique identifier of the mail folder containing the message to permanently delete. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete User Calendar Permission

**Slug:** `OUTLOOK_DELETE_PRIMARY_CALENDAR_PERMISSION`

Tool to delete a calendar permission from a specific user's calendar. Use when revoking calendar sharing access for a particular user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The user ID or principal name of the user whose calendar permission to delete. Use 'me' for the authenticated user or provide a specific user ID/UPN. |
| `permission_id` | string | Yes | The unique identifier of the calendar permission to delete. This ID can be obtained from listing calendar permissions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete To Do task

**Slug:** `OUTLOOK_DELETE_TODO_TASK`

Tool to permanently delete a task from a Microsoft To Do task list. Use when removing a task that is no longer needed. This action cannot be undone.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_id` | string | Yes | The unique identifier of the task to delete. Obtain this from List To Do tasks or Create To Do task. |
| `user_id` | string | No | User ID or userPrincipalName. Use 'me' for the signed-in user (delegated auth) or a specific user ID for app-only (S2S) authentication. |
| `todo_task_list_id` | string | Yes | The unique identifier of the task list that contains the task. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Permanently Delete User Calendar Event

**Slug:** `OUTLOOK_DELETE_USER_CALENDAR_EVENT_PERMANENTLY`

Tool to permanently delete a calendar event from a specific user's calendar. Use when you need to ensure an event cannot be restored from deleted items.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address, UPN, or 'me' for the currently authenticated user. |
| `event_id` | string | Yes | The unique identifier of the calendar event to permanently delete. The event will be permanently deleted and cannot be recovered by the user. |
| `calendar_id` | string | Yes | The unique identifier of the calendar containing the event. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Contact from User's Child Folder

**Slug:** `OUTLOOK_DELETE_USER_CHILD_FOLDER_CONTACT`

Tool to delete a contact from a child folder in a user's contact folder. Use when you need to remove a contact from a specific child folder within a contact folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The user ID or userPrincipalName of the contact folder owner. Use 'me' for the authenticated user. |
| `contact_id` | string | Yes | Identifier of the contact to be deleted from the child folder. Must be obtained from 'List Contacts' or 'Get Contact'. |
| `child_folder_id` | string | Yes | Identifier of the child folder within the parent contact folder containing the contact to delete. Must be a valid child folder ID. |
| `contact_folder_id` | string | Yes | Identifier of the parent contact folder. Must be a valid contact folder ID obtained from 'Get Contact Folders' or 'List Contact Folders'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete User Child Folder Message Permanently

**Slug:** `OUTLOOK_DELETE_USER_CHILD_FOLDER_MESSAGE_PERMANENTLY`

Tool to permanently delete a message from a user's child mail folder in Outlook. Unlike standard DELETE, this action makes the message unrecoverable by moving it to the Purges folder in the dumpster. Use when you need to ensure a message in a nested folder cannot be restored from deleted items.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `message_id` | string | Yes | The unique identifier of the message to permanently delete from the child folder. The message will be moved to the Purges folder in the dumpster and cannot be recovered by the user. Typically a base64-encoded string obtained from list messages or search messages actions. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the parent mail folder. Common well-known names include: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox'. For folder IDs, use base64-encoded strings (e.g., 'AAMkAGI0ZjExAAA=') obtained from list mail folders actions. |
| `child_folder_id` | string | Yes | The ID of the child folder containing the message to permanently delete. Must be a base64-encoded folder ID (e.g., 'AAMkADAwATMwMAExAAA=') obtained from list child folders actions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete user contact extension

**Slug:** `OUTLOOK_DELETE_USER_CONTACT_EXTENSION`

Deprecated: Use OUTLOOK_DELETE_CONTACTS_EXTENSIONS instead, which supports both /me and /users/{user_id} endpoints.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user whose contact extension to delete. Can be the user's email address or the user's object ID. |
| `contact_id` | string | Yes | The unique identifier of the contact that has the extension to delete. |
| `extension_id` | string | Yes | The unique identifier of the extension to delete. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.com.contoso.roamingSettings) or just the extension name (e.g., com.contoso.roamingSettings). |
| `child_folder_id` | string | Yes | The unique identifier of the child contact folder containing the contact. |
| `contact_folder_id` | string | Yes | The unique identifier of the parent contact folder. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Permanently Delete User Event

**Slug:** `OUTLOOK_DELETE_USER_EVENT_PERMANENTLY`

Tool to permanently delete a calendar event for a specified user. Use when you need to ensure an event cannot be restored from deleted items.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The user ID or userPrincipalName of the calendar owner. Use 'me' for the authenticated user. |
| `event_id` | string | Yes | The unique identifier of the calendar event to permanently delete. The event will be permanently deleted and cannot be recovered by the user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Permanently Delete User Mail Folder

**Slug:** `OUTLOOK_DELETE_USER_MAIL_FOLDER_PERMANENTLY`

Permanently deletes a mail folder for a specific user. Unlike standard DELETE, this action makes the folder permanently unrecoverable. Use when you need to ensure a user's folder cannot be restored from deleted items.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The user ID or user principal name (email address) of the user whose mail folder should be permanently deleted. This is required to identify which user's mailbox contains the folder. |
| `mail_folder_id` | string | Yes | Unique identifier of the mail folder to permanently delete. The folder will be permanently deleted and cannot be recovered by the user. Use 'List Mail Folders' action to obtain the folder ID. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete user message attachment

**Slug:** `OUTLOOK_DELETE_USER_MESSAGE_ATTACHMENT`

Deprecated: Use OUTLOOK_DELETE_ME_MESSAGES_ATTACHMENTS instead, which supports both /me and /users/{user_id} endpoints.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address, userPrincipalName, or user ID. Use 'me' for the authenticated user. |
| `message_id` | string | Yes | The unique identifier of the message containing the attachment to delete. Typically obtained from listing messages or search operations. |
| `attachment_id` | string | Yes | The unique identifier of the attachment to delete. Can be obtained from listing message attachments. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Dismiss user calendar event reminder

**Slug:** `OUTLOOK_DISMISS_CALENDAR_EVENT_REMINDER`

Tool to dismiss a reminder for a specific event in a user's calendar. Use when you need to turn off or remove a reminder alert for an event in a specific user's calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier or user principal name (UPN) of the user. Can be 'me' for the authenticated user. |
| `event_id` | string | Yes | The unique identifier of the event whose reminder should be dismissed. |
| `calendar_id` | string | Yes | The unique identifier of the calendar containing the event. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Dismiss event reminder

**Slug:** `OUTLOOK_DISMISS_EVENT_REMINDER`

Tool to dismiss a reminder for a specific calendar event. Use when you need to turn off or remove a reminder alert for an event.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The unique identifier or email of the user. Required for S2S authentication with app-only permissions. |
| `event_id` | string | Yes | The unique identifier of the calendar event whose reminder should be dismissed. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Dismiss user calendar group event reminder

**Slug:** `OUTLOOK_DISMISS_EVENT_REMINDER_FROM_GROUP`

Tool to dismiss a reminder for an event in a user's calendar within a calendar group. Use when you need to turn off a reminder for an event in a specific user's calendar group.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user or userPrincipalName. Use 'me' for the signed-in user. |
| `event_id` | string | Yes | The unique identifier of the event whose reminder should be dismissed. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group containing the calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Dismiss user event reminder

**Slug:** `OUTLOOK_DISMISS_USER_EVENT_REMINDER`

Tool to dismiss a reminder for a specific user's calendar event. Use when you need to turn off or remove a reminder alert for an event in a user's calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The user ID or userPrincipalName (email address) of the calendar owner, identifying whose event reminder should be dismissed. |
| `event_id` | string | Yes | The unique identifier of the calendar event whose reminder should be dismissed. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Download Outlook attachment

**Slug:** `OUTLOOK_DOWNLOAD_OUTLOOK_ATTACHMENT`

Downloads a specific file attachment from an email message in a Microsoft Outlook mailbox; the attachment must contain 'contentBytes' (binary data) and not be a link or embedded item. High-volume parallel calls may trigger HTTP 429 responses; honor the Retry-After header and use exponential backoff.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's UPN (User Principal Name) or 'me' for the authenticated user. This identifies the mailbox where the message is located. |
| `file_name` | string | Yes | The desired filename for the downloaded attachment. This name will be assigned to the. |
| `message_id` | string | Yes | The unique identifier of the email message that contains the attachment to be downloaded. This ID is typically obtained when listing or retrieving messages. |
| `attachment_id` | string | Yes | The Microsoft Graph API attachment identifier (NOT the filename). This is a base64-encoded opaque string returned in the 'id' field when listing attachments via the LIST_OUTLOOK_ATTACHMENTS action. Must be the exact value from the API response, not the attachment's display name or filename. Always use the exact attachment_id/message_id pair returned together from LIST_OUTLOOK_ATTACHMENTS — an attachment_id is bound to its specific message_id and cannot be used with a different message_id. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Find Meeting Times

**Slug:** `OUTLOOK_FIND_MEETING_TIMES`

Suggests meeting times based on organizer and attendee availability, time constraints, and duration requirements. Use when you need to find optimal meeting slots across multiple participants' schedules.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User ID or User Principal Name. Use 'me' for the authenticated user. |
| `attendees` | array | No | List of attendees or resources for the meeting. Empty list searches only organizer's availability. |
| `maxCandidates` | integer | No | Maximum number of meeting time suggestions to return. |
| `timeConstraint` | object | No | Time restrictions for the meeting. |
| `meetingDuration` | string | No | Meeting length in ISO 8601 duration format (e.g., 'PT1H' for 1 hour, 'PT30M' for 30 minutes). Default: 30 minutes. |
| `prefer_timezone` | string | No | Preferred timezone for the response (sets Prefer header with outlook.timezone). If not specified, defaults to UTC. |
| `locationConstraint` | object | No | Meeting location requirements. |
| `isOrganizerOptional` | boolean | No | If true, organizer doesn't need to attend. Default: false. |
| `returnSuggestionReasons` | boolean | No | If true, include reasons for each suggestion. Default: false. |
| `minimumAttendeePercentage` | number | No | Minimum confidence percentage (0-100) for suggestions. Default: 50. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Forward message

**Slug:** `OUTLOOK_FORWARD_MESSAGE`

Tool to forward a message. Use when you need to send an existing email to new recipients.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `comment` | string | No | An optional comment to include with the forwarded message. |
| `user_id` | string | No | The user's email address or alias 'me' to indicate the authenticated user. Specifies which mailbox to use. |
| `message_id` | string | Yes | The unique identifier of the message to forward. Must be a valid Outlook message ID (Base64-encoded string, e.g., 'AAMkAGI2TAAA='). Obtain this from OUTLOOK_LIST_MESSAGES or OUTLOOK_GET_MESSAGE actions. Message IDs are mailbox-specific. |
| `to_recipients` | array | Yes | List of email addresses to forward the message to. Provide each address separately. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Forward user calendar event

**Slug:** `OUTLOOK_FORWARD_USER_CALENDAR_EVENT`

Tool to forward a calendar event from a specific user's calendar to new recipients. Use when you need to share an event from a particular calendar with additional people.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `comment` | string | No | An optional comment to include with the forwarded event invitation. |
| `user_id` | string | No | The user identifier. Use 'me' for the authenticated user, or provide a Microsoft 365 User Principal Name (e.g., user@contoso.com) or Azure AD object ID. |
| `event_id` | string | Yes | The unique identifier of the calendar event to forward. Must be a valid Outlook event ID obtained from list or get event actions. |
| `calendar_id` | string | Yes | The unique identifier of the calendar containing the event to forward. Obtain this from list calendars actions. |
| `to_recipients` | array | Yes | List of recipients to forward the event to. Can provide email addresses as strings (e.g., 'alice@example.com') or as objects with 'address' and optional 'name' fields. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get specific calendar

**Slug:** `OUTLOOK_GET_CALENDAR`

Deprecated: Use OUTLOOK_GET_USER_CALENDAR instead, which supports both /me and /users/{user_id} endpoints and adds $select field filtering.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `calendar_id` | string | Yes | The unique identifier of the calendar to retrieve. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get event from calendar

**Slug:** `OUTLOOK_GET_CALENDAR_EVENT`

Tool to retrieve a specific event from a specified calendar. Use when you need to get details of an event that belongs to a specific calendar in the user's mailbox.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user ID (GUID) or email address of the user. Required for app-only (S2S) authentication. If not provided, uses the authenticated user context (/me). |
| `event_id` | string | Yes | The unique identifier of the event within the calendar. |
| `calendar_id` | string | Yes | The unique identifier of the calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get calendar event attachment

**Slug:** `OUTLOOK_GET_CALENDAR_EVENT_ATTACHMENT`

Tool to retrieve a specific attachment from an event within a calendar. Use when you need to access attachment content from a calendar event.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user ID or user principal name (email) to access calendars on behalf of. Required for S2S (app-only) authentication. If not provided, defaults to 'me' for delegated authentication. |
| `event_id` | string | Yes | The unique identifier of the calendar event containing the attachment. |
| `calendar_id` | string | Yes | The unique identifier of the calendar. |
| `attachment_id` | string | Yes | The unique identifier of the attachment to retrieve. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get calendar from event

**Slug:** `OUTLOOK_GET_CALENDAR_FROM_EVENT`

Tool to retrieve the parent calendar that contains a specific event. Use when you need to get calendar details for a specific event in a calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user ID or user principal name (email address). Required for S2S (app-only) authentication. Use 'me' or omit for delegated authentication. |
| `event_id` | string | Yes | The unique identifier of the event within the calendar. |
| `calendar_id` | string | Yes | The unique identifier of the calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get calendar from calendar group

**Slug:** `OUTLOOK_GET_CALENDAR_FROM_GROUP`

Tool to retrieve a specific calendar from a calendar group in Microsoft Outlook. Use when you need to get details of a calendar that belongs to a specific calendar group.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | User ID or userPrincipalName of the user whose calendar to retrieve. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get calendar group

**Slug:** `OUTLOOK_GET_CALENDAR_GROUP`

Tool to retrieve the properties and relationships of a calendar group object. Use when you need to get details of a specific calendar group by its ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `expand` | string | No | Comma-separated list of related entities to expand in the response (OData $expand query parameter). |
| `select` | string | No | Comma-separated list of properties to include in the response (OData $select query parameter). |
| `user_id` | string | No | User ID or userPrincipalName. Use 'me' for the signed-in user. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group to retrieve. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get event extension

**Slug:** `OUTLOOK_GET_CALENDAR_GROUP_CALENDAR_EVENT_EXTENSION`

Tool to retrieve an open extension from a calendar event within a specific calendar group and calendar. Use when you need to access custom data stored with an event.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The unique identifier of the user (required for S2S/application authentication). Can be user ID (GUID) or userPrincipalName (email). |
| `event_id` | string | Yes | The unique identifier of the calendar event containing the extension. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `extension_id` | string | Yes | The unique identifier of the extension to retrieve. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.TestExtension) or just the extension name (e.g., Com.Contoso.TestExtension). |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get calendar group event attachment

**Slug:** `OUTLOOK_GET_CALENDAR_GROUP_EVENT_ATTACHMENT`

Deprecated: Use OUTLOOK_GET_USER_CALENDAR_GROUP_EVENT_ATTACHMENT instead, which supports both /me and /users/{user_id} endpoints.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The unique identifier of the user. Can use 'me' as shortcut for authenticated user. |
| `event_id` | string | Yes | The unique identifier of the calendar event containing the attachment. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `attachment_id` | string | Yes | The unique identifier of the attachment to retrieve. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get User Calendar Group Schedule

**Slug:** `OUTLOOK_GET_CALENDAR_GROUP_SCHEDULE`

Tool to retrieve free/busy schedule information for a specific user's calendar within a calendar group. Use when you need availability data from a particular user's calendar that belongs to a calendar group.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `endTime` | object | Yes | The date, time, and time zone that the period ends. The period can be up to 62 days. |
| `user_id` | string | Yes | The ID or userPrincipalName of the user. Use 'me' for the authenticated user or a user's email address. |
| `schedules` | array | Yes | A collection of SMTP addresses of users, distribution lists, or resources to get availability information for. Maximum of 20 addresses. |
| `startTime` | object | Yes | The date, time, and time zone that the period starts. |
| `calendar_id` | string | Yes | The ID of the calendar within the calendar group. |
| `calendar_group_id` | string | Yes | The ID of the calendar group containing the calendar. |
| `availabilityViewInterval` | integer | No | Duration of a time slot in an availabilityView in minutes. Default is 30, minimum is 5, maximum is 1440. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user calendar permission

**Slug:** `OUTLOOK_GET_CALENDAR_PERMISSION`

Tool to retrieve a specific calendar permission for a user's calendar. Use when you need to check who has access to a specific user's calendar and their permission level.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | User ID or userPrincipalName of the user whose calendar permission to retrieve. |
| `permission_id` | string | Yes | The unique identifier of the calendar permission to retrieve. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user calendar permission

**Slug:** `OUTLOOK_GET_CALENDAR_PERMISSION_FROM_CALENDAR`

Tool to retrieve a specific calendar permission from a user's calendar. Use when you need to check who has access to a specific user's calendar and their permission level.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. Cannot use 'me' shortcut - must be actual user ID or userPrincipalName. |
| `calendar_id` | string | Yes | The unique identifier of the calendar. |
| `permission_id` | string | Yes | The unique identifier of the calendar permission to retrieve. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Calendar Schedule

**Slug:** `OUTLOOK_GET_CALENDAR_SCHEDULE`

Tool to get free/busy schedule information for users, distribution lists, or resources. Use when you need to check availability for specific people or resources during a time period.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `endTime` | object | Yes | The end date, time, and time zone for the period to retrieve schedules. Period can be up to 62 days from start. |
| `user_id` | string | No | The unique identifier (GUID) or email address of the user whose calendar to query. For delegated auth, omit this (or use None, not 'me') to query the authenticated user's calendar. For S2S (app-only) auth, this is required. |
| `schedules` | array | Yes | A collection of SMTP addresses of users, distribution lists, or resources to get availability information for. Maximum of 20 addresses. |
| `startTime` | object | Yes | The start date, time, and time zone for the period to retrieve schedules. Period can be up to 62 days. |
| `availabilityViewInterval` | integer | No | Duration of a time slot in minutes. Minimum: 5, Maximum: 1440. Default: 30. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Calendar View

**Slug:** `OUTLOOK_GET_CALENDAR_VIEW`

Get events ACTIVE during a time window (includes multi-day events). Use for "what's on my calendar today/this week" or availability checks. Returns events overlapping the time range. For keyword search or filters by category, use OUTLOOK_LIST_EVENTS instead.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of events to retrieve. |
| `select` | array | No | List of event properties to return. Defaults to commonly-needed fields excluding the full HTML body. To include the full body content, explicitly add 'body' to this list. |
| `user_id` | string | No | Email address of the target user (or 'me' for authenticated user). |
| `timezone` | string | No | Timezone for event times in the response only; the input window is always interpreted from the offset in start_datetime/end_datetime. Must be an IANA timezone name (e.g., 'America/New_York', 'Europe/London', 'Asia/Kolkata') or Windows timezone identifier (e.g., 'Pacific Standard Time', 'India Standard Time'). UTC offsets like '+05:30' or 'GMT+5' are NOT supported. Defaults to UTC. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `calendar_id` | string | No | Optional ID of a specific calendar to query. Must be a calendar identifier (format like 'AAMkAGI2TG93AAA='), NOT an email address. If not provided, uses the primary calendar. Get calendar IDs using LIST_CALENDARS action. |
| `end_datetime` | string | Yes | The end date and time of the time range, represented in ISO 8601 format. For example, '2019-11-08T20:00:00-08:00' or '2024-12-31T23:59:59Z'. |
| `start_datetime` | string | Yes | The start date and time of the time range, represented in ISO 8601 format. For example, '2019-11-08T19:00:00-08:00' or '2024-01-01T00:00:00Z'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get child folder message

**Slug:** `OUTLOOK_GET_CHILD_FOLDER_MESSAGE`

Tool to retrieve a specific email message from a child mail folder. Use when you need to access a message in a nested folder hierarchy.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | array | No | List of message properties to include in the response. OData $select parameter. Reduces data transfer and improves performance. Common fields: id, subject, from, toRecipients, ccRecipients, receivedDateTime, sentDateTime, body, bodyPreview, hasAttachments, webLink, internetMessageHeaders, isRead, importance, categories. Leave empty to return all fields. |
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `message_id` | string | Yes | Unique ID of the message to retrieve. Must be obtained from OUTLOOK_LIST_MAIL_FOLDER_MESSAGES, OUTLOOK_QUERY_EMAILS, or OUTLOOK_SEARCH_MESSAGES (use hitId from search results). The message must exist in the specified child folder. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the parent mail folder. Common well-known names include: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. For custom folders, use the actual folder ID (a base64-encoded string like 'AAMkAGI0ZjExAAA=') obtained from OUTLOOK_LIST_MAIL_FOLDERS. |
| `child_folder_id` | string | Yes | The ID of the child mail folder containing the message. This must be a base64-encoded folder ID (e.g., 'AQMkADAwATMwMAExLTlmNjktOWVmYS0wMAItMDAKAC4=') obtained from OUTLOOK_LIST_CHILD_MAIL_FOLDERS. Well-known names are NOT valid for child folders. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get child folder message MIME content

**Slug:** `OUTLOOK_GET_CHILD_FOLDER_MESSAGE_CONTENT`

Tool to get the MIME content of a message from a child mail folder. Use when you need to download the raw MIME format of an email message for analysis or archival.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. Use 'me' for delegated authentication or provide a specific user ID/email for S2S (app-only) authentication. |
| `message_id` | string | Yes | The unique identifier of the message whose MIME content to retrieve. Must be obtained from message listing or query operations. |
| `mail_folder_id` | string | Yes | The unique identifier of the parent mail folder. Must be obtained from 'List Mail Folders' or other mail folder operations. |
| `child_folder_id` | string | Yes | The unique identifier of the child mail folder within the parent folder. Must be obtained from 'List Child Mail Folders' or other folder operations. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get child mail folder

**Slug:** `OUTLOOK_GET_CHILD_MAIL_FOLDER`

Tool to retrieve a specific child mail folder from a parent mail folder. Use when you need details about a specific subfolder within a folder hierarchy.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | string | No | Comma-separated list of mailFolder properties to include in the response. Valid properties include: id, displayName, parentFolderId, childFolderCount, unreadItemCount, totalItemCount, sizeInBytes, isHidden. Example: 'id,displayName,childFolderCount'. |
| `user_id` | string | No | User's id, userPrincipalName, or 'me' for the signed-in user. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the parent mail folder. Common well-known names include: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. For folder IDs, obtain them from OUTLOOK_LIST_MAIL_FOLDERS or previous childFolders responses. Folder IDs are base64-encoded strings (e.g., 'AAMkAGI0ZjExAAA=') that are mailbox-specific and must come from the same user's mailbox. |
| `child_folder_id` | string | Yes | The unique ID of the child folder to retrieve. Obtain child folder IDs from OUTLOOK_LIST_CHILD_MAIL_FOLDERS or previous API responses. Child folder IDs are base64-encoded strings that are mailbox-specific and must come from the same user's mailbox. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get contact extension

**Slug:** `OUTLOOK_GET_CONTACT_EXTENSION`

Tool to retrieve an open extension from a contact in Microsoft Graph. Use when you need to access custom data stored with a contact.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user ID (GUID) or user principal name (email) for S2S authentication. If not provided, uses '/me' endpoint for delegated authentication. |
| `contact_id` | string | Yes | The unique identifier of the contact that has the extension. |
| `extension_id` | string | Yes | The unique identifier of the extension to retrieve. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.TestExtension) or just the extension name (e.g., Com.Contoso.TestExtension). |
| `contact_folder_id` | string | Yes | The unique identifier of the contact folder containing the contact. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get contact folder

**Slug:** `OUTLOOK_GET_CONTACT_FOLDER`

Tool to retrieve a specific contact folder by ID. Use when you need details about a particular contact folder in the user's mailbox.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | string | No | OData query parameter to select specific properties, e.g., 'id,displayName'. |
| `user_id` | string | No | The ID or userPrincipalName of the user. Required for app-only authentication (S2S). If not provided, uses '/me' endpoint for delegated authentication. |
| `contact_folder_id` | string | Yes | The ID of the contact folder to retrieve. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List user contact folders

**Slug:** `OUTLOOK_GET_CONTACT_FOLDERS`

Tool to retrieve contact folders from a specific user's mailbox. Use when you need to list or browse contact folders for a given user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of contact folders to return. OData $top parameter. |
| `skip` | integer | No | Number of contact folders to skip for pagination. OData $skip parameter. |
| `expand` | array | No | Related entities to expand inline. OData $expand parameter. |
| `filter` | string | No | OData filter expression to filter the contact folders, e.g., startswith(displayName,'A'). |
| `select` | array | No | List of properties to include in the response. OData $select parameter. |
| `orderby` | array | No | List of properties to order results by. OData $orderby parameter. |
| `user_id` | string | Yes | User principal name or ID. Use 'me' for the authenticated user. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get contact from folder

**Slug:** `OUTLOOK_GET_CONTACT_FROM_FOLDER`

Tool to retrieve a specific contact from a contact folder by its ID. Use when you need to access contact details from a specific folder rather than the default contacts location.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `expand` | array | No | List of relationships to expand and include in the response. Leave empty for default behavior. |
| `select` | array | No | List of specific contact properties to include in the response, e.g., ['displayName', 'emailAddresses']. Leave empty to get all properties. |
| `user_id` | string | No | User's principal name (e.g., 'AdeleV@contoso.onmicrosoft.com') or 'me' for the authenticated user. Using 'me' is recommended for accessing one's own contacts. |
| `contact_id` | string | Yes | Unique identifier for the contact within the specified contact folder. |
| `contact_folder_id` | string | Yes | Unique identifier of the contact folder containing the contact. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get drafts mail folder

**Slug:** `OUTLOOK_GET_DRAFTS_MAIL_FOLDER`

Tool to get the drafts mail folder. Use when you need to retrieve details about the drafts folder such as item counts and folder ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | string | No | Comma-separated list of properties to include in the response. Valid properties: id, displayName, parentFolderId, childFolderCount, unreadItemCount, totalItemCount, sizeInBytes, isHidden. |
| `user_id` | string | No | User's id, userPrincipalName, or 'me' for the signed-in user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get calendar event

**Slug:** `OUTLOOK_GET_EVENT`

Retrieves the full details of a specific calendar event by its ID from a user's Outlook calendar, provided the event exists.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's primary SMTP address, user principal name (UPN), or the alias 'me' (for the signed-in user) to identify the calendar owner. |
| `event_id` | string | Yes | The unique identifier of the calendar event to retrieve. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get event attachment

**Slug:** `OUTLOOK_GET_EVENT_ATTACHMENT`

Tool to retrieve a specific attachment from an Outlook calendar event by attachment ID. Use when you need to download or access the content of a particular event attachment.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's primary SMTP address, UPN, or 'me' for the signed-in user. |
| `event_id` | string | Yes | The unique identifier of the calendar event containing the attachment. |
| `attachment_id` | string | Yes | The unique identifier of the attachment to retrieve. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get event calendar from calendar group

**Slug:** `OUTLOOK_GET_EVENT_CALENDAR_FROM_GROUP`

Tool to retrieve the calendar that contains a specific event within a calendar group. Use when you need to get calendar details for an event in a calendar group.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user ID (GUID or email) for S2S authentication. If not provided, uses /me endpoint for delegated auth. |
| `event_id` | string | Yes | The unique identifier of the event within the calendar. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get inference classification

**Slug:** `OUTLOOK_GET_INFERENCE_CLASSIFICATION`

Tool to get inference classification settings for the authenticated user. Use when you need to retrieve the Focused Inbox configuration and sender-specific overrides that determine message classification.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The ID or email address of the user. Required for S2S (app-only) authentication. Use the user's GUID or email format (e.g., '43f0c14d-bca8-421f-b762-c3d8dd75be1f' or 'user@example.com'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get mailbox settings

**Slug:** `OUTLOOK_GET_MAILBOX_SETTINGS`

Tool to retrieve mailbox settings. Use when you need to view settings such as automatic replies, time zone, and working hours for the signed-in or specified user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | array | No | OData $select query to specify mailbox settings properties to include. Valid properties: archiveFolder, automaticRepliesSetting, dateFormat, delegateMeetingMessageDeliveryOptions, language, timeFormat, timeZone, userPurpose, workingHours. |
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get mail delta

**Slug:** `OUTLOOK_GET_MAIL_DELTA`

Retrieve incremental changes (delta) of messages in a mailbox. FIRST RUN: Returns ALL messages in folder (use top=50 to limit). Response has @odata.deltaLink. SUBSEQUENT: Pass stored deltaLink to get only NEW/UPDATED/DELETED messages since last sync. Properties available: id, subject, from, receivedDateTime, isRead, etc. NOT available: internetMessageHeaders, full body, attachment content (response size limits).

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of items to return per page. For first run without delta_token, use top=50 or top=100 to limit results. First delta call without token returns all messages in folder. Paginate through results using @odata.nextLink, then store @odata.deltaLink for next sync. |
| `expand` | array | No | Navigation properties to expand inline. Supported values: 'attachments', 'multiValueExtendedProperties', 'singleValueExtendedProperties'. Regular properties (body, from, toRecipients, etc.) cannot be expanded and will cause errors. |
| `select` | array | No | List of message properties to include (e.g. ['subject','receivedDateTime']). Delta sync has property limitations due to response size constraints. Not available in delta: internetMessageHeaders, body (full), attachments (full content). Available: id, subject, from, toRecipients, ccRecipients, bccRecipients, receivedDateTime, sentDateTime, isRead, isDraft, importance, hasAttachments, categories, conversationId, flag, webLink, bodyPreview (first 255 chars). |
| `user_id` | string | No | User identifier: 'me' for the signed-in user or the user's email/UPN. |
| `folder_id` | string | No | Mail folder identifier (folder GUID) or well-known folder name. Well-known names (case-insensitive): 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'outbox', 'archive', 'clutter', 'conversationhistory'. For custom folders, use the folder ID GUID from LIST_MAIL_FOLDERS. Defaults to 'inbox' when omitted. |
| `skip_token` | string | No | Skip token for paging through large result sets during initial sync. Accepts either the full @odata.nextLink URL or just the bare token value. Keep paginating until you receive '@odata.deltaLink' instead of nextLink. Mutually exclusive with delta_token - only one should be provided per request. |
| `delta_token` | string | No | Delta token from a previous call to get only changes since that state. Accepts either the full @odata.deltaLink URL or just the bare token value. If omitted or invalid (placeholders like <token> are ignored), performs initial sync. Use top parameter on first run to limit results. Response includes @odata.deltaLink - store this for subsequent calls. Mutually exclusive with skip_token - only one should be provided per request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get mail folder

**Slug:** `OUTLOOK_GET_MAIL_FOLDER`

Tool to retrieve a mail folder by ID or well-known name. Use when you need to get details about a specific folder such as item counts, size, and folder properties.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | string | No | Comma-separated list of properties to include in the response. Valid properties: id, displayName, parentFolderId, childFolderCount, unreadItemCount, totalItemCount, sizeInBytes, isHidden. |
| `user_id` | string | No | User's id, userPrincipalName, or 'me' for the signed-in user. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the mail folder to retrieve. ONLY these specific well-known names are valid as string names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. Arbitrary folder names (e.g., 'workjournal') are NOT valid. If the folder is not one of these well-known names, you MUST use the actual folder ID - a base64-encoded string (e.g., 'AAMkAGI0ZjExAAA=') obtained from OUTLOOK_LIST_MAIL_FOLDERS or OUTLOOK_LIST_CHILD_MAIL_FOLDERS. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get mail folder message

**Slug:** `OUTLOOK_GET_MAIL_FOLDER_MESSAGE`

Tool to retrieve a specific message from a mail folder by its ID. Use when you need to fetch full message details including subject, body, sender, recipients, timestamps, and other metadata from a specific mail folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | array | No | Comma-separated list of message properties to include in the response. Valid properties include: id, subject, from, toRecipients, ccRecipients, bccRecipients, receivedDateTime, sentDateTime, hasAttachments, importance, isRead, body, bodyPreview, categories, conversationId, flag, internetMessageHeaders, parentFolderId, replyTo, sender, webLink, isDraft, isReadReceiptRequested, isDeliveryReceiptRequested, changeKey, createdDateTime, lastModifiedDateTime, inferenceClassification. Leave empty to return all fields. |
| `user_id` | string | No | User's id, userPrincipalName, or 'me' for the signed-in user. |
| `message_id` | string | Yes | The unique ID of the message to retrieve. Accepts message IDs from: OUTLOOK_LIST_MESSAGES (message.id), OUTLOOK_QUERY_EMAILS (message.id), OUTLOOK_LIST_MAIL_FOLDER_MESSAGES (message.id), or OUTLOOK_SEARCH_MESSAGES (use hitId from search results). The message must exist in the specified mail folder; otherwise, a 404 error will occur. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the mail folder containing the message. ONLY these specific well-known names are valid as string names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. Arbitrary folder names (e.g., 'workjournal') are NOT valid. If the folder is not one of these well-known names, you MUST use the actual folder ID - a base64-encoded string (e.g., 'AAMkAGI0ZjExAAA=') obtained from OUTLOOK_LIST_MAIL_FOLDERS or OUTLOOK_LIST_CHILD_MAIL_FOLDERS. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user mail folder message rule

**Slug:** `OUTLOOK_GET_MAIL_FOLDER_MESSAGE_RULE`

Tool to retrieve a specific message rule from a user's mail folder. Use when you need details about an email rule in a particular user's folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rule_id` | string | Yes | The unique identifier of the message rule to retrieve. This can be obtained from list email rules actions. |
| `user_id` | string | Yes | The unique identifier of the user. Can be the user's email address, user principal name (UPN), or user ID. Use 'me' for the authenticated user. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the mail folder containing the message rule. Well-known names include: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive'. For other folders, use the folder ID obtained from list mail folders actions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get mail tips

**Slug:** `OUTLOOK_GET_MAIL_TIPS`

Tool to retrieve mail tips such as automatic replies and mailbox full status. Use when you need to check recipient status before sending mail.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User principal name (UPN) or 'me' for the signed-in user. |
| `EmailAddresses` | array | Yes | Collection of SMTP addresses of recipients to get MailTips for. |
| `MailTipsOptions` | array | Yes | List of mail tip types to retrieve for each recipient. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get master categories

**Slug:** `OUTLOOK_GET_MASTER_CATEGORIES`

Tool to retrieve the user's master category list. Use when you need to get all categories defined for the user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of master categories to return (OData $top). |
| `skip` | integer | No | Number of master categories to skip for pagination (OData $skip). |
| `filter` | string | No | OData $filter query to filter master categories. |
| `select` | array | No | OData $select query to specify properties to include. |
| `orderby` | array | No | OData $orderby query to order master categories by property values. |
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get master category

**Slug:** `OUTLOOK_GET_MASTER_CATEGORY`

Tool to retrieve properties of a specific category from the user's master category list. Use when you need details about a specific category.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |
| `category_id` | string | Yes | Unique identifier of the Outlook category to retrieve. This ID can be obtained from Get Master Categories action. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user's default calendar

**Slug:** `OUTLOOK_GET_ME_CALENDAR`

Tool to get the properties and relationships of the signed-in user's default calendar. Use when you need to retrieve calendar details for the authenticated user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User ID or userPrincipalName. Use 'me' for the signed-in user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user child contact folder

**Slug:** `OUTLOOK_GET_ME_CONTACT_FOLDERS_CHILD_FOLDER`

Tool to retrieve a specific child contact folder for a user by ID. Use when you need details of a child folder nested within a parent contact folder for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | array | No | List of properties to include in the response. OData $select parameter. Valid properties: id, displayName, parentFolderId. |
| `user_id` | string | Yes | The unique identifier of the user. Can use 'me' as a shortcut for the authenticated user, or provide user ID or userPrincipalName. |
| `child_folder_id` | string | Yes | The unique identifier of the child contact folder to retrieve. |
| `contact_folder_id` | string | Yes | The unique identifier of the parent contact folder. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get contact from child folder

**Slug:** `OUTLOOK_GET_ME_CONTACT_FROM_CHILD_FOLDER`

Tool to retrieve a specific contact from a nested child folder within a contact folder. Use when you need contact details from a child folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `expand` | string | No | Comma-separated list of relationships to expand and include in the response. OData $expand parameter. |
| `select` | string | No | Comma-separated list of properties to include in the response. OData $select parameter. |
| `user_id` | string | Yes | User principal name or ID of the user. Use 'me' for the authenticated user. |
| `contact_id` | string | Yes | The unique identifier of the contact to retrieve. |
| `child_folder_id` | string | Yes | The ID of the child folder containing the contact. For deeply nested folders, provide only the immediate parent folder ID. |
| `contact_folder_id` | string | Yes | The ID of the parent contact folder containing the child folder. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get contact photo

**Slug:** `OUTLOOK_GET_ME_CONTACT_PHOTO`

Tool to get the binary media content of a contact's profile photo. Use when you need to download or retrieve a contact's picture.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user ID or email address. Required for app-only (S2S) authentication. If not provided, uses '/me' endpoint for delegated auth. |
| `contact_id` | string | Yes | The unique identifier of the contact whose photo to retrieve. Must be obtained from 'List Contacts' or 'Get Contact'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get contact

**Slug:** `OUTLOOK_GET_ME_CONTACTS`

Retrieves a specific Outlook contact by its `contact_id` from the contacts of a specified `user_id` (defaults to 'me' for the authenticated user).

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's principal name (e.g., 'AdeleV@contoso.onmicrosoft.com') or 'me' for the authenticated user. Using 'me' is recommended for accessing one's own contacts. |
| `contact_id` | string | Yes | Unique identifier for the contact within the specified user's Outlook address book. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user contact extension

**Slug:** `OUTLOOK_GET_ME_CONTACTS_EXTENSIONS`

Tool to retrieve a specific open extension from a user's contact. Use when you need to access custom data stored with a contact.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier or user principal name of the user. Use 'me' for the authenticated user. |
| `contact_id` | string | Yes | The unique identifier of the contact that has the extension. |
| `extension_id` | string | Yes | The unique identifier of the extension to retrieve. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Composio.TestExtension) or just the extension name (e.g., Com.Composio.TestExtension). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user event attachment

**Slug:** `OUTLOOK_GET_ME_EVENT_ATTACHMENT`

Tool to retrieve a specific attachment from a user's calendar event. Use when you need to access attachment details including content from a specific user's event.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. Use the user's UPN (e.g., 'user@contoso.com') or user ID. |
| `event_id` | string | Yes | The unique identifier of the calendar event containing the attachment. |
| `attachment_id` | string | Yes | The unique identifier of the attachment to retrieve. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get event calendar

**Slug:** `OUTLOOK_GET_ME_EVENT_CALENDAR`

Tool to retrieve the calendar that contains a specific event. Use when you need to get calendar details for an event.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User ID or userPrincipalName. Use 'me' for the signed-in user. |
| `event_id` | string | Yes | The unique identifier of the event. This ID can be obtained from listing calendar events or other event operations. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get mail folder message attachment (Deprecated)

**Slug:** `OUTLOOK_GET_ME_MAIL_FOLDER_MESSAGE_ATTACHMENT`

DEPRECATED: Use OUTLOOK_GET_USER_MESSAGES_ATTACHMENTS instead. Tool to get a specific attachment from a message in a mail folder. Use when you have the folder ID, message ID, and attachment ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `expand` | string | No | OData $expand parameter. Use 'microsoft.graph.itemattachment/item' to get the properties of the item (contact, event, or message) that is attached to the message. Can be used to expand nested attachments up to 30 levels. |
| `user_id` | string | No | The user ID or user principal name (email) of the user whose message attachment to retrieve. Required for S2S (app-only) authentication. If not provided, defaults to 'me' (authenticated user) which only works with delegated authentication. For S2S authentication with client credentials, you must provide the user_id (GUID) or email address. |
| `message_id` | string | Yes | The unique identifier of the email message containing the attachment. Must be a message ID obtained from OUTLOOK_LIST_MESSAGES or OUTLOOK_SEARCH_EMAILS. |
| `attachment_id` | string | Yes | The unique identifier of the attachment to retrieve. This ID is obtained from listing attachments. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the mail folder containing the message. ONLY these specific well-known names are valid as string names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. Arbitrary folder names (e.g., 'workjournal') are NOT valid. If the folder is not one of these well-known names, you MUST use the actual folder ID - a base64-encoded string (e.g., 'AAMkAGI0ZjExAAA=') obtained from OUTLOOK_LIST_MAIL_FOLDERS or OUTLOOK_LIST_CHILD_MAIL_FOLDERS. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get message extension

**Slug:** `OUTLOOK_GET_ME_MAIL_FOLDERS_MESSAGES_EXTENSIONS`

Tool to retrieve a specific extension from a message in a user's mailbox. Use when you need to read custom data stored in a message extension.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User ID, userPrincipalName, or 'me' for the authenticated user. |
| `message_id` | string | Yes | The unique identifier of the message containing the extension. |
| `extension_id` | string | Yes | The unique identifier of the extension. Can be the extension name (e.g., 'Com.Contoso.Test') or the fully qualified name (e.g., 'Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.Test'). |
| `mail_folder_id` | string | Yes | The unique identifier of the mail folder containing the message. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get message MIME content

**Slug:** `OUTLOOK_GET_ME_MESSAGE_MIME_CONTENT`

Tool to get the MIME content of a message. Use when you need to download the raw MIME format of an email message for analysis or archival.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user ID or principal name (email) of the user whose message to retrieve. Required when using app-only (S2S) authentication. If not provided, defaults to '/me' endpoint for delegated authentication. |
| `message_id` | string | Yes | The unique identifier of the message whose MIME content to retrieve. Must be obtained from message listing or query operations. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user outlook

**Slug:** `OUTLOOK_GET_ME_OUTLOOK`

Tool to retrieve the outlookUser object for a specified user. Use when you need to access the Outlook services entity for a user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get email message

**Slug:** `OUTLOOK_GET_MESSAGE`

Retrieves a specific email message by its ID from the specified user's Outlook mailbox. Use the 'select' parameter to include specific fields like 'internetMessageHeaders' for filtering automated emails. Retries transient Microsoft Graph 404 responses with exponential backoff for up to 7.5 seconds because newly surfaced messages can be eventually consistent.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | array | No | List of message properties to include in the response. Can be provided as an array of strings (e.g., ['subject', 'body']) or as a comma-separated string (e.g., 'subject,body'). Reduces data transfer and improves performance. Common fields: id, subject, from, toRecipients, ccRecipients, receivedDateTime, sentDateTime, body, bodyPreview, hasAttachments, webLink, internetMessageHeaders, isRead, importance, categories. Leave empty to return all fields. |
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `message_id` | string | Yes | Unique ID of the Outlook email message to retrieve. Accepts message IDs from: OUTLOOK_LIST_MESSAGES (message.id), OUTLOOK_QUERY_EMAILS (message.id), or OUTLOOK_SEARCH_MESSAGES (use hitId from search results, as the resource.id field is not populated by the Search API). The message must exist in the specified user's mailbox. If Microsoft Graph briefly returns 404 because a webhook, create, move, or mailbox index change has not propagated yet, this tool retries with exponential backoff for up to 7.5 seconds; if 404 persists, agents should wait a few seconds and retry before treating the ID as invalid. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user message extension

**Slug:** `OUTLOOK_GET_MESSAGE_EXTENSION`

Tool to retrieve a specific extension from a user's message. Use when you need to read custom data stored in a message extension.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User ID, userPrincipalName, or 'me' for the authenticated user. |
| `message_id` | string | Yes | The unique identifier of the message containing the extension. |
| `extension_id` | string | Yes | The unique identifier of the extension. Can be the extension name (e.g., 'Com.Contoso.Test') or the fully qualified name (e.g., 'Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.Test'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get attachment from nested folder message

**Slug:** `OUTLOOK_GET_NESTED_FOLDER_MESSAGE_ATTACHMENT`

Tool to retrieve a specific attachment from a message located in a nested mail folder structure. Use when you need to get attachment details from messages in deeply nested folders.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. Must be an actual user ID (e.g., '6640adbb5cb743b0') or user principal name (UPN). Cannot use 'me' alias for this endpoint. |
| `message_id` | string | Yes | The unique identifier of the message containing the attachment. |
| `attachment_id` | string | Yes | The unique identifier of the attachment to retrieve. |
| `mail_folder_id` | string | Yes | The ID of the parent mail folder. Can be a well-known folder name (e.g., 'inbox', 'drafts', 'sentitems') or a folder ID obtained from listing mail folders. |
| `child_folder_ids` | array | Yes | List of child folder IDs representing the nested folder path. For a message in /folder1/subfolder1/subfolder2/, provide ['subfolder1_id', 'subfolder2_id']. Can be a single item for one level of nesting or multiple items for deeper nesting. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Outlook profile

**Slug:** `OUTLOOK_GET_PROFILE`

Retrieves the Microsoft Outlook profile for a specified user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' to get the profile of the authenticated user. |
| `include_proxy_addresses` | boolean | No | Whether to include proxy addresses in the response. Proxy addresses are SMTP addresses prefixed with 'SMTP:' (primary) or 'smtp:' (secondary). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get schedule

**Slug:** `OUTLOOK_GET_SCHEDULE`

Retrieves free/busy schedule information for specified email addresses within a defined time window. Read-only; does not reserve time or prevent conflicts — verify availability before creating events.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | No | The user ID or principal name of the user whose calendar to query. Required for S2S (application) authentication. Can be either the GUID user ID (e.g., '43f0c14d-bca8-421f-b762-c3d8dd75be1f') or the user principal name (e.g., 'user@domain.com'). If not provided, the endpoint will use '/me' which requires delegated authentication. |
| `endTime` | object | Yes | The end date, time, and time zone for the period for which to retrieve schedules. The period can be up to 62 days. Object must include `dateTime` (ISO 8601) and `timeZone` (valid Windows or IANA identifier). Must use same timezone convention as `startTime`. |
| `schedules` | array | Yes | A list of SMTP email addresses for users, distribution lists, or resources whose schedules are to be retrieved. Maximum of 20 addresses. Include all relevant participants; omitted addresses may cause slots to appear falsely free. External or invalid addresses may silently return no data. |
| `startTime` | object | Yes | The start date, time, and time zone for the period for which to retrieve schedules. Object must include `dateTime` (ISO 8601) and `timeZone` (valid Windows or IANA identifier, e.g., 'UTC', 'Eastern Standard Time'). Invalid or naive timezone values cause HTTP 400 or silent DST-shifted windows. |
| `availabilityViewInterval` | string | No | The duration of each time slot in the availability view, specified in minutes. Minimum: 5, Maximum: 1440. Default: 30. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get supported languages

**Slug:** `OUTLOOK_GET_SUPPORTED_LANGUAGES`

Tool to retrieve supported languages in the user's mailbox. Use when you need to display or select from available mailbox languages.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get supported time zones

**Slug:** `OUTLOOK_GET_SUPPORTED_TIME_ZONES`

Tool to get the list of time zones supported for a user as configured on their mailbox server. Use when setting up an Outlook client or configuring user time zone preferences.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |
| `TimeZoneStandard` | string ("Windows" | "Iana") | No | Time zone format standard. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user by email

**Slug:** `OUTLOOK_GET_USER_BY_EMAIL`

Retrieves user details from Microsoft Graph by email address (userPrincipalName). Returns user properties including display name, job title, department, and contact information. Use this action when you need to look up a user's profile information using their email address.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | The email address (userPrincipalName) of the user to retrieve. This must be a valid email address format. |
| `select` | array | No | Optional list of user properties to include in the response. Reduces data transfer and improves performance. Common fields: id, displayName, givenName, surname, mail, userPrincipalName, jobTitle, officeLocation, mobilePhone, businessPhones, department. Leave empty to return default properties. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user's calendar

**Slug:** `OUTLOOK_GET_USER_CALENDAR`

Tool to get the properties and relationships of a specific calendar for a user. Use when you need to retrieve details for a particular calendar by its ID for any user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | array | No | Properties to include in the response (OData $select). Specify which calendar fields you want returned to keep the response concise. |
| `user_id` | string | No | User ID or userPrincipalName. Use 'me' for the signed-in user. |
| `calendar_id` | string | Yes | The unique identifier of the calendar to retrieve. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get allowed calendar sharing roles for user calendar

**Slug:** `OUTLOOK_GET_USER_CALENDAR_ALLOWED_SHARING_ROLES`

Tool to retrieve allowed calendar sharing roles for a specific user on a given calendar. Use when you need to determine what permission levels can be granted to a user for sharing a specific calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `User` | string | Yes | The email address or user principal name to check allowed calendar sharing roles for. |
| `user_id` | string | Yes | The user ID or User Principal Name of the calendar owner. Note: This endpoint does not support 'me' as a value; you must provide the explicit email address or user ID. |
| `calendar_id` | string | Yes | The unique identifier of the calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user calendar event

**Slug:** `OUTLOOK_GET_USER_CALENDAR_EVENT`

Tool to retrieve a specific calendar event from a user's primary calendar. Use when you need detailed information about a particular event for a given user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The user's primary SMTP address, user principal name (UPN), or user ID to identify the calendar owner whose event you want to retrieve. |
| `event_id` | string | Yes | The unique identifier of the calendar event to retrieve from the user's calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user calendar group calendar permission

**Slug:** `OUTLOOK_GET_USER_CALENDAR_GROUP_CALENDAR_PERMISSION`

Tool to retrieve a specific calendar permission for a user's calendar within a calendar group. Use when you need to check access permissions for a specific calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. Cannot use 'me' shortcut - must be actual user ID or userPrincipalName. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `permission_id` | string | Yes | The unique identifier of the calendar permission to retrieve. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user calendar group event

**Slug:** `OUTLOOK_GET_USER_CALENDAR_GROUP_EVENT`

Tool to retrieve a specific event from a user's calendar within a calendar group. Use when you need details of an event in a specific calendar group.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user ID or 'me' for the authenticated user. |
| `event_id` | string | Yes | The unique identifier of the event to retrieve. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user calendar group event attachment

**Slug:** `OUTLOOK_GET_USER_CALENDAR_GROUP_EVENT_ATTACHMENT`

Tool to retrieve a specific attachment from an event within a calendar group for a user. Use when you need to access attachment content from a calendar event in a user's calendar group.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The unique identifier of the user. Can use 'me' as shortcut for authenticated user. |
| `event_id` | string | Yes | The unique identifier of the event. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `attachment_id` | string | Yes | The unique identifier of the attachment to retrieve. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get message from child folder

**Slug:** `OUTLOOK_GET_USER_CHILD_FOLDER_MESSAGE`

Tool to retrieve a specific message from a child folder within a user's mail folder hierarchy. Use when you need to access messages from nested folders where both parent and child folder IDs are known.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | array | No | List of message properties to include in the response. OData $select parameter. Valid properties include: id, subject, from, toRecipients, receivedDateTime, sentDateTime, hasAttachments, importance, isRead, body, bodyPreview, categories, conversationId, internetMessageHeaders. Leave empty to return all fields. |
| `user_id` | string | Yes | The unique identifier of the user. Must be an actual user ID (e.g., '6640adbb5cb743b0') or user principal name (UPN). Cannot use 'me' alias for this endpoint. |
| `message_id` | string | Yes | The unique identifier of the message to retrieve from the child folder. Must be a valid message ID obtained from list or search operations. |
| `mail_folder_id` | string | Yes | The unique identifier of the parent mail folder. Must be a base64-encoded folder ID (e.g., 'AAMkAGI0ZjExAAA=') obtained from OUTLOOK_LIST_MAIL_FOLDERS or similar endpoints. |
| `child_folder_id` | string | Yes | The unique identifier of the child folder within the parent mail folder. Must be a base64-encoded folder ID obtained from OUTLOOK_LIST_CHILD_MAIL_FOLDERS or similar endpoints. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get event extension

**Slug:** `OUTLOOK_GET_USER_EVENT_EXTENSION`

Tool to retrieve a specific open type extension from a user's calendar event by its extension ID or name. Use when you need to access custom data stored in calendar event extensions.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's primary SMTP address, user principal name (UPN), or the alias 'me' (for the signed-in user) to identify the calendar owner. |
| `event_id` | string | Yes | The unique identifier of the calendar event. |
| `extension_id` | string | Yes | The extension name or fully qualified name. Can be either the simple name (e.g., 'Com.Contoso.Referral') or fully qualified name (e.g., 'Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.Referral'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get user message attachment

**Slug:** `OUTLOOK_GET_USER_MESSAGES_ATTACHMENTS`

Tool to retrieve a specific attachment from a message in a mail folder hierarchy. Use when you need to get attachment details including content from a specific folder path.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The user's email address, userPrincipalName, or user ID. Use 'me' for the authenticated user. |
| `message_id` | string | Yes | The unique identifier of the email message. Obtain from OUTLOOK_LIST_MESSAGES, OUTLOOK_QUERY_EMAILS, or OUTLOOK_SEARCH_MESSAGES. |
| `attachment_id` | string | Yes | The unique identifier of the attachment. Obtain from LIST_OUTLOOK_ATTACHMENTS action (use the 'id' field, NOT the 'name' field). |
| `mail_folder_id` | string | Yes | The ID of the parent mail folder. Can be a well-known folder name ('inbox', 'drafts', 'sentitems', 'deleteditems', etc.) or a folder ID (base64-encoded string obtained from OUTLOOK_LIST_MAIL_FOLDERS). |
| `child_folder_id` | string | No | The ID of the child folder within the parent mail folder. If provided, targets the message inside mailFolders/{id}/childFolders/{id}. If omitted, targets the message directly inside mailFolders/{id}. Must be a base64-encoded folder ID obtained from OUTLOOK_LIST_CHILD_MAIL_FOLDERS. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Calendar Calendar View (Deprecated)

**Slug:** `OUTLOOK_LIST_CALENDAR_CALENDAR_VIEW`

DEPRECATED: Use OUTLOOK_LIST_ME_CALENDARS_CALENDAR_VIEW instead. Tool to list calendar events within a specified date/time range. Use when you need to retrieve events from the user's primary calendar that fall within a time window.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of events to return per page (OData $top). Controls page size for pagination. |
| `skip` | integer | No | Number of events to skip from the beginning of the result set (OData $skip). Use with $top for pagination. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `endDateTime` | string | Yes | The end date and time of the time range, represented in ISO 8601 format. For example, '2019-11-08T20:00:00-08:00' or '2024-12-31T23:59:59Z'. |
| `startDateTime` | string | Yes | The start date and time of the time range, represented in ISO 8601 format. For example, '2019-11-08T19:00:00-08:00' or '2024-01-01T00:00:00Z'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List user calendar event attachments

**Slug:** `OUTLOOK_LIST_CALENDAR_EVENT_ATTACHMENTS`

Tool to list attachments for a calendar event within a specific calendar for a user. Use when you need to retrieve attachments from an event in a user's specific calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of attachments to return (OData $top). |
| `skip` | integer | No | Number of attachments to skip (OData $skip). |
| `filter` | string | No | OData filter string to filter the attachments (OData $filter). |
| `select` | array | No | List of attachment properties to include (OData $select). |
| `orderby` | array | No | Order by clauses to sort the results (OData $orderby). |
| `user_id` | string | Yes | The unique identifier of the user. Must be a valid user ID (GUID) or userPrincipalName (UPN/email). Note: 'me' is NOT supported for this endpoint. |
| `event_id` | string | Yes | The unique identifier of the event. |
| `calendar_id` | string | Yes | The unique identifier of the calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List user calendar group calendar events

**Slug:** `OUTLOOK_LIST_CALENDAR_GROUP_CALENDAR_EVENTS`

Tool to list events from a specific calendar within a calendar group for a user. Use when you need to retrieve events from a user's calendar that belongs to a specific calendar group.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of events to retrieve per page for pagination. |
| `skip` | integer | No | Number of initial events to bypass, used for pagination. |
| `filter` | string | No | OData query string to filter calendar events. ONLY the following properties support filtering: 'start/dateTime', 'end/dateTime', 'subject', 'categories', 'importance', 'sensitivity', 'isAllDay', 'isCancelled', 'isReminderOn', 'type'. CRITICAL: Properties like 'body', 'bodyPreview', 'location', 'locations', 'organizer', 'attendees' do NOT support $filter and will cause errors. IMPORTANT: Use calendar event properties ONLY. Do NOT use mail/message properties like 'receivedDateTime'. For start/end filtering, you MUST use 'start/dateTime' and 'end/dateTime' ONLY. DO NOT use 'start/date' or 'end/date' - these properties do NOT exist and will cause errors. DateTime format: "start/dateTime ge 'YYYY-MM-DDTHH:MM:SSZ'" (requires single quotes and timezone suffix). Operators: ge (>=), le (<=), eq (=), gt (>), lt (<). DateTime values without quotes or timezone suffix will be automatically normalized. |
| `select` | array | No | List of specific event property names to return. MUST be provided as a list. If omitted, a default set of properties is returned. Valid field names: id, subject, body, bodyPreview, start, end, isAllDay, organizer, attendees, location, locations, recurrence, importance, sensitivity, showAs, categories, hasAttachments, webLink, onlineMeeting, onlineMeetingProvider, onlineMeetingUrl, isOnlineMeeting, createdDateTime, lastModifiedDateTime, changeKey, iCalUId, type, seriesMasterId, isOrganizer, isReminderOn, reminderMinutesBeforeStart, responseRequested, responseStatus, allowNewTimeProposals, hideAttendees, isCancelled, isDraft, originalStart, originalStartTimeZone, originalEndTimeZone, transactionId, cancelledOccurrences. Note: 'creator' is NOT a valid field - use 'organizer' instead. Invalid field names will be automatically filtered out. |
| `orderby` | array | No | List of properties to sort results by. Each item is a string like 'start/dateTime desc' or 'subject asc'. MUST be provided as a list, even for single sort criteria. Use 'asc' (default) or 'desc' for order. IMPORTANT: Use calendar event properties ONLY. Do NOT use mail/message properties like 'receivedDateTime'. Valid sortable datetime fields: 'start/dateTime', 'end/dateTime', 'createdDateTime', 'lastModifiedDateTime'. |
| `user_id` | string | Yes | The user's primary SMTP address, user principal name (UPN), or user ID to identify the calendar owner. |
| `timezone` | string | No | Preferred timezone for event start/end times. Accepts IANA format (e.g., 'America/New_York', 'Europe/London', 'Asia/Tokyo') or Windows format (e.g., 'Eastern Standard Time', 'Pacific Standard Time'). Falls back to 'UTC' if the timezone cannot be resolved. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group containing the calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List calendars in calendar group

**Slug:** `OUTLOOK_LIST_CALENDAR_GROUP_CALENDARS`

Tool to retrieve calendars belonging to a specific calendar group. Use when you need to list calendars within a calendar group with optional OData queries.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of calendars to return (OData $top). |
| `skip` | integer | No | Number of calendars to skip (OData $skip). |
| `filter` | string | No | OData filter expression (OData $filter). |
| `select` | array | No | Properties to include (OData $select). |
| `orderby` | array | No | Order by expressions (OData $orderby). |
| `user_id` | string | No | User ID or userPrincipalName. Use 'me' for the signed-in user. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `calendar_group_id` | string | Yes | The ID of the calendar group to retrieve calendars from. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List user calendar group event attachments

**Slug:** `OUTLOOK_LIST_CALENDAR_GROUP_EVENT_ATTACHMENTS`

Tool to list attachments for a calendar event within a specific calendar group for a user. Use when you need to retrieve attachments from an event in a calendar that belongs to a calendar group for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of attachments to return (OData $top). |
| `skip` | integer | No | Number of attachments to skip (OData $skip). |
| `filter` | string | No | OData filter string to filter the attachments (OData $filter). |
| `select` | array | No | List of attachment properties to include (OData $select). |
| `orderby` | array | No | Order by clauses to sort the results (OData $orderby). |
| `user_id` | string | No | The unique identifier of the user. Can use 'me' as shortcut for authenticated user. |
| `event_id` | string | Yes | The unique identifier of the event. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Outlook calendar groups

**Slug:** `OUTLOOK_LIST_CALENDAR_GROUPS`

Tool to list calendar groups in the signed-in user's mailbox. Use when you need to retrieve calendar groups with optional OData queries.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of calendar groups to return (OData $top). |
| `skip` | integer | No | Number of calendar groups to skip (OData $skip). |
| `filter` | string | No | OData filter expression (OData $filter). |
| `select` | array | No | Properties to include (OData $select). |
| `orderby` | array | No | Order by expressions (OData $orderby). |
| `user_id` | string | No | User ID or userPrincipalName. Use 'me' for the signed-in user. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List calendar permissions

**Slug:** `OUTLOOK_LIST_CALENDAR_PERMISSIONS`

Tool to list calendar permissions for a specific calendar within a calendar group. Use when you need to view sharing permissions for a calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of permissions to return per page (OData $top). |
| `skip` | integer | No | Number of items to skip for pagination (OData $skip). |
| `user_id` | string | No | The unique identifier of the user. Can use 'me' for the authenticated user. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Outlook calendars

**Slug:** `OUTLOOK_LIST_CALENDARS`

Tool to list calendars in the signed-in user's mailbox. Use when you need to retrieve calendars with optional OData queries.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of calendars to return (OData $top). |
| `skip` | integer | No | Number of calendars to skip (OData $skip). |
| `filter` | string | No | OData filter expression (OData $filter). |
| `select` | array | No | Properties to include (OData $select). |
| `orderby` | array | No | Order by expressions (OData $orderby). |
| `user_id` | string | No | User ID or userPrincipalName. Use 'me' for the signed-in user. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List calendar view delta

**Slug:** `OUTLOOK_LIST_CALENDAR_VIEW_DELTA`

Tool to get calendar events that have been added, deleted, or updated in a calendar view. Use when you need to track changes to events within a specific time range.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user ID (GUID format like '43f0c14d-bca8-421f-b762-c3d8dd75be1f') or user principal name (email format like 'user@domain.com') of the mailbox to access. Required for app-only (S2S) authentication with application permissions. If not provided, uses '/me' endpoint which requires delegated permissions. |
| `skiptoken` | string | No | A state token returned in the @odata.nextLink URL of the previous delta function call. Accepts either the full @odata.nextLink URL or just the bare token value. Use this to page through large result sets during initial sync or updates. Keep paginating until you receive '@odata.deltaLink' instead of nextLink. |
| `deltatoken` | string | No | A state token returned in the @odata.deltaLink URL of the previous delta function call. Accepts either the full @odata.deltaLink URL or just the bare token value. Use this to get only changes since the last sync. On first call, omit this parameter to get all events in the time range. Store the @odata.deltaLink from the response for subsequent calls. |
| `end_datetime` | string | Yes | The end date and time of the time range, represented in ISO 8601 format. For example, '2015-11-08T20:00:00.0000000' or '2015-11-08T20:00:00Z'. This parameter is required for the first delta query to establish the time window. |
| `start_datetime` | string | Yes | The start date and time of the time range, represented in ISO 8601 format. For example, '2015-11-08T19:00:00.0000000' or '2015-11-08T19:00:00Z'. This parameter is required for the first delta query to establish the time window. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List chat messages

**Slug:** `OUTLOOK_LIST_CHAT_MESSAGES`

Tool to list messages in a Teams chat. Use when you need message IDs to select a specific message for further actions.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Number of messages per page (max 50). |
| `filter` | string | No | OData filter expression for date/time filtering; honored when matching orderby property. |
| `chat_id` | string | Yes | ID of the chat to retrieve messages from. |
| `orderby` | string | No | Order by property; supports 'lastModifiedDateTime desc' or 'createdDateTime desc'. |
| `skiptoken` | string | No | Pagination token from the @odata.nextLink of a previous response. Pass the $skiptoken value (not the full URL) to retrieve the next page of results. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Teams chats

**Slug:** `OUTLOOK_LIST_CHATS`

Tool to list Teams chats. Use when you need chat IDs and topics to select a chat for further actions.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Number of chat items per page (max 50). |
| `expand` | string | No | Related entities to expand: 'members' or 'lastMessagePreview'. |
| `filter` | string | No | OData filter expression to filter chats, such as by topic. |
| `orderby` | string | No | Properties to order by; only 'lastMessagePreview/createdDateTime desc' is supported (ascending order not supported). |
| `user_id` | string | No | User ID (GUID or email) to list chats for. Required for S2S (app-only) authentication. If not provided, uses '/me' endpoint (requires delegated authentication). |
| `skiptoken` | string | No | Pagination token from the @odata.nextLink of a previous response. Pass the $skiptoken value (not the full URL) to retrieve the next page of results. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List user child folder contacts

**Slug:** `OUTLOOK_LIST_CHILD_FOLDER_CONTACTS`

Tool to retrieve contacts from a user's child contact folder. Use when you need to access contacts organized in nested folder structures for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of contacts to retrieve per page (1-999). |
| `skip` | integer | No | Number of contacts to skip from the beginning of the result set, for pagination. Use with 'top' to iterate through large contact lists. |
| `filter` | string | No | OData V4 filter expression for targeted retrieval. |
| `select` | array | No | List of specific contact properties to retrieve. Valid Contact properties: displayName, givenName, surname, middleName, nickName, title, generation, emailAddresses, imAddresses, jobTitle, companyName, department, officeLocation, profession, businessHomePage, assistantName, manager, homePhones, mobilePhone, businessPhones, spouseName, personalNotes, children, homeAddress, businessAddress, otherAddress, categories, birthday, fileAs, initials, yomiGivenName, yomiSurname, yomiCompanyName, parentFolderId, changeKey, createdDateTime, lastModifiedDateTime. |
| `orderby` | array | No | List of properties to sort results by. Each item is a string like 'displayName asc' or 'createdDateTime desc'. MUST be provided as a list, even for single sort criteria. 'asc' is default. |
| `user_id` | string | Yes | The unique identifier of the user (email address or user ID). Use email format (e.g., 'user@example.com') or Azure AD user ID. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `child_folder_id` | string | Yes | The ID of the child folder to retrieve contacts from. Required. |
| `contact_folder_id` | string | Yes | The ID of the parent contact folder containing the child folder. Required. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List child folder messages

**Slug:** `OUTLOOK_LIST_CHILD_FOLDER_MESSAGES`

Tool to list messages from a child folder within a parent mail folder. Use when you need to retrieve messages from a subfolder that exists within another folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of messages to return per request (1-1000). To page through more, use the `next_page_token` from the response (pass it back as `page_token`). |
| `skip` | integer | No | Number of messages to skip from the beginning of the result set, for pagination. |
| `filter` | string | No | OData $filter query to filter messages. Examples: 'isRead eq false', 'from/emailAddress/address eq 'sender@example.com'', 'receivedDateTime ge 2023-01-01T00:00:00Z', 'hasAttachments eq true'. Note: Combining complex filters (especially on nested properties like 'from/emailAddress/address') with the 'orderby' parameter may fail with an InefficientFilter error. In such cases, remove 'orderby' or apply sorting client-side. |
| `select` | array | No | List of message properties to include in the response. OData $select parameter. Valid properties include: id, subject, from, toRecipients, receivedDateTime, sentDateTime, hasAttachments, importance, isRead, body, bodyPreview, categories, conversationId. |
| `orderby` | string | No | Property to sort results by with direction. OData $orderby parameter. Example: 'receivedDateTime desc' or 'subject asc'. Note: Using 'orderby' together with complex 'filter' queries (especially on nested properties like 'from/emailAddress/address') may fail with an InefficientFilter error. If this occurs, either remove 'orderby' or apply sorting client-side. |
| `user_id` | string | No | User's id, userPrincipalName, or 'me' for the signed-in user. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the parent mail folder. ONLY these specific well-known names are valid as string names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. Arbitrary folder names (e.g., 'workjournal') are NOT valid. If the folder is not one of these well-known names, you MUST use the actual folder ID - a base64-encoded string (e.g., 'AAMkAGI0ZjExAAA=') obtained from OUTLOOK_LIST_MAIL_FOLDERS. |
| `child_folder_id` | string | Yes | The ID of the child folder within the parent mail folder from which to retrieve messages. This must be a base64-encoded folder ID (e.g., 'AAMkAGI0ZjExAAA=') obtained from OUTLOOK_LIST_CHILD_MAIL_FOLDERS. Well-known names are NOT valid for child folders. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List child mail folders

**Slug:** `OUTLOOK_LIST_CHILD_MAIL_FOLDERS`

Tool to list subfolders (childFolders) under a specified Outlook mail folder. Use when navigating nested folder hierarchies or checking if a folder has subfolders.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of child folders to return. OData $top parameter. |
| `skip` | integer | No | Number of child folders to skip from the beginning of the result set (OData $skip). Use with $top for pagination. |
| `filter` | string | No | OData $filter query to filter the child folders. Example: 'isHidden eq false'. |
| `select` | array | No | List of mailFolder properties to include in the response. OData $select parameter. Valid properties include: id, displayName, parentFolderId, childFolderCount, unreadItemCount, totalItemCount, isHidden. |
| `user_id` | string | No | User's id, userPrincipalName, or 'me' for the signed-in user. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `parent_folder_id` | string | Yes | The ID or well-known name of the parent mail folder. Common well-known names include: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. For folder IDs, obtain them from OUTLOOK_LIST_MAIL_FOLDERS or previous childFolders responses. Folder IDs are base64-encoded strings (e.g., 'AAMkAGI0ZjExAAA=') that are mailbox-specific and must come from the same user's mailbox. No URL encoding needed - it's handled automatically. |
| `include_hidden_folders` | boolean | No | Include hidden mail folders (isHidden=true) when set to true. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List contact folder child folders

**Slug:** `OUTLOOK_LIST_CONTACT_FOLDER_CHILD_FOLDERS`

Tool to list child folders under a specified contact folder. Use when navigating nested contact folder hierarchies or organizing contacts into subfolder structures.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of child folders to return. OData $top parameter. |
| `skip` | integer | No | Number of child folders to skip for pagination. OData $skip parameter. |
| `expand` | array | No | Related entities to expand inline. OData $expand parameter. Example: ['contacts']. |
| `filter` | string | No | OData $filter query to filter the child folders. Example: startswith(displayName,'A'). |
| `select` | array | No | List of contactFolder properties to include in the response. OData $select parameter. Valid properties include: id, displayName, parentFolderId. |
| `orderby` | array | No | List of properties to order results by. OData $orderby parameter. Example: ['displayName asc']. |
| `user_id` | string | No | User's id, userPrincipalName, or 'me' for the signed-in user. |
| `folder_id` | string | Yes | The ID of the parent contact folder. Obtain folder IDs from OUTLOOK_GET_CONTACT_FOLDERS or previous childFolders responses. Folder IDs are base64-encoded strings that are mailbox-specific and must come from the same user's mailbox. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List contact folders delta

**Slug:** `OUTLOOK_LIST_CONTACT_FOLDERS_DELTA`

Tool to get contact folders that have been added, deleted, or updated. Use when tracking changes to contact folder structure without fetching all folders each time.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | string | No | Comma-separated list of properties to include in the response. The id property is always returned. Available properties: id, displayName, parentFolderId. |
| `user_id` | string | No | The ID (user principal name or GUID) of the user. Required for app-only (S2S) authentication. If not provided, uses '/me' endpoint (requires delegated authentication). Accepts both email format (user@domain.com) and GUID format. |
| `skiptoken` | string | No | A state token returned in the @odata.nextLink URL of the previous delta function call. Accepts either the full @odata.nextLink URL or just the bare token value. Use this to page through large result sets during initial sync or updates. Keep paginating until you receive '@odata.deltaLink' instead of nextLink. |
| `deltatoken` | string | No | A state token returned in the @odata.deltaLink URL of the previous delta function call. Accepts either the full @odata.deltaLink URL or just the bare token value. Use this to get only changes since the last sync. On first call, omit this parameter to get all contact folders. Store the @odata.deltaLink from the response for subsequent calls. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Outlook contacts (Deprecated)

**Slug:** `OUTLOOK_LIST_CONTACTS`

DEPRECATED: Use OUTLOOK_LIST_USER_CONTACTS instead. Retrieves a user's Microsoft Outlook contacts, from the default or a specified contact folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of contacts to retrieve per page (1-999). |
| `skip` | integer | No | Number of contacts to skip from the beginning of the result set, for pagination. Use with 'top' to iterate through large contact lists. |
| `filter` | string | No | OData V4 filter expression for targeted retrieval. |
| `select` | array | No | List of specific contact properties to retrieve. Valid Contact properties: displayName, givenName, surname, middleName, nickName, title, generation, emailAddresses (not 'mail' - that's for User type), imAddresses, jobTitle, companyName, department, officeLocation, profession, businessHomePage, assistantName, manager, homePhones, mobilePhone, businessPhones, spouseName, personalNotes, children, homeAddress, businessAddress, otherAddress, categories, birthday, fileAs, initials, yomiGivenName, yomiSurname, yomiCompanyName, parentFolderId, changeKey, createdDateTime, lastModifiedDateTime. |
| `orderby` | array | No | List of properties to sort results by. Each item is a string like 'displayName asc' or 'createdDateTime desc'. MUST be provided as a list, even for single sort criteria. 'asc' is default. |
| `user_id` | string | No | User Principal Name (UPN) or ID of the user. 'me' refers to the authenticated user. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `contact_folder_id` | string | No | ID of a specific contact folder. If omitted, contacts are retrieved from the default contact folder. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List contacts delta

**Slug:** `OUTLOOK_LIST_CONTACTS_DELTA`

Retrieve incremental changes (delta) of contacts in a specified folder. Use when syncing contacts without fetching the entire set each time. FIRST RUN: Returns ALL contacts in folder. Response has @odata.deltaLink. SUBSEQUENT: Pass stored deltaLink to get only NEW/UPDATED/DELETED contacts since last sync.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | array | No | List of contact properties to include (e.g. ['displayName','emailAddresses']). Available properties: id, displayName, givenName, surname, middleName, nickName, title, generation, emailAddresses, imAddresses, jobTitle, companyName, department, officeLocation, profession, businessHomePage, assistantName, manager, homePhones, mobilePhone, businessPhones, spouseName, personalNotes, children, homeAddress, businessAddress, otherAddress, categories, birthday, fileAs, initials, yomiGivenName, yomiSurname, yomiCompanyName, parentFolderId, changeKey, createdDateTime, lastModifiedDateTime. |
| `user_id` | string | No | User ID (GUID) or user principal name (email) for app-only (S2S) authentication. Required when using client credentials flow. If not provided, uses '/me' endpoint (delegated auth). Example: '43f0c14d-bca8-421f-b762-c3d8dd75be1f' or 'user@example.com' |
| `skip_token` | string | No | Skip token for paging through large result sets during initial sync. Accepts either the full @odata.nextLink URL or just the bare token value. Keep paginating until you receive '@odata.deltaLink' instead of nextLink. Mutually exclusive with delta_token - only one should be provided per request. |
| `delta_token` | string | No | Delta token from a previous call to get only changes since that state. Accepts either the full @odata.deltaLink URL or just the bare token value. If omitted or invalid (placeholders like <token> are ignored), performs initial sync. Response includes @odata.deltaLink - store this for subsequent calls. Mutually exclusive with skip_token - only one should be provided per request. |
| `contact_folder_id` | string | Yes | Contact folder identifier (folder GUID). Use GET_CONTACT_FOLDERS action to retrieve available folder IDs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Email Rules

**Slug:** `OUTLOOK_LIST_EMAIL_RULES`

List all email rules from inbox. No server-side filtering is supported; all rule narrowing must be done client-side after retrieval. Each rule includes a `sequence` field defining execution order and may include a `stopProcessingRules` flag affecting downstream rule execution.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Number of rules to retrieve. Default is 100. Setting this too low may return an incomplete rule set; use 100 or higher to ensure all rules are retrieved. |
| `skip` | integer | No | Number of rules to skip before returning results. Use with 'top' for offset-based pagination. |
| `user_id` | string | No | The user ID or principal name (email) to list email rules for. Required for S2S (app-only) authentication. If not provided, uses the authenticated user context (/me). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List event attachments

**Slug:** `OUTLOOK_LIST_EVENT_ATTACHMENTS`

Tool to list attachments for a specific Outlook calendar event. Use when you have an event ID and need to view its attachments.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of attachments to return (OData $top). |
| `skip` | integer | No | Number of attachments to skip (OData $skip). |
| `filter` | string | No | OData filter string to filter the attachments (OData $filter). |
| `select` | array | No | List of attachment properties to include (OData $select). |
| `orderby` | array | No | Order by clauses to sort the results (OData $orderby). |
| `user_id` | string | No | The user's primary SMTP address, UPN, or 'me' for the signed-in user. |
| `event_id` | string | Yes | The unique identifier of the calendar event to retrieve attachments for. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List event calendar permissions

**Slug:** `OUTLOOK_LIST_EVENT_CALENDAR_CALENDAR_PERMISSIONS`

Tool to list calendar permissions for the calendar containing a specific event. Use when you need to see who has access to a calendar that contains a particular event.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of permissions to return (OData $top parameter). |
| `skip` | integer | No | Number of permissions to skip (OData $skip parameter). |
| `filter` | string | No | OData filter expression to filter permissions (OData $filter parameter). |
| `select` | array | No | Properties to include in the response (OData $select parameter). |
| `orderby` | array | No | Order by expressions (OData $orderby parameter). |
| `user_id` | string | No | The user's primary SMTP address, user principal name (UPN), or the alias 'me' (for the signed-in user) to identify the calendar owner. |
| `event_id` | string | Yes | The unique identifier of the calendar event. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List event instances

**Slug:** `OUTLOOK_LIST_EVENT_INSTANCES`

Tool to retrieve individual occurrences of a recurring calendar event within a specified time range. Use when you need to get specific instances of a recurring meeting or event series.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of event instances to return per page (OData $top). Controls page size for pagination. |
| `skip` | integer | No | Skip the first n items |
| `count` | boolean | No | Include count of items |
| `expand` | array | No | Expand related entities |
| `filter` | string | No | Filter items by property values |
| `search` | string | No | Search items by search phrases |
| `select` | array | No | Select properties to be returned |
| `orderby` | array | No | Order items by property values |
| `user_id` | string | No | Email address of the target user (or 'me' for authenticated user), identifying the calendar owner. |
| `event_id` | string | Yes | The unique identifier of the recurring event (seriesMaster) for which to retrieve instances. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `endDateTime` | string | Yes | The end date and time of the time range in ISO 8601 format (e.g., 2026-04-30T23:59:59.0000000). Only instances that start within or overlap this range will be returned. |
| `startDateTime` | string | Yes | The start date and time of the time range in ISO 8601 format (e.g., 2026-03-01T00:00:00.0000000). Only instances that start within or overlap this range will be returned. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List events

**Slug:** `OUTLOOK_LIST_EVENTS`

Retrieves events from a user's Outlook calendar via Microsoft Graph API. Supports primary/secondary/shared calendars, pagination, filtering, property selection, sorting, and timezone specification. Use calendar_id to access non-primary calendars.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of events to retrieve per page for pagination. |
| `skip` | integer | No | Number of initial events to bypass, used for pagination. |
| `filter` | string | No | OData query string to filter calendar events. Filterable properties: 'start/dateTime', 'end/dateTime', 'subject', 'categories', 'importance', 'sensitivity', 'isAllDay', 'isCancelled', 'isReminderOn', 'type'. CRITICAL: Properties like 'body', 'bodyPreview', 'location', 'organizer', 'attendees' do NOT support $filter. Do NOT use mail properties like 'receivedDateTime' (emails only). For start/end filtering, use 'start/dateTime' and 'end/dateTime' ONLY - do NOT use 'start/date' or 'end/date' (these do not exist). Works for both all-day and timed events. Note: 'createdDateTime' and 'lastModifiedDateTime' only support $orderby/$select, NOT filtering. DateTime format: "start/dateTime ge 'YYYY-MM-DDTHH:MM:SSZ'" (requires single quotes and timezone suffix). Operators: ge (>=), le (<=), eq (=), gt (>), lt (<). |
| `select` | array | No | List of specific event property names to return. MUST be provided as a list. If omitted, a default set of properties is returned. Valid field names: id, subject, body, bodyPreview, start, end, isAllDay, organizer, attendees, location, locations, recurrence, importance, sensitivity, showAs, categories, hasAttachments, webLink, onlineMeeting, onlineMeetingProvider, onlineMeetingUrl, isOnlineMeeting, createdDateTime, lastModifiedDateTime, changeKey, iCalUId, type, seriesMasterId, isOrganizer, isReminderOn, reminderMinutesBeforeStart, responseRequested, responseStatus, allowNewTimeProposals, hideAttendees, isCancelled, isDraft, originalStart, originalStartTimeZone, originalEndTimeZone, transactionId, cancelledOccurrences. Note: 'creator' is NOT a valid field - use 'organizer' instead to get the event creator/organizer. Invalid field names will be automatically filtered out. |
| `orderby` | array | No | List of properties to sort results by. Each item is a string like 'start/dateTime desc' or 'subject asc'. MUST be provided as a list, even for single sort criteria. Use 'asc' (default) or 'desc' for order. IMPORTANT: Use calendar event properties ONLY. Do NOT use mail/message properties like 'receivedDateTime' (which is for emails only). Valid sortable datetime fields: 'start/dateTime', 'end/dateTime', 'createdDateTime', 'lastModifiedDateTime'. Invalid mail properties will be auto-corrected to 'start/dateTime'. |
| `user_id` | string | No | Email address of the target user (or 'me' for authenticated user), identifying the calendar for event listing. |
| `timezone` | string | No | Preferred timezone for event start/end times. Accepts IANA format (e.g., 'America/New_York', 'Europe/London', 'Indian/Mauritius', 'Asia/Tokyo') or Windows format (e.g., 'Eastern Standard Time', 'Pacific Standard Time'). Placeholder patterns like '<REGION>/London' are auto-resolved to valid IANA timezones (e.g., 'Europe/London') where the city can be matched. Falls back to 'UTC' only if the timezone cannot be resolved. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. Not available together with expand_recurring_events. |
| `calendar_id` | string | No | Optional ID of a specific calendar to retrieve events from. If not provided, uses the default calendar. Get calendar IDs using LIST_CALENDARS action. IMPORTANT: Do NOT use 'primary' or 'default' as values - these are not valid calendar IDs in Microsoft Graph. Leave this field empty/null to access the default calendar. Useful for accessing secondary calendars, shared calendars, or team calendars. |
| `expand_recurring_events` | boolean | No | When true, automatically expands recurring events to show actual occurrences within the filtered date range instead of series masters. When false (default), returns series masters as before. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Inference Classification Overrides

**Slug:** `OUTLOOK_LIST_INFERENCE_CLASSIFICATION_OVERRIDES`

Tool to list inference classification overrides that control Focused Inbox sender rules. Use when you need to see which senders are configured to always appear in Focused or Other inbox.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of overrides to return per page (OData $top). |
| `skip` | integer | No | Number of items to skip for pagination (OData $skip). |
| `user_id` | string | No | The user's unique identifier or 'me' for the authenticated user. Use 'me' to get overrides for your own mailbox, or specify a user ID/email for delegated access. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List mail folder message attachments

**Slug:** `OUTLOOK_LIST_MAIL_FOLDER_MESSAGE_ATTACHMENTS`

Tool to get attachments from a message in a specific mail folder. Use when you need to retrieve attachment metadata from a message located in a particular folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of attachments to return per page (OData $top). |
| `skip` | integer | No | Number of items to skip for pagination (OData $skip). |
| `user_id` | string | No | The user ID or principal name (email) of the user mailbox to access. Required for app-only (S2S) authentication. Use 'me' or omit for delegated authentication. Example: '43f0c14d-bca8-421f-b762-c3d8dd75be1f' or 'user@domain.com' |
| `message_id` | string | Yes | The unique identifier of the email message from which to retrieve attachments. Must be a message ID obtained from OUTLOOK_LIST_MESSAGES or OUTLOOK_SEARCH_EMAILS. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the mail folder containing the message. ONLY these specific well-known names are valid as string names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. Arbitrary folder names (e.g., 'workjournal') are NOT valid. If the folder is not one of these well-known names, you MUST use the actual folder ID - a base64-encoded string (e.g., 'AAMkAGI0ZjExAAA=') obtained from OUTLOOK_LIST_MAIL_FOLDERS or OUTLOOK_LIST_CHILD_MAIL_FOLDERS. |
| `response_detail` | string ("minimal" | "full") | No | Level of detail in the response. 'minimal' (default) returns only attachment metadata (id, name, size, contentType, etc.) for efficient listing. 'full' includes the base64-encoded file content (contentBytes) for downloading. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List mail folder message rules

**Slug:** `OUTLOOK_LIST_MAIL_FOLDER_MESSAGE_RULES`

Tool to list message rules for a specific mail folder. Use when you need to retrieve rules configured for a particular folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of message rules to return. Default is all rules if not specified. |
| `skip` | integer | No | Number of rules to skip before returning results. Use with 'top' for offset-based pagination. |
| `user_id` | string | No | User's id, userPrincipalName, or 'me' for the signed-in user. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the mail folder from which to retrieve message rules. ONLY these specific well-known names are valid as string names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. Arbitrary folder names are NOT valid. If the folder is not one of these well-known names, you MUST use the actual folder ID - a base64-encoded string obtained from OUTLOOK_LIST_MAIL_FOLDERS or OUTLOOK_LIST_CHILD_MAIL_FOLDERS. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List mail folder messages

**Slug:** `OUTLOOK_LIST_MAIL_FOLDER_MESSAGES`

Tool to list messages from a specific mail folder including subfolders. Use when you need to retrieve messages from a particular folder or subfolder by its ID or well-known name.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of messages to return per request (1-1000). To page through more, use the `next_page_token` from the response (pass it back as `page_token`). |
| `skip` | integer | No | Number of messages to skip from the beginning of the result set, for pagination. |
| `filter` | string | No | OData $filter query to filter messages. CRITICAL: String literals MUST use single quotes ('), not double quotes ("). Examples: 'isRead eq false', 'from/emailAddress/address eq 'sender@example.com'', 'receivedDateTime ge 2023-01-01T00:00:00Z', 'hasAttachments eq true'. IMPORTANT: Complex filters (multiple 'contains()' operations, OR clauses, or nested properties like 'from/emailAddress/address') CANNOT be combined with 'orderby' - Microsoft Graph will reject such requests with InefficientFilter error. When using complex filters, you MUST either: (1) omit 'orderby' and sort results client-side, or (2) simplify the filter to basic equality/comparison operations. |
| `select` | array | No | List of message properties to include in the response. OData $select parameter. Valid properties include: id, subject, from, toRecipients, receivedDateTime, sentDateTime, hasAttachments, importance, isRead, body, bodyPreview, categories, conversationId. |
| `orderby` | string | No | Property to sort results by with direction. OData $orderby parameter. Example: 'receivedDateTime desc' or 'subject asc'. IMPORTANT: Cannot be used with complex 'filter' queries (multiple 'contains()' operations, OR clauses, or nested properties like 'from/emailAddress/address') - Microsoft Graph will reject such combinations with InefficientFilter error. For complex filters, omit this parameter and sort results client-side. |
| `user_id` | string | No | User's id, userPrincipalName, or 'me' for the signed-in user. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the mail folder from which to retrieve messages. ONLY these specific well-known names are valid as string names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. Arbitrary folder names (e.g., 'workjournal') are NOT valid. If the folder is not one of these well-known names, you MUST use the actual folder ID - a base64-encoded string (e.g., 'AAMkAGI0ZjExAAA=') obtained from OUTLOOK_LIST_MAIL_FOLDERS or OUTLOOK_LIST_CHILD_MAIL_FOLDERS. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List mail folders

**Slug:** `OUTLOOK_LIST_MAIL_FOLDERS`

Tool to list a user's top-level mail folders. Use when you need folders like Inbox, Drafts, Sent Items; set include_hidden_folders=True to include hidden folders.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of items to return per page. |
| `skip` | integer | No | Number of items to skip before returning results. |
| `count` | boolean | No | Include total count of matching items in the response. |
| `filter` | string | No | OData filter expression to filter mail folders. String values must be enclosed in single quotes (e.g., displayName eq 'Inbox'). WARNING: Microsoft Graph API does not officially document which mailFolder properties support filtering. Known unsupported properties: parentFolderId (causes ErrorInvalidProperty error). To filter by parent folder, use the child folders endpoint instead: GET /me/mailFolders/{parentFolderId}/childFolders. Properties like isHidden may work but are not guaranteed. |
| `select` | string | No | Comma-separated list of mailFolder properties to include in the response. Valid properties: id, displayName, parentFolderId, childFolderCount, unreadItemCount, totalItemCount, isHidden. Note: 'user_id' is NOT a valid mailFolder property and will be automatically removed if included. |
| `orderby` | string | No | Property to sort by, optionally followed by 'asc' or 'desc'. |
| `user_id` | string | No | User's id, userPrincipalName, or 'me' for the signed-in user. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `include_hidden_folders` | boolean | No | Include hidden mail folders (isHidden=true) when set to true. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List mail folders delta

**Slug:** `OUTLOOK_LIST_MAIL_FOLDERS_DELTA`

Tool to get incremental changes to mail folders. Use when you need to track additions, deletions, or updates to mail folders without fetching the entire folder list each time.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | string | No | OData query parameter to specify only the properties needed for best performance. Comma-separated list of properties (e.g., 'id,displayName,parentFolderId'). The 'id' property is always returned. |
| `user_id` | string | No | Identifier for the user whose mailbox changes to track. Use 'me' for the authenticated user or provide the user's principal name or ID. |
| `skiptoken` | string | No | A state token returned in the @odata.nextLink URL of the previous delta function call, indicating there are further changes to be tracked in the same round. |
| `deltatoken` | string | No | A state token returned in the @odata.deltaLink URL of the previous delta function call, indicating the completion of that round of change tracking. Include this to get changes since the last complete sync. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List master categories

**Slug:** `OUTLOOK_LIST_MASTER_CATEGORIES`

Deprecated: Use OUTLOOK_GET_MASTER_CATEGORIES instead, which adds pagination (top/skip), filtering, field selection, and sorting.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List user calendar permissions

**Slug:** `OUTLOOK_LIST_ME_CALENDAR_PERMISSIONS`

Tool to list calendar permissions for a specific user's calendar. Use when you need to see who has access to a user's calendar and their permission levels.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of permissions to return (OData $top parameter). |
| `skip` | integer | No | Number of permissions to skip (OData $skip parameter). |
| `user_id` | string | Yes | User ID or userPrincipalName of the user whose calendar permissions to list. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List me event instances (Deprecated)

**Slug:** `OUTLOOK_LIST_ME_EVENT_INSTANCES`

DEPRECATED: Use OUTLOOK_LIST_EVENT_INSTANCES instead. Tool to retrieve individual occurrences of a recurring calendar event within a specified time range. Use when you need to get specific instances of a recurring meeting or event series from the authenticated user's primary calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of event instances to return per page (OData $top). Controls page size for pagination. |
| `skip` | integer | No | Number of event instances to skip from the beginning of the result set (OData $skip). Use with $top for pagination. |
| `event_id` | string | Yes | The unique identifier of the recurring event (seriesMaster) for which to retrieve instances. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `end_date_time` | string | Yes | The end date and time of the time range in ISO 8601 format (e.g., 2026-05-01T00:00:00Z). Only instances that start within or overlap this range will be returned. |
| `start_date_time` | string | Yes | The start date and time of the time range in ISO 8601 format (e.g., 2026-03-01T00:00:00Z). Only instances that start within or overlap this range will be returned. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List message attachments from child folder

**Slug:** `OUTLOOK_LIST_MESSAGE_ATTACHMENTS_FROM_CHILD_FOLDER`

Tool to list attachments from a message in a nested child mail folder. Use when you need to retrieve attachment metadata from a message located in a subfolder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Optional OData $top limit on the number of attachments to return. This endpoint returns the full attachment collection in a single response (no continuation cursor), so this is only an explicit cap. |
| `filter` | string | No | OData $filter query to filter attachments. Examples: 'size gt 1000000', 'isInline eq false', 'contentType eq "application/pdf"'. |
| `select` | string | No | Comma-separated list of attachment properties to include. Valid properties: id, name, contentType, size, isInline, lastModifiedDateTime. Example: 'id,name,size'. |
| `user_id` | string | No | User's id, userPrincipalName, or 'me' for the signed-in user. |
| `message_id` | string | Yes | The unique identifier of the email message from which to retrieve attachments. Must be a message ID obtained from list or search operations, not a folder ID. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the parent mail folder. Valid well-known names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. For custom folders, use the base64-encoded folder ID from OUTLOOK_LIST_MAIL_FOLDERS. |
| `child_folder_id` | string | Yes | The ID of the child folder containing the message. Must be a valid folder ID (base64-encoded string) obtained from OUTLOOK_LIST_CHILD_MAIL_FOLDERS. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Messages

**Slug:** `OUTLOOK_LIST_MESSAGES`

Retrieves a list of email messages from a specified mail folder in an Outlook mailbox, with options for filtering (including by conversationId to get all messages in a thread), pagination, and sorting; ensure 'user_id' and 'folder' are valid, and all date/time strings are in ISO 8601 format.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of messages to return per request (1-1000). To page through more, use the `next_page_token` from the response (pass it back as `page_token`), repeating until it is absent. For large mailboxes (1000+ messages), always paginate. |
| `skip` | integer | No | Number of messages to skip from the beginning of the result set, for pagination. |
| `folder` | string | No | ID or well-known name of the mail folder. Well-known names (case-insensitive): archive, clutter, conflicts, conversationhistory, deleteditems, drafts, inbox, junkemail, localfailures, msgfolderroot, outbox, recoverableitemsdeletions, scheduled, searchfolders, sentitems, serverfailures, syncissues. Use 'allfolders' to search across all mail folders (uses /messages endpoint without folder filter). Or use a valid folder ID (base64-like string, e.g., 'AAMkAGI0ZjExAAA='). Accepts both raw folder IDs and percent-encoded folder IDs (with %XX sequences). |
| `search` | string | No | Full-text search query using Microsoft Graph $search syntax. Searches across subject, body, and sender fields server-side. Cannot be combined with $filter or $orderby. Example: 'budget report' or 'from:john@example.com' |
| `select` | array | No | Message properties to include. Accepts a list of strings or a comma-separated string (e.g., 'id,subject,from'). Valid properties: id, subject, from, toRecipients, ccRecipients, bccRecipients, receivedDateTime, sentDateTime, hasAttachments, importance, isRead, body, bodyPreview, categories, conversationId, conversationIndex, flag, internetMessageHeaders, parentFolderId, replyTo, sender, webLink, isDraft, isReadReceiptRequested, isDeliveryReceiptRequested, changeKey, createdDateTime, lastModifiedDateTime, inferenceClassification, internetMessageId. Note: attachments is not selectable. |
| `is_read` | boolean | No | Filter by read status: 'true' for read, 'false' for unread. Unspecified means no filter by read status. |
| `orderby` | array | No | Properties to sort results by, with direction. Accepts a list of strings or a comma-separated string. Each item should be like 'receivedDateTime desc' or 'subject asc'. Default is 'receivedDateTime desc'. Cannot be used with sentDateTime filters in Sent folder. |
| `subject` | string | No | Filter by exact match of the subject line. Special characters like apostrophes, brackets will be automatically escaped. For complex subject searches, consider using 'Search Messages' instead. |
| `user_id` | string | No | Target user's email or 'me' for authenticated user. For delegated access, use shared mailbox or delegated user's email. |
| `categories` | array | No | Filter by categories (case-sensitive); matches if tagged with any specified category. |
| `importance` | string | No | Filter by importance: 'low', 'normal', or 'high'. |
| `page_token` | string | No | Opaque continuation token for fetching the next page. Omit it for the first page; then pass back the `next_page_token` from the previous response, unmodified, repeating until it is absent. Do not construct or edit this value. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and paging params need not be repeated; the token carries them. |
| `from_address` | string | No | Filter by the sender's exact email address. NOTE: This filter is applied client-side on the returned results, not server-side. |
| `conversation_id` | string | No | Filter messages by conversation ID to retrieve all messages in a specific email thread. NOTE: This filter is applied client-side on the returned results. |
| `has_attachments` | boolean | No | Filter by attachment presence: 'true' for messages with attachments, 'false' for those without. NOTE: This filter is applied client-side on the returned results. |
| `response_detail` | string ("minimal" | "full") | No | Level of detail in the response. 'minimal' (default) applies a default $select projection that excludes the heavy 'body', 'uniqueBody', and 'internetMessageHeaders' fields to keep responses small — typical for listing/search use cases. 'full' returns the complete message payload from Microsoft Graph, including the full HTML body. Note: an explicit `select` list always wins over `response_detail` — pass select=['body','subject',...] to control the fields directly. |
| `subject_contains` | string | No | Filter messages where the subject contains the specified case-insensitive substring. NOTE: This filter is applied client-side on the returned results. For better performance, use 'Search Messages' instead. |
| `subject_endswith` | string | No | Filter messages where the subject ends with the specified case-insensitive string. NOTE: This filter is applied client-side on the returned results. For better performance, use 'Search Messages' instead. |
| `sent_date_time_gt` | string | No | Filter messages sent after this ISO 8601 timestamp. |
| `sent_date_time_lt` | string | No | Filter messages sent before this ISO 8601 timestamp. |
| `subject_startswith` | string | No | Filter messages where the subject starts with the specified case-insensitive string. |
| `received_date_time_ge` | string | No | Filter messages received on or after this ISO 8601 timestamp. |
| `received_date_time_gt` | string | No | Filter messages received after this ISO 8601 timestamp (e.g., '2023-01-01T00:00:00Z'). |
| `received_date_time_le` | string | No | Filter messages received on or before this ISO 8601 timestamp. |
| `received_date_time_lt` | string | No | Filter messages received before this ISO 8601 timestamp. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Outlook attachments

**Slug:** `OUTLOOK_LIST_OUTLOOK_ATTACHMENTS`

Lists metadata (name, size, contentType, isInline — but not `contentBytes`) for all attachments of a specified Outlook email message. Returns fileAttachment, itemAttachment, and referenceAttachment types; only fileAttachment entries support download via OUTLOOK_DOWNLOAD_OUTLOOK_ATTACHMENT. Results include inline images and signatures — filter by `isInline == false` and check `contentType` to identify real document attachments. Results are nested under `data.response_data.value`.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The unique identifier of the user. Use the user's UPN (e.g., 'AdeleV@contoso.onmicrosoft.com') or 'me' for the currently authenticated user. This specifies the mailbox to query. |
| `message_id` | string | Yes | The unique identifier of the email message from which to retrieve attachments. Must be a message ID (obtained from OUTLOOK_LIST_MESSAGES or OUTLOOK_SEARCH_EMAILS), not a folder ID or calendar event ID. Folder IDs look similar but will cause an error. When sourcing from OUTLOOK_SEARCH_EMAILS, use `hitId` as the message identifier — not `resource.id`. |
| `response_detail` | string ("minimal" | "full") | No | Level of detail in the response. 'minimal' (default) returns only the attachment metadata that exists on the Graph attachment base type (id, name, size, contentType, isInline, lastModifiedDateTime) — the base64-encoded contentBytes and any fileAttachment-only fields (contentId, contentLocation) are excluded so the heavy file payload never leaves Microsoft Graph. 'full' returns the complete payload including contentBytes for downloading. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List places

**Slug:** `OUTLOOK_LIST_PLACES`

Retrieves a collection of place objects defined in a tenant by type. Places can include rooms, workspaces, buildings, floors, sections, desks, and room lists. When room_list_id is provided, returns only rooms or workspaces within that specific room list using the /places/{roomListId}/microsoft.graph.roomlist/rooms (or /workspaces) endpoint. Use this action when you need to discover available physical spaces or locations within an organization. Note: Before using this API, ensure that the Places settings are properly configured in the tenant.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of places to return per page. Default is 25. API defaults: 100 for rooms/workspaces/room lists, 1000 for buildings/floors/sections/desks. |
| `skip` | integer | No | Number of places to skip for pagination (OData $skip). |
| `count` | boolean | No | Include count of items (OData $count=true). Only supported for room, workspace, and room_list types. |
| `filter` | string | No | OData filter expression to restrict returned places (OData $filter). Only supported for room, workspace, and room_list types. Example: capacity gt 50. |
| `select` | array | No | List of place properties to include in the response (OData $select). Example: displayName, emailAddress, capacity. |
| `placeType` | string ("microsoft.graph.room" | "microsoft.graph.workspace" | "microsoft.graph.roomlist" | "microsoft.graph.building" | "microsoft.graph.floor" | "microsoft.graph.section" | "microsoft.graph.desk") | Yes | The type of place to retrieve. Choose from: room, workspace, room_list, building, floor, section, or desk. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `roomListId` | string | No | The email address of a room list. When provided, scopes the results to rooms or workspaces within that specific room list using the MS Graph endpoint GET /places/{roomListId}/microsoft.graph.roomlist/rooms (or /workspaces). Must be the room list's email address (not its ID). Only valid when place_type is 'room' or 'workspace'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List primary calendar permissions

**Slug:** `OUTLOOK_LIST_PRIMARY_CALENDAR_PERMISSIONS`

Tool to list calendar permissions from a user's primary calendar. Use when you need to see who has access to the primary calendar and their permission levels.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of permissions to return (OData $top parameter). |
| `skip` | integer | No | Number of permissions to skip (OData $skip parameter). |
| `user_id` | string | No | User ID or userPrincipalName. Use 'me' for the signed-in user. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List event reminders

**Slug:** `OUTLOOK_LIST_REMINDERS`

Tool to retrieve reminders for events occurring within a specified time range. Use when you need to see upcoming reminders between two datetimes.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | No | User Principal Name or ID. Use 'me' to indicate the signed-in user. |
| `endDateTime` | string | Yes | The end date and time in ISO 8601 format defining the window for reminders. Example: '2023-10-26T20:00:00.0000000'. |
| `startDateTime` | string | Yes | The start date and time in ISO 8601 format defining the window for reminders. Example: '2023-10-26T19:00:00.0000000'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List sent items messages

**Slug:** `OUTLOOK_LIST_SENT_ITEMS_MESSAGES`

Tool to list all messages in the SentItems mail folder of the signed-in user's mailbox. Use when you need to retrieve sent messages with optional filtering and sorting.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of messages to return per request (1-1000). To page through more, use the `next_page_token` from the response (pass it back as `page_token`). |
| `skip` | integer | No | Number of messages to skip from the beginning of the result set, for pagination. |
| `filter` | string | No | OData $filter query to filter messages. Examples: 'isRead eq false', 'toRecipients/any(a:a/emailAddress/address eq "recipient@example.com")', 'sentDateTime ge 2023-01-01T00:00:00Z', 'hasAttachments eq true'. Note: Combining complex filters with the 'orderby' parameter may fail with an InefficientFilter error. In such cases, remove 'orderby' or apply sorting client-side. |
| `select` | array | No | List of message properties to include in the response. OData $select parameter. Valid properties include: id, subject, from, toRecipients, receivedDateTime, sentDateTime, hasAttachments, importance, isRead, body, bodyPreview, categories, conversationId. |
| `orderby` | string | No | Property to sort results by with direction. OData $orderby parameter. Example: 'sentDateTime desc' or 'subject asc'. Note: Using 'orderby' together with complex 'filter' queries may fail with an InefficientFilter error. If this occurs, either remove 'orderby' or apply sorting client-side. |
| `user_id` | string | No | User ID (GUID) or user principal name (email) of the user whose sent items to list. Required for app-only (S2S) authentication. Not required for delegated authentication (uses signed-in user by default). |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List To Do task lists

**Slug:** `OUTLOOK_LIST_TO_DO_LISTS`

Tool to list Microsoft To Do task lists for the signed-in user. Use when you need to discover available task lists before listing or creating tasks. Returns todoTaskList objects with id and displayName that can be used in downstream operations.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of task lists to return (OData $top). |
| `skip` | integer | No | Number of task lists to skip from the beginning of the result set (OData $skip). Use with $top for pagination. |
| `filter` | string | No | OData filter expression to filter task lists (OData $filter). |
| `select` | array | No | Properties to include in the response (OData $select). |
| `orderby` | array | No | Order by expressions (OData $orderby). |
| `user_id` | string | No | User ID or userPrincipalName. Use 'me' for the signed-in user. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List tasks from a To Do list

**Slug:** `OUTLOOK_LIST_TODO_TASKS`

Tool to list tasks within a specified Microsoft To Do task list, including status and due dates. Use when retrieving tasks from a specific To Do list.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of tasks to retrieve per page (OData $top parameter). Use for pagination. |
| `skip` | integer | No | Number of tasks to skip before returning results (OData $skip parameter). Use with 'top' for offset-based pagination. |
| `filter` | string | No | OData filter expression to narrow down results (OData $filter parameter). Use for filtering by status, importance, dates, etc. Examples: "status eq 'notStarted'", "importance eq 'high'", "dueDateTime/dateTime ge '2024-01-01T00:00:00Z'" |
| `orderby` | array | No | List of properties to sort results by (OData $orderby parameter). Each item is a string like 'dueDateTime/dateTime desc' or 'title asc'. Use 'asc' (default) or 'desc' for sort order. |
| `user_id` | string | No | The unique identifier (GUID) or user principal name (email) of the user. Required for app-only (S2S) authentication. If not provided, defaults to '/me' endpoint (delegated authentication). |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `todo_task_list_id` | string | Yes | The unique identifier of the To Do task list to retrieve tasks from. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List calendar event instances

**Slug:** `OUTLOOK_LIST_USER_CALENDAR_EVENT_INSTANCES`

Tool to retrieve instances (occurrences) of a recurring event from a specific calendar within a date range. Use when you need event instances from a particular calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of event instances to return per page (OData $top). Controls page size for pagination. |
| `skip` | integer | No | Number of event instances to skip from the beginning of the result set (OData $skip). Use with $top for pagination. |
| `user_id` | string | Yes | The unique identifier of the user (can be user ID, userPrincipalName, or 'me' for authenticated user). |
| `event_id` | string | Yes | The unique identifier of the recurring event (seriesMaster) for which to retrieve instances. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `calendar_id` | string | Yes | The unique identifier of the calendar containing the event. |
| `endDateTime` | string | Yes | The end date and time of the time range in ISO 8601 format (e.g., '2026-04-30T23:59:59.0000000'). Only instances that start within or overlap this range will be returned. |
| `startDateTime` | string | Yes | The start date and time of the time range in ISO 8601 format (e.g., '2026-03-01T00:00:00.0000000'). Only instances that start within or overlap this range will be returned. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List user calendar event attachments

**Slug:** `OUTLOOK_LIST_USER_CALENDAR_EVENTS_ATTACHMENTS`

Tool to list attachments for a user's calendar event. Use when you need to retrieve all attachments from a specific event in a user's calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of attachments to return (OData $top). |
| `skip` | integer | No | Number of attachments to skip (OData $skip). |
| `filter` | string | No | OData filter string to filter the attachments (OData $filter). |
| `select` | array | No | List of attachment properties to include (OData $select). |
| `orderby` | array | No | Order by clauses to sort the results (OData $orderby). |
| `user_id` | string | No | The user's primary SMTP address, UPN, or 'me' for the signed-in user. |
| `event_id` | string | Yes | The unique identifier of the calendar event to retrieve attachments from. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List event instances

**Slug:** `OUTLOOK_LIST_USER_CALENDAR_GROUP_EVENT_INSTANCES`

Tool to list instances (occurrences) of a recurring event within a specified date range from a user's calendar in a calendar group. Use when you need to retrieve specific occurrences of a recurring event.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of event instances to return per page (OData $top). Controls page size for pagination. |
| `skip` | integer | No | Number of event instances to skip from the beginning of the result set (OData $skip). Use with $top for pagination. |
| `user_id` | string | Yes | The unique identifier of the user (can be user ID or userPrincipalName). |
| `event_id` | string | Yes | The unique identifier of the event. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `calendar_id` | string | Yes | The unique identifier of the calendar. |
| `endDateTime` | string | Yes | The end date and time of the time range in ISO 8601 format (e.g., '2026-05-01T00:00:00.0000000'). |
| `startDateTime` | string | Yes | The start date and time of the time range in ISO 8601 format (e.g., '2026-03-01T00:00:00.0000000'). |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Calendar View from User Calendar Group

**Slug:** `OUTLOOK_LIST_USER_CALENDAR_GROUPS_CALENDAR_VIEW`

Tool to get calendar view from a specific calendar within a calendar group for a user. Use when retrieving events from a calendar that belongs to a calendar group.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of events to return per page (OData $top). Controls page size for pagination. |
| `skip` | integer | No | Number of events to skip from the beginning of the result set (OData $skip). Use with $top for pagination. |
| `user_id` | string | Yes | The user ID or userPrincipalName. Examples: '6640adbb5cb743b0' or 'user@example.com'. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `calendar_id` | string | Yes | The calendar ID within the calendar group. This is the unique identifier of the specific calendar. |
| `endDateTime` | string | Yes | The end date and time of the time range in ISO 8601 format (e.g., '2025-01-31T23:59:59Z' or '2019-11-08T20:00:00-08:00'). |
| `startDateTime` | string | Yes | The start date and time of the time range in ISO 8601 format (e.g., '2025-01-01T00:00:00Z' or '2019-11-08T19:00:00-08:00'). |
| `calendar_group_id` | string | Yes | The calendar group ID. This is the unique identifier of the calendar group containing the calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List user calendar permissions

**Slug:** `OUTLOOK_LIST_USER_CALENDARS_CALENDAR_PERMISSIONS`

Tool to list calendar permissions for a specific user's specific calendar. Use when you need to see who has access to a user's calendar and their permission levels.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of permissions to return (OData $top parameter). |
| `skip` | integer | No | Number of permissions to skip (OData $skip parameter). |
| `user_id` | string | Yes | The unique identifier of the user. Cannot use 'me' shortcut - must be actual user ID or userPrincipalName. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `calendar_id` | string | Yes | The unique identifier of the calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List user calendars events

**Slug:** `OUTLOOK_LIST_USER_CALENDARS_EVENTS`

Tool to retrieve events from a specific calendar for a user. Use when you need to list calendar events for a specific user by user ID and calendar ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of events to retrieve per page for pagination. |
| `skip` | integer | No | Number of initial events to bypass, used for pagination. |
| `filter` | string | No | OData query string to filter calendar events. ONLY the following properties support filtering: 'start/dateTime', 'end/dateTime', 'subject', 'categories', 'importance', 'sensitivity', 'isAllDay', 'isCancelled', 'isReminderOn', 'type'. CRITICAL: Properties like 'body', 'bodyPreview', 'location', 'locations', 'organizer', 'attendees' do NOT support $filter and will cause errors. IMPORTANT: Use calendar event properties ONLY. Do NOT use mail/message properties like 'receivedDateTime'. For start/end filtering, you MUST use 'start/dateTime' and 'end/dateTime' ONLY. DO NOT use 'start/date' or 'end/date' - these properties do NOT exist and will cause errors. DateTime format: "start/dateTime ge 'YYYY-MM-DDTHH:MM:SSZ'" (requires single quotes and timezone suffix). Operators: ge (>=), le (<=), eq (=), gt (>), lt (<). DateTime values without quotes or timezone suffix will be automatically normalized. |
| `select` | array | No | List of specific event property names to return. MUST be provided as a list. If omitted, a default set of properties is returned. Valid field names: id, subject, body, bodyPreview, start, end, isAllDay, organizer, attendees, location, locations, recurrence, importance, sensitivity, showAs, categories, hasAttachments, webLink, onlineMeeting, onlineMeetingProvider, onlineMeetingUrl, isOnlineMeeting, createdDateTime, lastModifiedDateTime, changeKey, iCalUId, type, seriesMasterId, isOrganizer, isReminderOn, reminderMinutesBeforeStart, responseRequested, responseStatus, allowNewTimeProposals, hideAttendees, isCancelled, isDraft, originalStart, originalStartTimeZone, originalEndTimeZone, transactionId, cancelledOccurrences. Note: 'creator' is NOT a valid field - use 'organizer' instead. Invalid field names will be automatically filtered out. |
| `orderby` | array | No | List of properties to sort results by. Each item is a string like 'start/dateTime desc' or 'subject asc'. MUST be provided as a list, even for single sort criteria. Use 'asc' (default) or 'desc' for order. IMPORTANT: Use calendar event properties ONLY. Do NOT use mail/message properties like 'receivedDateTime'. Valid sortable datetime fields: 'start/dateTime', 'end/dateTime', 'createdDateTime', 'lastModifiedDateTime'. |
| `user_id` | string | Yes | The user's primary SMTP address, user principal name (UPN), or user ID to identify the calendar owner. |
| `timezone` | string | No | Preferred timezone for event start/end times. Accepts IANA format (e.g., 'America/New_York', 'Europe/London', 'Asia/Tokyo') or Windows format (e.g., 'Eastern Standard Time', 'Pacific Standard Time'). Falls back to 'UTC' if the timezone cannot be resolved. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `calendar_id` | string | Yes | The unique identifier of the calendar to retrieve events from. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get calendar view from user's calendar

**Slug:** `OUTLOOK_LIST_USER_CALENDAR_VIEW`

Tool to get calendar view from a specific user's calendar. Use when you need to retrieve events that occur or overlap with a specified time window from a user's specific calendar by calendar ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of events to retrieve. |
| `select` | array | No | List of event properties to return. Defaults to commonly-needed fields excluding the full HTML body. To include the full body content, explicitly add 'body' to this list. |
| `user_id` | string | Yes | The ID of the user or 'me' for the authenticated user. This can be the user's email address or their unique identifier. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |
| `calendar_id` | string | Yes | The unique identifier of the calendar to retrieve events from. Get calendar IDs using the LIST_CALENDARS action. |
| `endDateTime` | string | Yes | The end date and time of the time range in ISO 8601 format with timezone offset (e.g., '2024-12-31T23:59:59-08:00' or '2024-12-31T23:59:59+00:00' for UTC). Events active up to this time will be included. |
| `startDateTime` | string | Yes | The start date and time of the time range in ISO 8601 format with timezone offset (e.g., '2024-01-01T00:00:00-08:00' or '2024-01-01T00:00:00+00:00' for UTC). Events active during this window will be returned. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List user contacts

**Slug:** `OUTLOOK_LIST_USER_CONTACTS`

Tool to retrieve contacts from a specific user's mailbox. Use when you need to list or browse contacts for a given user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of contacts to return. OData $top parameter. |
| `skip` | integer | No | Number of contacts to skip for pagination. OData $skip parameter. |
| `count` | boolean | No | If true, includes a count of the total number of items in the result. OData $count parameter. |
| `expand` | array | No | Related entities to expand inline. OData $expand parameter. |
| `filter` | string | No | OData filter expression to filter contacts. Example: emailAddresses/any(a:a/address eq 'garth@contoso.com') or startswith(displayName,'A'). |
| `select` | array | No | List of properties to include in the response. OData $select parameter. Valid properties: displayName, givenName, surname, emailAddresses, mobilePhone, businessPhones, jobTitle, companyName, etc. |
| `orderby` | array | No | List of properties to order results by. OData $orderby parameter. Format: 'property asc' or 'property desc'. |
| `user_id` | string | Yes | User principal name or ID of the user. Use 'me' for the authenticated user. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List users

**Slug:** `OUTLOOK_LIST_USERS`

Tool to list users in Microsoft Entra ID. Use when you need to retrieve a paginated list of users, optionally filtering or selecting specific properties. For single-user lookups, prefer a dedicated get-user tool — listing all users is significantly heavier and slower.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of users to return (OData $top). Default page size is 100, maximum is 999. |
| `skip` | integer | No | Number of users to skip (OData $skip) for pagination. |
| `filter` | string | No | OData filter expression to restrict returned users (OData $filter). For targeted lookups, use `userPrincipalName eq 'user@domain.com'` or `mail eq 'user@domain.com'` to avoid full-list pagination scans. |
| `select` | array | No | List of user properties to include in the response (OData $select). |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Move mail folder

**Slug:** `OUTLOOK_MOVE_MAIL_FOLDER`

Tool to move a mail folder and its contents to another mail folder. Use when you need to reorganize the folder hierarchy.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `folder_id` | string | Yes | Unique ID of the mail folder to move. Must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. |
| `destination_id` | string | Yes | The destination folder ID, or a well-known folder name (e.g., 'inbox', 'deleteditems', 'drafts', 'sentitems'). The folder being moved will become a child of this destination folder. If using a folder ID, it must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Move child mail folder

**Slug:** `OUTLOOK_MOVE_ME_MAIL_FOLDER`

Tool to move a child mail folder to a different parent folder. Use when you need to reorganize subfolders within the folder hierarchy.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `destination_id` | string | Yes | The destination folder ID, or a well-known folder name (e.g., 'inbox', 'deleteditems', 'drafts', 'sentitems'). The folder being moved will become a child of this destination folder. If using a folder ID, it must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. |
| `mail_folder_id` | string | Yes | The ID of the parent mail folder that contains the child folder to move. Must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. |
| `child_folder_id` | string | Yes | The ID of the child folder to move. Must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Move message to folder

**Slug:** `OUTLOOK_MOVE_MESSAGE`

Move a message to another folder within the specified user's mailbox. Creates a new copy in the destination folder and removes the original. The message_id changes after a successful move; use the ID returned in the response for any subsequent operations on the moved message. Retries transient Microsoft Graph 404 responses with exponential backoff for up to 7.5 seconds because newly surfaced messages can be eventually consistent. High-volume parallel moves can trigger HTTP 429 (MailboxConcurrency) throttling; honor the Retry-After header.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `message_id` | string | Yes | Unique ID of the Outlook email message to move. Must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. If Microsoft Graph briefly returns 404 because a webhook, create, move, or mailbox index change has not propagated yet, this tool retries with exponential backoff for up to 7.5 seconds; if 404 persists, agents should wait a few seconds and retry before treating the ID as invalid. |
| `destination_id` | string | Yes | The destination folder ID, or a well-known folder name (e.g., 'inbox', 'deleteditems', 'drafts', 'sentitems'). If using a folder ID, it must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. Prefer folder IDs over well-known names — some tenants reject well-known names like 'deleteditems'. Retrieve current folder IDs via OUTLOOK_LIST_MAIL_FOLDERS rather than hard-coding, as IDs can become stale. Display names are localized and non-unique; never use display names as the destination_id. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Move message from child folder

**Slug:** `OUTLOOK_MOVE_MESSAGE_FROM_CHILD_FOLDER`

Tool to move a message from a child folder to another destination folder. Use when you need to move a message that exists within a specific folder hierarchy (parent folder → child folder → message).

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | User's id, userPrincipalName, or user object ID. |
| `message_id` | string | Yes | Unique ID of the Outlook email message to move. Must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. |
| `destinationId` | string | Yes | The destination folder ID, or a well-known folder name (e.g., 'inbox', 'deleteditems', 'drafts', 'sentitems', 'junkemail'). If using a folder ID, it must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the parent mail folder. Common well-known names include: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. For folder IDs, obtain them from OUTLOOK_LIST_MAIL_FOLDERS. Folder IDs are base64-encoded strings (e.g., 'AAMkAGI0ZjExAAA='). |
| `child_folder_id` | string | Yes | The ID of the child folder containing the message. Obtain this from OUTLOOK_LIST_CHILD_MAIL_FOLDERS. Child folder IDs are base64-encoded strings (e.g., 'AAMkADAwATMwMAExAAA='). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Move message from folder

**Slug:** `OUTLOOK_MOVE_MESSAGE_FROM_FOLDER`

Tool to move a message from a specific mail folder to another destination folder. Use when you need to move a message and know both the source folder ID and the message ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `message_id` | string | Yes | Unique ID of the Outlook email message to move. Must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. |
| `destinationId` | string | Yes | The destination folder ID, or a well-known folder name (e.g., 'inbox', 'deleteditems', 'drafts', 'sentitems'). If using a folder ID, it must be the complete, untruncated ID string - do not use shortened or ellipsis-containing IDs. |
| `mail_folder_id` | string | Yes | The ID or well-known name of the mail folder containing the message. ONLY these specific well-known names are valid as string names: 'inbox', 'drafts', 'sentitems', 'deleteditems', 'junkemail', 'archive', 'outbox', 'clutter', 'conflicts', 'conversationhistory', 'localfailures', 'msgfolderroot', 'recoverableitemsdeletions', 'scheduled', 'searchfolders', 'serverfailures', 'syncissues'. Arbitrary folder names are NOT valid. If the folder is not one of these well-known names, you MUST use the actual folder ID - a base64-encoded string (e.g., 'AAMkAGI0ZjExAAA=') obtained from OUTLOOK_LIST_MAIL_FOLDERS or OUTLOOK_LIST_CHILD_MAIL_FOLDERS. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Permanently Delete Message

**Slug:** `OUTLOOK_PERMANENT_DELETE_MESSAGE`

Permanently deletes an Outlook message by moving it to the Purges folder in the dumpster. Unlike standard DELETE, this action makes the message unrecoverable by the user. IMPORTANT: This is NOT the same as DELETE - permanentDelete is irreversible and availability differs by national cloud deployments (not available in US Government L4, L5 (DOD), or China (21Vianet)).

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address, UPN, or 'me' for the currently authenticated user. |
| `message_id` | string | Yes | Unique identifier of the Outlook email message to permanently delete. The message will be moved to the Purges folder in the dumpster and cannot be recovered by the user. |
| `mail_folder_id` | string | No | Optional mail folder ID. If provided, uses the folder-scoped endpoint: /users/{userId}/mailFolders/{mailFolderId}/messages/{messageId}/permanentDelete |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Pin message

**Slug:** `OUTLOOK_PIN_MESSAGE`

Tool to pin a message in an Outlook chat. Use when you want to mark an important message for quick access.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chat_id` | string | Yes | ID of the chat where the message will be pinned. |
| `user_id` | string | No | User ID (GUID or email) to pin message for. Required for S2S (app-only) authentication. If not provided, uses '/chats' endpoint (requires delegated authentication). |
| `message_url` | string | Yes | Fully qualified Graph URL of the chat message to pin. Format: https://graph.microsoft.com/v1.0/chats/{chat-id}/messages/{message-id} |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Query Emails

**Slug:** `OUTLOOK_QUERY_EMAILS`

Query Outlook emails within a SINGLE folder using OData filters. Build precise server-side filters for dates, read status, importance, subjects, attachments, and conversations. Best for structured queries on message metadata within a specific folder. Returns up to 100 messages per request with pagination support. • Searches SINGLE folder only (inbox, sentitems, etc.) - NOT across all folders • For cross-folder/mailbox-wide search: Use OUTLOOK_SEARCH_MESSAGES • Server-side filters: dates, importance, isRead, hasAttachments, subjects, conversationId • Pagination: use the returned next_page_token (pass it back as page_token) until it is absent • Limitations: Recipient/body filtering requires OUTLOOK_SEARCH_MESSAGES

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `top` | integer | No | Maximum number of messages to return per request (1-1000). Default is 100. IMPORTANT: For large mailboxes, paginate using `next_page_token`. Pagination example: 1) Call with top=100, 2) Read `next_page_token` from the response, 3) If present, call again passing it back as `page_token`, 4) Repeat until `next_page_token` is absent. |
| `skip` | integer | No | Number of messages to skip for pagination. NOTE: For large result sets, prefer the returned `next_page_token` (pass it back as `page_token`) over manual skip. |
| `filter` | string | No | OData $filter query string to filter email messages. Syntax: 'field operator value' combined with 'and', 'or', 'not'.          **Operators:** eq, ne, lt, le, gt, ge, startswith(), contains(), any()          **String Functions:**         - subject: contains(), startswith()         - from/sender: startswith() and eq only. contains() is NOT supported on sender/from fields         - endswith() is NOT reliably supported by Microsoft Graph API for message filtering          **Filterable Fields:**         - `isRead` - Boolean: true/false         - `importance` - String: 'low', 'normal', 'high'         - `subject` - String (exact match or startswith)         - `hasAttachments` - Boolean: true/false         - `receivedDateTime`, `sentDateTime` - DateTime (ISO 8601: 2025-10-01T00:00:00Z, NOT enclosed in quotes)         - `conversationId` - String (exact match)         - `categories` - Array (use any() operator: `categories/any(a:a eq 'CategoryName')`)         - `isDraft`, `flag/flagStatus` - Boolean/String flags         - `from/emailAddress/address`, `sender/emailAddress/address` - Sender email (ONLY 'address' is filterable, NOT 'name')          **NOT filterable:** toRecipients, ccRecipients, bccRecipients, body/content, id — use OUTLOOK_SEARCH_MESSAGES for these.          **Categories Filtering:**         - Single: `categories/any(a:a eq 'CategoryName')`         - Multiple (OR): Use SEPARATE any() calls: `categories/any(a:a eq 'Cat1') or categories/any(b:b eq 'Cat2')`         - For category names containing single quotes, escape them by doubling: `categories/any(a:a eq 'Owner''s Category')`          **Date Filtering:**         - ISO 8601 format: 2025-10-01T00:00:00Z (no quotes around datetime values)         - Operators: ge, gt, le, lt  |
| `folder` | string | No | SINGLE mail folder to search within (cannot search across all folders). Well-known names (case-insensitive): 'inbox', 'sentitems', 'drafts', 'deleteditems', 'outbox', 'junkemail', 'archive', 'clutter', 'recoverableitemsdeletions'. For custom folders (e.g., 'Billing', 'Projects'), you MUST provide the folder ID (a long base64-like string like 'AAMkAGU0NTRiNDA4...'). Use OUTLOOK_LIST_MAIL_FOLDERS to get folder IDs for custom folders. Do NOT pass folder URLs or display names. IMPORTANT: To search across ALL folders, use OUTLOOK_SEARCH_MESSAGES instead (searches entire mailbox without folder restriction). NOTE: This parameter also accepts 'folder_id' as an alias for backwards compatibility. |
| `select` | array | No | List of message properties to include in the response (accepts comma-separated string or list). Field names are automatically normalized to correct camelCase (e.g., 'bodypreview' -> 'bodyPreview', 'hasattachments' -> 'hasAttachments'). Valid fields: id, subject, from, sender, toRecipients, ccRecipients, bccRecipients, replyTo, receivedDateTime, sentDateTime, createdDateTime, lastModifiedDateTime, hasAttachments, importance, isRead, isDraft, body, bodyPreview, uniqueBody, categories, conversationId, conversationIndex, parentFolderId, changeKey, internetMessageId, internetMessageHeaders, webLink, flag, attachments, inferenceClassification, isReadReceiptRequested, isDeliveryReceiptRequested. NOTE: 'inReplyTo' is NOT a valid property for email messages in Microsoft Graph v1.0. When not specified, returns metadata without body. Include 'body' for full content. Pass [] for all fields. |
| `orderby` | string | No | Sort order as comma-separated string or list (accepts 'field asc/desc' format or JSON-serialized arrays). Input is automatically normalized to correct format. Common fields: receivedDateTime, sentDateTime, subject, importance, from. NOTE: Ordering may be automatically disabled by Microsoft Graph API when using certain filters (e.g., subject exact match, conversationId) to avoid 'InefficientFilter' errors. In those cases, results will be unsorted. |
| `user_id` | string | No | Target user's email or 'me' for authenticated user. IMPORTANT: 'me' uses the currently connected account. For shared or delegated mailbox access, ensure the connected user has mailbox access and the app has Mail.Read.Shared. 403 errors indicate insufficient delegated/application permissions. |
| `page_token` | string | No | Opaque continuation token for the next page. Omit for the first page; then pass back the `next_page_token` from the previous response, unmodified, until it is absent. Do not construct or edit it. When set, it drives pagination; resend any required identifier fields from the first call (the token supersedes their values). Optional filter, sort and timezone params need not be repeated; the token carries them. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Reply to Email

**Slug:** `OUTLOOK_REPLY_EMAIL`

Sends a reply to an Outlook email message with optional HTML formatting, attachments, CC, and BCC recipients.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `comment` | string | Yes | The body content of the reply email. Can be plain text or HTML based on is_html flag. |
| `is_html` | boolean | No | Whether the comment body should be rendered as HTML (true) or plain text (false). When false, HTML tags in the comment will be displayed as literal text. |
| `user_id` | string | No | The user's email address or 'me' to indicate the authenticated user. This specifies the mailbox from which the reply will be sent. |
| `cc_emails` | array | No | List of email addresses for CC recipients. |
| `attachment` | string | No | File(s) to attach to the reply. Accepts a single file or a list of files. |
| `bcc_emails` | array | No | List of email addresses for BCC recipients. |
| `message_id` | string | Yes | The Microsoft Graph message ID (NOT an email address). This is a Base64-encoded string typically starting with 'AAMk' (e.g., 'AAMkAGI2TAAA='). Do NOT pass email addresses like 'user@example.com'. Obtain this ID from the 'id' field returned by `OUTLOOK_LIST_MESSAGES`, `OUTLOOK_GET_MESSAGE`, or `OUTLOOK_SEARCH_MESSAGES` actions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Search calendar events

**Slug:** `OUTLOOK_SEARCH_EVENTS`

Searches for calendar events in the authenticated user's primary calendar using the Microsoft Graph Search API. This action performs full-text search across event subject, body, location, and attendee information. Use this action when you need to find events by keyword or phrase rather than filtering by specific fields. For filtering by date range or specific properties, use the list events action instead.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `size` | integer | No | Maximum number of results to return per page. The default is 25. |
| `query` | string | Yes | The search query string to find calendar events. Searches across event subject, body, location, and attendee information. |
| `from_index` | integer | No | The zero-based starting index for pagination. Use this to skip results and fetch the next page. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Search Outlook messages

**Slug:** `OUTLOOK_SEARCH_MESSAGES`

Search Outlook messages using powerful KQL syntax. Supports sender (from:), recipient (to:, cc:), subject, date filters (received:, sent:), attachments, and boolean logic. Only works with Microsoft 365/Enterprise accounts (no @hotmail.com/@outlook.com). Examples: 'from:user@example.com AND received>=2025-10-01', 'to:info@jcdn.nl AND subject:invoice', 'received>today-30 AND hasattachment:yes'

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `size` | integer | No | Number of search results to return per page (1-25). Note: For message entity, max size is 25. Also, from_index + size cannot exceed 1000 (API pagination window limit). |
| `query` | string | No | KQL (Keyword Query Language) search query string. Supports advanced syntax for precise searches.  **Basic Syntax:** - Simple keywords: 'budget report' - Exact phrases: '"quarterly review"' - Boolean operators: 'urgent AND deadline' or 'invoice OR receipt'  **Property Filters (prefix:value):** - from: Sender email - 'from:user@example.com' or 'from:example.com' - to: Recipient email - 'to:info@jcdn.nl' - cc: CC recipient - 'cc:manager@example.com' - subject: Subject line - 'subject:invoice' - received: Date received - 'received:2025-10-01' or 'received>=2025-10-01' - sent: Date sent - 'sent:2025-10-01' or 'sent>=2025-10-01' - hasattachment: Has files - 'hasattachment:yes' or 'hasattachment:no'  **REQUIRED**: At least one search criterion must be provided - either this query parameter OR one of the legacy filters (fromEmail, subject, hasAttachments). Empty searches are not supported. |
| `region` | string | No | Geographic region for the search query. ONLY required when using application permissions (S2S authentication). DO NOT use with delegated permissions (user authentication) - the API will reject the request. Common values: 'US', 'EU', 'GB', 'JP', 'CN', 'IN', 'CA', 'AU', 'BR', 'RU'. Leave unset (None) for delegated permissions. |
| `subject` | string | No | Text to search for within the message subject line. Legacy parameter - prefer using 'subject:text' in the query parameter for more control. When combined with query, this filter is joined using AND. If query contains OR operators, the query is wrapped in parentheses to preserve precedence. Example: Instead of subject='invoice', use query='subject:invoice AND received>=2025-10-01' |
| `user_id` | string | No | Target mailbox: 'me' for the signed-in user, or an email/UPN for a shared/other mailbox (e.g., 'support@example.com'). Shared-mailbox access requires Mail.Read.Shared (delegated) or Mail.Read (application) on the target; 403 means insufficient permissions. Behavior differs by value: 'me' uses the Microsoft Search API; a specific mailbox uses the Messages API with $search (response is normalized back into the same hitsContainers/hits shape, so callers don't need to branch). `region` and `enable_top_results` apply only when `user_id` is 'me'. LIMITATION: shared-mailbox search supports only the first page (`from_index=0`); Graph rejects $skip with $search. For deep pagination over a shared mailbox, use OUTLOOK_QUERY_EMAILS with $filter. |
| `fromEmail` | string | No | Filter messages by sender email address or domain. Supports exact email ('user@example.com') or domain matching ('example.com'). Legacy parameter - prefer using 'from:email@example.com' in the query parameter for more flexibility. When combined with query, this filter is joined using AND. If query contains OR operators, the query is wrapped in parentheses to preserve precedence. Note: Only Microsoft 365/Enterprise accounts are supported (no @hotmail.com or @outlook.com). |
| `from_index` | integer | No | The 0-based starting index for pagination (max 999). Note: from_index + size cannot exceed 1000 (API pagination window limit). To paginate: check response['value'][0]['hitsContainers'][0]['moreResultsAvailable']. If true, call again with from_index += size (e.g., 0 → 25 → 50). Message ID is in hits[]['hitId'], not hits[]['resource']['id']. |
| `hasAttachments` | boolean | No | Filters messages based on the presence of attachments. Legacy parameter - prefer using 'hasattachment:yes' or 'hasattachment:no' in the query parameter. When combined with query, this filter is joined using AND. If query contains OR operators, the query is wrapped in parentheses to preserve precedence. |
| `enable_top_results` | boolean | No | If `true`, sorts results by relevance; otherwise, sorts by date in descending order (newest first). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Send draft

**Slug:** `OUTLOOK_SEND_DRAFT`

Tool to send an existing draft message. Use after creating a draft when you want to deliver it to recipients immediately. Example: Send a draft message with ID 'AAMkAG…'.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address or 'me' to represent the authenticated user. |
| `message_id` | string | Yes | The unique identifier of the draft message to send. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Send email

**Slug:** `OUTLOOK_SEND_EMAIL`

Sends an email with subject, body, recipients, and optional attachments via Microsoft Graph API. Supports comma-separated email addresses in the to_email field for multiple recipients. Accepts either a single file or a list of files as attachments. Attachments require a non-empty file with valid name and mimetype.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string | Yes | The primary recipient's email address(es). You can provide a single email or multiple emails separated by commas. Valid email addresses will be extracted from strings containing extra text. Format: name@domain.com |
| `body` | string | Yes | The content of the email body as a plain string (plain text or HTML based on `is_html`). Do not pass structured objects; provide only the raw text/HTML content. |
| `is_html` | boolean | No | Specifies if the email body is HTML; `True` for HTML, `False` for plain text. |
| `subject` | string | Yes | The subject line of the email. |
| `to_name` | string | No | The display name of the primary recipient. |
| `user_id` | string | No | The user's email address or the alias 'me' to represent the authenticated user. |
| `cc_emails` | array | No | List of email addresses for CC recipients. Each email should be a separate string in the array. Do NOT pass comma-separated values as a single string. |
| `attachment` | string | No | File(s) to attach. Accepts a single file or a list of files. |
| `bcc_emails` | array | No | List of email addresses for BCC recipients. Each email should be a separate string in the array. Do NOT pass comma-separated values as a single string. |
| `from_address` | string | No | Optional From address to set on the message (send as/on behalf). Provide a single email address. Requires appropriate mailbox permissions. |
| `save_to_sent_items` | boolean | No | Indicates if the email should be saved in 'Sent Items'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Snooze user calendar group event reminder

**Slug:** `OUTLOOK_SNOOZE_CALENDAR_GROUP_EVENT_REMINDER`

Tool to snooze a reminder for a user's calendar event within a calendar group to a new time. Use when you need to postpone an event reminder for a specific user's calendar that belongs to a calendar group.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's primary SMTP address, user principal name (UPN), or the alias 'me' (for the signed-in user) to identify the calendar owner. |
| `event_id` | string | Yes | The unique identifier of the event whose reminder should be snoozed. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `newReminderTime` | object | Yes | The new date, time, and time zone when the reminder should trigger again. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group containing the calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Snooze event reminder

**Slug:** `OUTLOOK_SNOOZE_EVENT_REMINDER`

Tool to postpone an event reminder until a new time. Use when you need to delay a reminder for a calendar event.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The unique identifier (GUID) or user principal name (email) of the user. Required for app-only (S2S) authentication. If not provided, uses '/me' endpoint. |
| `event_id` | string | Yes | The unique identifier of the calendar event whose reminder should be snoozed. |
| `newReminderTime` | object | Yes | The new date and time when the reminder should fire. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Snooze user calendar event reminder

**Slug:** `OUTLOOK_SNOOZE_USER_CALENDAR_EVENT_REMINDER`

Tool to snooze a reminder for a calendar event in a specific user calendar to a new time. Use when you need to postpone an event reminder for a specific calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's primary SMTP address, user principal name (UPN), or the alias 'me' (for the signed-in user) to identify the calendar owner. |
| `event_id` | string | Yes | The unique identifier of the calendar event whose reminder should be snoozed. |
| `calendar_id` | string | Yes | The unique identifier of the calendar containing the event. |
| `newReminderTime` | object | Yes | The new date, time, and time zone when the reminder should trigger again. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Snooze user event reminder

**Slug:** `OUTLOOK_SNOOZE_USER_EVENT_REMINDER`

Tool to snooze a reminder for a user's calendar event to a new time. Use when you need to postpone an event reminder for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's primary SMTP address, user principal name (UPN), or the alias 'me' (for the signed-in user) to identify the calendar owner. |
| `event_id` | string | Yes | The unique identifier of the calendar event whose reminder should be snoozed. |
| `new_reminder_time` | object | Yes | The new date, time, and time zone when the reminder should trigger again. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update calendar event

**Slug:** `OUTLOOK_UPDATE_CALENDAR_EVENT`

Updates specified fields of an existing Outlook calendar event. Implementation note: To avoid unintentionally clearing properties, the action first fetches the existing event, merges only the provided fields, and then PATCHes the merged updates. Unspecified fields remain unchanged.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `body` | object | No | Event body with content type ('Text' or 'HTML') and the content. If omitted, the existing body remains unchanged. |
| `show_as` | string | No | Availability status for the event. Valid values: 'free', 'tentative', 'busy', 'oof'. If omitted, the existing status remains unchanged. |
| `subject` | string | No | New subject for the event. If provided as an empty string, the subject will be cleared. If omitted, the existing subject remains unchanged. |
| `user_id` | string | No | The identifier of the user whose calendar event is to be updated. Accepts the user's principal name, ID, or 'me' for the currently authenticated user. |
| `event_id` | string | Yes | The unique identifier of the calendar event to be updated. This ID can be obtained from the OUTLOOK_LIST_EVENTS action. |
| `location` | string | No | Event location. Can be provided as a simple string (e.g., 'Conference Room A') which will be converted to displayName, or as a dictionary with fields like displayName, address, etc. If provided, replaces the existing primary location. Omit to leave unchanged. |
| `attendees` | array | No | Attendee list for the event. If provided, replaces the existing attendees. If omitted, attendees remain unchanged. |
| `time_zone` | string | No | Time zone for the provided start_datetime and/or end_datetime (IANA or Windows time zone names). If omitted, the existing event's time zone is used. |
| `categories` | array | No | Category names to associate with the event. If provided (even empty), replaces the existing categories. If omitted, categories remain unchanged. Duplicate entries (case-insensitive) are automatically removed. |
| `recurrence` | object | No | The recurrence pattern for an event. |
| `end_datetime` | string | No | New end date and time for the event. Provide together with a time zone, or the current event's time zone will be used. Must be after start_datetime if both are provided. If omitted, the end time remains unchanged. |
| `start_datetime` | string | No | New start date and time for the event. Provide together with a time zone, or the current event's time zone will be used. If omitted, the start time remains unchanged. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update event in specific calendar

**Slug:** `OUTLOOK_UPDATE_CALENDAR_EVENT_IN_CALENDAR`

Tool to update an event in a specific Outlook calendar. Use when you need to modify event details like subject, time, attendees, or location in a non-default calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `body` | object | No | Event body with content type ('Text' or 'HTML') and the content. If omitted, the existing body remains unchanged. |
| `show_as` | string | No | Availability status for the event. Valid values: 'free', 'tentative', 'busy', 'oof'. If omitted, the existing status remains unchanged. |
| `subject` | string | No | New subject for the event. If provided as an empty string, the subject will be cleared. If omitted, the existing subject remains unchanged. |
| `user_id` | string | No | The user ID or principal name (email) of the user whose calendar event to update. Required for app-only (S2S) authentication. If not provided, uses the authenticated user context (/me endpoint) for delegated authentication. |
| `event_id` | string | Yes | The unique identifier of the calendar event to be updated. This ID can be obtained from the OUTLOOK_LIST_EVENTS action. |
| `location` | string | No | Event location. Can be provided as a simple string (e.g., 'Conference Room A') which will be converted to displayName, or as a dictionary with fields like displayName, address, etc. If provided, replaces the existing primary location. Omit to leave unchanged. |
| `attendees` | array | No | Attendee list for the event. If provided, replaces the existing attendees. If omitted, attendees remain unchanged. |
| `time_zone` | string | No | Time zone for the provided start_datetime and/or end_datetime (IANA or Windows time zone names). If omitted, the existing event's time zone is used. |
| `categories` | array | No | Category names to associate with the event. If provided (even empty), replaces the existing categories. If omitted, categories remain unchanged. Duplicate entries (case-insensitive) are automatically removed. |
| `importance` | string | No | The importance of the event: low, normal, or high. If omitted, the existing value remains unchanged. |
| `is_all_day` | boolean | No | Set to true if the event lasts all day. If omitted, the existing value remains unchanged. |
| `recurrence` | object | No | The recurrence pattern for an event. |
| `calendar_id` | string | Yes | The unique identifier of the calendar containing the event. This ID can be obtained from the OUTLOOK_LIST_CALENDARS action. |
| `sensitivity` | string | No | Sensitivity level: normal, personal, private, confidential. If omitted, the existing value remains unchanged. |
| `end_datetime` | string | No | New end date and time for the event. Provide together with a time zone, or the current event's time zone will be used. Must be after start_datetime if both are provided. If omitted, the end time remains unchanged. |
| `is_reminder_on` | boolean | No | Set to true if an alert is set to remind the user of the event. If omitted, the existing value remains unchanged. |
| `start_datetime` | string | No | New start date and time for the event. Provide together with a time zone, or the current event's time zone will be used. If omitted, the start time remains unchanged. |
| `is_online_meeting` | boolean | No | True if this event has online meeting information. If omitted, the existing value remains unchanged. |
| `reminder_minutes_before_start` | integer | No | The number of minutes before the event start time that the reminder alert occurs. If omitted, the existing value remains unchanged. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update calendar group

**Slug:** `OUTLOOK_UPDATE_CALENDAR_GROUP`

Tool to update the properties of a calendar group object. Use when you need to rename a calendar group.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | The new name for the calendar group. |
| `user_id` | string | No | The user's principal name (UPN) or object ID. Use 'me' for the authenticated user. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group to update. This ID can be obtained from the list calendar groups action. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Calendar Group Calendar Permission

**Slug:** `OUTLOOK_UPDATE_CALENDAR_GROUP_CALENDAR_PERMISSION`

Tool to update a calendar permission within a calendar group. Use when changing access levels for calendars in specific groups.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string ("freeBusyRead" | "limitedRead" | "read" | "write") | Yes | The permission level to change to for the calendar share recipient. Options: freeBusyRead (view availability only), limitedRead (view availability and titles), read (view all event details), write (view and edit events). |
| `user_id` | string | No | The unique identifier or email address of the user. Required for S2S (app-only) authentication. If not provided, defaults to 'me' for delegated authentication. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the group. |
| `permission_id` | string | Yes | The unique identifier of the calendar permission to update. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group containing the calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user calendar in calendar group

**Slug:** `OUTLOOK_UPDATE_CALENDAR_GROUPS_CALENDARS`

Tool to update a calendar within a calendar group in a user's mailbox. Use when modifying calendar properties like name, color, or default calendar status.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | The new display name for the calendar. |
| `color` | string ("auto" | "lightBlue" | "lightGreen" | "lightOrange" | "lightGray" | "lightYellow" | "lightTeal" | "lightPink" | "lightBrown" | "lightPurple" | "lightRed") | No | The color theme to assign to the calendar. Supported values: auto, lightBlue, lightGreen, lightOrange, lightGray, lightYellow, lightTeal, lightPink, lightBrown, lightPurple, lightRed. |
| `user_id` | string | No | The user's identifier. Use 'me' for the signed-in user, or specify a user principal name (email) or user ID. |
| `hexColor` | string | No | An optional hexadecimal color code for the calendar in the format '#RRGGBB'. |
| `calendar_id` | string | Yes | The unique identifier of the calendar to update. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group containing the calendar to update. |
| `isDefaultCalendar` | boolean | No | Whether this calendar should be set as the user's default calendar. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user calendar group event

**Slug:** `OUTLOOK_UPDATE_CALENDAR_GROUPS_CALENDARS_EVENTS`

Tool to update an event in a calendar within a calendar group for a specific user. Use when modifying event details for a user's calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `end` | object | No | Represents a date, time, and time zone. |
| `body` | object | No | The body content of the event. |
| `start` | object | No | Represents a date, time, and time zone. |
| `showAs` | string | No | The status to show on the calendar. Valid values: 'free', 'tentative', 'busy', 'oof', 'workingElsewhere', 'unknown'. If omitted, the existing status remains unchanged. |
| `subject` | string | No | The new subject/title of the event. If omitted, the existing subject remains unchanged. |
| `user_id` | string | Yes | The ID or principal name of the user whose calendar event to update. Use 'me' for the authenticated user. |
| `event_id` | string | Yes | The unique identifier of the event to update. |
| `location` | object | No | The location of an event. |
| `attendees` | array | No | The new list of attendees for the event. If provided, replaces the existing attendees. If omitted, attendees remain unchanged. |
| `categories` | array | No | A list of category names to associate with the event. If provided, replaces the existing categories. If omitted, categories remain unchanged. Duplicate entries (case-insensitive) are automatically removed. |
| `importance` | string | No | The importance of the event. Valid values: 'low', 'normal', 'high'. If omitted, the existing importance remains unchanged. |
| `calendar_id` | string | Yes | The ID of the calendar within the calendar group containing the event. |
| `isOnlineMeeting` | boolean | No | Set to true to indicate that the event is an online meeting. If omitted, the existing setting remains unchanged. |
| `calendar_group_id` | string | Yes | The ID of the calendar group containing the target calendar. |
| `onlineMeetingProvider` | string | No | The online meeting provider. Currently only 'teamsForBusiness' is supported. If omitted, the existing provider remains unchanged. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update calendar permission

**Slug:** `OUTLOOK_UPDATE_CALENDAR_PERMISSION`

Tool to update calendar permission levels for share recipients or delegates. Use when you need to change the access level (role) for someone who has been granted access to a calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string ("freeBusyRead" | "limitedRead" | "read" | "write") | Yes | The permission level to change to for the calendar share recipient or delegate. Possible values: freeBusyRead (view free/busy status only), limitedRead (view free/busy status, titles and locations), read (view all details except private events), write (view all details except private events and edit events). |
| `user_id` | string | No | User ID, userPrincipalName, or 'me' for the authenticated user. |
| `calendar_id` | string | Yes | The unique identifier of the calendar. |
| `permission_id` | string | Yes | The unique identifier of the calendar permission to update. This ID can be obtained from listing calendar permissions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update child folder contact

**Slug:** `OUTLOOK_UPDATE_CHILD_FOLDER_CONTACT`

Tool to update a contact in a child contact folder within a parent contact folder. Use when you need to modify contact properties such as name, email, phone numbers, or company details for contacts in nested folder structures.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | No | The contact's title (e.g., Mr., Ms., Dr.). |
| `manager` | string | No | The name of the contact's manager. |
| `surname` | string | No | The contact's surname (last name). |
| `user_id` | string | No | User's identifier; 'me' for the signed-in user, or user's principal name/ID. |
| `birthday` | string | No | The contact's birthday in ISO 8601 format (YYYY-MM-DD). |
| `children` | array | No | The names of the contact's children. |
| `jobTitle` | string | No | The contact's job title. |
| `nickName` | string | No | The contact's nickname. |
| `givenName` | string | No | The contact's given (first) name. |
| `categories` | array | No | Categories for organizing the contact. |
| `contact_id` | string | Yes | The unique identifier of the contact to update. |
| `department` | string | No | The contact's department. |
| `homePhones` | array | No | The contact's home phone numbers. |
| `middleName` | string | No | The contact's middle name. |
| `profession` | string | No | The contact's profession. |
| `spouseName` | string | No | The name of the contact's spouse/partner. |
| `companyName` | string | No | The name of the contact's company. |
| `displayName` | string | No | The contact's full display name. |
| `homeAddress` | object | No | Physical address information. |
| `mobilePhone` | string | No | The contact's mobile phone number. |
| `yomiSurname` | string | No | The phonetic Japanese surname (last name) of the contact. |
| `otherAddress` | object | No | Physical address information. |
| `assistantName` | string | No | The name of the contact's assistant. |
| `personalNotes` | string | No | Personal notes about the contact. |
| `yomiGivenName` | string | No | The phonetic Japanese given name (first name) of the contact. |
| `businessPhones` | array | No | The contact's business phone numbers. |
| `emailAddresses` | array | No | The contact's email addresses. |
| `officeLocation` | string | No | The location of the contact's office. |
| `businessAddress` | object | No | Physical address information. |
| `child_folder_id` | string | Yes | The unique identifier of the child folder containing the contact. |
| `yomiCompanyName` | string | No | The phonetic Japanese company name of the contact. |
| `contact_folder_id` | string | Yes | The unique identifier of the parent contact folder. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Contact

**Slug:** `OUTLOOK_UPDATE_CONTACT`

Updates an existing Outlook contact, identified by `contact_id` for the specified `user_id`, requiring at least one other field to be modified.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notes` | string | No | Personal notes about the contact (maps to 'personalNotes' in Microsoft Graph API). |
| `surname` | string | No | Contact's surname (last name). |
| `user_id` | string | No | User's identifier; 'me' for the signed-in user, or user's principal name/ID. |
| `birthday` | string | No | Contact's birthday (YYYY-MM-DD format). |
| `job_title` | string | No | Contact’s job title. |
| `categories` | array | No | Categories for organizing the contact. |
| `contact_id` | string | Yes | Unique identifier of the contact to update. |
| `department` | string | No | Contact's department. |
| `given_name` | string | No | Contact’s given (first) name. |
| `home_phones` | array | No | Contact’s home phone numbers. |
| `company_name` | string | No | Contact’s company name. |
| `display_name` | string | No | Contact’s full display name. |
| `mobile_phone` | string | No | Contact’s mobile phone number. |
| `business_phones` | array | No | Contact’s business phone numbers. |
| `email_addresses` | array | No | Contact’s email addresses. Each entry requires `address` (string) and optionally `name` (string). Replaces all existing email addresses on save; include all intended addresses, not just new ones. |
| `office_location` | string | No | Contact's office location. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user contact folder

**Slug:** `OUTLOOK_UPDATE_CONTACT_FOLDER`

Tool to update the properties of a contact folder for a specific user. Use when you need to rename or move an existing contact folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | User principal name or ID. Use 'me' for the authenticated user. |
| `displayName` | string | No | The updated display name for the contact folder. |
| `parentFolderId` | string | No | The ID of the folder's parent folder to move this contact folder under. |
| `contact_folder_id` | string | Yes | The unique identifier of the contact folder to update. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user contact folder child folder

**Slug:** `OUTLOOK_UPDATE_CONTACT_FOLDER_CHILD_FOLDER`

Tool to update a child folder within a contact folder for a specific user. Use when you need to rename a child contact folder or move it to a different parent folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. Can use 'me' as a shortcut for the authenticated user, or provide user ID or userPrincipalName. |
| `display_name` | string | No | The updated display name for the child folder. |
| `child_folder_id` | string | Yes | The ID of the child folder to update. |
| `parent_folder_id` | string | No | The ID of the new parent folder to move this child folder under. |
| `contact_folder_id` | string | Yes | The ID of the parent contact folder that contains the child folder to update. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update contact in folder

**Slug:** `OUTLOOK_UPDATE_CONTACT_FOLDERS_CONTACTS`

Tool to update a contact within a specific contact folder. Use when you need to modify contact details for a contact stored in a particular folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `surname` | string | No | Contact's surname (last name). |
| `user_id` | string | No | User's identifier; 'me' for the signed-in user, or user's principal name/ID. |
| `birthday` | string | No | Contact's birthday (YYYY-MM-DD format). |
| `job_title` | string | No | Contact's job title. |
| `categories` | array | No | Categories for organizing the contact. |
| `contact_id` | string | Yes | Unique identifier of the contact to update. |
| `department` | string | No | Contact's department. |
| `given_name` | string | No | Contact's given (first) name. |
| `home_phones` | array | No | Contact's home phone numbers. |
| `company_name` | string | No | Contact's company name. |
| `display_name` | string | No | Contact's full display name. |
| `home_address` | object | No | Contact's home address. |
| `mobile_phone` | string | No | Contact's mobile phone number. |
| `other_address` | object | No | Other addresses for the contact. |
| `personal_notes` | string | No | Personal notes about the contact. |
| `business_phones` | array | No | Contact's business phone numbers. |
| `email_addresses` | array | No | Contact's email addresses. |
| `office_location` | string | No | Contact's office location. |
| `business_address` | object | No | Contact's business address. |
| `contact_folder_id` | string | Yes | Unique identifier of the contact folder containing the contact. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update email message

**Slug:** `OUTLOOK_UPDATE_EMAIL`

Updates specified properties of an existing email message; `message_id` must identify a valid message within the specified `user_id`'s mailbox.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `From` | object | No | Recipient with email address for input requests. |
| `body` | object | No | New body content (Text or HTML). If omitted, the existing message body remains unchanged. Must be a dict with both `contentType` ('Text' or 'HTML') and `content` keys set together; omitting `contentType` defaults to plain text and will not render HTML markup. |
| `flag` | object | No | Represents the flag value for a message (input). |
| `sender` | object | No | Recipient with email address for input requests. |
| `is_read` | boolean | No | Mark message as read (True) or unread (False). If omitted, read status remains unchanged. |
| `subject` | string | No | New subject line. If omitted, the existing subject remains unchanged. Provide empty string to clear the subject. |
| `user_id` | string | No | The UPN (User Principal Name) of the user whose mailbox contains the message, or 'me' for the currently authenticated user. This determines whose message is updated. |
| `reply_to` | array | No | Email addresses to use when replying. Updatable only if isDraft = true. |
| `categories` | array | No | Categories associated with the message. Provides a list of category labels (e.g., 'Follow Up', 'Customer'). |
| `importance` | string | No | New importance level ('low', 'normal', 'high'). If omitted, the existing importance level remains unchanged. |
| `message_id` | string | Yes | The unique identifier of the email message to be updated. This ID is typically obtained from listing messages or creating/sending a message. URL-encoded IDs are automatically decoded before use. |
| `cc_recipients` | array | No | List of CC recipients; replaces all existing CCs. Omitting this field preserves existing CC recipients. Provide an empty list to clear all CC recipients. |
| `to_recipients` | array | No | List of TO recipients; replaces all existing TOs. Omitting this field preserves existing TO recipients. Provide an empty list to clear all TO recipients. |
| `bcc_recipients` | array | No | List of BCC recipients; replaces all existing BCCs. Omitting this field preserves existing BCC recipients. Provide an empty list to clear all BCC recipients. |
| `internet_message_id` | string | No | The message ID in the format specified by RFC2822. Updatable only if isDraft = true. |
| `inference_classification` | string | No | Classification of the message for the user based on inferred relevance or importance. Possible values: 'focused' or 'other'. |
| `is_read_receipt_requested` | boolean | No | Indicates whether a read receipt is requested for the message. |
| `is_delivery_receipt_requested` | boolean | No | Indicates whether a delivery receipt is requested for the message. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Email Rule

**Slug:** `OUTLOOK_UPDATE_EMAIL_RULE`

Update an existing email rule

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ruleId` | string | Yes | ID of the email rule to update. |
| `actions` | object | No | Updated actions to take when the rule conditions are met. |
| `user_id` | string | No | User ID or principal name for app-only (S2S) authentication. Required for application permissions. Use the user's GUID or email address (e.g., '43f0c14d-bca8-421f-b762-c3d8dd75be1f' or 'user@domain.com'). |
| `sequence` | integer | No | Updated order in which the rule is executed (lower numbers execute first). Changing this value shifts the relative order of all other rules; review existing rule sequences before updating. |
| `isEnabled` | boolean | No | Whether the rule should be enabled or disabled. |
| `conditions` | object | No | Updated conditions that must be met for the rule to apply. |
| `displayName` | string | No | Updated display name for the email rule. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update event extension

**Slug:** `OUTLOOK_UPDATE_EVENT_EXTENSION`

Tool to update an open extension on a calendar event in Microsoft Graph. Use when you need to modify custom properties stored in an event extension.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user identifier for the calendar owner. Must be either 'me' (for the authenticated user), a Microsoft 365 User Principal Name (e.g., user@contoso.com), or an Azure AD object ID (GUID). |
| `event_id` | string | Yes | The unique identifier of the calendar event containing the extension to update. |
| `calendar_id` | string | Yes | The unique identifier of the calendar containing the event. |
| `extension_id` | string | Yes | The unique identifier of the extension to update. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.TestExtension) or just the extension name (e.g., Com.Contoso.TestExtension). |
| `extension_name` | string | Yes | The name of the extension. Must match the format: 'Com.Company.ExtensionName'. |
| `custom_properties` | object | No | Custom properties to update in the extension. Each property can be a string, number, or boolean value. If not provided, only the extension name will be updated. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update event extension in calendar group

**Slug:** `OUTLOOK_UPDATE_EVENT_EXTENSION_IN_CALENDAR_GROUP`

Tool to update an open extension on a calendar event within a calendar group. Use when modifying custom properties stored in an event extension for events in calendar groups.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The unique identifier (GUID) or email address of the user whose calendar event extension to update. Required for app-only (S2S) authentication. If not provided, uses the authenticated user context (/me endpoint). |
| `event_id` | string | Yes | The unique identifier of the calendar event containing the extension to update. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `extension_id` | string | Yes | The unique identifier of the extension to update. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.TestExtension) or just the extension name (e.g., Com.Contoso.TestExtension). |
| `extension_name` | string | Yes | The name of the extension. Must match the format: 'Com.Company.ExtensionName'. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group containing the calendar. |
| `custom_properties` | object | No | Custom properties to update in the extension. Each property can be a string, number, or boolean value. If not provided, only the extension name will be updated. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Inference Classification

**Slug:** `OUTLOOK_UPDATE_INFERENCE_CLASSIFICATION`

Tool to update the inferenceClassification resource for a user. Use when needing to refresh or sync the Focused Inbox classification settings. Note: The inferenceClassification resource has no writable properties; actual message classification rules are managed through the overrides collection.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's identifier. Use 'me' for the signed-in user, or provide the user's ID or principal name. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update mailbox settings

**Slug:** `OUTLOOK_UPDATE_MAILBOX_SETTINGS`

Tool to update mailbox settings for the signed-in user. Use when you need to configure automatic replies, default time zone, language, or working hours. Example: schedule automatic replies for vacation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |
| `language` | object | No | Locale preferences for date/time formatting. |
| `timeZone` | string | No | Default mailbox time zone (e.g., 'Pacific Standard Time'). |
| `workingHours` | object | No | Working hours configuration for the user. |
| `automaticRepliesSetting` | object | No | Configuration for automatic replies. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update mail folder

**Slug:** `OUTLOOK_UPDATE_MAIL_FOLDER`

Tool to update the display name of a mail folder. Use when you need to rename an existing mail folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | Identifier for the user whose mailbox contains the folder. Use 'me' for the authenticated user or provide the user's principal name or ID. |
| `display_name` | string | Yes | The new display name for the mail folder. |
| `mail_folder_id` | string | Yes | The unique identifier of the mail folder to update. This ID can be obtained from listing mail folders or creating a mail folder. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update master category

**Slug:** `OUTLOOK_UPDATE_MASTER_CATEGORY`

Tool to update the color of a category in the user's master category list. Use when you need to change the color of an existing category. Note that the display name cannot be modified after creation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `color` | string ("none" | "preset0" | "preset1" | "preset2" | "preset3" | "preset4" | "preset5" | "preset6" | "preset7" | "preset8" | "preset9" | "preset10" | "preset11" | "preset12" | "preset13" | "preset14" | "preset15" | "preset16" | "preset17" | "preset18" | "preset19" | "preset20" | "preset21" | "preset22" | "preset23" | "preset24") | Yes | A pre-set color constant for the category. This is the only writable property - displayName cannot be modified after creation. Allowed values: none, preset0 through preset24. |
| `user_id` | string | No | The user's unique identifier or principal name. Use 'me' for the signed-in user. |
| `category_id` | string | Yes | The unique identifier of the outlookCategory to update. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update contact extension

**Slug:** `OUTLOOK_UPDATE_ME_CONTACTS_EXTENSIONS`

Tool to update an open extension on a contact in a contact folder. Use when you need to modify custom properties stored in a contact extension.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's identifier; 'me' for the signed-in user, or user's principal name/ID. |
| `contact_id` | string | Yes | The unique identifier of the contact to which the extension belongs. |
| `extension_id` | string | Yes | The unique identifier of the extension to update. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.ContactData) or just the extension name (e.g., Com.Contoso.ContactData). |
| `extension_name` | string | Yes | The name of the extension. Must match the format: 'Com.Company.ExtensionName'. |
| `contact_folder_id` | string | Yes | The unique identifier of the contact folder containing the contact. |
| `custom_properties` | object | No | Custom properties to update or add to the extension. Each property can be a string, number, or boolean value. If not provided, only the extension name will be updated. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update To Do task

**Slug:** `OUTLOOK_UPDATE_TODO_TASK`

Tool to update an existing task in Microsoft To Do. Use when modifying a task's title, status, importance, due date, reminder, body, or categories. Only the fields you provide will be changed.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `body` | object | No | Updated description or notes for the task. Provide both contentType ('text' or 'html') and content fields. |
| `title` | string | No | The new title of the task. |
| `status` | string | No | The updated status of the task. Allowed values: 'notStarted', 'inProgress', 'completed', 'waitingOnOthers', 'deferred'. |
| `task_id` | string | Yes | The unique identifier of the task to update. Obtain this from List To Do tasks or Create To Do task. |
| `user_id` | string | No | User ID or userPrincipalName. Use 'me' for the signed-in user (delegated auth) or a specific user ID for app-only (S2S) authentication. |
| `categories` | array | No | Updated list of category labels for the task. |
| `importance` | string | No | The importance level of the task. Allowed values: 'low', 'normal', 'high'. |
| `dueDateTime` | object | No | The updated due date and time. Provide both dateTime (ISO 8601) and timeZone. |
| `reminderDateTime` | object | No | The updated reminder date and time. Setting this will also enable the reminder. |
| `completedDateTime` | object | No | The date and time the task was completed. Typically set alongside status='completed'. |
| `todo_task_list_id` | string | Yes | The unique identifier of the task list that contains the task. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user calendar

**Slug:** `OUTLOOK_UPDATE_USER_CALENDAR`

Tool to update the properties of a user's calendar. Use when you need to rename a calendar or change its color theme for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | The new display name for the calendar. Note: The default calendar cannot be renamed in some configurations. |
| `color` | string ("auto" | "lightBlue" | "lightGreen" | "lightOrange" | "lightGray" | "lightYellow" | "lightTeal" | "lightPink" | "lightBrown" | "lightRed" | "maxColor") | No | Color theme options for calendars in Outlook. |
| `user_id` | string | Yes | The user ID or userPrincipalName of the user whose calendar to update. Use 'me' for the authenticated user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user calendar event

**Slug:** `OUTLOOK_UPDATE_USER_CALENDAR_CALENDAR_EVENT`

Deprecated: Use OUTLOOK_UPDATE_CALENDAR_EVENT_IN_CALENDAR instead, which supports both /me and /users/{user_id} endpoints and additional fields (is_all_day, importance, sensitivity, reminders).

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `end` | object | No | Date, time, and timezone information. |
| `body` | object | No | Message content associated with the event. |
| `start` | object | No | Date, time, and timezone information. |
| `showAs` | string | No | Status to show: free, tentative, busy, oof, workingElsewhere, unknown. |
| `subject` | string | No | Subject/title of the event. |
| `user_id` | string | Yes | The unique identifier or userPrincipalName of the user whose calendar contains the event to update. |
| `event_id` | string | Yes | The unique identifier of the event to update. |
| `isAllDay` | boolean | No | Set to true if the event lasts all day. |
| `location` | object | No | Location information for an event. |
| `attendees` | array | No | Array of attendee objects with email addresses and types. |
| `categories` | array | No | Categories associated with the event. |
| `importance` | string | No | The importance of the event: low, normal, or high. |
| `recurrence` | object | No | Recurrence pattern for recurring events. |
| `calendar_id` | string | Yes | The unique identifier of the calendar containing the event. |
| `sensitivity` | string | No | Sensitivity level: normal, personal, private, confidential. |
| `isReminderOn` | boolean | No | Set to true if an alert reminds the user of the event. |
| `isOnlineMeeting` | boolean | No | True if event has online meeting information. |
| `reminderMinutesBeforeStart` | integer | No | Minutes before event start when reminder alert occurs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user calendar event

**Slug:** `OUTLOOK_UPDATE_USER_CALENDAR_EVENT`

Tool to update an event in a specific user's calendar. Use when you need to modify calendar event properties for a user other than the signed-in user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `end` | object | No | Date, time, and timezone information. |
| `body` | object | No | Message content associated with the event. |
| `start` | object | No | Date, time, and timezone information. |
| `showAs` | string | No | Status to show: free, tentative, busy, oof, workingElsewhere, unknown. |
| `subject` | string | No | Subject/title of the event. |
| `user_id` | string | Yes | The unique identifier or userPrincipalName of the user whose calendar event to update. |
| `event_id` | string | Yes | The unique identifier of the event to update. |
| `isAllDay` | boolean | No | Set to true if the event lasts all day. |
| `location` | object | No | Location information for an event. |
| `attendees` | array | No | Array of attendee objects with email addresses and types. |
| `categories` | array | No | Categories associated with the event. |
| `importance` | string | No | The importance of the event: low, normal, or high. |
| `recurrence` | object | No | Recurrence pattern for recurring events. |
| `sensitivity` | string | No | Sensitivity level: normal, personal, private, confidential. |
| `isReminderOn` | boolean | No | Set to true if an alert reminds the user of the event. |
| `isOnlineMeeting` | boolean | No | True if event has online meeting information. |
| `reminderMinutesBeforeStart` | integer | No | Minutes before event start when reminder alert occurs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user calendar permission

**Slug:** `OUTLOOK_UPDATE_USER_CALENDAR_PERMISSION`

Tool to update calendar permission levels for a specific user's calendar. Use when you need to change the access level (role) for someone who has been granted access to a user's calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string ("none" | "freeBusyRead" | "limitedRead" | "read" | "write") | Yes | The permission level to change to for the calendar share recipient or delegate. Possible values: none (remove access), freeBusyRead (view free/busy status only), limitedRead (view free/busy status, titles and locations), read (view all details except private events), write (view all details except private events and edit events). |
| `user_id` | string | Yes | The user ID or principal name of the user whose calendar permission to update. Use 'me' for the authenticated user or provide a specific user ID/UPN. |
| `calendar_id` | string | No | The unique identifier of the calendar. If not provided, defaults to the user's primary calendar. |
| `permission_id` | string | Yes | The unique identifier of the calendar permission to update. This ID can be obtained from listing calendar permissions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user calendar by ID

**Slug:** `OUTLOOK_UPDATE_USER_CALENDARS`

Tool to update properties of a specific calendar by ID for a specific user. Use when you need to rename a user's calendar, change its color theme, or set it as the default calendar.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | The new display name for the calendar. Provide this to rename the calendar. |
| `color` | string ("auto" | "lightBlue" | "lightGreen" | "lightOrange" | "lightGray" | "lightYellow" | "lightTeal" | "lightPink" | "lightBrown" | "lightRed" | "maxColor") | No | Color theme options for calendars in Outlook. |
| `user_id` | string | Yes | The user ID or userPrincipalName of the user whose calendar to update. Use 'me' for the authenticated user. |
| `calendar_id` | string | Yes | The unique identifier of the calendar to update. This is the calendar ID returned when listing calendars. |
| `isDefaultCalendar` | boolean | No | Set to true to make this calendar the user's default calendar, false otherwise. The default calendar is where new events are created by default. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user child folder message

**Slug:** `OUTLOOK_UPDATE_USER_CHILD_FOLDER_MESSAGE`

Tool to update a message in a child folder within a user's mailbox. Use when you need to modify message properties such as isRead status, importance, categories, or subject for messages in nested folder structures for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `body` | object | No | The body of the message. |
| `flag` | object | No | The flag value that indicates the status, start date, due date, or completion date for the message. |
| `from` | object | No | Represents information about a user in the sending or receiving end of a message. |
| `isRead` | boolean | No | Whether the message has been read. |
| `sender` | object | No | Represents information about a user in the sending or receiving end of a message. |
| `replyTo` | array | No | The email addresses to use when replying. Only updatable if isDraft=true. |
| `subject` | string | No | The subject of the message. |
| `user_id` | string | Yes | The unique identifier of the user whose mailbox contains the message. |
| `categories` | array | No | The categories associated with the message. |
| `importance` | string ("low" | "normal" | "high") | No | Importance level of the message. |
| `message_id` | string | Yes | The unique identifier of the message to update. |
| `ccRecipients` | array | No | The Cc recipients for the message. |
| `toRecipients` | array | No | The To recipients for the message. |
| `bccRecipients` | array | No | The Bcc recipients for the message. |
| `mail_folder_id` | string | Yes | The unique identifier of the parent mail folder containing the child folder. |
| `child_folder_id` | string | Yes | The unique identifier of the child folder containing the message to update. |
| `internetMessageId` | string | No | The message ID in RFC2822 format. Only updatable if isDraft=true. |
| `isReadReceiptRequested` | boolean | No | Whether a read receipt is requested for the message. |
| `inferenceClassification` | string ("focused" | "other") | No | Classification of the message based on inferred relevance or importance. |
| `isDeliveryReceiptRequested` | boolean | No | Whether a delivery receipt is requested for the message. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user contact extension

**Slug:** `OUTLOOK_UPDATE_USER_CONTACT_EXTENSION`

Tool to update an open extension on a contact in a user's contact folder. Use when you need to modify custom properties stored in a contact extension for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. Can be user ID or userPrincipalName. |
| `contact_id` | string | Yes | The unique identifier of the contact. |
| `extension_id` | string | Yes | The unique identifier of the extension. Can be extension name (e.g., 'Com.Contoso.Referral') or fully qualified name (e.g., 'Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.Referral'). |
| `extension_name` | string | Yes | The name of the extension. Must match the format: 'Com.Company.ExtensionName'. |
| `contact_folder_id` | string | Yes | The unique identifier of the contact folder containing the contact. |
| `custom_properties` | object | No | Custom properties to update in the extension. Each property can be a string, number, or boolean value. For M365 resources like contacts, only specified properties are updated (unspecified ones remain unchanged). If not provided, only the extension name will be updated. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user contact extension

**Slug:** `OUTLOOK_UPDATE_USER_CONTACTS_EXTENSIONS`

Tool to update an open extension on a contact in a user's contact folder. Use when you need to modify custom properties stored in a contact extension for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. Can be 'me' for the authenticated user, the user's email address, or the user's object ID. |
| `contact_id` | string | Yes | The unique identifier of the contact to which the extension belongs. |
| `extension_id` | string | Yes | The unique identifier of the extension to update. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.ContactData) or just the extension name (e.g., Com.Contoso.ContactData). |
| `extension_name` | string | Yes | The name of the extension. Must match the format: 'Com.Company.ExtensionName'. |
| `child_folder_id` | string | Yes | The unique identifier of the child folder within the contact folder. |
| `contact_folder_id` | string | Yes | The unique identifier of the contact folder containing the contact. |
| `custom_properties` | object | No | Custom properties to update or add to the extension. Each property can be a string, number, or boolean value. If not provided, only the extension name will be updated. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user contact extension (v3)

**Slug:** `OUTLOOK_UPDATE_USER_CONTACTS_EXTENSIONS_DIRECT`

Tool to update an open extension on a contact directly under a user's contacts collection. Use when you need to modify custom properties stored in a contact extension.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The unique identifier of the user. Can be 'me' for the authenticated user, the user's email address, or the user's object ID. |
| `contact_id` | string | Yes | The unique identifier of the contact to which the extension belongs. |
| `extension-id` | string | Yes | The unique identifier of the extension to update. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.TestExtension) or just the extension name (e.g., Com.Contoso.TestExtension). |
| `extension_name` | string | Yes | The name of the extension. Must match the format: 'Com.Company.ExtensionName'. |
| `custom_properties` | object | No | Custom properties to update or add to the extension. Each property can be a string, number, or boolean value. If not provided, only the extension name will be updated. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user event extension

**Slug:** `OUTLOOK_UPDATE_USER_EVENT_EXTENSION`

Deprecated: Use OUTLOOK_UPDATE_EVENT_EXTENSION_IN_CALENDAR_GROUP instead, which supports both /me and /users/{user_id} endpoints and uses the correct @odata.type prefix.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user whose calendar event contains the extension to update. Can be the user's principal name (email address) or object ID. |
| `event_id` | string | Yes | The unique identifier of the calendar event containing the extension to update. |
| `calendar_id` | string | Yes | The unique identifier of the calendar within the calendar group. |
| `extension_id` | string | Yes | The unique identifier of the extension to update. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.TestExtension) or just the extension name (e.g., Com.Contoso.TestExtension). |
| `extension_name` | string | Yes | The name of the extension. Must match the format: 'Com.Company.ExtensionName'. |
| `calendar_group_id` | string | Yes | The unique identifier of the calendar group containing the calendar. |
| `custom_properties` | object | No | Custom properties to update in the extension. Each property can be a string, number, or boolean value. If not provided, only the extension name will be updated. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user events extensions

**Slug:** `OUTLOOK_UPDATE_USER_EVENTS_EXTENSIONS`

Tool to update an open extension on a user's calendar event. Use when modifying custom properties stored in an event extension for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user whose event extension should be updated. Can be the user's principal name (email address), object ID, or 'me' for the authenticated user. |
| `event_id` | string | Yes | The unique identifier of the calendar event containing the extension to update. |
| `extension_id` | string | Yes | The unique identifier of the extension to update. Can be the full extension ID (e.g., Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.TestExtension) or just the extension name (e.g., Com.Contoso.TestExtension). |
| `extension_name` | string | Yes | The name of the extension. Must match the format: 'Com.Company.ExtensionName'. |
| `custom_properties` | object | No | Custom properties to update in the extension. Each property can be a string, number, or boolean value. If not provided, only the extension name will be updated. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update User Inference Classification Override

**Slug:** `OUTLOOK_UPDATE_USER_INFERENCE_CLASSIFICATION_OVERRIDE`

Tool to update the classification of messages from a specific sender in a user's Focused Inbox. Use when you need to change whether messages from a sender go to Focused or Other inbox for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The user ID or 'me' for the authenticated user |
| `classifyAs` | string ("focused" | "other") | Yes | Specifies how incoming messages from a specific sender should always be classified. Use 'focused' to prioritize messages in the Focused inbox, or 'other' to send them to the Other inbox. |
| `override_id` | string | Yes | The unique identifier of the inference classification override to update |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user mail folder message

**Slug:** `OUTLOOK_UPDATE_USER_MAIL_FOLDER_MESSAGE`

Tool to update properties of a message in a specific mail folder for a user. Use when you need to modify message attributes like categories, read status, importance, or other properties for a message within a particular user's folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `body` | object | No | The body of the message. |
| `flag` | object | No | The flag value that indicates the status, start date, due date, or completion date for the message. |
| `from` | object | No | Represents information about a user in the sending or receiving end of a message. |
| `isRead` | boolean | No | Whether the message has been read. |
| `sender` | object | No | Represents information about a user in the sending or receiving end of a message. |
| `replyTo` | array | No | The email addresses to use when replying. Only updatable if isDraft=true. |
| `subject` | string | No | The subject of the message. Only updatable if isDraft=true. |
| `user_id` | string | Yes | The unique identifier of the user whose mailbox contains the message. Use 'me' for the authenticated user or a specific user ID. |
| `categories` | array | No | The categories associated with the message. Use this to organize and filter messages. |
| `importance` | string ("low" | "normal" | "high") | No | Importance level of the message. |
| `message_id` | string | Yes | The unique identifier of the message to update within the specified mail folder. |
| `ccRecipients` | array | No | The Cc recipients for the message. |
| `toRecipients` | array | No | The To recipients for the message. |
| `bccRecipients` | array | No | The Bcc recipients for the message. |
| `mail_folder_id` | string | Yes | The unique identifier of the mail folder containing the message. Use 'inbox', 'drafts', 'sentitems', or a custom folder ID. |
| `internetMessageId` | string | No | The message ID in RFC2822 format. Only updatable if isDraft=true. |
| `isReadReceiptRequested` | boolean | No | Whether a read receipt is requested for the message. |
| `inferenceClassification` | string ("focused" | "other") | No | Classification of the message based on inferred relevance or importance. |
| `isDeliveryReceiptRequested` | boolean | No | Whether a delivery receipt is requested for the message. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user message extension

**Slug:** `OUTLOOK_UPDATE_USER_MAIL_FOLDER_MESSAGE_EXTENSION`

Tool to update an open extension on a message within a specific user's mail folder. Use when you need to modify custom properties stored in a message extension for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user or 'me' for the authenticated user. Can be a user principal name (UPN) or user ID. |
| `message_id` | string | Yes | The unique identifier of the message containing the extension to update. |
| `extension_id` | string | Yes | The unique identifier or name of the extension to update. Can be the full extension ID (e.g., 'Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.TestExtension') or just the extension name (e.g., 'Com.Contoso.TestExtension'). |
| `extension_name` | string | No | The name of the extension. If provided, it will update the extension name. Must follow the format 'Com.Company.ExtensionName'. |
| `mail_folder_id` | string | Yes | The unique identifier of the mail folder containing the message. Can be a well-known folder name (e.g., 'inbox', 'drafts', 'sentitems') or a folder ID. |
| `custom_properties` | object | No | Custom properties to update in the extension. Each property can be a string, number, or boolean value. If not provided, only the extension name (if specified) will be updated. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user mail folder message rule

**Slug:** `OUTLOOK_UPDATE_USER_MAIL_FOLDER_MESSAGE_RULE`

Tool to update a message rule in a user's mail folder. Use when you need to modify an existing rule's properties, conditions, actions, or exceptions for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `actions` | object | No | Updated actions to take when the rule conditions are met. |
| `rule_id` | string | Yes | The ID of the message rule to update. |
| `user_id` | string | No | User's identifier; 'me' for the signed-in user, or user's principal name/ID. |
| `sequence` | integer | No | Updated order in which the rule is executed (lower numbers execute first). |
| `conditions` | object | No | Updated conditions that must be met for the rule to apply. |
| `exceptions` | object | No | Updated exception conditions for the rule. |
| `is_enabled` | boolean | No | Whether the rule should be enabled or disabled. |
| `display_name` | string | No | Updated display name for the message rule. |
| `mail_folder_id` | string | Yes | The ID of the mail folder containing the message rule. Can be a well-known folder name (e.g., 'inbox', 'drafts', 'sentitems') or a folder ID. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user mail folder child folder

**Slug:** `OUTLOOK_UPDATE_USER_MAIL_FOLDERS_CHILD_FOLDERS`

Tool to update a child folder within a mail folder for a specific user. Use when you need to rename a child mail folder.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user. Use 'me' for the authenticated user or the user's ID/userPrincipalName. |
| `displayName` | string | No | The mailFolder's display name to update. |
| `mail_folder_id` | string | Yes | The unique identifier of the parent mail folder. |
| `child_folder_id` | string | Yes | The unique identifier of the child folder to update. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update user message extension

**Slug:** `OUTLOOK_UPDATE_USER_MESSAGE_EXTENSION`

Tool to update an open extension on a user's message. Use when you need to modify custom properties stored in a message extension for a specific user.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user or 'me' for the authenticated user. Can be a user principal name (UPN) or user ID. |
| `message_id` | string | Yes | The unique identifier of the message containing the extension to update. |
| `extension_id` | string | Yes | The unique identifier or name of the extension to update. Can be the full extension ID (e.g., 'Microsoft.OutlookServices.OpenTypeExtension.Com.Contoso.TestExtension') or just the extension name (e.g., 'Com.Contoso.TestExtension'). |
| `extension_name` | string | No | The name of the extension. If provided, it will update the extension name. Must follow the format 'Com.Company.ExtensionName'. |
| `custom_properties` | object | No | Custom properties to update in the extension. Each property can be a string, number, or boolean value. If not provided, only the extension name (if specified) will be updated. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |


## Triggers

### New Contact Added

**Slug:** `OUTLOOK_CONTACT_TRIGGER`

**Type:** webhook

Triggered when a new contact is added in the Outlook contacts.

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event_type` | string | Yes | Type of event |
| `id` | string | Yes | The unique identifier for the message |

### Calendar Event Changes

**Slug:** `OUTLOOK_EVENT_CHANGE_TRIGGER`

**Type:** webhook

Triggered when a new calendar event occurs (created, updated, or deleted) in the Outlook calendar.

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event_type` | string | Yes | Type of event |
| `id` | string | Yes | The unique identifier for the message |

### New Calendar Event

**Slug:** `OUTLOOK_EVENT_TRIGGER`

**Type:** webhook

Triggered when a new calendar event is created in the Outlook calendar.

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event_type` | string | Yes | Type of event |
| `id` | string | Yes | The unique identifier for the message |

### New Outlook Message

**Slug:** `OUTLOOK_MESSAGE_TRIGGER`

**Type:** webhook

Triggered when a new message is received in the Outlook mailbox.

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event_type` | string | Yes | Type of event |
| `id` | string | Yes | The unique identifier for the message |

### New Sent Message

**Slug:** `OUTLOOK_SENT_MESSAGE_TRIGGER`

**Type:** webhook

Triggered when a new message is sent from the Outlook mailbox.

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event_type` | string | Yes | Type of event |
| `id` | string | Yes | The unique identifier for the message |
