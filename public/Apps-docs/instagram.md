# Instagram

Instagram is a social media platform for sharing photos, videos, and stories. Only supports Instagram Business and Creator accounts, not Instagram Personal accounts.

- **Category:** social media accounts
- **Auth:** OAUTH2
- **Composio Managed App Available?** Yes
- **Tools:** 36
- **Triggers:** 0
- **Slug:** `INSTAGRAM`
- **Version:** 20260721_00

## Frequently Asked Questions

### Instagram requires a Business or Creator account

Instagram toolkit support is for Instagram Business/Creator account flows. If a user is using a personal Instagram account, convert or connect a Business/Creator account linked through Meta/Facebook as required by Instagram's API.

### Why can Instagram reply-to-comment fail with the managed OAuth app?

Instagram comment tools can require Meta's comment-management permission, such as `instagram_manage_comments` for Facebook Login or `instagram_business_manage_comments` for Instagram Business Login. Those permissions must be configured on the Meta app and approved by Meta before the OAuth flow can grant them.

If a reply-to-comment flow fails because the managed OAuth app does not currently have the required comment permission, use your own Meta OAuth app with that permission configured and approved. Composio is working on managed-app approval for the missing permission, but an owned Meta app is the current unblock path for production usage.

## Tools

### Create Carousel Container

**Slug:** `INSTAGRAM_CREATE_CAROUSEL_CONTAINER`

Create a draft carousel post with multiple images/videos before publishing. Instagram requires carousels to have between 2 and 10 media items. Container creation_ids expire in under 24 hours, so publish promptly after creation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `caption` | string | No | Caption for the carousel post (maximum 2,200 characters) Maximum 30 hashtags. |
| `children` | array | No | List of child creation_ids (image/video items). Total carousel items across all sources must be between 2 and 10. All child containers must be in FINISHED status before use; pending or failed items will block carousel creation. Order of IDs determines slide sequence. |
| `ig_user_id` | string | Yes | Instagram Business Account ID Must be a Business or Creator account; personal accounts are rejected. |
| `child_image_urls` | array | No | List of image URLs to include as carousel children. Images must meet Instagram's requirements: JPEG format, aspect ratio between 4:5 (0.8) and 1.91:1, width between 320-1440px (images below 320px are scaled up, larger images are downscaled), maximum file size 8MB. URLs must be publicly accessible by Instagram's servers. Total carousel items across all sources must be between 2 and 10. Must be direct HTTPS URLs (not HTML pages, redirects, or generic Google Drive share links); use a public direct-download link. |
| `child_video_urls` | array | No | List of video URLs to include as carousel children. Videos must meet Instagram's requirements: MP4 or MOV format, aspect ratio between 4:5 (0.8) and 1.91:1, duration 3-60 seconds, maximum file size 4GB. URLs must be publicly accessible by Instagram's servers. Total carousel items across all sources must be between 2 and 10. Must be direct HTTPS URLs (not HTML pages, redirects, or generic Google Drive share links). |
| `child_image_files` | array | No | List of local image files to include as carousel children. Images must meet Instagram's requirements: JPEG format, aspect ratio between 4:5 (0.8) and 1.91:1, width between 320-1440px (images below 320px are scaled up, larger images are downscaled), maximum file size 8MB. Total carousel items across all sources must be between 2 and 10. |
| `child_video_files` | array | No | List of local video files to include as carousel children. Videos must meet Instagram's requirements: MP4 or MOV format, aspect ratio between 4:5 (0.8) and 1.91:1, duration 3-60 seconds, maximum file size 4GB. Total carousel items across all sources must be between 2 and 10. |
| `graph_api_version` | string | No | Instagram Graph API version to use |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Media Container (Deprecated)

**Slug:** `INSTAGRAM_CREATE_MEDIA_CONTAINER`

DEPRECATED: Use INSTAGRAM_POST_IG_USER_MEDIA instead. Creates a draft media container for photos/videos/reels before publishing. Business/Creator accounts only — personal accounts unsupported. Returns a container ID (data.id or data.creation_id) used as creation_id for publishing. Containers expire in ~24 hours — recreate stale containers rather than reusing old IDs. Before publishing via INSTAGRAM_CREATE_POST, call INSTAGRAM_GET_POST_STATUS and wait for FINISHED status — publishing before FINISHED triggers error 9007. Each creation_id is one-time-use; if container creation fails (status_code='ERROR'), fix media params and recreate via this tool rather than retrying publish with the failed ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `caption` | string | No | Post caption text. Maximum 2,200 characters. Hashtag limit: 30 hashtags maximum per post (Instagram enforces this limit). Mention limit: 20 @mentions maximum. |
| `cover_url` | string | No | Cover image URL for videos. For feed videos (content_type='video'), if image_url is not provided, this will be used as the required thumbnail. For reels, this is optional. |
| `image_url` | string | No | Public URL of the image. CRITICAL REQUIREMENTS: (1) Must be a DIRECT link to the raw image file - no redirects, no authentication, no HTML wrappers. (2) Must be publicly accessible by Meta's crawlers (URLs from Google Drive, dynamic API endpoints, or generated URLs like 'backend.composio.dev/dynamic-module-load/...' will NOT work). (3) Must return proper HTTP 200 status with correct Content-Type header (image/jpeg or image/png). (4) Supported formats: JPG, PNG (WebP not supported). Max 8MB, min 320px width, aspect ratio 4:5 to 1.91:1. RECOMMENDED: Use image hosting services like Imgur, Cloudinary, AWS S3 (public), or similar that provide direct download URLs. For feed videos (content_type='video'), this parameter is required as a thumbnail. |
| `video_url` | string | No | Public URL of the video. CRITICAL REQUIREMENTS: (1) Must be a DIRECT link to the raw video file - no redirects, no authentication, no HTML wrappers. (2) Must be publicly accessible by Meta's crawlers (URLs from Google Drive, dynamic API endpoints, or generated URLs will NOT work). (3) Must return proper HTTP 200 status with correct Content-Type header (video/mp4 or video/quicktime). (4) Supported formats: MP4, MOV. Max 100MB for feed videos, max 1GB for IGTV, min 3 seconds duration. RECOMMENDED: Use video hosting services or cloud storage like AWS S3 (public), Cloudinary, or similar. |
| `ig_user_id` | string | No | Instagram Business Account ID (numeric string like '17841400008460056'). Optional - defaults to the current authenticated user. Do NOT pass Composio connection IDs (starting with 'ca_') or other auth identifiers. |
| `media_type` | string | No | Explicit media type override (IMAGE, REELS, or CAROUSEL). If not provided, media_type is automatically inferred: IMAGE for image_url, REELS for video_url. IMPORTANT: Each media_type has specific URL requirements: IMAGE requires image_url; REELS requires video_url. NOTE: VIDEO media_type was deprecated on November 9, 2023. If VIDEO is provided, it will be automatically converted to REELS. |
| `content_type` | string ("photo" | "video" | "reel" | "carousel_item") | No | What you want to post: 'photo', 'video', 'reel', or 'carousel_item' (for carousel drafts) |
| `is_carousel_item` | boolean | No | Legacy parameter to mark media as a carousel item. Prefer using content_type='carousel_item' instead, which automatically sets this flag. When creating carousel items, you must provide either image_url or video_url. Carousels support a maximum of 10 items; each item must independently satisfy format, size, and aspect-ratio constraints. |
| `graph_api_version` | string | No | The Facebook Graph API version to use for the request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Post (Deprecated)

