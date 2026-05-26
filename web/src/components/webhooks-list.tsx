import { Loader2, Wand2 } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { webhooksListSchema } from '../http/schemas/webhooks'
import { WebhooksListItem } from './webhooks-list-item'
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { string } from 'zod'
import { CodeBlock } from './ui/code-block'

export function WebhookList() {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver>(null)

  const [checkedWebhooksIds, setCheckedWebhooksIds] = useState<string[]>([])
  const [generateHandlerCode, setGenerateHandlerCode] = useState<string | null>(null)

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ['webhooks'],
      queryFn: async ({ pageParam }) => {
        const url = new URL(`${import.meta.env.VITE_API_URL}/api/webhooks`)

        if (pageParam) {
          url.searchParams.set('cursor', pageParam)
        }

        const response = await fetch(url)
        const data = await response.json()

        return webhooksListSchema.parse(data)
      },

      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor ?? undefined
      },
      initialPageParam: undefined as string | undefined,
    })


  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        threshold: 0.5,
      },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  function handleCheckWebhook(checkedWebhooksId: string) {
    if (checkedWebhooksIds.includes(checkedWebhooksId)) {
      setCheckedWebhooksIds(state => {
        return state.filter(webhookId => webhookId !== checkedWebhooksId)
      })
    } else {
      setCheckedWebhooksIds(state => [...state, checkedWebhooksId])
    }
  }

  async function handleGenerateHandler() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({ webhookIds: checkedWebhooksIds }),
      headers: {
        'Content-Type': 'application/json'
      },
    })

    type GenerateResponse = { code: string }

    const data: GenerateResponse = await response.json()

    setGenerateHandlerCode(data.code)
  }

  const hasAnyWebhookChecked = checkedWebhooksIds.length > 0

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          <button
            disabled={!hasAnyWebhookChecked}
            className='w-full  bg-indigo-700 mb-3 text-white size-8 rounded-lg flex items-center justify-center gap-3 font-medium text-sm py-2.5 disabled:opacity-50'
            onClick={() => handleGenerateHandler()}
          >
            <Wand2 className='size-4' />
            Gerar handler
          </button>

          {(data.pages.flatMap((page) => page.webhooks)).map((webhook) => {
            return (
              <WebhooksListItem
                key={webhook.id}
                webhook={webhook}
                onWebhookChecked={handleCheckWebhook}
                isWebhookChecked={checkedWebhooksIds.includes(webhook.id)}
              />
            )
          })}
        </div>

        {hasNextPage && (
          <div className="p-2" ref={loadMoreRef}>
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="size-5 animate-spin text-zinc-500" />
              </div>
            )}
          </div>
        )}
      </div>

      {!!generateHandlerCode && (
        <Dialog.Root defaultOpen>
          <Dialog.Overlay className="bg-black/60 inset-0 fixed z-20" />

          <Dialog.Content className="flex items-center justify-center fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 z-40">
            <div className='bg-zinc-900 w-[600px] p-4 rounded-lg border border-zinc-800 max-h-[620px] overflow-y-auto'>
              <CodeBlock language="typescript" code={generateHandlerCode} />
            </div>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </>
  )
}
