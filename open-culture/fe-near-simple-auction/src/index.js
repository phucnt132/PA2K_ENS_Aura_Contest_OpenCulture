import "regenerator-runtime/runtime";
import * as nearAPI from "near-api-js";
import { initContract, login, logout } from "./utils";
const { utils } = nearAPI;
import getConfig from "./config";
const { networkId } = getConfig(process.env.NODE_ENV || "development");

console.log(networkId);
document.querySelector("#home").onclick = async () => {
  renderHome();
};
document.querySelector("#auction").onclick = async () => {
  renderAuction();
};

document.querySelector("#mint").onclick = async () => {
  renderMint();
};

document.querySelector("#create-auction").onclick = async () => {
  renderCreateAuction();
};
// Display the signed-out-flow container
function signedOutFlow() {
  document.querySelector("#signin").innerHTML = '<div class="ktext-sign sign-in-text-k" >Sign In</div>';
  document.querySelector("#box-logout").innerHTML = `<div></div>`;
  document.querySelector("#mint").disabled = true;
  document.querySelector("#signin").onclick = login;
}

// Displaying the signed in flow container and fill in account-specific data
function signedInFlow() {
 
  document.querySelector("#box-login").innerHTML = `<div></div>`;
  document.querySelector("#logon").innerHTML =  `<div class="ktext-sign more-respone">${window.accountId}</div>`;
  document.querySelector("#signout").onclick = logout;
  document.querySelector("#signin").onclick = () => {};
}

window.nearInitPromise = initContract()
  .then(() => {
    if (window.walletConnection.isSignedIn()) signedInFlow();
    else signedOutFlow();
  })
  .catch(console.error);

const getTokenData = async (tokenId) => {
  let res = await contract.nft_token({ token_id: tokenId });

  return res;
};

const renderMint = async () => {
 
  document.querySelector(".content").innerHTML = ``
  document.querySelector(".content-aution").innerHTML = ``
  document.querySelector(".content-aution").innerHTML = `
    <form id="mint-form">
    <div class="form-group">
        <div for="tokenId" class="text-css-color" style="
        color: white;
        font-style: Space Grotesk;">Token ID</div>
        <input  type="text" class="form-control-k" id="token-id" placeholder="Token ID">
    </div>
    <div class="form-group">
        <div for="tokenOwnerId" class="text-css-color">Token Owner ID</div>
        <input type="text" class="form-control-k" id="token-owner-id" placeholder="Token Owner ID">
    </div>
    <div class="form-group" >
        <div for="title" class="text-css-color">Token Title</div>
        <input type="text" class="form-control-k" id="title" placeholder="Title">
    </div>
    <div class="form-group">
        <div for="description" class="text-css-color">Description</div>
        <input type="text" class="form-control-k" id="description" placeholder="Description">
    </div>
    <div class="form-group">
        <div for="media" class="text-css-color">Token URI</div>
        <input type="text" class="form-control-k" id="media" placeholder="Token URI">
    </div>

    <button type="submit" class="mint-button-nft"><div class="mint-button-text">Mint</div></button>
</form>
    `;
  document.querySelector("#mint-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    let tokenId = document.querySelector("#token-id").value;
    let tokenOwnerId = document.querySelector("#token-owner-id").value;
    let title = document.querySelector("#title").value;
    let description = document.querySelector("#description").value;
    let media = document.querySelector("#media").value;
    console.log(tokenId, tokenOwnerId, title, description, media);
    try {
      let callRes = await contract.mint(
        {
          token_id: tokenId,
          token_owner_id: tokenOwnerId,
          token_metadata: {
            title: title,
            description: description,
            media: media,
          },
        },
        300000000000000,
        utils.format.parseNearAmount("0.1")
      );
      console.log(callRes);
    } catch (err) {
      console.log(err);
    }
  });
};

const renderCreateAuction = async () => {
  document.querySelector("#more-button-id").innerHTML = ``
  document.querySelector(".content").innerHTML = ``
  document.querySelector(".content-aution").innerHTML = ` `
  document.querySelector(".content-aution").innerHTML = `
    <form id="create-auction-form">
    <div class="form-group">
        <label class="for-text-main-k" for="tokenId" style="
        color: #a8a8a8;
        font-style: Space Grotesk;">Token ID</label>
        <input type="text" class="form-control-k" id="token-id" placeholder="input your token id...">
    </div>
    <div class="form-group">
        <label class="for-text-main-k" for="start-price" style="
        color: #a8a8a8;
        font-style: Space Grotesk;">Start Price</label>
        <input type="text" class="form-control-k" id="start-price" placeholder="input your start price...">
    </div>
    <div class="form-group">
        <label class="for-text-main-k" for="start-time" style="
        color: #a8a8a8;
        font-style: Space Grotesk;" >Start Time</label>
        <input type="datetime-local" class="form-control-k" id="start-time" placeholder="Start Time">
    </div>
    <div class="form-group">
        <label class="for-text-main-k" for="end-time" style="
        color: #a8a8a8;
        font-style: Space Grotesk;">End Time</label>
        <input type="datetime-local" class="form-control-k" id="end-time" placeholder="End Time">
    </div>


    <div class="create-aution-box"><button type="submit" class="create-aution-button"><div class="aution-text">Create Auction</div></button></div>
</form>
    `;
  document
    .querySelector("#create-auction-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      let tokenId = document.querySelector("#token-id").value;
      let startPrice = utils.format.parseNearAmount(
        document.querySelector("#start-price").value
      );
      let startTime =
        Date.parse(document.querySelector("#start-time").value) / 1000;
      let endTime =
        Date.parse(document.querySelector("#end-time").value) / 1000;
      console.log(tokenId, startPrice, startTime, endTime);
      let resCall = await contract.create_auction(
        {
          auction_token: tokenId,
          start_price: parseInt(startPrice),
          start_time: startTime,
          end_time: endTime,
        },
        300000000000000,
        utils.format.parseNearAmount("1")
      );

      console.log(resCall);
    });
};

