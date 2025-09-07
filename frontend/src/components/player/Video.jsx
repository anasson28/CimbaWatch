export default function Video({ videoId, type = "movie", season, episode, provider = 'vidapi', slug }) {
  // Anime is only supported via 'vidapi' and '2embed' in backend; coerce invalid selection
  const providerToUse = type === 'anime' && provider === 'embed_su' ? 'vidapi' : provider;

  const params = new URLSearchParams();
  if (providerToUse) params.set('provider', providerToUse);
  if (type === 'tv' && season != null && episode != null) {
    params.set('s', season);
    params.set('e', episode);
  }
  if (type === 'anime' && episode != null) {
    params.set('e', episode);
  }
  const qs = params.toString();
  let src;
  if (type === 'movie') {
    src = `/proxy/embed/movie/${videoId}${qs ? `?${qs}` : ''}`;
  } else if (type === 'tv') {
    src = `/proxy/embed/tv/${videoId}${qs ? `?${qs}` : ''}`;
  } else if (type === 'anime') {
    const animeSlug = slug || videoId;
    src = `/proxy/embed/anime/${animeSlug}${qs ? `?${qs}` : ''}`;
  } else {
    src = '';
  }

  return (
    <iframe
      src={src}
      
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      width="100%"
      height="100%"
      frameBorder="0"
      allowFullScreen
      title="Video player"
    ></iframe>
  );
}
