
// SPDX-license-Identifier: MIT
pragma solidity >=0.8.8;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "hardhat/console.sol";

//errors 
error RandomIpfsNft_NeedMoreEth();
error RandomIpfsNft_RangeOutOfBounds();
error  RandomIpfsNft_TransferFailed();
error  RandomIpfsNft_AlreadyInitialized();


//events 
contract RandomIpfs is ERC721URIStorage,VRFConsumerBaseV2,Ownable{

    enum Breed{
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }
    //vrf variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable  i_keyHash;//gas lane value
    uint64 private immutable i_subId;
    uint256 private reqId;
    uint16 private constant REQ_CONF=3;//min request confirmations before respondance of vrf service 
    uint32 private immutable i_callbackGasLimit;//max gas that can be utilized in fulfillRandomWords function
    uint32 private constant NUM_WORDS=1;//no of random words returned per request


    //nft variables
    uint256 private immutable i_mintFee;
    uint256 internal constant MAX_CHANCE_VALUE=100;
    uint256 private s_tokenCounter;
    string[] internal s_dogTokenUris;
    bool private s_initialized; 

    //vrf helpers 
    mapping(uint256=>address) public s_requestIdToSender;

    //events
    event NftRequested(uint256 requestId, address requester );
    event NftMinted(Breed dogBreed,address dogOwner);
    constructor(
    address vrfCoordinatorV2,
    bytes32 keyhash,
    uint64 subId,
    uint32 callbackGasLimit,
    uint256 mintFee,
    string[3] memory dogTokenUris
    ) 
    VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("RandomIpfsNft","RIN"){
        i_vrfCoordinator= VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_keyHash= keyhash;
        i_subId=subId;
        i_callbackGasLimit=callbackGasLimit;
        i_mintFee= mintFee;
        _intializedContract(dogTokenUris);
        s_tokenCounter=0;
    }



    function requestNft() public payable  returns (uint256){
        if(msg.value< i_mintFee) revert RandomIpfsNft_NeedMoreEth();

         reqId=i_vrfCoordinator.requestRandomWords(i_keyHash, i_subId, REQ_CONF, i_callbackGasLimit, NUM_WORDS);
         s_requestIdToSender[reqId]=msg.sender;
         emit NftRequested(reqId, msg.sender);
         return reqId;

    }
    //this funfillRandomWords is actually overriden from the vrfConsumerBasev2 contract and only vrfCoordinator contract can call this contract through it's full fill Randomwords function
    function fulfillRandomWords(uint256 requestId , uint256[] memory randomWords) internal override {

        address dogOwner = s_requestIdToSender[requestId];
        uint256 newItemId= s_tokenCounter;
        s_tokenCounter+=1;
        uint256 moddedRng= randomWords[0]%100;
        Breed dogBreed= getBreedFromModdedRng(moddedRng);
        _safeMint(dogOwner,newItemId);
        _setTokenURI(newItemId, s_dogTokenUris[uint256(dogBreed)]);
        emit NftMinted(dogBreed,dogOwner);


    }

    function getChanceArray() public pure returns (uint256[3] memory){
        return [10,30,MAX_CHANCE_VALUE];
    }

    function getBreedFromModdedRng(uint256 moddedRng) public pure returns (Breed){

        uint256 cumulativeSum=0;
        uint256[3] memory  chanceArray= getChanceArray();

        for (uint256 i=0 ;i<chanceArray.length; i++ )
        {
            if(moddedRng>=cumulativeSum && moddedRng<chanceArray[i]){
                return Breed(i);
            }
            cumulativeSum=chanceArray[i];
        }
        revert RandomIpfsNft_RangeOutOfBounds();
    }

    function withdraw() public onlyOwner {
        uint256 amount= address(this).balance;
        (bool success,)= payable(msg.sender).call{value:amount}("");
        if(!success){
            revert RandomIpfsNft_TransferFailed();
        }
    }

    function _intializedContract(string[3] memory dogTokenUris) internal {
        if(s_initialized){
            revert RandomIpfsNft_AlreadyInitialized();
        }
        s_dogTokenUris=dogTokenUris;
        s_initialized=true;
    }

    function getMintFee() public view returns(uint256){
        return i_mintFee;
    }
    function getTokenCounter() public view returns (uint256){
        return s_tokenCounter;
    }

    function getDogTokenUris(uint256 index ) public view returns (string memory){
            return s_dogTokenUris[index];

    }

    function getInitialized() public view returns (bool){
        return s_initialized;
    }

    function getRequestId() public view returns( uint256 ){
        return reqId;
    }

    

}