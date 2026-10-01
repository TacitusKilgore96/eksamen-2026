"use client"

import { useEffect, useState } from "react"
import useRequestData from "../hooks/useRequestData"
import ArticleAdmin, { type Article, type ArticleForm, type ContentBlock } from "./components/ArticleAdmin"
import PodcastAdmin, { type Podcast, type PodcastForm } from "./components/PodcastAdmin"

/* Knytter artikelkategorier til de section-id'er, som API'et forventer. */
const CATEGORY_SECTION_MAP: Record<string, string> = {
  sport: "673492b05f363e78e15ed1b8",
  vejr: "507f1f77bcf86cd799439011",
  nyheder: "60d5ecb8b5c9c22d4c8b4567",
}

const DEFAULT_SECTION_ID = "000000000000000000000000"
const LISTENED_PODCASTS_STORAGE_KEY = "newsapp-listened-podcasts"

const EMPTY_ARTICLE_FORM: ArticleForm = {
  title: "",
  slug: "",
  author: "",
  articleCategory: "",
  tags: "",
  leadText: "",
  mainText: "",
  imageUrl: "",
}

const EMPTY_PODCAST_FORM: PodcastForm = {
  headline: "",
  length: "",
  file: "",
  fileUpload: null,
  thumbnail: "",
  thumbnailUpload: null,
  subtitle: "",
  contentText: "",
}

/* Laver formularens tekstfelter om til de contentblokke, API'et bruger. */
const createArticleContent = (form: ArticleForm): ContentBlock[] => {
  const content: ContentBlock[] = []

  if (form.leadText.trim()) {
    content.push({ type: "paragraph", text: form.leadText, contentbody: [] })
  }

  if (form.mainText.trim()) {
    const paragraphs = form.mainText
      .split("\n")
      .filter((paragraph) => paragraph.trim())
      .map((text) => ({ type: "paragraph" as const, text }))

    content.push({ type: "main", contentbody: paragraphs })
  }

  if (form.imageUrl.trim()) {
    content.push({
      type: "image",
      url: form.imageUrl,
      altText: form.title,
      caption: "",
      thumbnail: "",
      contentbody: [],
    })
  }

  return content
}

/* Samler de felter, der skal sendes, og udelader tomme valgfrie felter. */
const createArticlePayload = (form: ArticleForm, article?: Article | null) => {
  const tags = form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
  const payload: Record<string, unknown> = {
    title: form.title,
    section: CATEGORY_SECTION_MAP[form.articleCategory] || DEFAULT_SECTION_ID,
    publishedAt: article?.publishedAt || new Date().toISOString(),
    content: createArticleContent(form),
  }

  if (form.articleCategory.trim()) payload.articleCategory = form.articleCategory.trim()
  if (form.slug.trim()) payload.slug = form.slug.trim()
  if (form.author.trim()) payload.author = form.author.trim()
  if (tags.length) payload.tags = tags

  return payload
}

const parsePodcastLength = (length: string) => {
  if (!length.includes(":")) {
    const seconds = Number(length)
    return Number.isFinite(seconds) ? seconds : 0
  }

  const [minutes, seconds] = length.split(":").map(Number)
  return Number.isFinite(minutes) && Number.isFinite(seconds) ? minutes * 60 + seconds : 0
}

/* Laver podcastformularen om til multipart-data, som også kan indeholde filer. */
const createPodcastFormData = (form: PodcastForm, releaseDate = new Date().toISOString()) => {
  const formData = new FormData()
  formData.append("headline", form.headline)
  formData.append("length", String(parsePodcastLength(form.length)))
  formData.append("releaseDate", releaseDate)
  formData.append("subtitle", form.subtitle)
  formData.append("info", form.subtitle || form.contentText)

  if (form.fileUpload) formData.append("podcast", form.fileUpload)
  else if (form.file) formData.append("podcast", form.file)

  if (form.thumbnailUpload) formData.append("thumbnail", form.thumbnailUpload)
  else if (form.thumbnail) formData.append("thumbnail", form.thumbnail)

  return formData
}

