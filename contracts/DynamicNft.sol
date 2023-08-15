// SPDX-License-Identifier: MIT
pragma solidity >=0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



contract DynamicNft is ERC721,Ownable {

event CreatedNft(uint256 tokenId, int256 high_value);

    string private s_lowImageUri;
    string private s_highImageUri;
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping (uint256=>int256) private s_tokenIdToHighValues;


    error reverted_with_nonExistentToken();

uint256 private s_tokenCounter;
    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("DynamicNft","DN"){
        s_tokenCounter=0;
        s_lowImageUri=svgToImageUri(lowSvg);
        s_highImageUri=svgToImageUri(highSvg);
        i_priceFeed=AggregatorV3Interface(priceFeedAddress);
    }

    function mintNft(int256 highValue) public  {
        s_tokenIdToHighValues[s_tokenCounter]=highValue;
        _safeMint(msg.sender,s_tokenCounter);
        emit CreatedNft(s_tokenCounter,highValue);
        s_tokenCounter++;

    }

    function svgToImageUri(string memory svg) public pure returns(string memory){
          string memory baseURL = "data:image/svg+xml;base64,";
          string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));

        return string(abi.encodePacked(baseURL,svgBase64Encoded));

    }

    function _baseURI() internal pure override returns(string memory){
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory){

        if(!_exists(tokenId)){
            revert reverted_with_nonExistentToken();
        }
        //setting the image uri according to priceFeed data

        string memory imageURI=s_lowImageUri;
        (,int256 price ,,,)=i_priceFeed.latestRoundData();
        if(price>=s_tokenIdToHighValues[tokenId]){
            imageURI=s_highImageUri;
        }
        return string(abi.encodePacked(_baseURI(),string(bytes(abi.encodePacked('{"name":"',name(),'","description":"An nft that changes based on chainLinkk priceFeed","attributes":[{"traitType":"coolness"},{"value":100}],"image":"',imageURI,'"}')))));
    }

    function getTokenCounter() public view returns( uint256){
        return s_tokenCounter;
    }

    function getHighSvg() public view returns (string memory){
        return s_highImageUri;
    }
    function getLowSvg() public view returns (string memory){
        return s_lowImageUri;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface){
        return i_priceFeed;
    }

}