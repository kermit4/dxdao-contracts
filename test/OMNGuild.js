import * as helpers from "./helpers";
const constants = require("./helpers/constants");
const OMNGuild = artifacts.require("OMNGuild");
const ActionMock = artifacts.require("ActionMock");
const { fixSignature } = require("./helpers/sign");
const {
  BN,
  expectEvent,
  expectRevert,
  balance,
  send,
  ether,
  time
} = require("@openzeppelin/test-helpers");
const {
  createDAO,
  createAndSetupGuildToken,
  createProposal,
  setAllVotesOnProposal
} = require("./helpers/guild");

require("chai").should();

contract("OMNGuild", function (accounts) {
  
  const ZERO = new BN("0");
  const TIMELOCK = new BN("60");
  const VOTE_GAS = new BN("50000"); // 50k
  const MAX_GAS_PRICE = new BN("8000000000"); // 8 gwei

  let actionMock,
    guildToken,
    omnGuild,
    tokenVault,
    callData,
    genericCallData,
    walletSchemeProposalId,
    genericProposal;
    
  beforeEach(async function () {
    guildToken = await createAndSetupGuildToken(
      accounts.slice(0, 5), [0, 50, 100, 150, 200]
    );
    omnGuild = await OMNGuild.new();
    
    actionMock = await ActionMock.new();
    await omnGuild.methods['initialize(address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,address)'](
      guildToken.address, 30, 30, 40, 0, VOTE_GAS, MAX_GAS_PRICE, TIMELOCK, 99999,  constants.NULL_ADDRESS
    );
    tokenVault = await omnGuild.tokenVault();

    await guildToken.approve(tokenVault, 50, { from: accounts[1] });
    await guildToken.approve(tokenVault, 100, { from: accounts[2] });
    await guildToken.approve(tokenVault, 150, { from: accounts[3] });
    await guildToken.approve(tokenVault, 200, { from: accounts[4] });

    await omnGuild.lockTokens(50, { from: accounts[1] });
    await omnGuild.lockTokens(100, { from: accounts[2] });
    await omnGuild.lockTokens(150, { from: accounts[3] });
    await omnGuild.lockTokens(200, { from: accounts[4] });
    
    tokenVault = await omnGuild.tokenVault();

   const allowVotingMachineProposalId = await createProposal({
     guild: omnGuild,
     to: [omnGuild.address],
     data: [await new web3.eth.Contract(
       OMNGuild.abi
     ).methods.setAllowance(
       [votingMachine.address],
       ["0x359afa49"],
       [true]
     ).encodeABI()],
     value: [0],
     description: "Allow vote in voting machine",
     contentHash: constants.NULL_ADDRESS
   });
   await setAllVotesOnProposal({
	 guild: omnGuild,
	 proposalId: allowVotingMachineProposalId,
	 account: accounts[4],
   });
	await time.increase(time.duration.seconds(31));
	await omnGuild.endProposal(allowVotingMachineProposalId);
    questionId = "0xbb59f79fe1bf1b9567199ebf17a28d98e22e65b3fd85b81e680e583aa36ea084"; // https://realitio.github.io/#!/question/0xbb59f79fe1bf1b9567199ebf17a28d98e22e65b3fd85b81e680e583aa36ea084
//    genericCallData = await new web3.eth.Contract(
  //    votingMachine.contract.abi
  //  ).methods.vote(walletSchemeProposalId, 1, 0, constants.NULL_ADDRESS).encodeABI();
  });

  describe("OMNGuild", function () {

    it("execute a positive vote on the voting machine from the omn-guild", async function () {
    //  await expectRevert(
    //    omnGuild.createMarketValidationProposal (walletSchemeProposalId),
  //      "OMNGuild: Not enough tokens to create proposal"
//      );
      const tx = await omnGuild.createMarketValidationProposal (walletSchemeProposalId);

//      const positiveVoteProposalId = tx.logs[0].args.proposalId;
      
//      await expectRevert(
 //       omnGuild.endProposal(positiveVoteProposalId),
      //  "OMNGuild: Use endVotingMachineProposal to end proposals to voting machine"
//      );
  //    await expectRevert(
   //     omnGuild.endProposal(positiveVoteProposalId),
 //       "OMNGuild: Use endVotingMachineProposal to end proposals to voting machine"
  //    );
  //    await expectRevert(
//        omnGuild.endVotingMachineProposal(walletSchemeProposalId),
    //    "OMNGuild: Positive proposal hasnt ended yet"
     // );
      
//      const txVote = await setAllVotesOnProposal({
//        guild: omnGuild,
//        proposalId: positiveVoteProposalId,
//        account: accounts[4],
//      });

      //if (constants.ARC_GAS_PRICE > 1)
       // expect(txVote.receipt.gasUsed).to.be.below(80000);

//      expectEvent(txVote, "VoteAdded", { proposalId: positiveVoteProposalId });
      await time.increase(time.duration.seconds(31));
//      await expectRevert(
 //       omnGuild.endProposal(positiveVoteProposalId),
  //      "OMNGuild: Use endVotingMachineProposal to end proposals to voting machine"
   //   );
//      const receipt = await omnGuild.endVotingMachineProposal(walletSchemeProposalId);
//      expectEvent(receipt, "ProposalExecuted", { proposalId: positiveVoteProposalId });
//      await expectRevert(
 //       omnGuild.endVotingMachineProposal(walletSchemeProposalId),
  //      "OMNGuild: Positive proposal already executed"
   //   );
      await time.increase(time.duration.seconds(31));
//      const proposalInfo = await omnGuild.getProposal(positiveVoteProposalId);
//      assert.equal(proposalInfo.state, constants.WalletSchemeProposalState.executionSuccedd);
 //     assert.equal(proposalInfo.to[0], votingMachine.address);
  //    assert.equal(proposalInfo.value[0], 0);
    });
  });
});
