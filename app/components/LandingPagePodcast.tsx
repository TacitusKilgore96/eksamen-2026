"use client"

import { useEffect } from "react"
import useRequestData from "../hooks/useRequestData"

// definerer podcast-dataet
type LandingPodcast = {
  _id: string
  headline: string
  subtitle: string
  thumbnail: string
  podcast: string
}

// ID'et på den podcast der skal hentes
const podcastId = "682242f3e96e5317c911c72e"

// Sørger for at billeder og lyden får den rigtige stiadresse
const getPodcastUrl = (file: string) =>
  file.startsWith("http") ? file : `http://localhost:3001/assets/podcast/${file}`

const LandingPagePodcast = () => {
  // Henter værktøjer til at hente data fra serveren
  const { makeRequest, data, isLoading, error } = useRequestData()

  // Henter podcasten, lige så snart komponenten vises (mountes)
  useEffect(() => {
    makeRequest<LandingPodcast>(`/podcast/${podcastId}`, "GET")
  }, [makeRequest])

  // Gemmer dataet i en variabel med den rette type
  const podcast = data as LandingPodcast | null

  // Viser tekst hvis den loader eller fejler
  if (isLoading) return <p>Henter podcast...</p>
  if (error) return <p className="text-red-600">Der opstod en fejl ved hentning af podcasten.</p>
  if (!podcast) return null

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">Podcast</h2>
      
      {/* Selve kortet med podcasten */}
      <div className="mx-auto flex flex-col gap-4 border p-3 sm:flex-row w-[80%]">
        
        {/* Billede 🤯 */}
        <img
          src={getPodcastUrl(podcast.thumbnail)}
          alt={podcast.headline}
          className="h-32 w-full object-cover sm:w-48"
        />
        
        {/* div med tekst og lydafspiller */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h3 className="font-bold">{podcast.headline}</h3>
          <p className="mb-3 text-sm text-gray-700">{podcast.subtitle}</p>
          
          {/* Lydafspilleren */}
          <audio controls src={getPodcastUrl(podcast.podcast)} className="w-full" />
        </div>
      </div>
    </section>
  )
}

export default LandingPagePodcast