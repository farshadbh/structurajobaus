export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // Escaping "<" prevents a description containing "</script>" from breaking
  // out of the tag once listings come from outside sources.
  const json = JSON.stringify(data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
