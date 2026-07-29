# Gmail

Gmail is Google’s email service, featuring spam protection, search functions, and seamless integration with other G Suite apps for productivity

- **Category:** email
- **Auth:** OAUTH2
- **Composio Managed App Available?** Yes
- **Tools:** 63
- **Triggers:** 2
- **Slug:** `GMAIL`
- **Version:** 20260721_00

## Frequently Asked Questions

### How do I set up custom Google OAuth credentials for Gmail?

For a step-by-step guide on creating and configuring your own Google OAuth credentials with Composio, see [How to create OAuth2 credentials for Google Apps](https://composio.dev/auth/googleapps).

### Why am I seeing "App is blocked" when connecting Gmail?

The OAuth client is requesting scopes that Google hasn't verified for that client. This usually happens when you add extra scopes beyond the defaults.

Remove the additional scopes from your auth config, or create your own OAuth app and submit the scopes for verification. See [How to create OAuth2 credentials for Google Apps](https://composio.dev/auth/googleapps).

### Why am I getting "Gmail API has not been used in project" error?

When using custom OAuth credentials, the Gmail API must be enabled in the Google Cloud project that owns those credentials. Enable it in Google Cloud Console under APIs & Services, wait a few minutes, and retry.

### Why am I getting "Error 400: invalid_scope"?

The requested scopes are invalid or incorrectly formatted in the authorization URL. Verify your scope values against the [Google OAuth scopes docs](https://developers.google.com/identity/protocols/oauth2). If you're creating auth configs programmatically, see the [programmatic auth config guide](/docs/programmatic-auth-configs).

### Why does the OAuth consent screen show "Composio" instead of my app?

By default, the consent screen uses Composio's OAuth app. To show your own app name and logo, create your own OAuth app and set a custom redirect URL. See [White-labeling authentication](/docs/white-labeling-authentication#using-your-own-oauth-apps).

### Why am I getting 401 errors on tool calls?

The user's access token is no longer valid. Common causes: the user revoked access, changed their password or 2FA, a Workspace admin policy changed, or Google's refresh token limit (~50 per account) was exceeded. Re-authenticating the user typically resolves this.

### Why is my Gmail trigger slow?

Gmail triggers poll roughly every minute by default. If you need lower latency, consider using webhooks or Google Pub/Sub integrations.

### Why am I getting "Quota Exhausted" or "rate limit exhausted"?

Google enforces per-minute and daily request quotas. If you're using Composio's default OAuth app, you share that quota with other users, which can cause limits to be hit faster. Use your own OAuth app credentials to get a dedicated quota, and add exponential backoff and retries to handle transient rate limits.

### How do I send an email with an attachment?

When using the Composio SDK, pass a local file path or a public URL directly as a string to the `attachment` field. The SDK's auto-upload feature (enabled by default) handles uploading the file and converting it to the required format. You do not need to construct the `{ s3key, name, mimetype }` object manually.

```python
result = composio.tools.execute(
    slug="GMAIL_SEND_EMAIL",
    user_id="user-123",
    arguments={
        "recipient_email": "recipient@example.com",
        "subject": "Report attached",
        "body": "See attached.",
        "attachment": "https://example.com/report.pdf",
    },
)
```

This approach works for any tool whose parameters accept file uploads. See [Automatic File Handling](/docs/tools-direct/executing-tools#automatic-file-handling) for more details.

### Why can Gmail filter setup show an app-blocked error?

If a user on Composio-managed Gmail auth hits Google's "app is blocked" / unverified-app screen after adding `gmail.settings.basic`, use your own Google OAuth app verified for `https://www.googleapis.com/auth/gmail.settings.basic`, then reconnect.

### When should I avoid `gmail.metadata` when fetching full Gmail email content?

Use `https://www.googleapis.com/auth/gmail.metadata` only when the app needs message metadata such as labels and headers, not message bodies or payload content. Gmail treats `gmail.metadata` as a restricted metadata-only scope, and it is not compatible with broader content-access scopes such as `gmail.readonly`, `gmail.modify`, or `mail.google.com` in the same OAuth request.

If a tool needs full email content, remove `gmail.metadata` from the auth config and request a Gmail scope that allows message content access. Then reconnect the account so the new scope set is granted.

## Tools

### Modify email labels

**Slug:** `GMAIL_ADD_LABEL_TO_EMAIL`

Adds and/or removes specified Gmail labels for a message; ensure `message_id` and all `label_ids` are valid (use 'listLabels' for custom label IDs).

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address or 'me' for the authenticated user. |
| `message_id` | string | Yes | Immutable ID of the message to modify. Gmail message IDs are hexadecimal strings (e.g., '1a2b3c4d5e6f7890'). IMPORTANT: Do NOT use UUIDs (32-character strings like '093ca4662b214d5eba8f4ceeaad63433'), thread IDs, or internal system IDs - these will cause 'Invalid id value' errors. Obtain valid message IDs from: (1) 'GMAIL_FETCH_EMAILS' response 'messageId' field, (2) 'GMAIL_FETCH_MESSAGE_BY_THREAD_ID' response, or (3) 'GMAIL_LIST_THREADS' and then fetching thread messages. |
| `add_label_ids` | array | No | Label IDs to add (IDs, not display names). System labels: INBOX, SPAM, TRASH, UNREAD, STARRED, IMPORTANT, CATEGORY_PERSONAL, CATEGORY_SOCIAL, CATEGORY_PROMOTIONS, CATEGORY_UPDATES, CATEGORY_FORUMS. Use full CATEGORY_ prefix (e.g., 'CATEGORY_UPDATES' not 'UPDATES'). Custom labels: call 'listLabels' first to get the ID (format: 'Label_<number>'). Do NOT use the label display name; the API requires the ID. SENT, DRAFT, CHAT are immutable and cannot be added or removed. A label cannot appear in both add_label_ids and remove_label_ids. |
| `remove_label_ids` | array | No | Label IDs to remove (IDs, not display names). System labels: INBOX, SPAM, TRASH, UNREAD, STARRED, IMPORTANT, CATEGORY_PERSONAL, CATEGORY_SOCIAL, CATEGORY_PROMOTIONS, CATEGORY_UPDATES, CATEGORY_FORUMS. Use full CATEGORY_ prefix (e.g., 'CATEGORY_UPDATES' not 'UPDATES'). Custom labels: call 'listLabels' first to get the ID (format: 'Label_<number>'). SENT, DRAFT, CHAT are immutable and cannot be removed. Common operations: to mark as read, remove 'UNREAD'; to archive, remove 'INBOX'. A label cannot appear in both add_label_ids and remove_label_ids. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Batch delete Gmail messages

**Slug:** `GMAIL_BATCH_DELETE_MESSAGES`

Tool to permanently delete multiple Gmail messages in bulk, bypassing Trash with no recovery possible. Use when you need to efficiently remove large numbers of emails (e.g., retention enforcement, mailbox hygiene). Use GMAIL_MOVE_TO_TRASH instead when reversibility may be needed. Always obtain explicit user confirmation and verify a sample of message IDs before executing. High-volume calls may trigger 429 rateLimitExceeded or 403 userRateLimitExceeded errors; apply exponential backoff.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | No | User's email address or 'me' for the authenticated user. |
| `messageIds` | array | Yes | List of Gmail message IDs to delete. Each ID must be a hexadecimal string (e.g., '18c5f5d1a2b3c4d5'). Obtain IDs from actions like GMAIL_FETCH_EMAILS or GMAIL_LIST_THREADS - do not use human-readable descriptions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Batch modify Gmail messages

**Slug:** `GMAIL_BATCH_MODIFY_MESSAGES`

Modify labels on multiple Gmail messages in one efficient API call. Supports up to 1,000 messages per request for bulk operations like archiving, marking as read/unread, or applying custom labels. High-volume calls may return 429 rateLimitExceeded or 403 userRateLimitExceeded; apply exponential backoff.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | No | User's email address or 'me' for the authenticated user. |
| `messageIds` | array | Yes | List of message IDs to modify. Maximum 1,000 message IDs per request. Get message IDs from GMAIL_FETCH_EMAILS or GMAIL_LIST_THREADS actions. Accepts 'messageIds', 'ids', or 'message_ids' as the parameter name. |
| `addLabelIds` | array | No | List of label IDs to add to the messages. IMPORTANT: Use label IDs, NOT label display names. System labels use their name as ID: INBOX, STARRED, IMPORTANT, SENT, DRAFT, SPAM, TRASH, UNREAD, CATEGORY_PERSONAL, CATEGORY_SOCIAL, CATEGORY_PROMOTIONS, CATEGORY_UPDATES, CATEGORY_FORUMS. Custom labels MUST use their ID (format: 'Label_XXX', e.g., 'Label_1', 'Label_25'), NOT the display name (e.g., do NOT use 'Work' or 'Projects'). Call GMAIL_LIST_LABELS first to get the 'id' field for custom labels. At least one of add_label_ids or remove_label_ids must be provided. CONSTRAINT: Label IDs must NOT overlap with remove_label_ids - cannot add and remove the same label. |
| `removeLabelIds` | array | No | List of label IDs to remove from the messages. IMPORTANT: Use label IDs, NOT label display names. System labels use their name as ID: INBOX, STARRED, IMPORTANT, SENT, SPAM, TRASH, UNREAD. Custom labels MUST use their ID (format: 'Label_XXX', e.g., 'Label_1', 'Label_25'), NOT the display name (e.g., do NOT use 'Work' or 'Projects'). Call GMAIL_LIST_LABELS first to get the 'id' field for custom labels. Common use cases: Remove 'UNREAD' to mark as read, remove 'INBOX' to archive. Note: 'DRAFT' cannot be removed - use GMAIL_DELETE_DRAFT instead. At least one of add_label_ids or remove_label_ids must be provided. CONSTRAINT: Label IDs must NOT overlap with add_label_ids - cannot add and remove the same label. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create email draft

**Slug:** `GMAIL_CREATE_EMAIL_DRAFT`

Creates a Gmail email draft. While all fields are optional per the Gmail API, practical validation requires at least one of recipient_email, cc, or bcc and at least one of subject or body. Supports To/Cc/Bcc recipients, subject, plain/HTML body (ensure `is_html=True` for HTML), attachments, and threading. Returns a draft_id that must be used as-is with GMAIL_SEND_DRAFT — synthetic or stale IDs will fail. When creating a draft reply to an existing thread (thread_id provided), leave subject empty to stay in the same thread; setting a subject will create a NEW thread instead. HTTP 429 may occur on rapid creation/send sequences; apply exponential backoff.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cc` | array | No | Carbon Copy (CC) recipients' email addresses. Each must be a valid email address (e.g., 'user@example.com') or display name format (e.g., 'John Doe <user@example.com>'). Plain names without email addresses are NOT valid. Optional for drafts (recipients can be added later before sending). |
| `bcc` | array | No | Blind Carbon Copy (BCC) recipients' email addresses. Each must be a valid email address (e.g., 'user@example.com') or display name format (e.g., 'Bob Jones <user@example.com>'). Plain names without email addresses are NOT valid. Optional for drafts (recipients can be added later before sending). |
| `body` | string | No | Email body content (plain text or HTML); `is_html` must be True if HTML. Optional - drafts can be created without a body and edited later before sending. Can also be provided as 'message_body'. |
| `is_html` | boolean | No | Set to True if `body` is already formatted HTML. When False, plain text newlines are auto-converted to <br/> tags. Both modes result in HTML email; this flag controls whether the body content is treated as raw HTML or plain text that gets HTML formatting applied. |
| `subject` | string | No | Email subject line. Optional - drafts can be created without a subject and edited later before sending. When creating a draft reply to an existing thread (thread_id provided), leave this empty to stay in the same thread. Setting a subject will create a NEW thread instead. |
| `user_id` | string | No | User's email address or 'me' for the authenticated user. |
| `thread_id` | string | No | ID of an existing Gmail thread to reply to; omit for new thread. If the thread ID is invalid or inaccessible, the draft will be created as a new thread instead of failing. |
| `attachment` | string | No | File(s) to attach to the email. Accepts a single file or a list of files. Total message size including base64-encoded attachments must be under 25 MB; use shareable links (e.g., Google Drive) for larger files. |
| `recipient_email` | string | No | Primary recipient's email address. Must be a valid email address (e.g., 'user@example.com') or display name format (e.g., 'John Doe <user@example.com>'). A plain name without an email address (e.g., 'John Doe') is NOT valid - the '@' symbol and domain are required. Optional for drafts (recipients can be added later before sending). Use extra_recipients if you want to send to multiple recipients. |
| `extra_recipients` | array | No | Additional 'To' recipients' email addresses (not Cc or Bcc). Each must be a valid email address (e.g., 'user@example.com'), display name format (e.g., 'Jane Doe <user@example.com>'), or 'me' for the authenticated user. Plain names without email addresses are NOT valid. Should only be used if recipient_email is also provided. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Gmail filter

**Slug:** `GMAIL_CREATE_FILTER`

Tool to create a new Gmail filter with specified criteria and actions. Use when the user wants to automatically organize incoming messages based on sender, subject, size, or other criteria. Note: you can only create a maximum of 1,000 filters per account.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | object | Yes | REQUIRED. Action that the filter will perform on messages matching the criteria. At least one action field must be specified. |
| `user_id` | string | No | The user's email address or the special value 'me' to indicate the authenticated user for whom the filter will be created. |
| `criteria` | object | Yes | REQUIRED. Message matching criteria that determines which messages the filter will apply to. At least one criteria field must be specified. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create label

**Slug:** `GMAIL_CREATE_LABEL`

Creates a new label with a unique name in the specified user's Gmail account. Returns a labelId (e.g., 'Label_123') required for downstream tools like GMAIL_ADD_LABEL_TO_EMAIL, GMAIL_BATCH_MODIFY_MESSAGES, and GMAIL_MODIFY_THREAD_LABELS — those tools do not accept display names.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The email address of the user in whose account the label will be created. |
| `label_name` | string | Yes | REQUIRED. The name for the new label. Must be unique within the account, non-blank, maximum length 225 characters, cannot contain commas (','), not only whitespace, and must not be a reserved system label. Reserved English system labels include: Inbox, Starred, Important, Sent, Draft, Drafts, Spam, Trash, etc. Forward slashes ('/') are allowed and used to create hierarchical nested labels (e.g., 'Work/Projects', 'Personal/Finance'). When creating nested labels, any missing parent labels will be automatically created (similar to 'mkdir -p'). Periods ('.') are allowed and commonly used for numbering schemes (e.g., '1. Action Items', '2. Projects'). Note: 'name' is also accepted as an alias for this field. If a label with this name already exists, returns a 409 conflict; use GMAIL_LIST_LABELS to check existing labels and reuse the existing labelId, or use GMAIL_PATCH_LABEL to update it. |
| `text_color` | string ("#000000" | "#434343" | "#666666" | "#999999" | "#cccccc" | "#efefef" | "#f3f3f3" | "#ffffff" | "#fb4c2f" | "#ffad47" | "#fad165" | "#16a766" | "#43d692" | "#4a86e8" | "#a479e2" | "#f691b3" | "#f6c5be" | "#ffe6c7" | "#fef1d1" | "#b9e4d0" | "#c6f3de" | "#c9daf8" | "#e4d7f5" | "#fcdee8" | "#efa093" | "#ffd6a2" | "#fce8b3" | "#89d3b2" | "#a0eac9" | "#a4c2f4" | "#d0bcf1" | "#fbc8d9" | "#e66550" | "#ffbc6b" | "#fcda83" | "#44b984" | "#68dfa9" | "#6d9eeb" | "#b694e8" | "#f7a7c0" | "#cc3a21" | "#eaa041" | "#f2c960" | "#149e60" | "#3dc789" | "#3c78d8" | "#8e63ce" | "#e07798" | "#ac2b16" | "#cf8933" | "#d5ae49" | "#0b804b" | "#2a9c68" | "#285bac" | "#653e9b" | "#b65775" | "#464646" | "#e7e7e7" | "#0d3472" | "#b6cff5" | "#0d3b44" | "#98d7e4" | "#3d188e" | "#e3d7ff" | "#711a36" | "#fbd3e0" | "#8a1c0a" | "#f2b2a8" | "#7a2e0b" | "#ffc8af" | "#7a4706" | "#ffdeb5" | "#594c05" | "#fbe983" | "#684e07" | "#fdedc1" | "#0b4f30" | "#b3efd3" | "#04502e" | "#a2dcc1" | "#c2c2c2" | "#4986e7" | "#2da2bb" | "#b99aff" | "#994a64" | "#f691b2" | "#ff7537" | "#ffad46" | "#662e37" | "#cca6ac" | "#094228" | "#42d692" | "#076239" | "#16a765" | "#1a764d" | "#1c4587" | "#41236d" | "#822111" | "#83334c" | "#a46a21" | "#aa8831" | "#ebdbde") | No | Text color for the label. Gmail only accepts colors from a predefined palette of 102 specific hex values. Common color names like 'YELLOW', 'RED', 'BLUE', 'GREEN', 'ORANGE', 'PURPLE', 'PINK' are automatically mapped to the closest Gmail palette color. Provide either a common color name, a Gmail palette color name (e.g., 'BLACK', 'ROYAL_BLUE'), or exact hex value (e.g., '#000000', '#4a86e8'). If only text_color is provided without background_color, a complementary background color (white or black) will be auto-selected for optimal contrast. Full palette: https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.labels#Color Must be supplied together with background_color — providing only one will cause a 400 error. The auto-selected complementary color behavior does not apply; both colors are required. |
| `background_color` | string ("#000000" | "#434343" | "#666666" | "#999999" | "#cccccc" | "#efefef" | "#f3f3f3" | "#ffffff" | "#fb4c2f" | "#ffad47" | "#fad165" | "#16a766" | "#43d692" | "#4a86e8" | "#a479e2" | "#f691b3" | "#f6c5be" | "#ffe6c7" | "#fef1d1" | "#b9e4d0" | "#c6f3de" | "#c9daf8" | "#e4d7f5" | "#fcdee8" | "#efa093" | "#ffd6a2" | "#fce8b3" | "#89d3b2" | "#a0eac9" | "#a4c2f4" | "#d0bcf1" | "#fbc8d9" | "#e66550" | "#ffbc6b" | "#fcda83" | "#44b984" | "#68dfa9" | "#6d9eeb" | "#b694e8" | "#f7a7c0" | "#cc3a21" | "#eaa041" | "#f2c960" | "#149e60" | "#3dc789" | "#3c78d8" | "#8e63ce" | "#e07798" | "#ac2b16" | "#cf8933" | "#d5ae49" | "#0b804b" | "#2a9c68" | "#285bac" | "#653e9b" | "#b65775" | "#464646" | "#e7e7e7" | "#0d3472" | "#b6cff5" | "#0d3b44" | "#98d7e4" | "#3d188e" | "#e3d7ff" | "#711a36" | "#fbd3e0" | "#8a1c0a" | "#f2b2a8" | "#7a2e0b" | "#ffc8af" | "#7a4706" | "#ffdeb5" | "#594c05" | "#fbe983" | "#684e07" | "#fdedc1" | "#0b4f30" | "#b3efd3" | "#04502e" | "#a2dcc1" | "#c2c2c2" | "#4986e7" | "#2da2bb" | "#b99aff" | "#994a64" | "#f691b2" | "#ff7537" | "#ffad46" | "#662e37" | "#cca6ac" | "#094228" | "#42d692" | "#076239" | "#16a765" | "#1a764d" | "#1c4587" | "#41236d" | "#822111" | "#83334c" | "#a46a21" | "#aa8831" | "#ebdbde") | No | Background color for the label. Gmail only accepts colors from a predefined palette of 102 specific hex values. Common color names like 'YELLOW', 'RED', 'BLUE', 'GREEN', 'ORANGE', 'PURPLE', 'PINK' are automatically mapped to the closest Gmail palette color. Provide either a common color name, a Gmail palette color name (e.g., 'ROYAL_BLUE', 'CARIBBEAN_GREEN'), or exact hex value (e.g., '#4a86e8', '#43d692'). If only background_color is provided without text_color, a complementary text color (white or black) will be auto-selected for optimal contrast. Full palette: https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.labels#Color Must be supplied together with text_color — providing only one will cause a 400 error. The auto-selected complementary color behavior does not apply; both colors are required. |
| `label_list_visibility` | string ("labelShow" | "labelShowIfUnread" | "labelHide") | No | Controls how the label is displayed in the label list in the Gmail sidebar. Valid values: 'labelShow' (always show), 'labelShowIfUnread' (show only if unread messages), 'labelHide' (hide from list). |
| `message_list_visibility` | string ("show" | "hide") | No | Controls how messages with this label are displayed in the message list. Valid values: 'show' or 'hide'. Note: These values are different from label_list_visibility - do NOT use 'labelShow' or 'labelHide' here. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Prompt Post

**Slug:** `GMAIL_CREATE_PROMPT_POST`

Send a one-shot prompt to the Sanity Content Agent. Stateless one-shot prompt endpoint. No thread management or message persistence. Ideal for simple, single-turn interactions. Use when you need to send a single prompt and receive a response without maintaining conversation context.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `config` | object | No | Agent configuration. Controls behavior, capabilities, and document access. |
| `format` | string ("markdown" | "directives") | No | Controls how directives in the response are formatted. |
| `message` | string | Yes | The prompt message to send to the agent |
| `instructions` | string | No | Custom instructions for the agent |
| `organizationId` | string | Yes | Your Sanity organization ID |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Draft

**Slug:** `GMAIL_DELETE_DRAFT`

Permanently deletes a specific Gmail draft using its ID with no recovery possible; verify the correct `draft_id` and obtain explicit user confirmation before calling. Ensure the draft exists and the user has necessary permissions for the given `user_id`.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address or 'me' for the authenticated user; 'me' is recommended. |
| `draft_id` | string | Yes | Immutable ID of the draft to delete. Must be obtained from GMAIL_LIST_DRAFTS or GMAIL_CREATE_EMAIL_DRAFT actions. Draft IDs typically have an 'r' prefix (e.g., 'r-1234567890' or 'r1234567890'). Draft IDs differ from message IDs used in GMAIL_BATCH_DELETE_MESSAGES — do not interchange. When multiple similar drafts exist, confirm the exact ID via GMAIL_LIST_DRAFTS before deleting. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Gmail filter

**Slug:** `GMAIL_DELETE_FILTER`

Tool to permanently delete a Gmail filter by its ID. Use when you need to remove an existing email filtering rule.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address or 'me' for the authenticated user. |
| `filter_id` | string | Yes | The ID of the filter to be deleted. Filter IDs can be obtained from GMAIL_LIST_FILTERS action. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete label from account (permanent)

**Slug:** `GMAIL_DELETE_LABEL`

Permanently DELETES a user-created Gmail label from the account (not from a message). WARNING: This action DELETES the label definition itself, removing it from all messages. System labels (INBOX, SENT, UNREAD, etc.) cannot be deleted. To add/remove labels from specific messages, use GMAIL_ADD_LABEL_TO_EMAIL action instead.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address or 'me' for the authenticated user. |
| `label_id` | string | Yes | ID of the user-created label to be permanently DELETED from the account. Must be a custom label ID (format: 'Label_<id>' e.g., 'Label_1', 'Label_42'). System labels (INBOX, SENT, DRAFT, UNREAD, STARRED, IMPORTANT, SPAM, TRASH, CATEGORY_*, etc.) cannot be deleted. WARNING: This action permanently DELETES the label definition from your account - it does NOT remove a label from a message. To add/remove labels from messages, use GMAIL_ADD_LABEL_TO_EMAIL instead. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete message

**Slug:** `GMAIL_DELETE_MESSAGE`

Permanently deletes a specific email message by its ID from a Gmail mailbox; for `user_id`, use 'me' for the authenticated user or an email address to which the authenticated user has delegated access.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address. The special value 'me' refers to the authenticated user. |
| `message_id` | string | Yes | Identifier of the email message to delete. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete thread

**Slug:** `GMAIL_DELETE_THREAD`

Tool to immediately and permanently delete a specified thread and all its messages. This operation cannot be undone. Use threads.trash instead for reversible deletion.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | ID of the Thread to delete. |
| `user_id` | string | No | User's email address. The special value 'me' refers to the authenticated user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Fetch emails

**Slug:** `GMAIL_FETCH_EMAILS`

Fetches a list of email messages from a Gmail account, supporting filtering, pagination, and optional full content retrieval. Results are NOT sorted by recency; sort by internalDate client-side. The messages field may be absent or empty (valid no-results state); always null-check before accessing messageId or threadId. Null-check subject and header fields before string operations. For large result sets, prefer ids_only=true or metadata-only listing, then hydrate via GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | No | Gmail advanced search query (e.g., 'from:user subject:meeting'). Supported operators: 'from:', 'to:', 'subject:', 'label:', 'has:', 'is:', 'in:', 'category:', 'after:YYYY/MM/DD', 'before:YYYY/MM/DD', AND/OR/NOT. IMPORTANT - 'is:' vs 'label:' usage: Use 'is:' for special mail states: is:snoozed, is:unread, is:read, is:starred, is:important. Use 'label:' ONLY for user-created labels (e.g., 'label:work', 'label:projects'). Note: 'muted' may work with both 'is:muted' and 'label:muted' based on community reports. Common mistake: 'label:snoozed' is WRONG - use 'is:snoozed' instead. Use quotes for exact phrases. Omit for no query filter. after:/before: evaluate whole calendar days in UTC; before: is exclusive — adjust for local timezone to avoid off-by-one-day gaps. |
| `user_id` | string | No | User's email address or 'me' for the authenticated user. Non-'me' addresses require domain-level delegation; without it, authentication or not-found errors result. |
| `verbose` | boolean | No | If false, uses optimized concurrent metadata fetching for faster performance (~75% improvement). If true, uses standard detailed message fetching. When false, only essential fields (subject, sender, recipient, time, labels) are guaranteed. Body content and attachment details require verbose=true even when include_payload=true. |
| `ids_only` | boolean | No | If true, only returns message IDs from the list API without fetching individual message details. Fastest option for getting just message IDs and thread IDs. |
| `label_ids` | array | No | Filter by label IDs; only messages with all specified labels are returned (AND logic). Optional - omit or use empty list to fetch all messages without label filtering. System label IDs: 'INBOX', 'SPAM', 'TRASH', 'UNREAD', 'STARRED', 'IMPORTANT', 'CATEGORY_PRIMARY' (alias 'CATEGORY_PERSONAL'), 'CATEGORY_SOCIAL', 'CATEGORY_PROMOTIONS', 'CATEGORY_UPDATES', 'CATEGORY_FORUMS'. For custom/user-created labels, you MUST use the label ID (e.g., 'Label_123456'), NOT the display name. Use the 'listLabels' action to find label IDs for custom labels. Combining label_ids with label: in query applies AND logic across both, which can silently over-restrict results; use one strategy consistently. |
| `page_token` | string | No | Token for retrieving a specific page, obtained from a previous response's `nextPageToken`. Must be a valid opaque token string from a previous API response. Do not pass arbitrary values. Omit for the first page. Loop calls using nextPageToken until it is absent to avoid silently missing messages. resultSizeEstimate is approximate — do not use as a stopping condition. |
| `max_results` | integer | No | Maximum number of messages to retrieve per page. Default of 1 retrieves only a single message; set higher for practical use. Hard cap is 500 per page. |
| `include_payload` | boolean | No | Set to true to include full message payload (headers, body, attachments); false for metadata only. payload may still be null even when true; use GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID for guaranteed complete content. When payload is present, bodies are base64url-encoded in payload.parts; replace '-'→'+' and '_'→'/' and fix padding before decoding, and check both text/plain and text/html parts. |
| `include_spam_trash` | boolean | No | Set to true to include messages from 'SPAM' and 'TRASH'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Fetch message by message ID

**Slug:** `GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID`

Fetches a specific email message by its ID, provided the `message_id` exists and is accessible to the authenticated `user_id`. Spam/trash messages are excluded unless upstream list/search calls used `include_spam_trash=true`. Use `internalDate` (milliseconds since epoch) rather than header `Date` for recency checks.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | No | Format for message content. 'minimal': lightest (ID, thread ID, labels only). 'metadata': headers and message metadata without body content - ideal for summarization, analysis, or when you only need subject/sender/timestamp (recommended for most use cases). 'full': complete MIME structure with 50+ headers, nested parts, and base64url-encoded body data - heavy payload, only use when you need the complete raw MIME structure for parsing attachments or body content. 'raw': entire RFC 2822 formatted message as base64url string. |
| `user_id` | string | No | User's email address or 'me' for the authenticated user. |
| `message_id` | string | Yes | The Gmail API message ID (hexadecimal string, typically 15-16 characters like '19b11732c1b578fd'). Must be obtained from Gmail API responses (e.g., List Messages, Search Messages). Do NOT use email subjects, dates, sender names, or custom identifiers. Do NOT use `threadId` (use GMAIL_FETCH_MESSAGE_BY_THREAD_ID for threads), the Message-ID email header, or any fabricated value — only IDs from Gmail API list/search responses. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Fetch Message by Thread ID

**Slug:** `GMAIL_FETCH_MESSAGE_BY_THREAD_ID`

Retrieves messages from a Gmail thread using its `thread_id`, where the thread must be accessible by the specified `user_id`. Returns a `messages` array; `thread_id` is not echoed in the response. Message order is not guaranteed — sort by `internalDate` to find oldest/newest. Check `labelIds` per message to filter drafts. Concurrent bulk calls may trigger 403 `userRateLimitExceeded` or 429; cap concurrency ~10 and use exponential backoff.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The email address of the user. |
| `thread_id` | string | Yes | Hexadecimal thread ID from Gmail API (e.g., '19bf77729bcb3a44'). Obtain from GMAIL_LIST_THREADS or GMAIL_FETCH_EMAILS. Prefixes like 'msg-f:' or 'thread-f:' are auto-stripped. Legacy Gmail web UI IDs (e.g., 'FMfcgzQfBZdVqKZcSVBhqwWLKWCtDdWQ') are NOT supported - use the API thread ID instead. Deduplicate thread_ids before calling when multiple listed messages share the same threadId to avoid redundant calls. |
| `page_token` | string | No | Opaque page token for fetching a specific page of messages if results are paginated. Iterate calls by passing the returned `nextPageToken` until it is absent; stopping early will miss messages in long threads. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Forward email message

**Slug:** `GMAIL_FORWARD_MESSAGE`

Forward an existing Gmail message to specified recipients, preserving original body and attachments. Verify recipients and content before forwarding to avoid unintended exposure. Bulk forwarding may trigger 429/5xx rate limits; keep concurrency to 5–10 and apply backoff. Messages near Gmail's size limits may fail; reconstruct a smaller draft if needed.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cc` | array | No | List of email addresses to CC. |
| `bcc` | array | No | List of email addresses to BCC. |
| `user_id` | string | No | User's email address or 'me' for the authenticated user. |
| `message_id` | string | Yes | Gmail message ID (hexadecimal string, e.g., '17f45ec49a9c3f1b'). Must contain only hex characters [0-9a-fA-F]. Obtain this from actions like 'List Messages' or 'Fetch Emails'. |
| `recipients` | array | Yes | List of email addresses to forward the message to. |
| `additional_text` | string | No | Optional additional text to include before the forwarded content. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Gmail attachment

**Slug:** `GMAIL_GET_ATTACHMENT`

Retrieves a specific attachment by ID from a message in a user's Gmail mailbox, requiring valid message and attachment IDs. Returns the downloaded file with its MIME type and filename. Attachments exceeding ~25 MB may be exposed as Google Drive links — use GOOGLEDRIVE_DOWNLOAD_FILE when a Drive file_id is present instead.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address ('me' for authenticated user). |
| `file_name` | string | Yes | Desired filename for the downloaded attachment. This is a required string field - do not pass null. |
| `message_id` | string | Yes | Immutable ID of the message containing the attachment. This is a required string field - do not pass null. Obtain the message_id from Gmail API responses (e.g., fetchEmails, listThreads). |
| `attachment_id` | string | Yes | The internal Gmail attachment ID (NOT the filename). This is a system-generated token string like 'ANGjdJ8s...'. Obtain this ID from the 'attachmentId' field in the 'attachmentList' array returned by fetchEmails or fetchMessageByMessageId actions. Do NOT pass the filename (e.g., 'report.pdf'). Requires a fully hydrated message payload: call GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID with format='full' to obtain valid attachment IDs — lightweight fetch modes may omit attachmentList entirely. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Auto-Forwarding Settings

**Slug:** `GMAIL_GET_AUTO_FORWARDING`

Tool to get the auto-forwarding setting for the specified account. Use when you need to retrieve the current auto-forwarding configuration including enabled status, forwarding email address, and message disposition.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address. The special value 'me' can be used to indicate the authenticated user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get contacts

**Slug:** `GMAIL_GET_CONTACTS`

Fetches contacts (connections) for the authenticated Google account, allowing selection of specific data fields and pagination. Only covers saved contacts and 'Other Contacts'; email-header-only senders are out of scope. Contact records may have sparse data — handle missing fields gracefully. People API shares a per-user QPS quota; HTTP 429 requires exponential backoff (1s, 2s, 4s).

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_token` | string | No | Token to retrieve a specific page of results, obtained from 'nextPageToken' in a previous response. Repeat calls with each successive `nextPageToken` until it is absent — stopping early silently omits contacts. |
| `person_fields` | string | No | Comma-separated person fields to retrieve for each contact (e.g., 'names,emailAddresses'). |
| `resource_name` | string | No | Identifier for the person resource whose connections are listed; use 'people/me' for the authenticated user. |
| `include_other_contacts` | boolean | No | Include 'Other Contacts' (interacted with but not explicitly saved) in addition to regular contacts. WARNING: 'Other Contacts' often have incomplete data - they may lack names, phone numbers, and other fields even when requested. These auto-generated contacts are created from email interactions and typically only have email addresses. Set to False if you need contacts with complete name information. When True, each contact will have a 'contactSource' field indicating its origin. When True, `person_fields` is restricted to `emailAddresses`, `names`, `phoneNumbers`, and `metadata` only — requesting other fields (e.g., `organizations`, `birthdays`) causes validation errors or silent omissions. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Draft

**Slug:** `GMAIL_GET_DRAFT`

Retrieves a single Gmail draft by its ID. Use this to fetch and inspect draft content before sending via GMAIL_SEND_DRAFT. The format parameter controls the level of detail returned.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | No | Format for the draft message: 'minimal' (ID/labels only), 'full' (complete data with parsed payload), 'raw' (base64url-encoded RFC 2822 format), 'metadata' (ID/labels/headers only). |
| `user_id` | string | No | The user's email address. The special value `me` can be used to indicate the authenticated user. |
| `draft_id` | string | Yes | The ID of the draft to retrieve. Draft IDs are typically alphanumeric strings (e.g., 'r99885592323229922'). Use GMAIL_LIST_DRAFTS to retrieve valid draft IDs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Gmail filter

**Slug:** `GMAIL_GET_FILTER`

Tool to retrieve a specific Gmail filter by its ID. Use when you need to inspect the criteria and actions of an existing filter.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The ID of the filter to be fetched. |
| `user_id` | string | No | The user's email address or the special value 'me' to indicate the authenticated user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get label details

**Slug:** `GMAIL_GET_LABEL`

Gets details for a specified Gmail label. Use this to retrieve label information including name, type, visibility settings, message/thread counts, and color.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The ID of the label to retrieve. Can be a system label (e.g., INBOX, SENT, DRAFT, UNREAD, STARRED, SPAM, TRASH) or a user-created label ID (e.g., Label_1, Label_42). |
| `user_id` | string | No | The user's email address. The special value 'me' can be used to indicate the authenticated user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Language Settings

**Slug:** `GMAIL_GET_LANGUAGE_SETTINGS`

Tool to retrieve the language settings for a Gmail user. Use when you need to determine the display language preference for the authenticated user or a specific Gmail account.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The email address of the Gmail user whose language settings are to be retrieved, or the special value 'me' to indicate the currently authenticated user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get People

**Slug:** `GMAIL_GET_PEOPLE`

Retrieves either a specific person's details (using `resource_name`) or lists 'Other Contacts' (if `other_contacts` is true), with `person_fields` specifying the data to return. Scope is limited to the authenticated user's own contacts and 'Other Contacts' history only.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sources` | array | No | Source types to include when retrieving other contacts. READ_SOURCE_TYPE_CONTACT supports basic fields (emailAddresses, metadata, names, phoneNumbers, photos). READ_SOURCE_TYPE_PROFILE supports extended fields (birthdays, genders, organizations, etc.) but requires READ_SOURCE_TYPE_CONTACT to also be included. Applicable only when `other_contacts` is true. |
| `page_size` | integer | No | The number of 'Other Contacts' to return per page. Applicable only when `other_contacts` is true. |
| `page_token` | string | No | An opaque token from a previous response to retrieve the next page of 'Other Contacts' results. Applicable only when `other_contacts` is true and paginating. |
| `sync_token` | string | No | A token from a previous 'Other Contacts' list call to retrieve only changes since the last sync; leave empty for an initial full sync. Applicable only when `other_contacts` is true. |
| `person_fields` | string | No | A comma-separated field mask to restrict which fields on the person (or persons) are returned. Consult the Google People API documentation for a comprehensive list of valid fields. Omitted fields are silently absent from the response — no error is raised. When `other_contacts` is true, only a restricted subset is valid (`emailAddresses`, `names`, `phoneNumbers`, `metadata`); extended fields like `organizations` or `birthdays` may cause validation errors or silent omissions in that mode. |
| `resource_name` | string | No | Resource name identifying the person for whom to retrieve information (like the authenticated user or a specific contact). Used only when `other_contacts` is false. Deleted or stale resource_names may return partial records with missing `emailAddresses`, `names`, or other fields. |
| `other_contacts` | boolean | No | If true, retrieves 'Other Contacts' (people interacted with but not explicitly saved), ignoring `resource_name` and enabling pagination/sync. If false, retrieves information for the single person specified by `resource_name`. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Profile

**Slug:** `GMAIL_GET_PROFILE`

Retrieves Gmail profile information (email address, aggregate messagesTotal/threadsTotal, historyId) for a user. messagesTotal counts individual emails; threadsTotal counts conversations; neither is per-label — use GMAIL_FETCH_EMAILS with label filters for label-specific counts. The returned historyId seeds incremental sync via GMAIL_LIST_HISTORY; if historyIdTooOld is returned, rescan with GMAIL_FETCH_EMAILS before resuming. Response may be wrapped under a top-level data field; unwrap before reading fields. A successful call confirms mailbox connectivity but not full mailbox access if granted scopes are narrow. Use the returned email address to dynamically identify the authenticated account rather than hard-coding it.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The email address of the Gmail user whose profile is to be retrieved, or the special value 'me' to indicate the currently authenticated user. Prefer 'me' unless explicitly targeting another account; passing a raw email address that does not match the connected account may fail or access the wrong mailbox. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Vacation Settings

**Slug:** `GMAIL_GET_VACATION_SETTINGS`

Tool to retrieve vacation responder settings for a Gmail user. Use when you need to check if out-of-office auto-replies are configured and view their content.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The email address of the Gmail user whose vacation settings are to be retrieved, or the special value 'me' to indicate the currently authenticated user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Import message

**Slug:** `GMAIL_IMPORT_MESSAGE`

Tool to import a message into the user's mailbox with standard email delivery scanning and classification. Use when you need to add an existing email to a Gmail account without sending it through SMTP. This method doesn't perform SPF checks, so it might not work for some spam messages.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `raw` | string | Yes | The entire email message in RFC 2822 format, base64url-encoded. This is the raw email message to import into the mailbox. |
| `deleted` | boolean | No | Mark the email as permanently deleted (not TRASH) and only visible in Google Vault to a Vault administrator. Only used for Google Workspace accounts. |
| `user_id` | string | No | The user's email address. The special value 'me' can be used to indicate the authenticated user. |
| `never_mark_spam` | boolean | No | Ignore the Gmail spam classifier decision and never mark this email as SPAM in the mailbox. |
| `internal_date_source` | string ("receivedTime" | "dateHeader") | No | Source for Gmail's internal date of the message. |
| `process_for_calendar` | boolean | No | Process calendar invites in the email and add any extracted meetings to the Google Calendar for this user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Insert message into mailbox

**Slug:** `GMAIL_INSERT_MESSAGE`

Tool to insert a message into the user's mailbox similar to IMAP APPEND. Use when you need to add an email directly to a mailbox bypassing most scanning and classification. This does not send a message.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `raw` | string | Yes | The entire email message in RFC 2822 formatted and base64url encoded string. This is the raw message content that will be inserted into the mailbox. |
| `deleted` | boolean | No | Mark the email as permanently deleted (not TRASH) and only visible in Google Vault to a Vault administrator. Only used for Google Workspace accounts. |
| `user_id` | string | No | The user's email address. The special value 'me' can be used to indicate the authenticated user. |
| `internalDateSource` | string ("receivedTime" | "dateHeader") | No | Source for Gmail's internal date of the message. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List CSE identities

**Slug:** `GMAIL_LIST_CSE_IDENTITIES`

Tool to list client-side encrypted identities for an authenticated user. Use when you need to retrieve CSE identity configurations including key pair associations.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The requester's primary email address. Use 'me' to indicate the authenticated user. |
| `page_size` | integer | No | The number of identities to return. If not provided, the page size will default to 20 entries. |
| `page_token` | string | No | Pagination token indicating which page of identities to return. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List CSE key pairs

**Slug:** `GMAIL_LIST_CSE_KEYPAIRS`

Tool to list client-side encryption key pairs for an authenticated user. Use when you need to retrieve CSE keypair configurations including public keys and enablement states. Supports pagination for large result sets.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The requester's primary email address. Use 'me' to indicate the authenticated user. |
| `page_size` | integer | No | The number of key pairs to return per page. If not provided, the page size will default to 20 entries. |
| `page_token` | string | No | Pagination token indicating which page of key pairs to return. Omit to return the first page. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Drafts

**Slug:** `GMAIL_LIST_DRAFTS`

Retrieves a paginated list of email drafts from a user's Gmail account. Use verbose=true to get full draft details including subject, body, sender, and timestamp. Draft ordering is non-guaranteed; iterate using page_token until it is absent to retrieve all drafts. Newly created drafts may not appear immediately. Rapid calls may trigger 403 userRateLimitExceeded or 429 errors; apply exponential backoff (1s, 2s, 4s) before retrying.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's mailbox ID; use 'me' for the authenticated user. |
| `verbose` | boolean | No | If true, fetches full draft details including subject, sender, recipient, body, and timestamp. If false, returns only draft IDs (faster). Increases response payload size; tune max_results accordingly. Use verbose=true before destructive operations to confirm draft identity by subject, recipient, and timestamp. |
| `page_token` | string | No | Token from a previous response to retrieve a specific page of drafts. Ordering is non-guaranteed; continue paginating until page_token is absent in the response to retrieve all drafts. |
| `max_results` | integer | No | Maximum number of drafts to return per page. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Gmail filters

**Slug:** `GMAIL_LIST_FILTERS`

Tool to list all Gmail filters (rules) in the mailbox. Use for security audits to detect malicious filter rules or before creating new filters to avoid duplicates.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address or the special value 'me' to indicate the authenticated user whose filters will be retrieved. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List forwarding addresses

**Slug:** `GMAIL_LIST_FORWARDING_ADDRESSES`

Tool to list all forwarding addresses for the specified Gmail account. Use when you need to retrieve the email addresses that are allowed to be used for forwarding messages.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address or the special value 'me' to indicate the authenticated user whose forwarding addresses will be retrieved. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Gmail history

**Slug:** `GMAIL_LIST_HISTORY`

Tool to list Gmail mailbox change history since a known startHistoryId. Use for incremental mailbox syncs. Persist the latest historyId as a checkpoint across sessions; without it, incremental sync is unreliable. An empty history list in the response is valid and means no new changes occurred.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address. Use 'me' to specify the authenticated user. |
| `label_id` | string | No | Only return history records involving messages with this label ID. |
| `page_token` | string | No | Token to retrieve a specific page of results. If the response includes nextPageToken, loop requests using this parameter until no nextPageToken is returned; failing to paginate will silently miss changes. |
| `max_results` | integer | No | Maximum number of history records to return. Default is 100; max is 500. |
| `history_types` | array | No | Filter by specific history types. Allowed values: messageAdded, messageDeleted, labelAdded, labelRemoved. |
| `start_history_id` | string | Yes | Required. Returns history records after this ID. If the ID is invalid or too old, the API returns 404. Perform a full sync in that case. Should be a numeric string. On 404 (historyIdTooOld) or 400 (invalidArgument), recover by fetching a fresh historyId via GMAIL_GET_PROFILE, then perform a one-time full sync via GMAIL_FETCH_EMAILS before resuming incremental calls. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Gmail labels

**Slug:** `GMAIL_LIST_LABELS`

Retrieves all system and user-created labels for a Gmail account in a single unpaginated response. Primary use: obtain internal label IDs (e.g., 'Label_123') required by other Gmail tools — display names cannot be used as label identifiers and cause silent failures or errors. System labels (INBOX, UNREAD, SPAM, TRASH, etc.) are case-sensitive and must be used exactly as returned; INBOX, SPAM, and TRASH are read-only and cannot be added/removed via label modification tools. The Gmail search 'label:' operator accepts display names, but label_ids parameters in tools like GMAIL_FETCH_EMAILS require internal IDs from this tool — mixing conventions yields zero results silently. Do not hardcode label IDs across sessions; refresh via this tool on conflict errors.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | Identifies the Gmail account (owner's email or 'me' for authenticated user) for which labels will be listed. |
| `include_details` | boolean | No | If true, fetches detailed info for each label including message/thread counts (messagesTotal, messagesUnread, threadsTotal, threadsUnread). This requires additional API calls and may be slower for accounts with many labels. If false (default), returns basic label info (id, name, type) which is faster. Counts are eventually consistent and may lag real-time mailbox state by a few seconds. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Gmail messages (Deprecated)

**Slug:** `GMAIL_LIST_MESSAGES`

DEPRECATED: Use GMAIL_FETCH_EMAILS instead. Lists the messages in the user's mailbox. Use when you need to retrieve a list of email messages with optional filtering by labels or search query.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | Only return messages matching the specified query. Supports the same query format as the Gmail search box. For example, 'from:someuser@example.com is:unread'. Cannot be used when accessing the API using the gmail.metadata scope. |
| `user_id` | string | No | The user's email address or 'me' to specify the authenticated user. |
| `label_ids` | array | No | Only return messages with labels that match all of the specified label IDs. Messages in a thread might have labels that other messages in the same thread don't have. |
| `page_token` | string | No | Page token to retrieve a specific page of results in the list. |
| `max_results` | integer | No | Maximum number of messages to return. Defaults to 100. The maximum allowed value is 500. |
| `include_spam_trash` | boolean | No | Include messages from SPAM and TRASH in the results. Default is false. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List send-as aliases

**Slug:** `GMAIL_LIST_SEND_AS`

Lists the send-as aliases for a Gmail account, including the primary address and custom 'from' aliases. Use when you need to retrieve available sending addresses for composing emails.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address or the special value 'me' to indicate the authenticated user whose send-as aliases will be retrieved. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List S/MIME configs

**Slug:** `GMAIL_LIST_SMIME_INFO`

Lists S/MIME configs for the specified send-as alias. Use when you need to retrieve all S/MIME certificate configurations associated with a specific send-as email address.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address. The special value 'me' can be used to indicate the authenticated user. |
| `send_as_email` | string | Yes | The email address that appears in the 'From:' header for mail sent using this alias. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List threads

**Slug:** `GMAIL_LIST_THREADS`

Retrieves a list of email threads from a Gmail account, identified by `user_id` (email address or 'me'), supporting filtering and pagination. Spam and trash are excluded by default unless explicitly targeted via `label:spam` or `label:trash` in the query.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | No | Filter for threads, using Gmail search query syntax (e.g., 'from:user@example.com is:unread'). Supported operators include `from:`, `to:`, `subject:`, `label:`, `is:unread`, `has:attachment`, `after:`, `before:`. Dates must use `YYYY/MM/DD` format; date operators are UTC-based. Exact subject phrases require quotes (e.g., `subject:'meeting notes'`). |
| `user_id` | string | No | The user's email address or 'me' to specify the authenticated Gmail account. |
| `verbose` | boolean | No | If false, returns threads with basic fields (id, snippet, historyId). If true, returns threads with complete message details including headers, body, attachments, and metadata for each message in the thread. Combining `verbose=true` with large `max_results` produces very large responses; keep `max_results` modest when verbose is enabled. |
| `page_token` | string | No | Token from a previous response to retrieve a specific page of results; omit for the first page. |
| `max_results` | integer | No | Maximum number of threads to return. Hard cap is ~500 per call. For full mailbox coverage, loop using `nextPageToken` via `page_token` until absent. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Modify thread labels

**Slug:** `GMAIL_MODIFY_THREAD_LABELS`

Adds or removes specified existing label IDs from a Gmail thread, affecting all its messages; ensure the thread ID is valid. To modify a single message only, use a message-level tool instead.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address or 'me' for the authenticated user. |
| `thread_id` | string | Yes | Immutable ID of the thread to modify. |
| `add_label_ids` | array | No | List of label IDs to add to the thread. Must be valid label IDs that exist in the user's account. System labels use uppercase names (e.g., 'INBOX', 'STARRED', 'IMPORTANT', 'UNREAD', 'SPAM', 'TRASH', 'SENT', 'DRAFT', 'CATEGORY_PERSONAL', 'CATEGORY_SOCIAL', 'CATEGORY_PROMOTIONS', 'CATEGORY_UPDATES', 'CATEGORY_FORUMS'). Custom labels use the format 'Label_N' (e.g., 'Label_1', 'Label_42'). Use GMAIL_LIST_LABELS to discover available label IDs. Accepts either a list or a JSON-encoded string. Note: If a label appears in both add_label_ids and remove_label_ids, the add operation takes priority. Use GMAIL_CREATE_LABEL first if the label does not yet exist, then supply its returned ID here. |
| `remove_label_ids` | array | No | List of label IDs to remove from the thread. Must be valid label IDs that exist in the user's account. System labels use uppercase names (e.g., 'INBOX', 'STARRED', 'IMPORTANT', 'UNREAD', 'SPAM', 'TRASH', 'SENT', 'DRAFT', 'CATEGORY_PERSONAL', 'CATEGORY_SOCIAL', 'CATEGORY_PROMOTIONS', 'CATEGORY_UPDATES', 'CATEGORY_FORUMS'). Custom labels use the format 'Label_N' (e.g., 'Label_1', 'Label_42'). Use GMAIL_LIST_LABELS to discover available label IDs. Accepts either a list or a JSON-encoded string. Note: Labels that appear in both add_label_ids and remove_label_ids will be automatically removed from this list (add takes priority). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Trash thread

**Slug:** `GMAIL_MOVE_THREAD_TO_TRASH`

Moves the specified thread to the trash. Any messages that belong to the thread are also moved to the trash.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address. The special value 'me' can be used to indicate the authenticated user. |
| `thread_id` | string | Yes | Required. The ID of the thread to trash. This moves all messages in the thread to trash. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Move to Trash

**Slug:** `GMAIL_MOVE_TO_TRASH`

Moves an existing, non-deleted email message to the trash for the specified user. Trashed messages are recoverable and still count toward storage quota until purged. Prefer this over GMAIL_BATCH_DELETE_MESSAGES when recovery may be needed. For bulk operations, use GMAIL_BATCH_MODIFY_MESSAGES or GMAIL_BATCH_DELETE_MESSAGES instead of repeated calls to this tool.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address or 'me' for the authenticated user. |
| `message_id` | string | Yes | Required. The unique identifier of the email message to move to trash. This is a hexadecimal string that can be obtained from listing or fetching emails. Verify the correct message via subject/snippet before trashing to avoid affecting unrelated conversations. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Patch Label

**Slug:** `GMAIL_PATCH_LABEL`

Patches the specified user-created label. System labels (e.g., INBOX, SENT, SPAM) cannot be modified and will be rejected.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The ID of the label to update. |
| `name` | string | No | The display name of the label. At least one of 'name', 'messageListVisibility', 'labelListVisibility', or 'color' must be provided. Must be non-empty, unique among user labels, and must not contain `,`, `/`, or `.`. |
| `color` | object | No | The color to assign to the label. Color is only available for labels that have their `type` set to `user`. At least one of 'name', 'messageListVisibility', 'labelListVisibility', or 'color' must be provided. Must include both `backgroundColor` and `textColor` subfields; both values must come from Gmail's predefined color palette — arbitrary hex values or omitting either field causes a 400 error. |
| `userId` | string | Yes | The user's email address. The special value `me` can be used to indicate the authenticated user. |
| `labelListVisibility` | string ("labelShow" | "labelShowIfUnread" | "labelHide") | No | The visibility of the label in the label list in the Gmail web interface. At least one of 'name', 'messageListVisibility', 'labelListVisibility', or 'color' must be provided. |
| `messageListVisibility` | string ("show" | "hide") | No | The visibility of messages with this label in the message list in the Gmail web interface. At least one of 'name', 'messageListVisibility', 'labelListVisibility', or 'color' must be provided. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Patch send-as alias

**Slug:** `GMAIL_PATCH_SEND_AS`

Tool to patch the specified send-as alias for a Gmail user. Use when you need to update properties of an existing send-as email address such as display name, reply-to address, signature, default status, or SMTP configuration.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address or the special value 'me' to indicate the authenticated user. |
| `smtp_msa` | object | No | Configuration for SMTP relay service. |
| `signature` | string | No | An optional HTML signature that is included in messages composed with this alias in the Gmail web UI. This signature is added to new emails only. |
| `is_default` | boolean | No | Whether this address is selected as the default 'From:' address in situations such as composing a new message or sending a vacation auto-reply. Setting this to true will make other send-as addresses non-default. Only true can be written to this field. |
| `display_name` | string | No | A name that appears in the 'From:' header for mail sent using this alias. For custom 'from' addresses, when empty, Gmail will populate the 'From:' header with the name used for the primary address. If the admin has disabled name updates, requests to update this field for the primary login will silently fail. |
| `send_as_email` | string | Yes | The send-as alias email address to update. This is the email address that appears in the 'From:' header. |
| `treat_as_alias` | boolean | No | Whether Gmail should treat this address as an alias for the user's primary email address. This setting only applies to custom 'from' aliases. |
| `reply_to_address` | string | No | An optional email address that is included in a 'Reply-To:' header for mail sent using this alias. If empty, Gmail will not generate a 'Reply-To:' header. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Remove label (Deprecated)

**Slug:** `GMAIL_REMOVE_LABEL`

DEPRECATED: Use GMAIL_DELETE_LABEL instead. Permanently deletes a specific, existing user-created Gmail label by its ID for a user; cannot delete system labels.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address or 'me' for the authenticated user. |
| `label_id` | string | Yes | ID of the user-created label to be permanently deleted; must exist and not be a system label. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Reply to email thread

**Slug:** `GMAIL_REPLY_TO_THREAD`

Sends a reply within a specific Gmail thread using the original thread's subject; do not provide a custom subject as it will start a new conversation instead of replying in-thread. Requires a valid `thread_id` and at least one of `recipient_email`, `cc`, or `bcc`. Supports optional file attachments.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cc` | array | No | Carbon Copy (CC) recipients' email addresses in format 'user@domain.com'. Each address must include both username and domain separated by '@'. At least one of cc, bcc, or recipient_email must be provided. |
| `bcc` | array | No | Blind Carbon Copy (BCC) recipients' email addresses in format 'user@domain.com'. Each address must include both username and domain separated by '@'. At least one of cc, bcc, or recipient_email must be provided. |
| `is_html` | boolean | No | Indicates if `message_body` is HTML; if True, body must be valid HTML, if False, body should not contain HTML tags. Mismatch causes recipients to see raw HTML tags as plain text. |
| `user_id` | string | No | Identifier for the user sending the reply; 'me' refers to the authenticated user. |
| `thread_id` | string | Yes | Identifier of the Gmail thread for the reply. Must be a valid hexadecimal string, typically 15-16 characters long (e.g., '169eefc8138e68ca'). Prefixes like 'msg-f:' or 'thread-f:' are automatically stripped. Note: Format validation only checks the ID structure; the thread must also exist and be accessible in your Gmail account. Use GMAIL_LIST_THREADS or GMAIL_FETCH_EMAILS to retrieve valid thread IDs. Must be a threadId, not a messageId; passing a messageId can cause the reply to fail or start an unintended new thread. |
| `attachment` | string | No | File(s) to attach to the reply. Accepts a single file or a list of files. Total message size including attachments must stay under 25 MB (400 badRequest if exceeded); use Drive links for large files. |
| `message_body` | string | No | Content of the reply message, either plain text or HTML. |
| `recipient_email` | string | No | Primary recipient's email address in format 'user@domain.com'. Must include both username and domain separated by '@'. Required if cc and bcc is not provided, else can be optional. Use extra_recipients if you want to send to multiple recipients. |
| `extra_recipients` | array | No | Additional 'To' recipients' email addresses in format 'user@domain.com' (not Cc or Bcc). Each address must include both username and domain separated by '@'. Should only be used if recipient_email is also provided. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Search People

**Slug:** `GMAIL_SEARCH_PEOPLE`

Searches contacts by matching the query against names, nicknames, emails, phone numbers, and organizations, optionally including 'Other Contacts'. Only searches the authenticated user's contact directory — people existing solely in message headers won't appear; use GMAIL_FETCH_EMAILS for those. Results may be zero or multiple; never auto-select from ambiguous results. Results paginate via next_page_token; follow until empty and deduplicate by email. Many records lack emailAddresses or names even when requested — handle missing keys. Directory/organization policies may suppress entries.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Matches contact names, nicknames, email addresses, phone numbers, and organization fields. |
| `page_size` | integer | No | Maximum results to return; values >30 are capped to 30 by the API. |
| `person_fields` | string | No | Comma-separated fields to return (e.g., 'names,emailAddresses'). When 'other_contacts' is true, only 'emailAddresses', 'metadata', 'names', 'phoneNumbers' are allowed. For full field access including 'organizations', set 'other_contacts' to false. |
| `other_contacts` | boolean | No | When True, searches both saved contacts and 'Other Contacts' (people you've interacted with but not explicitly saved). Note: This restricts person_fields to only 'emailAddresses', 'metadata', 'names', 'phoneNumbers'. When False, searches only saved contacts but allows all person_fields including 'organizations', 'addresses', etc. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Send Draft

**Slug:** `GMAIL_SEND_DRAFT`

Sends an existing draft email AS-IS to recipients already defined within the draft. IMPORTANT: This action does NOT accept recipient parameters (to, cc, bcc). The Gmail API's drafts/send endpoint sends drafts to whatever recipients are already set in the draft's To, Cc, and Bcc headers - it cannot add or override recipients. If the draft has no recipients, you must either: 1. Create a new draft with recipients using GMAIL_CREATE_EMAIL_DRAFT, then send it 2. Use GMAIL_SEND_EMAIL to send a new email directly with recipients. Send is immediate and irreversible — confirm recipients and content before calling. No scheduling support; trigger at the desired UTC time externally. Gmail enforces ~25 MB message size limit and daily send caps (~500 recipients/day personal, ~2,000/day Workspace).

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address. The special value `me` can be used to indicate the authenticated user. |
| `draft_id` | string | Yes | The ID of the draft to send. Draft IDs are typically alphanumeric strings (e.g., 'r99885592323229922'). Important: Do not confuse draft_id with message_id - they are different identifiers. Use GMAIL_LIST_DRAFTS to retrieve valid draft IDs, or GMAIL_CREATE_EMAIL_DRAFT to create a new draft and get its ID. IMPORTANT: The draft MUST already have recipients (To, Cc, or Bcc) set - this action cannot add or override recipients. If the draft has no recipients, first create a new draft with recipients using GMAIL_CREATE_EMAIL_DRAFT, or use GMAIL_SEND_EMAIL to send a new email directly. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Send Email

**Slug:** `GMAIL_SEND_EMAIL`

Sends an email via Gmail API using the authenticated user's Google profile display name. Sends immediately and is irreversible — confirm recipients, subject, body, and attachments before calling. At least one of 'to' (or 'recipient_email'), 'cc', or 'bcc' must be provided. At least one of subject or body must be provided. Requires `is_html=True` if the body contains HTML. All common file types including PNG, JPG, PDF, MP4, etc. are supported as attachments. Gmail API limits total message size to ~25 MB after base64 encoding. To reply in an existing thread, use GMAIL_REPLY_TO_THREAD instead. No scheduled send support; enforce timing externally.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cc` | array | No | Carbon Copy (CC) recipients' email addresses. At least one of 'to'/'recipient_email', 'cc', or 'bcc' must be provided. |
| `bcc` | array | No | Blind Carbon Copy (BCC) recipients' email addresses. At least one of 'to'/'recipient_email', 'cc', or 'bcc' must be provided. |
| `body` | string | No | Email content (plain text or HTML). Either subject or body must be provided for the email to be sent. If HTML, `is_html` must be `True`. |
| `is_html` | boolean | No | Set to `True` if the email body contains HTML tags. |
| `subject` | string | No | Subject line of the email. Either subject or body must be provided for the email to be sent. |
| `user_id` | string | No | User's email address; the literal 'me' refers to the authenticated user. |
| `attachment` | string | No | File(s) to attach. Accepts a single file or a list of files. IMPORTANT: mimetype MUST contain a '/' separator - single words like 'pdf' or 'new' are invalid. Gmail API limits: total message size must not exceed ~25 MB after base64 encoding. Omit or set to null for no attachment. Empty attachment objects (with all fields empty/whitespace) are treated as no attachment. |
| `from_email` | string | No | Sender email address for the 'From' header. Use this to send from a verified alias configured in Gmail's 'Send mail as' settings. When not provided, the authenticated user's primary email address is used. The alias must be verified in Gmail settings before use. |
| `recipient_email` | string | No | Primary recipient's email address. You can also use 'to' as an alias for this parameter. At least one of 'to'/'recipient_email', 'cc', or 'bcc' must be provided. Use extra_recipients if you want to send to multiple recipients. Use the special value 'me' to send to your own authenticated email address. Must be a full user@domain address; 'me' is not valid here and will fail. |
| `extra_recipients` | array | No | Additional 'To' recipients' email addresses (not Cc or Bcc). Should only be used if recipient_email is also provided. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get IMAP Settings

**Slug:** `GMAIL_SETTINGS_GET_IMAP`

Retrieves the IMAP settings for a Gmail user account, including whether IMAP is enabled, auto-expunge behavior, expunge behavior, and maximum folder size.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address or the special value 'me' to indicate the authenticated user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get POP settings

**Slug:** `GMAIL_SETTINGS_GET_POP`

Tool to retrieve POP settings for a Gmail account. Use when you need to check the current POP configuration including access window and message disposition.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address. The special value 'me' can be used to indicate the authenticated user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get send-as alias

**Slug:** `GMAIL_SETTINGS_SEND_AS_GET`

Tool to retrieve a specific send-as alias configuration for a Gmail user. Use when you need to get details about a send-as email address including display name, signature, SMTP settings, and verification status. Fails with HTTP 404 if the specified address is not a member of the send-as collection.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The email address of the Gmail user whose send-as alias to retrieve, or the special value 'me' to indicate the authenticated user. |
| `send_as_email` | string | Yes | The send-as alias email address to retrieve. This is the email address that appears in the 'From:' header. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Stop watch notifications

**Slug:** `GMAIL_STOP_WATCH`

Tool to stop receiving push notifications for a Gmail mailbox. Use when you need to disable watch notifications previously set up via the watch endpoint.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address. The special value 'me' can be used to indicate the authenticated user. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Untrash Message

**Slug:** `GMAIL_UNTRASH_MESSAGE`

Tool to remove a message from trash in Gmail. Use when you need to restore a previously trashed email message.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | User's email address or 'me' for the authenticated user. |
| `message_id` | string | Yes | Required. The unique identifier of the email message to remove from trash. This is a hexadecimal string that can be obtained from listing or fetching emails. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Untrash thread

**Slug:** `GMAIL_UNTRASH_THREAD`

Tool to remove a thread from trash in Gmail. Use when you need to restore a deleted thread and its messages.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address. The special value 'me' can be used to indicate the authenticated user. |
| `thread_id` | string | Yes | The ID of the thread to remove from trash. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update draft

**Slug:** `GMAIL_UPDATE_DRAFT`

Updates (replaces) an existing Gmail draft's content in-place by draft ID. This action replaces the entire draft content with the new message - it does not patch individual fields. All fields are optional; if not provided, you should provide complete draft content to avoid data loss.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cc` | array | No | Carbon Copy (CC) recipients' email addresses. Each must be a valid email address or display name format. |
| `bcc` | array | No | Blind Carbon Copy (BCC) recipients' email addresses. Each must be a valid email address or display name format. |
| `body` | string | No | Email body content (plain text or HTML); is_html must be True if HTML. If not provided, previous body is preserved. Can also be provided as 'message_body'. |
| `is_html` | boolean | No | Set to True if body is already formatted HTML. When False, plain text newlines are auto-converted to <br/> tags. |
| `subject` | string | No | Email subject line. If not provided, previous subject is preserved. |
| `user_id` | string | No | User's email address or 'me' for the authenticated user. |
| `draft_id` | string | Yes | The ID of the draft to update. Must be a valid draft ID from GMAIL_LIST_DRAFTS or GMAIL_CREATE_EMAIL_DRAFT. |
| `thread_id` | string | No | ID of an existing Gmail thread. If provided, the draft will be part of this thread. |
| `attachment` | string | No | File(s) to attach to the draft. Accepts a single file or a list of files. Replaces any existing attachments. |
| `recipient_email` | string | No | Primary recipient's email address. Must be a valid email address (e.g., 'user@example.com') or display name format (e.g., 'John Doe <user@example.com>'). Optional - if not provided, previous recipients are preserved. |
| `extra_recipients` | array | No | Additional 'To' recipients' email addresses. Each must be a valid email address or display name format. Should only be used if recipient_email is also provided. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update IMAP settings

**Slug:** `GMAIL_UPDATE_IMAP_SETTINGS`

Tool to update IMAP settings for a Gmail account. Use when you need to modify IMAP configuration such as enabling/disabling IMAP, setting auto-expunge behavior, or configuring folder size limits.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `enabled` | boolean | No | Whether IMAP is enabled for the account. |
| `user_id` | string | No | The user's email address. The special value 'me' can be used to indicate the authenticated user. |
| `autoExpunge` | boolean | No | If this value is true, Gmail will immediately expunge a message when it is marked as deleted in IMAP. Otherwise, Gmail will wait for an update from the client before expunging messages marked as deleted. |
| `maxFolderSize` | integer | No | An optional limit on the number of messages that an IMAP folder may contain. Legal values are 0, 1000, 2000, 5000 or 10000. A value of zero is interpreted to mean that there is no limit. |
| `expungeBehavior` | string ("expungeBehaviorUnspecified" | "archive" | "trash" | "deleteForever") | No | The action that will be executed on a message when it is marked as deleted and expunged from the last visible IMAP folder. Possible values: 'expungeBehaviorUnspecified' (Unspecified behavior), 'archive' (Archive messages marked as deleted), 'trash' (Move messages marked as deleted to the trash), 'deleteForever' (Immediately and permanently delete messages marked as deleted). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Label

**Slug:** `GMAIL_UPDATE_LABEL`

Tool to update the properties of an existing Gmail label. Use when you need to modify label name, visibility settings, or color.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The ID of the label to update. |
| `name` | string | No | The display name of the label. |
| `color` | object | No | Color settings for the label. Both backgroundColor and textColor must be provided together. |
| `userId` | string | No | The user's email address. The special value `me` can be used to indicate the authenticated user. |
| `labelListVisibility` | string ("labelShow" | "labelShowIfUnread" | "labelHide") | No | Visibility of the label in the label list (Gmail sidebar). |
| `messageListVisibility` | string ("show" | "hide") | No | Visibility of messages with this label in the message list. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Language Settings

**Slug:** `GMAIL_UPDATE_LANGUAGE_SETTINGS`

Tool to update the language settings for a Gmail user. Use when you need to change the display language preference for the authenticated user or a specific Gmail account. The returned displayLanguage may differ from the requested value if Gmail selects a close variant.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The email address of the Gmail user whose language settings are to be updated, or the special value 'me' to indicate the currently authenticated user. |
| `display_language` | string | Yes | The language to display Gmail in, formatted as an RFC 3066 Language Tag (e.g., 'en-GB' for British English, 'fr' for French, 'ja' for Japanese, 'es' for Spanish, 'de' for German, 'en' for English). The set of languages supported by Gmail evolves over time. Note: Gmail may save a close variant if the requested language is not directly supported. For example, if you request a regional variant that's not available, Gmail may save the base language instead. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update POP settings

**Slug:** `GMAIL_UPDATE_POP_SETTINGS`

Tool to update POP settings for a Gmail account. Use when you need to configure POP access window or message disposition behavior.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The user's email address. The special value 'me' can be used to indicate the authenticated user. |
| `disposition` | string ("dispositionUnspecified" | "leaveInInbox" | "archive" | "trash" | "markRead") | No | The action that will be executed on a message after it has been fetched via POP. |
| `access_window` | string ("accessWindowUnspecified" | "disabled" | "fromNowOn" | "allMail") | No | The range of messages which are accessible via POP. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update send-as alias

**Slug:** `GMAIL_UPDATE_SEND_AS`

Tool to update a send-as alias for a Gmail user. Use when you need to modify display name, signature, reply-to address, or SMTP settings for a send-as email address. Gmail sanitizes HTML signatures before saving. Addresses other than the primary can only be updated by service accounts with domain-wide authority.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | No | The email address of the Gmail user whose send-as alias to update, or the special value 'me' to indicate the authenticated user. |
| `smtp_msa` | object | No | SMTP relay configuration for the send-as alias. |
| `signature` | string | No | Optional HTML signature for messages composed with this alias in Gmail web UI. Gmail sanitizes HTML before saving. Only added to new emails. |
| `is_default` | boolean | No | Set to true to make this the default 'From:' address for composing messages and vacation auto-replies. Setting true makes the previous default false. Only legal writable value is true. |
| `display_name` | string | No | Name to appear in 'From:' header. For custom from addresses, Gmail populates with primary account name if empty. Admin restrictions may silently fail updates to primary login name. |
| `send_as_email` | string | Yes | The send-as alias email address to update. This is the email address that appears in the 'From:' header. |
| `treat_as_alias` | boolean | No | Whether Gmail treats this address as an alias for the user's primary email. Only applies to custom from aliases. |
| `reply_to_address` | string | No | Optional email address for 'Reply-To:' header. Gmail omits header if empty. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update User Attributes Values

**Slug:** `GMAIL_UPDATE_USER_ATTRIBUTES_VALUES`

Update user attribute values for a resource. Use this action to set or update custom attributes for a user within an organization or project. When setting a value for an attribute key that also exists in SAML, the Sanity value will take precedence and shadow the SAML value.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | The unique identifier of the user whose attributes to update. |
| `attributes` | object | Yes | A dictionary of attribute key-value pairs to set for the user. Values can be strings, numbers, booleans, arrays, or nested objects. These will shadow any SAML values for the same keys. |
| `resourceId` | string | Yes | The unique identifier of the resource. For organizations, this is the organization ID. |
| `resourceType` | string ("organization" | "project") | Yes | The type of resource that scopes the user attributes (e.g., 'organization' or 'project'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Vacation Settings

**Slug:** `GMAIL_UPDATE_VACATION_SETTINGS`

Tool to update vacation responder settings for a Gmail user. Use when you need to configure out-of-office auto-replies.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | No | The user's email address. The special value 'me' can be used to indicate the authenticated user. |
| `endTime` | string | No | An optional end time for sending auto-replies (epoch ms). When this is specified, Gmail will automatically reply only to messages that it receives before the end time. If both startTime and endTime are specified, startTime must precede endTime. |
| `startTime` | string | No | An optional start time for sending auto-replies (epoch ms). When this is specified, Gmail will automatically reply only to messages that it receives after the start time. If both startTime and endTime are specified, startTime must precede endTime. |
| `enableAutoReply` | boolean | No | Flag that controls whether Gmail automatically replies to messages. |
| `responseSubject` | string | No | Optional text to prepend to the subject line in vacation responses. In order to enable auto-replies, either the response subject or the response body must be nonempty. |
| `responseBodyHtml` | string | No | Response body in HTML format. Gmail will sanitize the HTML before storing it. If both response_body_plain_text and response_body_html are specified, response_body_html will be used. |
| `restrictToDomain` | boolean | No | Flag that determines whether responses are sent to recipients who are outside of the user's domain. This feature is only available for Google Workspace users. |
| `restrictToContacts` | boolean | No | Flag that determines whether responses are sent to recipients who are not in the user's list of contacts. |
| `responseBodyPlainText` | string | No | Response body in plain text format. If both response_body_plain_text and response_body_html are specified, response_body_html will be used. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |


## Triggers

### Email Sent

**Slug:** `GMAIL_EMAIL_SENT_TRIGGER`

**Type:** poll

Triggers when a Gmail message is sent by the authenticated user. It polls the
    'SENT' label and emits metadata including sender, recipients, subject, timestamp,
    and thread ID.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `query` | string | No | Optional additional Gmail search query to further filter sent messages. Uses Gmail search syntax (e.g., to:example@domain.com subject:report). |
| `userId` | string | No | The user's email address or 'me' for the authenticated user. |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `attachment_list` | array | No | The list of attachments in the sent message |
| `bcc` | string | No | Bcc recipients |
| `cc` | string | No | Cc recipients |
| `message_id` | string | No | Gmail message ID |
| `message_text` | string | No | The text of the sent message |
| `message_timestamp` | string | No | Timestamp of the sent message in ISO format |
| `payload` | object | No | Raw Gmail payload |
| `recipients` | string | No | Comma-separated list of all recipients (To, Cc, Bcc) |
| `sender` | string | No | Sender email |
| `subject` | string | No | Email subject |
| `thread_id` | string | No | Gmail thread ID |
| `to` | string | No | To recipients |

### New Gmail Message Received Trigger

**Slug:** `GMAIL_NEW_GMAIL_MESSAGE`

**Type:** poll

Triggers when a new message is received in Gmail.

#### Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `interval` | number | No | Periodic Interval to Check for Updates & Send a Trigger in Minutes |
| `labelIds` | string | No | Filter messages by a single label ID. Labels identify the status or category of messages. Supported labels include 'INBOX', 'SPAM', 'TRASH', 'UNREAD', 'STARRED', 'IMPORTANT', 'CATEGORY_PERSONAL', 'CATEGORY_SOCIAL', 'CATEGORY_PROMOTIONS', 'CATEGORY_UPDATES', and 'CATEGORY_FORUMS'. For complex label filtering, use the 'query' parameter instead. |
| `query` | string | No | Advanced Gmail search using the same syntax as Gmail's search box. Use 'AND' for messages that match all conditions, 'OR' for any condition. Search by sender (from:email@domain.com), labels (label:inbox), status (is:unread), attachments (has:attachment), dates (after:2023/1/1), and more. If specified, this takes precedence over labelIds. |
| `userId` | string | No | The user's email address or 'me' for the authenticated user. |

#### Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `attachment_list` | array | No | The list of attachments in the message |
| `id` | string | No | The raw Gmail message ID |
| `label_ids` | array | No | The Gmail label IDs applied to the message |
| `message_id` | string | No | The message ID of the message |
| `message_text` | string | No | The text of the message |
| `message_timestamp` | string | No | The timestamp of the message |
| `payload` | object | No | The payload of the message |
| `preview` | object | No | The preview payload of the message |
| `sender` | string | No | The sender of the message |
| `subject` | string | No | The subject of the message |
| `thread_id` | string | No | The thread ID of the message |
| `to` | string | No | The recipient of the message |
