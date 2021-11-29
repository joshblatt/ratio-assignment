# Solana CPI simple assignment:

- use anchor framework, anchor standards, React, solana-web3, PDA & CPI
- init anchor project with latest version & typescript mode.


## 1.implement first contract with "deposit" & "withdraw" function.
- use delegate to deposit in this contract.
## 2.implement second contract with "mintAndDeposit" function.
- by this funciton, any user can mint given amount of token and deposit to first contract.
- this function has to be done by one transaction & CPI.
## 3.implement limitation for each users to "mintAndDeposit" every one minute.
- users can't run mintAndDepost twice times in one minute
## 4.implement react frontend to run above functions & display all information.
## 5.implement unit tests & security (for audit)