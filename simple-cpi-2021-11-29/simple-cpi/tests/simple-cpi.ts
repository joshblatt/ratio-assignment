import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { MintAndDeposit } from '../target/types/mint_and_deposit';
import { Pool } from '../target/types/pool';
import { clusterApiUrl, Connection, Keypair, Transaction, SystemProgram } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID, MintLayout, AccountLayout } from "@solana/spl-token";

describe('simple-cpi', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const pool_program = anchor.workspace.Pool as Program<Pool>;
  const mint_and_deposit_program = anchor.workspace.MintAndDeposit as Program<MintAndDeposit>;

  let mint;
  let sender_token;
  let receiver;
  let receiver_token;

  it('Setup Mints and Token Accounts', async () => {
    mint = Keypair.generate();

    let create_mint_tx = new Transaction().add(
      // create mint account
      SystemProgram.createAccount({
        fromPubkey: pool_program.provider.wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MintLayout.span,
        lamports: await Token.getMinBalanceRentForExemptMint(pool_program.provider.connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      // init mint account
      Token.createInitMintInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        mint.publicKey, // mint pubkey
        6, // decimals
        pool_program.provider.wallet.publicKey, // mint authority
        pool_program.provider.wallet.publicKey // freeze authority (if you don't need it, you can set `null`)
      )
    );

    await pool_program.provider.send(create_mint_tx, [mint]);
    sender_token = Keypair.generate();
    let create_sender_token_tx = new Transaction().add(
      // create token account
      SystemProgram.createAccount({
        fromPubkey: pool_program.provider.wallet.publicKey,
        newAccountPubkey: sender_token.publicKey,
        space: AccountLayout.span,
        lamports: await Token.getMinBalanceRentForExemptAccount(pool_program.provider.connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      // init mint account
      Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        mint.publicKey, // mint
        sender_token.publicKey, // token account
        pool_program.provider.wallet.publicKey // owner of token account
      )
    );

    await pool_program.provider.send(create_sender_token_tx, [sender_token]);

    receiver = Keypair.generate();
    receiver_token = Keypair.generate();
    let create_receiver_token_tx = new Transaction().add(
      // create token account
      SystemProgram.createAccount({
        fromPubkey: pool_program.provider.wallet.publicKey,
        newAccountPubkey: receiver_token.publicKey,
        space: AccountLayout.span,
        lamports: await Token.getMinBalanceRentForExemptAccount(pool_program.provider.connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      // init mint account
      Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        mint.publicKey, // mint
        receiver_token.publicKey, // token account
        receiver.publicKey // owner of token account
      )
    );

    await pool_program.provider.send(create_receiver_token_tx, [receiver_token]);

    let mint_tokens_tx = new Transaction().add(
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        mint.publicKey, // mint
        sender_token.publicKey, // receiver (sholud be a token account)
        pool_program.provider.wallet.publicKey, // mint authority
        [], // only multisig account will use. leave it empty now.
        2e6 // amount. if your decimals is 8, you mint 10^8 for 1 token.
      )
    );

    await pool_program.provider.send(mint_tokens_tx);

    console.log("token balance: ", await pool_program.provider.connection.getTokenAccountBalance(sender_token.publicKey));
  });


  it('Is initialized!', async () => {
    // Add your test here.
    let amount = new anchor.BN(1e6);
    const mint_tx = await mint_and_deposit_program.rpc.initialize({});
    const pool_tx = await pool_program.rpc.depositWrapper(amount, {});
    console.log("Your Mint + Deposit transaction signature", mint_tx);
    console.log("Your Pool transaction signature", mint_tx);
  });
});
