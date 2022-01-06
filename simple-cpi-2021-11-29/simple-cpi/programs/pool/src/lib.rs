use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer, Approve}

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod simple_cpi {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }

    // pub fn deposit(ctx: Context<Deposit>, deposit_amount: u64) -> ProgramResult {
    //     Ok(())
    // }

    // pub fn withdraw(ctx: Context<Widthdraw>, withdraw_amount: u64) -> ProgramResult {
    //     Ok(())
    // }
}

#[derive(Accounts)]
pub struct Initialize {
    // authority: Signer<'info>
    // #[account(init, payer = authority, space = 48)]
    // system_program: Program<'info, System>


}

// #[derive(Accounts)]
// pub struct Deposit {
//     pub depositer: Pubkey
//     pub numTokens: u64
// }

// #[derive(Accounts)]
// pub struct Widthdraw {

// }