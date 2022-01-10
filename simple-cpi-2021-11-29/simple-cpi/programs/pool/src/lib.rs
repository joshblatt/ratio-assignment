use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("HmbTLCmaGvZhKnn1Zfa1JVnp7vkMV4DYVxPLWBVoN65L");

#[program]
pub mod pool {
    use super::*;
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> ProgramResult {
        msg!("Starting Tokens: {}", ctx.accounts.depositer_token_account.amount);
        token::transfer(ctx.accounts.deposit_ctx(), amount)?;
        ctx.accounts.depositer_token_account.reload()?;
        msg!("Remaining Tokens: {}", ctx.accounts.depositer_token_account.amount);
        Ok(())
    }
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> ProgramResult {
        msg!("Starting Tokens: {}", ctx.accounts.withdrawer_token_account.amount);
        token::transfer(ctx.accounts.withdraw_ctx(), amount)?;
        ctx.accounts.withdrawer_token_account.reload()?;
        msg!("Remaining Tokens: {}", ctx.accounts.withdrawer_token_account.amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    pub depositer: Signer<'info>, // depositers account
    #[account(mut)]
    pub depositer_token_account: Account<'info, TokenAccount>, // depositers token account
    // pub pool_account: Account<'info, PoolAccount>, // pool account for depositer
    pub pool_account: AccountInfo<'info>, // 
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>, // pool token account for depositer, pool is authority
    pub token_program: Program<'info, Token>,
}

impl<'info> Deposit<'info> {
    fn deposit_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.depositer_token_account.to_account_info(),
                to: self.pool_token_account.to_account_info(),
                authority: self.depositer.to_account_info(),
            },
        )
    }
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    pub withdrawer: Signer<'info>,
    #[account(mut)]
    pub withdrawer_token_account: Account<'info, TokenAccount>,
    pub pool_account: Signer<'info>,
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

impl<'info> Withdraw<'info> {
    fn withdraw_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.pool_token_account.to_account_info(),
                to: self.withdrawer_token_account.to_account_info(),
                authority: self.pool_account.to_account_info(),
            },
        )
    }
}