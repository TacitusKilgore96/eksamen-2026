'use client'

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import useRequestData from "../../hooks/useRequestData";
import Seneste from "@/app/components/Seneste";
import Video from "@/app/components/Video";
import LandingPagePodcast from "@/app/components/LandingPagePodcast";

// Fortæller hvordan et enkelt element i en artikel ser ud (f.eks. tekst eller billede)
type ArticleItem = {
  type: "paragraph" | "image" | "main" | "link";
  text?: string;
  url?: string;
  altText?: string;
  caption?: string;
  contentBody?: ArticleItem[];
};

// Fortæller hvordan en komplet artikel ser ud
type Article = {
  _id: string;
  title: string;
  articleCategory: string;
  author?: string;
  publishedAt?: string;
  content: ArticleItem[];
};

// Bygger den fulde URL til et billede, hvis det ikke allerede er en fuld sti
const getImageUrl = (image: string) => {
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `http://localhost:3001/assets/images/${image}`;
};

// Gennemgår og udskriver indholdet af en artikel (billeder, tekst osv.)
const renderContent = (content: ArticleItem[]) => content.map((item, index) => {
  // Hvis det er et billede
  if (item.type === "image" && item.url) {
    return (
      <figure key={`${item.type}-${index}`} className="my-6">
        <img src={getImageUrl(item.url)} alt={item.altText || ""} className="w-full max-h-[520px] object-cover" />
        {item.caption && <figcaption className="mt-2 text-sm text-gray-500">{item.caption}</figcaption>}
      </figure>
    );
  }

  // Hvis det er et tekstafsnit
  if (item.type === "paragraph" && item.text) {
    return <p key={`${item.type}-${index}`} className="mb-4 leading-7 text-gray-700">{item.text}</p>;
  }

  // Hvis der er underindhold (recursivt tjek)
  if (item.contentBody) {
    return <div key={`${item.type}-${index}`}>{renderContent(item.contentBody)}</div>;
  }

  return null;
});

export default function SubarticlePage() {
  // Henter artikel-ID'et fra URL'en
  const { id } = useParams<{ id: string }>();
  const { makeRequest, data, isLoading, error } = useRequestData();

  // Henter alle artikler, når siden indlæses og ID'et findes
  useEffect(() => {
    if (id) makeRequest<Article[]>("/article", "GET");
  }, [id, makeRequest]);

  const articles = data as Article[] | null;
  // Finder den specifikke artikel, hvis ID matcher det fra URL'en
  const article = articles?.find((item) => item._id === id) || null;

  // Viser tekst mens der hentes data, eller hvis der opstår en fejl/artiklen ikke findes
  if (isLoading) return <p className="mx-auto max-w-3xl p-4">Henter artikel...</p>;
  if (error || !article) return <p className="mx-auto max-w-3xl p-4 text-red-600">Artiklen kunne ikke hentes.</p>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Link til at gå tilbage til forsiden */}
      <Link href="/" className="mb-8 inline-block text-sm text-amber-700 hover:underline">&larr; Tilbage til forsiden</Link>
      
      <article>
        {/* Kategori */}
        <p className="mb-2 text-sm font-medium capitalize text-amber-700">{article.articleCategory}</p>
        
        {/* Titel */}
        <h1 className="mb-3 text-4xl font-bold leading-tight">{article.title}</h1>
        
        {/* Forfatter og dato */}
        <p className="mb-8 text-sm text-gray-500">
          {article.author && `Af ${article.author}`}
          {article.author && article.publishedAt && " | "}
          {article.publishedAt && new Date(article.publishedAt).toLocaleDateString("da-DK")}
        </p>
        
        {/* Indhold (viser tekst og billeder via hjælpefunktionen) */}
        <div>{renderContent(article.content)}</div>
      </article>

      {/* Ekstra komponenter i bunden af siden */}
      <Seneste />
      <Video />
      <LandingPagePodcast />
    </main>
  );
}