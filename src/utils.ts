import Web3 from 'web3'

export function getWeb3Provider(providerUrl: string): Web3 {
  return new Web3(providerUrl);
}
