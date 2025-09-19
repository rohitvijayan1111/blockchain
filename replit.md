# Hyperledger Fabric Agricultural Supply Chain Network

## Overview
This project is a **Hyperledger Fabric v2.1 blockchain network** implementing an agricultural supply chain management system. It demonstrates a multi-organization blockchain network with four organizations (PlatformOrg, FarmerOrg, MiddlemanOrg, InspectorOrg) that can track agricultural batches throughout the supply chain with proper certification and validation.

## Architecture
- **Network**: Hyperledger Fabric v2.1 with 4 organizations + 1 orderer
- **Smart Contracts**: JavaScript-based agricultural supply chain chaincode
- **Frontend Applications**: Node.js/Express web applications for each organization
- **Database**: Fabric ledger with optional CouchDB state database
- **Security**: 2-of-4 endorsement policy for enhanced multi-party control

## Project Structure
```
pharma-ledger-network/
├── organizations/
│   ├── platformorg/       # Platform organization (Org1MSP)
│   │   ├── application/   # BPP Web app (Port 5000) - Primary frontend
│   │   └── contract/      # Agricultural supply chain contract
│   ├── farmerorg/         # Farmer/Co-op organization (Org2MSP)
│   │   ├── application/   # Farmer Web app (Port 5001)
│   │   └── contract/      # Agricultural supply chain contract
│   ├── middlemanorg/      # Trader/Wholesaler organization (Org3MSP)
│   │   ├── application/   # Middleman Web app (Port 5002)
│   │   └── contract/      # Agricultural supply chain contract
│   └── inspectororg/      # Certification/Inspection organization (Org4MSP)
│       ├── application/   # Inspector Web app (Port 5003)
│       └── contract/      # Agricultural supply chain contract
├── docker/               # Docker compose files
├── scripts/              # Network management scripts
└── net-pln.sh           # Main network control script
```

## Current Setup (Replit Environment)
The project has been configured to run in Replit with the following modifications:
- **Primary Application**: PlatformOrg (BPP) frontend on port 5000 with 0.0.0.0 binding
- **Dependencies**: All npm packages installed for applications and contracts
- **Workflow**: "Manufacturer App" workflow configured for the web interface
- **Deployment**: Configured for autoscale deployment

## Available Applications
1. **PlatformOrg** (Primary - Port 5000): BPP application for platform management
2. **FarmerOrg** (Port 5001): Farmer/Co-op batch creation and management
3. **MiddlemanOrg** (Port 5002): Trader/Wholesaler distribution and orders
4. **InspectorOrg** (Port 5003): Certification and inspection services

## Key Features
- **Batch Management**: Create and track agricultural batches with proper ownership
- **Certification**: Inspector-based batch verification and certification
- **Ownership Transfer**: Secure transfer of batches between organizations
- **Order Management**: Create orders with quantity reservation
- **Payment Processing**: Lock and release payments with order validation
- **Batch Invalidation**: Multi-party approval for batch invalidation
- **Query Functions**: Search for batches, transfers, certificates, and orders

## Technology Stack
- **Backend**: Node.js, Express.js, Hyperledger Fabric SDK
- **Frontend**: EJS templates, Bootstrap, jQuery
- **Blockchain**: Hyperledger Fabric v2.1
- **Smart Contracts**: JavaScript (fabric-contract-api) - Agricultural Supply Chain Contract
- **Security**: Multi-signature endorsement policy (2-of-4 organizations)

## Smart Contract Objects
The agricultural supply chain chaincode implements the following object types:
- **BATCH**: Agricultural batch records with ownership tracking
- **CERTIFICATE**: Inspector-issued batch certifications
- **TRANSFER**: Ownership transfer records between organizations
- **ORDER**: Purchase orders with quantity reservations
- **PAYMENT**: Payment lock/release mechanism
- **INVALIDATION**: Multi-party batch invalidation records

## Organization Mappings
- **Org1MSP**: PlatformOrg (BPP Application)
- **Org2MSP**: FarmerOrg (Farmers/Co-ops)
- **Org3MSP**: MiddlemanOrg (Traders/Wholesalers)
- **Org4MSP**: InspectorOrg (Certification/Inspection)

## Development Notes
- The application is currently set up to run without the full Fabric network
- For full blockchain functionality, the Fabric network needs to be started using `./net-pln.sh up createChannel deploySmartContract`
- The applications will show errors when trying to interact with the blockchain until the network is running
- This is a development/learning environment for Hyperledger Fabric concepts
- Enhanced security with 2-of-4 endorsement policy requiring multi-party approval

## Recent Changes
- 2025-09-19: **Major Transformation**: Converted from 3-org pharma to 4-org agricultural supply chain
  - Implemented comprehensive agricultural supply chain chaincode
  - Added PlatformOrg, FarmerOrg, MiddlemanOrg, InspectorOrg organizations
  - Fixed MSP ID alignment (Org1MSP-Org4MSP)
  - Enhanced security with 2-of-4 endorsement policy
  - Added proper ownership tracking and business logic validation
  - Fixed deployment scripts for 4-organization support
- 2025-09-18: Initial Replit environment setup
  - Configured port bindings (5000, 5001, 5002, 5003)
  - Set up 0.0.0.0 host binding for Replit proxy compatibility
  - Installed all dependencies for applications and contracts
  - Created primary workflow for platform application
  - Configured autoscale deployment