'use client'

import { useEffect } from "react";
import Link from "next/link";
import useRequestData from "./hooks/useRequestData";
import Slider from "./components/Seneste";
import Video from "./components/Video";
import LandingPagePodcast from "./components/LandingPagePodcast";

/* 1. Typedefinitioner navngivet efter API-strukturen */
type landingItem =
  | { type: "paragraph"; text?: string; contentBody?: unknown[] }
  | { type: "main"; contentBody?: unknown[] }
  | { type: "image"; url?: string; altText?: string; caption?: string; thumbnail?: string; contentBody?: unknown[] }
  | { type: "link"; text?: string; contentBody?: unknown[] };

/* 1,5. Definerer artiklerne til landingpage */
type landingArticle = {
  _id: string;
  title: string;
  slug: string;
  articleCategory: string;
  author: string;
  publishedAt: string;
  isLandingpage: boolean;
  content: landingItem[];
};

/* 2. Hjælpefunktioner til at udtrække data fra content-arrayet */
const getArticleImage = (content: landingItem[]): string | null => {
  const imageItem = content.find((item) => item.type === "image") as { url?: string } | undefined;
  return imageItem?.url || null;
};

const getArticleTeaser = (content: landingItem[]): string => {
  const paragraphItem = content.find((item) => item.type === "paragraph") as { text?: string } | undefined;
  return paragraphItem?.text || "";
};

export default function Home() {
  const {
    makeRequest: makeArticleRequest,
    data: articles,
    isLoading,
    error,
  } = useRequestData();

  useEffect(() => {
    /* Henter artiklerne til forsiden, når komponenten mountes */
    makeArticleRequest<landingArticle[]>("/article/landingpage", "GET");
  }, [makeArticleRequest]);

  /* Type-casting af API-data til vores landingArticle-array */
  const mainData = articles as landingArticle[] | null; // <-- Rettet fra Article til landingArticle
  /* Håndtering af loading, fejl og manglende data */
  if (isLoading) return <p className="p-4">Henter artikler...</p>;
  if (error) return <p className="p-4 text-red-600">Der opstod en fejl ved hentning af artikler.</p>;
  if (!mainData || mainData.length === 0) return null;

  /* De 5 første artikler til hovedgrid'et */
  const [art1, art2, art3, art4, art5] = mainData; // <-- Udtrækker fra mainData

  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <main className="space-y-12">
          {/* Øverste Artikel Grid (5 artikler i alt) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* venstre kolonne Artikel 1 */}
            {art1 && (
              <Link href={`/subarticle/${art1._id}`} className="flex flex-col">
                <h1 className="text-2xl font-bold">{art1.title}</h1>
                <p className="text-sm mb-2">
                  <span className="text-amber-600 capitalize">{art1.articleCategory}</span> | 29 dage siden
                </p>
                {getArticleImage(art1.content) && (
                  <img 
                    src={`http://localhost:3001/assets/images/${getArticleImage(art1.content)}`} 
                    alt={art1.title}
                    className="w-full h-[280px] object-cover" 
                  />
                )}
              </Link>
            )}


          {/* højre kolonne Artikel 2 og 3 */}

          <div className="grid grid-cols-2 md:flex md:flex-col gap-4 md:pt-8">
            {[art2, art3].map((art) => art && (
              <Link 
                href={`/subarticle/${art._id}`} 
                key={art._id} 
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 h-full"
              >
                {/* Tekst: Kommer nederst på mobil (order-2), men til venstre på desktop (md:order-1) */}
                <div className="flex-1 flex flex-col justify-between order-2 md:order-1 h-full">
                  <div className="md:mt-7">
                    <h2 className="text-sm md:text-lg font-bold">{art.title}</h2>
                    <p className="text-xs md:text-sm text-gray-600">{getArticleTeaser(art.content)}</p>
                  </div>
                  <p className="text-[10px] md:text-xs mt-2">
                    <span className="text-amber-600 capitalize">{art.articleCategory}</span> | 25 dage siden
                  </p>
                </div>

                {/* Billede: Kommer øverst på mobil (order-1), men til højre på desktop (md:order-2) */}
                {getArticleImage(art.content) && (
                  <img 
                    src={`http://localhost:3001/assets/images/${getArticleImage(art.content)}`} 
                    alt={art.title} 
                    className="w-full h-auto md:w-36 md:h-24 object-cover order-1 md:order-2"
                  />
                )}
              </Link>
            ))}
          </div>

            {/* Nederste række i grid'et */}
            {[art4, art5].map((art) => art && (
              <Link href={`/subarticle/${art._id}`} key={art._id} className="relative overflow-hidden group h-64">
                {getArticleImage(art.content) && (
                  <img 
                    src={`http://localhost:3001/assets/images/${getArticleImage(art.content)}`} /* via getArticleImage finder den billedet i data type'en "image" */
                    alt={art.title} 
                    className="w-full h-full object-cover"
                  />
                )}
                {/* via getArticleTeaser, finder den data type'en "paragraph" -> "text" */}
                <p className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2 text-sm text-white">
                  {getArticleTeaser(art.content)}
                </p>
              </Link>
            ))}

          </section>

          {/* Seneste */}
          <Slider />

          {/* Videoer */}
          <Video />

          {/* Podcast */}
          <LandingPagePodcast />

        </main>
      </div>
    </div>
  );
}