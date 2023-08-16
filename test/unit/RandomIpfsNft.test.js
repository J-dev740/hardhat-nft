const {assert,expect}=require("chai")
const {getNamedAccounts,deployments,ethers,network,provider}=require("hardhat")
const {networkConfig,developmentChains}=require("../../helper-hardhat-config")
const { randomBytes } = require("ethers")

!developmentChains.includes(network.name)
? describe.skip()
:
describe("RandomIpfsNft",()=>{

    let RandomIpfsNft,deployer,VrfCoordinatorV2Mock,RIN_address
    beforeEach(async ()=>{
        const accounts = await ethers.getSigners()
         const account= accounts[0].address
         deployer= await ethers.getSigner(account)

        //deploy all defined contracts as per deploy script
        await deployments.fixture("all")
        const RIN=await deployments.get("RandomIpfs")
         RIN_address= RIN.address
        const VRF= await deployments.get("VRFCoordinatorV2Mock")
        const VRF_address= VRF.address
        VrfCoordinatorV2Mock= await ethers.getContractAt("VRFCoordinatorV2Mock",VRF_address,deployer)
        //create a contract instance for RandomIpfsNft ,vrfCoordinatorMock
         RandomIpfsNft= await ethers.getContractAt("RandomIpfs",RIN_address)
         RandomIpfsNft= RandomIpfsNft.connect(deployer)

    })

    describe("constructor", ()=>{
        it("should set the tokenCounter to 0",async ()=>{
            const token= await RandomIpfsNft.getTokenCounter()
            const dogTokenUriZero= await RandomIpfsNft.getDogTokenUris(0)
            const s_initialized= await RandomIpfsNft.getInitialized()
            console.log('checking assertion')
            assert(token.toString()=="0")
            assert (dogTokenUriZero.includes("ipfs://"))
            assert (s_initialized==true)
        })

    })

    describe("requestNft",()=>{
        it("should revert with insufficient balance error", async ()=>{
           await expect (RandomIpfsNft.requestNft()).to.be.revertedWithCustomError(RandomIpfsNft,"RandomIpfsNft_NeedMoreEth")
        })
        it("should return a requestId greater than 0 value", async ()=>{
            const mintFee= await RandomIpfsNft.getMintFee()
            const tx= await RandomIpfsNft.requestNft({value:mintFee})
            await tx.wait(1)
            const req_id= await RandomIpfsNft.getRequestId();
            console.log(req_id)
            assert(req_id.toString()!="0")
            
        })

        it("should emit an event",async ()=>{
            const mintFee = await RandomIpfsNft.getMintFee()
            await expect(RandomIpfsNft.requestNft({value:mintFee})).emit(RandomIpfsNft,"NftRequested")
        })
    })

    describe('fulfillRandomWords', () => {
        it("mints the Nft after a random Number is returned",async ()=>{
            await new Promise(async (resolve,reject)=>{

                    RandomIpfsNft.once("NftMinted",async ()=>{
                        console.log(' event Emitted ')
                        try {
                            const dogTokenUri= await RandomIpfsNft.getDogTokenUris(0)
                            const tokenCounter= await RandomIpfsNft.getTokenCounter();
                            assert(dogTokenUri.includes("ipfs://"),true)
                            assert(tokenCounter.toString()=="1")
                            resolve('resolved')
                            
                        } catch (error) {
                            console.log(error)
                            reject(error)
                        }

                    })


                    try {
                        console.log('getting mintFee')
                        const mintFee= await RandomIpfsNft.getMintFee()
                        console.log('Requesting Nft...')
                         const tx=await RandomIpfsNft.requestNft({value:mintFee.toString()})
                         await tx.wait(1)
                         const req_id= await RandomIpfsNft.getRequestId()
                         const initialToken= await RandomIpfsNft.getTokenCounter()
                        console.log('fulfilling random words acting as vrfCoordinator....')
        
                         await VrfCoordinatorV2Mock.fulfillRandomWords(req_id,RIN_address)
        
                         const updatedToken= await RandomIpfsNft.getTokenCounter()
                         assert(updatedToken==(ethers.toNumber(initialToken)+1))
        
                        
                    } catch (error) {
                        console.log(error)
                        // process.exit(1)
                    }


                    

            })



        })
    })

    describe('getBreedFromModdedRng', () => { 
        it("should return pug for ModdedRng<10",async ()=>{
            //we can expect breed value and not txresponse since it is a pure function and does not change the state of the blockchain
            const expectedValue= await RandomIpfsNft.getBreedFromModdedRng(9)
            assert(expectedValue==0)

        })
        it("should return shibaInu  for ModdedRng10-39",async ()=>{
            //we can expect breed value and not txresponse since it is a pure function and does not change the state of the blockchain
            const expectedValue= await RandomIpfsNft.getBreedFromModdedRng(11)
            assert(expectedValue==1)

        })
        it("should return pug for ModdedRng 40-99",async ()=>{
            //we can expect breed value and not txresponse since it is a pure function and does not change the state of the blockchain
            const expectedValue= await RandomIpfsNft.getBreedFromModdedRng(42)
            assert(expectedValue==2)

        })
        it("should revert  for ModdedRng>100",async ()=>{
            //we can expect breed value and not txresponse since it is a pure function and does not change the state of the blockchain
        await expect (RandomIpfsNft.getBreedFromModdedRng(101)).to.be.reverted
         

        })
     })


})