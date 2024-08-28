import { SendHorizontalIcon } from "lucide-solid"
import { Show, createEffect, createSignal, on, onMount } from "solid-js"
import type { MessageWithUser } from "../types"

interface Props {
  channel: string
  messages: MessageWithUser[]
  onSend: (channel: string, message: string) => void
}

export default function ChannelView(props: Props) {
  const [message, setMessage] = createSignal("")
  let input: HTMLInputElement
  let container: HTMLDivElement

  const onSubmit = (e: Event) => {
    e.preventDefault()
    props.onSend(props.channel, message())
    setMessage("")
  }

  const formatDate = (d: Date) => {
    return d.toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit" })
  }

  onMount(() => input.focus())

  createEffect(() => {
    props.messages // dependency
    container.scrollTop = container.scrollHeight
  })

  return (
    <div class="w-full h-full flex flex-col">
      <div class="p-4 border-b border-zinc-800">
        <span class="text-xl font-medium"># {props.channel}</span>
      </div>

      <div ref={container} class="overflow-scroll flex-grow">
        <div class="flex flex-col min-h-full justify-end p-6 gap-4">
          {props.messages.map((msg) => (
            <div class="flex flex-row gap-2">
              <Show when={msg.user.photoURL}>
                <img class="w-10 h-10 mt-1 rounded" src={msg.user.photoURL} />
              </Show>
              <Show when={!msg.user.photoURL}>
                <div class="w-10 h-10 mt-1 rounded bg-zinc-800" />
              </Show>
              <div class="flex flex-col">
                <div class="flex flex-row gap-2 items-center">
                  <span class="text-zinc-100 font-semibold">{msg.user.name}</span>
                  <span class="text-zinc-400 text-xs mt-0.5">{formatDate(msg.timestamp)}</span>
                </div>
                <span class="text-zinc-300">{msg.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div class="p-4">
        <form onSubmit={onSubmit} class="flex flex-row w-full items-center justify-center p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
          <input
            ref={input}
            value={message()}
            onInput={(e) => setMessage(e.target.value)}
            class="flex-grow bg-transparent text-zinc-100 placeholder-zinc-400 focus:outline-none"
            placeholder={`Message #${props.channel}`}
          />
          <button onClick={onSubmit} class="text-zinc-200 rounded-lg border border-zinc-700/0 hover:border-zinc-700 py-1 px-2">
            <SendHorizontalIcon class="w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
