'use client'

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import useRequestData from "../../hooks/useRequestData";
import Seneste from "@/app/components/Seneste";
import Video from "@/app/components/Video";
import LandingPagePodcast from "@/app/components/LandingPagePodcast";

type ArticleItem = {
  type: "paragraph" | "image" | "main" | "link";
  text?: string;
  url?: string;
  altText?: string;
  caption?: string;
  contentBody?: ArticleItem[];
};

type Article = {
  _id: string;
  title: string;
  articleCategory: string;
  author?: string;
  publishedAt?: string;
  content: ArticleItem[];
};

const getImageUrl = (image: string) => {
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `http://localhost:3001/assets/images/${image}`;
};

const renderContent = (content: ArticleItem[]) => content.map((item, index) => {
  if (item.type === "image" && item.url) {
    return (
      <figure key={`${item.type}-${index}`} className="my-6">
        <img src={getImageUrl(item.url)} alt={item.altText || ""} className="w-full max-h-[520px] object-cover" />
        {item.caption && <figcaption className="mt-2 text-sm text-gray-500">{item.caption}</figcaption>}
      </figure>
    );
  }

  if (item.type === "paragraph" && item.text) {
    return <p key={`${item.type}-${index}`} className="mb-4 leading-7 text-gray-700">{item.text}</p>;
  }

  if (item.contentBody) {
    return <div key={`${item.type}-${index}`}>{renderContent(item.contentBody)}</div>;
  }

  return null;
});

export default function SubarticlePage() {
  const { id } = useParams<{ id: string }>();
  const { makeRequest, data, isLoading, error } = useRequestData();

  useEffect(() => {
    if (id) makeRequest<Article[]>("/article", "GET");
  }, [id, makeRequest]);

  const articles = data as Article[] | null;
  const article = articles?.find((item) => item._id === id) || null;

  if (isLoading) return <p className="mx-auto max-w-3xl p-4">Henter artikel...</p>;
  if (error || !article) return <p className="mx-auto max-w-3xl p-4 text-red-600">Artiklen kunne ikke hentes.</p>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="mb-8 inline-block text-sm text-amber-700 hover:underline">&larr; Tilbage til forsiden</Link>
      <article>
        <p className="mb-2 text-sm font-medium capitalize text-amber-700">{article.articleCategory}</p>
        <h1 className="mb-3 text-4xl font-bold leading-tight">{article.title}</h1>
        <p className="mb-8 text-sm text-gray-500">
          {article.author && `Af ${article.author}`}
          {article.author && article.publishedAt && " | "}
          {article.publishedAt && new Date(article.publishedAt).toLocaleDateString("da-DK")}
        </p>
        <div>{renderContent(article.content)}</div>
      </article>
      <Seneste />
      <Video />
      <LandingPagePodcast />
    </main>
  );
}