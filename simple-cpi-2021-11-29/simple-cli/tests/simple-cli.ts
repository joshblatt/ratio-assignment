import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { SimpleCli } from '../target/types/simple_cli';

describe('simple-cli', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.SimpleCli as Program<SimpleCli>;

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
