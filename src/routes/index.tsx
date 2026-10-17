import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { BirthdayExperience } from "@/components/birthday/BirthdayExperience";

type SearchParams = {
  mode?: "smooth" | "hd" | undefined;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    mode: search["mode"] === "hd" ? "hd" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Chúc Mừng Sinh Nhật! 🎂" },
      {
        name: "description",
        content: "Có một món quà bất ngờ dành riêng cho bạn. Chạm vào để mở nhé! ✨",
      },
      { property: "og:title", content: "Chúc Mừng Sinh Nhật! 🎂" },
      {
        property: "og:description",
        content: "Có một món quà bất ngờ dành riêng cho bạn. Chạm vào để mở nhé! ✨",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { mode } = Route.useSearch();

  useEffect(() => {
    document.documentElement.classList.add("birthday-theme");
    return () => document.documentElement.classList.remove("birthday-theme");
  }, []);

  return <BirthdayExperience mode={mode === "hd" ? "hd" : "smooth"} />;
}
