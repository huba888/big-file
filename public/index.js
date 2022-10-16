const uploader = document.getElementById("uploader")
const output = document.getElementById("output")
const progress = document.getElementById('progress')
function read(file){
    const reader = new FileReader()
    return new Promise((resolve,reject)=>{
        reader.onload = ()=>{
            resolve(reader.result)
        }
        reader.onerror = reject
        reader.readAsBinaryString(file)
    })
}

uploader.addEventListener("change",async (event)=>{
    const {files} = event.target
    const [file] = files
    if(!file){
        return
    }
    uploader.value = null

    const content = await read(file)
    const hash = CryptoJS.MD5(content)

    const {name,size,type} = file
    
    progress.max = size
    const chunkSize = 1024 * 500
    let uploaded = 0
    const local = localStorage.getItem(hash)
    if(local){
        uploaded = Number(local)
    }
    console.log(uploaded,size)
    if(uploaded >= size){
        output.innerHTML = "您已经上传过该视频"
        return
    }
    progress.value = 0
    while(uploaded < size){
        const chunk = file.slice(uploaded,uploaded + chunkSize,type)
        const formData = new FormData()
        formData.append("name",name)
        formData.append("type",type)
        formData.append("size",size)
        formData.append("file",chunk)
        formData.append("hash",hash)
        formData.append("offset",uploaded)
        try {
            await axios.post("/api/upload",formData)
        } catch (error) {
            output.innerHTML = `上传失败 ${error.message}`
            return
        }
        uploaded += chunk.size
        localStorage.setItem(hash,uploaded)
        progress.value = uploaded
        //  测试 
        // if(uploaded > 1024 * 500 * 12){
        //     return
        // }
    }
    output.innerHTML = "上传成功"
})