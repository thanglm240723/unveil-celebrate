import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { BirthdayExperience } from "@/components/birthday/BirthdayExperience";

export const Route = createFileRoute("/hd")({
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
  component: HdPage,
});

function HdPage() {
  useEffect(() => {
    document.documentElement.classList.add("birthday-theme");
    return () => document.documentElement.classList.remove("birthday-theme");
  }, []);

  return <BirthdayExperience mode="hd" />;
}
