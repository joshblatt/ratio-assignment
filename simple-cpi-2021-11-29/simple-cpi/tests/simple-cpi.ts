import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { MintAndDeposit } from '../target/types/mint-and-deposit';
import { Pool } from '../target/types/pool';
import { clusterApiUrl, Connection, Keypair, Transaction, SystemProgram } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID, MintLayout, AccountLayout } from "@solana/spl-token";

describe('simple-cpi', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const user_program = anchor.workspace.Pool as Program<Pool>;
  const pool_program = anchor.workspace.Pool as Program<Pool>;
  const mint_and_deposit_program = anchor.workspace.MintAndDeposit as Program<MintAndDeposit>;

  let mint_account;
  let depositer_token_account;
  let pool_account;
  let pool_token_account;

  it('Setup Mints and Token Accounts', async () => {
    mint_account = Keypair.generate();

    let create_mint_tx = new Transaction().add(
      // create mint account
      SystemProgram.createAccount({
        fromPubkey: user_program.provider.wallet.publicKey,
        newAccountPubkey: mint_account.publicKey,
        space: MintLayout.span,
        lamports: await Token.getMinBalanceRentForExemptMint(user_program.provider.connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      // init mint account
      Token.createInitMintInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        mint_account.publicKey, // mint pubkey
        6, // decimals
        user_program.provider.wallet.publicKey, // mint authority
        user_program.provider.wallet.publicKey // freeze authority (if you don't need it, you can set `null`)
      )
    );

    await user_program.provider.send(create_mint_tx, [mint_account]);

    depositer_token_account = Keypair.generate();
    let create_sender_token_tx = new Transaction().add(
      // create token account
      SystemProgram.createAccount({
        fromPubkey: user_program.provider.wallet.publicKey,
        newAccountPubkey: depositer_token_account.publicKey,
        space: AccountLayout.span,
        lamports: await Token.getMinBalanceRentForExemptAccount(user_program.provider.connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      // init mint account
      Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        mint_account.publicKey, // mint
        depositer_token_account.publicKey, // token account
        user_program.provider.wallet.publicKey // owner of token account
      )
    );

    await user_program.provider.send(create_sender_token_tx, [depositer_token_account]);

    //pool_account = Keypair.generate();
    pool_token_account = Keypair.generate();
    let create_receiver_token_tx = new Transaction().add(
      // create token account
      SystemProgram.createAccount({
        fromPubkey: user_program.provider.wallet.publicKey,
        newAccountPubkey: pool_token_account.publicKey,
        space: AccountLayout.span,
        lamports: await Token.getMinBalanceRentForExemptAccount(user_program.provider.connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      // init mint account
      Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        mint_account.publicKey, // mint
        pool_token_account.publicKey, // token account
        pool_program.provider.wallet.publicKey // owner of token account
      )
    );

    await user_program.provider.send(create_receiver_token_tx, [pool_token_account]);

    let mint_tokens_tx = new Transaction().add(
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        mint_account.publicKey, // mint
        depositer_token_account.publicKey, // receiver (should be a token account)
        user_program.provider.wallet.publicKey, // mint authority
        [], // only multisig account will use. leave it empty now.
        2e6 // amount. if your decimals is 8, you mint 10^8 for 1 token.
      )
    );

    await user_program.provider.send(mint_tokens_tx);

    console.log("token balance: ", await user_program.provider.connection.getTokenAccountBalance(depositer_token_account.publicKey));
  });


  it('Deposit Test', async () => {
    let amount = new anchor.BN(1e6);
    await user_program.rpc.deposit(amount, {
      accounts: {
        depositer: user_program.provider.wallet.publicKey,
        depositerTokenAccount: depositer_token_account.publicKey,
        poolAccount: pool_program.provider.wallet.publicKey,
        poolTokenAccount: pool_token_account.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      }
    })
    console.log("User Token Balance: ", await user_program.provider.connection.getTokenAccountBalance(depositer_token_account.publicKey));
    console.log("Pool Token Balance: ", await user_program.provider.connection.getTokenAccountBalance(pool_token_account.publicKey));
  });

  it('Withdraw Test', async () => {
    let amount = new anchor.BN(1e6);
    await user_program.rpc.withdraw(amount, {
      accounts: {
        withdrawer: user_program.provider.wallet.publicKey,
        withdrawerTokenAccount: depositer_token_account.publicKey,
        poolAccount: pool_program.provider.wallet.publicKey,
        poolTokenAccount: pool_token_account.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      }
    })
    console.log("User Token Balance: ", await user_program.provider.connection.getTokenAccountBalance(depositer_token_account.publicKey));
    console.log("Pool Token Balance: ", await user_program.provider.connection.getTokenAccountBalance(pool_token_account.publicKey));
  });

  it('Mint And Deposit Test', async () => {
    let mint_depositer_token_account = Keypair.generate();
    let create_sender_token_tx = new Transaction().add(
      // create token account
      SystemProgram.createAccount({
        fromPubkey: mint_and_deposit_program.provider.wallet.publicKey,
        newAccountPubkey: mint_depositer_token_account.publicKey,
        space: AccountLayout.span,
        lamports: await Token.getMinBalanceRentForExemptAccount(mint_and_deposit_program.provider.connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      // init mint account
      Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        mint_account.publicKey, // mint
        mint_depositer_token_account.publicKey, // token account
        user_program.provider.wallet.publicKey // owner of token account
      )
    );

    await mint_and_deposit_program.provider.send(create_sender_token_tx, [mint_depositer_token_account]);
    
    let amount = new anchor.BN(1e6);
    await mint_and_deposit_program.rpc.mintAndDeposit(amount, {
      accounts: {
        depositer: mint_and_deposit_program.provider.wallet.publicKey,
        depositerTokenAccount: mint_depositer_token_account.publicKey,
        poolAccount: pool_program.provider.wallet.publicKey,
        poolTokenAccount: pool_token_account.publicKey,
        mint: mint_account.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      }
    })
    console.log("User Token Balance: ", await user_program.provider.connection.getTokenAccountBalance(mint_depositer_token_account.publicKey));
    console.log("Pool Token Balance: ", await user_program.provider.connection.getTokenAccountBalance(pool_token_account.publicKey));
  });
});
