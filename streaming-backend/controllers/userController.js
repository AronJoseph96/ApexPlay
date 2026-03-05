exports.makeEmployee=async(req,res)=>{
const{language}=req.body;
const user=await User.findById(req.params.id);
user.role="EMPLOYEE";
user.language=language;
await user.save();
res.json(user);
};