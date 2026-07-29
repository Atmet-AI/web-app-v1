# Telegram

Telegram is a cloud-based messaging app with a focus on security and speed. Build bots to send messages, manage chats, and interact with users.

- **Category:** team chat
- **Auth:** API_KEY
- **Composio Managed App Available?** N/A
- **Tools:** 18
- **Triggers:** 0
- **Slug:** `TELEGRAM`
- **Version:** 20260615_00

## Tools

### Answer Callback Query

**Slug:** `TELEGRAM_ANSWER_CALLBACK_QUERY`

Use this method to send answers to callback queries sent from inline keyboards. The answer will be displayed to the user as a notification at the top of the chat screen or as an alert.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | No | URL that will be opened by the user's client. If you have created a Game and accepted the conditions via @Botfather, specify the URL that opens your game – note that this will only work if the query comes from a callback_game button. |
| `text` | string | No | Text of the notification. If not specified, nothing will be shown to the user, 0-200 characters |
| `cache_time` | integer | No | The maximum amount of time in seconds that the result of the callback query may be cached client-side. Telegram apps will support caching starting in version 3.14. Defaults to 0. |
| `show_alert` | boolean | No | If True, an alert will be shown by the client instead of a notification at the top of the chat screen. Defaults to false. |
| `callback_query_id` | string | Yes | Unique identifier for the query to be answered Must be answered promptly after receipt; the ID expires quickly and delayed responses leave users with stuck spinners in the UI. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Export Chat Invite Link

**Slug:** `TELEGRAM_CREATE_CHAT_INVITE_LINK`

Generate a new primary invite link for a chat; any previously generated primary link is revoked. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chat_id` | string | Yes | Unique identifier for the target chat or username of the target supergroup or channel |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Message

**Slug:** `TELEGRAM_DELETE_MESSAGE`

Delete a message, including service messages. Limitations: cannot delete messages older than 48 hours in groups, forwarded messages, or content in protected chats (returns 400 'message can’t be deleted'). Bot must have delete/manage rights in the target chat; works reliably only on bot-authored messages in groups. Verify permissions via TELEGRAM_GET_CHAT or TELEGRAM_GET_CHAT_ADMINISTRATORS before calling. On flood control, Telegram returns HTTP 429 with a retry_after field; honor that backoff value.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chat_id` | string | Yes | Unique identifier for the target chat or username of the target channel In linked channel/discussion group pairs, deleting in one does not remove the corresponding post in the other — issue separate deletion calls with the correct chat_id for each target. |
| `message_id` | integer | Yes | Identifier of the message to delete |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Edit Message

**Slug:** `TELEGRAM_EDIT_MESSAGE`

Edit text messages sent by the bot. Only bot-authored messages can be edited; editing messages from other users will fail. In groups, the bot must have edit permissions.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | New text of the message, 1-4096 characters after entities parsing |
| `chat_id` | string | No | Required if inline_message_id is not specified. Unique identifier for the target chat or username of the target channel |
| `message_id` | integer | No | Required if inline_message_id is not specified. Identifier of the message to edit |
| `parse_mode` | string | No | Mode for parsing entities in the message text. Options: 'Markdown', 'MarkdownV2', 'HTML' |
| `reply_markup` | string | No | JSON-serialized object for an inline keyboard |
| `inline_message_id` | string | No | Required if chat_id and message_id are not specified. Identifier of the inline message |
| `disable_web_page_preview` | boolean | No | Disables link previews for links in this message |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Forward Message

**Slug:** `TELEGRAM_FORWARD_MESSAGE`

Forward messages of any kind. Service messages can't be forwarded.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chat_id` | string | Yes | Unique identifier for the target chat or username of the target channel |
| `message_id` | integer | Yes | Message identifier in the chat specified in from_chat_id |
| `from_chat_id` | string | Yes | Unique identifier for the chat where the original message was sent (or channel username in the format @channelusername) |
| `disable_notification` | boolean | No | Sends the message silently. Users will receive a notification with no sound. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Chat Info

**Slug:** `TELEGRAM_GET_CHAT`

