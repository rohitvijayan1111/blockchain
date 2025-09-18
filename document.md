Perfect 👍 You’ve gone through quite a few steps already to bring up your **Hyperledger Fabric Pharma Ledger Lab**. Let’s make a **step-by-step documented guide** from what you did, so you can reuse it later or share it with teammates.

I’ll structure it cleanly like a **lab manual**:

---

# 🚀 Hyperledger Fabric Pharma Ledger Lab Setup Guide

This guide documents the process of setting up a **Hyperledger Fabric v2.1 network** (Pharma Ledger Network lab). It includes downloading the binaries, generating crypto materials, creating the genesis block, and starting the network.

---

## 1. 📦 Pre-requisites

* **Docker** & **Docker Compose** installed
* **cURL**, **Git**, and **WSL (Ubuntu on Windows)** or Linux
* At least **4 GB RAM free** for Fabric containers

Verify:

```bash
docker --version
docker-compose --version
git --version
```

---

## 2. 📥 Download Fabric Samples, Binaries, and Docker Images

Run the provided script (`loadfabric.sh`), or manually:

```bash
chmod 777 loadfabric.sh
./loadfabric.sh
```

This will:

* Clone `fabric-samples` repo at v2.1.0
* Download binaries (`cryptogen`, `configtxgen`, etc.)
* Pull Docker images (`peer`, `orderer`, `ccenv`, `baseos`, `fabric-ca`)

✅ Expected: You’ll see Fabric Docker images like:

```
hyperledger/fabric-peer:2.1.0
hyperledger/fabric-orderer:2.1.0
hyperledger/fabric-ca:1.4.7
```

---

## 3. ⚙️ Setup Environment Variables

Add Fabric binaries to PATH:

```bash
cd fabric-samples
export PATH=${PWD}/bin:$PATH
```

Test:

```bash
cryptogen version
```

✅ Should return `Version: 2.1.0`

(Optional: Add to `~/.bashrc`)

```bash
echo 'export PATH=$HOME/fabric-samples/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

---

## 4. 🔐 Generate Crypto Materials

From inside `fabric-samples`:

```bash
cryptogen generate \
--config=../pharma-ledger-network/organizations/cryptogen/crypto-config-org1.yaml \
--output="../pharma-ledger-network/organizations"

cryptogen generate \
--config=../pharma-ledger-network/organizations/cryptogen/crypto-config-org2.yaml \
--output="../pharma-ledger-network/organizations"

cryptogen generate \
--config=../pharma-ledger-network/organizations/cryptogen/crypto-config-org3.yaml \
--output="../pharma-ledger-network/organizations"

cryptogen generate \
--config=../pharma-ledger-network/organizations/cryptogen/crypto-config-orderer.yaml \
--output="../pharma-ledger-network/organizations"
```

✅ Expected output:

```
org1.example.com
org2.example.com
org3.example.com
```

---

## 5. 🏗️ Create Genesis Block

Go to the **configtx** directory:

```bash
cd pharma-ledger-network/configtx
configtxgen -profile PharmaLedgerOrdererGenesis -channelID system-channel -outputBlock ./system-genesis-block/genesis.block
```

✅ Expected log:

```
Generating genesis block
Writing genesis block
```

---

## 6. 🚀 Start the Network

Bring up orderer & peers:

```bash
cd ../
./net-pln.sh up
```

✅ Expected containers:

```
orderer.example.com
peer0.org1.example.com
peer0.org2.example.com
peer0.org3.example.com
```

---

## 7. 👀 Monitor Logs (Optional)

```bash
./net-pln.sh monitor-up
```

⚠️ If you see:

```
docker: Error response from daemon: Ports are not available: exposing port 127.0.0.1:8000
```

➡️ It means port `8000` is already in use. Free the port or edit `net-pln.sh` to change monitoring port.

---

## 8. 📌 Common Issues

* **`cryptogen: command not found`** → Ensure `bin/` is in PATH
* **Version mismatch warning** (`Local fabric binaries and docker images are out of sync`)

  * Your binaries = v2.1.0
  * Pulled images = v2.5.x
  * Fix by pulling the correct Docker image tags:

    ```bash
    docker pull hyperledger/fabric-peer:2.1.0
    docker pull hyperledger/fabric-orderer:2.1.0
    docker pull hyperledger/fabric-tools:2.1.0
    ```

---

## 9. 🧪 Next Steps

* Create and join a channel:

  ```bash
  ./net-pln.sh createChannel
  ```
* Deploy Pharma Ledger chaincode:

  ```bash
  ./net-pln.sh deploySmartContract
  ```

---

✅ With these steps, you have a working **Pharma Ledger Fabric v2.1 network**!

---

Do you want me to **export this documentation as a Markdown (`.md`) file** so you can keep it alongside your lab project for future runs?
