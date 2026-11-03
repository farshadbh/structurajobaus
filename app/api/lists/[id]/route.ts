import { NextResponse } from 'next/server'
import { isCrossOrigin, unauthorized } from '@/lib/api'
import { listsKey, validateList, type SavedList } from '@/lib/accounts'
import { getCurrentUser } from '@/lib/auth'
import { getJson, setJson } from '@/lib/store'

type Context = { params: Promise<{ id: string }> }

async function loadLists(userId: string) {
  return (await getJson<SavedList[]>(listsKey(userId))) ?? []
}

export async function PATCH(request: Request, { params }: Context) {
  if (isCrossOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 })
  }

  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const { id } = await params
  const lists = await loadLists(user.id)
  const existing = lists.find((list) => list.id === id)
  if (!existing) return NextResponse.json({ error: 'That list no longer exists.' }, { status: 404 })

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const result = validateList({ ...existing, ...(body ?? {}), name: body?.name ?? existing.name })
  if (!result.ok) {
    return NextResponse.json({ error: result.errors[0], errors: result.errors }, { status: 422 })
  }

  const next = lists.map((list) =>
    list.id === id ? { ...list, name: result.value.name, criteria: result.value.criteria } : list,
  )

  if (!(await setJson(listsKey(user.id), next))) {
    return NextResponse.json({ error: 'Could not save the list. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, lists: next })
}

export async function DELETE(request: Request, { params }: Context) {
  if (isCrossOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 })
  }

  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const { id } = await params
  const lists = await loadLists(user.id)
  const next = lists.filter((list) => list.id !== id)
  if (next.length === lists.length) {
    return NextResponse.json({ error: 'That list no longer exists.' }, { status: 404 })
  }

  if (!(await setJson(listsKey(user.id), next))) {
    return NextResponse.json({ error: 'Could not delete the list. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, lists: next })
}