**Slug:** `INSTAGRAM_CREATE_POST`

DEPRECATED: Use INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH instead. Publish a draft media container to Instagram (final publishing step). Posts become immediately and publicly visible upon success — confirm intent before calling. Requires Business or Creator account with publish scopes; missing scopes return Graph error code 10. After creating a media container, Instagram may need time to process media before publishing. If called too early, error code 9007 is returned. This action automatically retries with exponential backoff (up to ~44 seconds total). For large videos, use INSTAGRAM_GET_POST_STATUS to poll until status_code='FINISHED' before calling; for carousels, all child containers must individually reach FINISHED status first. No native scheduling support — use an external scheduler to trigger this call at the desired time.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ig_user_id` | string | Yes | Instagram Business Account ID. Must be a numeric string (e.g., '25162441193410545'). Personal accounts and misconfigured IDs are rejected. |
| `creation_id` | string | Yes | The media container ID returned in the 'id' field from INSTAGRAM_CREATE_MEDIA_CONTAINER or INSTAGRAM_CREATE_CAROUSEL_CONTAINER. Typically a long numeric string like '17895695668004550'. IMPORTANT: Do NOT use datetime strings (e.g., '2024-01-15T10:30:00+0000') - those are unrelated fields in Instagram responses. The container ID is found in the response like: {'id': '17895695668004550'}. Containers expire after ~24 hours; recreate via INSTAGRAM_CREATE_MEDIA_CONTAINER if stale. |
| `graph_api_version` | string | No | The Facebook Graph API version to use for the request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Comment

**Slug:** `INSTAGRAM_DELETE_COMMENT`

Tool to delete a comment on Instagram media. Use when you need to remove a comment that was created by your Instagram Business or Creator Account. Note: You can only delete comments that your account created - you cannot delete other users' comments unless they are on your own media.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ig_comment_id` | string | Yes | The unique identifier of the Instagram comment to delete. This must be a comment created by your Instagram Business or Creator Account. |
| `graph_api_version` | string | No | Instagram Graph API version to use. Defaults to v21.0. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Messenger Profile

**Slug:** `INSTAGRAM_DELETE_MESSENGER_PROFILE`

Tool to delete messenger profile settings for an Instagram account. Use when you need to remove ice breakers, persistent menu, greeting messages, or other messaging configuration from the messenger profile.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | array | Yes | Array of messenger profile properties to delete. Valid values: ice_breakers, persistent_menu, get_started, greeting, account_linking_url, whitelisted_domains. Only the specified fields will be removed from the messenger profile. |
| `ig_user_id` | string | Yes | Instagram Business Account ID whose messenger profile settings will be deleted. |
| `graph_api_version` | string | No | Instagram Graph API version to use. Defaults to v21.0. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Conversation

**Slug:** `INSTAGRAM_GET_CONVERSATION`

Get details about a specific Instagram DM conversation (participants, etc). Requires a Business or Creator account with Instagram messaging permissions; personal accounts will return permission errors. Newly sent/received messages may take a few seconds to appear in results.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `conversation_id` | string | Yes | The unique identifier for the Instagram conversation thread.  The thread must already exist; first-contact DMs cannot be initiated via the API — a manual first message must be sent before a conversation_id is available.This is typically a base64-encoded string obtained from the list_conversations or list_all_conversations actions. Must not be empty or contain only whitespace. |
| `graph_api_version` | string | No | The Graph API version to use (e.g., 'v21.0'). Defaults to 'v21.0'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get IG Comment Replies

**Slug:** `INSTAGRAM_GET_IG_COMMENT_REPLIES`

Get replies to a specific Instagram comment. Returns a list of comment replies with details like text, username, timestamp, and like count. Use when you need to retrieve child comments (replies) for a specific parent comment.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for forward pagination - get replies after this cursor |
| `limit` | integer | No | Number of replies to return per page (max 100) |
| `before` | string | No | Cursor for backward pagination - get replies before this cursor |
| `fields` | string | No | Comma-separated list of fields to return. Available fields: id, text, username, timestamp, like_count, hidden, from, media, parent_id, replies, legacy_instagram_comment_id |
| `ig_comment_id` | string | Yes | Instagram Comment ID to get replies for |
| `graph_api_version` | string | No | Graph API version to use |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Instagram Media

**Slug:** `INSTAGRAM_GET_IG_MEDIA`