Get up to date information about the chat (current name of the user for one-on-one conversations, current username of a user, group or channel, etc.). The bot must be a member of or have access to the target chat; calls fail if the bot was never added, was removed, or is blocked.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chat_id` | string | Yes | Unique identifier for the target chat or username of the target supergroup or channel Numeric IDs for groups and channels are negative integers. Username must start with '@'; plain names without '@', full URLs, or free text will not resolve. Use TELEGRAM_GET_UPDATES to obtain reliable chat_id values. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Chat Administrators

**Slug:** `TELEGRAM_GET_CHAT_ADMINISTRATORS`

Get a list of administrators in a chat. On success, returns an Array of ChatMember objects containing information about all chat administrators except other bots. Only meaningful for supergroups and channels; private chats yield no useful data. The bot must be a member of the chat; if the bot has admin rights, its own entry will appear in the result, useful for verifying its permissions before moderation actions.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chat_id` | string | Yes | Unique identifier for the target chat or username of the target supergroup or channel |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Chat History

**Slug:** `TELEGRAM_GET_CHAT_HISTORY`

Get chat history messages via the getUpdates polling method, filtered by chat_id. Returns only updates from the specified chat. Bot can only retrieve messages sent after it joined the chat; missing older messages is expected. Requires no active webhook — a webhook causes HTTP 409 conflict; delete it before using this tool. Empty result arrays (ok=true) indicate no accessible messages, not a failure. Returned message dates are Unix timestamps in UTC seconds.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | integer | No | Limits the number of messages to be retrieved. Values between 1-100 are accepted. Defaults to 100. To paginate beyond 100 messages, use coordinated offset or message_id values across sequential calls. |
| `offset` | integer | No | Sequential number of the first message to be returned; negative values are allowed. Default is 0. |
| `chat_id` | string | Yes | Unique identifier for the target chat or username of the target supergroup or channel. Results are filtered to only include updates from this specific chat. |
| `message_id` | integer | No | Identifier of a message in the chat as a starting point for getting history. If not specified, returns recent messages. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Chat Member

**Slug:** `TELEGRAM_GET_CHAT_MEMBER`

Get a chat member's status/role (including the bot itself) to preflight permissions and troubleshoot 403/empty-history issues. Use before sending messages to verify bot membership and permissions.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chat_id` | string | Yes | Unique identifier for the target chat or username of the target supergroup or channel (in the format @channelusername) |
| `user_id` | integer | Yes | Unique identifier of the target user |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Chat Members Count

**Slug:** `TELEGRAM_GET_CHAT_MEMBERS_COUNT`

