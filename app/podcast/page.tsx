"use client"

import { useEffect } from "react"
import useRequestData from "../hooks/useRequestData"

/* http://localhost:3001/podcast */

/* 1. Type-definition for strukturen af en podcast modtaget fra API'et */
type PodcastData = {
  _id: string
  headline: string
  length: string
  podcast: string
  thumbnail: string
  releaseDate: string
  subtitle: string
  ContentText: string
  info?: string
}

/* 2. Hjælpefunktion til at generere den fulde URL for podcast-filer */
const getPodcastUrl = (file: string) =>
  file.startsWith("http") ? file : `http://localhost:3001/assets/podcast/${file}`

const Podcast = () => {
  /* Henter data, loading-tilstand, fejl og funktionen til at lave anmodninger fra vores hook */
  const { makeRequest, data, isLoading, error } = useRequestData()

  /* Henter listen af podcasts, når komponenten indlæses */
  useEffect(() => {
    makeRequest<PodcastData[]>("/podcast", "GET")
  }, [makeRequest])

  /* Sikrer at data altid behandles som et array, uanset om API'et returnerer et enkelt objekt eller en liste */
  const podcasts = (Array.isArray(data) ? data : data ? [data] : []) as PodcastData[]
  
  /* Sorterer podcatsene, så den nyeste udgivelsesdato kommer først */
  const sortedPodcasts = [...podcasts].sort(
    (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  )
  
  /* Udtrækker den allernyeste podcast til hero-sektionen øverst */
  const latestPodcast = sortedPodcasts[0]

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Sektionens overskrift */}
      <h1 className="mb-5 text-3xl font-bold">Podcast</h1>

      {/* Håndtering af loading- og fejlbeskeder */}
      {isLoading && <p>Henter podcasts...</p>}
      {error && <p className="text-red-600">Der opstod en fejl ved hentning af podcasts.</p>}
      {!isLoading && !error && !latestPodcast && <p>Der er endnu ikke udgivet nogen podcasts.</p>}

      {/* Fremhævet visning af den nyeste podcast (Hero-billede med tekst-overlay) */}
      {latestPodcast && (
        <div className="relative mb-5 overflow-hidden">
          <img
            src="http://localhost:3001/assets/images/podcast_1.jpg"
            alt="Podcast i et lydstudie"
            className="h-full w-full object-cover"
          />
          <div className="absolute text-2xl bottom-5 right-5 bg-[#f2a900] p-7 text-white">
            <p className="font-bold">Lorem ipsum dolor <br />  sit amet consectetur.</p>
          </div>
        </div>
      )}

      {/* Liste over alle tilgængelige podcasts med scrollbar */}
      {sortedPodcasts.length > 0 && (
        <div className="max-h-[30rem] space-y-3 overflow-y-auto pr-2">
          {sortedPodcasts.map((podcast) => (
            <article key={podcast._id} className="flex flex-col gap-3 border p-3 sm:flex-row">
              {/* Podcast-miniaturebillede */}
              <img
                src={getPodcastUrl(podcast.thumbnail)}
                alt={podcast.headline}
                className="h-32 w-full object-cover sm:w-48"
              />
              {/* Tekstindhold og lydafspiller */}
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <h2 className="font-bold">{podcast.headline}</h2>
                <p className="mb-2 text-sm text-gray-700">{podcast.subtitle || podcast.info}</p>
                <p className="mb-2 text-xs text-gray-500">
                  {new Date(podcast.releaseDate).toLocaleDateString("da-DK")}
                </p>
                {/* Indbygget HTML5 lydafspiller */}
                <audio controls src={getPodcastUrl(podcast.podcast)} className="w-full" />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default Podcast