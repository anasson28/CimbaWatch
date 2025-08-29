import { http } from './http';

export async function fetchCollection({ type = 'movie', sort = 'trending', search = '', page = 1 }) {
  const endpoint = type === 'movie' ? '/api/movies' : '/api/series';
  const { data } = await http.get(endpoint, {
    params: { sort, search, page }
  });
  return data.results;
}

export async function fetchFeatured() {
  // Pick first popular item, then fetch its full details so we have a backdrop
  const { data } = await http.get('/api/movies', { params: { sort: 'popular', page: 1 } });
  const first = data.results?.[0];
  if (!first) return null;
  try {
    const kind = first.type === 'series' ? 'series' : 'movie';
    const res = await http.get(`/api/${kind}/${first.id}`);
    return res.data; // includes backdrop, overview, genres, etc.
  } catch (e) {
    // Fallback: still return the card if detail fails
    return first;
  }
}

export async function fetchRecommended({ sort = 'trending', page = 1, limit = 20 } = {}) {
  const { data } = await http.get('/api/recommended', { params: { sort, page, limit } });
  return data.results || [];
}

export async function getStreamUrl(id, kind = 'movie') {
  // Prefer clean stream resolver endpoint
  try {
    const { data } = await http.get(`/api/stream/${id}`, { params: { tmdb: 1 } });
    return data.stream_url;
  } catch (e) {
    // Fallback to dev placeholder route if available
    const { data } = await http.get(`/api/${kind}/${id}/stream`);
    return data.url;
  }
}

// Fetch single movie details by ID
export async function fetchMovie(id) {
  if (!id) throw new Error('fetchMovie: id is required');
  const { data } = await http.get(`/api/movie/${id}`);
  return data;
}

// Fetch single series details by ID
export async function fetchSeries(id) {
  if (!id) throw new Error('fetchSeries: id is required');
  const { data } = await http.get(`/api/series/${id}`);
  return data;
}
