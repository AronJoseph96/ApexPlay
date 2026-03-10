import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000";

export default function WatchMovie() {
  const { id }           = useParams();
  const navigate         = useNavigate();
  const [searchParams]   = useSearchParams();

  // For series: ?season=1&ep=2
  const seasonParam = Number(searchParams.get("season")) || null;
  const epParam     = Number(searchParams.get("ep"))     || null;

  const [content,  setContent]  = useState(null);  // the movie or series doc
  const [videoUrl, setVideoUrl] = useState("");
  const [title,    setTitle]    = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const videoRef   = useRef();
  const { user }   = useCurrentUser();
  const continueKey = user ? `continue_${user._id}` : null;

  useEffect(() => {
    axios.get(`${API}/movies/${id}`)
      .then(res => {
        const doc = res.data;
        setContent(doc);

        if (doc.category === "Series" && seasonParam && epParam) {
          // find the right season and episode
          const season  = doc.seasons?.find(s => s.seasonNumber === seasonParam);
          const episode = season?.episodes?.find(e => e.episodeNumber === epParam);

          if (!episode) {
            setError(`Season ${seasonParam}, Episode ${epParam} not found.`);
          } else {
            setVideoUrl(episode.videoUrl);
            setTitle(`${doc.title} — S${seasonParam} E${epParam}: ${episode.title}`);
          }
        } else {
          // plain movie
          setVideoUrl(doc.videoUrl);
          setTitle(doc.title);
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load content."); setLoading(false); });
  }, [id, seasonParam, epParam]);

  // Save to "continue watching" every 5 seconds
  useEffect(() => {
    if (!content || !continueKey) return;
    const save = () => {
      let list = JSON.parse(localStorage.getItem(continueKey)) || [];
      // store the base series/movie (not per-episode)
      if (!list.find(m => m._id === content._id)) {
        list.push(content);
        localStorage.setItem(continueKey, JSON.stringify(list));
      }
    };
    const interval = setInterval(save, 5000);
    return () => clearInterval(interval);
  }, [content, continueKey]);

  /* ── LOADING ── */
  if (loading) {
    return (
      <>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ height:"100vh", background:"#000", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:40, height:40, border:"3px solid rgba(255,255,255,0.1)", borderTop:"3px solid #e50914", borderRadius:"50%", animation:"spin .8s linear infinite" }} />
        </div>
      </>
    );
  }

  /* ── ERROR ── */
  if (error) {
    return (
      <div style={{ height:"100vh", background:"#000", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
        <p style={{ color:"#f87171", fontFamily:"Outfit,sans-serif", fontSize:18 }}>{error}</p>
        <button className="btn btn-outline-light" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="watch-page">

        {/* TOP BAR */}
        <div className="watch-topbar">
          <button className="watch-back" onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
          <div className="watch-title">{title}</div>
        </div>

        {/* VIDEO */}
        <div className="watch-video-wrap">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              autoPlay
              className="watch-video"
            />
          ) : (
            <div className="watch-no-video">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
              <p>No video available for this content.</p>
            </div>
          )}
        </div>

        {/* EPISODE NAV (series only) */}
        {content?.category === "Series" && seasonParam && epParam && (
          <EpisodeNav
            content={content}
            currentSeason={seasonParam}
            currentEp={epParam}
            navigate={navigate}
            id={id}
          />
        )}

      </div>
    </>
  );
}


/* ════════════════════════════════════════
   EPISODE NAVIGATOR
   Shows prev/next episode buttons + episode list for current season
════════════════════════════════════════ */
function EpisodeNav({ content, currentSeason, currentEp, navigate, id }) {
  const season   = content.seasons?.find(s => s.seasonNumber === currentSeason);
  if (!season) return null;

  const episodes = season.episodes || [];
  const currentIdx = episodes.findIndex(e => e.episodeNumber === currentEp);
  const prevEp     = episodes[currentIdx - 1] || null;
  const nextEp     = episodes[currentIdx + 1] || null;

  const goTo = (ep) => navigate(`/watch/${id}?season=${currentSeason}&ep=${ep.episodeNumber}`);

  return (
    <div className="ep-nav">
      <div className="ep-nav-header">
        <span className="ep-nav-label">
          {content.title} — Season {currentSeason}
        </span>
        <div className="ep-nav-arrows">
          <button className="ep-arrow" disabled={!prevEp} onClick={() => prevEp && goTo(prevEp)}>
            ← Prev
          </button>
          <button className="ep-arrow" disabled={!nextEp} onClick={() => nextEp && goTo(nextEp)}>
            Next →
          </button>
        </div>
      </div>

      <div className="ep-nav-list">
        {episodes.map(ep => (
          <div
            key={ep.episodeNumber}
            className={`ep-nav-item ${ep.episodeNumber === currentEp ? "active" : ""}`}
            onClick={() => goTo(ep)}
          >
            <div className="ep-nav-num">E{ep.episodeNumber}</div>
            <div className="ep-nav-title">{ep.title}</div>
            {ep.duration && <div className="ep-nav-dur">{ep.duration}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}


/* ════════════════════════════════════════
   HELPER — get user from localStorage
════════════════════════════════════════ */
function useCurrentUser() {
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem("reelstream_user")); }
    catch { return null; }
  });
  return { user };
}


/* ════════════════════════════════════════
   CSS
════════════════════════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');

.watch-page {
  background: #000;
  min-height: 100vh;
  font-family: 'Outfit', sans-serif;
  display: flex;
  flex-direction: column;
}

/* TOP BAR */
.watch-topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  position: sticky;
  top: 0;
  z-index: 100;
}
.watch-back {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
  color: #fff; border-radius: 8px; padding: 7px 14px;
  font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: background 0.2s;
  flex-shrink: 0;
}
.watch-back:hover { background: rgba(255,255,255,0.15); }
.watch-title {
  color: #fff; font-size: 15px; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* VIDEO */
.watch-video-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  padding: 0;
}
.watch-video {
  width: 100%;
  max-height: 78vh;
  display: block;
}
.watch-no-video {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; color: rgba(255,255,255,0.35); font-size: 15px; padding: 80px 0;
}

/* EPISODE NAV */
.ep-nav {
  background: #0d0d12;
  border-top: 1px solid rgba(255,255,255,0.08);
  padding: 20px 24px 32px;
}
.ep-nav-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px; flex-wrap: wrap; gap: 10px;
}
.ep-nav-label {
  color: #fff; font-size: 15px; font-weight: 700;
}
.ep-nav-arrows { display: flex; gap: 8px; }
.ep-arrow {
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14);
  color: #fff; border-radius: 8px; padding: 7px 16px;
  font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: background 0.2s;
}
.ep-arrow:hover:not(:disabled) { background: rgba(255,255,255,0.14); }
.ep-arrow:disabled { opacity: 0.3; cursor: default; }

.ep-nav-list {
  display: flex; flex-direction: column; gap: 6px;
  max-height: 260px; overflow-y: auto;
}
.ep-nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer; transition: background 0.15s;
  color: rgba(255,255,255,0.75);
}
.ep-nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
.ep-nav-item.active {
  background: rgba(229,9,20,0.15);
  border-color: rgba(229,9,20,0.35);
  color: #fff;
}
.ep-nav-num {
  font-size: 11px; font-weight: 700; color: #e50914;
  text-transform: uppercase; letter-spacing: 0.5px;
  min-width: 28px;
}
.ep-nav-title { flex: 1; font-size: 14px; font-weight: 600; }
.ep-nav-dur { font-size: 12px; color: rgba(255,255,255,0.35); }
`;