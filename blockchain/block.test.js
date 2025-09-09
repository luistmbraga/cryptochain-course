const Block = require('./block');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const {cryptoHash} = require("../util");
const hexToBinary = require('hex-to-binary');

describe('Block', () => {
    const timestamp = 2000;
    const lastHash = 'a-hash';
    const hash = 'another-hash';
    const data = ['data', 'blockchain'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({timestamp, lastHash, hash, data, nonce, difficulty})

    it('has all properties', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    })

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        it('returns block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('returns genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const mineBlock = Block.mineBlock({lastBlock, data})

        it('returns block instance', () => {
            expect(mineBlock instanceof Block).toBe(true);
        });

        it('sets the `lastHash` to be the hash of the `lastBlock`', () => {
            expect(mineBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets the `data`', () => {
            expect(mineBlock.data).toEqual(data);
        });

        it('sets the `timestamp`', () => {
            expect(mineBlock.timestamp).not.toEqual(undefined);
        });

        it('creates SHA-256 hash based on proper inputs', () => {
            expect(mineBlock.hash).toEqual(cryptoHash(
                mineBlock.timestamp, 
                mineBlock.nonce, 
                mineBlock.difficulty, 
                lastBlock.hash, 
                data
            ))
        });

        it('sets the a hash that matches the difficulty criteria', () => {
            expect(hexToBinary(mineBlock.hash).substring(0, mineBlock.difficulty))
                .toEqual('0'.repeat(mineBlock.difficulty));
        });

        it('adjusts the difficulty', () => {
            const possibleResults = [lastBlock.difficulty+1, lastBlock.difficulty-1];

            expect(possibleResults.includes(mineBlock.difficulty)).toBe(true);
        });
    });

    describe('adjustDifficulty()', () => {
        it('raises the difficulty for a quick mined block', () => {
            expect(Block.adjustDifficulty({originalBlock: block, timestamp: block.timestamp + MINE_RATE - 100}))
                .toEqual(block.difficulty+1);
        })

        it('lowers the difficulty for a slowly mined block', () => {
            expect(Block.adjustDifficulty({originalBlock: block, timestamp: block.timestamp + MINE_RATE + 100}))
                .toEqual(block.difficulty-1);
        })

        it('has a lower limit of 1', () => {
            block.difficulty = -1;

            expect(Block.adjustDifficulty({originalBlock: block})).toEqual(1);
        })
    })
});