const Admin = () => {
  /* Hvert hook har sin egen data-state, så artikel- og podcastlister ikke overskriver hinanden. */
  const { makeRequest, data, isLoading, error } = useRequestData()
  const {
    makeRequest: makePodcastRequest,
    data: podcastData,
    isLoading: podcastIsLoading,
    error: podcastError,
  } = useRequestData()

  /* Søgefeltet bruges til at filtrere artikler på deres ID. */
  const [searchId, setSearchId] = useState("")
  /* Holder styr på den artikel, som brugeren redigerer. */
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  /* Samler alle artikel-felter i én state i stedet for én state pr. input. */
  const [articleForm, setArticleForm] = useState<ArticleForm>(EMPTY_ARTICLE_FORM)

  /* Holder styr på den podcast, som brugeren redigerer. */
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null)
  /* Samler alle podcast-felter i én state, som sendes samlet til komponenten. */
  const [podcastForm, setPodcastForm] = useState<PodcastForm>(EMPTY_PODCAST_FORM)
  const [listenedPodcastIds, setListenedPodcastIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    const storedPodcastIds = window.localStorage.getItem(LISTENED_PODCASTS_STORAGE_KEY)
    if (!storedPodcastIds) return []
    try {
      return JSON.parse(storedPodcastIds) as string[]
    } catch {
      return []
    }
  })

  /* Henter de to datatyper fra hver deres API-endpoint. */
  const loadArticles = () => makeRequest("/article", "GET")
  const loadPodcasts = () => makePodcastRequest("/podcast", "GET")

  /* Hent artikler og podcasts, når admin-siden åbnes. */
  useEffect(() => {
    loadArticles()
    loadPodcasts()
  }, [])

  const togglePodcastListened = (podcastId: string) => {
    setListenedPodcastIds((currentIds) => {
      const nextIds = currentIds.includes(podcastId)
        ? currentIds.filter((id) => id !== podcastId)
        : [...currentIds, podcastId]
      window.localStorage.setItem(LISTENED_PODCASTS_STORAGE_KEY, JSON.stringify(nextIds))
      return nextIds
    })
  }

  /* Nulstiller artikel-formularen efter gem eller annullering. */
  const resetForm = () => {
    setEditingArticle(null)
    setArticleForm(EMPTY_ARTICLE_FORM)
  }

  /* Nulstiller podcast-formularen efter gem eller annullering. */
  const resetPodcastForm = () => {
    setEditingPodcast(null)
    setPodcastForm(EMPTY_PODCAST_FORM)
  }

  /* Kopierer en artikels data ind i formularen til redigering. */
  const handleEditClick = (article: Article) => {
    setEditingArticle(article)
    const content = Array.isArray(article.content) ? article.content : []
    const paragraph = content.find((block) => block.type === "paragraph")
    const main = content.find((block) => block.type === "main")
    const image = content.find((block) => block.type === "image")
    setArticleForm({
      title: article.title || "",
      slug: article.slug || "",
      author: article.author || "",
      articleCategory: article.articleCategory || "",
      tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
      leadText: paragraph?.text || "",
      imageUrl: image?.url || "",
      mainText: main?.contentbody?.map((block) => block.text || "").filter(Boolean).join("\n\n") || "",
    })
  }

  /* Opretter eller opdaterer en artikel via API'et. */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const payload = createArticlePayload(articleForm, editingArticle)

    if (editingArticle) {
      await makeRequest(`/article/update/${editingArticle._id}`, "PUT", { body: { _id: editingArticle._id, ...payload } })
    } else {
      await makeRequest("/article/add", "POST", { body: payload })
    }

    resetForm()
    await loadArticles()
  }

  /* Sletter en artikel efter brugerens bekræftelse. */
  const handleDelete = async (articleId: string) => {
    if (!window.confirm("Er du sikker på, at artiklen skal slettes?")) return
    await makeRequest(`/article/delete/${articleId}`, "DELETE")
    await loadArticles()
  }

  /* Kopierer en podcasts data ind i formularen til redigering. */
  const handlePodcastEdit = (podcast: Podcast) => {
    setEditingPodcast(podcast)
    setPodcastForm({
      headline: podcast.headline || "",
      length: podcast.length ? String(podcast.length) : "",
      file: podcast.podcast || "",
      fileUpload: null,
      thumbnail: podcast.thumbnail || "",
      thumbnailUpload: null,
      subtitle: podcast.subtitle || "",
      contentText: podcast.contentText || podcast.info || "", /* gør så subtitle dukker op i projektet */
    })
  }

  /* Opretter eller opdaterer en podcast via API'et. */
  const handlePodcastSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const body = createPodcastFormData(podcastForm, editingPodcast?.releaseDate)
    let response: unknown = null

    if (editingPodcast) {
      body.append("_id", editingPodcast._id)
      response = await makePodcastRequest(`/podcast/update/${editingPodcast._id}`, "PUT", { body })
    } else {
      response = await makePodcastRequest("/podcast/add", "POST", { body })
    }

    if (response === null) return

    resetPodcastForm()
    await loadPodcasts()
  }

  /* Sletter en podcast efter brugerens bekræftelse. */
  const handlePodcastDelete = async (podcastId: string) => {
    if (!window.confirm("Er du sikker på, at podcasten skal slettes?")) return
    await makePodcastRequest(`/podcast/delete/${podcastId}`, "DELETE")
    await loadPodcasts()
  }

  /* Sikrer at komponenterne altid modtager arrays. */
  const articles = (Array.isArray(data) ? data : []) as Article[]
  const podcasts = (Array.isArray(podcastData) ? podcastData : podcastData ? [podcastData] : []) as Podcast[]

  return (
    <div className="min-h-screen bg-black px-4 py-12 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 border-b-4 border-white pb-6">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-gray-400">Administration</p>
          <h1 className="text-4xl font-extrabold uppercase tracking-tight sm:text-6xl">Artikelstyring</h1>
          <p className="mt-3 max-w-2xl text-base text-gray-300 sm:text-lg">Opret, redigér, søg og slet artikler og podcasts.</p>
        </header>

        {/* Artikeladministrationen håndteres af sin egen komponent */}
        <ArticleAdmin
          articles={articles}
          isLoading={isLoading}
          error={error}
          editingArticle={editingArticle}
          form={articleForm}
          searchId={searchId}
          setForm={setArticleForm}
          setSearchId={setSearchId}
          resetForm={resetForm}
          handleSubmit={handleSubmit}
          handleEditClick={handleEditClick}
          handleDelete={handleDelete}
        />

        {/* Podcastadministrationen håndteres af sin egen komponent */}
        <PodcastAdmin
          podcasts={podcasts}
          isLoading={podcastIsLoading}
          error={podcastError}
          editingPodcast={editingPodcast}
          form={podcastForm}
          setForm={setPodcastForm}
          resetPodcastForm={resetPodcastForm}
          handlePodcastSubmit={handlePodcastSubmit}
          handlePodcastEdit={handlePodcastEdit}
          handlePodcastDelete={handlePodcastDelete}
          listenedPodcastIds={listenedPodcastIds}
          togglePodcastListened={togglePodcastListened}
        />
      </div>
    </div>
  )
}

export default Admin
