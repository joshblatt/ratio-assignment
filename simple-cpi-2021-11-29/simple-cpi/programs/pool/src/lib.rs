use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod pool {
    use super::*;
    pub fn deposit_wrapper(ctx: Context<DepositWrapper>, amount: u64) -> ProgramResult {
        //msg!("Starting Tokens: {}", ctx.accunts.se)
        Ok(())
    }
}

#[derive(Accounts)]
pub struct DepositWrapper/*<'info>*/ {
    //pub sender: Signer<'info>,
    // #[account(mut)]
    // pub sender_token: Account<''info, TokenAccount
}
