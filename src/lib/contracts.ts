import { ArgentTMA, type SessionAccountInterface } from "@argent/tma-wallet";
import type { Call, Contract } from "starknet";

export const initWallet = (contractAddress: string) =>
  ArgentTMA.init({
    environment: "sepolia",
    appName: import.meta.env.VITE_TELEGRAM_APP_NAME,
    appTelegramUrl: import.meta.env.VITE_TELEGRAM_APP_URL,
    sessionParams: {
      allowedMethods: [{ contract: contractAddress, selector: "methodName" }],
      validityDays: 90,
    },
  });

export async function executeContractAction(
  contract: Contract,
  account: SessionAccountInterface,
  argentTMA: ArgentTMA,
  action: string,
  successMessage: string,
  errorMessage: string
) {
  const call: Call = {
    contractAddress: contract.address,
    entrypoint: action,
    calldata: [],
  };

  try {
    const fees = await account?.estimateInvokeFee([call]);
    const tx = await contract[action]({
      maxFee: fees?.suggestedMaxFee
        ? BigInt(fees.suggestedMaxFee) * 2n
        : undefined,
    });
    await argentTMA.provider.waitForTransaction(tx.transaction_hash);
    console.log(successMessage); //@todo: replace with toast
    return true;
  } catch (error) {
    console.error(`Error performing ${action}:`, error);
    console.error(errorMessage); //@todo: replace with toast
    return false;
  }
}
