# OpenAI

Toolkit for OpenAI APIs: manage Assistants, Threads/Messages; upload/list/delete Files; list/retrieve Models (including vision/multimodal); and view fine-tune listings and events.

- **Category:** artificial intelligence
- **Auth:** API_KEY
- **Composio Managed App Available?** N/A
- **Tools:** 126
- **Triggers:** 0
- **Slug:** `OPENAI`
- **Version:** 20260702_00

## Tools

### Add Upload Part

**Slug:** `OPENAI_ADD_UPLOAD_PART`

Tool to add a part (chunk of bytes) to an Upload object. Use when uploading large files in chunks, with each part up to 64 MB.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | object | No | The chunk of bytes for this Part. Each Part can be at most 64 MB. Maximum total upload size is 8 GB across all parts. If not provided, use raw_content with raw_filename and raw_mimetype instead. |
| `upload_id` | string | Yes | The ID of the Upload to add this Part to. |
| `raw_content` | string | No | Base64-encoded file content or raw bytes to upload when FileUploadable is not available. Use this for inline data without needing an S3 key. Each Part can be at most 64 MB. |
| `raw_filename` | string | No | Filename for the inline content (e.g., 'part1.txt'). Required when using raw_content. |
| `raw_mimetype` | string | No | MIME type for the inline content (e.g., 'text/plain', 'application/octet-stream'). Defaults to 'application/octet-stream' if not provided. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Cancel batch

**Slug:** `OPENAI_CANCEL_BATCH`

Tool to cancel an in-progress batch. Use when you need to stop a batch that is currently processing. The batch will be in status 'cancelling' for up to 10 minutes before changing to 'cancelled', where partial results (if any) will be available.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `batch_id` | string | Yes | The ID of the batch to cancel. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Cancel evaluation run

**Slug:** `OPENAI_CANCEL_EVAL_RUN`

Tool to cancel an ongoing evaluation run. Use when you need to stop an evaluation run that is currently in progress.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `run_id` | string | Yes | The ID of the run to cancel |
| `eval_id` | string | Yes | The ID of the evaluation whose run you want to cancel |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Cancel Response

**Slug:** `OPENAI_CANCEL_RESPONSE`

Tool to cancel a background model response by its ID. Use when you need to stop a response that was created with the 'background' parameter set to true. Only background responses can be cancelled; attempting to cancel a non-background response will fail.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `response_id` | string | Yes | The ID of the response to cancel. Only responses created with the 'background' parameter set to true can be cancelled. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Cancel Run

**Slug:** `OPENAI_CANCEL_RUN`

Tool to cancel a run that is currently in progress. Use when you need to stop an assistant run that is taking too long or is no longer needed. The run's status will transition to 'cancelling' and then 'cancelled'.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `run_id` | string | Yes | ID of the run to cancel. The run must be in 'in_progress' status to be cancelled |
| `thread_id` | string | Yes | ID of the thread to which this run belongs |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Cancel upload

**Slug:** `OPENAI_CANCEL_UPLOAD`

Tool to cancel an upload. Use when you need to stop an upload that is in progress. No parts may be added after cancellation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `upload_id` | string | Yes | The ID of the Upload to cancel (path parameter) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Compact Response

**Slug:** `OPENAI_COMPACT_RESPONSE`

Tool to compact a conversation or response to reduce token usage. Use when you need to reduce the size of long conversations while preserving important context. Either provide an array of input messages or reference a previous response ID to compact.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `input` | array | No | Array of message objects to compact. Each message should have role, content array with type and text, and type field. Either input or previous_response_id is required. |
| `model` | string | Yes | Model ID to use for compaction (e.g., 'gpt-4', 'gpt-5', 'o3-mini') |
| `instructions` | string | No | Optional instructions for the compaction process |
| `previous_response_id` | string | No | ID of a previous response to compact. Either input or previous_response_id is required. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Audio Transcription

**Slug:** `OPENAI_CREATE_AUDIO_TRANSCRIPTION`

Tool to transcribe audio files to text via OpenAI Audio Transcriptions API. Use when you need to convert speech in audio files to written text, optionally with timestamps or speaker diarization.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | object | No | Audio file to transcribe. Supported formats: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm. If not provided, use raw_content with raw_filename and raw_mimetype instead. |
| `model` | string | Yes | ID of the model to use for transcription. Options: 'whisper-1', 'gpt-4o-transcribe', 'gpt-4o-mini-transcribe', 'gpt-4o-mini-transcribe-2025-12-15', 'gpt-4o-transcribe-diarize'. |
| `prompt` | string | No | Optional text to guide the model's style or continue a previous audio segment. The prompt should match the audio language. Supported by gpt-4o-transcribe and gpt-4o-mini-transcribe models. |
| `language` | string | No | Language of the input audio in ISO-639-1 format (e.g., 'en' for English, 'es' for Spanish). Providing the language can improve accuracy and speed. |
| `raw_content` | string | No | Base64-encoded audio content or raw bytes to upload when FileUploadable is not available. Use this for inline audio data without needing an S3 key. |
| `temperature` | number | No | Sampling temperature between 0 and 1. Higher values (e.g., 0.8) make output more random, lower values (e.g., 0.2) make it more focused and deterministic. |
| `raw_filename` | string | No | Filename for the inline audio content (e.g., 'audio.mp3', 'recording.wav'). Required when using raw_content. |
| `raw_mimetype` | string | No | MIME type for the inline audio content (e.g., 'audio/mpeg', 'audio/wav'). Defaults to 'audio/mpeg' if not provided. |
| `response_format` | string ("json" | "text" | "srt" | "vtt" | "verbose_json") | No | Format of the transcription output. 'json' returns {text: '...'}. 'verbose_json' includes task, language, duration, segments, and optionally words (with timestamp_granularities). 'text' returns plain text. 'srt' and 'vtt' return subtitle formats. whisper-1 supports all formats. gpt-4o-transcribe and gpt-4o-mini-transcribe support json or text only. |
| `timestamp_granularities` | array | No | Timestamp granularities to include in the response. Use ['word'] for word-level timestamps, ['segment'] for segment-level, or both ['word', 'segment']. Only available when response_format is 'verbose_json'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Audio Translation

**Slug:** `OPENAI_CREATE_AUDIO_TRANSLATION`

Tool to translate audio files to English text via OpenAI Audio Translations API. Use when you need to convert speech in audio files (any language) to English text.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | object | No | Audio file to translate to English. Supported formats: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm. If not provided, use raw_content with raw_filename and raw_mimetype instead. |
| `model` | string | Yes | ID of the model to use for translation. Only 'whisper-1' (powered by Whisper V2 model) is currently available. |
| `prompt` | string | No | Optional text to guide the model's style or continue a previous audio segment. The prompt should be in English. |
| `raw_content` | string | No | Base64-encoded audio content or raw bytes to upload when FileUploadable is not available. Use this for inline audio data without needing an S3 key. |
| `temperature` | number | No | Sampling temperature between 0 and 1. Higher values (e.g., 0.8) make output more random, lower values (e.g., 0.2) make it more focused and deterministic. If set to 0, the model will use log probability to automatically increase the temperature until certain thresholds are hit. |
| `raw_filename` | string | No | Filename for the inline audio content (e.g., 'audio.mp3', 'recording.wav'). Required when using raw_content. |
| `raw_mimetype` | string | No | MIME type for the inline audio content (e.g., 'audio/mpeg', 'audio/wav'). Defaults to 'audio/mpeg' if not provided. |
| `response_format` | string ("json" | "text" | "srt" | "vtt" | "verbose_json") | No | Format of the translation output. 'json' returns {text: '...'}. 'verbose_json' includes task, language, duration, and text. 'text' returns plain text. 'srt' and 'vtt' return subtitle formats. Default is 'json'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Batch

**Slug:** `OPENAI_CREATE_BATCH`

Tool to create and execute a batch from an uploaded file of requests. Use after uploading a JSONL file with purpose 'batch' to process multiple API requests in a single batch operation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `endpoint` | string ("/v1/responses" | "/v1/chat/completions" | "/v1/embeddings" | "/v1/completions" | "/v1/moderations" | "/v1/images/generations" | "/v1/images/edits") | Yes | The endpoint to be used for all requests in the batch. Supported endpoints include /v1/responses, /v1/chat/completions, /v1/embeddings, /v1/completions, /v1/moderations, /v1/images/generations, and /v1/images/edits. Note that /v1/embeddings batches are restricted to a maximum of 50,000 embedding inputs across all requests. |
| `metadata` | object | No | Optional custom metadata for the batch. All values must be strings. |
| `input_file_id` | string | Yes | ID of an uploaded file containing requests for the batch. The file must be formatted as JSONL and uploaded with purpose 'batch'. Can contain up to 50,000 requests and be up to 200 MB in size. |
| `completion_window` | string ("24h") | Yes | Time frame within which the batch should be processed. Currently only '24h' is supported. |
| `output_expires_after` | object | No | Expiration policy for batch output and error files. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Chat Completion

**Slug:** `OPENAI_CREATE_CHAT_COMPLETION`

Tool to create a chat completion response from OpenAI models. Use for conversational AI, text generation, function calling, multimodal tasks with vision/audio, and structured JSON outputs. Supports advanced features like reasoning models, tool use, and streaming responses.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `n` | integer | No | How many chat completion choices to generate for each input message. Default is 1 |
| `seed` | integer | No | If specified, the system will make a best effort to sample deterministically. Determinism is not guaranteed, check system_fingerprint in response |
| `stop` | string | No | Up to 4 sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence |
| `user` | string | No | A unique identifier representing your end-user. Helps OpenAI monitor and detect abuse |
| `audio` | object | No | Parameters for audio output. Supported by audio-capable models |
| `model` | string | Yes | ID of the model to use. Supported models include gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo, o1, o1-mini, o3-mini, and others |
| `store` | boolean | No | Whether to store the output of this chat completion request for use in model distillation or evaluations. Default is true for eligible models |
| `tools` | array | No | A list of tools the model may call. Use this for function calling. The model can choose to call one or more functions |
| `top_p` | number | No | Nucleus sampling parameter. The model considers tokens with top_p probability mass. 0.1 means only tokens comprising the top 10% probability mass are considered. Mutually exclusive with temperature |
| `stream` | boolean | No | If set to true, partial message deltas will be sent as server-sent events (SSE) as they become available |
| `logprobs` | boolean | No | Whether to return log probabilities of the output tokens. If true, returns the log probabilities of each output token in the content |
| `messages` | array | Yes | A list of messages comprising the conversation so far. Each message has a role and content |
| `metadata` | object | No | Developer-defined tags and values for filtering completions in the dashboard. All values must be strings |
| `functions` | array | No | Deprecated. A list of functions the model may generate JSON inputs for. Use tools instead |
| `logit_bias` | object | No | Modify the likelihood of specified tokens appearing in the completion. Maps token IDs to bias values from -100 to 100. Use tokenizer to find token IDs |
| `max_tokens` | integer | No | The maximum number of tokens to generate in the chat completion. The total length of input tokens and generated tokens is limited by the model's context length |
| `modalities` | array | No | Output modalities for the response. Include 'audio' for audio output. Defaults to ['text'] |
| `prediction` | object | No | Configuration for predicted outputs. Used for latency optimization with certain models |
| `temperature` | number | No | Sampling temperature between 0 and 2. Higher values like 0.8 make output more random, lower values like 0.2 make it more focused and deterministic. Mutually exclusive with top_p |
| `tool_choice` | string | No | Controls which tool is called by the model. 'none' means no tool calls, 'auto' lets the model decide, 'required' forces at least one tool call, or specify a particular tool/function |
| `service_tier` | string ("auto" | "default") | No | Specifies the latency tier to use for processing the request. 'auto' lets the system infer the best tier, 'default' uses standard processing |
| `top_logprobs` | integer | No | An integer between 0 and 20 specifying the number of most likely tokens to return at each token position, each with an associated log probability. Requires logprobs=true |
| `function_call` | string | No | Deprecated. Controls which function is called by the model. Use tool_choice instead |
| `stream_options` | object | No | Streaming options configuration. |
| `response_format` | object | No | Response format specification for structured outputs. |
| `presence_penalty` | number | No | Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics |
| `reasoning_effort` | string ("low" | "medium" | "high") | No | Reasoning effort level for reasoning models like o1. 'low' for faster responses, 'high' for more thorough reasoning. Only applicable to reasoning models |
| `frequency_penalty` | number | No | Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim |
| `parallel_tool_calls` | boolean | No | Whether to enable parallel function calling during tool use. Default is true |
| `max_completion_tokens` | integer | No | An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens. Preferred over max_tokens for newer models |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Completion (Legacy)

