import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { BirthdayExperience } from "@/components/birthday/BirthdayExperience";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chúc Mừng Sinh Nhật Nguyễn Thị Phượng!" },
      {
        name: "description",
        content:
          "Một bất ngờ sinh nhật dành riêng cho Nguyễn Thị Phượng — pháo hoa, bóng bay, bánh kem và một điều ước gửi đến vũ trụ.",
      },
      { property: "og:title", content: "Chúc Mừng Sinh Nhật Nguyễn Thị Phượng!" },
      {
        property: "og:description",
        content: "Mở hộp quà và khám phá bất ngờ sinh nhật dành riêng cho bạn!",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    document.documentElement.classList.add("birthday-theme");
    return () => document.documentElement.classList.remove("birthday-theme");
  }, []);

  return <BirthdayExperience />;
}
