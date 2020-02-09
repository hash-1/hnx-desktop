$(document).ready(function () {
    $("#sendToken").submit(function (event) {

        /* stop form from submitting normally */
        event.preventDefault();
        var request = {
            from: localStorage['account_name'],
            from_private_key: localStorage['private_key'],
            to: $('#name').val(),
            quantity: parseFloat($('#amount').val()).toFixed(4) +' '+ $('#currency').val(),
            memo: $('#memo').val()            
        }
        $.ajax({
            type: "POST",
            url: localStorage['endpoint'] + 'wallet/sendCoin',
            headers: {
                'token': localStorage['token']
            },
            data: request
        }).then(function (response) {
            alert("Payment Done!! Please refer transaction menu for more details");
            location.reload();
        })
        .catch(function(err){
            alert('Error: '+ err);
        })
    })
});