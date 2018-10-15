let Auction = artifacts.require("./Auction.sol");
let auctionInstance;

contract('AuctionContract', async (accounts) => {
  //accounts[0] is the default account
  
  it("Contract deployment", async () => {
    //Fetching the contract instance of our smart contract
    auctionInstance = await Auction.deployed();
    assert(auctionInstance !== undefined, 'Auction contract should be defined');
  });

  it("Should set bidders", async () => {
    await auctionInstance.register({from: accounts[1]});
    const result = await auctionInstance.getPersonDetails(0);
    assert.equal(result[2], accounts[1], 'bidder address set');
  });
  
  it("Should NOT allow to bid more than remaining tokens", async () => {
    try {
      await auctionInstance.bid(0, 6, {from: accounts[1]});
    } catch(e) {
      assert(e.message.includes('VM Exception while processing transaction: revert'));
    }
  });

  //Modifier Checking
  it("Should NOT allow non owner to reveal winners", async () => {
    try {
      await auctionInstance.revealWinners({from: accounts[1]});
    } catch(e) {
      assert(e.message.includes('VM Exception while processing transaction: revert'));
    }
  });

   it("Should set winners", async () => {
    // Register accounts
    await auctionInstance.register({from: accounts[2]});
    await auctionInstance.register({from: accounts[3]});
    await auctionInstance.register({from: accounts[4]});

    // Set bids
    await auctionInstance.bid(0, 5, {from: accounts[2]});
    await auctionInstance.bid(1, 5, {from: accounts[3]});
    await auctionInstance.bid(2, 5, {from: accounts[4]});

    // Reveal winners
    await auctionInstance.revealWinners({from: accounts[0]});
    
    // Check winner accounts
    let result = await auctionInstance.winners(0, {from: accounts[0]});
    assert.equal(result, accounts[2] , 'Winner address is not correct');
    
    result = await auctionInstance.winners(1, {from: accounts[0]});
    assert.equal(result, accounts[3] , 'Winner address is not correct');
    
    result = await auctionInstance.winners(2, {from: accounts[0]});
    assert.equal(result, accounts[4] , 'Winner address is not correct');

  });
});