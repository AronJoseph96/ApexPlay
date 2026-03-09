import React,{useEffect,useState} from "react";
import axios from "axios";

function AdminUsers(){
const[users,setUsers]=useState([]);
const[languages,setLanguages]=useState([]);

useEffect(()=>{
axios.get("http://localhost:5000/users").then(res=>setUsers(res.data));
axios.get("http://localhost:5000/languages").then(res=>setLanguages(res.data));
},[]);

const makeEmployee=async(id,language)=>{
if(!language){alert("Select language");return;}
await axios.put(`http://localhost:5000/users/makeEmployee/${id}`,{language});
alert("User promoted");
window.location.reload();
};

return(
<div className="container text-light" style={{paddingTop:"100px"}}>
<h2 className="mb-4">User Management</h2>

<table className="table table-dark table-striped">
<thead>
<tr>
<th>Name</th>
<th>Email</th>
<th>Role</th>
<th>Language</th>
<th>Action</th>
</tr>
</thead>

<tbody>
{users.map(user=>(
<tr key={user._id}>
<td>{user.name}</td>
<td>{user.email}</td>
<td>{user.role}</td>
<td>{user.language||"-"}</td>

<td>

{user.role==="user"&&(
<select className="form-select" onChange={(e)=>makeEmployee(user._id,e.target.value)}>
<option value="">Make Employee</option>
{languages.map(lang=>(
<option key={lang._id} value={lang.name}>{lang.name}</option>
))}
</select>
)}

{user.role==="EMPLOYEE"&&<span className="text-success">Employee</span>}
{user.role==="ADMIN"&&<span className="text-info">Admin</span>}

</td>

</tr>
))}
</tbody>
</table>
</div>
);
}

export default AdminUsers;