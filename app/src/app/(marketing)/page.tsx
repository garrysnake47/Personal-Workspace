import type { Metadata } from "next";

import { PortfolioHome } from "@/components/portfolio/portfolio-home";

import "../banner/banner.css";

export const metadata: Metadata = {
  title: { absolute: "WorkNest — Your focused workspace" },
  description: "WorkNest keeps work logs, notes, resources, and ideas in one focused place.",
};

export default function HomePage() {
  return <PortfolioHome />;
}
