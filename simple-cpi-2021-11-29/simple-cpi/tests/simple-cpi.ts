import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { MintAndDeposit } from '../target/types/mint_and_deposit';
import { Pool } from '../target/types/pool';

describe('simple-cpi', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const mint_and_deposit_program = anchor.workspace.MintAndDeposit as Program<MintAndDeposit>;
  const pool_program = anchor.workspace.Pool as Program<Pool>;

  it('Is initialized!', async () => {
    // Add your test here.
    const mint_tx = await mint_and_deposit_program.rpc.initialize({});
    const pool_tx = await pool_program.rpc.initialize({});
    console.log("Your Mint + Deposit transaction signature", mint_tx);
    console.log("Your Pool transaction signature", mint_tx);
  });
});
