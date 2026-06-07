export interface TemplateVideo {
  id: string;
  name: string;
  thumbnailUrl: string;
  videoUrl: string;
}

// Free Pexels videos — each links to a publicly downloadable MP4.
// Thumbnails use images.pexels.com (already in remotePatterns).
export const TEMPLATE_VIDEOS: TemplateVideo[] = [
  {
    id: "ocean-waves",
    name: "Ocean Waves",
    thumbnailUrl: "https://images.pexels.com/videos/1409899/free-video-1409899.jpg?auto=compress&cs=tinysrgb&w=200",
    videoUrl: "https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_30fps.mp4",
  },
  {
    id: "particles",
    name: "Particles",
    thumbnailUrl: "https://images.pexels.com/videos/3129957/free-video-3129957.jpg?auto=compress&cs=tinysrgb&w=200",
    videoUrl: "https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_30fps.mp4",
  },
  {
    id: "rain",
    name: "Rain",
    thumbnailUrl: "https://images.pexels.com/videos/3571264/free-video-3571264.jpg?auto=compress&cs=tinysrgb&w=200",
    videoUrl: "https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_25fps.mp4",
  },
  {
    id: "aurora",
    name: "Aurora",
    thumbnailUrl: "https://images.pexels.com/videos/4818030/free-video-4818030.jpg?auto=compress&cs=tinysrgb&w=200",
    videoUrl: "https://videos.pexels.com/video-files/4818030/4818030-hd_1920_1080_24fps.mp4",
  },
  {
    id: "city-lights",
    name: "City Lights",
    thumbnailUrl: "https://images.pexels.com/videos/2098996/free-video-2098996.jpg?auto=compress&cs=tinysrgb&w=200",
    videoUrl: "https://videos.pexels.com/video-files/2098996/2098996-hd_1920_1080_24fps.mp4",
  },
  {
    id: "smoke",
    name: "Smoke",
    thumbnailUrl: "https://images.pexels.com/videos/4490051/free-video-4490051.jpg?auto=compress&cs=tinysrgb&w=200",
    videoUrl: "https://videos.pexels.com/video-files/4490051/4490051-hd_1920_1080_25fps.mp4",
  },
];