**Slug:** `OPENAI_CREATE_COMPLETION`

Tool to generate text completions using OpenAI's legacy Completions API. Use for single-turn text generation with models like gpt-3.5-turbo-instruct. Note: This endpoint is legacy; prefer Chat Completions for newer models.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `n` | integer | No | How many completions to generate for each prompt. Note: Because this parameter generates many completions, it can quickly consume your token quota. Use carefully and ensure that you have reasonable settings for max_tokens and stop. Default is 1. |
| `echo` | boolean | No | Echo back the prompt in addition to the completion. Default is false. |
| `seed` | integer | No | If specified, our system will make a best effort to sample deterministically, such that repeated requests with the same seed and parameters should return the same result. Determinism is not guaranteed, and you should refer to the system_fingerprint response parameter to monitor changes in the backend. |
| `stop` | string | No | Up to 4 sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence. Not supported with latest reasoning models o3 and o4-mini. |
| `user` | string | No | A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. |
| `model` | string | Yes | ID of the model to use. You can use the List models API to see all of your available models, or see the Model overview for descriptions of them. Examples: 'gpt-3.5-turbo-instruct', 'davinci-002', 'babbage-002'. |
| `top_p` | number | No | An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered. We generally recommend altering this or temperature but not both. Default is 1. |
| `prompt` | string | Yes | The prompt(s) to generate completions for, encoded as a string, array of strings, array of tokens, or array of token arrays. Note that <\|endoftext\|> is the document separator that the model sees during training, so if a prompt is not specified the model will generate as if from the beginning of a new document. |
| `stream` | boolean | No | Whether to stream back partial progress. If set, tokens will be sent as data-only server-sent events as they become available, with the stream terminated by a data: [DONE] message. Default is false. |
| `suffix` | string | No | The suffix that comes after a completion of inserted text. This parameter is only supported for gpt-3.5-turbo-instruct. |
| `best_of` | integer | No | Generates best_of completions server-side and returns the "best" (the one with the highest log probability per token). Results cannot be streamed. When used with n, best_of controls the number of candidate completions and n specifies how many to return. best_of must be greater than n. Note: Because this parameter generates many completions, it can quickly consume your token quota. Use carefully and ensure that you have reasonable settings for max_tokens and stop. |
| `logprobs` | integer | No | Include the log probabilities on the logprobs most likely output tokens, as well the chosen tokens. For example, if logprobs is 5, the API will return a list of the 5 most likely tokens. The API will always return the logprob of the sampled token, so there may be up to logprobs+1 elements in the response. The maximum value for logprobs is 5. |
| `logit_bias` | object | No | Modify the likelihood of specified tokens appearing in the completion. Accepts a JSON object that maps tokens (specified by their token ID in the GPT tokenizer) to an associated bias value from -100 to 100. You can use this tokenizer tool to convert text to token IDs. Mathematically, the bias is added to the logits generated by the model prior to sampling. The exact effect will vary per model, but values between -1 and 1 should decrease or increase likelihood of selection; values like -100 or 100 should result in a ban or exclusive selection of the relevant token. |
| `max_tokens` | integer | No | The maximum number of tokens that can be generated in the completion. The token count of your prompt plus max_tokens cannot exceed the model's context length. Default is 16. |
| `temperature` | number | No | What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. We generally recommend altering this or top_p but not both. Default is 1. |
| `stream_options` | object | No | Options for streaming responses. Can include 'include_usage' and 'include_obfuscation' fields. |
| `presence_penalty` | number | No | Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics. Default is 0. |
| `frequency_penalty` | number | No | Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim. Default is 0. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Container

**Slug:** `OPENAI_CREATE_CONTAINER`

Tool to create a new container with configurable memory, expiration, file access, and network policies. Use when you need to provision an isolated execution environment.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name of the container to create. |
| `skills` | array | No | Optional list of skills referenced by ID or provided as inline definitions. |
| `file_ids` | array | No | Optional list of file IDs to copy to the container. |
| `memory_limit` | string ("1g" | "4g" | "16g" | "64g") | No | Memory limit options for the container. |
| `expires_after` | object | No | Container expiration configuration. |
| `network_policy` | string | No | Optional network access policy for the container. Can be 'disabled' to block all network access, or 'allowlist' to allow specific domains. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Container File

**Slug:** `OPENAI_CREATE_CONTAINER_FILE`

Tool to create a file in a container. Use when adding files to an existing container either by referencing an uploaded file ID or by uploading raw file content directly.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | string | No | Binary content of the file to upload directly. Use this for multipart/form-data requests. |
| `file_id` | string | No | ID of an existing file to add to the container. Use this for JSON requests. |
| `container_id` | string | Yes | The ID of the container to create the file in |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Conversation

**Slug:** `OPENAI_CREATE_CONVERSATION`

Tool to create a new conversation for multi-turn interactions. Use when initializing a persistent conversation with optional starter messages.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `items` | array | No | Optional initial items to start the conversation with. You may add up to 20 items at a time. |
| `metadata` | object | No | Optional metadata key-value pairs to attach to the conversation. Up to 16 pairs allowed, with keys ≤64 chars and values ≤512 chars. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Conversation Items

**Slug:** `OPENAI_CREATE_CONVERSATION_ITEMS`

Tool to create items in a conversation with the given ID. Use when adding messages or other items to an existing conversation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `items` | array | Yes | The items to add to the conversation. You may add up to 20 items at a time |
| `include` | array | No | Additional fields to include in the response, such as item metadata or extended properties |
| `conversation_id` | string | Yes | The ID of the conversation to add items to |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Embeddings

**Slug:** `OPENAI_CREATE_EMBEDDINGS`

