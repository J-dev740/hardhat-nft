const {assert,expect}=require("chai")
const {getNamedAccounts,deployments,ethers,network,provider}=require("hardhat")
const {networkConfig,developmentChains}=require("../../helper-hardhat-config")
const { randomBytes } = require("ethers")


!developmentChains.includes(network.name)
? describe.skip()
:
describe("basicNft Unit test",()=>{
    
let BasicNft,deployer,deployer_address
    beforeEach("",async()=>{
        const accounts= await ethers.getSigners()
        const account= accounts[0].address
        deployer = await ethers.getSigner(account)
        deployer_address= deployer.getAddress()
        deployments.fixture("all")
        const BN= await deployments.get("BasicNft")
        const BN_address= BN.address
         BasicNft= await ethers.getContractAt("BasicNft",BN_address,deployer)

    })

    describe("constructor",()=>{
        it("should initalize Nft correctly",async()=>{
            const name= await BasicNft.name()
            const symbol= await BasicNft.symbol()
            const tokenCounter= await BasicNft.getTokenCounter()
            assert.equal(name,"Dogie")
            assert.equal(symbol,"DOG")
            assert(tokenCounter==0)
        })
    })

    describe("mintNft",()=>{

        it ("should mint Nft for users and update Properly",async ()=>{
            const tokenUri= await BasicNft.tokenURI(0)
            assert(tokenUri,await BasicNft.tokenURI())
        })
        it("should increment the token counter by one",async ()=>{
            const tokenCounter= await BasicNft.getTokenCounter()
            assert(tokenCounter.toString()=="1")
        })
        it("shows the correct Balance of the and Owner of Nft",async ()=>{

            const deployerBalance = await BasicNft.balanceOf(deployer_address)
            const owner = await BasicNft.OwnerOf("0")
            assert.equal(deployerBalance.toString(),"1")
            assert.equal( owner,deployer_address)

        })
    })
})