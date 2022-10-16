const express = require("express")
const cors = require('cors')
const { resolve ,extname} = require("path")
const {promises:{
    appendFile,
    writeFile
},existsSync} = require("fs")
const app = express()
const uploader = require("express-fileupload")
const port = 3000
app.use(cors())

app.use("/",express.static("public"))
app.use(uploader())
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.post("/api/upload",async (req,res)=>{
    const {name,size,type,offset,hash} = req.body
    const {file} = req.files
    console.log(name,size,type,offset,hash)
    const ext = extname(name)
    const filename = resolve(__dirname,`./public/${hash}${ext}`)
    if(offset !== "0"){
        if(!existsSync(filename)){
            return res.status(400).send({
                message:"文件不存在"
            })
        }
        await appendFile(filename,file.data)
        return res.send({
            data:"ok"
        })
    }
    await writeFile(filename,file.data)
    res.send({
        data:"上传成功",
        url:"http://localhost:3000"
    })
})
app.listen(port,()=>{
    console.log(`Serer is running at ${port}`)
})