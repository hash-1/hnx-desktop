$(document).ready(function () {
    $("#feedback-form").submit(function (event) {

        /* stop form from submitting normally */
        event.preventDefault();
        var request = {
            to: "Feedback Team",
            from: {
                name: $('#name').val() ,
                account: localStorage['account_name'],
                email: $('#email').val()
            },
            message: {
                subject: $('#subject').val(),
                message: $('#message').val()
            },
            status: 'Open'
        }
        $.ajax({
            type: "POST",
            url: localStorage['endpoint'] + 'user/addOneFeedbackForUser',
            data: request
        }).then(function (response) {
            alert("Thank you for providing your input. We will get back to you if needed.");
            location.reload();
        });
    })
});