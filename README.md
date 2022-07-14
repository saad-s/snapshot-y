#@ snapshot-Y
Snapshot-X like solution for Solidity learning 



### Based on 
	• Chain - Ethereum, Solidity, L2 Chain (TBD)
	• UI - React, Ethers / Web3 (TBD)

### Must Haves 
	• M2 - Users can create governance spaces - (strategies TBD)
	• M1 - Users can manage proposals - CRUDS 
	• M1 - Users can vote on proposals - (cost low/no TBD) (sponsored voting/ message signing)
	• M1 - Users can verify votes on a proposal
	• M1 - Results are anchored on L1 chain 

### Arch 
	• L2 contract factory per space
	• L2 contract per proposal 
	• L2 -> L1 messaging bridge for anchoring results 
	• IPFS storage for proposal data 

### Unknowns 
1. Allows classic ERC20 and ERC721 balances on L1 (thanks to Fossil) to be used as voting power
