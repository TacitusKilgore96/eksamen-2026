'use client'

import { useEffect } from "react";
import useRequestData from "./hooks/useRequestData";
import Slider from "./components/Slider";
import Podcast from "./podcast/page";

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
  }, [makeArticleRequest]); // <-- Komma tilføjet her

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
      <div className="max-w-6xl mx-auto p-4">
        <main className="space-y-12">
          {/* Øverste Artikel Grid (5 artikler i alt) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* venstre kolonne Artikel 1 */}
            {art1 && (
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold">{art1.title}</h1>
                <p className="text-sm mb-2">
                  <span className="text-amber-600 capitalize">{art1.articleCategory}</span> | 29 dage siden
                </p>
                {getArticleImage(art1.content) && (
                  <img 
                    src={`http://localhost:3001/assets/images/${getArticleImage(art1.content)}`} 
                    alt={art1.title}
                    className="w-full h-[280px] object-cover rounded" 
                  />
                )}
              </div>
            )}

            {/* højre kolonne Artikel 2 og 3 */}
            <div className="flex flex-col justify-between gap-4">
              {[art2, art3].map((art) => art && (
                <div key={art._id} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold">{art.title}</h2>
                    <p className="text-sm text-gray-600 my-1 line-clamp-2">{getArticleTeaser(art.content)}</p>
                    <p className="text-xs">
                      <span className="text-amber-600 capitalize">{art.articleCategory}</span> | 25 dage siden
                    </p>
                  </div>
                  {getArticleImage(art.content) && (
                    <img 
                      src={`http://localhost:3001/assets/images/${getArticleImage(art.content)}`} 
                      alt={art.title} 
                      className="w-36 h-24 object-cover rounded flex-shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Nederste række i grid'et */}
            {[art4, art5].map((art) => art && (
              <div key={art._id} className="relative rounded overflow-hidden group h-64">
                {getArticleImage(art.content) && (
                  <img 
                    src={`http://localhost:3001/assets/images/${getArticleImage(art.content)}`} 
                    alt={art.title} 
                    className="w-full h-full object-cover"
                  />
                )}
                {/* mørk baggrund i bunden med overskrift */}
                <div className="absolute bottom-0 inset-x-0 bg-black/80 text-white p-3">
                  <p className="text-sm line-clamp-2">{getArticleTeaser(art.content) || art.title}</p>
                </div>
              </div>
            ))}

          </section>

          {/* Seneste */}
          <Slider />

          {/* Podcast */}
          <Podcast />

        </main>
      </div>
    </div>
  );
}