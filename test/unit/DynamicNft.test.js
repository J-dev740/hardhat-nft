const {assert,expect}=require("chai")
const {getNamedAccounts,deployments,ethers,network,provider}=require("hardhat")
const {networkConfig,developmentChains}=require("../../helper-hardhat-config")


!developmentChains.includes(network.name)
? describe.skip()
:

describe("DynamicNft Unit Test",()=>{


let deployer,DynamicNft,PriceFeedMock
    beforeEach(async()=>{
        const accounts = await ethers.getSigners()
        const account= accounts[0].address
        deployer= await ethers.getSigner(account)
        await deployments.fixture("all")
        const Mock= await deployments.get("MockV3Aggregator")
        const DN= await deployments.get("DynamicNft")
        const DN_address= DN.address
        const Mock_address= Mock.address
             PriceFeedMock= await ethers.getContractAt("MockV3Aggregator",Mock_address,deployer)
              DynamicNft= await ethers.getContractAt("DynamicNft",DN_address, deployer)
    })

    describe("constructor",()=>{
        it("should properly convet both high and low svg to image uri",async()=>{
            const highImageUri= await DynamicNft.getHighSvg()
            const lowImageUri= await DynamicNft.getLowSvg()
            assert(highImageUri.includes("data:image/svg+xml;base64,"))
            assert(lowImageUri.includes("data:image/svg+xml;base64,"))
        })
    })

    describe("DN-mintNft",()=>{
        it ("should emit an event and set tokenUri based on highValue",async ()=>{
            const highValue=  ethers.parseEther("1")
            await expect( DynamicNft.mintNft(highValue)).to.emit(DynamicNft,"CreatedNft")
            const tokenCounter= await DynamicNft.getTokenCounter()
            assert.equal(tokenCounter,"1")
            const highImageUri= await DynamicNft.getHighSvg()
            const tokenUri= await DynamicNft.tokenURI(0)
            assert(tokenUri.includes(highImageUri))

        })
    })
})