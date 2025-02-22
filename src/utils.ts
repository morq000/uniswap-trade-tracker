import { ethers } from 'ethers';
import Big from 'big.js';
import { DEADLINE, COPY_BUY_PERCENT } from './config';
import { IERC20 } from './abi/IERC20';

export const generateDeadline = (): number => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  return currentTimestamp + DEADLINE;
};

export const makeTokenApprove = async (
  tokenAddress: string,
  routerAddress: string,
  signer: ethers.Wallet,
  spendingAmount?: bigint,
): Promise<Boolean> => {
  const tokenContract = new ethers.Contract(tokenAddress, IERC20, signer);
  //не делать аппрув если текущего аппрува достаточно
  if (
    spendingAmount &&
    (await tokenContract.allowance(signer.address, routerAddress)) >=
      spendingAmount
  ) {
    return true;
  }
  const maxUint = ethers.constants.MaxUint256;

  try {
    const approveTx = (await tokenContract.approve(
      routerAddress,
      maxUint,
    ));
    const receipt = await approveTx.wait();
    console.log(`Approve transaction sent: ${receipt?.hash}`);
    return true;
  } catch (error) {
    console.error(`Error sending approve transaction: ${error}`);
    return false;
  }
};

export const calcBuyPercent = (amountString: string): string => {
  if (COPY_BUY_PERCENT == '100') {
    return amountString;
  }
  return new Big(amountString)
    .mul(new Big(COPY_BUY_PERCENT))
    .div(new Big('100'))
    .toString();
};
