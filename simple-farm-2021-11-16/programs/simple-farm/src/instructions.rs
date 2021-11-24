use anchor_lang::prelude::*;


use crate::{
    states::*,
    error::*,
    constant::*,
    processor::*,
};

// define instructions here

#[derive(Accounts)]
pub struct CreateGlobalState <'info>{
    #[account(signer)]
    pub super_owner:  AccountInfo<'info>,
}