Get a published Instagram Media object (photo, video, story, reel, or carousel). Use when you need to retrieve detailed information about a specific Instagram post including engagement metrics, caption, media URLs, and metadata. NOTE: This action is for published media only. For unpublished container IDs (from INSTAGRAM_CREATE_MEDIA_CONTAINER), use INSTAGRAM_GET_POST_STATUS to check status instead.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | string | No | Comma-separated list of fields to return. Defaults to commonly useful fields including id, caption, media_type, media_url, permalink, timestamp, like_count, comments_count, and media_product_type. Supported fields: id, caption, comments_count, is_comment_enabled, like_count, media_type, media_url, media_product_type, owner, permalink, shortcode, thumbnail_url, timestamp, username, children, comments. For nested fields use syntax like 'children{media_url,media_type}'. UNSUPPORTED FIELDS (will cause errors): tagged_users, user_tags, location, filter_name, latitude, longitude, text. Note: Use 'caption' instead of 'text' for the media caption. INSIGHTS METRICS (use INSTAGRAM_GET_IG_MEDIA_INSIGHTS instead): plays, reach, saved, impressions, video_views, engagement. To get media where a user is tagged, use INSTAGRAM_GET_IG_USER_TAGS instead. IMPORTANT: If you receive a MediaBuilder error, the ID is an unpublished container - use INSTAGRAM_GET_POST_STATUS instead. |
| `ig_media_id` | string | Yes | The numeric ID of the Instagram media object from the Graph API (e.g., '17858625294504375'). IMPORTANT: This must be a numeric string, NOT an alphanumeric shortcode from instagram.com/p/<shortcode>/ URLs (e.g., 'DUTi4n4D9wg' is NOT valid). Obtain numeric IDs from INSTAGRAM_GET_IG_USER_MEDIA or similar endpoints. For unpublished container IDs, use INSTAGRAM_GET_POST_STATUS instead. |
| `graph_api_version` | string | No | Instagram Graph API version to use |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get IG Media Children

**Slug:** `INSTAGRAM_GET_IG_MEDIA_CHILDREN`

Tool to get media objects (images/videos) that are children of an Instagram carousel/album post. Use when you need to retrieve individual media items from a carousel album post. Note: Carousel children media do not support insights queries - for analytics, query metrics at the parent carousel level.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | string | No | Comma-separated list of fields to return for each child media item. Available fields: id, caption, media_type, media_url, username, timestamp, permalink, thumbnail_url, ig_id, owner, shortcode, is_comment_enabled, comments_count, like_count |
| `ig_media_id` | string | Yes | The ID of a CAROUSEL_ALBUM media post (not a user ID). This must be a media ID from a carousel/album post, typically obtained by calling 'Get IG User Media' action first and filtering for media_type='CAROUSEL_ALBUM'. Media IDs are numeric strings (17 digits) that identify specific Instagram posts, distinct from user/account IDs. |
| `graph_api_version` | string | No | Instagram Graph API version to use |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get IG Media Comments

**Slug:** `INSTAGRAM_GET_IG_MEDIA_COMMENTS`

Tool to retrieve comments on an Instagram media object. Use when you need to fetch comments from a specific Instagram post, photo, video, or carousel owned by the connected Business/Creator account. Supports cursor-based pagination for navigating through large comment lists. An empty data array in the response indicates the post has no comments and is not an error. Bulk-fetching across many media objects may trigger API rate limits.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for forward pagination. Use the cursor value from previous response's paging.cursors.after field |
| `limit` | integer | No | Number of comments to return per page (typically 50-100) |
| `before` | string | No | Cursor for backward pagination. Use the cursor value from previous response's paging.cursors.before field |
| `fields` | string | No | Comma-separated list of fields to retrieve for each comment. Available fields: id, text, username, timestamp, like_count, replies, from, hidden, media, parent_id, user |
| `ig_media_id` | string | Yes | The ID of the Instagram media object (post/photo/video/album) to retrieve comments from. Must be a Media ID, not a User ID. Media IDs can be obtained from endpoints like GET /ig-user-id/media. Media IDs typically look like '17858625294504375'. The media must belong to the connected Business/Creator account; media from other accounts will return empty data or an error. |
| `graph_api_version` | string | No | Instagram Graph API version to use |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get IG Media Insights

**Slug:** `INSTAGRAM_GET_IG_MEDIA_INSIGHTS`

Tool to get insights and metrics for Instagram media objects (photos, videos, reels, carousel albums). Use when you need to retrieve performance data such as views, reach, likes, comments, saves, and shares for specific media. Note: Insights data is only available for media published within the last 2 years, and the account must have at least 1,000 followers. Requires a Business or Creator account; personal Instagram profiles are not supported.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `metric` | array | Yes | List of metrics to retrieve. Must be provided as an array of strings, e.g., ['reach', 'saved', 'likes']. COMMONLY SUPPORTED METRICS: views, reach, saved, likes, comments, shares, total_interactions. REELS-SPECIFIC METRICS: ig_reels_video_view_total_time, ig_reels_avg_watch_time, reels_skip_rate, facebook_views, crossposted_views. STORIES-SPECIFIC METRICS: replies, navigation, follows, profile_visits. DEPRECATED METRICS (will be filtered out): 'impressions', 'plays', 'video_views', 'clips_replays_count', 'ig_reels_aggregated_all_plays_count' (use 'views' instead); 'taps_forward', 'taps_back', 'exits' (Story navigation metrics deprecated in API v18+, use 'navigation' instead). INVALID METRIC NAMES (will be rejected): 'clicks', 'engagement' are NOT valid metric names. |
| `period` | string | No | The time period for metric aggregation. For media insights, 'lifetime' is the default and typically the only available option. Note: You can only request metrics for one period type per request. |
| `ig_media_id` | string | Yes | The ID of the Instagram media object (photo, video, reel, carousel album) for which to retrieve insights |
| `graph_api_version` | string | No | Instagram Graph API version to use |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get IG User Content Publishing Limit

**Slug:** `INSTAGRAM_GET_IG_USER_CONTENT_PUBLISHING_LIMIT`