Tool to generate text embeddings via the OpenAI embeddings endpoint. Use for search, clustering, recommendations, and vector database storage workflows.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user` | string | No | A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. |
| `input` | string | Yes | Input text to embed, encoded as a string or array of tokens. To embed multiple inputs in a single request, pass an array of strings or array of token arrays. The input must not exceed the max input tokens for the model (8192 tokens for all embedding models), cannot be an empty string, and any array must be 2048 dimensions or less. |
| `model` | string | Yes | ID of the model to use. Supported models include text-embedding-ada-002, text-embedding-3-small, and text-embedding-3-large. |
| `dimensions` | integer | No | The number of dimensions the resulting output embeddings should have. Only supported in text-embedding-3 and later models. Allows shortening embeddings without losing concept-representing properties. |
| `encoding_format` | string ("float" | "base64") | No | The format to return the embeddings in. Can be either 'float' or 'base64'. Defaults to 'float'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Eval

**Slug:** `OPENAI_CREATE_EVAL`

Tool to create an evaluation structure for testing a model's performance. An evaluation is a set of testing criteria and data source config that dictates the schema of data used in the evaluation. Use when setting up automated testing for model outputs with graders like label_model, string_check, or text_similarity.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name of the evaluation for identification and organization |
| `metadata` | object | No | Optional metadata to attach to the evaluation for organizational purposes |
| `testing_criteria` | array | Yes | A list of graders for all eval runs in this group. Graders can reference variables in the data source using double curly braces notation, like {{item.variable_name}}. To reference the model's output, use the sample namespace (i.e., {{sample.output_text}}). Supported grader types: label_model, string_check, text_similarity, python, score_model |
| `data_source_config` | string | Yes | Configuration for the data source used for the evaluation runs. Dictates the schema of the data used in the evaluation. Options include 'custom' (with custom item_schema), 'logs' (from logged completions), or 'stored_completions' (from stored completion data) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Evaluation Run

**Slug:** `OPENAI_CREATE_EVAL_RUN`

Tool to create a new evaluation run for testing model configurations. Use when you need to kick off an evaluation with a specific data source and model configuration to test.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Name of the evaluation run for identification |
| `eval_id` | string | Yes | ID of the evaluation to create a run for |
| `metadata` | object | No | Optional metadata to attach to the run |
| `data_source` | string | Yes | Details about the run's data source. Specifies the type (jsonl, completions, or responses) and the source of data (file_content with inline items or file_id) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create fine-tuning job

**Slug:** `OPENAI_CREATE_FINE_TUNING_JOB`

Tool to create a fine-tuning job which begins the process of creating a new model from a given dataset. Use when you need to start fine-tuning a model with your training data. Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `seed` | integer | No | The seed controls the reproducibility of the job. Passing in the same seed and job parameters should produce the same results, but may differ in rare cases. If a seed is not specified, one will be generated for you. |
| `model` | string | Yes | The name of the model to fine-tune. You can select one of the supported models for fine-tuning. |
| `method` | object | No | The method used for fine-tuning. Must include a 'type' field set to 'supervised', 'dpo', or 'reinforcement'. Can include method-specific configuration under corresponding keys ('supervised', 'dpo', or 'reinforcement'). |
| `suffix` | string | No | A string of up to 64 characters that will be added to your fine-tuned model name. For example, a suffix of 'custom-model-name' would produce a model name like 'ft:gpt-4o-mini:openai:custom-model-name:7p4lURel'. |
| `metadata` | object | No | Set of 16 key-value pairs that can be attached to the fine-tuning job. This can be useful for storing additional information about the job in a structured format. Keys can be a maximum of 64 characters long and values can be a maximum of 512 characters long. |
| `integrations` | array | No | A list of integrations to enable for your fine-tuning job. Each integration must specify 'type' and 'wandb' configuration. |
| `training_file` | string | Yes | The ID of an uploaded file that contains training data. See upload file for how to upload a file. Your dataset must be formatted as a JSONL file and uploaded with the purpose 'fine-tune'. |
| `hyperparameters` | object | No | The hyperparameters used for the fine-tuning job. This value is now deprecated in favor of 'method', and should be passed in under the 'method' parameter. Can include 'batch_size', 'learning_rate_multiplier', and 'n_epochs'. Each can be either 'auto' (string) or a specific number. |
| `validation_file` | string | No | The ID of an uploaded file that contains validation data. If provided, the data is used to generate validation metrics periodically during fine-tuning. The same data should not be present in both train and validation files. Your dataset must be formatted as a JSONL file and uploaded with the purpose 'fine-tune'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Generate Image

**Slug:** `OPENAI_CREATE_IMAGE`

Tool to generate an image via the OpenAI Images API and return hosted image asset URL and metadata. Use when you need to create images from text descriptions for single-shot image generation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `n` | integer | No | The number of images to generate. For dall-e-3, only n=1 is supported. For dall-e-2, you can request up to 10 images. |
| `size` | string | No | Size of the generated image. For gpt-image-2: any resolution 'WxH' where both edges are multiples of 16, max edge 3840px, 655,360-8,294,400 total pixels, max 3:1 aspect ratio (e.g., '1024x1024', '2048x2048', '3840x2160'), or 'auto' (default). For gpt-image-1: '1024x1024', '1536x1024' (landscape), '1024x1536' (portrait), or 'auto' (default). For dall-e-3: '1024x1024', '1792x1024', '1024x1792'. For dall-e-2: '256x256', '512x512', '1024x1024'. |
| `user` | string | No | A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. |
| `model` | string | Yes | ID of the model to use for image generation. Supported models include: 'gpt-image-2' (newest, state-of-the-art, flexible sizes, png/jpeg/webp output), 'gpt-image-1', 'gpt-image-1-mini', 'gpt-image-1.5', 'chatgpt-image-latest', 'dall-e-3', 'dall-e-2'. Note: DALL-E 2 and DALL-E 3 are deprecated and will stop being supported on 05/12/2026. |
| `style` | string ("vivid" | "natural") | No | The style of the generated image. 'vivid' causes the model to lean towards generating hyper-real and dramatic images. 'natural' causes the model to produce more natural, less hyper-real looking images. Only supported for dall-e-3. |
| `prompt` | string | Yes | A text description of the desired image. Maximum length: 32000 characters for GPT image models, 4000 characters for dall-e-3, 1000 characters for dall-e-2. |
| `quality` | string ("standard" | "hd" | "auto" | "high" | "medium" | "low") | No | Quality values for image generation across different models. |
| `background` | string ("transparent" | "opaque" | "auto") | No | Background transparency setting for the generated image. Only supported for GPT image models. 'transparent' creates images with transparent backgrounds, 'opaque' creates fully opaque backgrounds, 'auto' (default) lets the model decide. Note: gpt-image-2 does NOT support 'transparent' — requests will be transformed to 'auto' with an execution message. |
| `moderation` | string ("auto" | "low") | No | Content moderation strictness. 'auto' (default) applies standard filtering, 'low' applies less restrictive filtering. Supported by gpt-image-2 and gpt-image-1 series. Ignored for dall-e models. |
| `output_format` | string ("png" | "jpeg" | "webp") | No | Output image format. Supported by gpt-image-2 (png/jpeg/webp) and gpt-image-1 series (png/jpeg/webp). Defaults to 'png'. Ignored for dall-e models. |
| `output_compression` | integer | No | Compression level (0-100) for jpeg and webp output formats. Higher values preserve more detail. Only applies when output_format is 'jpeg' or 'webp'. Supported by gpt-image-2 and gpt-image-1 series. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Edit Image

**Slug:** `OPENAI_CREATE_IMAGE_EDIT`

Tool to create edited or extended images via OpenAI Images Edit API. Use when you need to modify existing images based on a text prompt, with optional mask support for targeted edits.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `n` | integer | No | The number of edited images to generate. Default is 1. The exact upper limit may vary by model. |
| `mask` | object | No | Reference an input image by either URL or uploaded file ID. |
| `size` | string | No | Requested output image size. Examples: '1024x1024', '1024x1536', '1536x1024', 'auto'. Default is 'auto', which automatically determines the best size. |
| `user` | string | No | A unique identifier representing your end-user, which can help OpenAI monitor and detect abuse. |
| `model` | string | No | The model to use for image editing. Supported models: 'gpt-image-2' (newest, flexible sizes, png/jpeg/webp output), 'gpt-image-1.5' (default), 'gpt-image-1', 'gpt-image-1-mini', 'chatgpt-image-latest', 'dall-e-2'. Note: JSON edits support GPT image models only; DALL-E edits require multipart format. gpt-image-2 does NOT support 'transparent' background — requests will be transformed to 'auto'. |
| `images` | array | Yes | Input image references to edit. For GPT image models, you can provide up to 16 images. Each image reference must provide either 'image_url' or 'file_id', not both. |
| `prompt` | string | Yes | A text description of the desired image edit. Describes what changes should be made to the input image(s). Maximum 32000 characters. |
| `quality` | string ("auto" | "high" | "medium" | "low") | No | Quality values for image editing. |
| `background` | string ("auto" | "transparent" | "opaque") | No | Background behavior for generated image output. |
| `moderation` | string | No | Moderation level for GPT image models. Default is 'auto'. Controls content moderation strictness. |
| `output_format` | string ("png" | "webp" | "jpeg") | No | Output image format. |
| `input_fidelity` | string | No | Controls fidelity to the original input image(s). Higher fidelity preserves more of the original image characteristics. |
| `output_compression` | integer | No | Compression level for 'jpeg' or 'webp' output. Range: 0-100. Higher values mean better quality but larger file sizes. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Image Variation

**Slug:** `OPENAI_CREATE_IMAGE_VARIATION`

Tool to create a variation of a given image using the OpenAI Images API. Use when you need to generate alternative versions of an existing image. Only supports dall-e-2 model.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `n` | integer | No | The number of images to generate. Must be between 1 and 10. Defaults to 1. |
| `size` | string ("256x256" | "512x512" | "1024x1024") | No | Size options for image variations with dall-e-2. |
| `user` | string | No | A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. |
| `image` | object | Yes | The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square. |
| `model` | string | No | The model to use for image generation. Only 'dall-e-2' is supported at this time. Defaults to 'dall-e-2' if not specified. |
| `response_format` | string ("url" | "b64_json") | No | Format of the response for image generation. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Message

**Slug:** `OPENAI_CREATE_MESSAGE`

Tool to create a new message in a specific thread. Appends the message only — does not trigger a model response; create a separate run to obtain assistant replies. Use when adding messages to an existing conversation after confirming the thread ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string ("user" | "assistant") | Yes | REQUIRED. Role of the message sender: 'user' or 'assistant'. Use 'user' for user-generated messages, 'assistant' for assistant-generated messages. Example: {'thread_id': 'thread_abc123', 'role': 'user', 'content': 'Hello'} |
| `content` | string | Yes | Message content as a string or list of structured parts Must be non-empty; empty or missing content causes the request to fail. |
| `metadata` | object | No | Up to 16 key-value pairs of metadata (keys ≤64 chars, values ≤512 chars) |
| `thread_id` | string | Yes | ID of the thread to create the message in Must be from a prior OPENAI_CREATE_THREAD call; incorrect IDs route messages to wrong threads or cause errors. |
| `attachments` | array | No | Optional files to attach to the message Each entry requires a valid `file_id` (from OPENAI_UPLOAD_FILE) and a recognized tool name; missing or unknown tool names cause validation failures. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Moderation

**Slug:** `OPENAI_CREATE_MODERATION`

Tool to classify text and/or image inputs for potentially harmful content via the OpenAI Moderation API. Use for content safety checks, filtering user-generated content, or monitoring for policy violations across 13 harm categories including harassment, hate, violence, sexual content, self-harm, and illicit activities.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `input` | string | Yes | Input (or inputs) to classify. Can be a single string, an array of strings, or an array of multi-modal input objects with text and images. For multi-modal inputs, each object should have 'type' ('text' or 'image_url') and corresponding content fields. |
| `model` | string | No | The content moderation model to use. Options include: 'omni-moderation-latest' (default, supports text and images), 'omni-moderation-2024-09-26' (specific omni version), 'text-moderation-latest' (text-only, latest version), 'text-moderation-stable' (text-only, stable version), 'text-moderation-007' (text-only, legacy version). Learn more in the moderation guide and available models documentation. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Realtime Call

**Slug:** `OPENAI_CREATE_REALTIME_CALL`

Tool to create a Realtime API call over WebRTC and receive the SDP answer needed to complete the peer connection. Use when initiating a bidirectional audio/data WebRTC session with OpenAI's Realtime API. Returns the SDP answer and call ID for connection establishment.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sdp` | string | Yes | WebRTC Session Description Protocol (SDP) offer generated by the caller. This must be a complete SDP offer with media descriptions (audio), ICE parameters, fingerprints, and other WebRTC connection details. The SDP establishes the peer connection parameters. |
| `model` | string | Yes | The Realtime model to use for the call. Example: 'gpt-4o-realtime-preview-2024-12-17'. This model handles bidirectional audio streaming and data channel messaging over WebRTC. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Realtime Client Secret

**Slug:** `OPENAI_CREATE_REALTIME_CLIENT_SECRET`

Tool to create an ephemeral client secret for authenticating Realtime API connections. Use when you need to establish a WebSocket connection to OpenAI's Realtime API for voice or streaming interactions.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session` | string | No | Session configuration. Choose either a realtime session (type='realtime') or a transcription session (type='transcription'). If not provided, defaults to a basic realtime session |
| `expires_after` | object | No | Configuration for the client secret expiration. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Realtime Session

**Slug:** `OPENAI_CREATE_REALTIME_SESSION`

Tool to create an ephemeral API token for client-side Realtime API applications. Use when setting up browser-based real-time audio/text interactions.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Model to use for the realtime session |
| `speed` | number | No | The speed of the model's spoken response. 1.0 is default, 0.25 is minimum, 1.5 is maximum |
| `tools` | array | No | Tools (functions) available to the model |
| `voice` | string | No | A built-in voice name or a custom voice reference |
| `prompt` | object | No | Prompt configuration. |
| `tracing` | string | No | Configuration options for tracing. Set to null to disable. 'auto' creates a trace with default values |
| `modalities` | array | No | The set of modalities the model can respond with. To disable audio, set this to ['text'] |
| `truncation` | string | No | Truncation configuration. Controls how conversation is truncated when exceeding token limits |
| `temperature` | number | No | Sampling temperature for the model, limited to [0.6, 1.2]. Defaults to 0.8 |
| `tool_choice` | string | No | How the model chooses tools. Options are 'auto', 'none', 'required', or specify a function |
| `instructions` | string | No | System instructions for the model. Guides the model on desired responses and behavior |
| `turn_detection` | object | No | Configuration for turn detection (server VAD). |
| `input_audio_format` | string ("pcm16" | "g711_ulaw" | "g711_alaw") | No | The format of input audio |
| `output_audio_format` | string ("pcm16" | "g711_ulaw" | "g711_alaw") | No | The format of output audio |
| `input_audio_transcription` | object | No | Configuration for input audio transcription. |
| `max_response_output_tokens` | string | No | Maximum number of output tokens for a single assistant response. Provide an integer between 1 and 4096, or 'inf' for maximum available |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Realtime Transcription Session

