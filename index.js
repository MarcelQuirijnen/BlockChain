const SHA256 = require('crypto-js/sha256');

class Transaction {
    constructor( timestamp, payerAddr, payeeAddr, amount ) {
        this.timestamp = timestamp;
        this.payerAddr = payerAddr;
        this.payeeAddr = payeeAddr;
        this.amount = amount;
    }
}

class Block {
    constructor( timestamp, txns, previousHash ) {
        this.timestamp = timestamp;
        this.txns = txns;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return SHA256( this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce ).toString();
    }

    mineBlock( difficulty ) {
        let count = 0;
        while( this.hash.substring(0, difficulty) !== Array( difficulty + 1 ).join('0') ) {
            this.nonce++;
            count++;
            this.hash = this.calculateHash();
        }
        console.log("Block successfully hashed (" + count + " iterations). Hash: " + this.hash);
    }
}

class BlockChain {
    constructor() {
        this.chain = [];
        this.difficulty = 3;
        this.unminedTxns = [];
        this.miningReward = 50;
        this.createGenesisBlock();
    }

    createGenesisBlock() {
        let txn = new Transaction( Date.now(), 'mint', 'genesis', 0 );
        let block = new Block( Date.now(), [ txn ], '0' );
        this.chain.push( block );
        //return new Block(0, '10/09/2018', 'Genesis block', '0');
    }

    getLatestBlock() {
        return this.chain[ this.chain.length - 1 ];
    }
    
    // addBlock( newBlock ) {
    //     newBlock.previousHash = this.getLatestBlock().hash;
    //     //newBlock.hash = newBlock.calculateHash();
    //     newBlock.mineBlock(this.difficulty);
    //     this.chain.push( newBlock );
    // }

    mineCurrentBlock(minerAddr) {
        let block = new Block( Date.now(), this.unminedTxns, this.getLatestBlock().hash );
        block.mineBlock( this.difficulty );

        console.log('Current block successfully mined...');
        this.chain.push(block);

        this.unminedTxns = [
            new Transaction( Date.now(), "mint", minerAddr, this.miningReward )
        ];
    }

    createTransaction(txn) {
        this.unminedTxns.push(txn);
    }

    getAddressBalance( addr ) {
        let balance = 0;
        for ( const block of this.chain ) {
            for ( const txn of block.txns ) {
                if ( txn.payerAddr === addr) {
                    balance -= txn.amount;
                }
                if ( txn.payeeAddr === addr) {
                    balance += txn.amount;
                }
            }
        }
        return balance;
    }

    isChainValid() {
        for (let i=1; i < this.chain.length; i++) { //no need to validate the genesis block
            const currentBlock = this.chain[ i ];
            const previousBlock = this.chain[ i-1 ];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.log('current block hash != calculated value');
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.hash) {
                console.log('current block prev hash != prev block hash');
                return false;
            }
        }
        return true;
    }
}

let demoCoin = new BlockChain();
demoCoin.createTransaction( new Transaction( Date.now(), 'wallet-Marcel', 'wallet-Dayna', 50 ) );
demoCoin.createTransaction( new Transaction( Date.now(), 'wallet-Dayna', 'wallet-Marcel', 25 ) );

console.log("\nmining a block...");
demoCoin.mineCurrentBlock('wallet-Miner49-er');

console.log("\nBalance: Marcel: " + demoCoin.getAddressBalance('wallet-Marcel'));
console.log("\nBalance: Dayna: " + demoCoin.getAddressBalance('wallet-Dayna'));
console.log("\nBalance: Miner49-er: " + demoCoin.getAddressBalance('wallet-Miner49-er'));

//console.log(demoCoin);

// 2nd block
demoCoin.createTransaction( new Transaction( Date.now(), 'wallet-Marcel', 'wallet-Dayna', 50 ) );
demoCoin.createTransaction( new Transaction( Date.now(), 'wallet-Dayna', 'wallet-Marcel', 25 ) );

console.log("\nmining a block...");
demoCoin.mineCurrentBlock('wallet-Miner49-er');

console.log("\nBalance: Marcel: " + demoCoin.getAddressBalance('wallet-Marcel'));
console.log("\nBalance: Dayna: " + demoCoin.getAddressBalance('wallet-Dayna'));
console.log("\nBalance: Miner49-er: " + demoCoin.getAddressBalance('wallet-Miner49-er'));


//console.log( JSON.stringify( demoCoin, null, 4));

//let demoChain = new BlockChain();

// console.log('Starting to mine a new block...');
// demoChain.addBlock( new Block(1, "10/20/2018", { amount: 10 }) );
// console.log('Starting to mine a new block...');
// demoChain.addBlock( new Block(2, "10/21/2018", { amount: 25 }) );

// console.log( JSON.stringify( demoChain, null, 4));
// console.log('Is chain valid? ' + demoChain.isChainValid());

