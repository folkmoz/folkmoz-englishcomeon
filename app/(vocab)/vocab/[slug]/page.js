import notion from "@/lib/notion";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const data = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
  });

  return data.results.map((page) => ({
    slug: page.properties.Front.title[0].plain_text,
  }));
}

export default async function VocabPage({ params }) {
  const { slug } = params;
  const data = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    filter: {
      property: "Front",
      title: {
        equals: decodeURI(slug),
      },
    },
  });
  if (!data.results.length) {
    return notFound();
  }
  const front = data.results[0].properties.Front.title[0].plain_text;
  const back = data.results[0].properties.Back.rich_text[0].plain_text;

  return (
    <>
      <div>
        <div className="text-5xl font-bold text-slate-700">
          <h1>{front}</h1>
        </div>
      </div>
    </>
  );
}

export const revalidate = 60; // In seconds
