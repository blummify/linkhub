export interface TemplateVideo {
  id: string;
  name: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export const TEMPLATE_VIDEOS: TemplateVideo[] = [
  {
    id: "ocean-waves",
    name: "Ocean Waves",
    thumbnailUrl: "https://images.pexels.com/videos/1409899/free-video-1409899.jpg?auto=compress&cs=tinysrgb&w=200",
    videoUrl: "/api/video-proxy?id=ocean-waves",
  },
  {
    id: "particles",
    name: "Particles",
    thumbnailUrl: "https://images.pexels.com/videos/3129957/free-video-3129957.jpg?auto=compress&cs=tinysrgb&w=200",
    videoUrl: "/api/video-proxy?id=particles",
  },
  {
    id: "rain",
    name: "Rain",
    thumbnailUrl: "https://images.pexels.com/videos/3571264/free-video-3571264.jpg?auto=compress&cs=tinysrgb&w=200",
    videoUrl: "/api/video-proxy?id=rain",
  },
  {
    id: "aurora",
    name: "Aurora",
    thumbnailUrl: "https://images.pexels.com/videos/4818030/free-video-4818030.jpg?auto=compress&cs=tinysrgb&w=200",
    videoUrl: "/api/video-proxy?id=aurora",
  },
  {
    id: "city-lights",
    name: "City Lights",
    thumbnailUrl: "https://images.pexels.com/videos/11533613/pexels-photo-11533613.jpeg?auto=compress&cs=tinysrgb&w=200",
    videoUrl: "/api/video-proxy?id=city-lights",
  },
  {
    id: "smoke",
    name: "Smoke",
    thumbnailUrl: "https://images.pexels.com/videos/4320605/pexels-photo-4320605.jpeg?auto=compress&cs=tinysrgb&w=200",
    videoUrl: "/api/video-proxy?id=smoke",
  },
];
