import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function SeriesDetails() {
  const { id } = useParams();
  const [series, setSeries] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/movies/${id}`)
      .then(res => res.json())
      .then(data => setSeries(data))
      .catch(err => console.log(err));
  }, [id]);

  if (!series) return <h2 style={{ paddingTop: "80px" }}>Loading...</h2>;

  return (
    <div style={{ paddingTop: "80px", color: "white", padding: "20px" }}>
      <h1>{series.title}</h1>
      <img src={series.banner} alt="banner" style={{ width: "100%", borderRadius: "10px" }} />

      <p>{series.description}</p>

      <h3>Trailer</h3>
      <iframe
        width="560"
        height="315"
        src={series.trailerUrl}
        title="YouTube trailer"
        allowFullScreen
      />

      <h3>Episodes</h3>
      <ul>
        {series.episodes?.map(ep => (
          <li key={ep.episodeNumber} style={{ marginBottom: "10px" }}>
            Episode {ep.episodeNumber}: {ep.title} – {ep.duration}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SeriesDetails;