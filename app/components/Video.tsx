"use client"

import { useEffect, useState } from "react"
import useRequestData from "../hooks/useRequestData"

/* 1. Type-definition for datastrukturen på en video */
type LandingVideo = {
  _id: string
  url: string
  thumbnail: string
  headline: string
  content: string
}

/* 2. Hjælpefunktion til at generere den fulde URL for enten billeder eller videoer */
const getMediaUrl = (file: string, folder: "video" | "images") =>
  file.startsWith("http") ? file : `http://localhost:3001/assets/${folder}/${file}`

const Video = () => {
  const { makeRequest, data, isLoading, error } = useRequestData()
  const [selectedVideo, setSelectedVideo] = useState<LandingVideo | null>(null)

  /* Henter videoer fra API'et ved komponentens indlæsning */
  useEffect(() => {
    makeRequest<LandingVideo[]>("/video", "GET")
  }, [makeRequest])

  /* Gør det muligt at lukke video-modalen ved at trykke på Escape-tasten */
  useEffect(() => {
    if (!selectedVideo) return
    const closeOnEsc = (e: KeyboardEvent) => e.key === "Escape" && setSelectedVideo(null)
    window.addEventListener("keydown", closeOnEsc)
    return () => window.removeEventListener("keydown", closeOnEsc)
  }, [selectedVideo])

  const videos = data as LandingVideo[] | null

  /* Håndtering af loading- og feiltilstande */
  if (isLoading) return <p>Henter videoer...</p>
  if (error) return <p className="text-red-600">Der opstod en fejl ved hentning af videoer.</p>
  if (!videos?.length) return null

  /* Udtrækker den fremhævede store video og de 3 sekundære listevideoer */
  const featured = videos[3] ?? videos[0]
  const list = videos.slice(0, 3)

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">Video</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Venstre kolonne: Liste af mindre videoer */}
        <div className="space-y-3">
          {list.map((v) => (
            <article key={v._id} className="grid grid-cols-[7.5rem_1fr] gap-3">
              <button 
                onClick={() => setSelectedVideo(v)} 
                className="group relative aspect-[4/3] overflow-hidden text-left"
                aria-label={`Afspil ${v.headline}`}
              >
                <img 
                  src={getMediaUrl(v.thumbnail, "images")} 
                  alt="" 
                  className="h-full w-full object-cover transition group-hover:scale-105" 
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/15 text-white text-xl group-hover:bg-black/30">
                  ▶
                </span>
              </button>
              <div>
                <h3 className="font-bold leading-tight">{v.headline}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-700">{v.content}</p>
                <p className="mt-2 text-xs text-gray-500">
                  <span className="text-amber-600">nyheder</span> | 25 dage siden
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Højre kolonne: Den store fremhævede video */}
        <article>
          <button 
            onClick={() => setSelectedVideo(featured)} 
            className="group relative block aspect-video w-full overflow-hidden text-left"
            aria-label={`Afspil ${featured.headline}`}
          >
            <img 
              src={getMediaUrl(featured.thumbnail, "images")} 
              alt="" 
              className="h-full w-full object-cover transition group-hover:scale-105" 
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/15 text-white text-3xl group-hover:bg-black/30">
              ▶
            </span>
          </button>
          <h3 className="mt-2 font-bold leading-tight">{featured.headline}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-700">{featured.content}</p>
          <p className="mt-2 text-xs text-gray-500">
            <span className="text-amber-600">nyheder</span> | 25 dage siden
          </p>
        </article>
      </div>

      {/* Pop-up Modal til afspilning af den valgte video */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="relative w-full max-w-4xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedVideo(null)} 
              className="absolute right-2 top-2 z-10 p-2 text-white bg-black/70"
            >
              ×
            </button>
            <video 
              controls 
              autoPlay 
              className="max-h-[80vh] w-full" 
              poster={getMediaUrl(selectedVideo.thumbnail, "images")} 
              src={getMediaUrl(selectedVideo.url, "video")} 
            />
          </div>
        </div>
      )}
    </section>
  )
}

export default Video