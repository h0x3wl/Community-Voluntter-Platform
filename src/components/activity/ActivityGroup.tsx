import type { ReactNode } from "react"

export function ActivityGroup({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
