# AGENTS.md - Hyperledger Fabric Pharma Ledger Network

## Build/Test/Lint Commands
- Start network: `cd pharma-ledger-network && ./net-pln.sh up`
- Create channel: `cd pharma-ledger-network && ./net-pln.sh createChannel`
- Deploy chaincode: `cd pharma-ledger-network && ./net-pln.sh deploySmartContract`
- Teardown network: `cd pharma-ledger-network && ./net-pln.sh down`
- Test chaincode: `cd pharma-ledger-network/organizations/manufacturer/contract && npm test`
- Lint chaincode: `cd pharma-ledger-network/organizations/manufacturer/contract && npm run lint`
- Monitor logs: `cd pharma-ledger-network && ./net-pln.sh monitor-up`

## Architecture & Structure
- **pharma-ledger-network/**: Main Fabric network with 3 orgs (manufacturer, pharmacy, wholesaler) + orderer
- **fabric-samples/**: Standard Hyperledger Fabric samples and binaries (v2.1.0)
- **Smart contracts**: JavaScript-based chaincode in `organizations/*/contract/` directories
- **Network script**: `net-pln.sh` - main network management script
- **Crypto materials**: Generated via cryptogen in `organizations/` subdirectories
- **Channel name**: Default "plnchannel", configurable via `-c` flag

## Code Style & Conventions
- **Language**: JavaScript (Node.js) for chaincode, Bash for network scripts
- **Linting**: ESLint with 4-space indentation, single quotes, semicolons required
- **Test coverage**: 100% coverage required (statements, branches, functions, lines)
- **Dependencies**: fabric-contract-api v2.1.2, fabric-shim v2.1.2
- **Error handling**: Explicit error checking with exit codes in bash scripts
- **Naming**: camelCase for JS, kebab-case for files, UPPER_CASE for environment vars

## Prerequisites
Docker, Docker Compose, Node.js >=8, npm >=5. Run `./loadFabric.sh` to download Fabric binaries and images.
