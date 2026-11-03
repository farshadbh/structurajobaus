import { DIGEST_USERS_KEY, findUserById, userKey } from '@/lib/auth'
import { unsubKey } from '@/lib/accounts'
import { getJson, removeFromSet, setJson } from '@/lib/store'

/*
 * One-click unsubscribe from the alert email.
 *
 * The token is a random 40-hex string stored against the account, not a hash of
 * the email address, so the link cannot be guessed and does not leak the address
 * into anyone's mail logs. Opening the link disables the digest immediately; the
 * page says so plainly and offers the way back in.
 */

const shell = (title: string, body: string) => `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title}</title>
<style>
  body { margin:0; min-height:100vh; display:grid; place-items:center; background:#f7f7f5; color:#1e293b;
         font:16px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  main { max-width:32rem; margin:2rem; padding:2.5rem; background:#fff; border:1px solid #e2e8f0; border-radius:12px; }
  h1 { margin:0 0 .75rem; font-size:1.25rem; }
  p { margin:0 0 1rem; color:#475569; }
  a { color:#1e3a5f; font-weight:600; }
</style>
</head>
<body><main><h1>${title}</h1>${body}</main></body>
</html>`

function page(title: string, body: string, status: number) {
  return new Response(shell(title, body), {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')?.trim()

  if (!token) {
    return page(
      'Unsubscribe link incomplete',
      '<p>This link is missing its token. Use the unsubscribe link at the bottom of the job alert email.</p>',
      400,
    )
  }

  const userId = await getJson<string>(unsubKey(token))
  const user = userId ? await findUserById(userId) : null

  if (!user || user.unsubscribeToken !== token) {
    return page(
      'This unsubscribe link has expired',
      '<p>The account it belonged to no longer exists, or an alert was already changed from this link.</p>',
      404,
    )
  }

  const saved = await setJson(userKey(user.email), {
    ...user,
    digestEnabled: false,
    unsubscribedAt: new Date().toISOString(),
  })

  if (!saved) {
    return page(
      'Could not update your alerts',
      '<p>Something went wrong on our side. Please try the link again in a few minutes.</p>',
      502,
    )
  }

  await removeFromSet(DIGEST_USERS_KEY, user.id)

  return page(
    'You are unsubscribed',
    `<p>Job alert emails for <strong>${user.email.replace(/</g, '&lt;')}</strong> are now off. Your saved lists are still there.</p>
     <p><a href="/account">Turn alerts back on</a> any time.</p>`,
    200,
  )
}
