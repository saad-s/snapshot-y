# Snapshot-Y
Snapshot-X like solution for Solidity learning 

## L1 chain only solution (Ethereum)

### Based on 
	• Chain - Ethereum, Solidity, Ganache, Truffle, Rinkyby testnet
	• UI - React, Ethers Js

### UI - snapshot / console
	• M2 - Users can create governance spaces 
	• M1 - Users can add strategies to contracts 
	• M1 - Users can manage proposals - CRUDS 
	• M1 - Users can vote on proposals 
	• M1 - Users can verify votes on a proposal 

### Arch 
	• Contract factory per space
	• Contract per proposal 
	• IPFS storage for proposal data 

### Contracts 
	• Template contract with replaceable tags
		○ Owner info 
		○ Proposal uri 
		○ Voting function
		○ Start and end times / blocks
		○ Upgradable contract 
		○ Pause / delete 
		○ Voting types - single choice - ranked choice 
	• Strategies contracts with replaceable tags 
		○ Eth 
		○ ERC20 tokens 
		○ ERC721 tokens 
	• Tests for contracts 

### Deployment 
	• Testnets for contracts 
	• Github / vercel / netlify
