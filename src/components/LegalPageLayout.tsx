import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import type { LegalDocument } from "@/content/legal";

/**
 * Dokuz yasal metnin tamamı bu düzeni kullanır. İçerik markdown olarak
 * src/content/legal.ts'ten gelir; o dosya docs/legal/*.md'den üretilir
 * (bkz. scripts/sync-legal-content.mjs).
 *
 * Sunucu bileşeni olarak çalışır — markdown ayrıştırma istemciye
 * gönderilen paketin boyutunu etkilemez.
 */
export function LegalPageLayout({ doc }: { doc: LegalDocument }) {
  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main className="bg-[#faf8f5]">
        <article className="container-site py-14 md:py-20 max-w-[760px]">
          <header className="mb-10 pb-8 border-b border-[#e6e1da]">
            <h1 className="font-heading text-3xl md:text-4xl font-medium text-[#1d3435] text-balance">
              {doc.title}
            </h1>
            {doc.updatedAt && (
              <p className="mt-3 text-[13px] text-[#8a8580]">
                Son güncelleme: {doc.updatedAt}
                <span className="mx-2 text-[#c9c3bb]">·</span>
                Sürüm {doc.version}
              </p>
            )}
          </header>

          <div className="legal-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h2 className="font-heading text-[22px] md:text-[25px] font-medium text-[#1d3435] mt-14 mb-5 text-balance">
                    {children}
                  </h2>
                ),
                h2: ({ children }) => (
                  <h3 className="text-[17px] font-semibold text-[#1d3435] mt-11 mb-4 text-balance">
                    {children}
                  </h3>
                ),
                h3: ({ children }) => (
                  <h4 className="text-[15px] font-semibold text-[#1d3435] mt-8 mb-3">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-[14.5px] leading-[1.75] text-[#3f4a4a] mb-4 text-pretty">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-[#1d3435]">{children}</strong>
                ),
                ul: ({ children }) => (
                  <ul className="mb-5 space-y-2 pl-5 list-disc marker:text-[#a8b5b0]">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-5 space-y-2 pl-5 list-decimal marker:text-[#3d7b74] marker:font-medium">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-[14.5px] leading-[1.7] text-[#3f4a4a] pl-1 [&>p]:mb-2">
                    {children}
                  </li>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-[#3d7b74] underline decoration-[#3d7b74]/30 underline-offset-2 hover:decoration-[#3d7b74] transition-colors"
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-6 rounded-lg bg-[#f2efe9] px-5 py-4 text-[14px] leading-relaxed text-[#3f4a4a] [&>p:last-child]:mb-0">
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="my-10 border-[#e6e1da]" />,
                em: ({ children }) => (
                  <em className="italic text-[#5c6564]">{children}</em>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-[#eeeae3] px-1.5 py-0.5 font-mono text-[12.5px] text-[#1d3435]">
                    {children}
                  </code>
                ),
                // Tablolar mobilde taşmasın — kendi içinde yatay kayar
                table: ({ children }) => (
                  <div className="my-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <table className="w-full min-w-[440px] border-collapse text-left text-[13.5px]">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-[#f2efe9]">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="border border-[#e6e1da] px-3.5 py-2.5 font-semibold text-[#1d3435] align-top">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-[#e6e1da] px-3.5 py-2.5 text-[#3f4a4a] leading-[1.6] align-top">
                    {children}
                  </td>
                ),
              }}
            >
              {doc.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
