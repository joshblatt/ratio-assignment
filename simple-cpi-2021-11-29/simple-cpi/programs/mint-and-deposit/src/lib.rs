use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};

use pool::cpi::accounts::Deposit;
use pool::program::Pool;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod mint_and_deposit {
    use super::*;
    pub fn mint_and_deposit(ctx: Context<MintAndDeposit>, amount: u64) -> ProgramResult {
        msg!("Starting Tokens: {}", ctx.accounts.depositer_token_account.amount);
        token::mint_to(ctx.accounts.mint_ctx(), amount)?;
        ctx.accounts.depositer_token_account.reload()?;
        msg!("Tokens after mint: {}", ctx.accounts.depositer_token_account.amount);
        pool::cpi::deposit(ctx.accounts.deposit_ctx(), amount)?;
        ctx.accounts.depositer_token_account.reload()?;
        msg!("Tokens after deposit: {}", ctx.accounts.depositer_token_account.amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintAndDeposit<'info> {
    pub depositer: Signer<'info>, // depositers account
    #[account(mut)]
    pub depositer_token_account: Account<'info, TokenAccount>, // depositers token account
    pub pool_account: AccountInfo<'info>, // 
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>, // pool token account for depositer, pool is authority
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

impl<'info> MintAndDeposit<'info> {
    fn mint_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            MintTo {
                mint: self.mint.to_account_info(),
                to: self.depositer_token_account.to_account_info(),
                authority: self.depositer.to_account_info(),
            }
        )
    }
    fn deposit_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Deposit<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Deposit {
                depositer: self.depositer.to_account_info(),
                depositer_token_account: self.depositer_token_account.to_account_info(),
                pool_account: self.pool_account.to_account_info(),
                pool_token_account: self.pool_token_account.to_account_info(),
                token_program: self.token_program.to_account_info(),
            }
        )
    }
}