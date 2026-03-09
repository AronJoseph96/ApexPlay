import React, { useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const tvSeriesData = [
  { id: 101, title: "Game of Thrones",    year: 2011, poster: "https://m.media-amazon.com/images/M/MV5BMTNhMDJmNmYtNDQ5OS00ODdlLWE0ZDAtZTgyYTIwNDY3OTU3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg" },
  { id: 102, title: "Breaking Bad",       year: 2008, poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOcWkpWG_NRrU2M8-WB8EbEcJk7smhdrY1eO0ttKXm0bo2ooOEWxk3zBSbsFrSgSJh2OEKOQ&s=10" },
  { id: 103, title: "Stranger Things",    year: 2016, poster: "https://resizing.flixster.com/-3HM6Vvl24jDCKtAkqOoGCVAwRI=/ems.cHJkLWVtcy1hc3NldHMvdHZzZWFzb24vZGM3MTljMzQtMjk5Yy00NjE0LTg4M2EtMjEwOTE1NjIyOTIxLmpwZw==" },
  { id: 104, title: "The Mandalorian",    year: 2019, poster: "https://m.media-amazon.com/images/M/MV5BNjgxZGM0OWUtZGY1MS00MWRmLTk2N2ItYjQyZTI1OThlZDliXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg" },
  { id: 105, title: "The Boys",           year: 2019, poster: "https://m.media-amazon.com/images/M/MV5BMGRlZDE2ZGEtZTU5Mi00ODdkLWFmMTEtY2UwMmViNWNmZjczXkEyXkFqcGc@._V1_.jpg" },
  { id: 106, title: "The Witcher",        year: 2019, poster: "https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p17580215_b_v13_ab.jpg" },
  { id: 107, title: "Squid Game",         year: 2021, poster: "https://etimg.etb2bimg.com/photo/87149411.cms" },
  { id: 108, title: "House of the Dragon",year: 2022, poster: "https://m.media-amazon.com/images/M/MV5BM2QzMGVkNjUtN2Y4Yi00ODMwLTg3YzktYzUxYjJlNjFjNDY1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg" },
  { id: 109, title: "The Last of Us",     year: 2023, poster: "https://m.media-amazon.com/images/M/MV5BYWI3ODJlMzktY2U5NC00ZjdlLWE1MGItNWQxZDk3NWNjN2RhXkEyXkFqcGc@._V1_.jpg" },
  { id: 110, title: "Arcane",             year: 2021, poster: "https://m.media-amazon.com/images/M/MV5BYjA2NzhlMDItNWRmZC00MzRjLWE3ZjAtZjBlZDAwOWY2ODdjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg" },
  { id: 111, title: "Wednesday",          year: 2022, poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHDHsfLAMuUX0Cl58x5WWUzcAsUvTgaiwO0w&s" },
  { id: 112, title: "The Crown",          year: 2016, poster: "https://m.media-amazon.com/images/M/MV5BODcyODZlZDMtZGE0Ni00NjBhLWJlYTAtZDdlNWY3MzkwMGVhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg" },
];

function TVSeries() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("q") || "";
  const rowRef = useRef(null);

  const filtered = tvSeriesData.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollRow = (dir) => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir * 500, behavior: "smooth" });
  };

  return (
    <div className="series-page">
      <div className="container py-5">
        <h1 className="mb-5" style={{ fontWeight: 800, letterSpacing: "-1px" }}>TV Series</h1>

        <h4 className="mb-4" style={{ fontWeight: 600 }}>
          All TV Series ({filtered.length})
        </h4>

        <div className="row-strip">
          <button className="row-arrow-overlay left" onClick={() => scrollRow(-1)}>‹</button>

          <div
            className="d-flex flex-row flex-nowrap overflow-auto hide-scrollbar pb-3"
            ref={rowRef}
          >
            {filtered.map((series) => (
              <div key={series.id} className="me-4" style={{ minWidth: "160px" }}>
                <div
                  style={{
                    width: "150px",
                    height: "225px",
                    backgroundImage: `url(${series.poster})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "10px",
                    cursor: "pointer",
                    boxShadow: "var(--card-shadow)",
                    transition: "transform 0.18s",
                  }}
                  className="movie-card"
                  onClick={() => navigate(`/series/${series.id}`)}
                />
                <p className="card-title-text mt-2 mb-0">{series.title}</p>
                <p className="card-year-text">{series.year}</p>
              </div>
            ))}
          </div>

          <button className="row-arrow-overlay right" onClick={() => scrollRow(1)}>›</button>
        </div>
      </div>
    </div>
  );
}

export default TVSeries;