const renderHome = async () => {
  const totalSupply = parseInt(await contract.nft_total_supply());
  let limit = totalSupply > 6 ? 6 : totalSupply;
  let nfts = await contract.nft_tokens({ from_index: "0", limit: limit });
  document.querySelector(".content-aution").innerHTML = "";
  nfts.forEach(async (nft, index) => {
    console.log(nft);
    let response = await fetch(nft.metadata.media);
    let data = await response.json();
    if (data.image.includes("ipfs://")) {
      data.image = data.image.replace("ipfs://", "https://ipfs.io/ipfs/");
      console.log(data.image);
    }
    let card = document.createElement("div");
    card.className = "card-k";
    card.innerHTML = `
          <div class="card-header-k">
  <p class="token-id-k">Token ID: ${nft.token_id}</p>
  <div class="card-title card-title-k">${nft.metadata.title}</div>
  <div class="owner">
    <p class="author-detail-k">Owner ID:</p>
    <div class="nft-owner-id">${nft.owner_id}</div>
  </div>
  <p class="card-description-k">${nft.metadata.description}</p>
</div>

<div class="card-content">
  <div class="card-img-k">
    <img src="${data.image}" />
  </div>
  <div class="ending-current">
    <div class="current-block-k">
      <div class="text-detail-k nft-ending-k">Current Bid</div>
      <div class="text-detail-number-k">0.90 ETH</div>
    </div>
    <div class="ending-block-k">
      <div class="text-detail-k nft-ending-k">Ending In</div>
      <div class="text-detail-number-k">10h 43m 26s</div>
    </div>
  </div>
</div>

`;

    document.querySelector(".content").appendChild(card);
  });
};
const renderAuction = async () => {
  try {
    document.querySelector(".content").innerHTML = ``
    document.querySelector(".content-aution").innerHTML = ` `
    document.querySelector(".content-aution").innerHTML = `
            <div class="aution-box-all ">
              <div  class="bid-control">
                  <div class="custom-control-box">
                    <input type="text" class="form-control-k custom-control" id="auction-id" placeholder="Auction ID">
                    <input type="text" class="form-control-k custom-control " id="bid-price" placeholder="Bid Price">
                    <button class="btn btn-primary-k" id="bid" class="bid">Bid</button>
                    </div>
                
                 
                  <div class="custom-control-claim">
                    <input type="text" id="auction-id-claim" class="form-control-k custom-control " placeholder="Auctiodn ID">
                    <button class="btn btn-primary-k" id="claim-nft">Claim NFT</button>
                  </div>
              </div>
              <div class="list-card-render-aution">
              
              </div>
            </div>
            `;
    for (let i = 0; i < 10; i++) {
      let auction = await contract.get_auction({ auction_id: i });
      console.log(auction);
      let token = await getTokenData(auction.auction_token);
      let response = await fetch(token.metadata.media);
      let data = await response.json();
      if (data.image.includes("ipfs://")) {
        data.image = data.image.replace("ipfs://", "https://ipfs.io/ipfs/");
        console.log(data.image);
      }
      console.log(token);
      let card = document.createElement("div");
      card.className = "card-k";
      card.innerHTML = `
                    <div class="card-header-k">
                        <p class="token-id-k">Auction ID: ${auction.auction_id}</p>  
                        <p class="token-id-k">Token ID: ${
                          auction.auction_token
                        }</p>
                        <h3 class="card-title card-title-k">Title: ${
                          token.metadata.title
                        }</h3>
                     


                        <div class="owner">
                        <p class="author-detail-k">Owner ID:</p>
                        <div class="nft-owner-id"> ${auction.owner}</div>
                      </div>
                        <p class="token-id-k">Current Price: ${
                          auction.current_price / 10 ** 24
                        } NEAR</p>
                        <p class=" token-id-k">Current winner: ${
                          auction.winner || "no winner"
                        }</p>
                        <p class="token-id-k">End: ${new Date(
                          auction.end_time / 1_000_000
                        )}</p>
                    </div>
                    <div class="card-content">
                        <div class="card-img">
                            <img  src="${data.image}" />
                        </div>
                    </div>

                `;
      document.querySelector(".list-card-render-aution").appendChild(card);
    }
  } catch (err) {
    console.log(err);
  }
  document.querySelector("#bid").onclick = async () => {
    let auctionId = parseInt(document.querySelector("#auction-id").value);
    let bidPrice = utils.format.parseNearAmount(
      document.querySelector("#bid-price").value
    );
    console.log(auctionId, bidPrice);
    let res = await contract.bid(
      { auction_id: auctionId },
      300000000000000,
      bidPrice
    );
    console.log(res);
  };

  document.querySelector("#claim-nft").onclick = async () => {
    let auctionId = parseInt(document.querySelector("#auction-id-claim").value);
    console.log(auctionId);
    contract.claim_nft({ auction_id: auctionId }, 300000000000000, 1);
  };
};
setTimeout(renderHome);
console.log("asdfasdfasdfd")