**Slug:** `OPENAI_CREATE_REALTIME_TRANSCRIPTION_SESSION`

Tool to create an ephemeral API token for realtime transcriptions via the Realtime API. Use when you need to authenticate browser clients for realtime audio transcription sessions. Returns a session object with a client_secret containing a usable ephemeral API token.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `include` | array | No | The set of items to include in the transcription. Current available items are: 'item.input_audio_transcription.logprobs' |
| `turn_detection` | object | No | Configuration for turn detection. |
| `input_audio_format` | string ("pcm16" | "g711_ulaw" | "g711_alaw") | No | Format of input audio for realtime transcription. |
| `input_audio_transcription` | object | No | Configuration for input audio transcription. |
| `input_audio_noise_reduction` | object | No | Configuration for input audio noise reduction. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Response

**Slug:** `OPENAI_CREATE_RESPONSE`

Tool to generate a one-shot model response via the Responses API. Use for multimodal analysis (image + text), OCR/text extraction from images, or structured JSON outputs. For structured outputs, configure text.format with type='json_schema' and your schema. Returns the full Response object including id, output array, and aggregated output_text for parsing structured data.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | object | No | Text output configuration. |
| `input` | string | Yes | Input as a string for simple text prompts, or array of message objects for conversations or multimodal inputs with images |
| `model` | string | Yes | Model to use for the response |
| `store` | boolean | No | Whether to store the response for model distillation and training. Set to false to opt out |
| `tools` | array | No | List of tools the model can call. Supports function, code_interpreter, file_search, and web_search |
| `top_p` | number | No | Nucleus sampling parameter. Alternative to temperature. Not supported with reasoning models |
| `stream` | boolean | No | Whether to stream the response. Returns a stream of events during generation |
| `metadata` | object | No | Optional metadata to attach to the response. All values must be strings |
| `reasoning` | object | No | Reasoning configuration for reasoning models. |
| `background` | boolean | No | Whether to run the model response in the background. When set to true, the response is created asynchronously and can be polled for completion. Only background responses can be cancelled |
| `modalities` | array | No | Output modalities. Include 'audio' for audio output. Defaults to ['text'] |
| `temperature` | number | No | Sampling temperature between 0 and 2. Higher values (e.g., 0.8) make output more random, lower values (e.g., 0.2) more focused. Not supported with reasoning models |
| `tool_choice` | string | No | Controls which tool is called. 'auto' lets model decide, 'none' disables tools, 'required' forces a tool call, or specify a particular function |
| `max_output_tokens` | integer | No | Maximum number of tokens the model can generate in the response |
| `parallel_tool_calls` | boolean | No | Whether to enable parallel function calling. Default is true |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Run

**Slug:** `OPENAI_CREATE_RUN`

Tool to create a run on a thread with an assistant. Use when you need to execute an assistant to generate responses. Creating a message alone does not cause the assistant to respond; a run is the execution primitive. After creating the run, typically poll the run status until it reaches a terminal state (completed, failed, cancelled, expired), then read the assistant's messages from the thread.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | No | Override the model used for this run. If not specified, uses the assistant's model |
| `tools` | array | No | Override the tools the assistant can use for this run |
| `top_p` | number | No | Nucleus sampling parameter. Alternative to temperature |
| `stream` | boolean | No | If true, returns a stream of events during the run |
| `metadata` | object | No | Up to 16 key-value pairs of metadata (keys ≤64 chars, values ≤512 chars) |
| `thread_id` | string | Yes | ID of the thread to run. Note: A thread can only have one active run at a time. If a run is already active (status: queued, in_progress, requires_action, or cancelling), wait for it to complete or cancel it before creating a new run. |
| `temperature` | number | No | Sampling temperature between 0 and 2. Higher values make output more random |
| `tool_choice` | string | No | Controls which tool is called. Can be 'none', 'auto', 'required', or a specific tool object |
| `assistant_id` | string | Yes | ID of the assistant to use for this run |
| `instructions` | string | No | Override the assistant's instructions for this run |
| `response_format` | string | No | Format for the model's output. Can be 'auto' or an object specifying the format |
| `reasoning_effort` | string | No | Reasoning effort level for reasoning models (e.g., 'low', 'medium', 'high') |
| `max_prompt_tokens` | integer | No | Maximum number of prompt tokens to use for the run |
| `additional_messages` | array | No | Additional messages to add to the thread before creating the run |
| `parallel_tool_calls` | boolean | No | Whether to enable parallel function calling during tool use. Default is true |
| `truncation_strategy` | object | No | Controls how the thread will be truncated prior to the run. |
| `max_completion_tokens` | integer | No | Maximum number of completion tokens that can be generated |
| `additional_instructions` | string | No | Additional instructions to append to the assistant's instructions |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Skill

**Slug:** `OPENAI_CREATE_SKILL`

Tool to create a skill from uploaded files. Use when you need to create a new skill with SKILL.md and supporting files.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `files` | array | Yes | List of files to upload for the skill. Must include at least a SKILL.md file. The SKILL.md file should contain frontmatter with name and description. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Speech (TTS)

**Slug:** `OPENAI_CREATE_SPEECH`

Tool to generate text-to-speech audio using OpenAI's Audio API. Use when you need to convert text to natural-sounding speech with a choice of voices and models. Returns a hosted audio file URL with metadata, not raw bytes.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `input` | string | Yes | Text to convert to speech. Maximum 4096 characters. The text will be spoken by the selected voice using the chosen model. |
| `model` | string ("gpt-4o-mini-tts" | "tts-1" | "tts-1-hd") | Yes | TTS model to use for audio generation. Options: 'gpt-4o-mini-tts' (GPT-4o mini TTS model), 'tts-1' (standard quality, faster), 'tts-1-hd' (high quality, slower). |
| `speed` | number | No | Playback speed of the audio. Range: 0.25 to 4.0. Default is 1.0. Values < 1.0 slow down speech, > 1.0 speed it up. |
| `voice` | string ("alloy" | "ash" | "ballad" | "coral" | "echo" | "fable" | "onyx" | "nova" | "sage" | "shimmer" | "verse") | Yes | Voice to use for audio generation. Available voices: 'alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer', 'verse'. Each voice has a distinct tone and personality. |
| `response_format` | string ("mp3" | "opus" | "aac" | "flac" | "wav" | "pcm") | No | Audio format for the output. Supported formats: 'mp3' (default, widely compatible), 'opus' (low latency streaming), 'aac' (digital audio compression), 'flac' (lossless), 'wav' (uncompressed), 'pcm' (raw 16-bit PCM audio at 24kHz). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Thread

**Slug:** `OPENAI_CREATE_THREAD`

Tool to create a new thread. Use when initializing a conversation with optional starter messages. Returns a thread_id that must be persisted and passed to all subsequent calls (e.g., OPENAI_CREATE_MESSAGE, OPENAI_RETRIEVE_THREAD). Create a fresh thread for each independent conversation or unrelated task.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messages` | array | No | Optional initial messages to start the thread with Each message must include `role` ('user' or 'assistant') and a non-empty string `content`; missing or invalid values will reject the request. |
| `metadata` | object | No | Optional metadata key-value pairs to attach to the thread Keys and values must be short strings; nested objects or large payloads are rejected. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Thread And Run

**Slug:** `OPENAI_CREATE_THREAD_AND_RUN`

Tool to create a thread and run it in one request. Use when you need to start a new conversation and immediately execute the assistant to generate a response. This is more efficient than calling create_thread and create_run separately.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | No | Override the model used for this run. If not specified, uses the assistant's model |
| `tools` | array | No | Override the tools the assistant can use for this run (max 20 tools) |
| `top_p` | number | No | Nucleus sampling parameter (top_p). Alternative to temperature. Default is 1 |
| `stream` | boolean | No | If true, returns a stream of events during the run as server-sent events |
| `thread` | object | No | Parameters for creating a new thread. |
| `metadata` | object | No | Up to 16 key-value pairs of metadata (keys ≤64 chars, values ≤512 chars) |
| `temperature` | number | No | Sampling temperature between 0 and 2. Higher values make output more random. Default is 1 |
| `tool_choice` | string | No | Controls which tool is called. Can be 'none', 'auto', 'required', or a specific tool object |
| `assistant_id` | string | Yes | ID of the assistant to use for this run |
| `instructions` | string | No | Override the assistant's instructions for this run |
| `tool_resources` | object | No | Tool resources for the run. |
| `response_format` | string | No | Format for the model's output. Can be 'auto' or an object specifying the format |
| `max_prompt_tokens` | integer | No | Maximum number of prompt tokens to use for the run (minimum 256) |
| `parallel_tool_calls` | boolean | No | Whether to enable parallel function calling during tool use. Default is true |
| `truncation_strategy` | object | No | Controls how the thread will be truncated prior to the run. |
| `max_completion_tokens` | integer | No | Maximum number of completion tokens that can be generated (minimum 256) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Upload

**Slug:** `OPENAI_CREATE_UPLOAD`

Tool to create an intermediate Upload object for large file uploads. Use when uploading files larger than the direct upload limit by adding Parts to the Upload. The Upload accepts up to 8 GB total and expires after one hour if not completed.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bytes` | integer | Yes | The total number of bytes in the file you are uploading. Maximum 8 GB (8589934592 bytes) |
| `purpose` | string ("assistants" | "batch" | "fine-tune" | "vision") | Yes | The intended purpose of the uploaded file. Must be one of: 'assistants', 'batch', 'fine-tune', or 'vision' |
| `filename` | string | Yes | The name of the file to upload |
| `mime_type` | string | Yes | The MIME type of the file. This must fall within the supported MIME types for your file purpose |
| `expires_after` | object | No | Expiration policy for a file. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Vector Store

**Slug:** `OPENAI_CREATE_VECTOR_STORE`

Tool to create a new vector store. Use when you need to create a collection of processed files for file_search tools.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | The name of the vector store. If not provided, the vector store will have no name. |
| `file_ids` | array | No | A list of File IDs that the vector store should use. Useful for tools like file_search that can access files. Maximum 500 file IDs allowed. |
| `metadata` | object | No | Set of up to 16 key-value pairs that can be attached to the vector store. Keys can be a maximum of 64 characters long and values can be a maximum of 512 characters long. |
| `expires_after` | object | No | Expiration policy for a vector store. |
| `chunking_strategy` | string | No | The chunking strategy used to chunk the file(s). If not set, will use the 'auto' strategy. Only applicable if file_ids is non-empty. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Vector Store File

