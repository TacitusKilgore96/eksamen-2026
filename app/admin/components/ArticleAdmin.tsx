"use client"

import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react"

export type ContentBlock = {
  type: "paragraph" | "main" | "image" | "link" | string
  text?: string
  headline?: string
  url?: string
  altText?: string
  caption?: string
  thumbnail?: string
  contentbody?: ContentBlock[]
}

/* Beskriver de artikeldata, som kommer fra API'et. */
export type Article = {
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


/* Alle værdier fra artikel-formularen samlet ét sted. */
export type ArticleForm = {
  title: string
  slug: string
  author: string
  articleCategory: string
  tags: string
  leadText: string
  mainText: string
  imageUrl: string
}

type ArticleAdminProps = {
  /* Data og status til artikeloversigten. */
  articles: Article[]
  isLoading: boolean
  error: boolean
  editingArticle: Article | null
  /* Den samlede state for artikel-formularen. */
  form: ArticleForm
  searchId: string
  setForm: Dispatch<SetStateAction<ArticleForm>>
  setSearchId: Dispatch<SetStateAction<string>>
  /* Handlers fra admin-siden, som udfører CRUD-kaldene. */
  resetForm: () => void
  handleSubmit: (event: FormEvent) => void
  handleEditClick: (article: Article) => void
  handleDelete: (articleId: string) => void
}

const ALLOWED_CATEGORIES = [
  { label: "Vælg kategori (valgfri)...", value: "" },
  { label: "Sport", value: "sport" },
  { label: "Vejr", value: "vejr" },
  { label: "Nyheder", value: "nyheder" },
]

/* Finder tekst i både almindelige og indlejrede contentblokke. */
const extractAllText = (blocks: ContentBlock[] = []): string =>
  blocks
    .flatMap((block) => [
      block.text,
      block.headline ? `[${block.headline}]` : "",
      block.contentbody ? extractAllText(block.contentbody) : "",
    ])
    .filter(Boolean)
    .join(" ")

/* Viser artikel-formularen og listen over eksisterende artikler. */
const ArticleAdmin = ({
  articles,
  isLoading,
  error,
  editingArticle,
  form,
  searchId,
  setForm,
  setSearchId,
  resetForm,
  handleSubmit,
  handleEditClick,
  handleDelete,
}: ArticleAdminProps) => {
  /* Komprimerer et uploadet billede, før det gemmes i formularen. */
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (loadEvent) => {
      const image = new Image()
      image.src = loadEvent.target?.result as string
      image.onload = () => {
        const canvas = document.createElement("canvas")
        const maxWidth = 800
        const maxHeight = 800
        let width = image.width
        let height = image.height

        if (width > height && width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        } else if (height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height
        canvas.getContext("2d")?.drawImage(image, 0, 0, width, height)
        updateField("imageUrl", canvas.toDataURL("image/jpeg", 0.6))
      }
    }
  }

  /* Opdaterer alle tekstfelter gennem den samme formularfunktion. */
  const updateField = (field: keyof ArticleForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    updateField(event.target.name as keyof ArticleForm, event.target.value)
  }

  /* Filtrerer på ID og viser de nyeste artikler først. */
  const normalizedSearchId = searchId.trim().toLowerCase()
  const filteredArticles = normalizedSearchId
    ? articles.filter((article) => article._id?.toLowerCase().includes(normalizedSearchId))
    : articles

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return dateB - dateA
  })

  return (
    <>
      {/* Formular til oprettelse og redigering af artikler. */}
      <section className="mb-12 border border-gray-600 bg-gray-900 p-6 sm:p-8">
        <h2 className="mb-6 text-2xl font-extrabold uppercase">
          {editingArticle ? "Redigér artikel" : "Opret ny artikel"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Grundlæggende artikeloplysninger. */}
          <div className="grid gap-5 sm:grid-cols-3">
            <label className="text-sm font-bold uppercase text-gray-300">
              Titel *
              <input id="title" name="title" value={form.title} onChange={handleFieldChange} required className="mt-2 w-full border border-gray-600 bg-gray-800 p-3 normal-case text-white focus:border-white focus:outline-none" placeholder="f.eks. Lorem Ipsum Article 14" />
            </label>
            <label className="text-sm font-bold uppercase text-gray-300">
              Kategori (valgfri)
              <select name="articleCategory" value={form.articleCategory} onChange={handleFieldChange} className="mt-2 w-full border border-gray-600 bg-gray-800 p-3 normal-case text-white focus:border-white focus:outline-none">
                {ALLOWED_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold uppercase text-gray-300">
              Slug (valgfri)
              <input name="slug" value={form.slug} onChange={handleFieldChange} className="mt-2 w-full border border-gray-600 bg-gray-800 p-3 normal-case text-white focus:border-white focus:outline-none" placeholder="f.eks. sport-artikel-14" />
            </label>
          </div>

          {/* Forfatter og tags. */}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold uppercase text-gray-300">
              Forfatter
              <input name="author" value={form.author} onChange={handleFieldChange} className="mt-2 w-full border border-gray-600 bg-gray-800 p-3 normal-case text-white focus:border-white focus:outline-none" placeholder="Journalist 14" />
            </label>
            <label className="text-sm font-bold uppercase text-gray-300">
              Tags (adskilt af komma)
              <input name="tags" value={form.tags} onChange={handleFieldChange} className="mt-2 w-full border border-gray-600 bg-gray-800 p-3 normal-case text-white focus:border-white focus:outline-none" placeholder="sport, lorem, ipsum" />
            </label>
          </div>

          {/* Billedupload med forhåndsvisning. */}
          <div>
            <label htmlFor="imageFile" className="mb-2 block text-sm font-bold uppercase text-gray-300">Upload billede</label>
            <input id="imageFile" type="file" accept="image/*" onChange={handleImageUpload} className="w-full border border-gray-600 bg-gray-800 p-2.5 text-sm text-gray-300 file:mr-4 file:border-0 file:bg-white file:px-4 file:py-1.5 file:text-xs file:font-bold file:uppercase file:text-black hover:file:bg-gray-300" />
            {form.imageUrl && <div className="mt-3 flex items-center gap-3"><img src={form.imageUrl} alt="Billede preview" className="h-16 w-16 border border-gray-600 object-cover" /><button type="button" onClick={() => updateField("imageUrl", "")} className="text-xs font-bold uppercase text-red-400 hover:underline">Fjern billede</button></div>}
          </div>

          {/* Artikeltekst. */}
          <label className="text-sm font-bold uppercase text-gray-300">
            Manchet / intro
            <textarea name="leadText" rows={2} value={form.leadText} onChange={handleFieldChange} className="mt-2 w-full border border-gray-600 bg-gray-800 p-3 normal-case text-white focus:border-white focus:outline-none" placeholder="Indledende resume af artiklen..." />
          </label>
          <label className="text-sm font-bold uppercase text-gray-300">
            Brødtekst
            <textarea name="mainText" rows={6} value={form.mainText} onChange={handleFieldChange} className="mt-2 w-full border border-gray-600 bg-gray-800 p-3 normal-case text-white focus:border-white focus:outline-none" placeholder="Skriv artiklens hovedindhold her..." />
          </label>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={isLoading} className="bg-white px-6 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-gray-300 disabled:opacity-50">{editingArticle ? "Gem ændringer" : "Gem artikel"}</button>
            {editingArticle && <button type="button" onClick={resetForm} className="border border-gray-500 px-6 py-3 text-sm font-bold uppercase text-white transition-colors hover:bg-gray-800">Annullér</button>}
          </div>
        </form>
      </section>

      {/* Søgning og scrollbar artikeloversigt. */}
      <section className="grid gap-6">
        <div className="flex flex-col gap-4 border-b border-gray-600 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><h2 className="text-2xl font-extrabold uppercase">Artikler</h2><span className="bg-gray-700 px-3 py-1 text-sm font-bold text-white">{sortedArticles.length} {sortedArticles.length === 1 ? "artikel" : "artikler"}</span></div>
          <input type="text" placeholder="Søg på artikel ID..." value={searchId} onChange={(event) => setSearchId(event.target.value)} className="w-full border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-white focus:outline-none sm:w-80" />
        </div>

        {isLoading && <p className="border border-gray-600 bg-gray-800 p-6 font-bold">Henter artikler...</p>}
        {error && <p className="border-l-4 border-white bg-gray-800 p-6 font-bold">Artiklerne kunne ikke hentes.</p>}
        {!isLoading && !error && sortedArticles.length === 0 && <p className="border border-gray-600 bg-gray-800 p-6 text-gray-300">{searchId ? `Ingen artikel fundet med ID "${searchId}"` : "Der er endnu ikke oprettet nogen artikler."}</p>}

        {!isLoading && !error && sortedArticles.length > 0 && <div className="flex max-h-162.5 flex-col gap-4 overflow-y-auto pr-2">
          {sortedArticles.map((article) => <article key={article._id} className="border border-gray-600 bg-gray-800 p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="mb-2 flex flex-wrap items-center gap-2"><h3 className="text-2xl font-extrabold">{article.title}</h3>{article.articleCategory && <span className="bg-gray-700 px-2 py-0.5 text-xs font-bold uppercase text-gray-300">{article.articleCategory}</span>}</div><p className="text-xs text-gray-400"><span className="font-bold text-gray-300">ID:</span> {article._id}</p>{article.slug && <p className="text-xs text-gray-400"><span className="font-bold text-gray-300">Slug:</span> /{article.slug}</p>}{article.section && <p className="text-xs text-gray-400"><span className="font-bold text-gray-300">Sektion ID:</span> {article.section}</p>}{article.author && <p className="text-xs text-gray-400"><span className="font-bold text-gray-300">Forfatter:</span> {article.author}</p>}</div>{article.publishedAt && <p className="text-sm text-gray-400">{new Date(article.publishedAt).toLocaleString("da-DK")}</p>}</div>
            <p className="mt-4 border-t border-gray-600 pt-4 text-gray-200 line-clamp-3">{extractAllText(article.content)}</p>
            {Array.isArray(article.tags) && article.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1">{article.tags.map((tag) => <span key={tag} className="border border-gray-600 px-2 py-0.5 text-xs text-gray-400">#{tag}</span>)}</div>}
            <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => handleEditClick(article)} className="bg-white px-4 py-2 text-sm font-bold uppercase text-black transition-colors hover:bg-gray-300">Redigér</button><button type="button" onClick={() => handleDelete(article._id)} className="border border-gray-300 px-4 py-2 text-sm font-bold uppercase text-white transition-colors hover:bg-white hover:text-black">Slet</button></div>
          </article>)}
        </div>}
      </section>
    </>
  )
}

export default ArticleAdmin
