async function run() {
    var abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"sender","type":"address"},{"name":"recipient","type":"address"},{"name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"recipient","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"}];
    
    var _tokenPrice = 25000000;
    
    // var poolAddress = 'TGXQD5XtzT91rCKBC8ajMVFkfb4GhYaCED'; // SunSUNV3-Pool Mainnet
    var poolAddress = 'TWdhfgXcrtQpCjuW3aucBLhhcUPqSR8m5N'; // SunSUNV3-Pool Shasta
    // var funcAddress = 'TQwGMvTCpfGJd3wtAr142iKhktStDMo9dW'; // SUN Token Mainnet
    var funcAddress = 'TTGYbKA4EsNnsB2jP7MarR1hm1SqkJaLNk'; // SUN Token Shasta
    // var swapAddress = 'THk9twjs1C3yHd6XCAAAvQJKcPLtXHTet6'; // FSwap Mainnet
    var swapAddress = 'TFwipgA2HLDSHqWfDS3Rit7ggmNBLmg9E9'; // FSwap Shasta
    var TOKEN = await tronWeb.contract().at(funcAddress);
    var STAKE = await tronWeb.contract().at(poolAddress);

    function init() {
        setInterval(()=>{update()},3000)
        
        $('#trxAmount').change(function() {
            var _trxVal = $(this).val();
            if (_trxVal == "")  {
                $("#stake").hide();
                $("#unstake").hide();
            }
            if (_trxVal == "0") {
                $("#stake").hide();
                $("#unstake").hide();
            }
            if (_trxVal >= "1") {
                $("#stake").show();
                $("#unstake").show();
            }
        });
        
        $('#buyInput').change(function() {
            var tokAmount = parseFloat(document.getElementById("buyInput").value) * 1e6;
            $("#buy-fee").html(((tokAmount * 0.003) / 1e6).toFixed(4));
            var minToken = (tokAmount / _tokenPrice) * 0.95;
            var estToken = (tokAmount / _tokenPrice) * 0.99;
            $("#min-tok-rec").html(minToken.toFixed(4));
            $("#est-tok-rec").html(estToken.toFixed(4));
            
            if (tokAmount == "")  {$("#buyTokenBtn").hide();}
            if (tokAmount == "0") {$("#buyTokenBtn").hide();}
            if (tokAmount >= "1") {$("#buyTokenBtn").show();}
        });
        
        $('#sellInput').change(function() {
            var tokAmount = parseFloat(document.getElementById("sellInput").value);
            $("#sell-fee").html(((tokAmount * 0.003) / 1e18).toFixed(4));
            var minToken = (tokAmount * _tokenPrice / 1e6) * 0.95;
            var estToken = (tokAmount * _tokenPrice / 1e6) * 0.99;
            $("#min-trx-rec").html(minToken.toFixed(4));
            $("#est-trx-rec").html(estToken.toFixed(4));
            
            if (tokAmount == "")  {$("#sellTokenBtn").hide();}
            if (tokAmount == "0") {$("#sellTokenBtn").hide();}
            if (tokAmount >= "1") {$("#sellTokenBtn").show();}
        });
        
        $('#buyTokens').click(async function (event) {
            var tokAmount = parseFloat(document.getElementById("buyInput").value);
            var minToken = (tokAmount / myVars["nortPrice"]) * 0.95;
            var estToken = (tokAmount / myVars["nortPrice"]) * 0.99;
            var deadline = Math.floor(new Date().getTime() / 1000.0) + 600;
            console.log(minToken, estToken);
            buyFunctionTrigger(parseInt(tokAmount * 10 ** 6), parseInt(minToken * 10 ** 6), deadline);
        });
        
        $('#sellTokens').click(async function (event) {
            var tokAmount = parseFloat(document.getElementById("sellInput").value);
            var minToken = (tokAmount * myVars["nortPrice"]) * 0.95;
            var estToken = (tokAmount * myVars["nortPrice"]) * 0.99;
            var deadline = Math.floor(new Date().getTime() / 1000.0) + 600;
            console.log(minToken, estToken);
            let tokenContract = await tronWeb.contract().at(tokenAddress);
            tokenContract.methods.approve(poolAddress, tokAmount * 10 ** 6).send({
                shouldPollResponse: false,
                feeLimit: FEE_LIMIT
            })
                .then(function () {

            })
                .catch(function () {
                alert('Error');
            });
            console.log("approved");
            sellFunctionTrigger(parseInt(tokAmount * 10 ** 6), parseInt(minToken * 10 ** 6), deadline);
        });
        
        $('#stake').click(async function (event) {
            event.preventDefault();
            var amount = parseInt($('#stakeAmount').val().toString() + "000000");
            console.log(amount)
            if (amount > 0) {
                try {
                    await STAKE.stake().send({
                        shouldPollResponse: false, 
                        callValue: amount, 
                        feeLimit: 1e8
                    });
                    
                    alertify.success("🏝 Staking " + (amount / 1e6) + " TRX... 💸")
                } catch (err) {
                    console.error(err)
                    alertify.error("🚫 Could not Stake TRX! Try again later!")
                }
            }
        });
        
        $('#unstake').click(async function (event) {
            event.preventDefault();
            var amount = parseInt($('#unstakeAmount').val());
            let value = amount.toString() + "000000";
            console.log(value)
            if (amount > 0) {
                try {
                    await STAKE.withdraw(value).send();
                    alertify.success("🏝 Unstaking " + (amount) + " TRX... 💸")
                } catch (err) {
                    console.error(err)
                    alertify.error("🚫 Could not Unstake TRX! Try again or check Tronscan!")
                }
            }
        });
        
        $('#getReward').click(function () {
            STAKE.getReward().send(function (error, hash) {
                if (!error) {
                    console.log(hash);
                    alertify.success("🏝 Collecting Earnings... 💸")
                } else {
                    console.log(error);
                    alertify.error("🚫 Could not collect Earnings! Try again or check Tronscan!")
                }
            });
        });
        
        $('#transfer').click(async function (event) {
            event.preventDefault();
            var amount = parseInt($('#transferAmount').val());
            var _transferInputFloored = Math.floor(amount);
            let value = (_transferInputFloored * 1e6).toString();
            var to = $('#transferReceiver').val();
            if (_transferInputFloored > 0 && to.length == 34) {try {await FUNC.transfer(to, value).send();} catch (err) {console.error(err)}}
        });
        
        $('#approveJustSwap').click(function () {
            var theWholeLot = 1000000 * 10 ** 18;
            tokenContract.methods.approve(poolAddress, theWholeLot).send({
                shouldPollResponse: false, feeLimit: FEE_LIMIT}).then(function () {}).catch(function () {alert('Error');});
        });
        
        $("#qrImage").replaceWith('<img src="https://chart.googleapis.com/chart?chs=350x350&amp;cht=qr&amp;chl=' + tronWeb.defaultAddress.base58 + '&amp;choe=UTF-8" />');
        
        $("#myTronAddr").replaceWith('<small>'+ tronWeb.defaultAddress.base58 +'</small>');
        
        setTimeout(update, 500);
    }

    function update() {
        var account = tronWeb.defaultAddress !== undefined && tronWeb.defaultAddress.base58 !== undefined ? tronWeb.defaultAddress.base58 : null;
        
        TOKEN.balanceOf(account).call(function              (error, result) {$('#myTokens').text(numberWithCommas(parseFloat(result / 1e18).toFixed(0)));});
        TOKEN.balanceOf(poolAddress).call(function          (error, result) {$('#FUNCRemaining').text(numberWithCommas(parseFloat(result / 1e18).toFixed(0)));});
        TOKEN.totalSupply().call(function                   (error, result) {$('#totalSupply').text(numberWithCommas(parseFloat(result / 1e18).toFixed(0)));});
        
        STAKE.earned(account).call(function                 (error, result) {$('#myEarned').text(parseFloat(result / 1e18).toFixed(2));});
        STAKE.balanceOf(account).call(function              (error, result) {$('#myStake').text(parseFloat(result / 1e6).toFixed(2));});
        STAKE.totalSupply().call(function                   (error, result) {$('#totalStaked').text(parseFloat(result / 1e6).toFixed(0));});
    }

    const numberWithCommas = (x) => {return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");}
    
    function log10(val) {return Math.log(val) / Math.log(10);}
    $(document).ready(init);
}

let waitForTronWeb=function(){if(window.tronWeb===undefined){setTimeout(waitForTronWeb,500);} else {run();}}
waitForTronWeb();