Get the number of members in a chat. The bot must be an administrator in the chat for this to work. Insufficient admin permissions surface as authorization errors, not as a zero or empty count.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chat_id` | string | Yes | Unique identifier for the target chat or username of the target supergroup or channel Usernames must be prefixed with '@'; plain chat names without '@' are invalid. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Bot Info

**Slug:** `TELEGRAM_GET_ME`

Get basic information about the bot using the Bot API getMe method. Returns fields like id, username, first_name, and capabilities. If the response returns ok=false, the bot token is invalid or revoked and must be replaced before any other API calls. Bot name, bio, and profile description are read-only via the Bot API; modify them via BotFather.

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Updates

**Slug:** `TELEGRAM_GET_UPDATES`

Use this method to receive incoming updates using long polling. An Array of Update objects is returned. IMPORTANT: This method will not work if an outgoing webhook is set up. Webhooks and getUpdates are mutually exclusive — call deleteWebhook first to switch modes (409 Conflict otherwise). Notes: - Only one method (webhook or polling) can be active at a time - Updates available for up to 24 hours if unclaimed - Recalculate offset after each response to avoid duplicates - Empty result array (ok=true) is valid, meaning no new updates - On HTTP 429, honor the retry_after value; keep polling to ~1 request/second - Only chats with updates since the bot joined or last offset appear in results - Update objects vary by type; always check update.message and update.message.text exist before accessing

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | integer | No | Limits the number of updates to be retrieved. Values between 1-100 are accepted. Defaults to 100 |
| `offset` | integer | No | Identifier of the first update to be returned. Must be greater by one than the highest among the identifiers of previously received updates |
| `timeout` | integer | No | Timeout in seconds for long polling. Defaults to 0, i.e. usual short polling. Should be positive, short polling should be used for testing purposes only |
| `allowed_updates` | array | No | A JSON-serialized list of the update types you want your bot to receive. Specify an empty list to receive all update types except chat_member |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Send Document

**Slug:** `TELEGRAM_SEND_DOCUMENT`

Send general files (documents) to a Telegram chat using the Bot API. Prefer over TELEGRAM_SEND_PHOTO when original file format or image resolution must be preserved. Rapid sends trigger flood control (HTTP 429 with `retry_after` seconds); limit to ~1 message/second per chat and wait the specified `retry_after` duration before retrying.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `caption` | string | No | Document caption (may also be used when resending documents by file_id), 0-1024 characters after entities parsing |
| `chat_id` | string | Yes | Unique identifier for the target chat or username of the target channel |
| `document` | string | Yes | File to send. Pass a file_id as String to send a file that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get a file from the Internet, or upload a new file using multipart/form-data. More info on Sending Files: https://core.telegram.org/bots/api#sending-files |
| `thumbnail` | string | No | Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side |
| `parse_mode` | string | No | Mode for parsing entities in the document caption. Options: 'Markdown', 'MarkdownV2', 'HTML' |
| `reply_markup` | string | No | JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove reply keyboard or to force a reply from the user |
| `reply_to_message_id` | integer | No | If the message is a reply, ID of the original message |
| `disable_notification` | boolean | No | Sends the message silently. Users will receive a notification with no sound. |
| `disable_content_type_detection` | boolean | No | Disables automatic server-side content type detection for files uploaded using multipart/form-data |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Send Location

**Slug:** `TELEGRAM_SEND_LOCATION`

Send point on the map location to a Telegram chat using the Bot API.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chat_id` | string | Yes | Unique identifier for the target chat or username of the target channel |
| `heading` | integer | No | For live locations, a direction in which the user is moving, in degrees. Must be between 1 and 360 if specified. |
| `latitude` | number | Yes | Latitude of the location |
| `longitude` | number | Yes | Longitude of the location |
| `live_period` | integer | No | Period in seconds for which the location will be updated (see Live Locations), should be between 60 and 86400 |
| `reply_markup` | string | No | JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove reply keyboard or to force a reply from the user |
| `horizontal_accuracy` | number | No | The radius of uncertainty for the location, measured in meters; 0-1500 |
| `reply_to_message_id` | integer | No | If the message is a reply, ID of the original message |
| `disable_notification` | boolean | No | Sends the message silently. Users will receive a notification with no sound. |
| `proximity_alert_radius` | integer | No | For live locations, a maximum distance for proximity alerts about approaching another chat member, in meters. Must be between 1 and 100000 if specified. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Send Message

**Slug:** `TELEGRAM_SEND_MESSAGE`

Send a text message to a Telegram chat using the Bot API. Bots must be members of target groups/channels with post rights. Rate limit: ~1 msg/sec per chat, ~30 msg/sec globally; exceeding returns 429 with retry_after seconds that must be honored.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Text of the message to be sent, 1-4096 characters after entities parsing Content exceeding 4096 characters must be split across multiple calls. |
| `chat_id` | string | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) Bots cannot initiate private chats with users who haven't messaged the bot first, and cannot message other bots. Verify accessibility via TELEGRAM_GET_UPDATES or TELEGRAM_GET_CHAT before sending. |
| `parse_mode` | string ("Markdown" | "MarkdownV2" | "HTML") | No | Mode for parsing entities in the message text. Accepted values: 'MarkdownV2', 'Markdown', 'HTML'. All special characters must be properly escaped; unescaped or unmatched characters return 400 'can't parse entities'. Use plain text (omit parse_mode) if parsing fails. |
| `reply_markup` | string | No | JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove reply keyboard or to force a reply from the user. |
| `reply_to_message_id` | integer | No | If the message is a reply, ID of the original message |
| `disable_notification` | boolean | No | Sends the message silently. Users will receive a notification with no sound. |
| `disable_web_page_preview` | boolean | No | Disables link previews for links in this message |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Send Photo

**Slug:** `TELEGRAM_SEND_PHOTO`