Get an Instagram Business Account's current content publishing usage. Use this to monitor quota usage before publishing; exceeding the daily cap blocks new posts until the quota resets (no partial failure — new publish calls are rejected until reset). IMPORTANT: This endpoint requires an IG User ID (Instagram Business Account ID), NOT an IGSID (Instagram Scoped ID). IGSID is only used for messaging-related endpoints. Content publishing endpoints require a proper IG User ID. Excessive polling of this endpoint may trigger Graph error 613 (rate limit); space calls several seconds apart.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | string | No | Comma-separated list of fields to return. Available fields: quota_usage, config. Defaults to 'quota_usage,config'. |
| `ig_user_id` | string | No | Instagram Business Account ID (IG User ID). Must be a valid IG User ID, NOT an IGSID/scoped ID (used for messaging). Defaults to 'me' for current user. To get your IG User ID, use GET /{facebook-page-id}?fields=instagram_business_account. |
| `graph_api_version` | string | No | Facebook Graph API version to use |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get IG User Live Media

**Slug:** `INSTAGRAM_GET_IG_USER_LIVE_MEDIA`

Get live media objects during an active Instagram broadcast. Returns the live video media ID and metadata when a live broadcast is in progress on an Instagram Business or Creator account. Use this to monitor active live streams and access real-time engagement data.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | string | No | Comma-separated list of fields to return for the live media object. Available fields: id, media_type, media_url, timestamp, permalink. Defaults to all available fields. |
| `ig_user_id` | string | No | Instagram Business or Creator Account ID (optional, defaults to 'me' for current user). Must be an account with an active live broadcast. |
| `graph_api_version` | string | No | Facebook Graph API version to use |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get IG User Media

**Slug:** `INSTAGRAM_GET_IG_USER_MEDIA`

Get Instagram user's media collection (posts, photos, videos, reels, carousels). Use when you need to retrieve all media published by an Instagram Business or Creator account with support for pagination and time-based filtering.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for forward pagination - retrieve media after this cursor Value comes from paging.cursors.after in the response; stopping at the first page silently omits older posts. |
| `limit` | integer | No | Number of media items to return per page (default: 25, max: 100) |
| `since` | integer | No | Unix timestamp - filter results to media created after this time. If both 'since' and 'until' are provided, 'since' must be less than 'until'. |
| `until` | integer | No | Unix timestamp - filter results to media created before this time. If both 'since' and 'until' are provided, 'since' must be less than 'until'. |
| `before` | string | No | Cursor for backward pagination - retrieve media before this cursor |
| `fields` | string | No | Comma-separated list of fields to return. Available fields: id, caption, media_type, media_url, permalink, thumbnail_url, timestamp, username, comments_count, like_count, ig_id, is_comment_enabled, owner, shortcode, media_product_type, video_title, children{media_url,media_type,thumbnail_url} Reels appear as media_type=VIDEO and media_product_type=REELS; filter both fields to identify reels. media_url is a direct file URL; permalink is the user-facing share link. Optional fields like caption and like_count may be null or absent in the response. |
| `ig_user_id` | string | Yes | Instagram Business or Creator Account ID. Use 'me' for the authenticated user, or provide the numeric ID obtained from the Instagram Graph API (typically 17 digits, e.g., '17841405793187218'). If you provide a Facebook Page ID, it will be automatically converted to the Instagram Business Account ID. |
| `graph_api_version` | string | No | Instagram Graph API version to use (e.g., 'v21.0') |
| `auto_resolve_fb_page_id` | boolean | No | If true and the provided ig_user_id fails, automatically attempt to resolve it as a Facebook Page ID by retrieving the instagram_business_account field. Set to false to disable this behavior. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get IG User Stories

**Slug:** `INSTAGRAM_GET_IG_USER_STORIES`

Get active story media objects for an Instagram Business or Creator account. Stories are retrieved via the /stories endpoint. Returns stories that are currently active within the 24-hour window. Use this to retrieve story content, metadata, and engagement metrics for monitoring or analytics purposes.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for pagination to get the next page of results. Use the 'after' cursor from the previous response's paging object. |
| `limit` | integer | No | Number of stories to return per page for pagination. If not specified, returns all active stories. |
| `before` | string | No | Cursor for pagination to get the previous page of results. Use the 'before' cursor from the previous response's paging object. |
| `fields` | string | No | Comma-separated list of fields to return for each story. Available fields: id, caption, comments_count, ig_id, is_comment_enabled, like_count, media_type, media_url, owner, permalink, shortcode, thumbnail_url, timestamp, username. If not specified, defaults to id, media_type, media_url, permalink, and timestamp. |
| `ig_user_id` | string | No | Instagram Business or Creator Account ID (optional, defaults to 'me' for current user). Must be an account with active stories within the 24-hour window. Must be a numeric ID; usernames are not accepted. |
| `graph_api_version` | string | No | Facebook Graph API version to use |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get IG User Tags

**Slug:** `INSTAGRAM_GET_IG_USER_TAGS`

Get Instagram media where the user has been tagged by other users. Use when you need to retrieve all media in which an Instagram Business or Creator account has been tagged, including tags in captions, comments, or on the media itself.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for forward pagination - retrieve media after this cursor |
| `limit` | integer | No | Number of tagged media items to return per page (default: 25, max: 100) |
| `before` | string | No | Cursor for backward pagination - retrieve media before this cursor |
| `fields` | string | No | Comma-separated list of fields to return. Available fields: id, caption, comments_count, ig_id, is_comment_enabled, like_count, media_product_type, media_type, media_url, owner, permalink, shortcode, thumbnail_url, timestamp, username, video_title. If not specified, defaults to commonly used fields. |
| `ig_user_id` | string | Yes | Instagram Business or Creator Account ID. Use 'me' for the authenticated user's account. |
| `graph_api_version` | string | No | Instagram Graph API version (e.g., 'v21.0'). If not specified, uses v21.0 as default. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Messenger Profile

**Slug:** `INSTAGRAM_GET_MESSENGER_PROFILE`