**Slug:** `OPENAI_CREATE_VECTOR_STORE_FILE`

Tool to create a vector store file by attaching a File to a vector store. Use when you need to add files to a vector store for file search capabilities.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | A File ID that the vector store should use. Useful for tools like file_search that can access files. |
| `vector_store_id` | string | Yes | The ID of the vector store for which to create a File. |
| `chunking_strategy` | string | No | The chunking strategy used to chunk the file(s). If not set, will use the 'auto' strategy. Can be either 'auto' or 'static'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create vector store file batch

**Slug:** `OPENAI_CREATE_VECTOR_STORE_FILE_BATCH`

Tool to create a vector store file batch. Use when attaching multiple files to a vector store for file search capabilities.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `files` | array | No | A list of objects that each include a file_id plus optional attributes or chunking_strategy. Use this when you need to override metadata for specific files. The global attributes or chunking_strategy will be ignored and must be specified for each file. Mutually exclusive with 'file_ids'. |
| `file_ids` | array | No | A list of File IDs that the vector store should use. Useful for tools like file_search that can access files. If attributes or chunking_strategy are provided at the top level, they will be applied to all files in the batch. Mutually exclusive with 'files'. |
| `attributes` | object | No | Optional metadata attributes to apply to all files in the batch. All values must be strings. Ignored if 'files' is provided instead of 'file_ids'. |
| `vector_store_id` | string | Yes | The ID of the vector store for which to create a file batch. |
| `chunking_strategy` | string | No | The chunking strategy used to chunk the file(s). If not set, will use the 'auto' strategy. Applies to all files if 'file_ids' is used. Ignored if 'files' is provided. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Video

**Slug:** `OPENAI_CREATE_VIDEO`

Tool to create a video using Sora models via the OpenAI Videos API. Use when you need to generate videos from text descriptions. The response includes a job ID and status for tracking the asynchronous video generation process.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `size` | string ("720x1280" | "1280x720" | "1024x1792" | "1792x1024") | No | Resolution options for video generation. |
| `model` | string | No | ID of the Sora model to use for video generation. If not specified, the default model will be used. Common models include 'veo-2.0' and other Sora variants. |
| `prompt` | string | Yes | Text prompt that describes the video to generate. The prompt guides the visual content, scene composition, motion, and style of the video. Maximum length: 32000 characters. |
| `seconds` | string ("4" | "8" | "12") | No | Duration options for video generation. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Create Video Remix

**Slug:** `OPENAI_CREATE_VIDEO_REMIX`

Tool to create a video remix from an existing generated video using OpenAI's Video API. Use when you need to transform or modify a previously generated video based on a new prompt. The remix operation creates a new video job that applies the new prompt to the original video content.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | Updated text prompt that directs the remix generation. Describes the transformations or changes to apply to the original video. |
| `video_id` | string | Yes | The identifier of the completed video to remix. Must be a valid video ID from a previously generated video. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete assistant

**Slug:** `OPENAI_DELETE_ASSISTANT`

Tool to delete a specific assistant by its ID. Use when you need to remove an assistant after confirming its ID. Deletion is irreversible and permanently removes all assistant configuration.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `assistant_id` | string | Yes | Identifier of the assistant to delete (path parameter) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete chat completion

**Slug:** `OPENAI_DELETE_CHAT_COMPLETION`

Tool to delete a stored chat completion by its ID. Use when you need to remove a chat completion that was created with store=true.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `completion_id` | string | Yes | The ID of the chat completion to delete. Only chat completions created with store=true can be deleted. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete container

**Slug:** `OPENAI_DELETE_CONTAINER`

Tool to delete a specific container by its ID. Use when you need to remove a container after confirming its ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `container_id` | string | Yes | The ID of the container to delete (path parameter) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete container file

**Slug:** `OPENAI_DELETE_CONTAINER_FILE`

Tool to delete a file from a container. Use when you need to remove a file from a specific container by providing both container ID and file ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | ID of the file to delete from the container (path parameter) |
| `container_id` | string | Yes | ID of the container containing the file (path parameter) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete conversation

**Slug:** `OPENAI_DELETE_CONVERSATION`

Tool to delete a conversation by its ID. Items in the conversation will not be deleted. Use when you need to remove a conversation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `conversation_id` | string | Yes | The ID of the conversation to delete. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete conversation item

**Slug:** `OPENAI_DELETE_CONVERSATION_ITEM`

Tool to delete an item from a conversation with the given IDs. Use when you need to remove a specific message or item from a conversation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item_id` | string | Yes | The ID of the item to delete |
| `conversation_id` | string | Yes | The ID of the conversation that contains the item |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete evaluation

**Slug:** `OPENAI_DELETE_EVAL`

Tool to delete a specific evaluation by its ID. Use when you need to remove an evaluation after confirming its ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eval_id` | string | Yes | The ID of the evaluation to delete (path parameter) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete evaluation run

**Slug:** `OPENAI_DELETE_EVAL_RUN`

Tool to delete an evaluation run. Use when you need to permanently remove a specific run from an evaluation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `run_id` | string | Yes | The ID of the run to delete |
| `eval_id` | string | Yes | The ID of the evaluation to delete the run from |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete file

**Slug:** `OPENAI_DELETE_FILE`

Tool to delete a file by its ID after confirming the target. Files persist indefinitely and count against storage quotas; periodically list and remove unneeded files to avoid hitting file-count or size caps.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | ID of the file to delete (path parameter) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete message

**Slug:** `OPENAI_DELETE_MESSAGE`

Tool to delete a message from a thread. Use when you need to remove a specific message by its ID after confirming both the thread and message IDs.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `thread_id` | string | Yes | The ID of the thread to which this message belongs. |
| `message_id` | string | Yes | The ID of the message to delete. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete response

**Slug:** `OPENAI_DELETE_RESPONSE`

Tool to delete a model response with the given ID. Use when you need to remove a stored response from the Responses API.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `response_id` | string | Yes | The ID of the response to delete (path parameter) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete skill

**Slug:** `OPENAI_DELETE_SKILL`

Tool to delete a specific skill by its ID. Use when you need to remove a skill after confirming its ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `skill_id` | string | Yes | The identifier of the skill to delete (path parameter) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete thread

**Slug:** `OPENAI_DELETE_THREAD`

Tool to delete a thread by its ID. Use when you need to remove a conversation thread after confirming the target ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `thread_id` | string | Yes | The ID of the thread to delete (path parameter) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Vector Store

**Slug:** `OPENAI_DELETE_VECTOR_STORE`

Tool to delete a vector store. Use when you need to permanently remove a vector store by its ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `vector_store_id` | string | Yes | The ID of the vector store to delete. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete Vector Store File

**Slug:** `OPENAI_DELETE_VECTOR_STORE_FILE`

Tool to delete a vector store file. This removes the file from the vector store but does not delete the file itself. Use when you need to remove a file from a vector store's search index.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file to delete from the vector store. |
| `vector_store_id` | string | Yes | The ID of the vector store that the file belongs to. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Delete video

**Slug:** `OPENAI_DELETE_VIDEO`

Tool to delete a video by its ID. Use when you need to remove a video after confirming its identifier.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `video_id` | string | Yes | The identifier of the video to delete (path parameter) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Download file

**Slug:** `OPENAI_DOWNLOAD_FILE`

Tool to download the contents of a specified file by its ID. Use when you need to retrieve file content from OpenAI.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file to use for this request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Download Video Content

**Slug:** `OPENAI_DOWNLOAD_VIDEO`

Tool to download video content (MP4) or preview assets from OpenAI Videos API. Use when you need to retrieve the actual video file, thumbnail, or spritesheet for a generated video.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `variant` | string ("video" | "thumbnail" | "spritesheet") | No | Which downloadable asset to return. Options: 'video' (default, MP4 video file), 'thumbnail' (preview thumbnail image), 'spritesheet' (sprite sheet for preview scrubbing). |
| `video_id` | string | Yes | The identifier of the video whose media to download. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Chat Completion

**Slug:** `OPENAI_GET_CHAT_COMPLETION`

Tool to retrieve a stored chat completion. Use when you need to fetch a previously created chat completion that was stored with store=true.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `completion_id` | string | Yes | The ID of the chat completion to retrieve. Only completions created with store=true can be retrieved |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Chat Completion Messages

**Slug:** `OPENAI_GET_CHAT_COMPLETION_MESSAGES`

Tool to retrieve messages from a stored chat completion. Use when you need to fetch the conversation history of a previously created chat completion. Only works with completions that were created with the store parameter set to true.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Identifier for the last message from the previous pagination request. Use to fetch the next page of results |
| `limit` | integer | No | Number of messages to retrieve. Default is 20 |
| `order` | string ("asc" | "desc") | No | Sort order for messages by timestamp. |
| `completion_id` | string | Yes | The ID of the chat completion to retrieve messages from. Only completions created with store=true will be retrievable |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get ChatKit thread

**Slug:** `OPENAI_GET_CHATKIT_THREAD`

Tool to retrieve a ChatKit thread by its ID. Use when you need to fetch details about a specific ChatKit thread including its status, title, and owner.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `thread_id` | string | Yes | Identifier of the ChatKit thread to retrieve. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Conversation Item

**Slug:** `OPENAI_GET_CONVERSATION_ITEM`

Tool to retrieve a single item from a conversation. Use when you need to fetch details of a specific message or item within a conversation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `include` | array | No | Additional fields to include in the response, such as item metadata or extended properties |
| `item_id` | string | Yes | The ID of the item to retrieve |
| `conversation_id` | string | Yes | The ID of the conversation that contains the item |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Eval

**Slug:** `OPENAI_GET_EVAL`

Tool to retrieve an evaluation by ID. Use when you need to inspect an existing evaluation's configuration, data source settings, or testing criteria.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eval_id` | string | Yes | The ID of the evaluation to retrieve |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Evaluation Run

**Slug:** `OPENAI_GET_EVAL_RUN`

Tool to retrieve an evaluation run by ID to check status and results. Use when you need to monitor an evaluation run's progress or retrieve its final results after creation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `run_id` | string | Yes | ID of the run to retrieve |
| `eval_id` | string | Yes | ID of the evaluation to retrieve runs for |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Eval Run Output Item

**Slug:** `OPENAI_GET_EVAL_RUN_OUTPUT_ITEM`

Tool to retrieve a specific output item from an evaluation run by its ID. Use when you need detailed results for a particular test case within an evaluation run.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `run_id` | string | Yes | The ID of the run to retrieve |
| `eval_id` | string | Yes | The ID of the evaluation to retrieve runs for |
| `output_item_id` | string | Yes | The ID of the output item to retrieve |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get eval run output items

**Slug:** `OPENAI_GET_EVAL_RUN_OUTPUT_ITEMS`

