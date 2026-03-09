import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function addToWatchlist(movie, user) {
  if (!user) {
    alert("Please login first");
    return;
  }
  const watchlistKey = `watchlist_${user._id}`;
  const watchlist = JSON.parse(localStorage.getItem(watchlistKey)) || [];
  const exists = watchlist.find((m) => m._id === movie._id);
  if (!exists) {
    watchlist.push(movie);
    localStorage.setItem(watchlistKey, JSON.stringify(watchlist));
    alert("Added to Watchlist");
  } else {
    alert("Already in Watchlist");
  }
}

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/movies/${id}`)
      .then((r) => r.json())
      .then(setMovie)
      .catch(console.error);
  }, [id]);

  if (!movie) {
    return (
      <>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div style={{ height:"100vh", background:"#0a0a0f", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:40, height:40, border:"3px solid rgba(255,255,255,0.1)", borderTop:"3px solid #e50914", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>

      {/* ── FULL-BLEED HERO BANNER ── */}
      <div
        className="md-hero"
        style={{ backgroundImage: `url(${movie.banner || movie.poster})` }}
      >
        <div className="md-gradient" />

        {/* back arrow */}
        <button className="md-back" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* left-side content */}
        <div className="md-content">

          <div className="md-meta-row">
            {movie.rating && (
              <span className="md-star">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#facc15" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {movie.rating}
              </span>
            )}
            {[movie.releaseYear, movie.duration, ...(movie.genres || [])].filter(Boolean).map((val, i) => (
              <span key={i} className="md-pill">{val}</span>
            ))}
          </div>

          <h1 className="md-title">{movie.title}</h1>

          {movie.description && (
            <p className="md-desc">{movie.description}</p>
          )}

          <div className="md-actions">
            <button className="md-btn-play" onClick={() => navigate(`/watch/${movie._id}`)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Play
            </button>

            <button
              className="md-btn-icon"
              title="Add to Watchlist"
              onClick={() => addToWatchlist(movie, user)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* ── EPISODES (Series only) ── */}
      {movie.category === "Series" && movie.episodes?.length > 0 && (
        <div className="md-episodes">
          <h3 className="md-ep-heading">Episodes</h3>
          {movie.episodes.map((ep) => (
            <div key={ep.episodeNumber} className="md-ep-row" onClick={() => navigate(`/watch/${movie._id}`)}>
              <div className="md-ep-num">{ep.episodeNumber}</div>
              <div className="md-ep-info">
                <div className="md-ep-title">{ep.title}</div>
                <div className="md-ep-dur">{ep.duration}</div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap');

/* HERO */
.md-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 560px;
  background-size: cover;
  background-position: center top;
  font-family: 'Outfit', sans-serif;
  overflow: hidden;
}

.md-gradient {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.50) 50%, rgba(0,0,0,0.05) 100%),
    linear-gradient(to top,   rgba(0,0,0,0.65) 0%, transparent 40%);
}

/* BACK BUTTON */
.md-back {
  position: absolute;
  top: 88px;
  left: 32px;
  z-index: 20;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.10);
  backdrop-filter: blur(10px);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.md-back:hover { background: rgba(255,255,255,0.20); transform: scale(1.08); }

/* CONTENT */
.md-content {
  position: absolute;
  bottom: 10%;
  left: 5%;
  max-width: 520px;
  z-index: 10;
}

/* META ROW */
.md-meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  margin-bottom: 14px;
}

.md-star {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #facc15;
}

.md-pill {
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: rgba(255,255,255,0.72);
}
.md-pill + .md-pill::before {
  content: ' · ';
  color: rgba(255,255,255,0.35);
  margin-right: 4px;
}

/* TITLE */
.md-title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(42px, 6.5vw, 88px);
  font-weight: 900;
  color: #fff;
  letter-spacing: -2px;
  line-height: 0.95;
  margin: 0 0 18px;
  text-transform: uppercase;
}

/* DESC */
.md-desc {
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255,255,255,0.68);
  line-height: 1.7;
  margin-bottom: 30px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ACTIONS */
.md-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.md-btn-play {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  background: #fff;
  color: #000;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  padding: 13px 32px;
  cursor: pointer;
  transition: background 0.18s, transform 0.12s;
  letter-spacing: 0.2px;
}
.md-btn-play:hover { background: #ddd; transform: scale(1.03); }

.md-btn-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.45);
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(8px);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
  flex-shrink: 0;
}
.md-btn-icon:hover {
  border-color: #fff;
  background: rgba(255,255,255,0.18);
  transform: scale(1.08);
}

/* EPISODES */
.md-episodes {
  background: #0a0a0f;
  padding: 44px 5% 72px;
  font-family: 'Outfit', sans-serif;
}

.md-ep-heading {
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: -0.5px;
}

.md-ep-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  margin-bottom: 10px;
  cursor: pointer;
  transition: background 0.18s;
  color: #fff;
}
.md-ep-row:hover { background: rgba(255,255,255,0.09); }

.md-ep-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(229,9,20,0.15);
  color: #e50914;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.md-ep-info { flex: 1; }
.md-ep-title { font-size: 15px; font-weight: 600; }
.md-ep-dur   { font-size: 13px; color: rgba(255,255,255,0.40); margin-top: 3px; }
`;