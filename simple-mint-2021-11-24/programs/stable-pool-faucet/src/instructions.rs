use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount,Mint};


use crate::{
    states::*,
    constant::*,
};

#[derive(Accounts)]
#[instruction(state_nonce:u8, mint_lp_nonce:u8)]
pub struct CreateFaucetState <'info>{
    pub super_owner:  Signer<'info>,

    #[account(
    init,
    seeds = [FAUCET_TAG],
    bump = state_nonce,
    payer = super_owner,
    )]
    pub faucet_state:ProgramAccount<'info, Faucet>,

    // please write here how to create token as macro like above
    pub mint_token:Account<'info, Mint>,

    pub system_program: Program<'info, System>,
}