Tool to get a list of output items for an evaluation run. Use when you need to retrieve the detailed results of an eval run, including grading outcomes, input/output samples, and token usage.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Identifier for the last output item from the previous pagination request |
| `limit` | integer | No | Number of output items to retrieve |
| `order` | string ("asc" | "desc") | No | Sort order for output items. |
| `run_id` | string | Yes | The ID of the run to retrieve output items for |
| `status` | string ("fail" | "pass") | No | Status filter for output items. |
| `eval_id` | string | Yes | The ID of the evaluation to retrieve runs for |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Evaluation Runs

**Slug:** `OPENAI_GET_EVAL_RUNS`

Tool to get a paginated list of runs for an evaluation. Use when you need to retrieve all runs or check the status of multiple runs for a specific evaluation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Identifier for the last run from the previous pagination request. Use this to fetch the next page of results. |
| `limit` | integer | No | Number of runs to retrieve. Default is 20. |
| `order` | string ("asc" | "desc") | No | Sort order for evaluation runs. |
| `status` | string ("queued" | "in_progress" | "completed" | "canceled" | "failed") | No | Status filter for evaluation runs. |
| `eval_id` | string | Yes | The ID of the evaluation to retrieve runs for |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Input Token Counts

**Slug:** `OPENAI_GET_INPUT_TOKEN_COUNTS`

Tool to calculate input token counts for OpenAI API requests. Use when you need to estimate token usage before making an API call, validate content fits within model limits, or optimize prompts for token efficiency.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | object | No | Configuration for text output formatting. |
| `input` | string | No | Input content to count tokens for. Can be a simple text string or a structured object. Use this for single input token counting |
| `model` | string | No | ID of the model to use for token counting. Required for accurate token counts. Examples: 'gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'. Different models may use different tokenization, so specify the model you plan to use |
| `tools` | array | No | List of tools/functions available to the model. Include this if you're using function calling to get accurate token counts |
| `reasoning` | object | No | Configuration for reasoning parameters. |
| `truncation` | string ("auto" | "disabled") | No | Truncation mode for input content. |
| `tool_choice` | object | No | Tool choice configuration. Include when using specific tool selection strategies |
| `conversation` | object | No | Conversation object to count tokens for. Use when counting tokens for a full conversation context |
| `instructions` | string | No | System instructions or prompts to include in token count. Use when you need to account for instruction tokens in the total count |
| `parallel_tool_calls` | boolean | No | Whether to enable parallel tool calling. Affects token count when using multiple tools |
| `previous_response_id` | string | No | ID of a previous response to include in the context for token counting |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Message

**Slug:** `OPENAI_GET_MESSAGE`

Tool to retrieve a specific message from a thread by its ID. Use when you need to fetch details of a particular message in an Assistants thread.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `thread_id` | string | Yes | The ID of the thread to which this message belongs |
| `message_id` | string | Yes | The ID of the message to retrieve |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Response

**Slug:** `OPENAI_GET_RESPONSE`

Tool to retrieve a model response by ID. Use when you need to check the status, output, or metadata of a previously created response.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `stream` | boolean | No | If true, the model response data will be streamed using server-sent events. See OpenAI Streaming documentation for details |
| `include` | array | No | Additional fields to include in the response (e.g., conversation details or other metadata) |
| `response_id` | string | Yes | The ID of the response to retrieve |
| `starting_after` | integer | No | The sequence number of the event after which to start streaming (only applicable when stream=true) |
| `include_obfuscation` | boolean | No | When true, stream obfuscation adds random characters to normalize payload sizes for security. Set to false to optimize bandwidth if network is trusted. Only applies to streaming |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Run Step

**Slug:** `OPENAI_GET_RUN_STEP`

Tool to retrieve a specific run step from an Assistants API run to inspect detailed execution progress, view tool calls, or check message creation. Use when you need details about a specific step in a run's execution.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `run_id` | string | Yes | The ID of the run to which the run step belongs. |
| `include` | array | No | Additional fields to include in the response. Use 'step_details.tool_calls[*].file_search.results[*].content' to include file search result content. |
| `step_id` | string | Yes | The ID of the run step to retrieve. |
| `thread_id` | string | Yes | The ID of the thread to which the run and run step belongs. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Vector Store

**Slug:** `OPENAI_GET_VECTOR_STORE`

Tool to retrieve a vector store by its ID. Use when you need to get details of an existing vector store for file_search operations.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `vector_store_id` | string | Yes | The ID of the vector store to retrieve. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Vector Store File

**Slug:** `OPENAI_GET_VECTOR_STORE_FILE`

Tool to retrieve a file from a vector store. Use when you need to check the status or details of a file attached to a vector store.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file being retrieved. |
| `vector_store_id` | string | Yes | The ID of the vector store that the file belongs to. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Vector Store File Batch

**Slug:** `OPENAI_GET_VECTOR_STORE_FILE_BATCH`

Tool to retrieve a vector store file batch. Use when you need to check the status of a batch file processing operation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `batch_id` | string | Yes | The ID of the file batch being retrieved. |
| `vector_store_id` | string | Yes | The ID of the vector store that the file batch belongs to. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Get Video

**Slug:** `OPENAI_GET_VIDEO`

Tool to retrieve a video generation job by its unique identifier. Use when you need to check the status, progress, or details of a video generation task.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `video_id` | string | Yes | The unique identifier of the video generation job to retrieve. This ID is returned when you create a video generation job. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Assistants

**Slug:** `OPENAI_LIST_ASSISTANTS`

Tool to list assistants to discover the correct assistant_id by name or metadata. Use when assistant_id is unknown to avoid 404 errors.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for pagination. Provide an object ID to fetch the next page after that ID. |
| `limit` | integer | No | Limit on the number of assistants to return (1-100). Default is 20. |
| `order` | string ("asc" | "desc") | No | Sort order by created_at timestamp: 'asc' for ascending, 'desc' for descending. Default is 'desc'. |
| `before` | string | No | Cursor for pagination. Provide an object ID to fetch the previous page before that ID. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Batches

**Slug:** `OPENAI_LIST_BATCHES`

Tool to list your organization's batches. Use when you need to view all batches, check batch statuses, or find a specific batch by listing them.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | A cursor for use in pagination. Provide an object ID to fetch the next page of the list after that ID. |
| `limit` | integer | No | A limit on the number of objects to be returned. Limit can range between 1 and 100, and the default is 20. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Chat Completions

**Slug:** `OPENAI_LIST_CHAT_COMPLETIONS`

Tool to list stored chat completions that were created with the `store` parameter set to true. Use to retrieve previously stored completions for review, analysis, or audit purposes.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for pagination. Provide the ID of the last chat completion from the previous request to fetch the next page |
| `limit` | integer | No | Number of chat completions to retrieve. Default is 20 |
| `model` | string | No | Filter by the model used to generate the chat completions |
| `order` | string ("asc" | "desc") | No | Sort order for chat completions. |
| `metadata` | string | No | Filter by metadata keys. Format: metadata[key1]=value1&metadata[key2]=value2 |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List ChatKit thread items

**Slug:** `OPENAI_LIST_CHATKIT_THREAD_ITEMS`

Tool to list ChatKit thread items. Use when you need to retrieve all items from a ChatKit thread, including messages, tool calls, and tasks.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | List items created after this thread item ID. Defaults to null for the first page. |
| `limit` | integer | No | Maximum number of thread items to return. Defaults to 20. |
| `order` | string ("asc" | "desc") | No | Order for listing thread items. |
| `before` | string | No | List items created before this thread item ID. Defaults to null for the newest results. |
| `thread_id` | string | Yes | Identifier of the ChatKit thread whose items are requested. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List container files

**Slug:** `OPENAI_LIST_CONTAINER_FILES`

Tool to list files in a container. Use when you need to view all files uploaded to a specific container.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for pagination. Provide an object ID to fetch the next page after that ID. |
| `limit` | integer | No | Limit on the number of files to return (1-100). Default is 20. |
| `order` | string ("asc" | "desc") | No | Sort order for listing container files. |
| `container_id` | string | Yes | ID of the container to list files from |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Containers

**Slug:** `OPENAI_LIST_CONTAINERS`

Tool to list containers. Use when you need to view all containers in your organization or filter by name.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Filter results by container name. |
| `after` | string | No | A cursor for use in pagination. 'after' is an object ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, ending with obj_foo, your subsequent call can include after=obj_foo in order to fetch the next page of the list. |
| `limit` | integer | No | A limit on the number of objects to be returned. Limit can range between 1 and 100, and the default is 20. |
| `order` | string ("asc" | "desc") | No | Sort order for the created_at timestamp. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Conversation Items

**Slug:** `OPENAI_LIST_CONVERSATION_ITEMS`

Tool to list all items for a conversation with the given ID. Use when you need to retrieve the items in a conversation for review or processing.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | An item ID to list items after, used in pagination. |
| `limit` | integer | No | A limit on the number of objects to be returned. Limit can range between 1 and 100, and the default is 20. |
| `order` | string ("asc" | "desc") | No | Order for listing conversation items. |
| `include` | array | No | Specify additional output data to include in the model response. Currently supported values are: `web_search_call.action.sources`, `code_interpreter_call.outputs`, `computer_call_output.output.image_url`, `file_search_call.results`, `message.input_image.image_url`, `message.output_text.logprobs`, `reasoning.encrypted_content`. |
| `conversation_id` | string | Yes | The ID of the conversation to list items for. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List engines

**Slug:** `OPENAI_LIST_ENGINES`

Tool to list available engines and their basic information. Use when you need to discover which engines are available.

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Evals

**Slug:** `OPENAI_LIST_EVALS`

Tool to list evaluations for a project. Use when you need to view all evaluations, check their configurations, or find a specific evaluation by listing them.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Identifier for the last eval from the previous pagination request. |
| `limit` | integer | No | Number of evals to retrieve. Defaults to 20. |
| `order` | string ("asc" | "desc") | No | Sort order for evals by timestamp. |
| `order_by` | string ("created_at" | "updated_at") | No | Field to order evals by. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List files

**Slug:** `OPENAI_LIST_FILES`

Tool to retrieve a list of files uploaded to your organization/project context. Cursor-paginated: continue requesting pages until next_cursor is null to retrieve all files. Files from other project environments are not visible. Cached file_ids may become stale if files are deleted; re-query before referencing file_ids in downstream workflows.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for pagination. Use the last_id from a previous response to fetch the next page of results. |
| `limit` | integer | No | Number of files to retrieve |
| `order` | string ("asc" | "desc") | No | Sort order by created_at timestamp. 'asc' for ascending, 'desc' for descending. Defaults to 'desc'. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Files in Vector Store Batch

**Slug:** `OPENAI_LIST_FILES_IN_VECTOR_STORE_BATCH`

