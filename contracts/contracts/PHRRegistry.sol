// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title PHRRegistry
 * @dev Simple contract to anchor PHR data hashes on Base Sepolia
 */
contract PHRRegistry {
    // Event emitted when health data is anchored
    event HealthDataAnchored(
        address indexed user,
        bytes32 indexed dataHash,
        uint256 timestamp
    );

    // Mapping to store data hashes for each user
    mapping(address => bytes32[]) public userDataHashes;

    /**
     * @dev Anchor a health data hash on-chain
     * @param _dataHash The hash of the health data
     */
    function anchorData(bytes32 _dataHash) external {
        require(_dataHash != bytes32(0), "Invalid data hash");
        
        userDataHashes[msg.sender].push(_dataHash);
        
        emit HealthDataAnchored(msg.sender, _dataHash, block.timestamp);
    }

    /**
     * @dev Get all data hashes for a user
     * @param _user The user address
     * @return Array of data hashes
     */
    function getUserDataHashes(address _user) external view returns (bytes32[] memory) {
        return userDataHashes[_user];
    }

    /**
     * @dev Get the number of data entries for a user
     * @param _user The user address
     * @return Number of data entries
     */
    function getUserDataCount(address _user) external view returns (uint256) {
        return userDataHashes[_user].length;
    }
}
