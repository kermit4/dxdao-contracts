import { ChainId, SolidityType } from '../constants'

export class Organization {
  public readonly chainId: ChainId
  public readonly avatar: string
  public readonly controller: string
  public readonly reputation: string
  public readonly name: string


  constructor(chainId: ChainId, avatar: string, controller: string, reputation: string, name: string) {
    this.chainId = chainId;
    this.avatar = avatar;
    this.controller = controller;
    this.reputation = reputation;
    this.name = name;
  }
}
