# Anthropic Administrator

The Anthropic Admin API allows programmatic management of organizational resources, including members, workspaces, and API keys.

- **Category:** ai models
- **Auth:** API_KEY
- **Composio Managed App Available?** N/A
- **Tools:** 3
- **Triggers:** 0
- **Slug:** `ANTHROPIC_ADMINISTRATOR`
- **Version:** 20260615_00

## Tools

### Create Message

**Slug:** `ANTHROPIC_ADMINISTRATOR_CREATE_MESSAGE`

Create a message completion from Claude. Send a conversation history with user/assistant messages and receive Claude's response. Useful for: chatbots, Q&A systems, text generation, conversational AI, and any task requiring natural language understanding or generation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Model identifier to use for generating the response. Examples: 'claude-sonnet-4-5-20250929', 'claude-opus-4-5-20251101', 'claude-3-haiku-20240307' Invalid or outdated identifiers trigger a not_found_error; use LIST_MODELS to retrieve current valid identifiers. |
| `top_k` | integer | No | Sample from the top K tokens during generation |
| `top_p` | number | No | Nucleus sampling cutoff probability |
| `system` | string | No | System prompt to provide context and instructions to the model |
| `messages` | array | Yes | List of messages forming the conversation. Must alternate between 'user' and 'assistant' roles, starting with 'user'. Each message must be an object with both 'role' ('user' or 'assistant') and 'content' (string) fields; missing either field causes validation errors. |
| `metadata` | object | No | Object with a user_id key for tracking and abuse detection |
| `max_tokens` | integer | Yes | Maximum number of tokens to generate before stopping. Required parameter. |
| `temperature` | number | No | Sampling temperature between 0 (deterministic) and 1 (most random) |
| `stop_sequences` | array | No | Custom text sequences that will cause the model to stop generating |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Model

**Slug:** `ANTHROPIC_ADMINISTRATOR_GET_MODEL`

Tool to retrieve details of a specific model by its ID. Use after confirming the model ID is valid.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model_id` | string | Yes | ID of the model to retrieve. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List models

**Slug:** `ANTHROPIC_ADMINISTRATOR_LIST_MODELS`

Tool to list available models. Use when you need to see which models are available before selection. Always source model IDs from this tool rather than hard-coding them; stale or outdated model IDs passed to CREATE_MESSAGE will cause a not_found_error.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | integer | No | Number of items per page. Default: 20, range: 1-1000. |
| `after_id` | string | No | Cursor ID to fetch results after this object. |
| `before_id` | string | No | Cursor ID to fetch results before this object. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |
