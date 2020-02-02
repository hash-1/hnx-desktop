$(document).ready(function () {
    $.ajax({
        method: "POST",
        url: localStorage['endpoint'] + "user/addOnlineUser",
        data: { user: localStorage['account_name'] },
        json: true
    })
        .done(function (response) {
        })

    getBalance();
    //get balance for EOS
    function getBalance() {
        $.ajax({
            method: "POST",
            url: localStorage['endpoint'] + "wallet/getCurrencyBalance",
            headers: {
                'token': localStorage['token']
            },
            data: { code: 'eosio.token', account_name: localStorage['account_name'], symbol: 'EOS' },
            json: true
        })
            .done(function (response) {
                if (response == 'Invalid token or token is expired') {
                    $.ajax({
                        method: "POST",
                        url: localStorage['endpoint'] + "user/removeOnlineUser",
                        data: { user: localStorage['account_name'] },
                        json: true
                    })
                        .done(function (response) {
                            window.location = "index.html";
                        })
                }
                trimCurrencyBalance(response)
                $('#eos_balance').text('');
                $('#eos_balance').text(trimCurrencyBalance(response));
            })

        //get balance for JUNGLE   
        $.ajax({
            method: "POST",
            url: localStorage['endpoint'] + "wallet/getCurrencyBalance",
            headers: {
                'token': localStorage['token']
            },
            data: { code: 'eosio.token', account_name: localStorage['account_name'], symbol: 'JUNGLE' },
            json: true
        })
            .done(function (response) {
                if (response == 'Invalid token or token is expired') {
                    $.ajax({
                        method: "POST",
                        url: localStorage['endpoint'] + "user/removeOnlineUser",
                        data: { user: localStorage['account_name'] },
                        json: true
                    })
                        .done(function (response) {
                            window.location = "index.html";
                        })
                }
                trimCurrencyBalance(response)
                $('#jungle_balance').text('');
                $('#jungle_balance').text(trimCurrencyBalance(response));
            })

        //get balance for HNX   
        $.ajax({
            method: "POST",
            url: localStorage['endpoint'] + "wallet/getCurrencyBalance",
            headers: {
                'token': localStorage['token']
            },
            data: { code: 'eosio.token', account_name: localStorage['account_name'], symbol: 'HNX' },
            json: true
        })
            .done(function (response) {
                if (response == 'Invalid token or token is expired') {
                    $.ajax({
                        method: "POST",
                        url: localStorage['endpoint'] + "user/removeOnlineUser",
                        data: { user: localStorage['account_name'] },
                        json: true
                    })
                        .done(function (response) {
                            window.location = "index.html";
                        })
                }
                $('#hnx_balance').text('');
                $('#hnx_balance').text(trimCurrencyBalance(response));
            })
            setTimeout(function(){ getBalance(); }, 5000);
    }

    $('#account').text(localStorage['account_name']);
})

function trimCurrencyBalance(balance) {
    balance = balance.replace('[', '');
    balance = balance.replace('"', '');
    balance = balance.replace(']', '');
    balance = balance.replace('"', '');
    if (balance == '') {
        balance = 'Not Available'
    }
    return balance;
}