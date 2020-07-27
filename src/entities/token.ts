import { Contract } from 'web3-eth'

import { ChainId, SolidityType } from '../constants'

export class Token {
  public readonly chainId: ChainId
  public readonly address: string
  public readonly decimals: number
  public readonly contract: Contract
  public readonly symbol?: string
  public readonly name?: string

  constructor(chainId: ChainId, address: string, decimals: number, symbol?: string, name?: string) {

    this.chainId = chainId
    this.address = address
    this.decimals = decimals
    this.contract = new Contract(address)
    if (typeof symbol === 'string') this.symbol = symbol
    if (typeof name === 'string') this.name = name
  }

}
