"use client"

import { useEffect } from "react";
import Link from "next/link";
import useRequestData from "../hooks/useRequestData";

/* 1. Typedefinitioner til elementer i artiklens indhold (tekst og billeder) */
type landingItem =
  | { type: "paragraph"; text?: string; contentBody?: unknown[] }
  | { type: "image"; url?: string; altText?: string; caption?: string; thumbnail?: string; contentBody?: unknown[] }

/* 2. Type-definition for selve artiklen, der vises i slideren */
type landingArticle = {
  _id: string;
  articleCategory: string;
  publishedAt: string;
  isLandingpage: boolean;
  title: string;
  headline?: string;
  content: landingItem[];
};

/* 3. Hjælpefunktion til at finde og udtrække et billede fra artikelindholdet */
const getArticleImage = (content: landingItem[]): string | null => {
  const imageItem = content.find((item) => item.type === "image") as { url?: string } | undefined;
  return imageItem?.url || null;
};

/* 4. Hjælpefunktion til at udtrække en brødtekst/teaser fra artikelindholdet */
const getArticleTeaser = (content: landingItem[]): string => {
  const paragraphItem = content.find((item) => item.type === "paragraph") as { text?: string } | undefined;
  return paragraphItem?.text || "";
};

/* 5. Hjælpefunktion til at tjekke og opbygge den fulde URL til billedet */
const getImageUrl = (image: string): string => {
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `http://localhost:3001/assets/images/${image}`;
};

const Seneste = () => {

  /* Destrukturering af hook til at foretage API-anmodninger */
  const {
      makeRequest: makeArticleRequest,
      data: articles,
      isLoading,
      error,
    } = useRequestData();
  
    useEffect(() => {
      /* Henter artiklerne til forsiden/slideren, når komponenten mountes */
      makeArticleRequest<landingArticle[]>("/article/landingpage", "GET");
    }, [makeArticleRequest]);
  
    /* Type-casting af modtaget API-data til vores definerede landingArticle-array */
    const mainData = articles as landingArticle[] | null;
  
    /* Håndtering af visning under indlæsning */
    if (isLoading) return <p className="p-4">Henter artikler...</p>;
    /* Håndtering af fejl, hvis API-kaldet mislykkes */
    if (error) return <p className="p-4 text-red-600">Der opstod en fejl ved hentning af artikler.</p>;
    /* Returnerer ingenting, hvis der ikke er nogen data eller arrayet er tomt */
    if (!mainData || mainData.length === 0) return null;
  
    /* Sorterer artiklerne efter udgivelsesdato (nyeste først) og begrænser til de første 4 */
    const latestArticles = [...mainData]
      .sort((firstArticle, secondArticle) =>
        Date.parse(secondArticle.publishedAt) - Date.parse(firstArticle.publishedAt)
      )
      .slice(0, 4);

  return (
    <section className="space-y-3 md:mx-auto md:w-[80%] lg:w-[100%]">
      {/* Sektionens hovedoverskrift */}
      <h2 className="text-2xl font-bold">Seneste</h2>
      
      {/* Responsivt grid-layout til de seneste artikler */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-1 lg:grid-cols-4">
        {latestArticles.map((article) => {
          const image = getArticleImage(article.content);
          const title = article.title || article.headline || "";

          return (
            <Link href={`/subarticle/${article._id}`} key={article._id} className="">
              {/* Billedvisning (renderes kun hvis et billede er til stede) */}
              {image && (
                <img
                  src={getImageUrl(image)}
                  alt={title}
                  className="mb-3 aspect-[4/3] w-full object-cover"
                />
              )}
              {/* Artikelens overskrift */}
              <h3 className="font-bold leading-tight">{title}</h3>
              
              {/* Kort introduktion / teasertekst */}
              <p className="mt-1 line-clamp-3 text-sm leading-snug text-gray-700">
                {getArticleTeaser(article.content)}
              </p>
              
              {/* Kategori-tag i bunden af kortet */}
              <p className="mt-2 text-xs text-gray-500">
                <span className="text-amber-600 capitalize">{article.articleCategory}</span>
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  )
}

export default Seneste