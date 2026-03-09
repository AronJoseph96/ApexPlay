import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Watchlist() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const key = user ? `watchlist_${user._id}` : null;
  const watchlist = key ? JSON.parse(localStorage.getItem(key)) || [] : [];

  return (
    <div className="watchlist-page container">
      <h2 className="mb-4">My Watchlist</h2>

      {watchlist.length === 0 ? (
        <div style={{ paddingTop: "40px", textAlign: "center" }}>
          <p style={{ fontSize: "16px" }}>No movies in your watchlist yet.</p>
          <button className="btn btn-danger mt-2" onClick={() => navigate("/movies")}>
            Browse Movies
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {watchlist.map((movie) => (
            <div key={movie._id} className="col-6 col-md-3 col-lg-2">
              <img
                src={movie.poster}
                alt={movie.title}
                style={{ width: "100%", borderRadius: "10px", cursor: "pointer", display: "block" }}
                onClick={() => navigate(`/movie/${movie._id}`)}
              />
              <p className="card-title-text mt-2 mb-0">{movie.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Watchlist;