use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

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
    // pub fn withdraw_wrapper(ctx: Context<WithdrawWrapper>, amount: u64) -> ProgramResult {
    //     msg!("Starting Tokens: {}", ctx.accounts.receiver_token.amount);
    //     token::transfer(ctx.accounts.transfer_ctx(), amount)?;
    //     ctx.accounts.receiver_token.reload()?;
    //     msg!("Remaining Tokens: {}", ctx.accounts.receiver_token.amount);
    //     Ok(())
    // }
}

// #[account]
// pub struct PoolAccount {
//     pub owner: Pubkey, // user that the pool account belongs to
//     pub authority: Pubkey, // PDA for pool
// }

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

// #[derive(Accounts)]
// pub struct WithdrawWrapper<'info> {
//     pub sender: Signer<'info>,
//     #[account(mut)]
//     pub sender_token: Account<'info, TokenAccount>,
//     #[account(mut)]
//     pub receiver_token: Account<'info, TokenAccount>,
//     pub mint: Account<'info, Mint>,
//     pub token_program: Program<'info, Token>,
// }

// impl<'info> WithdrawWrapper<'info> {
//     fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
//         CpiContext::new(
//             self.token_program.to_account_info(),
//             Transfer {
//                 from: self.sender_token.to_account_info(),
//                 to: self.receiver_token.to_account_info(),
//                 authority: self.sender.to_account_info(),
//             },
//         )
//     }
// }