$(document).ready(function () {
    localStorage['endpoint'] = "https://hnx-framework.herokuapp.com/";
    $('form').submit(function (e) {
        e.preventDefault();
        var account_name = $('#login').val();
        var privateKey = $('#password').val();
        var request = {
            account_name: account_name,
            private_key: privateKey
        };
        $.ajax({
            type: "POST",
            url: localStorage['endpoint'] +'auth/Authenticate',
            data: request
        }).then(function (response) {
            localStorage['token'] = response.token;
            localStorage['account_name'] = $('#login').val();
            localStorage['private_key'] = $('#password').val();
            window.location = "dashboard.html"
        })
            .catch(function (error) {
                console.log(error);
            })
    });
});