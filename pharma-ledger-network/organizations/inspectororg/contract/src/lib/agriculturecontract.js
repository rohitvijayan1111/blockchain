/*
 * Agricultural Supply Chain Chaincode
 * Tracks batches, certifications, transfers, orders, and payments
 * Author: Custom Implementation
 */
'use strict';

const { Contract } = require('fabric-contract-api');

class AgricultureSupplyChainContract extends Contract {

    constructor() {
        super('org.agriculture.supplychain');
    }

    async instantiate(ctx) {
        console.log('Instantiate Agricultural Supply Chain Contract');
    }

    // ========== BATCH MANAGEMENT ==========

    /**
     * Create a new harvest batch
     * @param {Context} ctx 
     * @param {string} batchId 
     * @param {string} batchCode 
     * @param {string} farmerId 
     * @param {string} productId 
     * @param {number} initialQtyKg 
     * @param {string} harvestDate 
     * @param {string} metaHash 
     */
    async createBatch(ctx, batchId, batchCode, farmerId, productId, initialQtyKg, harvestDate, metaHash) {
        console.log('============= START : createBatch ===========');
        
        // Validate caller (Org2=FarmerOrg, Org1=PlatformOrg)
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'Org2MSP' && clientMSPID !== 'Org1MSP') {
            throw new Error('Only FarmerOrg (Org2) or PlatformOrg (Org1) can create batches');
        }

        // Check if batch already exists
        const batchKey = `BATCH::${batchId}`;
        const batchExists = await ctx.stub.getState(batchKey);
        if (batchExists && batchExists.length > 0) {
            throw new Error(`Batch ${batchId} already exists`);
        }

        const now = new Date().toISOString();
        const batch = {
            objectType: "BATCH",
            batchId: batchId,
            batchCode: batchCode,
            farmerOrg: clientMSPID,
            farmerId: farmerId,
            productId: productId,
            initialQtyKg: parseFloat(initialQtyKg),
            currentQtyKg: parseFloat(initialQtyKg),
            unit: "KG",
            status: "PENDING",
            harvestDate: harvestDate,
            metaHash: metaHash,
            parentBatchId: null,
            currentOwnerOrg: clientMSPID,
            currentOwnerId: farmerId,
            createdAt: now,
            lastTx: ctx.stub.getTxID()
        };

        await ctx.stub.putState(batchKey, Buffer.from(JSON.stringify(batch)));
        
        // Emit event
        ctx.stub.setEvent('BatchCreated', Buffer.from(JSON.stringify({
            batchId: batchId,
            farmerId: farmerId,
            productId: productId,
            initialQtyKg: parseFloat(initialQtyKg),
            txId: ctx.stub.getTxID()
        })));

