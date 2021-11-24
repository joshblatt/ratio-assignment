import React, { useState } from 'react';
import { useWallet, WalletContextState } from '@solana/wallet-adapter-react';
import { Button } from '@material-ui/core';

const PageHome : React.FC = () => {
  const wallet:WalletContextState = useWallet();
  const [dispInfo, setDispInfo] = useState('transaction result:');

  async function createGlobalStateUI() {
    if(wallet.connected){
      const demoLog = "replace function here";
      setDispInfo(demoLog);
    }
    else{     setDispInfo("connect your wallet");    }
  }
  
  
  return (
    <div
    >
    <br />
    <br />
    <Button size="medium" color="primary" variant="outlined" onClick={e => createGlobalStateUI()}>
      Create Program State
    </Button>
    <br />
    {dispInfo}
    </div>

  );
};
  
export default PageHome;