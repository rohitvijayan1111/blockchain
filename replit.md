# Hyperledger Fabric Pharma Ledger Network

## Overview
This project is a **Hyperledger Fabric v2.1 blockchain network** implementing a pharmaceutical supply chain management system. It demonstrates a multi-organization blockchain network with three organizations (manufacturer, pharmacy, wholesaler) that can track medical equipment throughout the supply chain.

## Architecture
- **Network**: Hyperledger Fabric v2.1 with 3 organizations + 1 orderer
- **Smart Contracts**: JavaScript-based chaincode for supply chain tracking
- **Frontend Applications**: Node.js/Express web applications for each organization
- **Database**: Fabric ledger with optional CouchDB state database

## Project Structure
```
pharma-ledger-network/
├── organizations/
│   ├── manufacturer/      # Manufacturer organization
│   │   ├── application/   # Web app (Port 5000) - Primary frontend
│   │   └── contract/      # Smart contract
│   ├── pharmacy/         # Pharmacy organization  
│   │   ├── application/  # Web app (Port 5001)
│   │   └── contract/     # Smart contract
│   └── wholesaler/       # Wholesaler organization
│       ├── application/  # Web app (Port 5002) 
│       └── contract/     # Smart contract
├── docker/              # Docker compose files
├── scripts/             # Network management scripts
└── net-pln.sh          # Main network control script
```

## Current Setup (Replit Environment)
The project has been configured to run in Replit with the following modifications:
- **Primary Application**: Manufacturer frontend on port 5000 with 0.0.0.0 binding
- **Dependencies**: All npm packages installed for applications and contracts
- **Workflow**: "Manufacturer App" workflow configured for the web interface
- **Deployment**: Configured for autoscale deployment

## Available Applications
1. **Manufacturer** (Primary - Port 5000): Equipment creation and management
2. **Pharmacy** (Port 5001): Equipment receiving and tracking
3. **Wholesaler** (Port 5002): Equipment distribution

## Key Features
- **Add Users**: Register and enroll users to interact with the blockchain
- **Create Equipment**: Manufacturers can create new medical equipment records
- **Track Ownership**: Monitor equipment as it moves through the supply chain
- **Query Data**: Search for equipment by key
- **View History**: See complete transaction history for any equipment

## Technology Stack
- **Backend**: Node.js, Express.js, Hyperledger Fabric SDK
- **Frontend**: EJS templates, Bootstrap, jQuery
- **Blockchain**: Hyperledger Fabric v2.1
- **Smart Contracts**: JavaScript (fabric-contract-api)

## Development Notes
- The application is currently set up to run without the full Fabric network
- For full blockchain functionality, the Fabric network needs to be started using `./net-pln.sh up createChannel deploySmartContract`
- The applications will show errors when trying to interact with the blockchain until the network is running
- This is a development/learning environment for Hyperledger Fabric concepts

## Recent Changes
- 2025-09-18: Initial Replit environment setup
- Configured port bindings (5000, 5001, 5002)
- Set up 0.0.0.0 host binding for Replit proxy compatibility
- Installed all dependencies for applications and contracts
- Created primary workflow for manufacturer application
- Configured autoscale deployment