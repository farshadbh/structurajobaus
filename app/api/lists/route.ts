import { NextResponse } from 'next/server'
import { isCrossOrigin, unauthorized } from '@/lib/api'
import { MAX_LISTS, listsKey, validateList, type SavedList } from '@/lib/accounts'
import { getCurrentUser, newId } from '@/lib/auth'
import { getJson, setJson } from '@/lib/store'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const lists = (await getJson<SavedList[]>(listsKey(user.id))) ?? []
  return NextResponse.json({ lists })
}

export async function POST(request: Request) {
  if (isCrossOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 })
  }

  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const lists = (await getJson<SavedList[]>(listsKey(user.id))) ?? []
  if (lists.length >= MAX_LISTS) {
    return NextResponse.json(
      { error: `You can keep up to ${MAX_LISTS} lists. Delete one first.` },
      { status: 422 },
    )
  }

  const body = await request.json().catch(() => null)
  const result = validateList(body)
  if (!result.ok) {
    return NextResponse.json({ error: result.errors[0], errors: result.errors }, { status: 422 })
  }

  const list: SavedList = {
    id: newId(8),
    name: result.value.name,
    criteria: result.value.criteria,
    createdAt: new Date().toISOString(),
  }

  const next = [...lists, list]
  if (!(await setJson(listsKey(user.id), next))) {
    return NextResponse.json({ error: 'Could not save the list. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, list, lists: next }, { status: 201 })
}
