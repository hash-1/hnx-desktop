$(document).ready(function () {
    $("#loading").hide();
    $('form').submit(function (e) {
        $("#loading").show();
        e.preventDefault();
        var account_name = $('#login').val();
        var request = {
            account_name: account_name
        };
        $.ajax({
            type: "POST",
            url: localStorage['endpoint'] +'auth/signup',
            data: request
        }).then(function (response) {
            localStorage['account_name'] = response.account_name;
            localStorage['public_key'] = response.public_key;
            localStorage['private_key'] = response.private_key;
            window.location = 'last-screen.html';
        })
            .catch(function (error) {
                alert('Signup Failed!! Please try again...');
                window.location = 'signup.hrml';
            })
    });
});