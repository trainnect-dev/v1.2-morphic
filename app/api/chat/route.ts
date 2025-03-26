import { createManualToolStreamResponse } from '@/lib/streaming/create-manual-tool-stream'
import { createToolCallingStreamResponse } from '@/lib/streaming/create-tool-calling-stream'
import { Model } from '@/lib/types/models'
import { isProviderEnabled } from '@/lib/utils/registry'
import { cookies } from 'next/headers'

export const maxDuration = 30

const DEFAULT_MODEL: Model = {
  id: 'gpt-4o-mini',
  name: 'GPT-4o mini',
  provider: 'OpenAI',
  providerId: 'openai',
  enabled: true,
  toolCallType: 'native' as const
}

export async function POST(req: Request) {
  try {
    const { messages, id: chatId } = await req.json()
    const referer = req.headers.get('referer')
    const isSharePage = referer?.includes('/share/')

    if (isSharePage) {
      return new Response('Chat API is not available on share pages', {
        status: 403,
        statusText: 'Forbidden'
      })
    }

    const cookieStore = await cookies()
    const modelJson = cookieStore.get('selectedModel')?.value
    const searchMode = cookieStore.get('search-mode')?.value === 'true'

    let selectedModel = DEFAULT_MODEL

    if (modelJson) {
      try {
        selectedModel = JSON.parse(modelJson) as Model
      } catch (e) {
        console.error('Failed to parse selected model:', e)
      }
    }

    if (
      !isProviderEnabled(selectedModel.providerId) ||
      selectedModel.enabled === false
    ) {
      return new Response(
        `Selected provider is not enabled ${selectedModel.providerId}`,
        {
          status: 404,
          statusText: 'Not Found'
        }
      )
    }

    // Check if messages contain PDF attachments
    const messagesHavePDF = messages.some((message: any) =>
      message.experimental_attachments?.some(
        (a: any) => a.contentType === 'application/pdf'
      )
    )

    // If PDF is detected, use Claude for better PDF handling
    if (messagesHavePDF && isProviderEnabled('anthropic')) {
      // Find a Claude model that supports PDFs (Claude Sonnet 3.5)
      const claudeModel: Model = {
        id: 'claude-3-5-sonnet-latest',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        providerId: 'anthropic',
        enabled: true,
        toolCallType: 'manual' as const
      }
      
      return createManualToolStreamResponse({
        messages,
        model: claudeModel,
        chatId,
        searchMode
      })
    }

    // Check if messages contain image attachments
    const messagesHaveImage = messages.some((message: any) =>
      message.experimental_attachments?.some(
        (a: any) => a.contentType?.startsWith('image/')
      )
    )

    // If image is detected and Gemini is enabled, use Gemini for better image handling
    if (messagesHaveImage && isProviderEnabled('google') && !messagesHavePDF) {
      // Find a Gemini model that supports images
      const geminiModel: Model = {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'Google',
        providerId: 'google',
        enabled: true,
        toolCallType: 'manual' as const
      }
      
      return createManualToolStreamResponse({
        messages,
        model: geminiModel,
        chatId,
        searchMode
      })
    }

    const supportsToolCalling = selectedModel.toolCallType === 'native'

    return supportsToolCalling
      ? createToolCallingStreamResponse({
          messages,
          model: selectedModel,
          chatId,
          searchMode
        })
      : createManualToolStreamResponse({
          messages,
          model: selectedModel,
          chatId,
          searchMode
        })
  } catch (error) {
    console.error('API route error:', error)
    return new Response('Error processing your request', {
      status: 500,
      statusText: 'Internal Server Error'
    })
  }
}
