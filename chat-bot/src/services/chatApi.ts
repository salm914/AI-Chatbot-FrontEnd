import axios from 'axios'

export type ChatApiMessage = {
  role: 'assistant' | 'user'
  content: string
}

const chatEndpoint = import.meta.env.VITE_CHAT_API_URL?.trim() || '/api/chat'

export async function askChatApi(messages: ChatApiMessage[]): Promise<unknown> {
  const { data } = await axios.post<unknown>(chatEndpoint, { messages })
  return data
}
