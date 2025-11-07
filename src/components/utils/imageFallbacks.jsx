
export function getYogaFallbackImage(poseName = "", index = 0) {
  const keywords = (poseName || "").toLowerCase();
  // Use Unsplash Source for reliable stock images without API keys (seed with sig for variety)
  if (keywords.includes("downward")) return `https://source.unsplash.com/featured/?yoga,downward-dog&sig=${index}`;
  if (keywords.includes("child")) return `https://source.unsplash.com/featured/?yoga,child-pose&sig=${index}`;
  if (keywords.includes("savasana")) return `https://source.unsplash.com/featured/?yoga,savasana,relax&sig=${index}`;
  if (keywords.includes("twist")) return `https://source.unsplash.com/featured/?yoga,twist&sig=${index}`;
  if (keywords.includes("lunge")) return `https://source.unsplash.com/featured/?yoga,lunge&sig=${index}`;
  if (keywords.includes("bridge")) return `https://source.unsplash.com/featured/?yoga,bridge-pose&sig=${index}`;
  if (keywords.includes("plank")) return `https://source.unsplash.com/featured/?yoga,plank&sig=${index}`;
  if (keywords.includes("boat")) return `https://source.unsplash.com/featured/?yoga,boat-pose&sig=${index}`;
  if (keywords.includes("forward") || keywords.includes("fold")) return `https://source.unsplash.com/featured/?yoga,forward-fold&sig=${index}`;
  if (keywords.includes("cat") || keywords.includes("cow")) return `https://source.unsplash.com/featured/?yoga,cat-cow&sig=${index}`;
  return `https://source.unsplash.com/featured/?yoga,pose,calm&sig=${index}`;
}

export function getMeditationFallbackImage(stepName, index) {
  // Meditation fallback images
  const meditationImages = [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800',
    'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
    'https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=800',
    'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800'
  ];
  
  return meditationImages[index % meditationImages.length];
}