Tool to list vector store files in a batch. Use when you need to retrieve all files that were added to a vector store as part of a specific batch operation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | A cursor for use in pagination. 'after' is an object ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, ending with obj_foo, your subsequent call can include after=obj_foo in order to fetch the next page of the list. |
| `limit` | integer | No | A limit on the number of objects to be returned. Limit can range between 1 and 100, and the default is 20. |
| `order` | string ("asc" | "desc") | No | Sort order for listing files. |
| `before` | string | No | A cursor for use in pagination. 'before' is an object ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, starting with obj_foo, your subsequent call can include before=obj_foo in order to fetch the previous page of the list. |
| `filter` | string ("in_progress" | "completed" | "failed" | "cancelled") | No | Filter by file status. |
| `batch_id` | string | Yes | The ID of the file batch that the files belong to. |
| `vector_store_id` | string | Yes | The ID of the vector store that the files belong to. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List fine-tunes

**Slug:** `OPENAI_LIST_FINE_TUNES`

Tool to list your organization's fine-tuning jobs. Use when you need to review all fine-tune runs. Results are scoped to the authenticated organization; an empty list means no fine-tunes exist for that org specifically.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Identifier for the last fine-tuning job from the previous pagination request. |
| `limit` | integer | No | Number of fine-tuning jobs to retrieve (default 20). |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List fine-tuning job events

**Slug:** `OPENAI_LIST_FINE_TUNING_EVENTS`

Tool to get status updates for a fine-tuning job. Use when you need to monitor the progress of a fine-tuning job or retrieve event logs.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Identifier for the last event from the previous pagination request. |
| `limit` | integer | No | Number of events to retrieve. |
| `fine_tuning_job_id` | string | Yes | The ID of the fine-tuning job to get events for. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List fine-tuning job checkpoints

**Slug:** `OPENAI_LIST_FINE_TUNING_JOB_CHECKPOINTS`

Tool to list checkpoints for a fine-tuning job. Use when you need to retrieve model checkpoints created during the fine-tuning process. Checkpoints are created at various steps during training and can be used to evaluate model performance at different stages.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Identifier for the last checkpoint ID from the previous pagination request. |
| `limit` | integer | No | Number of checkpoints to retrieve. |
| `fine_tuning_job_id` | string | Yes | The ID of the fine-tuning job to get checkpoints for. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Input Items

**Slug:** `OPENAI_LIST_INPUT_ITEMS`

Tool to retrieve input items for a given response from the OpenAI Responses API. Use when you need to inspect the inputs that were used to generate a specific response.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | An item ID to list items after, used in pagination |
| `limit` | integer | No | A limit on the number of objects to be returned. Limit can range between 1 and 100, and the default is 20 |
| `order` | string ("asc" | "desc") | No | Sort order for listing input items. |
| `include` | array | No | Additional fields to include in the response |
| `response_id` | string | Yes | The ID of the response to retrieve input items for |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Messages

**Slug:** `OPENAI_LIST_MESSAGES`

Tool to list messages in an Assistants thread to fetch the assistant's generated outputs after a run completes. Use after polling a run to completion to retrieve assistant responses.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for pagination. Provide an object ID to fetch the next page after that ID. |
| `limit` | integer | No | Limit on the number of messages to return (1-100). Default is 20. |
| `order` | string ("asc" | "desc") | No | Sort order by created_at timestamp: 'asc' for ascending, 'desc' for descending. Default is 'desc'. |
| `before` | string | No | Cursor for pagination. Provide an object ID to fetch the previous page before that ID. |
| `run_id` | string | No | Filter messages by the run ID that generated them |
| `thread_id` | string | Yes | The ID of the thread to retrieve messages from |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List models

**Slug:** `OPENAI_LIST_MODELS`

Tool to list available models scoped to the current account/organization — some public models may be absent due to permissions. Use when you need to discover which models you can call. Results may include deprecated or assistant-incompatible models; confirm a specific model's status via OPENAI_RETRIEVE_MODEL before using it in OPENAI_CREATE_ASSISTANT or other calls. Use model IDs exactly as returned — misspelled or unsupported IDs cause validation errors. Models vary in capability (vision, file-based features, context size); inspect metadata before assuming support. Filter results by id, owned_by, or status to handle large result sets efficiently.

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Runs

**Slug:** `OPENAI_LIST_RUNS`

Tool to list runs belonging to a thread. Use when you need to view all runs that have been executed on a specific thread, for example to find a run by status or to track execution history.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for pagination. Provide an object ID to fetch the next page after that ID. |
| `limit` | integer | No | Limit on the number of runs to return (1-100). Default is 20. |
| `order` | string ("asc" | "desc") | No | Sort order by created_at timestamp: 'asc' for ascending, 'desc' for descending. Default is 'desc'. |
| `before` | string | No | Cursor for pagination. Provide an object ID to fetch the previous page before that ID. |
| `thread_id` | string | Yes | ID of the thread to list runs from |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Run Steps

**Slug:** `OPENAI_LIST_RUN_STEPS`

Tool to list run steps for an Assistants API run to track detailed execution progress, inspect tool calls, and view message creation events. Use after creating a run to monitor its step-by-step execution or to retrieve tool call details after completion. When polling to monitor active runs, use reasonable intervals to avoid rate-limit errors.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for pagination. Provide an object ID to fetch the next page after that ID. |
| `limit` | integer | No | Limit on the number of run steps to return (1-100). Default is 20. |
| `order` | string ("asc" | "desc") | No | Sort order by created_at timestamp: 'asc' for ascending, 'desc' for descending. Default is 'desc'. |
| `before` | string | No | Cursor for pagination. Provide an object ID to fetch the previous page before that ID. |
| `run_id` | string | Yes | The ID of the run to list steps from |
| `include` | array | No | Additional fields to include in the response. Use 'step_details.tool_calls[*].file_search.results[*].content' to include file search result content. |
| `thread_id` | string | Yes | The ID of the thread that was run |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Skills

**Slug:** `OPENAI_LIST_SKILLS`

Tool to list skills. Use when you need to discover available skills or retrieve skill IDs by name or description.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Identifier for the last item from the previous pagination request |
| `limit` | integer | No | Number of skills to retrieve |
| `order` | string ("asc" | "desc") | No | Sort order for listing skills. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List ChatKit Threads

**Slug:** `OPENAI_LIST_THREADS`

Tool to list ChatKit threads with pagination and filtering. Use when you need to retrieve threads for a specific user or browse all available threads.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user` | string | No | Filter threads that belong to this user identifier. Defaults to null to return all users. |
| `after` | string | No | List items created after this thread item ID. Defaults to null for the first page. |
| `limit` | integer | No | Maximum number of thread items to return. Defaults to 20. |
| `order` | string ("asc" | "desc") | No | Sort order for results by creation time. Defaults to 'desc'. |
| `before` | string | No | List items created before this thread item ID. Defaults to null for the newest results. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Vector Store Files

**Slug:** `OPENAI_LIST_VECTOR_STORE_FILES`

Tool to list files in a vector store. Use when you need to retrieve all files attached to a specific vector store.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | A cursor for use in pagination. 'after' is an object ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, ending with obj_foo, your subsequent call can include after=obj_foo in order to fetch the next page of the list. |
| `limit` | integer | No | A limit on the number of objects to be returned. Limit can range between 1 and 100, and the default is 20. |
| `order` | string ("asc" | "desc") | No | Sort order for listing files. |
| `before` | string | No | A cursor for use in pagination. 'before' is an object ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, starting with obj_foo, your subsequent call can include before=obj_foo in order to fetch the previous page of the list. |
| `filter` | string ("in_progress" | "completed" | "failed" | "cancelled") | No | Filter by file status. |
| `vector_store_id` | string | Yes | The ID of the vector store that the files belong to. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Vector Stores

**Slug:** `OPENAI_LIST_VECTOR_STORES`

Tool to list vector stores to discover available vector stores by name or metadata. Use when you need to view all vector stores in your organization.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for pagination. Provide an object ID to fetch the next page after that ID. |
| `limit` | integer | No | Limit on the number of vector stores to return (1-100). Default is 20. |
| `order` | string ("asc" | "desc") | No | Sort order by created_at timestamp: 'asc' for ascending, 'desc' for descending. Default is 'desc'. |
| `before` | string | No | Cursor for pagination. Provide an object ID to fetch the previous page before that ID. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### List Videos

**Slug:** `OPENAI_LIST_VIDEOS`

Tool to list all video generation jobs. Use when you need to view all videos that have been created or check the status of multiple video generation tasks.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `after` | string | No | Cursor for pagination. Provide a video ID to fetch the next page after that ID. |
| `limit` | integer | No | Number of videos to retrieve |
| `order` | string ("asc" | "desc") | No | Sort order options for listing videos. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Modify Assistant

**Slug:** `OPENAI_MODIFY_ASSISTANT`

Tool to modify an existing assistant. Use when you need to update an assistant's configuration, model, instructions, tools, or metadata.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | The name of the assistant. The maximum length is 256 characters. |
| `model` | string | No | ID of the model to use. You can use the List models API to see all available models. |
| `tools` | array | No | A list of tools enabled on the assistant. There can be a maximum of 128 tools per assistant. Tools can be of types code_interpreter, file_search, or function. |
| `top_p` | number | No | An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered. |
| `metadata` | object | No | Set of 16 key-value pairs that can be attached to an object. This can be useful for storing additional information about the object in a structured format. Keys can be a maximum of 64 characters long and values can be a maximum of 512 characters long. |
| `description` | string | No | The description of the assistant. The maximum length is 512 characters. |
| `temperature` | number | No | What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. |
| `assistant_id` | string | Yes | The ID of the assistant to modify |
| `instructions` | string | No | The system instructions that the assistant uses. The maximum length is 256,000 characters. |
| `tool_resources` | object | No | Tool resources for the assistant. |
| `response_format` | string | No | Specifies the format that the model must output. Compatible with GPT-4o, GPT-4 Turbo, and all GPT-3.5 Turbo models since gpt-3.5-turbo-1106. Setting to { 'type': 'json_object' } enables JSON mode. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Modify Message

**Slug:** `OPENAI_MODIFY_MESSAGE`

Tool to modify an existing message's metadata in a thread. Use when you need to update metadata associated with a specific message.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `metadata` | object | No | Set of up to 16 key-value pairs that can be attached to the message. Keys can be max 64 characters and values max 512 characters. |
| `thread_id` | string | Yes | The ID of the thread to which this message belongs |
| `message_id` | string | Yes | The ID of the message to modify |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Modify Run

**Slug:** `OPENAI_MODIFY_RUN`

Tool to modify a run's metadata. Use when you need to update metadata information for a specific run.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `run_id` | string | Yes | The ID of the run to modify |
| `metadata` | object | No | Set of up to 16 key-value pairs that can be attached to the run. Keys can be a maximum of 64 characters long and values can be a maximum of 512 characters long. This can be useful for storing additional information about the run in a structured format |
| `thread_id` | string | Yes | The ID of the thread that was run |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Modify thread

**Slug:** `OPENAI_MODIFY_THREAD`

Tool to modify an existing thread's metadata. Use after obtaining the thread ID when you need to update metadata.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `metadata` | object | No | Arbitrary JSON metadata to attach to the thread Values must be short strings; large, nested, or complex payloads are rejected. |
| `thread_id` | string | Yes | ID of the thread to modify |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Modify Vector Store

**Slug:** `OPENAI_MODIFY_VECTOR_STORE`

Tool to modify an existing vector store. Use when you need to update the name, expiration policy, or metadata of a vector store.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | The name of the vector store. |
| `metadata` | object | No | Set of up to 16 key-value pairs that can be attached to the vector store. Keys can be a maximum of 64 characters long and values can be a maximum of 512 characters long. Pass null to clear existing metadata. |
| `expires_after` | object | No | Expiration policy for a vector store. |
| `vector_store_id` | string | Yes | The ID of the vector store to modify. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Retrieve assistant

**Slug:** `OPENAI_RETRIEVE_ASSISTANT`

Tool to retrieve details of a specific assistant. Use when you need to confirm assistant metadata before performing further operations. Prefer this over repeated OPENAI_CREATE_ASSISTANT calls to avoid cluttering assistant configurations.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `assistant_id` | string | Yes | Identifier of the assistant to retrieve (path parameter) Must be a valid, stored OpenAI assistant ID; stale or incorrect IDs cause failed retrievals and require additional lookup calls. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Retrieve Batch

**Slug:** `OPENAI_RETRIEVE_BATCH`

Tool to retrieve a batch by ID to check its status, progress, and results. Use when you need to check the current state of a batch job, view completion statistics, or access output file IDs.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `batch_id` | string | Yes | The ID of the batch to retrieve. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Retrieve container

**Slug:** `OPENAI_RETRIEVE_CONTAINER`

Tool to retrieve details of a specific container by its ID. Use when you need to fetch container configuration, status, or metadata.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `container_id` | string | Yes | Identifier of the container to retrieve (path parameter) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Retrieve container file

**Slug:** `OPENAI_RETRIEVE_CONTAINER_FILE`

Tool to retrieve metadata for a specific file in a container. Use when you need to get details about a container file including its size, path, and creation timestamp.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | ID of the file to retrieve from the container |
| `container_id` | string | Yes | ID of the container containing the file |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Retrieve container file content

**Slug:** `OPENAI_RETRIEVE_CONTAINER_FILE_CONTENT`

Tool to retrieve the content of a file within a container. Use when you need to download or access the actual file data from a container.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | Identifier of the file within the container (path parameter) |
| `container_id` | string | Yes | Identifier of the container (path parameter) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Retrieve engine

**Slug:** `OPENAI_RETRIEVE_ENGINE`

Tool to retrieve details of a specific engine. Use when you need to confirm engine availability and metadata before using it.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `engine_id` | string | Yes | Identifier of the engine to retrieve (e.g., gpt-4o-mini, gpt-4, dall-e-3) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Retrieve file

**Slug:** `OPENAI_RETRIEVE_FILE`

Tool to retrieve information about a specific file. Use when you need to check the details, status, or metadata of a file by its ID.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file to use for this request. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Retrieve fine-tuning job

**Slug:** `OPENAI_RETRIEVE_FINE_TUNING_JOB`

Tool to retrieve information about a fine-tuning job. Use when you need to check the status, progress, or details of an existing fine-tuning job.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fine_tuning_job_id` | string | Yes | The ID of the fine-tuning job to retrieve |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Retrieve model

