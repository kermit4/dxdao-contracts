import * as helpers from "./helpers";
const constants = require("./helpers/constants");
const OMNGuild = artifacts.require("OMNGuild");
const Realitio = artifacts.require("Realitio");
const ActionMock = artifacts.require("ActionMock");
const { soliditySha3 } = require("web3-utils");
const {
    fixSignature
} = require("./helpers/sign");
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

contract("OMNGuild", function(accounts) {

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

    beforeEach(async function() {
        guildToken = await createAndSetupGuildToken(
            accounts.slice(0, 5), [0, 50, 100, 150, 200]
        );
        omnGuild = await OMNGuild.new();

		// I.B.1.a
        realitio = await Realitio.new();
        const latest=(await time.latest()).toNumber();
        questionId = (await realitio.askQuestion(0 /* template_id */ , "Is market with [questionID] valid?", omnGuild.address, 60*60*24*2 /* timeout, */ , latest /* opening_ts */ , 0 /* nonce */ )).receipt.logs[0].args.question_id;

		// I.B.1.b
        await realitio.submitAnswer(questionId, soliditySha3((true)), 0, {
            value: 1
        });
        await realitio.submitAnswer(questionId, soliditySha3((false)), 0, {
            value: 2
        });

        actionMock = await ActionMock.new();

        await omnGuild.initialize(
            guildToken.address,  //  _token:
            60*60*24*7,  //  _proposalTime:
            130000,  //  _timeForExecution:
            40,  //  _votesForExecution:
            0,  //  _votesForCreation:
            VOTE_GAS,  //  _voteGas:
            MAX_GAS_PRICE,  //  _maxGasPrice:
            TIMELOCK,  //  _lockTime:
            99999,  //  _maxAmountVotes:
            realitio.address,  //  _realitIO:
        );

        await omnGuild.setOMNGuildConfig(
                1000, /// _maxAmountVotes The max amount of votes allowed ot have
                realitio.address, 
                1000, /// _successfulVoteReward The amount of OMN tokens in wei unit to be reward to a voter after a succesful  vote
                1000); /// _unsuccessfulVoteReward The amount of OMN tokens in wei unit to be reward to a voter after a unsuccesful vote

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

    });

    describe("OMNGuild", function() {

        it("vote on and execute a market validation proposal from the omn-guild", async function() {
            const tx = await omnGuild.createMarketValidationProposal(questionId);  // I.B.2.b

            const guildProposalId = tx.logs[0].args.proposalId;
            const guildProposalId_ = tx.logs[2].args.proposalId;

            await expectRevert(
                omnGuild.endProposal(guildProposalId),
                "OMNGuild: Use endMarketValidationProposal to end proposals to validate market"
            );
            await expectRevert(
                omnGuild.endMarketValidationProposal(questionId),
                "OMNGuild: Market valid proposal hasnt ended yet"
            );
            const votes = await omnGuild.methods['votesOf(address)'](accounts[4]); // overloaded function which is not supported by truffle
            const txVote = await omnGuild.setVote(
                guildProposalId,
                votes, {
                    from: accounts[4]
                });

            expectEvent(txVote, "VoteAdded", {
                proposalId: guildProposalId
            });

            await time.increase(time.duration.seconds(60*60*24*7+1000));

            if (constants.ARC_GAS_PRICE > 1)
                expect(txVote.receipt.gasUsed).to.be.below(80000);

            await expectRevert(
                omnGuild.endProposal(guildProposalId),
                "OMNGuild: Use endMarketValidationProposal to end proposals to validate market"
            );
            const receipt = await omnGuild.endMarketValidationProposal(questionId);
            expectEvent(receipt, "ProposalExecuted", {
                proposalId: guildProposalId
            });
            await expectRevert(
                omnGuild.endMarketValidationProposal(questionId),
                "OMNGuild: Market valid proposal already executed"
            );
            const proposalInfo = await omnGuild.getProposal(guildProposalId);
            assert.equal(proposalInfo.state, constants.GuildProposalState.Executed);
            assert.equal(proposalInfo.to[0], realitio.address);
            assert.equal(proposalInfo.value[0], 0);
            assert.equal(await realitio.isFinalized(questionId),true);
            assert.equal(await realitio.getFinalAnswer(questionId),  soliditySha3((true)));
        });
        it("test proposal failed/ended", async function() {
            const tx = await omnGuild.createMarketValidationProposal(questionId);

            const guildProposalId = tx.logs[0].args.proposalId;

            const votes = await omnGuild.methods['votesOf(address)'](accounts[4]); // overloaded function which is not supported by truffle
            const txVote = await omnGuild.setVote(
                guildProposalId,
                votes, {
                    from: accounts[4]
                });
            await time.increase(time.duration.seconds(60*60*24*7+200000));
            const receipt = await omnGuild.endMarketValidationProposal(questionId);
            expectEvent(receipt, "ProposalEnded", {
                proposalId: guildProposalId
            });
            const proposalInfo = await omnGuild.getProposal(guildProposalId);
            assert.equal(proposalInfo.state, constants.GuildProposalState.Failed);

        });
        it("test proposal rejected", async function() {
            const tx = await omnGuild.createMarketValidationProposal(questionId);

            const guildProposalId = tx.logs[0].args.proposalId;

            await time.increase(time.duration.seconds(60*60*24*7+100000));
            const receipt = await omnGuild.endMarketValidationProposal(questionId);
            expectEvent(receipt, "ProposalRejected", {
                proposalId: guildProposalId
            });
            const proposalInfo = await omnGuild.getProposal(guildProposalId);
            assert.equal(proposalInfo.state, constants.GuildProposalState.Rejected);

        });

        it("test changing vote I.B.3.c: Voters CANNOT change vote once they've voted", async function() {
            const tx = await omnGuild.createMarketValidationProposal(questionId);
            const guildProposalId = tx.logs[0].args.proposalId;
            const guildProposalId_ = tx.logs[2].args.proposalId;

            const txVote = await omnGuild.setVote(
                guildProposalId,
                1, {
                    from: accounts[4]
                });

            await expectRevert(
				omnGuild.setVote(
                guildProposalId_,
                1, {
                    from: accounts[4]
                }),
                "OMNGuild: Already voted"
            );
        });
    });
});
