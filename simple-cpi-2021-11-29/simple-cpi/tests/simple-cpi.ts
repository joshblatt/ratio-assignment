import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { SimpleCpi } from '../target/types/simple_cpi';

describe('simple-cpi', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.SimpleCpi as Program<SimpleCpi>;

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
