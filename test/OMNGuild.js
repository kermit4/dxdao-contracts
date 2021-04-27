import * as helpers from "./helpers";
const constants = require("./helpers/constants");
const OMNGuild = artifacts.require("OMNGuild");
const Realitio = artifacts.require("Realitio");
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
  createAndSetupGuildToken,
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
	realitio,
    tokenVault,
    callData,
    genericCallData,
    questionId,
    genericProposal;
    
  beforeEach(async function () {
    guildToken = await createAndSetupGuildToken(
      accounts.slice(0, 5), [0, 50, 100, 150, 200]
    );
    omnGuild = await OMNGuild.new();
    realitio = await Realitio.new();
	questionId = (await realitio.askQuestion(0,"how many tests could a test question test if a test question would test questions?",omnGuild.address,30,0,1)).receipt.logs[0].args.question_id;
   
await realitio.submitAnswer(questionId, web3.utils.asciiToHex("filler"), 0,{value:1});

    actionMock = await ActionMock.new();

    await omnGuild.initialize(
      guildToken.address, 30, 130000, 40, 0, VOTE_GAS, MAX_GAS_PRICE, TIMELOCK, 99999,  realitio.address
    );
	omnGuild.setOMNGuildConfig(1000,realitio.address,1000,1000);

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

//   const proposalId = await createProposal({
//     guild: omnGuild,
//     to: [accounts[1]],
//     data: [await new web3.eth.Contract(
//       OMNGuild.abi
//     ).methods.setAllowance(
//       [realitio.address],
//       ["0x359afa49"],
//       [true]
//     ).encodeABI()],
//     value: [0],
//     description: "Allow vote in voting machine",
//     contentHash: constants.NULL_ADDRESS,
//	 account:accounts[0]
//   });
//	await time.increase(time.duration.seconds(31));
//	await omnGuild.endProposal(proposalId);
//    genericCallData = await new web3.eth.Contract(
  //    votingMachine.contract.abi
  //  ).methods.vote(questionId, 1, 0, constants.NULL_ADDRESS).encodeABI();
  });

  describe("OMNGuild", function () {

    it("vote on and execute a market validation proposal from the omn-guild", async function () {
       const tx = await  omnGuild.createMarketValidationProposal(questionId);

  const guildProposalId = tx.logs[0].args.proposalId;
  
  await expectRevert(
        omnGuild.endProposal(guildProposalId),
        "OMNGuild: Use endMarketValidationProposal to end proposals to validate market"
      );
      await expectRevert(
        omnGuild.endMarketValidationProposal(questionId),
        "OMNGuild: Market valid proposal hasnt ended yet"
      );
	const votes  = await omnGuild.methods['votesOf(address)'](accounts[4]); // overloaded function which is not supported by truffle
     const txVote = await omnGuild.setVote(
			 guildProposalId,
			 votes,
			 {from: accounts[4]});
      
	 expectEvent(txVote, "VoteAdded", { proposalId: guildProposalId });

      await time.increase(time.duration.seconds(100000));
      
      if (constants.ARC_GAS_PRICE > 1)
        expect(txVote.receipt.gasUsed).to.be.below(80000);

      await expectRevert(
        omnGuild.endProposal(guildProposalId),
        "OMNGuild: Use endMarketValidationProposal to end proposals to validate market"
      );
      const receipt = await omnGuild.endMarketValidationProposal(questionId);
 expectEvent(receipt, "ProposalExecuted", { proposalId: guildProposalId });
      await expectRevert(
        omnGuild.endMarketValidationProposal(questionId),
        "OMNGuild: Market valid proposal already executed"
      );
      const proposalInfo = await omnGuild.getProposal(guildProposalId);
      assert.equal(proposalInfo.state, constants.GuildProposalState.Executed);
      assert.equal(proposalInfo.to[0], realitio.address);
      assert.equal(proposalInfo.value[0], 0);
      await time.increase(time.duration.seconds(31));
    });
    it("test proposal failed/ended", async function () {
       const tx = await  omnGuild.createMarketValidationProposal(questionId);

  const guildProposalId = tx.logs[0].args.proposalId;
  
	const votes  = await omnGuild.methods['votesOf(address)'](accounts[4]); // overloaded function which is not supported by truffle
     const txVote = await omnGuild.setVote(
			 guildProposalId,
			 votes,
			 {from: accounts[4]});
      await time.increase(time.duration.seconds(200000));
      const receipt = await omnGuild.endMarketValidationProposal(questionId);
 expectEvent(receipt, "ProposalEnded", { proposalId: guildProposalId });
      const proposalInfo = await omnGuild.getProposal(guildProposalId);
      assert.equal(proposalInfo.state, constants.GuildProposalState.Failed);

    });
    it("test proposal rejected", async function () {
       const tx = await  omnGuild.createMarketValidationProposal(questionId);

  const guildProposalId = tx.logs[0].args.proposalId;
  
      await time.increase(time.duration.seconds(100000));
      const receipt = await omnGuild.endMarketValidationProposal(questionId);
 expectEvent(receipt, "ProposalRejected", { proposalId: guildProposalId });
      const proposalInfo = await omnGuild.getProposal(guildProposalId);
      assert.equal(proposalInfo.state, constants.GuildProposalState.Rejected);

    });
  });
});
