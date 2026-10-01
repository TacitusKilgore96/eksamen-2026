"use client"

import { useEffect } from "react"
import useRequestData from "../hooks/useRequestData"

type LandingPodcast = {
  _id: string
  headline: string
  subtitle: string
  thumbnail: string
  podcast: string
}

const podcastId = "682242f3e96e5317c911c72e"

const getPodcastUrl = (file: string) =>
  file.startsWith("http") ? file : `http://localhost:3001/assets/podcast/${file}`

const LandingPagePodcast = () => {
  const { makeRequest, data, isLoading, error } = useRequestData()

  useEffect(() => {
    makeRequest<LandingPodcast>(`/podcast/${podcastId}`, "GET")
  }, [makeRequest])

  const podcast = data as LandingPodcast | null

  if (isLoading) return <p>Henter podcast...</p>
  if (error) return <p className="text-red-600">Der opstod en fejl ved hentning af podcasten.</p>
  if (!podcast) return null

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">Podcast</h2>
      <div className="mx-auto flex flex-col gap-4 border p-3 sm:flex-row w-[80%]">
        <img
          src={getPodcastUrl(podcast.thumbnail)}
          alt={podcast.headline}
          className="h-32 w-full object-cover sm:w-48"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h3 className="font-bold">{podcast.headline}</h3>
          <p className="mb-3 text-sm text-gray-700">{podcast.subtitle}</p>
          <audio controls src={getPodcastUrl(podcast.podcast)} className="w-full" />
        </div>
      </div>
    </section>
  )
}

export default LandingPagePodcast