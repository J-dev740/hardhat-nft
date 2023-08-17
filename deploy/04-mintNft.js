
const {getNamedAccounts,deployments,ethers,network,provider}=require("hardhat")
// const {networkConfig,developmentChains}=require("../../helper-hardhat-config")
module.exports=async ()=>{
const accounts= await ethers.getSigners()
const account= accounts[0].address
const deployer= await ethers.getSigner(account)
await deployments.fixture("main")
//minting BasicNft


//minting RandomIpfsNft

//minting Dynamic Nft 
const DN= await deployments.get("DynamicNft")
const DN_address= DN.address
const DynamicNft= await ethers.getContractAt("DynamicNft",DN_address,deployer)
const highValue= ethers.parseEther("5")

await DynamicNft.mintNft(highValue)

const tokenUri= await DynamicNft.tokenURI(0)
console.log("DynamicNft minted...tokenUri:\n----------------------------->")
console.log(tokenUri)
}


module.exports.tags=["all","mint"]