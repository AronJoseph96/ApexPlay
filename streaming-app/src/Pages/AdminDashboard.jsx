import React, { useState, useEffect } from "react";
import axios from "axios";

function AdminDashboard() {

  const [form, setForm] = useState({
    title: "",
    description: "",
    releaseYear: "",
    duration: "",
    rating: "",
    language: "",
    category: "Movie"
  });

  const [genresList, setGenresList] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  const [languages, setLanguages] = useState([]);

  const [poster, setPoster] = useState(null);
  const [banner, setBanner] = useState(null);
  const [video, setVideo] = useState(null);

  const [posterPreview, setPosterPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  /* ===============================
     FETCH GENRES
  =============================== */

  useEffect(() => {

    fetch("http://localhost:5000/genres")
      .then(res => res.json())
      .then(data => setGenresList(data.map(g => g.name)))
      .catch(err => console.error(err));

  }, []);


  /* ===============================
     FETCH LANGUAGES
  =============================== */

  useEffect(() => {

    fetch("http://localhost:5000/languages")
      .then(res => res.json())
      .then(data => setLanguages(data.map(l => l.name)))
      .catch(err => console.error(err));

  }, []);


  /* ===============================
     GENRE SELECT TOGGLE
  =============================== */

  const toggleGenre = (genre) => {

    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );

  };


  /* ===============================
     HANDLE FORM SUBMIT
  =============================== */

  const handleSubmit = async (e) => {

    e.preventDefault();

    const data = new FormData();

    Object.keys(form).forEach(key => {
      data.append(key, form[key]);
    });

    data.append("genres", JSON.stringify(selectedGenres));
    data.append("poster", poster);
    data.append("banner", banner);
    data.append("video", video);

    try {

      await axios.post(
        "http://localhost:5000/movies/upload",
        data
      );

      alert("Movie Uploaded Successfully");

      // Reset form
      setForm({
        title: "",
        description: "",
        releaseYear: "",
        duration: "",
        rating: "",
        language: "",
        category: "Movie"
      });

      setSelectedGenres([]);
      setPoster(null);
      setBanner(null);
      setVideo(null);
      setPosterPreview(null);
      setBannerPreview(null);

    } catch (err) {

      console.error(err);
      alert("Upload Failed");

    }

  };


  return (

<div className="container text-light" style={{ paddingTop:"100px", maxWidth:"700px" }}>

<h2 className="mb-4">Admin Dashboard</h2>

<form onSubmit={handleSubmit}>

{/* TITLE */}

<input
placeholder="Title"
className="form-control mb-3"
value={form.title}
onChange={(e)=>setForm({...form,title:e.target.value})}
/>


{/* DESCRIPTION */}

<textarea
placeholder="Description"
rows="3"
className="form-control mb-3"
value={form.description}
onChange={(e)=>setForm({...form,description:e.target.value})}
/>


{/* CATEGORY */}

<select
className="form-select mb-3"
value={form.category}
onChange={(e)=>setForm({...form,category:e.target.value})}
>

<option value="Movie">Movie</option>
<option value="Series">TV Series</option>

</select>


{/* RELEASE YEAR */}

<input
type="number"
min="1990"
max="2026"
placeholder="Release Year"
className="form-control mb-3"
value={form.releaseYear}
onChange={(e)=>setForm({...form,releaseYear:e.target.value})}
/>


{/* DURATION */}

<input
placeholder="Duration (Example: 2h 10m)"
className="form-control mb-3"
value={form.duration}
onChange={(e)=>setForm({...form,duration:e.target.value})}
/>


{/* RATING */}

<input
type="number"
step="0.1"
min="0"
max="10"
placeholder="Rating"
className="form-control mb-3"
value={form.rating}
onChange={(e)=>setForm({...form,rating:e.target.value})}
/>


{/* GENRES */}

<div className="mb-3">

<label className="form-label fw-semibold">
Genres
</label>

{genresList.map(g => (

<div className="form-check" key={g}>

<input
type="checkbox"
className="form-check-input"
checked={selectedGenres.includes(g)}
onChange={()=>toggleGenre(g)}
/>

<label className="form-check-label">
{g}
</label>

</div>

))}

</div>


{/* LANGUAGE */}

<select
className="form-select mb-3"
value={form.language}
onChange={(e)=>setForm({...form,language:e.target.value})}
>

<option value="">
Select Language
</option>

{languages.map(lang => (

<option key={lang} value={lang}>
{lang}
</option>

))}

</select>


{/* MEDIA UPLOADS */}

<div className="row">

{/* POSTER */}
<div className="col-md-4">

<label className="form-label">Poster</label>

<input
type="file"
className="form-control mb-2"
onChange={(e)=>{
setPoster(e.target.files[0]);
setPosterPreview(URL.createObjectURL(e.target.files[0]));
}}
/>

{posterPreview && (
<img
src={posterPreview}
alt="poster preview"
className="img-fluid rounded"
style={{maxHeight:"220px",objectFit:"cover"}}
/>
)}

</div>


{/* BANNER */}
<div className="col-md-4">

<label className="form-label">Banner</label>

<input
type="file"
className="form-control mb-2"
onChange={(e)=>{
setBanner(e.target.files[0]);
setBannerPreview(URL.createObjectURL(e.target.files[0]));
}}
/>

{bannerPreview && (
<img
src={bannerPreview}
alt="banner preview"
className="img-fluid rounded"
style={{maxHeight:"220px",objectFit:"cover"}}
/>
)}

</div>


{/* VIDEO */}
<div className="col-md-4">

<label className="form-label">Video</label>

<input
type="file"
className="form-control"
onChange={(e)=>setVideo(e.target.files[0])}
/>

<small className="text-muted">
Upload MP4 video file
</small>

</div>

</div>

{/* SUBMIT */}

<button className="btn btn-danger w-100">
Upload Content
</button>

</form>

</div>

  );

}

export default AdminDashboard;