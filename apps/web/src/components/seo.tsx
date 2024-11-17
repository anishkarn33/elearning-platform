import { FC } from "react"
import Head from "next/head"

interface MetaProps {
  title: string
  description: string
  keywords?: string
  author?: string
  robots?: string
  canonicalUrl?: string
  openGraph?: {
    title?: string
    description?: string
    type?: string
    url?: string
    image?: string
  }
}

const SEO: FC<MetaProps> = ({
  title,
  description,
  keywords,
  author,
  robots,
  canonicalUrl,
  openGraph,
}) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      {robots && <meta name="robots" content={robots} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {openGraph && (
        <>
          {openGraph.title && (
            <meta property="og:title" content={openGraph.title} />
          )}
          {openGraph.description && (
            <meta property="og:description" content={openGraph.description} />
          )}
          {openGraph.type && (
            <meta property="og:type" content={openGraph.type} />
          )}
          {openGraph.url && <meta property="og:url" content={openGraph.url} />}
          {openGraph.image && (
            <meta property="og:image" content={openGraph.image} />
          )}
        </>
      )}
    </Head>
  )
}

export default SEO
