import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetch("http://localhost:5000/movies")
      .then((r) => r.json())
      .then(setMovies);
  }, []);

  const filtered = movies.filter((movie) => {
    const q     = searchParams.get("q")?.toLowerCase() || "";
    const genres = searchParams.get("genres")?.split(",") || [];
    const lang  = searchParams.get("lang") || "";
    const from  = searchParams.get("yearFrom");
    const to    = searchParams.get("yearTo");
    let ok = true;
    if (q && !movie.title.toLowerCase().includes(q)) ok = false;
    if (genres.length && !genres.every((g) => movie.genres?.includes(g))) ok = false;
    if (lang && movie.language !== lang) ok = false;
    if (from && movie.releaseYear < Number(from)) ok = false;
    if (to   && movie.releaseYear > Number(to))   ok = false;
    return ok;
  });

  function addToWatchlist(movie) {
    if (!user) { alert("Please login to add to watchlist"); return; }
    const key = `watchlist_${user._id}`;
    const list = JSON.parse(localStorage.getItem(key)) || [];
    if (!list.find((m) => m._id === movie._id)) {
      list.push(movie);
      localStorage.setItem(key, JSON.stringify(list));
      alert("Added to Watchlist");
    } else {
      alert("Already in Watchlist");
    }
  }

  return (
    <div className="movies-page container">
      <h2 className="mb-4">Movies ({filtered.length})</h2>

      <div className="row g-4">
        {filtered.map((movie) => (
          <div key={movie._id} className="col-6 col-sm-4 col-md-3 col-lg-2">
            <div style={{ position: "relative" }}>
              <img
                src={movie.poster}
                alt={movie.title}
                style={{ width: "100%", borderRadius: "10px", cursor: "pointer", display: "block" }}
                onClick={() => navigate(`/movie/${movie._id}`)}
              />
              <button
                className="watchlist-btn"
                onClick={(e) => { e.stopPropagation(); addToWatchlist(movie); }}
              >
                + Watchlist
              </button>
            </div>
            <p className="card-title-text mt-2 mb-0">{movie.title}</p>
            {movie.releaseYear && (
              <p className="card-year-text">{movie.releaseYear}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Movies;