**Slug:** `OPENAI_RETRIEVE_MODEL`

Tool to retrieve details of a specific model, confirming its metadata (ownership, created date) and verifying access under your org — a model appearing in OPENAI_LIST_MODELS does not guarantee access. Use before depending on a model ID in downstream calls.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Identifier of the model to retrieve (path parameter) Case-sensitive; use exact IDs as returned by OPENAI_LIST_MODELS. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Retrieve run

**Slug:** `OPENAI_RETRIEVE_RUN`

Tool to retrieve an Assistants run by ID to check status, errors, and usage. Use when polling run status until it reaches a terminal state (completed, failed, cancelled, incomplete, expired) before reading thread messages.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `run_id` | string | Yes | ID of the run to retrieve |
| `thread_id` | string | Yes | ID of the thread that was run |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Retrieve thread

**Slug:** `OPENAI_RETRIEVE_THREAD`

Tool to retrieve metadata of a specific thread by its ID — does not include message bodies or assistant replies (those require a completed run and separate message listing). Use before listing messages. After thread creation or message appending, wait 2–3 seconds before polling; use exponential backoff (1s, 2s, 4s) for HTTP 429 responses. Avoid concurrent OPENAI_CREATE_MESSAGE writes during retrieval to prevent inconsistent message states.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `thread_id` | string | Yes | Identifier of the thread to retrieve (path parameter) Must be captured from OPENAI_CREATE_THREAD and persisted — no API exists to list or discover existing thread IDs. Reuse consistently across OPENAI_CREATE_MESSAGE calls; mismatched IDs send operations to the wrong context. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Retrieve Vector Store File Content

**Slug:** `OPENAI_RETRIEVE_VECTOR_STORE_FILE_CONTENT`

Tool to retrieve the parsed contents of a vector store file. Use when you need to access the actual text content that has been processed and chunked for a file in a vector store.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file within the vector store to retrieve content from. |
| `vector_store_id` | string | Yes | The ID of the vector store that the file belongs to. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Run grader

**Slug:** `OPENAI_RUN_GRADER`

Tool to run a grader to evaluate model performance on a given sample. Use when you need to evaluate model outputs against expected results using various grading strategies like string matching, text similarity, custom Python code, or model-based scoring.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item` | object | No | The dataset item provided to the grader. This will be used to populate the 'item' namespace. See the guide for more details |
| `grader` | string | Yes | The grader configuration to use for evaluation. Can be one of: StringCheckGrader (compares strings), TextSimilarityGrader (evaluates text similarity), PythonGrader (runs custom Python code), ScoreModelGrader (uses a model for scoring), or MultiGrader (combines multiple graders) |
| `model_sample` | string | Yes | The model sample output to be evaluated. This value will be used to populate the 'sample' namespace. The 'output_json' variable will be populated if the model sample is a valid JSON string |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Search Vector Store

**Slug:** `OPENAI_SEARCH_VECTOR_STORE`

Tool to search a vector store for relevant chunks based on a query and file attributes filter. Use when you need to find specific content within a vector store for retrieval-augmented generation (RAG) or custom search workflows.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | A query string or array of strings for the search. |
| `filters` | object | No | A filter to apply based on file attributes. Can be a comparison filter with 'type', 'key', and 'value' fields, or a compound filter with 'type' and 'filters' fields combining multiple filters. |
| `rewrite_query` | boolean | No | Whether to rewrite the natural language query for vector search. |
| `max_num_results` | integer | No | The maximum number of results to return. Must be between 1 and 50. |
| `ranking_options` | object | No | Ranking options for search. |
| `vector_store_id` | string | Yes | The ID of the vector store to search. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Submit Tool Outputs to Run

**Slug:** `OPENAI_SUBMIT_TOOL_OUTPUTS_TO_RUN`

Tool to submit tool call outputs to continue a run that requires action. Use when a run has status 'requires_action' and required_action.type is 'submit_tool_outputs'. All tool outputs must be submitted together in a single request.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `run_id` | string | Yes | The ID of the run that requires the tool output submission. The run must have status 'requires_action' and required_action.type must be 'submit_tool_outputs' |
| `stream` | boolean | No | If true, returns a stream of events during the run execution after submitting tool outputs |
| `thread_id` | string | Yes | The ID of the thread to which this run belongs |
| `tool_outputs` | array | Yes | A list of tools for which the outputs are being submitted. All tool outputs must be submitted in a single request |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Chat Completion

**Slug:** `OPENAI_UPDATE_CHAT_COMPLETION`

Tool to update metadata for a stored chat completion. Use when you need to modify tags or metadata for a completion that was created with store=true.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `metadata` | object | No | Developer-defined tags and values to update for the chat completion. Pass null to clear metadata. All values must be strings |
| `completion_id` | string | Yes | The ID of the chat completion to update. Only completions created with store=true can be modified |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Conversation

**Slug:** `OPENAI_UPDATE_CONVERSATION`

Tool to update a conversation's metadata. Use when you need to modify metadata for an existing conversation.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `metadata` | object | No | Optional metadata key-value pairs to attach to the conversation. Up to 16 pairs allowed, with keys ≤64 chars and values ≤512 chars. Pass null to clear metadata. |
| `conversation_id` | string | Yes | The ID of the conversation to update. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Eval

**Slug:** `OPENAI_UPDATE_EVAL`

Tool to update certain properties of an evaluation (name and metadata). Use when you need to rename an evaluation or update its metadata without changing the data source configuration or testing criteria.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | New name for the evaluation |
| `eval_id` | string | Yes | The ID of the evaluation to update |
| `metadata` | object | No | New metadata to attach to the evaluation. This replaces any existing metadata |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Update Vector Store File Attributes

**Slug:** `OPENAI_UPDATE_VECTOR_STORE_FILE_ATTRIBUTES`

Tool to update custom attributes on a vector store file. Use when you need to add or modify metadata associated with files in a vector store.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_id` | string | Yes | The ID of the file to update attributes. |
| `attributes` | object | No | Custom attributes to associate with the file. Can be any JSON object with key-value pairs, or null to clear attributes. |
| `vector_store_id` | string | Yes | The ID of the vector store the file belongs to. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Upload file

**Slug:** `OPENAI_UPLOAD_FILE`

Tool to upload a file for use across OpenAI endpoints. Use before referencing the file in tasks like fine-tuning. Returns a `file_id` that must be explicitly passed to endpoints like OPENAI_CREATE_ASSISTANT or OPENAI_CREATE_MESSAGE — uploaded files are not auto-discovered. Files exceeding size limits return HTTP 413; split or compress oversized content before retrying. Verify uploads via OPENAI_LIST_FILES before referencing `file_id`, as unsupported formats may be silently rejected. Repeated uploads accumulate against storage quotas; delete unused files with OPENAI_DELETE_FILE.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | string | Yes | Binary content of the file to upload. E.g., open('data.jsonl','rb').read(). |
| `purpose` | string | Yes | Intended purpose of the uploaded file. Currently only 'fine-tune' is supported. |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |

### Validate grader configuration

**Slug:** `OPENAI_VALIDATE_GRADER`

Tool to validate a grader configuration for fine-tuning jobs. Use when you need to verify that a grader is correctly configured before using it in a fine-tuning job.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `grader` | string | Yes | The grader configuration to validate. Can be one of: StringCheckGrader (for string comparisons), TextSimilarityGrader (for semantic similarity), PythonGrader (for custom Python logic), ScoreModelGrader (for model-based scoring), or MultiGrader (for combining multiple graders) |

#### Output

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Data from the action execution |
| `error` | string | No | Error if any occurred during the execution of the action |
| `successful` | boolean | Yes | Whether or not the action execution was successful or not |
