import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CollectionModal from "../Components/CollectionModal";

function MovieDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [movie,           setMovie]           = useState(null);
  const [collectionMovie, setCollectionMovie] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/movies/${id}`)
      .then(r => r.json())
      .then(data => setMovie(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!movie) {
    return (
      <div style={{ paddingTop: 100, textAlign: "center", background: "var(--bg-base)", minHeight: "100vh" }}>
        <div className="spinner-border text-danger" />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>

      {/* ── HERO BANNER ── */}
      <div style={{
        height: "88vh", position: "relative", overflow: "hidden",
        backgroundImage: `url(${movie.banner || movie.poster})`,
        backgroundSize: "cover", backgroundPosition: "center top"
      }}>
        {/* left-to-right gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)"
        }} />
        {/* bottom fade into page bg */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, var(--bg-base) 0%, transparent 35%)"
        }} />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute", top: 90, left: 24,
            background: "rgba(0,0,0,0.5)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8,
            padding: "6px 14px", cursor: "pointer",
            fontFamily: "Outfit", fontSize: 14, backdropFilter: "blur(6px)"
          }}
        >
          ← Back
        </button>

        {/* Hero content */}
        <div style={{
          position: "absolute", bottom: "12%", left: "4%", maxWidth: 560
        }}>
          {/* Category badge */}
          <div style={{
            display: "inline-block", background: "var(--accent)", color: "#fff",
            borderRadius: 6, padding: "2px 12px",
            fontSize: 12, fontWeight: 700, fontFamily: "Outfit", marginBottom: 12
          }}>
            {movie.category?.toUpperCase() || "MOVIE"}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "Outfit", fontWeight: 900,
            fontSize: "clamp(30px,5vw,64px)", lineHeight: 1.05,
            marginBottom: 14, textTransform: "uppercase", letterSpacing: "-1px"
          }}>
            {movie.title}
          </h1>

          {/* Meta row */}
          <div style={{
            display: "flex", gap: 16, flexWrap: "wrap",
            fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 14
          }}>
            {movie.releaseYear && <span>📅 {movie.releaseYear}</span>}
            {movie.duration    && <span>⏱ {movie.duration}</span>}
            {movie.rating      && <span>⭐ {movie.rating}/10</span>}
            {movie.language    && <span>🌐 {movie.language}</span>}
          </div>

          {/* Genre pills */}
          {movie.genres?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
              {movie.genres.map(g => (
                <span key={g} style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.85)",
                  borderRadius: 999, padding: "3px 12px",
                  fontSize: 12, fontFamily: "Outfit"
                }}>{g}</span>
              ))}
            </div>
          )}

          {/* Description */}
          <p style={{
            color: "rgba(255,255,255,0.72)", fontSize: 15,
            lineHeight: 1.65, marginBottom: 28, maxWidth: 480
          }}>
            {movie.description}
          </p>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => navigate(`/watch/${movie._id}`)}
              style={{
                background: "#fff", color: "#000",
                border: "none", borderRadius: 10, padding: "12px 32px",
                fontFamily: "Outfit", fontWeight: 700, fontSize: 15, cursor: "pointer"
              }}
            >
              ▶ Play
            </button>

            <button
              onClick={() => setCollectionMovie(movie)}
              style={{
                background: "rgba(255,255,255,0.15)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.30)", borderRadius: 10,
                padding: "12px 24px", fontFamily: "Outfit", fontWeight: 600,
                fontSize: 15, cursor: "pointer", backdropFilter: "blur(6px)"
              }}
            >
              + Watchlist
            </button>
          </div>
        </div>
      </div>

      {/* ── TRAILER ── */}
      {movie.trailerUrl && (
        <div className="container" style={{ paddingTop: 48, paddingBottom: 60, maxWidth: 900 }}>
          <h4 style={{ fontFamily: "Outfit", fontWeight: 700, marginBottom: 16 }}>Trailer</h4>
          <div style={{ borderRadius: 12, overflow: "hidden" }}>
            <iframe
              width="100%" height="420"
              src={movie.trailerUrl.replace("watch?v=", "embed/")}
              title="Trailer" allowFullScreen
              style={{ border: "none", display: "block" }}
            />
          </div>
        </div>
      )}

      {/* COLLECTION MODAL */}
      {collectionMovie && (
        <CollectionModal
          movie={collectionMovie}
          onClose={() => setCollectionMovie(null)}
        />
      )}
    </div>
  );
}

export default MovieDetails;