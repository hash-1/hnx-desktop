$(document).ready(function () {
    $('#account_name').text(localStorage['account_name']);
    $('#public_key').text( localStorage['public_key']);
    $('#private_key').text(localStorage['private_key']);
    
    $('form').submit(function (e) {
        console.log('I a in');
        e.preventDefault();
        localStorage['account_name'] = null;
        localStorage['public_key'] = null;
        localStorage['private_key'] = null;
        window.location = "index.html"
    });
});