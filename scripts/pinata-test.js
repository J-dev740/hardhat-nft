const fs= require('fs')
const path= require('path')
require("dotenv").config()
const pinataSDK= require("@pinata/sdk")
const pathToImage='./images/RandomIpfsNft/'
const filePath=path.resolve(pathToImage)
const file=fs.createReadStream(`${filePath}/logo.png`)
const body={
    message:"hello world"
}

const pinata=new pinataSDK('70975fa2c0ceba218929','a6e65d7abe879dd2367379404bbdb8163a238744c982ba6f49ea68bf5d223f09');
pinata.testAuthentication()
.then((result)=>{
    console.log('testing authentication:')
    console.log(result)})
.catch((err)=>{
    console.log(err)
})

pinata.pinJSONToIPFS(body)
.then((res)=>{
    console.log(res)
})
.catch((err)=>{
    console.log(err)
})
const options={
    pinataMetadata:{
        name:'logo.png'
    }
}
pinata.pinFileToIPFS(file,options)
.then((res)=>{
    console.log(res)
})
.catch((err)=>{
    console.log(err)
})