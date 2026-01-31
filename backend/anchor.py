"""
On-chain anchor module for Base Sepolia
"""
import os
import json
import hashlib
import secrets
from web3 import Web3
from typing import Dict, Any


# PHRRegistry ABI (minimal)
PHR_REGISTRY_ABI = [
    {
        "inputs": [{"internalType": "bytes32", "name": "_dataHash", "type": "bytes32"}],
        "name": "anchorData",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": False, "internalType": "bytes32", "name": "dataHash", "type": "bytes32"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "HealthDataAnchored",
        "type": "event"
    }
]


async def anchor_to_base_sepolia(wallet_address: str, data: Dict[str, Any]) -> str:
    """
    Anchor health data to Base Sepolia blockchain
    
    Args:
        wallet_address: User's wallet address
        data: Health data dict (e.g., {"steps": 8200, "heart_rate": 72})
    
    Returns:
        Transaction hash (hex string)
    """
    # Check if mock mode is enabled
    use_mock = os.getenv("USE_MOCK_BLOCKCHAIN", "true").lower() == "true"
    
    # 1. Generate data hash
    data_json = json.dumps(data, sort_keys=True)
    data_hash = hashlib.sha256(data_json.encode()).hexdigest()
    
    if use_mock:
        # Mock mode: generate fake transaction hash
        print(f"[MOCK] Anchoring data hash {data_hash} for wallet {wallet_address}")
        # Generate deterministic but unique-looking tx hash
        mock_tx_hash = "0x" + hashlib.sha256(
            f"{wallet_address}{data_hash}{secrets.token_hex(8)}".encode()
        ).hexdigest()
        print(f"[MOCK] Generated mock tx hash: {mock_tx_hash}")
        return mock_tx_hash
    
    # Real blockchain mode (original implementation)
    data_hash_bytes = bytes.fromhex(data_hash)
    
    # 2. Connect to Base Sepolia
    rpc_url = os.getenv("BASE_SEPOLIA_RPC_URL")
    if not rpc_url:
        raise ValueError("BASE_SEPOLIA_RPC_URL not set")
    
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    if not w3.is_connected():
        raise ConnectionError("Failed to connect to Base Sepolia")
    
    # 3. Load contract
    contract_address = os.getenv("PHR_REGISTRY_ADDRESS")
    if not contract_address:
        raise ValueError("PHR_REGISTRY_ADDRESS not set")
    
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(contract_address),
        abi=PHR_REGISTRY_ABI
    )
    
    # 4. Prepare transaction
    backend_address = os.getenv("BACKEND_WALLET_ADDRESS")
    backend_private_key = os.getenv("BACKEND_PRIVATE_KEY")
    
    if not backend_address or not backend_private_key:
        raise ValueError("Backend wallet credentials not set")
    
    backend_address = Web3.to_checksum_address(backend_address)
    
    # Build transaction
    tx = contract.functions.anchorData(data_hash_bytes).build_transaction({
        'from': backend_address,
        'nonce': w3.eth.get_transaction_count(backend_address),
        'gas': 100000,
        'gasPrice': w3.eth.gas_price,
        'chainId': 84532  # Base Sepolia chain ID
    })
    
    # 5. Sign and send transaction
    signed_tx = w3.eth.account.sign_transaction(tx, backend_private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    
    # Wait for transaction receipt (optional, can be removed for faster response)
    # receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    
    return tx_hash.hex()
