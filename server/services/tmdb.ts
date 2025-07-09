interface TMDbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
      official: boolean;
    }[];
  };
}

interface TMDbResponse {
  page: number;
  results: TMDbMovie[];
  total_pages: number;
  total_results: number;
}

class TMDbService {
  private apiKey: string;
  private baseUrl = 'https://api.themoviedb.org/3';
  private imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('TMDB_API_KEY environment variable is required');
    }
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}?api_key=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('TMDb API request failed:', error);
      throw error;
    }
  }

  async getNowPlayingMovies(): Promise<TMDbMovie[]> {
    const response: TMDbResponse = await this.makeRequest('/movie/now_playing');
    return response.results;
  }

  async getUpcomingMovies(): Promise<TMDbMovie[]> {
    const response: TMDbResponse = await this.makeRequest('/movie/upcoming');
    return response.results;
  }

  async getMovieDetails(movieId: number): Promise<TMDbMovie> {
    const movie = await this.makeRequest(`/movie/${movieId}`);
    const videos = await this.makeRequest(`/movie/${movieId}/videos`);
    const credits = await this.makeRequest(`/movie/${movieId}/credits`);
    
    return {
      ...movie,
      videos: videos,
      credits: credits
    };
  }

  async getMovieCredits(movieId: number): Promise<any> {
    return await this.makeRequest(`/movie/${movieId}/credits`);
  }

  async getMovieTrailer(movieId: number): Promise<string | null> {
    const videos = await this.makeRequest(`/movie/${movieId}/videos`);
    
    const trailer = videos.results.find((video: any) => 
      video.type === 'Trailer' && 
      video.site === 'YouTube' && 
      video.official
    );
    
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  }

  getImageUrl(path: string | null): string | null {
    return path ? `${this.imageBaseUrl}${path}` : null;
  }

  getFullImageUrl(path: string | null): string | null {
    return path ? `https://image.tmdb.org/t/p/original${path}` : null;
  }

  transformMovieData(tmdbMovie: TMDbMovie) {
    const director = tmdbMovie.credits?.crew?.find((person: any) => person.job === 'Director');
    const topCast = tmdbMovie.credits?.cast?.slice(0, 10) || [];
    const topCrew = tmdbMovie.credits?.crew?.slice(0, 5) || [];
    
    return {
      tmdbId: tmdbMovie.id,
      title: tmdbMovie.title,
      overview: tmdbMovie.overview,
      posterPath: this.getImageUrl(tmdbMovie.poster_path),
      backdropPath: this.getFullImageUrl(tmdbMovie.backdrop_path),
      releaseDate: tmdbMovie.release_date,
      runtime: tmdbMovie.runtime,
      genres: tmdbMovie.genres?.map(g => g.name) || [],
      rating: tmdbMovie.vote_average ? tmdbMovie.vote_average.toString() : null,
      voteCount: tmdbMovie.vote_count,
      trailerUrl: null, // Will be populated separately
      director: director?.name || null,
      cast: topCast.map((person: any) => ({
        name: person.name,
        character: person.character,
        profilePath: person.profile_path
      })),
      crew: topCrew.map((person: any) => ({
        name: person.name,
        job: person.job,
        profilePath: person.profile_path
      })),
      language: tmdbMovie.original_language || 'en',
      certification: tmdbMovie.certification || null
    };
  }
}

export const tmdbService = new TMDbService();
