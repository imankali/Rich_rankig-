// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title RICH / RANK - Genesis Season
/// @notice Each token represents a numbered, on-chain digital status position.
///         A challenger pays the current price plus the takeover premium.
contract RichRank is ERC721, Ownable, ReentrancyGuard {
    uint256 public constant MAX_RANK = 100;
    uint256 public constant PREMIUM_BPS = 2_000; // 20%
    uint256 public constant PROTOCOL_FEE_BPS = 1_500; // 15%
    uint256 public constant REWARDS_FEE_BPS = 500; // 5%
    uint256 public constant BPS = 10_000;

    struct Rank {
        uint256 price;
        uint256 takeovers;
        uint64 lastChanged;
    }

    mapping(uint256 => Rank) public ranks;
    mapping(uint256 => address[]) private _ownershipHistory;
    string private _baseTokenURI;
    uint256 public protocolFees;
    uint256 public rewardsFees;
    bool public mintingOpen;

    event RankMinted(uint256 indexed rankId, address indexed holder, uint256 price);
    event RankTakenOver(uint256 indexed rankId, address indexed previousOwner, address indexed newOwner, uint256 price, uint256 premium);
    event RankPriceUpdated(uint256 indexed rankId, uint256 oldPrice, uint256 newPrice);
    event FeesWithdrawn(address indexed recipient, uint256 protocolAmount, uint256 rewardsAmount);

    constructor(address initialOwner, string memory baseURI) ERC721("RICH / RANK", "RANK") Ownable(initialOwner) {
        _baseTokenURI = baseURI;
    }

    function mintRank(uint256 rankId, uint256 initialPrice) external onlyOwner {
        require(!mintingOpen, "Genesis already minted");
        require(rankId > 0 && rankId <= MAX_RANK, "Invalid rank");
        require(initialPrice > 0, "Price is zero");
        _safeMint(msg.sender, rankId);
        ranks[rankId] = Rank(initialPrice, 0, uint64(block.timestamp));
        _ownershipHistory[rankId].push(msg.sender);
        emit RankMinted(rankId, msg.sender, initialPrice);
    }

    function openMarket() external onlyOwner { mintingOpen = true; }

    function mintRanks(uint256[] calldata rankIds, uint256[] calldata initialPrices) external onlyOwner {
        require(rankIds.length == initialPrices.length && rankIds.length > 0, "Invalid batch");
        for (uint256 i = 0; i < rankIds.length; i++) {
            uint256 rankId = rankIds[i];
            require(!mintingOpen && rankId > 0 && rankId <= MAX_RANK, "Invalid rank");
            require(initialPrices[i] > 0 && _ownerOf(rankId) == address(0), "Invalid price or minted");
            _safeMint(msg.sender, rankId);
            ranks[rankId] = Rank(initialPrices[i], 0, uint64(block.timestamp));
            _ownershipHistory[rankId].push(msg.sender);
            emit RankMinted(rankId, msg.sender, initialPrices[i]);
        }
    }

    function takeover(uint256 rankId) external payable nonReentrant {
        require(mintingOpen, "Market is closed");
        require(_ownerOf(rankId) != address(0), "Rank does not exist");
        Rank storage rank = ranks[rankId];
        uint256 premium = (rank.price * PREMIUM_BPS) / BPS;
        uint256 required = rank.price + premium;
        require(msg.value == required, "Send exact takeover price");
        address previousOwner = ownerOf(rankId);
        uint256 protocolCut = (premium * PROTOCOL_FEE_BPS) / BPS;
        uint256 rewardsCut = (premium * REWARDS_FEE_BPS) / BPS;
        uint256 sellerAmount = msg.value - protocolCut - rewardsCut;
        protocolFees += protocolCut;
        rewardsFees += rewardsCut;
        _safeTransfer(previousOwner, msg.sender, rankId, "");
        (bool paid, ) = payable(previousOwner).call{value: sellerAmount}("");
        require(paid, "Seller payment failed");
        rank.price = required;
        rank.takeovers += 1;
        rank.lastChanged = uint64(block.timestamp);
        _ownershipHistory[rankId].push(msg.sender);
        emit RankTakenOver(rankId, previousOwner, msg.sender, required, premium);
    }

    function setPrice(uint256 rankId, uint256 newPrice) external {
        require(ownerOf(rankId) == msg.sender, "Not rank holder");
        require(newPrice > 0, "Price is zero");
        uint256 oldPrice = ranks[rankId].price;
        ranks[rankId].price = newPrice;
        emit RankPriceUpdated(rankId, oldPrice, newPrice);
    }

    function takeoverPrice(uint256 rankId) public view returns (uint256) {
        return ranks[rankId].price + ((ranks[rankId].price * PREMIUM_BPS) / BPS);
    }

    function history(uint256 rankId) external view returns (address[] memory) { return _ownershipHistory[rankId]; }
    function setBaseURI(string calldata newBaseURI) external onlyOwner { _baseTokenURI = newBaseURI; }
    function _baseURI() internal view override returns (string memory) { return _baseTokenURI; }

    function withdrawFees(address payable recipient) external onlyOwner nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        uint256 protocolAmount = protocolFees;
        uint256 rewardsAmount = rewardsFees;
        protocolFees = 0;
        rewardsFees = 0;
        (bool paid, ) = recipient.call{value: protocolAmount + rewardsAmount}("");
        require(paid, "Withdrawal failed");
        emit FeesWithdrawn(recipient, protocolAmount, rewardsAmount);
    }
}