Get the messenger profile settings for an Instagram account. Returns ice breakers and other messaging configuration. Use when you need to retrieve messaging settings, ice breaker questions, or messenger configuration for an Instagram Business account.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fields` | string | No | Comma-separated list of messenger profile fields to retrieve. Available options: ice_breakers, greeting, persistent_menu, get_started, account_linking_url, whitelisted_domains. If not provided, all available fields will be returned. |
| `ig_user_id` | string | Yes | The Instagram User ID for which to retrieve messenger profile settings |
| `graph_api_version` | string | No | The Graph API version to use (e.g., 'v21.0'). Defaults to 'v21.0'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Page Conversations

**Slug:** `INSTAGRAM_GET_PAGE_CONVERSATIONS`

Get Instagram conversations for a Page connected to an Instagram Business account. Use platform=instagram parameter to filter for Instagram conversations only.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for pagination to get the next page of results. |
| `limit` | integer | No | Maximum number of conversations to return per page. |
| `page_id` | string | Yes | Instagram user ID or page ID to get conversations for. This is the Instagram Business Account ID that can be obtained from the /me endpoint. |
| `platform` | string | No | Platform to filter conversations. Set to 'instagram' to get Instagram conversations only. |
| `graph_api_version` | string | No | The Graph API version to use (e.g., 'v21.0'). Defaults to 'v21.0'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Post Comments (Deprecated)

**Slug:** `INSTAGRAM_GET_POST_COMMENTS`

DEPRECATED: Use INSTAGRAM_GET_IG_MEDIA_COMMENTS instead. Get comments on an Instagram post. Requires Instagram Business or Creator account. Returns empty `data` array (not an error) when no comments exist. Response data is nested under `data.data`; unwrap before processing. Timestamps are timezone-aware ISO 8601 strings; use UTC-based comparison.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for pagination - get comments after this cursor Value comes from `paging.cursors.after` in the response. |
| `limit` | integer | No | Number of comments to return (max 100) |
| `ig_post_id` | string | Yes | Instagram Post ID |
| `graph_api_version` | string | No | The Facebook Graph API version to use for the request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Post Insights (Deprecated)

**Slug:** `INSTAGRAM_GET_POST_INSIGHTS`

DEPRECATED: Use INSTAGRAM_GET_IG_MEDIA_INSIGHTS instead. Get Instagram post insights/analytics (impressions, reach, engagement, etc.). Requires a Business or Creator account; personal accounts cannot access insights. Metrics may be unavailable for several minutes after publishing; verify post status is FINISHED before calling.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `metric` | array | No | Metrics to retrieve for the media. If not provided and metric_preset is not set, uses auto_safe preset. Allowed metrics vary by media_product_type: IMAGE/CAROUSEL: reach, likes, comments, saved, shares. VIDEO: reach, plays, likes, comments, saved, shares. REELS: reach, likes, comments, saved, shares, total_interactions, ig_reels_video_view_total_time, ig_reels_avg_watch_time, clips_replays_count, ig_reels_aggregated_all_plays_count, views, reels_skip_rate. Note: 'plays' may not work consistently for all reel types - use 'views' instead (plays is being deprecated in API v22). Stories: reach, replies, taps_forward, taps_back, exits. Note: 'engagement' and 'impressions' are NOT valid standalone metrics - use individual metrics like likes, comments, saved, shares instead. If a metric is unsupported for the post type, API returns 400 error. Some metrics (e.g., shares) may return null even for supported media types; handle missing values before computing ratios. |
| `ig_post_id` | string | Yes | Numeric Instagram Media ID from the Graph API (e.g., '17895695668004196'). This must be the numeric ID, NOT the shortcode from Instagram URLs (e.g., 'DT0ndbTgcLH' from instagram.com/p/DT0ndbTgcLH/ will NOT work). Use INSTAGRAM_GET_IG_USER_MEDIA to obtain valid numeric media IDs. |
| `metric_preset` | string ("auto_safe" | "image_basic" | "video_basic" | "reel_basic" | "carousel_basic") | No | Predefined metric sets for different media types to avoid API errors. |
| `graph_api_version` | string | No | The Facebook Graph API version to use for the request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Post Status (Deprecated)

**Slug:** `INSTAGRAM_GET_POST_STATUS`

DEPRECATED: Use GetIgMedia instead. Check the processing status of a draft post container. Poll until status_code='FINISHED' before calling INSTAGRAM_CREATE_POST; publishing early triggers OAuthException 9007 (HTTP 400). If status_code='ERROR' or remains non-terminal after ~30 attempts, the container is permanently failed — recreate a new container. Poll every 3–5s with exponential backoff to avoid error 613/code 4/HTTP 429. For carousels, all child containers must reach FINISHED before publishing the parent.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `creation_id` | string | Yes | The media container ID returned from INSTAGRAM_CREATE_MEDIA_CONTAINER action. This is a numeric string (e.g., '17843131380645284') that uniquely identifies the media container. Use this ID to check the container's publishing status before calling the publish endpoint. Sourced from the data.id field (not data.creation_id) in the INSTAGRAM_CREATE_MEDIA_CONTAINER response. Containers expire after ~24 hours; do not reuse an expired creation_id. |
| `graph_api_version` | string | No | The Facebook Graph API version to use for the request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get User Info

**Slug:** `INSTAGRAM_GET_USER_INFO`

Get Instagram Business Account info including profile details and statistics. IMPORTANT: Only works for Business/Creator accounts you manage through Facebook Business Manager. Cannot query arbitrary public Instagram accounts. Use "me" to query your own authenticated account. NOTE: followers_count and follows_count are ONLY available when querying your own profile with ig_user_id="me" - these fields return null for specific user IDs due to Instagram Graph API limitations.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ig_user_id` | string | No | Instagram Business Account ID. IMPORTANT: You can only query Business/Creator accounts that you manage through Facebook Business Manager. Use "me" to query your own authenticated account. To query other accounts you manage, provide their numeric Business Account ID. Arbitrary public accounts cannot be queried. If not provided, defaults to "me". |
| `graph_api_version` | string | No | The Facebook Graph API version to use for the request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get User Insights

**Slug:** `INSTAGRAM_GET_USER_INSIGHTS`

