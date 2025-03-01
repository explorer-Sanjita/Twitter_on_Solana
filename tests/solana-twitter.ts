import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaTwitter } from "../target/types/solana_twitter";
import * as assert from "assert";
import * as bs58 from "bs58";

describe("solana-twitter", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.SolanaTwitter as Program<SolanaTwitter>;

    // for fetching all Tweet account ever created to display to users

    let tweetAccounts: any[];

    before(async () => {
        // Fetch all tweet accounts before tests run
        tweetAccounts = await program.account.tweet.all();
    });

    it('can send a new tweet', async () => {
        // Before sending the transaction to the blockchain.
        const tweet = anchor.web3.Keypair.generate();
        await program.rpc.sendTweet('SheFi', 'I am a SheFi Scholar', {
            accounts: {
                // Accounts here...
                tweet: tweet.publicKey,
                author: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [tweet],
            // Key pairs of signers here...,
        });

        // After sending the transaction to the blockchain.

        //Fetch account details of created tweet account
        const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
        //console.log(tweetAccount);

        // Ensure it has the right data.
        assert.equal(tweetAccount.author.toBase58(), provider.wallet.publicKey.toBase58());
        assert.equal(tweetAccount.topic, 'SheFi');
        assert.equal(tweetAccount.content, 'I am a SheFi Scholar');
        assert.ok(tweetAccount.timestamp);
    });

    // test scenerio 2

    it('can send a new tweet without a topic', async () => {
        // Call the "SendTweet" instruction.
        const tweet = anchor.web3.Keypair.generate();
        await program.rpc.sendTweet('', 'gm', {
            accounts: {
                tweet: tweet.publicKey,
                author: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [tweet],
        });

        // Fetch the account details of the created tweet.
        const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

        // Ensure it has the right data.
        assert.equal(tweetAccount.author.toBase58(), provider.wallet.publicKey.toBase58());
        assert.equal(tweetAccount.topic, '');
        assert.equal(tweetAccount.content, 'gm');
        assert.ok(tweetAccount.timestamp);
    });

    // test scenerio 3 : where we generate a new key pair & sign transation using it instaed of using our wallet
    // this gives an error beacause i have airdropped sol to wallet that i am using right now 
    // but this newly generated wallet doesn't have any lamports

    it('can send a new tweet from a different author', async () => {
        // Generate another user and airdrop them some SOL.
        const otherUser = anchor.web3.Keypair.generate();
        const signature = await program.provider.connection.requestAirdrop(otherUser.publicKey, 1000000000);
        const latestBlockhash = await program.provider.connection.getLatestBlockhash();

        await program.provider.connection.confirmTransaction({
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        }, 'finalized');


        // Call the "SendTweet" instruction on behalf of this other user.
        const tweet = anchor.web3.Keypair.generate();
        await program.rpc.sendTweet('SheFi', 'Web3\'s future is feminine!', {
            accounts: {
                tweet: tweet.publicKey,
                author: otherUser.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [otherUser, tweet],
        });

        // Fetch the account details of the created tweet.
        const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

        // Ensure it has the right data.
        assert.equal(tweetAccount.author.toBase58(), otherUser.publicKey.toBase58());
        assert.equal(tweetAccount.topic, 'SheFi');
        assert.equal(tweetAccount.content, 'Web3\'s future is feminine!');
        assert.ok(tweetAccount.timestamp);
    });

    // test scenerio 4
    it('cannot provide a topic with more than 50 characters', async () => {
        try {
            const tweet = anchor.web3.Keypair.generate();
            const topicWith51Chars = 'x'.repeat(51);
            await program.rpc.sendTweet(topicWith51Chars, 'Hummus, am I right?', {
                accounts: {
                    tweet: tweet.publicKey,
                    author: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                },
                signers: [tweet],
            });
        } catch (error) {
            // test fails if this is used
            //assert.equal(error.msg, 'The provided topic should be 50 characters long maximum.');

            // replacing above assert with
            assert.ok(error.toString().includes('The provided topic should be 50 characters long maximum.'));

            return;
        }

        assert.fail('The instruction should have failed with a 51-character topic.');
    });

    // test scenerio 5
    it('cannot provide a content with more than 280 characters', async () => {
        try {
            const tweet = anchor.web3.Keypair.generate();
            const contentWith281Chars = 'x'.repeat(281);
            await program.rpc.sendTweet('veganism', contentWith281Chars, {
                accounts: {
                    tweet: tweet.publicKey,
                    author: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                },
                signers: [tweet],
            });
        } catch (error) {
            //assert.equal(error.msg, 'The provided content should be 280 characters long maximum.');
            assert.ok(error.toString().includes('The provided content should be 280 characters long maximum.'));

            return;
        }

        assert.fail('The instruction should have failed with a 281-character content.');
    });


    //test scenerio 6
    it('can filter tweets by author', async () => {
        const authorPublicKey = provider.wallet.publicKey
        const tweetAccounts = await program.account.tweet.all([
            {
                memcmp: {
                    offset: 8, // Discriminator.
                    bytes: authorPublicKey.toBase58(),
                }
            }
        ]);
    
        assert.equal(tweetAccounts.length, 2);
        assert.ok(tweetAccounts.every(tweetAccount => {
            return tweetAccount.account.author.toBase58() === authorPublicKey.toBase58()
        }))
    });

    // test scenerio 7 
    it('can filter tweets by topics', async () => {
        const tweetAccounts = await program.account.tweet.all([
            {
                memcmp: {
                    offset: 8 + // Discriminator.
                        32 + // Author public key.
                        8 + // Timestamp.
                        4, // Topic string prefix.
                    bytes: bs58.encode(Buffer.from('SheFi')),
                }
            }
        ]);
    
        assert.equal(tweetAccounts.length, 2);
        assert.ok(tweetAccounts.every(tweetAccount => {
            return tweetAccount.account.topic === 'SheFi'
        }))
    });

});
