# Luma Chat

A responsive chat UI scaffold built with React, TypeScript, and Axios. The API
connects to the local chat backend at `/api/chat`.

## Run locally

```sh
npm install
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:3001`.
To use a different endpoint, set `VITE_CHAT_API_URL` in `.env` and restart the
dev server.

## Current API contract

The chat sends a `POST` request to `VITE_CHAT_API_URL` (default `/api/chat`) with
this JSON body:

```json
{
  "messages": [
    { "role": "user", "content": "Your question" }
  ]
}
```

The request includes the conversation history as `{ role, content }` messages.
The response body is displayed in the conversation as returned by the API.
