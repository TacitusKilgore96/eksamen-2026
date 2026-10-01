"use client"

import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react"

/* 
  Definerer TypeScript-typen for en enkelt podcast, 
  hvor alle dens egenskaber (id, titel, længde, filer osv.) angives.
*/
export type Podcast = {
  _id: string
  headline: string
  length: string | number
  podcast: string
  thumbnail: string
  releaseDate: string
  subtitle: string
  contentText: string
  info?: string
}

/* 
  Samler alle værdier fra podcast-formularen ét sted, 
  inklusiv både tekstfelter og filer til upload.
*/
export type PodcastForm = {
  headline: string
  length: string
  file: string
  fileUpload: File | null
  thumbnail: string
  thumbnailUpload: File | null
  subtitle: string
  contentText: string
}

/* 
  Udelukker fil-feltgrupperne, så vi kun sidder tilbage med de tekstbaserede felter i formularen.
*/
type PodcastTextField = Exclude<keyof PodcastForm, "fileUpload" | "thumbnailUpload">

/* 
  Definerer typerne for de props, der modtages af PodcastAdmin-komponenten, 
  herunder lister, funktioner til redigering, sletning og formdata.
*/
type PodcastAdminProps = {
  podcasts: Podcast[]
  isLoading: boolean
  error: boolean
  editingPodcast: Podcast | null
  form: PodcastForm
  setForm: Dispatch<SetStateAction<PodcastForm>>
  resetPodcastForm: () => void
  handlePodcastSubmit: (event: FormEvent) => void
  handlePodcastEdit: (podcast: Podcast) => void
  handlePodcastDelete: (podcastId: string) => void
  listenedPodcastIds: string[]
  togglePodcastListened: (podcastId: string) => void
}

/* 
  Hjælpefunktion der returnerer den fulde URL til en podcast-fil eller billede. 
  Hvis stien allerede starter med "http", bruges den direkte, ellers sættes localhost-stien på.
*/
const getPodcastUrl = (file: string) =>
  file.startsWith("http") ? file : `http://localhost:3001/assets/podcast/${file}`

/* Sorterer en liste af podcasts, så den seneste udgivelsesdato altid står øverst. */
const sortPodcastsByDate = (podcasts: Podcast[]) =>
  [...podcasts].sort(
    (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  )

/* 
  Formaterer sekunder om til minutter og sekunder (f.eks. "3:45"), 
  så lydens varighed vises pænt i brugerfladen.
*/
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0")
  return `${minutes}:${remainingSeconds}`
}