Send photos to a Telegram chat using the Bot API. Telegram compresses and re-encodes images; use TELEGRAM_SEND_DOCUMENT to preserve original resolution/format. Each call produces a separate post; no media-group/album support. Returns HTTP 429 with `retry_after` seconds when sending too rapidly.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `photo` | string | Yes | Photo to send. Pass a file_id as String to send a photo that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get a photo from the Internet, or upload a new photo using multipart/form-data URL must be a publicly reachable HTTPS URL (no authentication, no expiring/signed links); non-reachable URLs return 400 'failed to get HTTP URL content'. Base64-encoded data and inline bytes are not accepted — extract a public URL from image-generating tools instead. |
| `caption` | string | No | Photo caption (may also be used when resending photos by file_id), 0-1024 characters after entities parsing |
| `chat_id` | string | Yes | Unique identifier for the target chat or username of the target channel Derive from TELEGRAM_GET_CHAT or TELEGRAM_GET_UPDATES; unverified IDs return 400 'chat not found'. |
| `parse_mode` | string | No | Mode for parsing entities in the photo caption. Options: 'Markdown', 'MarkdownV2', 'HTML' Unmatched or unescaped special characters (e.g., `*`, `_`) trigger 400 'can't parse entities' — escape all special characters before sending. |
| `reply_markup` | string | No | JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove reply keyboard or to force a reply from the user |
| `reply_to_message_id` | integer | No | If the message is a reply, ID of the original message |
| `disable_notification` | boolean | No | Sends the message silently. Users will receive a notification with no sound. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Send Poll

**Slug:** `TELEGRAM_SEND_POLL`

Send a native poll to a Telegram chat using the Bot API.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string ("regular" | "quiz") | No | Poll type, defaults to 'regular'. |
| `chat_id` | string | Yes | Unique identifier for the target chat or username of the target channel |
| `options` | array | Yes | A list of answer options, 2-10 strings 1-100 characters each |
| `question` | string | Yes | Poll question, 1-300 characters |
| `is_closed` | boolean | No | Pass True, if the poll needs to be immediately closed. This can be useful for poll preview. |
| `close_date` | integer | No | Point in time (Unix timestamp) when the poll will be automatically closed. Must be at least 5 and no more than 600 seconds in the future. Can't be used together with open_period. |
| `explanation` | string | No | Text that is shown when a user chooses an incorrect answer or taps on the lamp icon in a quiz-style poll, 0-200 characters with at most 2 line feeds after entities parsing |
| `open_period` | integer | No | Amount of time in seconds the poll will be active after creation, 5-600. Can't be used together with close_date. |
| `is_anonymous` | boolean | No | True, if the poll needs to be anonymous, defaults to True |
| `reply_markup` | string | No | JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove reply keyboard or to force a reply from the user |
| `correct_option_id` | integer | No | 0-based identifier of the correct answer option, required for polls in quiz mode |
| `reply_to_message_id` | integer | No | If the message is a reply, ID of the original message |
| `disable_notification` | boolean | No | Sends the message silently. Users will receive a notification with no sound. |
| `explanation_parse_mode` | string ("Markdown" | "MarkdownV2" | "HTML") | No | Mode for parsing entities in the explanation. |
| `allows_multiple_answers` | boolean | No | True, if the poll allows multiple answers, ignored for polls in quiz mode, defaults to False |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Set Bot Commands

**Slug:** `TELEGRAM_SET_MY_COMMANDS`

Use this method to change the list of the bot's commands. See https://core.telegram.org/bots#commands for more details about bot commands.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `scope` | string | No | JSON-serialized object, describing scope of users for which the commands are relevant. Defaults to BotCommandScopeDefault. Scoped commands override the global default only for matching users/chats; omitting scope sets the global list. |
| `commands` | array | Yes | A list of bot commands to be set as the list of the bot's commands. At most 100 commands can be specified. Each command name must be 1–32 characters (lowercase letters and underscores only); each command description must be 1–256 characters. |
| `language_code` | string | No | A two-letter ISO 639-1 language code. If empty, commands will be applied to all users from the given scope, for whose language there are no dedicated commands |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |
