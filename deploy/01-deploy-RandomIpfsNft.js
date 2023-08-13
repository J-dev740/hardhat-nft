const {ethers,network} = require('hardhat')
const {networkConfig,developmentChains}=require('../helper-hardhat-config')

module.exports= async({getNamedAccounts,deployments})=>{
    const accounts= await ethers.getSigners()
    const deployer= accounts[0].address
    const chainId= network.chainId
    const{deploy,log,get}=deployments

    let vrfCoordinatorV2Address,subId
    //vrf parameters initialization
    const sub_fund_amount= ethers.parseEther("6")
    const keyhash=networkConfig[chainId]["gasLane"]
    const callBackGasLimit=networkConfig[chainId]["callbackGasLimit"]
    if(developmentChains.includes(network.name)){
        const vrfCoordinatorV2Mock= await get("VRFCoordinatorV2Mock")
         vrfCoordinatorV2Address= vrfCoordinatorV2Mock.address
         await vrfCoordinatorV2Mock.createSubscription()
         log('mock sub created...')
         subId= await vrfCoordinatorV2Mock.getSubId()
         await vrfCoordinatorV2Mock.fundSubscription(subId,sub_fund_amount)
         log('mock sub funded...')
    }
    else{
        vrfCoordinatorV2Address=networkConfig[chainId]['vrfCoordinatorV2']
        subId= networkConfig[chainId]["subscriptionId"]
    }

    let dogTokenUris=[]
    //nft parameters initialization
    const mintFee=networkConfig[chainId]["mintFee"]
    if(process.env.UPLOAD_T0_PINATA=="true"){
        dogTokenUris= await handleTokenUris()
    }

    // const Args=[vrfCoordinatorV2Address,keyhash,subId,callBackGasLimit,mintFee,dogTokenUris]
    // const RandomIpfsNft= await  deploy("RandomIpfsNft",{
    //     from:deployer,
    //     args:Args,
    //     log:true,
    //     waitConfirmations:network.config.BlockConfirmations||1,
    // }

    
    
}
async function handleTokenUris(){
    //1. upload image to pinata 
    //
}

module.exports.tags=["all","RandomIpfs"]