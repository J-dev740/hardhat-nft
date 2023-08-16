const fs= require('fs')
const path= require('path')
require("dotenv").config()
const pinataSDK= require("@pinata/sdk")

const API_KEY=process.env.API_KEY||""
const SECRET=process.env.SECRET||""

    console.log("initializing pinataSDk....")
    const pinata=new pinataSDK('70975fa2c0ceba218929','a6e65d7abe879dd2367379404bbdb8163a238744c982ba6f49ea68bf5d223f09');
    pinata.testAuthentication()
    .then((result)=>{
        console.log('testing authentication:')
        console.log(result)})
    .catch((err)=>{
        console.log(err)
    })
    // console.log(pinata)



const storeImages=async (pathToImage)=>{

    let responses=[]
    console.log('resolving file path..')
    const filePath=path.resolve(pathToImage)

    const files=fs.readdirSync(filePath)
    .filter((file)=>file.includes(".png"))
    console.log(files)
    console.log("uploading to IPfs")




// "message": "Congratulations! You are communicating with the Pinata API"!"

    for(fileIndex in files)
    {

            const readableStreamForFile=fs.createReadStream(`${filePath}/${files[fileIndex]}`)
            const options={
                pinataMetadata:{
                    name:`${files[fileIndex]}`
                }
            }
            console.log(options) 
        // console.log(readableStreamForFile)
     const response = await pinata.pinFileToIPFS(readableStreamForFile,options)
     console.log(response)
     responses.push(response)
    //  .then((response)=>{
    //     console.log('printing Response:')

    //  })
    //  .catch((err)=>{ 
    //     console.log('error')
    //     console.log(err)
    //  })

    }
    console.log(responses)
    return {responses,files}
}

const storeTokenMetaData= async (metaData)=>{

    const options={
        pinataMetadata:{
            name:metaData.name
        },
    }
const response=await  pinata.pinJSONToIPFS(metaData)
    return response
//  .then((response)=>{
//     console.log(response)
//  })
// .catch((err)=>{
//     console.log(err)
//     process.exit(1)
// })

}

module.exports={storeImages,storeTokenMetaData}