Get Instagram account-level insights and analytics (profile views, reach, follower count, etc.). Requires a Business or Creator account; personal accounts are not supported. Returned timestamps are in UTC. metric_type (time_series or total_value): When set to total_value, the API returns a total_value object instead of values. breakdown: Only applicable when metric_type=total_value and only for supported metrics. timeframe: Required for demographics-related metrics and overrides since/until for those metrics.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `since` | integer | No | Start of time range (inclusive) as a Unix timestamp (seconds). Also accepts date strings (YYYY-MM-DD or ISO 8601 format) which will be converted to timestamps. |
| `until` | integer | No | End of time range (inclusive) as a Unix timestamp (seconds). Also accepts date strings (YYYY-MM-DD or ISO 8601 format) which will be converted to timestamps. |
| `metric` | array | No | Metrics to retrieve for the user account. Accepts a list of metric names or a comma-separated string. Core metrics: reach, follower_count, online_followers. Engagement metrics: accounts_engaged, total_interactions, likes, comments, shares, saves, replies. Activity metrics: follows_and_unfollows, profile_links_taps, views. Demographics metrics (require timeframe parameter): engaged_audience_demographics, reached_audience_demographics, follower_demographics. Threads metrics: threads_likes, threads_replies, reposts, quotes, threads_followers, etc. If multiple metrics are provided, all must support the same period. DEPRECATED (January 2025, Graph API v21+): impressions, email_contacts, phone_call_clicks, text_message_clicks, get_directions_clicks, profile_views, and website_clicks are no longer supported. |
| `period` | string ("day" | "week" | "days_28" | "lifetime") | No | Valid period values for Instagram user insights aggregation.  Available periods: - day: Daily aggregation - week: Weekly aggregation - days_28: 28-day aggregation - lifetime: Lifetime aggregation (for audience-related metrics) |
| `breakdown` | string | No | Breakdown to use when metric_type=total_value. Allowed values: contact_button_type, follow_type, media_product_type, age, city, country, gender. |
| `timeframe` | string ("this_month" | "this_week") | No | Valid timeframe values for demographics-related Instagram user insights.  Required for engaged_audience_demographics and reached_audience_demographics metrics. Overrides since/until parameters when specified.  Note: As of 2025, Instagram deprecated the following timeframe values for demographics metrics: last_14_days, last_30_days, last_90_days, and prev_month. Only this_week and this_month are currently supported by the Instagram Graph API.  The follower_demographics metric uses period=lifetime and does not support the timeframe parameter. |
| `ig_user_id` | string | No | Instagram Business Account ID - must be a numeric ID (e.g., '17841400008460056'). Content API IDs with 'ca_' prefix are not supported. Optional, defaults to current user. |
| `metric_type` | string | No | Aggregation type for results. Allowed values: time_series, total_value. |
| `graph_api_version` | string | No | The Facebook Graph API version to use for the request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get User Media (Deprecated)

**Slug:** `INSTAGRAM_GET_USER_MEDIA`

DEPRECATED: Use INSTAGRAM_GET_IG_USER_MEDIA instead. Get Instagram user's media (posts, photos, videos). Only works for connected Business or Creator accounts; personal accounts return no data. Response data is nested under `data.data`; unwrap before processing. Items mix images, videos, carousels, and reels — filter by `media_type` and `media_product_type`. Use `media_url` for file download, `permalink` for share links. Fields like `caption`, `like_count` may be null. Timestamps are UTC ISO 8601. HTTP 429 with `Retry-After` header indicates rate limiting.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for pagination - get media after this cursor Chain calls using `paging.cursors.after` from the response to paginate; set an upper bound (e.g., ~300 posts) to avoid unbounded loops. |
| `limit` | integer | No | Number of media items to return (max 100) A single call may not return all media; paginate via `after` for complete results. |
| `ig_user_id` | string | No | Numeric Instagram Business Account ID (NOT username). Must be a numeric ID like '17841405793187218'. Omit or leave empty to get the current authenticated user's media. To find an account's numeric ID, use the INSTAGRAM_GET_USER_INFO action. |
| `graph_api_version` | string | No | The Facebook Graph API version to use for the request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List All Conversations

**Slug:** `INSTAGRAM_LIST_ALL_CONVERSATIONS`

List all Instagram DM conversations for the authenticated user. Requires a Business/Creator account with messaging permissions; personal accounts return empty results. Response conversations are nested under `data.data` — accessing top-level `data` as the final list returns zero items. An empty `data` list is a valid non-error outcome meaning no conversations exist in scope.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for pagination Obtain from `paging.cursors.after` in the response; absence of `paging.cursors.after` or `paging.next` signals end-of-results. |
| `limit` | integer | No | Maximum number of conversations to return. |
| `ig_user_id` | string | No | Instagram Business Account ID (optional for /me/conversations) |
| `graph_api_version` | string | No | The Facebook Graph API version to use for the request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List All Messages

**Slug:** `INSTAGRAM_LIST_ALL_MESSAGES`

List all messages from a specific Instagram DM conversation. Requires a Business or Creator account with messaging permissions; personal accounts return empty results. Response data is nested under data.data (double-wrapped); attachment-only messages may have empty text fields.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for paginationPass paging.cursors.after from the previous response to fetch the next page. Stop when paging.cursors.after or paging.next is absent. |
| `limit` | integer | No | Maximum number of messages to return. |
| `conversation_id` | string | Yes | Unique identifier for the Instagram conversation. Obtain this by calling the INSTAGRAM_LIST_ALL_CONVERSATIONS action, which returns conversation IDs in the format 'aWdfZAG06...' (base64-encoded string). |
| `graph_api_version` | string | No | The Facebook Graph API version to use for the request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Mark Seen

**Slug:** `INSTAGRAM_MARK_SEEN`

