const {ethers,network} = require('hardhat')
const {networkConfig,developmentChains}=require('../helper-hardhat-config')
require('dotenv').config()
const fs= require('fs')
const path= require('path')

const pathToImage="./images/DynamicSvg/"


module.exports=async({getNamedAccounts,deployments})=>{

    const accounts= await ethers.getSigners()
    const account =accounts[0].address
    const deployer= await ethers.getSigner(account)
    const deployer_address= await deployer.getAddress()
    const chainId= network.config.chainId
    const{deploy,log,get}= deployments

    //dynamicSvg variables
    const lowSvg= fs.readFileSync(`${pathToImage}/frown.svg`,{encoding:"utf-8"})
    const highSvg= fs.readFileSync(`${pathToImage}/happy.svg`,{encoding:"utf-8"})



    let ethUsdPriceFeedAddress,priceFeed 

    if(developmentChains.includes(network.name)){

        priceFeed= await get("MockV3Aggregator")
        ethUsdPriceFeedAddress= await priceFeed.address

    }
    else{
        ethUsdPriceFeedAddress= networkConfig[chainId]["ethUsdAddress"]
    }

    log('-------------------------->')
    const Args=[ethUsdPriceFeedAddress,lowSvg,highSvg]
    console.log("deploying dynamicNft ......at....\n")
    await deploy("DynamicNft",{
        from:deployer_address,
        log:true,
        args:Args,
        waitConfirmations:network.config.BlockConfirmations ||1,

    })

}

module.exports.tags=["all","DynamicNft","main"]