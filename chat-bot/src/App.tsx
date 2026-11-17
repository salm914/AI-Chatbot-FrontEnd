import { useEffect, useRef, useState, type FormEvent } from 'react'
import axios from 'axios'
import { askChatApi, type ChatApiMessage } from './services/chatApi'
import './App.css'

type Message = {
  id: number
  role: 'assistant' | 'user'
  content: string
  isError?: boolean
}

const suggestions = [
  'What can you help me with?',
  'Summarize a topic for me',
  'Help me brainstorm ideas',
]

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messageListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isSending])

  async function sendQuestion(value: string) {
    const trimmedQuestion = value.trim()
    if (!trimmedQuestion || isSending) return

    const conversation: ChatApiMessage[] = [
      ...messages
        .filter((message) => !message.isError)
        .map(({ role, content }) => ({ role, content })),
      { role: 'user', content: trimmedQuestion },
    ]

    setQuestion('')
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: 'user', content: trimmedQuestion },
    ])
    setIsSending(true)

    try {
      const response = await askChatApi(conversation)
      const content =
        typeof response === 'string'
          ? response
          : JSON.stringify(response, null, 2)

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: content || 'The API returned an empty response.',
        },
      ])
    } catch (error) {
      const content = axios.isAxiosError(error)
        ? error.response
          ? `The API returned an error (${error.response.status}). ${error.message}`
          : `Could not reach the API. ${error.message}`
        : error instanceof Error
          ? error.message
          : 'An unexpected error occurred while sending your question.'

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content,
          isError: true,
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendQuestion(question)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Luma chat home">
          <span className="brand-mark" aria-hidden="true">
            <SparkleIcon />
          </span>
          <span>Luma</span>
        </a>
        <div className="connection-status is-connected" role="status">
          <span className="status-dot" />
          API endpoint configured
        </div>
      </header>

      <section className="chat-panel" aria-label="Chat with Luma">
        <div className="conversation" ref={messageListRef} aria-live="polite">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-icon" aria-hidden="true">
                <SparkleIcon />
              </div>
              <p className="eyebrow">YOUR AI ASSISTANT</p>
              <h1>What can I help with?</h1>
              <p className="welcome-copy">
                Ask a question to get started. Your API response will appear
                here.
              </p>
              <div className="suggestions" aria-label="Suggested questions">
                {suggestions.map((suggestion) => (
                  <button
                    className="suggestion"
                    key={suggestion}
                    onClick={() => void sendQuestion(suggestion)}
                    type="button"
                  >
                    {suggestion}
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message) => (
                <article
                  className={`message message-${message.role}${message.isError ? ' message-error' : ''}`}
                  key={message.id}
                >
                  {message.role === 'assistant' && (
                    <span className="message-avatar" aria-hidden="true">
                      <SparkleIcon />
                    </span>
                  )}
                  <div className="message-content">
                    <p className="message-author">
                      {message.role === 'user' ? 'You' : 'Luma'}
                    </p>
                    <div className="message-text">{message.content}</div>
                  </div>
                </article>
              ))}
              {isSending && (
                <div className="message message-assistant" role="status">
                  <span className="message-avatar" aria-hidden="true">
                    <SparkleIcon />
                  </span>
                  <div className="message-content">
                    <p className="message-author">Luma</p>
                    <div className="typing-indicator" aria-label="Thinking">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="composer-wrap">
          <form className="composer" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="chat-question">
              Ask Luma a question
            </label>
            <textarea
              id="chat-question"
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void sendQuestion(question)
                }
              }}
              placeholder="Message Luma..."
              rows={1}
              value={question}
            />
            <button
              aria-label="Send message"
              className="send-button"
              disabled={!question.trim() || isSending}
              type="submit"
            >
              <ArrowUpIcon />
            </button>
          </form>
          <p className="composer-hint">
            Enter to send · Shift + Enter for a new line
          </p>
        </div>
      </section>
    </main>
  )
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m12 2 1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8L12 2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 19V5m0 0L6 11m6-6 6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

export default App