Mark Instagram DM messages as read/seen for a specific user. Sends a 'mark_seen' sender action to indicate messages from the specified recipient have been read. Marking as seen is visible to the other party and changes inbox read state — use with explicit user approval in automated or bulk flows. IMPORTANT LIMITATIONS: - The sender_action API feature may have limited support on Instagram - The recipient must have an active 24-hour messaging window open - Requires instagram_manage_messages permission - Only works with Instagram Business or Creator accounts If this action fails with a 500 error, it may indicate that the sender_action feature is not supported for your Instagram account or the specific recipient.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ig_user_id` | string | No | Instagram Business Account ID. Optional - when not provided, the /me/messages endpoint is used instead of /{ig_user_id}/messages. |
| `recipient_id` | string | Yes | Instagram-Scoped User ID (IGSID) of the recipient. This is a numeric string obtained from conversation participants (e.g., '17841479358498320'). The recipient must have an existing conversation with your Instagram Business/Creator account. In multi-participant threads, use the individual participant's IGSID, not a group or thread identifier. |
| `graph_api_version` | string | No | Instagram Graph API version to use (e.g., 'v21.0'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Post IG Comment Replies

**Slug:** `INSTAGRAM_POST_IG_COMMENT_REPLIES`

Tool to create a reply to an Instagram comment. Use when you need to reply to a specific comment on an Instagram post owned by a Business or Creator account. The reply must be 300 characters or less, contain at most 4 hashtags and 1 URL, and cannot consist entirely of capital letters.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | The text content of the reply to be posted. Maximum length: 300 characters. Maximum 4 hashtags allowed. Maximum 1 URL allowed. Cannot consist entirely of capital letters. |
| `ig_comment_id` | string | Yes | The unique identifier of the Instagram comment to which you want to reply. This is the ID of the parent comment that will receive the reply. |
| `graph_api_version` | string | No | Instagram Graph API version to use. Defaults to v21.0. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Post IG Media Comments

**Slug:** `INSTAGRAM_POST_IG_MEDIA_COMMENTS`

Tool to create a comment on an Instagram media object. Use when you need to post a comment on a specific Instagram post, photo, video, or carousel. The comment must be 300 characters or less, contain at most 4 hashtags and 1 URL, and cannot consist entirely of capital letters.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | The text content of the comment to be posted on the media object. Maximum length: 300 characters. Maximum 4 hashtags allowed. Maximum 1 URL allowed. Cannot consist entirely of capital letters. |
| `ig_media_id` | string | Yes | The unique identifier of the Instagram media object where the comment will be posted. This is the ID of the Instagram post, photo, video, or carousel. |
| `graph_api_version` | string | No | Instagram Graph API version to use. Defaults to v21.0. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Post IG User Media

**Slug:** `INSTAGRAM_POST_IG_USER_MEDIA`

Tool to create a media container for Instagram posts. Use this to create a container for images, videos, Reels, or carousels. This is the first step in Instagram's two-step publishing process - after creating the container, use the media_publish endpoint to publish it.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `caption` | string | No | Caption text for the post. Use HTML URL encoding for hashtags (# becomes %23). |
| `children` | array | No | For carousel posts - array of container IDs (2-10 items) from previously created media containers. |
| `cover_url` | string | No | For Reels - MUST be a valid HTTP/HTTPS URL pointing to a custom cover image. Must start with 'http://' or 'https://'. IMPORTANT: URLs with query parameters (like signed URLs) are NOT supported by Instagram. Use direct, publicly accessible URLs without query strings. If both cover_url and thumb_offset provided, cover_url takes precedence. |
| `image_url` | string | No | MUST be a valid HTTP/HTTPS URL pointing to a publicly accessible JPEG image file. Must start with 'http://' or 'https://' (e.g., 'https://example.com/image.jpg'). IMPORTANT: URLs with query parameters (like AWS S3 signed URLs with authentication tokens) are NOT supported by Instagram and will be rejected. Use direct, publicly accessible URLs without query strings. DO NOT pass image descriptions or text - only actual URLs are accepted. At least one of: image_url, image_file, video_url, video_file, or children must be provided. |
| `user_tags` | array | No | Array of user tag objects for tagging public Instagram accounts. For images: x and y coordinates (0.0-1.0, from top-left) are REQUIRED. For Reels: only username is allowed; x/y coordinates CANNOT be used. |
| `video_url` | string | No | MUST be a valid HTTP/HTTPS URL pointing to a publicly accessible video or Reel MP4 file. Must start with 'http://' or 'https://' (e.g., 'https://example.com/video.mp4'). IMPORTANT: URLs with query parameters (like AWS S3 signed URLs with authentication tokens) are NOT supported by Instagram and will be rejected. Use direct, publicly accessible URLs without query strings. DO NOT pass video descriptions or text - only actual URLs are accepted. At least one of: image_url, image_file, video_url, video_file, or children must be provided. When using video_url alone, media_type will be automatically set to 'REELS' if not specified. |
| `audio_name` | string | No | For Reels - custom name for the audio track (default: 'Original Audio'). |
| `ig_user_id` | string | Yes | The unique identifier of the Instagram Business account (IG User ID) to create media for. This must be an Instagram Business account. |
| `image_file` | object | No | Image file to upload. The file will be uploaded to a temporary public URL for Instagram to fetch. At least one of: image_url, image_file, video_url, video_file, or children must be provided. |
| `media_type` | string ("REELS" | "CAROUSEL" | "STORIES") | No | Media type for the container. Valid values: 'REELS' (for video content), 'CAROUSEL' (for carousel posts with children), 'STORIES' (for story posts). When posting video content with video_url alone (no image_url), this will automatically default to 'REELS' if not specified. Note: 'VIDEO' is deprecated and no longer supported - use 'REELS' for all video content. |
| `video_file` | object | No | Video file to upload. The file will be uploaded to a temporary public URL for Instagram to fetch. At least one of: image_url, image_file, video_url, video_file, or children must be provided. |
| `location_id` | string | No | Facebook Page ID of a location to tag. The Page must have latitude/longitude data. |
| `thumb_offset` | integer | No | For videos/Reels - millisecond offset for thumbnail frame (default: 0). |
| `collaborators` | array | No | Array of up to 3 public Instagram usernames to tag as collaborators. Supported for images, videos, and parent carousel containers (not Stories or carousel child items). Cannot be used when is_carousel_item=true - collaborators must be set on the parent carousel container instead. |
| `share_to_feed` | boolean | No | For Reels - whether to share to both Feed and Reels tabs. Only applicable when media_type is REELS. |
| `is_carousel_item` | boolean | No | Indicates this container is part of a carousel. For carousels: create 2-10 individual containers, then create a parent carousel container with their IDs. When true, collaborators cannot be set on this child item - they must be set on the parent carousel container instead. |
| `graph_api_version` | string | No | Instagram Graph API version to use. Defaults to v21.0. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Publish IG User Media

**Slug:** `INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH`

Tool to publish a media container to an Instagram Business account. This action automatically waits for the container to finish processing before publishing. Rate limited to 25 API-published posts per 24-hour moving window. The publishing process: 1. First, create a media container using INSTAGRAM_CREATE_MEDIA_CONTAINER 2. Call this action with the creation_id - it will automatically poll for FINISHED status 3. Once ready, the media is published and the published media ID is returned For videos/reels, processing may take 30-120 seconds. Images are typically instant.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ig_user_id` | string | Yes | Instagram Business Account ID (numeric string) or 'me' for the authenticated user. This ID is returned by INSTAGRAM_GET_USER_INFO or similar actions. Do NOT pass bank account numbers, connection IDs, or other non-Instagram identifiers. |
| `creation_id` | string | Yes | Container ID returned by INSTAGRAM_CREATE_MEDIA_CONTAINER (numeric string). This is NOT the same as ig_user_id. Do NOT pass bank account numbers or other non-Instagram identifiers. |
| `max_wait_seconds` | integer | No | Maximum time in seconds to wait for the container to reach FINISHED status before publishing. Images are typically ready instantly, but videos/reels commonly take 30-120 seconds to process. WARNING: Setting this to 0 skips all status checks and attempts immediate publish, which will fail with error 9007 if the container is still processing (common for videos). Only use 0 if you are certain the container is already in FINISHED status (rare - typically only after manually checking via INSTAGRAM_GET_POST_STATUS). For videos/reels, use at least 60 seconds (default) or higher (up to 300). |
| `graph_api_version` | string | No | Instagram Graph API version to use. Defaults to v21.0. |
| `poll_interval_seconds` | number | No | Interval in seconds between status checks while waiting for the container to be ready. Default is 3 seconds. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Reply to IG User Mentions

