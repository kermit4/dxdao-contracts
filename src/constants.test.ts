import { ChainId } from './index'


describe('constants', () => {
  describe('CHAIN_ID', () => {
    it('matches chain id', () => {
      expect(ChainId.MAINNET).toEqual(1)
    })
  })
})
