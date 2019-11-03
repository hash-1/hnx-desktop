$(document).ready(function () {
    $.ajax({
        method: "POST",
        url: localStorage['endpoint'] + "user/addOnlineUser",
        data: { user: localStorage['account_name'] },
        json: true
    })
        .done(function (response) {
            console.log(JSON.stringify(response) + localStorage['account_name']);
        })

    //get balance for EOS
    $.ajax({
        method: "POST",
        url: localStorage['endpoint'] + "wallet/getCurrencyBalance",
        headers: {
            'token':localStorage['token']
        },
        data: { code: 'eosio.token', account_name: localStorage['account_name'], symbol: 'EOS' },
        json: true
    })
        .done(function (response) {
            if(response == 'Invalid token or token is expired'){
                window.location = "index.html";
            }
            $('#eos_balance').text(trimCurrencyBalance(response));
        })
    
    //get balance for JUNGLE   
    $.ajax({
        method: "POST",
        url: localStorage['endpoint'] + "wallet/getCurrencyBalance",
        headers: {
            'token':localStorage['token']
        },
        data: { code: 'eosio.token', account_name: localStorage['account_name'], symbol: 'JUNGLE' },
        json: true
    })
        .done(function (response) {
            if(response == 'Invalid token or token is expired'){
                window.location = "index.html";
            }
            $('#jungle_balance').text(trimCurrencyBalance(response));
        })

    //get balance for HNX   
    $.ajax({
        method: "POST",
        url: localStorage['endpoint'] + "wallet/getCurrencyBalance",
        headers: {
            'token':localStorage['token']
        },
        data: { code: 'eosio.token', account_name: localStorage['account_name'], symbol: 'HNX' },
        json: true
    })
        .done(function (response) {
            if(response == 'Invalid token or token is expired'){
                window.location = "index.html";
            }
            $('#hnx_balance').text(trimCurrencyBalance(response));
        })    

    $('#account').text(localStorage['account_name']);
})

function trimCurrencyBalance(balance){
    balance = balance.replace('[', '');
    balance = balance.replace('"', '');
    balance = balance.replace(']', '');
    balance = balance.replace('"', '');
    if(balance == ''){
        balance = '0 Balance'
    }
    return balance;
}