/* Hovedkomponent der viser formularen og oversigten til administration af podcasts. */
const PodcastAdmin = ({
  podcasts,
  isLoading,
  error,
  editingPodcast,
  form,
  setForm,
  resetPodcastForm,
  handlePodcastSubmit,
  handlePodcastEdit,
  handlePodcastDelete,
  listenedPodcastIds,
  togglePodcastListened,
}: PodcastAdminProps) => {
  /* Opdaterer et enkelt tekstfelt i formularens state uden at miste resten af dataen. */
  const updateField = (field: PodcastTextField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  /* Håndterer ændringer i tekstfelter og videresender værdien til updateField. */
  const handleFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateField(event.target.name as PodcastTextField, event.target.value)
  }

  /* Gemmer den valgte lydfil eller det valgte thumbnail-billede i formularens state. */
  const handleFileChange = (field: "fileUpload" | "thumbnailUpload", event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setForm((current) => ({ ...current, [field]: file }))

    /* Hvis det er en lydfil der uploades, udlæses og beregnes dens varighed automatisk. */
    if (field === "fileUpload" && file) {
      const audio = new Audio(URL.createObjectURL(file))
      audio.onloadedmetadata = () => {
        updateField("length", formatDuration(audio.duration))
        URL.revokeObjectURL(audio.src)
      }
    }
  }

  /* Sorterer podcast-listen vha. hjælpefunktionen defineret tidligere. */
  const sortedPodcasts = sortPodcastsByDate(podcasts)

  return (
    <>
      {/* Sektion til formular (oprettelse eller redigering af en podcast). */}
      <section className="mb-12 border border-gray-600 bg-gray-900 p-6 sm:p-8">
        <h2 className="mb-6 text-2xl font-extrabold uppercase">{editingPodcast ? "Redigér podcast" : "Opret ny podcast"}</h2>
        <form onSubmit={handlePodcastSubmit} className="flex flex-col gap-5">
          
          {/* Felt til overskrift/titel. */}
          <label className="text-sm font-bold uppercase text-gray-300">
            Overskrift *
            <input 
              name="headline" 
              value={form.headline} 
              onChange={handleFieldChange} 
              required 
              className="mt-2 w-full border border-gray-600 bg-gray-800 p-3 normal-case text-white focus:border-white focus:outline-none" 
            />
          </label>

          {/* Grid med fil-uploads til lydfil og thumbnail. */}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold uppercase text-gray-300">
              Lydfil *
              <input 
                type="file" 
                accept="audio/*" 
                onChange={(event) => handleFileChange("fileUpload", event)} 
                required={!editingPodcast && !form.file} 
                className="mt-2 w-full border border-gray-600 bg-gray-800 p-2.5 text-sm text-gray-300 file:mr-4 file:border-0 file:bg-white file:px-4 file:py-1.5 file:text-xs file:font-bold file:uppercase file:text-black hover:file:bg-gray-300" 
              />
              {editingPodcast && form.file && <span className="mt-2 block text-xs normal-case text-gray-400">Nuværende fil: {form.file}</span>}
            </label>
            
            <label className="text-sm font-bold uppercase text-gray-300">
              Thumbnail *
              <input 
                type="file" 
                accept="image/*" 
                onChange={(event) => handleFileChange("thumbnailUpload", event)} 
                required={!editingPodcast && !form.thumbnail} 
                className="mt-2 w-full border border-gray-600 bg-gray-800 p-2.5 text-sm text-gray-300 file:mr-4 file:border-0 file:bg-white file:px-4 file:py-1.5 file:text-xs file:font-bold file:uppercase file:text-black hover:file:bg-gray-300" 
              />
              {editingPodcast && form.thumbnail && <span className="mt-2 block text-xs normal-case text-gray-400">Nuværende billede: {form.thumbnail}</span>}
            </label>
          </div>

          {/* Valgfrie oplysninger om underoverskrift og automatisk længdevisning. */}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold uppercase text-gray-300">
              Underoverskrift
              <input 
                name="subtitle" 
                value={form.subtitle} 
                onChange={handleFieldChange} 
                className="mt-2 w-full border border-gray-600 bg-gray-800 p-3 normal-case text-white focus:border-white focus:outline-none" 
              />
            </label>
            <p className="self-end text-sm normal-case text-gray-400">Længde: {form.length || "beregnes fra lydfilen"}</p>
          </div>

          {/* Tekstfelt til beskrivelse/indhold af podcasten. */}
          <textarea 
            name="contentText" 
            value={form.contentText} 
            onChange={handleFieldChange} 
            rows={4} 
            placeholder="Beskrivelse af podcasten" 
            className="w-full border border-gray-600 bg-gray-800 p-3 text-white focus:border-white focus:outline-none" 
          />

          {/* Knapper til at indsende formularen eller annullere redigering. */}
          <div className="flex flex-wrap gap-3">
            <button 
              type="submit" 
              disabled={isLoading} 
              className="bg-white px-6 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-gray-300 disabled:opacity-50"
            >
              {editingPodcast ? "Gem ændringer" : "Gem podcast"}
            </button>
            {editingPodcast && (
              <button 
                type="button" 
                onClick={resetPodcastForm} 
                className="border border-gray-500 px-6 py-3 text-sm font-bold uppercase text-white transition-colors hover:bg-gray-800"
              >
                Annullér
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Sektion med oversigt over samtlige podcasts og deres status. */}
      <section className="mb-12 grid gap-6">
        <div className="flex items-center gap-3 border-b border-gray-600 pb-3">
          <h2 className="text-2xl font-extrabold uppercase">Podcasts</h2>
          <span className="bg-gray-700 px-3 py-1 text-sm font-bold text-white">{sortedPodcasts.length}</span>
        </div>

        {/* Betingede visninger ved indlæsning, fejl eller tom liste. */}
        {isLoading && <p className="border border-gray-600 bg-gray-800 p-6">Henter podcasts...</p>}
        {error && <p className="border-l-4 border-white bg-gray-800 p-6">Podcasts kunne ikke hentes.</p>}
        {!isLoading && !error && sortedPodcasts.length === 0 && (
          <p className="border border-gray-600 bg-gray-800 p-6 text-gray-300">Der er endnu ikke oprettet nogen podcasts.</p>
        )}

        {/* Visning af listen over podcasts i en scrollbar boks, hvis der findes nogle. */}
        {!isLoading && !error && sortedPodcasts.length > 0 && (
          <div className="flex max-h-162.5 flex-col gap-4 overflow-y-auto pr-2">
            {sortedPodcasts.map((podcast) => (
              <article key={podcast._id} className="border border-gray-600 bg-gray-800 p-5 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {podcast.thumbnail && (
                    <img 
                      src={getPodcastUrl(podcast.thumbnail)} 
                      alt={podcast.headline} 
                      className="h-28 w-full object-cover sm:w-40" 
                    />
                  )}
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-extrabold">{podcast.headline}</h3>
                      {/* Viser om episoden er markeret som lyttet eller ej. */}
                      <span className="border border-gray-500 px-2 py-1 text-xs font-bold uppercase text-gray-300">
                        {listenedPodcastIds.includes(podcast._id) ? "Lyttet" : "Ikke lyttet"}
                      </span>
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-400">{podcast.subtitle || podcast.info}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(podcast.releaseDate).toLocaleDateString("da-DK")} {podcast.length && `· ${podcast.length}`}
                    </p>
                    
                    {/* Afspiller til lydfilen. */}
                    <audio controls src={getPodcastUrl(podcast.podcast)} className="mt-3 w-full" />
                  </div>
                </div>
                
                {/* Handlingsknapper til hver enkelt podcast (redigér, skift lytetestatus, slet). */}
                <div className="mt-5 flex flex-wrap gap-3">
                  <button 
                    type="button" 
                    onClick={() => handlePodcastEdit(podcast)} 
                    className="bg-white px-4 py-2 text-sm font-bold uppercase text-black hover:bg-gray-300"
                  >
                    Redigér
                  </button>
                  <button 
                    type="button" 
                    onClick={() => togglePodcastListened(podcast._id)} 
                    className="border border-gray-300 px-4 py-2 text-sm font-bold uppercase text-white hover:bg-white hover:text-black"
                  >
                    {listenedPodcastIds.includes(podcast._id) ? "Markér som ikke lyttet" : "Markér som lyttet"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handlePodcastDelete(podcast._id)} 
                    className="border border-gray-300 px-4 py-2 text-sm font-bold uppercase text-white hover:bg-white hover:text-black"
                  >
                    Slet podcast
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default PodcastAdmin