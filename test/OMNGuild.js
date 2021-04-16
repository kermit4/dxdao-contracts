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

  let walletScheme,
    daoCreator,
    org,
    actionMock,
    votingMachine,
    guildToken,
    omnGuild,
    tokenVault,
    callData,
    genericCallData,
    walletSchemeProposalId,
    walletSchemeProposalData,
    genericProposal;
    
  beforeEach(async function () {
    guildToken = await createAndSetupGuildToken(
      accounts.slice(0, 5), [0, 50, 100, 150, 200]
    );
    omnGuild = await OMNGuild.new();
    
    const createDaoResult = await createDAO(omnGuild, accounts);
    daoCreator = createDaoResult.daoCreator;
    walletScheme = createDaoResult.walletScheme;
    votingMachine = createDaoResult.votingMachine;
    org = createDaoResult.org;
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
      contentHash: constants.NULL_ADDRESS,
      account: accounts[4],
    });
//    await setAllVotesOnProposal({
//      guild: omnGuild,
//      proposalId: allowVotingMachineProposalId,
//      account: accounts[4],
//    });
    await time.increase(time.duration.seconds(31));
    await omnGuild.endProposal(allowVotingMachineProposalId);
    
    walletSchemeProposalData = helpers.encodeGenericCallData(
      org.avatar.address, actionMock.address, helpers.testCallFrom(org.avatar.address), 0
    )
    const tx = await walletScheme.proposeCalls(
      [org.controller.address],
      [walletSchemeProposalData],
      [0],
      "Test Title",
      constants.SOME_HASH
    );
    walletSchemeProposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    genericCallData = await new web3.eth.Contract(
      votingMachine.contract.abi
    ).methods.vote(walletSchemeProposalId, 1, 0, constants.NULL_ADDRESS).encodeABI();
  });

  describe("OMNGuild", function () {

// vm exception    it("execute a positive vote on the voting machine from the omn-guild", async function () {
// vm exception//      await expectRevert(
// vm exception//        omnGuild.createMarketValidationProposal (walletSchemeProposalId),
// vm exception//        "OMNGuild: Not enough tokens to create proposal"
// vm exception//      );
// vm exception      const tx = await omnGuild.createMarketValidationProposal (walletSchemeProposalId);
// vm exception
// vm exception      const positiveVoteProposalId = tx.logs[0].args.proposalId;
// vm exception      const negativeVoteProposalId = tx.logs[2].args.proposalId;
// vm exception      
// vm exception      await expectRevert(
// vm exception        omnGuild.endProposal(positiveVoteProposalId),
// vm exception        "OMNGuild: Use endVotingMachineProposal to end proposals to voting machine"
// vm exception      );
// vm exception      await expectRevert(
// vm exception        omnGuild.endProposal(positiveVoteProposalId),
// vm exception        "OMNGuild: Use endVotingMachineProposal to end proposals to voting machine"
// vm exception      );
// vm exception      await expectRevert(
// vm exception        omnGuild.endVotingMachineProposal(walletSchemeProposalId),
// vm exception        "OMNGuild: Positive proposal hasnt ended yet"
// vm exception      );
// vm exception      
// vm exception//      const txVote = await setAllVotesOnProposal({
// vm exception//        guild: omnGuild,
// vm exception//        proposalId: positiveVoteProposalId,
// vm exception//        account: accounts[4],
// vm exception//      });
// vm exception
// vm exception      if (constants.ARC_GAS_PRICE > 1)
// vm exception        expect(txVote.receipt.gasUsed).to.be.below(80000);
// vm exception
// vm exception      expectEvent(txVote, "VoteAdded", { proposalId: positiveVoteProposalId });
// vm exception      await time.increase(time.duration.seconds(31));
// vm exception      await expectRevert(
// vm exception        omnGuild.endProposal(positiveVoteProposalId),
// vm exception        "OMNGuild: Use endVotingMachineProposal to end proposals to voting machine"
// vm exception      );
// vm exception      await expectRevert(
// vm exception        omnGuild.endProposal(negativeVoteProposalId),
// vm exception        "OMNGuild: Use endVotingMachineProposal to end proposals to voting machine"
// vm exception      );
// vm exception      const receipt = await omnGuild.endVotingMachineProposal(walletSchemeProposalId);
// vm exception      expectEvent(receipt, "ProposalExecuted", { proposalId: positiveVoteProposalId });
// vm exception      await expectRevert(
// vm exception        omnGuild.endVotingMachineProposal(walletSchemeProposalId),
// vm exception        "OMNGuild: Positive proposal already executed"
// vm exception      );
// vm exception      await time.increase(time.duration.seconds(31));
// vm exception      const proposalInfo = await omnGuild.getProposal(positiveVoteProposalId);
// vm exception      assert.equal(proposalInfo.state, constants.WalletSchemeProposalState.executionSuccedd);
// vm exception      assert.equal(proposalInfo.to[0], votingMachine.address);
// vm exception      assert.equal(proposalInfo.value[0], 0);
// vm exception    });
  });
});
