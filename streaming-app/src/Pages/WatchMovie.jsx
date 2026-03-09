import React,{useEffect,useRef,useState} from "react";
import {useParams,useNavigate} from "react-router-dom";
import axios from "axios";

function WatchMovie(){

const{id}=useParams();
const navigate=useNavigate();

const[movie,setMovie]=useState(null);

const videoRef=useRef();

const user=JSON.parse(localStorage.getItem("user"));
const continueKey=user?`continue_${user._id}`:null;

useEffect(()=>{
axios.get(`http://localhost:5000/movies/${id}`)
.then(res=>setMovie(res.data))
.catch(err=>console.error(err));
},[id]);

useEffect(()=>{

if(!movie||!videoRef.current||!continueKey)return;

const saveProgress=()=>{

let list=JSON.parse(localStorage.getItem(continueKey))||[];

const exists=list.find(m=>m._id===movie._id);

if(!exists){
list.push(movie);
localStorage.setItem(continueKey,JSON.stringify(list));
}

};

const interval=setInterval(saveProgress,5000);

return()=>clearInterval(interval);

},[movie,continueKey]);

if(!movie){
return <h2 style={{color:"white",paddingTop:"100px"}}>Loading...</h2>;
}

return(

<div style={{paddingTop:"80px",background:"#000",height:"100vh"}}>

<div className="container">

<button
className="btn btn-light mb-3"
onClick={()=>navigate(-1)}
>
Back
</button>

<video
ref={videoRef}
src={movie.videoUrl}
controls
autoPlay
style={{width:"100%",maxHeight:"80vh"}}
/>

<h3 className="text-light mt-3">{movie.title}</h3>

</div>

</div>

);

}

export default WatchMovie;