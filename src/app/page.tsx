import PortfolioPage from "@/components/PortfolioPage";
import {
  getIdentity,
  getScaleStats,
  getCases,
  getTools,
  getFilms,
  getWorkCategories,
  getCopy,
} from "@/lib/content";

/* Content is read from the database on every request —
   a change in admin is a change on the portfolio. */
export const revalidate = 0;

export default async function Home() {
  const [identity, stats, cases, tools, films, work, copy] = await Promise.all([
    getIdentity(),
    getScaleStats(),
    getCases(),
    getTools(),
    getFilms(),
    getWorkCategories(),
    getCopy(),
  ]);

  return (
    <PortfolioPage
      content={{ identity, stats, cases, tools, films, work, copy }}
    />
  );
}