        console.log('============= END : createBatch ===========');
        return JSON.stringify(batch);
    }

    /**
     * Verify batch and issue certificate
     * @param {Context} ctx 
     * @param {string} batchId 
     * @param {string} certId 
     * @param {string} issuerId 
     * @param {string} certType 
     * @param {string} certHash 
     * @param {string} certMetaCID 
     */
    async verifyBatch(ctx, batchId, certId, issuerId, certType, certHash, certMetaCID) {
        console.log('============= START : verifyBatch ===========');
        
        // Only InspectorOrg (Org4) can verify
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'Org4MSP') {
            throw new Error('Only InspectorOrg (Org4) can verify batches');
        }

        // Get batch
        const batchKey = `BATCH::${batchId}`;
        const batchBytes = await ctx.stub.getState(batchKey);
        if (!batchBytes || batchBytes.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }

        const batch = JSON.parse(batchBytes.toString());
        const now = new Date().toISOString();

        // Create certificate
        const certKey = `CERT::${certId}`;
        const certificate = {
            objectType: "CERT",
            certId: certId,
            batchId: batchId,
            issuerOrg: clientMSPID,
            issuerId: issuerId,
            certType: certType,
            certHash: certHash,
            certMetaCID: certMetaCID,
            issuedAt: now,
            txId: ctx.stub.getTxID()
        };

        await ctx.stub.putState(certKey, Buffer.from(JSON.stringify(certificate)));

        // Update batch status
        batch.status = "VERIFIED";
        batch.lastTx = ctx.stub.getTxID();
        await ctx.stub.putState(batchKey, Buffer.from(JSON.stringify(batch)));

        // Emit event
        ctx.stub.setEvent('BatchVerified', Buffer.from(JSON.stringify({
            batchId: batchId,
            certId: certId,
            certType: certType,
            issuerId: issuerId,
            txId: ctx.stub.getTxID()
        })));

        console.log('============= END : verifyBatch ===========');
        return JSON.stringify(certificate);
    }

    /**
     * Record ownership/custody transfer
     * @param {Context} ctx 
     * @param {string} transferId 
     * @param {string} batchId 
     * @param {string} fromId 
     * @param {string} toOrg 
     * @param {string} toId 
     * @param {number} quantityKg 
     * @param {string} locationHash 
     */
    async recordTransfer(ctx, transferId, batchId, fromId, toOrg, toId, quantityKg, locationHash) {
        console.log('============= START : recordTransfer ===========');
        
        const clientMSPID = ctx.clientIdentity.getMSPID();
        
        // Get batch
        const batchKey = `BATCH::${batchId}`;
        const batchBytes = await ctx.stub.getState(batchKey);
        if (!batchBytes || batchBytes.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }

        const batch = JSON.parse(batchBytes.toString());
        const transferQty = parseFloat(quantityKg);

        // Validate that caller is current owner
        if (batch.currentOwnerOrg !== clientMSPID || batch.currentOwnerId !== fromId) {
            throw new Error(`Only current owner can transfer. Current owner: ${batch.currentOwnerOrg}:${batch.currentOwnerId}`);
        }

        // Validate quantity
        if (transferQty > batch.currentQtyKg) {
            throw new Error(`Transfer quantity ${transferQty} exceeds available quantity ${batch.currentQtyKg}`);
        }

        // Validate toOrg is valid
        const validOrgs = ['Org1MSP', 'Org2MSP', 'Org3MSP', 'Org4MSP'];
        if (!validOrgs.includes(toOrg)) {
            throw new Error(`Invalid destination organization: ${toOrg}`);
        }

        const now = new Date().toISOString();

        // Create transfer record
        const transferKey = `TRANSFER::${transferId}`;
        const transfer = {
            objectType: "TRANSFER",
            transferId: transferId,
            batchId: batchId,
            fromOrg: clientMSPID,
            fromId: fromId,
            toOrg: toOrg,
            toId: toId,
            quantityKg: transferQty,
            locationHash: locationHash,
            timestamp: now,
            txId: ctx.stub.getTxID()
        };

        await ctx.stub.putState(transferKey, Buffer.from(JSON.stringify(transfer)));

        // Update batch quantity, ownership and status
        batch.currentQtyKg -= transferQty;
        batch.currentOwnerOrg = toOrg;
        batch.currentOwnerId = toId;
        batch.status = "TRANSFERRED";
        batch.lastTx = ctx.stub.getTxID();
        await ctx.stub.putState(batchKey, Buffer.from(JSON.stringify(batch)));

        // Emit event
        ctx.stub.setEvent('TransferRecorded', Buffer.from(JSON.stringify({
            transferId: transferId,
            batchId: batchId,
            fromOrg: clientMSPID,
            toOrg: toOrg,
            quantityKg: transferQty,
            txId: ctx.stub.getTxID()
        })));

        console.log('============= END : recordTransfer ===========');
        return JSON.stringify(transfer);
    }

    /**
     * Create order/reservation
     * @param {Context} ctx 
     * @param {string} orderId 
     * @param {string} batchId 
     * @param {string} buyerId 
     * @param {number} qtyKg 
     * @param {number} pricePerUnit 
     * @param {number} totalAmount 
     */
    async createOrder(ctx, orderId, batchId, buyerId, qtyKg, pricePerUnit, totalAmount) {
        console.log('============= START : createOrder ===========');
        
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'Org1MSP' && clientMSPID !== 'Org3MSP') {
            throw new Error('Only PlatformOrg (Org1) or MiddlemanOrg (Org3) can create orders');
        }

        // Get batch to validate seller
        const batchKey = `BATCH::${batchId}`;
        const batchBytes = await ctx.stub.getState(batchKey);
        if (!batchBytes || batchBytes.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }

        const batch = JSON.parse(batchBytes.toString());
        const orderQty = parseFloat(qtyKg);

        if (orderQty > batch.currentQtyKg) {
            throw new Error(`Order quantity ${orderQty} exceeds available quantity ${batch.currentQtyKg}`);
        }

        const now = new Date().toISOString();
        const orderKey = `ORDER::${orderId}`;
        // Reserve quantity on batch
        batch.currentQtyKg -= orderQty;
        batch.lastTx = ctx.stub.getTxID();
        await ctx.stub.putState(batchKey, Buffer.from(JSON.stringify(batch)));

        const order = {
            objectType: "ORDER",
            orderId: orderId,
            batchId: batchId,
            sellerOrg: batch.currentOwnerOrg,
            sellerId: batch.currentOwnerId,
            buyerId: buyerId,
            qtyKg: orderQty,
            pricePerUnit: parseFloat(pricePerUnit),
            totalAmount: parseFloat(totalAmount),
            paymentState: "INIT",
            deliveryState: "PENDING",
            createdAt: now,
            txId: ctx.stub.getTxID()
        };

        await ctx.stub.putState(orderKey, Buffer.from(JSON.stringify(order)));

        // Emit event
        ctx.stub.setEvent('OrderCreated', Buffer.from(JSON.stringify({
            orderId: orderId,
            batchId: batchId,
            buyerId: buyerId,
            qtyKg: orderQty,
            totalAmount: parseFloat(totalAmount),
            txId: ctx.stub.getTxID()
        })));

        console.log('============= END : createOrder ===========');
        return JSON.stringify(order);
    }

    /**
     * Lock payment in escrow
     * @param {Context} ctx 
     * @param {string} paymentId 
     * @param {string} orderId 
     * @param {string} batchId 
     * @param {number} amount 
     * @param {string} currency 
     * @param {string} payer 
     * @param {string} payee 
     * @param {string} proofHash 
     */
    async lockPayment(ctx, paymentId, orderId, batchId, amount, currency, payer, payee, proofHash) {
        console.log('============= START : lockPayment ===========');
        
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'Org1MSP') {
            throw new Error('Only PlatformOrg (Org1) can lock payments');
        }

        // Validate order exists and matches
        const lockOrderKey = `ORDER::${orderId}`;
        const lockOrderBytes = await ctx.stub.getState(lockOrderKey);
        if (!lockOrderBytes || lockOrderBytes.length === 0) {
            throw new Error(`Order ${orderId} does not exist`);
        }
        const lockOrder = JSON.parse(lockOrderBytes.toString());
        if (lockOrder.batchId !== batchId) {
            throw new Error(`Order ${orderId} is not for batch ${batchId}`);
        }

        const now = new Date().toISOString();
        const paymentKey = `PAYMENT::${paymentId}`;
        const payment = {
            objectType: "PAYMENT",
            paymentId: paymentId,
            orderId: orderId,
            batchId: batchId,
            amount: parseFloat(amount),
            currency: currency,
            payer: payer,
            payee: payee,
            status: "LOCKED",
            proofHash: proofHash,
            txId: ctx.stub.getTxID(),
            timestamp: now
        };

        await ctx.stub.putState(paymentKey, Buffer.from(JSON.stringify(payment)));

        // Update order payment state
        const lockUpdateOrderKey = `ORDER::${orderId}`;
        const lockUpdateOrderBytes = await ctx.stub.getState(lockUpdateOrderKey);
        if (lockUpdateOrderBytes && lockUpdateOrderBytes.length > 0) {
            const lockUpdateOrder = JSON.parse(lockUpdateOrderBytes.toString());
            lockUpdateOrder.paymentState = "LOCKED";
            await ctx.stub.putState(lockUpdateOrderKey, Buffer.from(JSON.stringify(lockUpdateOrder)));
        }

        // Emit event
        ctx.stub.setEvent('PaymentLocked', Buffer.from(JSON.stringify({
            paymentId: paymentId,
            orderId: orderId,
            amount: parseFloat(amount),
            currency: currency,
            txId: ctx.stub.getTxID()
        })));

        console.log('============= END : lockPayment ===========');
        return JSON.stringify(payment);
    }

    /**
     * Release payment from escrow
     * @param {Context} ctx 
     * @param {string} paymentId 
     */
    async releasePayment(ctx, paymentId) {
        console.log('============= START : releasePayment ===========');
        
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'Org1MSP') {
            throw new Error('Only PlatformOrg (Org1) can release payments');
        }

        const paymentKey = `PAYMENT::${paymentId}`;
        const paymentBytes = await ctx.stub.getState(paymentKey);
        if (!paymentBytes || paymentBytes.length === 0) {
            throw new Error(`Payment ${paymentId} does not exist`);
        }

        const payment = JSON.parse(paymentBytes.toString());
        if (payment.status !== "LOCKED") {
            throw new Error(`Payment ${paymentId} is not in LOCKED state`);
        }

        payment.status = "RELEASED";
        payment.txId = ctx.stub.getTxID();
        await ctx.stub.putState(paymentKey, Buffer.from(JSON.stringify(payment)));

        // Update order payment state
        const releaseOrderKey = `ORDER::${payment.orderId}`;
        const releaseOrderBytes = await ctx.stub.getState(releaseOrderKey);
        if (releaseOrderBytes && releaseOrderBytes.length > 0) {
            const releaseOrder = JSON.parse(releaseOrderBytes.toString());
            releaseOrder.paymentState = "RELEASED";
            await ctx.stub.putState(releaseOrderKey, Buffer.from(JSON.stringify(releaseOrder)));
        }

        // Emit event
        ctx.stub.setEvent('PaymentReleased', Buffer.from(JSON.stringify({
            paymentId: paymentId,
            orderId: payment.orderId,
            amount: payment.amount,
            txId: ctx.stub.getTxID()
        })));

        console.log('============= END : releasePayment ===========');
        return JSON.stringify(payment);
    }

    /**
     * Invalidate batch (recall/fraud)
     * @param {Context} ctx 
     * @param {string} invalidationId 
     * @param {string} batchId 
     * @param {string} reason 
     * @param {string} issuedById 
     */
    async invalidateBatch(ctx, invalidationId, batchId, reason, issuedById) {
        console.log('============= START : invalidateBatch ===========');
        
        const clientMSPID = ctx.clientIdentity.getMSPID();
        // Require authorized orgs for invalidation (Org2=Farmer, Org4=Inspector, Org1=Platform)
        if (clientMSPID !== 'Org2MSP' && clientMSPID !== 'Org4MSP' && clientMSPID !== 'Org1MSP') {
            throw new Error('Only FarmerOrg (Org2), InspectorOrg (Org4), or PlatformOrg (Org1) can invalidate batches');
        }

        const batchKey = `BATCH::${batchId}`;
        const batchBytes = await ctx.stub.getState(batchKey);
        if (!batchBytes || batchBytes.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }

        const batch = JSON.parse(batchBytes.toString());
        const now = new Date().toISOString();

        // Create invalidation record
        const invalidationKey = `INVALIDATION::${invalidationId}`;
        const invalidation = {
            objectType: "INVALIDATION",
            id: invalidationId,
            batchId: batchId,
            reason: reason,
            issuedByOrg: clientMSPID,
            issuedById: issuedById,
            timestamp: now,
            txId: ctx.stub.getTxID()
        };

        await ctx.stub.putState(invalidationKey, Buffer.from(JSON.stringify(invalidation)));

        // Update batch status
        batch.status = "INVALIDATED";
        batch.lastTx = ctx.stub.getTxID();
        await ctx.stub.putState(batchKey, Buffer.from(JSON.stringify(batch)));

        // Emit event
        ctx.stub.setEvent('BatchInvalidated', Buffer.from(JSON.stringify({
            batchId: batchId,
            reason: reason,
            issuedByOrg: clientMSPID,
            txId: ctx.stub.getTxID()
        })));

        console.log('============= END : invalidateBatch ===========');
        return JSON.stringify(invalidation);
    }

    // ========== QUERY FUNCTIONS ==========

    /**
     * Get batch by ID
     * @param {Context} ctx 
     * @param {string} batchId 
     */
    async getBatch(ctx, batchId) {
        const batchKey = `BATCH::${batchId}`;
        const batchBytes = await ctx.stub.getState(batchKey);
        if (!batchBytes || batchBytes.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }
        return batchBytes.toString();
    }

    /**
     * Get all transfers for a batch
     * @param {Context} ctx 
     * @param {string} batchId 
     */
    async getTransfersForBatch(ctx, batchId) {
        const startKey = 'TRANSFER::';
        const endKey = 'TRANSFER::~';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const transfers = [];
        
        while (true) {
            const res = await iterator.next();
            if (res.value && res.done !== true) {
                const transfer = JSON.parse(res.value.value.toString());
                if (transfer.batchId === batchId) {
                    transfers.push(transfer);
                }
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        
        return JSON.stringify(transfers);
    }

    /**
     * Get all certificates for a batch
     * @param {Context} ctx 
     * @param {string} batchId 
     */
    async getCertsForBatch(ctx, batchId) {
        const startKey = 'CERT::';
        const endKey = 'CERT::~';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const certificates = [];
        
        while (true) {
            const res = await iterator.next();
            if (res.value && res.done !== true) {
                const cert = JSON.parse(res.value.value.toString());
                if (cert.batchId === batchId) {
                    certificates.push(cert);
                }
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        
        return JSON.stringify(certificates);
    }

    /**
     * Query by key
     * @param {Context} ctx 
     * @param {string} key 
     */
    async queryByKey(ctx, key) {
        const valueBytes = await ctx.stub.getState(key);
        if (!valueBytes || valueBytes.length === 0) {
            throw new Error(`Key ${key} does not exist`);
        }
        return JSON.stringify({
            Key: key,
            Record: JSON.parse(valueBytes.toString())
        });
    }

    /**
     * Query history by key
     * @param {Context} ctx 
     * @param {string} key 
     */
    async queryHistoryByKey(ctx, key) {
        console.info('Getting history for key: ' + key);
        const iterator = await ctx.stub.getHistoryForKey(key);
        const result = [];
        
        while (true) {
            const res = await iterator.next();
            if (res.value && res.done !== true) {
                const obj = JSON.parse(res.value.value.toString('utf8'));
                result.push(obj);
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        
        console.info(result);
        return JSON.stringify(result);
    }
}

module.exports = AgricultureSupplyChainContract;