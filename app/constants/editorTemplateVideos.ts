export interface TemplateVideo {
  id: string;
  name: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export const TEMPLATE_VIDEOS: TemplateVideo[] = [
  {
    id: "rain",
    name: "Rain",
    thumbnailUrl: "https://images.pexels.com/videos/3571264/free-video-3571264.jpg?auto=compress&cs=tinysrgb&w=200",
    videoUrl: "/api/video-proxy?id=rain",
  },
  {
    id: "smoke",
    name: "Smoke",
    thumbnailUrl: "https://images.pexels.com/videos/4320605/pexels-photo-4320605.jpeg?auto=compress&cs=tinysrgb&w=200",
    videoUrl: "/api/video-proxy?id=smoke",
  },
];
