import React,{useEffect,useState,useRef} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import "../styles/home.css";

function Home(){

const navigate=useNavigate();

const[movies,setMovies]=useState([]);
const[heroMovies,setHeroMovies]=useState([]);
const[currentSlide,setCurrentSlide]=useState(0);

const rowRefs=useRef({});

const heroMovie=heroMovies[currentSlide];

const user=JSON.parse(localStorage.getItem("user"));
const continueKey=user?`continue_${user._id}`:null;
const continueWatching=continueKey?JSON.parse(localStorage.getItem(continueKey))||[]:[];

useEffect(()=>{
const fetchMovies=async()=>{
try{
const res=await axios.get("http://localhost:5000/movies");
setMovies(res.data);
setHeroMovies(res.data.slice(0,5));
}catch(err){
console.error(err);
}
};
fetchMovies();
},[]);

useEffect(()=>{
if(heroMovies.length===0)return;
const interval=setInterval(()=>{
setCurrentSlide(prev=>prev===heroMovies.length-1?0:prev+1);
},5000);
return()=>clearInterval(interval);
},[heroMovies]);

const scrollRow=(rowKey,dir)=>{
const el=rowRefs.current[rowKey];
if(!el)return;
el.scrollBy({left:dir*500,behavior:"smooth"});
};

return(

<div className="home-page">

{heroMovie&&(
<section className="hero-slider"
style={{
backgroundImage:`url(${heroMovie.banner})`,
backgroundSize:"cover",
backgroundPosition:"center"
}}>

<div className="hero-overlay"></div>

<div className="hero-content">

<h1 className="hero-title">{heroMovie.title}</h1>

<p className="hero-desc">{heroMovie.description}</p>

<div style={{marginTop:"20px"}}>

<button
className="btn btn-light me-3"
onClick={()=>navigate(`/movie/${heroMovie._id}`)}
>
Play
</button>

<button
className="btn btn-outline-light"
onClick={()=>navigate(`/movie/${heroMovie._id}`)}
>
More Info
</button>

</div>

</div>

</section>
)}

{continueWatching.length>0&&(

<section className="py-4">

<div className="container">

<h4 className="mb-4">Continue Watching</h4>

<div className="d-flex gap-3">

{continueWatching.map(movie=>(

<div key={movie._id} style={{minWidth:"150px"}}>

<img
src={movie.poster}
style={{width:"150px",borderRadius:"10px",cursor:"pointer"}}
onClick={()=>navigate(`/watch/${movie._id}`)}
/>

<p className="mt-2">{movie.title}</p>

</div>

))}

</div>

</div>

</section>

)}

<section className="py-4">

<div className="container">

<h4 className="mb-4">Trending Now</h4>

<div className="row-strip">

<button
className="row-arrow-overlay left"
onClick={()=>scrollRow("trending",-1)}
>
‹
</button>

<div
className="d-flex flex-row flex-nowrap overflow-auto hide-scrollbar pb-2"
ref={(el)=>rowRefs.current["trending"]=el}
>

{movies.map(movie=>(

<div key={movie._id} className="me-3" style={{minWidth:"160px"}}>

<div
className="movie-card"
onClick={()=>navigate(`/movie/${movie._id}`)}
style={{
width:"150px",
height:"225px",
backgroundImage:`url(${movie.poster})`,
backgroundSize:"cover",
backgroundPosition:"center",
borderRadius:"10px",
cursor:"pointer"
}}
/>

<div className="text-start mt-2">

<small className="fw-semibold text-light">
{movie.title}
</small>

<br/>

<small className="text-muted">
{movie.releaseYear}
</small>

</div>

</div>

))}

</div>

<button
className="row-arrow-overlay right"
onClick={()=>scrollRow("trending",1)}
>
›
</button>

</div>

</div>

</section>

</div>

);

}

export default Home;