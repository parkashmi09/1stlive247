import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TopBar } from "@/components/chrome";
import { ImagePlaceholder, NewsRow } from "@/components/news";
import { sportOf } from "@/data/sports";
import { api, articleMeta } from "@/lib/api";
import { TimeAgo } from "@/components/TimeAgo";

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  return articleMeta((await params).slug);
}

export default function ArticlePage({ params }: PageProps<"/news/[slug]">) {
  return (
    <>
      <TopBar variant="back" title="News" backHref="/news" />
      <Suspense fallback={<div className="mx-4 h-96 animate-pulse rounded-2xl bg-surface-2" />}>
        <Article params={params} />
      </Suspense>
    </>
  );
}

async function Article({ params }: { params: PageProps<"/news/[slug]">["params"] }) {
  const { slug } = await params;
  const [a, all] = await Promise.all([api.article(slug), api.news()]);
  if (!a) notFound();
  const related = all.filter((n) => n.slug !== a.slug).slice(0, 2);
  return (
      <main className="lg:mx-auto lg:max-w-[760px]">
        <ImagePlaceholder sport={a.sport} className="h-56 w-full" iconSize={110} />
        <article className="flex flex-col gap-3.5 px-4 pt-4">
          <span className="bg-gold w-fit rounded-md px-2 py-0.5 text-xs font-bold uppercase text-[#06121C]">
            {sportOf(a.sport).label}
          </span>
          <h1 className="text-2xl font-bold leading-tight">{a.title}</h1>
          <p className="text-xs text-text-2">{a.author} · <TimeAgo iso={a.publishedAt} /> · {a.readMins} min read</p>
          {a.body.map((p, i) => (
            <div key={i} className="contents">
              <p className="leading-relaxed">{p}</p>
              {i === 0 && a.quote && (
                <blockquote className="border-l-[3px] border-[#D9AB4B] pl-3 text-xl font-black italic leading-snug text-primary">“{a.quote}”</blockquote>
              )}
            </div>
          ))}
          <h2 className="pt-3 text-lg font-bold">Related</h2>
          <div>{related.map((r) => <NewsRow key={r.slug} a={r} />)}</div>
        </article>
      </main>
  );
}