**Slug:** `INSTAGRAM_POST_IG_USER_MENTIONS`

Tool to reply to a mention of your Instagram Business or Creator account. Use when you need to respond to comments or media captions where your account has been @mentioned by another Instagram user. This creates a comment on the media or comment containing the mention.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | The text content of your reply to the mention. This creates a comment on the media or comment where you were mentioned. |
| `media_id` | string | Yes | The ID of the Instagram media object (post, photo, video, or carousel) where your account was mentioned. This is the media containing the original mention. |
| `comment_id` | string | No | Optional ID of a specific comment where you were mentioned. If provided, your reply will be directed to that comment. If not provided, the reply will be posted on the media itself. |
| `ig_user_id` | string | Yes | The unique identifier of the Instagram Business or Creator account that was mentioned. This is the ID of your Instagram account that received the mention. |
| `graph_api_version` | string | No | Instagram Graph API version to use. Defaults to v21.0. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Reply To Comment (Deprecated)

**Slug:** `INSTAGRAM_REPLY_TO_COMMENT`

DEPRECATED: Use INSTAGRAM_POST_IG_COMMENT_REPLIES instead. Reply to a comment on Instagram media. Only usable on comments belonging to media owned by the authenticated account. Creates a public, irreversible reply; invoke only with explicit user confirmation, not for bulk or speculative use.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | Reply message text Must comply with Instagram content policies; overly long or policy-violating text may be rejected. |
| `ig_comment_id` | string | Yes | Instagram Comment ID to reply to Must belong to media owned by the authenticated Instagram account; replies to other accounts' media are not permitted. |
| `graph_api_version` | string | No | The Facebook Graph API version to use for the request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Send Image

**Slug:** `INSTAGRAM_SEND_IMAGE`

Send an image via Instagram DM to a specific user. Each send modifies inbox state; avoid bulk or automated sends without explicit user approval.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image_url` | string | Yes | Publicly accessible URL of the image to send. Must be a direct link to an image file (JPEG, PNG, or GIF) that is reachable over HTTPS. The URL must not require authentication to access. |
| `ig_user_id` | string | No | Instagram Business Account ID. Must be a numeric ID string (e.g., '17841400123456789'), not a username. Optional when using /me/messages endpoint. |
| `recipient_id` | string | Yes | Recipient's IGSID (Instagram Scoped User ID). Must be a numeric ID string (e.g., '17841479358498320'), NOT a username. IGSIDs are obtained from conversations or webhook events when users message your business first. You can only send messages to users who have initiated a conversation with your business within the past 24 hours (or 7 days with HUMAN_AGENT tag). |
| `graph_api_version` | string | No | Instagram Graph API version to use (e.g., 'v21.0'). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Send Text Message

**Slug:** `INSTAGRAM_SEND_TEXT_MESSAGE`

Send a text message to an Instagram user via DM in an existing conversation. Cannot initiate new DM threads — a prior conversation must exist. Requires an Instagram Business or Creator account with messaging permissions. Fails with error_subcode 2534022 if outside the messaging window; do not retry these failures.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Message text to send |
| `ig_user_id` | string | No | Instagram Business Account ID (optional when using /me/messages) |
| `recipient_id` | string | Yes | Recipient PSID (Instagram-scoped ID) Must be a real PSID obtained from INSTAGRAM_LIST_ALL_CONVERSATIONS or INSTAGRAM_LIST_ALL_MESSAGES — usernames or fabricated IDs cause HTTP 400 (code 100). |
| `graph_api_version` | string | No | Instagram Graph API version |
| `reply_to_message_id` | string | No | Message ID (mid) to reply to. This creates a visual reply link to the original message in the conversation. The mid can be obtained from webhook events or previous API responses. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Messenger Profile

**Slug:** `INSTAGRAM_UPDATE_MESSENGER_PROFILE`

Tool to update the messenger profile settings for an Instagram account. Use when you need to configure ice breakers and messaging options. Ice breakers are suggested questions that help users start conversations with your Instagram Business account.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ig_user_id` | string | Yes | Instagram Business Account ID whose messenger profile will be updated. |
| `ice_breakers` | array | Yes | Array of ice breaker objects to configure for the messenger profile. Ice breakers provide suggested questions to help users start conversations. Maximum 4 ice breakers allowed. |
| `graph_api_version` | string | No | Instagram Graph API version to use. Defaults to v21.0. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |
