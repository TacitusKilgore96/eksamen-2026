"use client"

import { useEffect, useState } from "react"
import useRequestData from "../hooks/useRequestData"

/* Beskriver en enkel blok i content-arrayet fra API'et */
type ContentBlock = {
  type: "paragraph" | "main" | "image" | "link" | string
  text?: string
  headline?: string
  url?: string
  altText?: string
  caption?: string
  thumbnail?: string
  contentbody?: ContentBlock[]
}

/* Beskriver den fulde datastruktur på en artikel */
type Article = {
  _id: string
  title: string
  slug?: string
  author?: string
  articleCategory?: string
  section?: string
  tags?: string[]
  publishedAt?: string
  content?: ContentBlock[]
}

/* De tre faste kategorier (valgfrie) */
const ALLOWED_CATEGORIES = [
  { label: "Vælg kategori (valgfri)...", value: "" },
  { label: "Sport", value: "sport" },
  { label: "Vejr", value: "vejr" },
  { label: "Nyheder", value: "nyheder" },
]

/* 
  KORTLÆGNING AF KATEGORI TIL SECTION ID
  Erstat disse 3 ID'er med de faktiske Section ID'er fra min database!
*/
const CATEGORY_SECTION_MAP: Record<string, string> = {
  sport: "673492b05f363e78e15ed1b8", // Indsæt rigtigt Sport Section ID
  vejr: "507f1f77bcf86cd799439011",  // Indsæt rigtigt Vejr Section ID
  nyheder: "60d5ecb8b5c9c22d4c8b4567", // Indsæt rigtigt Nyheder Section ID
}

/* Standard/fallback Section ID, hvis ingen kategori vælges */
const DEFAULT_SECTION_ID = "000000000000000000000000"

const Admin = () => {
  const { makeRequest, data, isLoading, error } = useRequestData()

  /* Søge-state til artikel ID */
  const [searchId, setSearchId] = useState("")

  /* Redigeringstilstand */
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)

  /* Formular-states */
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [author, setAuthor] = useState("")
  const [articleCategory, setArticleCategory] = useState("")
  const [tags, setTags] = useState("")
  const [leadText, setLeadText] = useState("")
  const [mainText, setMainText] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  /* Hjælpefunktion til at læse, nedskalere og komprimere fil til Base64 */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const MAX_WIDTH = 800
        const MAX_HEIGHT = 800

        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6)
        setImageUrl(compressedBase64)
      }
    }
  }

  /* Hjælpefunktion til rekursivt at udtrække al brødtekst til visning i listen */
  const extractAllText = (blocks?: ContentBlock[]): string => {
    if (!blocks || !Array.isArray(blocks)) return ""

    let texts: string[] = []

    blocks.forEach((block) => {
      if (block.text) texts.push(block.text)
      if (block.headline) texts.push(`[${block.headline}]`)
      if (block.contentbody && Array.isArray(block.contentbody)) {
        texts.push(extractAllText(block.contentbody))
      }
    })

    return texts.filter(Boolean).join(" ")
  }

  /* Henter alle artikler fra API'et */
  const loadArticles = () => makeRequest("/article", "GET")

  useEffect(() => {
    loadArticles()
  }, [])

  /* Nulstiller formularen */
  const resetForm = () => {
    setEditingArticle(null)
    setTitle("")
    setSlug("")
    setAuthor("")
    setArticleCategory("")
    setTags("")
    setLeadText("")
    setMainText("")
    setImageUrl("")
  }

  /* Klargør formularen med data fra den valgte artikel */
  const handleEditClick = (article: Article) => {
    setEditingArticle(article)
    setTitle(article.title || "")
    setSlug(article.slug || "")
    setAuthor(article.author || "")
    setArticleCategory(article.articleCategory || "")
    setTags(Array.isArray(article.tags) ? article.tags.join(", ") : "")

    if (Array.isArray(article.content)) {
      const paraBlock = article.content.find((b) => b.type === "paragraph")
      const mainBlock = article.content.find((b) => b.type === "main")
      const imgBlock = article.content.find((b) => b.type === "image")

      setLeadText(paraBlock?.text || "")
      setImageUrl(imgBlock?.url || "")

      if (mainBlock && Array.isArray(mainBlock.contentbody)) {
        const bodyTexts = mainBlock.contentbody.map((b) => b.text || "").filter(Boolean)
        setMainText(bodyTexts.join("\n\n"))
      } else {
        setMainText("")
      }
    }
  }

  /* Håndterer indsendelse (POST / PUT) */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    const constructedContent: ContentBlock[] = []

    if (leadText.trim()) {
      constructedContent.push({
        type: "paragraph",
        text: leadText,
        contentbody: [],
      })
    }

    if (mainText.trim()) {
      const mainParagraphs = mainText
        .split("\n")
        .filter((p) => p.trim().length > 0)
        .map((p) => ({
          type: "paragraph",
          text: p,
        }))

      constructedContent.push({
        type: "main",
        contentbody: mainParagraphs,
      })
    }

    if (imageUrl.trim()) {
      constructedContent.push({
        type: "image",
        url: imageUrl,
        altText: title,
        caption: "",
        thumbnail: "",
        contentbody: [],
      })
    }

    /* AUTOMATISK SECTION-TILDELING UD FRA KATEGORI */
    const assignedSection =
      (articleCategory ? CATEGORY_SECTION_MAP[articleCategory] : null) ||
      DEFAULT_SECTION_ID

    const payload: Record<string, any> = {
      title,
      section: assignedSection,
      publishedAt: editingArticle?.publishedAt || new Date().toISOString(),
      content: constructedContent,
    }

    if (articleCategory.trim()) payload.articleCategory = articleCategory.trim()
    if (slug.trim()) payload.slug = slug.trim()
    if (author.trim()) payload.author = author.trim()
    if (parsedTags.length > 0) payload.tags = parsedTags

    if (editingArticle) {
      const { _id } = editingArticle;
      
      await makeRequest(`/article/update/${_id}`, "PUT", {
        body: {
          _id: editingArticle._id,
          ...payload,
        }
      })
    } else {
      await makeRequest("/article/add", "POST", {
        body: payload,
      })
    }

    resetForm()
    await loadArticles()
  }

  /* Slet artikel */
  const handleDelete = async (articleId: string) => {
    if (!window.confirm("Er du sikker på, at artiklen skal slettes?")) return

    /* Kalder /article/_id med DELETE metoden */
    await makeRequest(`/article/delete/${articleId}`, "DELETE")

    await loadArticles()
  }

  /* CRASH PROTECTION, SØGE-FILTRERING OG SORTERING EFTER DATO (NYESTE FØRST) */
  /* const rawArticles = (data ?? []) as Article[] */ 
  /* POST Error. Skal kun behandle data som et array, hvis det faktisk er et array. */
  /* Hvis det er et objekt (eller null), skal den falde tilbage på et tomt array[] indtil loadArticles() henter hele listen igen. */
  const rawArticles = Array.isArray(data) ? (data as Article[]) : []

  const filteredArticles = searchId.trim()
    ? rawArticles.filter((art) => art._id?.toLowerCase().includes(searchId.trim().toLowerCase()))
    : rawArticles

  // Sorterer artiklerne, så den nyeste 'publishedAt' dato altid ligger øverst
  const articles = [...filteredArticles].sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return dateB - dateA
  })

  return (
    <div className="min-h-screen bg-black px-4 py-12 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 border-b-4 border-white pb-6">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-gray-400">
            Administration
          </p>
          <h1 className="text-4xl font-extrabold uppercase tracking-tight sm:text-6xl">
            Artikelstyring
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-300 sm:text-lg">
            Opret, redigér, søg og slet artikler.
          </p>
        </header>

        {/* FORMULAR: OPRET / REDIGER */}
        <section className="mb-12 border border-gray-600 bg-gray-900 p-6 sm:p-8">
          <h2 className="mb-6 text-2xl font-extrabold uppercase">
            {editingArticle ? "Redigér artikel" : "Opret ny artikel"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label htmlFor="title" className="mb-2 block text-sm font-bold uppercase text-gray-300">
                  Titel *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full border border-gray-600 bg-gray-800 p-3 text-white focus:border-white focus:outline-none"
                  placeholder="f.eks. Lorem Ipsum Article 14"
                />
              </div>

              {/* KATEGORI - Tildeler automatisk section ID i baggrunden */}
              <div>
                <label htmlFor="articleCategory" className="mb-2 block text-sm font-bold uppercase text-gray-300">
                  Kategori (Valgfri)
                </label>
                <select
                  id="articleCategory"
                  value={articleCategory}
                  onChange={(e) => setArticleCategory(e.target.value)}
                  className="w-full border border-gray-600 bg-gray-800 p-3 text-white focus:border-white focus:outline-none"
                >
                  {ALLOWED_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* SLUG - VALGFRI */}
              <div>
                <label htmlFor="slug" className="mb-2 block text-sm font-bold uppercase text-gray-300">
                  Slug (Valgfri)
                </label>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full border border-gray-600 bg-gray-800 p-3 text-white focus:border-white focus:outline-none"
                  placeholder="f.eks. sport-artikel-14"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="author" className="mb-2 block text-sm font-bold uppercase text-gray-300">
                  Forfatter
                </label>
                <input
                  id="author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full border border-gray-600 bg-gray-800 p-3 text-white focus:border-white focus:outline-none"
                  placeholder="Journalist 14"
                />
              </div>

              <div>
                <label htmlFor="tags" className="mb-2 block text-sm font-bold uppercase text-gray-300">
                  Tags (adskilt af komma)
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full border border-gray-600 bg-gray-800 p-3 text-white focus:border-white focus:outline-none"
                  placeholder="sport, lorem, ipsum"
                />
              </div>
            </div>

            {/* BILLEDUPLOAD MED PREVIEW */}
            <div>
              <label htmlFor="imageFile" className="mb-2 block text-sm font-bold uppercase text-gray-300">
                Upload Billede
              </label>
              <input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full border border-gray-600 bg-gray-800 p-2.5 text-sm text-gray-300 file:mr-4 file:border-0 file:bg-white file:px-4 file:py-1.5 file:text-xs file:font-bold file:uppercase file:text-black hover:file:bg-gray-300"
              />

              {imageUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={imageUrl}
                    alt="Billede preview"
                    className="h-16 w-16 border border-gray-600 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-xs font-bold uppercase text-red-400 hover:underline"
                  >
                    Fjern billede
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="leadText" className="mb-2 block text-sm font-bold uppercase text-gray-300">
                Manchet / Intro (Paragraph)
              </label>
              <textarea
                id="leadText"
                rows={2}
                value={leadText}
                onChange={(e) => setLeadText(e.target.value)}
                className="w-full border border-gray-600 bg-gray-800 p-3 text-white focus:border-white focus:outline-none"
                placeholder="Indledende resume af artiklen..."
              />
            </div>

            <div>
              <label htmlFor="mainText" className="mb-2 block text-sm font-bold uppercase text-gray-300">
                Brødtekst (Main content body)
              </label>
              <textarea
                id="mainText"
                rows={6}
                value={mainText}
                onChange={(e) => setMainText(e.target.value)}
                className="w-full border border-gray-600 bg-gray-800 p-3 text-white focus:border-white focus:outline-none"
                placeholder="Skriv artiklens hovedindhold her..."
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-white px-6 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-gray-300 disabled:opacity-50"
              >
                {editingArticle ? "Gem ændringer" : "Gem artikel"}
              </button>
              {editingArticle && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-gray-500 px-6 py-3 text-sm font-bold uppercase text-white transition-colors hover:bg-gray-800"
                >
                  Annullér
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ARTIKELOVERSIKT OG SØGNING */}
        <section className="grid gap-6">
          <div className="flex flex-col gap-4 border-b border-gray-600 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold uppercase">Artikler</h2>
              <span className="bg-gray-700 px-3 py-1 text-sm font-bold text-white">
                {articles.length} {articles.length === 1 ? "artikel" : "artikler"}
              </span>
            </div>

            <div className="w-full sm:w-80">
              <input
                type="text"
                placeholder="Søg på artikel ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {isLoading && (
            <p className="border border-gray-600 bg-gray-800 p-6 font-bold text-white">
              Henter artikler...
            </p>
          )}

          {error && (
            <p className="border-l-4 border-white bg-gray-800 p-6 font-bold text-white">
              Artiklerne kunne ikke hentes.
            </p>
          )}

          {!isLoading && !error && articles.length === 0 && (
            <p className="border border-gray-600 bg-gray-800 p-6 text-gray-300">
              {searchId ? `Ingen artikel fundet med ID "${searchId}"` : "Der er endnu ikke oprettet nogen artikler."}
            </p>
          )}

          {/* SCROLL CONTAINER TIL ARTIKLERNE */}
          {!isLoading && !error && articles.length > 0 && (
            <div className="flex max-h-[650px] flex-col gap-4 overflow-y-auto pr-2">
              {articles.map((article) => (
                <article key={article._id} className="border border-gray-600 bg-gray-800 p-5 shadow-sm sm:p-7">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-2xl font-extrabold">{article.title}</h3>
                        {article.articleCategory && (
                          <span className="bg-gray-700 px-2 py-0.5 text-xs font-bold uppercase text-gray-300">
                            {article.articleCategory}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        <span className="font-bold text-gray-300">ID:</span> {article._id}
                      </p>
                      {article.slug && (
                        <p className="text-xs text-gray-400">
                          <span className="font-bold text-gray-300">Slug:</span> /{article.slug}
                        </p>
                      )}
                      {article.section && (
                        <p className="text-xs text-gray-400">
                          <span className="font-bold text-gray-300">Sektion ID:</span> {article.section}
                        </p>
                      )}
                      {article.author && (
                        <p className="text-xs text-gray-400">
                          <span className="font-bold text-gray-300">Forfatter:</span> {article.author}
                        </p>
                      )}
                    </div>

                    {article.publishedAt && (
                      <p className="text-sm text-gray-400">
                        {new Date(article.publishedAt).toLocaleString("da-DK")}
                      </p>
                    )}
                  </div>

                  <p className="mt-4 border-t border-gray-600 pt-4 text-gray-200 line-clamp-3">
                    {extractAllText(article.content)}
                  </p>

                  {Array.isArray(article.tags) && article.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {article.tags.map((tag, idx) => (
                        <span key={idx} className="border border-gray-600 px-2 py-0.5 text-xs text-gray-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleEditClick(article)}
                      className="bg-white px-4 py-2 text-sm font-bold uppercase text-black transition-colors hover:bg-gray-300"
                    >
                      Redigér
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(article._id)}
                      className="border border-gray-300 px-4 py-2 text-sm font-bold uppercase text-white transition-colors hover:bg-white hover:text-black"
                    >
                      Slet artikel
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Admin