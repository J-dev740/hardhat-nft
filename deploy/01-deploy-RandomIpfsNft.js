const {ethers,network} = require('hardhat')
const {networkConfig,developmentChains}=require('../helper-hardhat-config')
const {storeImages,storeTokenMetaData}= require('../utils/uploadToPinata')
require('dotenv').config()

const pathToImage="./images/RandomIpfsNft/"
const sub_fund_amount= ethers.parseEther("6")
const metadataTemplate={
    name:"",
    description:"",
    image:"",
    attributes:[
        {
            trait_type:"cuteness",
            value:100,

        }

    ]


}



module.exports= async({getNamedAccounts,deployments})=>{
    const accounts= await ethers.getSigners()
    const account =accounts[0].address
    const deployer= await ethers.getSigner(account)
    const deployer_address= await deployer.getAddress()
    const chainId= network.config.chainId
    const{deploy,log,get}=deployments

    let vrfCoordinatorV2Address,subId,vrfCoordinatorV2Mock
    //vrf parameters initialization
    const keyhash=networkConfig[chainId]["gaslane"]
    const callBackGasLimit=networkConfig[chainId]["callbackGasLimit"]
    if(developmentChains.includes(network.name)){
        const vrfCoordinatorV2= await get("VRFCoordinatorV2Mock")
         vrfCoordinatorV2Address= vrfCoordinatorV2.address
          vrfCoordinatorV2Mock=await ethers.getContractAt("VRFCoordinatorV2Mock",vrfCoordinatorV2Address,deployer)
         const tx=await vrfCoordinatorV2Mock.createSubscription()
         await tx.wait(1)
         log('mock sub created...')
         subId= await vrfCoordinatorV2Mock.getSubId()
         await vrfCoordinatorV2Mock.fundSubscription(subId,sub_fund_amount)
         log('mock sub funded...')

    }
    else{
        vrfCoordinatorV2Address=networkConfig[chainId]['vrfCoordinatorV2']
        subId= networkConfig[chainId]["subscriptionId"]
    }

    //nft parameters initialization
    const mintFee=networkConfig[chainId]["mintFee"]
    let dogTokenUris=[
        'ipfs://QmQs4yASJakykKzcUYiJoQEFptCuufghNA3S5J2CkD47tp',
        'ipfs://QmXry9jwWVKfbt6V87Gzd97WJ5LGAmtyWY7znSQXCRysv9',
        'ipfs://QmX5V7Xc31vMfM8tYgrNefix1WCFmiMqpLzjDtk6PgTQd2'
    ]

    console.log("handling upload...")


    try {
        
        if(process.env.UPLOAD_TO_PINATA=="true"){
            console.log('calling handleTokenUris... ')
            dogTokenUris= await handleTokenUris()
            console.log('got token uriss....')
        }
    } catch (error) {
        console.log(error)
    }
    console.log('deploying the RandomIpfsNft smart contract...')
    const Args=[vrfCoordinatorV2Address,keyhash,subId,callBackGasLimit,mintFee,dogTokenUris]
    const RandomIpfsNft= await  deploy("RandomIpfs",{
        from:deployer_address,
        args:Args,
        log:true,
        waitConfirmations:network.config.BlockConfirmations||1,
    })

    console.log('-------------------------------->')
    console.log("deployed at")
    console.log(RandomIpfsNft.address)
    console.log('--------------------------------->')
    if(developmentChains.includes(network.name)){
        console.log('adding consumer.....')
        await vrfCoordinatorV2Mock.addConsumer(subId,RandomIpfsNft.address)
        console.log('consumer Added...')
    }

    
    
}
async function handleTokenUris(){
    let dogTokenUris=[]
    //1. upload image to pinata 
        
        const {responses:imageResponseUris, files}= await storeImages(pathToImage)
        console.log(files)
        console.log(imageResponseUris)

        for( let Index in imageResponseUris){
            let dogMetaData={...metadataTemplate}
            dogMetaData.name=files[Index].replace('.png','')
            dogMetaData.description=`An adorable ${dogMetaData.name} pup!`
            dogMetaData.image=`ipfs://${imageResponseUris[Index].IpfsHash}`
            console.log(`uploading dogMetadata for ${dogMetaData.name}...`)
            const metadataResponse= await storeTokenMetaData(dogMetaData)
            dogTokenUris.push(`ipfs://${metadataResponse.IpfsHash}`)

        }
        console.log('tokenUris uploaded they are....')
        console.log(dogTokenUris)

    console.log('-------------------->')
    return dogTokenUris
}

module.exports.tags=["all","RandomIpfs"]