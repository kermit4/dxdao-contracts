import { getWeb3Provider } from './index'


describe('utils', () => {
  describe('web3 provider', () => {
    it('get provider and get block', async () => {
      const web3 = getWeb3Provider('https://mainnet.infura.io/v3/'+process.env.KEY_INFURA_API_KEY)
      const testBlock = await web3.eth.getBlock(10000);
      expect(testBlock.number).toEqual(10000);
    })
  })
})
