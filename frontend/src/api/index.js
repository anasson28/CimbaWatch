import { http } from './http';

export async function fetchCollection({ type = 'movie', sort = 'trending', search = '', page = 1 }) {
  const endpoint = type === 'movie' ? '/api/movies' : '/api/series';
  const { data } = await http.get(endpoint, {
    params: { sort, search, page }
  });
  return data.results;
}

export async function fetchFeatured() {
  // Re-use popular movies and pick the first one
  const { data } = await http.get('/api/movies', { params: { sort: 'popular', page: 1 } });
  return data.results?.[0];
}

export async function getStreamUrl(id, kind = 'movie') {
  const { data } = await http.get(`/api/${kind}/${id}/stream`);
  return data.url; // HLS .m3u8 (dev)
}
