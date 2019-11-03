$(document).ready(function () {
    $('#currentUser').text('Public');
    function getOnlineUsers() {
        $.ajax({
            method: "GET",
            url: localStorage['endpoint'] + "user/getOnlineUser",
            json: true
        })
            .done(function (response) {
                $.each(response, function (i, item) {
                    if (item != localStorage['account_name'])
                        $('#chat_list').append('<div class="chat_list"><div class="chat_people"><div class="chat_img"><img src="../assets/img/blockchain_icon.png" alt="' + item + '"></div><div class="chat_ib"><a <a href="#" onClick=\'chatSelector("' + item + '")\' class="chatname"><h5>' + item + '</h5></a></div></div></div>');
                })
            })

    }

    setTimeout(function () { getOnlineUsers(); }, 2000);

    /*
* When user submit chat below operation happens:
* 1. Submit the chat to server
* 2. Add chat to user 
* */
    $('form').submit(function () {
        var status = false;
        if ($('#m').val() == '') {
            alert('Please type a message to send!!');
        }
        else {
            var newMessage = decodeURI($('#m').val());
            $('#m').val('');
            var checkPaymentSignal = newMessage.split(" ");
            var msgto = '';
            //Logic for receive payment through wildcard
            if (checkPaymentSignal.length == 5 && checkPaymentSignal[0] == "request" && checkPaymentSignal[3] == "from") {
                if (confirm("Do you want to make receive request from " + checkPaymentSignal[4] + " for " + checkPaymentSignal[1] + " " + checkPaymentSignal[2] + " ?")) {
                    newMessage = '<span id="deleteMessage"> Request<br/> To: ' + localStorage['account_name'] + '<br/> Amount: ' + checkPaymentSignal[1] + ' ' + checkPaymentSignal[2] + ' <br/> <a onClick="makePayment(\'' + checkPaymentSignal[1] + ' ' + checkPaymentSignal[2] + ' ' + localStorage['account_name'] + '\')">Send</a> | <a href="#" onClick="deleteMessage()">Cancel</a></span>'
                    msgto = checkPaymentSignal[4];
                }

            }
            //Logic for send payment through wildcard
            else if (checkPaymentSignal.length == 5 && checkPaymentSignal[0] == "send" && checkPaymentSignal[3] == "to") {
                if (confirm("Do you want to make payment and send " + checkPaymentSignal[1] + " " + checkPaymentSignal[2] + " to " + checkPaymentSignal[4] + " ?")) {
                    var request = {
                        from: localStorage['account_name'],
                        to: checkPaymentSignal[4],
                        quantity: parseFloat(checkPaymentSignal[1]).toFixed(4) + ' ' + checkPaymentSignal[2],
                        from_private_key: localStorage['private_key'],
                        memo: 'Chat payment at ' + new Date()
                    };
                    status = true;
                    $.ajax({
                        method: "POST",
                        url: localStorage['endpoint'] + "wallet/sendCoin",
                        data: request,
                        headers: {
                            'token': localStorage['token']
                        }
                    })
                        .then(function (response) {
                            var request = {
                                to: checkPaymentSignal[4],
                                from: localStorage['account_name'],
                                message: 'Transaction <br/><br/>' + checkPaymentSignal[2] + '  ' + '<font size="16" face="verdana" color="black">' + parseFloat(checkPaymentSignal[1]).toFixed(4) + '</font><br/><br/> <a href="/getPaymentDetails/' + localStorage['account_name'] + '/' + checkPaymentSignal[4] + '/' + parseFloat(checkPaymentSignal[1]).toFixed(4) + '/' + checkPaymentSignal[2] + '/' + response.transaction_id + '">Know More</a>',
                                time: new Date()
                            };
                            $.ajax({
                                method: "POST",
                                url: localStorage['endpoint'] + 'chat/addMessage',
                                data: request
                            })
                                .then(function (response) {
                                    return false;
                                })
                                .catch(function (err) {
                                    console.log(err);
                                })
                            return false;
                        })
                    msgto = checkPaymentSignal[4];
                }

                request.message = newMessage;
            } else {
                //Add temporary message till it is reflected
                $('#messages').append('<div id="tempSent" name="sentMessage" class="outgoing_msg"><div class="sent_msg"><p>' + newMessage + '</p><span class="time_date">sending...</span></div></div>');

            }
            $('#messages').animate({
                scrollTop: $('#messages')[0].scrollHeight
            });
            if (status == false) {
                var request = {
                    to: $('#currentUser').text(),
                    from: localStorage['account_name'],
                    message: newMessage,
                    time: new Date()
                };
                if (msgto != '') {
                    request.to = msgto;
                }
                $.ajax({
                    method: "POST",
                    url: localStorage['endpoint'] + 'chat/addMessage',
                    data: request
                })
                    .then(function (response) {
                        return false;
                    })
                    .catch(function (err) {
                        console.log(err);
                    })
            }
        }
    });


});

/*
* Load chat to chat message:
* 1. get messages from server
* 2. if messages are not there, then try to get it from local
*/

function chatSelector(chatName) {
    $('#currentUser').text(chatName);
    $('#messages').html('');
    loadMessages();
}

function loadMessages() {
    var request = {
        user1: localStorage['account_name'],
        user2: $('#currentUser').text()
    };
    $.ajax({
        type: "POST",
        url: localStorage['endpoint'] + "chat/getMessage",
        data: request,
        json: true
    }).then(function (response) {
        var messageCount = parseInt($("#messageCount").text());
        if (messageCount == 0 || $('#messages').html() == '') {
            $.each(response, function (i, el) {
                var newChat = getHtmlMessage(localStorage['account_name'], $('#currentUser').text(), el);
                $('#messages').append(newChat);
            });
            $('#messages').animate({
                scrollTop: $('#messages')[0].scrollHeight
            });
        }
        if ((messageCount < response.length) && (messageCount != 0)) {
            var newChat = getHtmlMessage(localStorage['account_name'], $('#currentUser').text(), response[response.length - 1]);
            $('#messages').append(newChat);
            $('#tempSent').remove();
            $('#messages').animate({
                scrollTop: $('#messages')[0].scrollHeight
            });
        }
        setTimeout(function () {
            loadMessages();
        }, 2000);
        $("#messageCount").html(response.length);
    })
        .catch(function (error) {
            console.log(error);
        })
};

setTimeout(function () {
    loadMessages();
}, 2000);

/*
* Get HTML message format for sender and receiver
*/
function getHtmlMessage(from, to, message) {
    var html;
    if (message.to == 'Public' && to == 'Public') {
        finalMsg = message.message;
        if (message.from == from) {
            html = '<div id="' + message._id + '" name="sentMessage" class="outgoing_msg"><div class="sent_msg"><p>' + finalMsg + '</p><span class="time_date">' + moment(new Date(message.time)).fromNow() + ' | <a href="#" onClick="deleteMe(\'' + message._id + '\')">Delete</a></span></div></div>'
        }
        else {
            html = '<div name ="receivedMsg" class="incoming_msg"><div class="incoming_msg_img"><img src="/img/blockchain_icon.png" alt="unknown"> </div><div class="received_msg"><div class="received_withd_msg"><p> <font size="2">' + message.from + '</font> <br/>' + finalMsg + '</p><span class="time_date">' + moment(new Date(message.time)).fromNow() + ' | <a href="#" onClick="deleteMe(\'' + message._id + '\')">Delete</a></span></div></div></div>';
        }
    } else
        if ((message.from == to && message.to == from) || (message.from == from && message.to == to)) {
            var messageValidation1 = message.message.split('To: ' + from);
            var messageValidation2 = message.message.split('onClick');
            if (message.to == 'Public') {
                //receive payment request check
                finalMsg = message.message;
                html = '<div name ="receivedMsg" class="incoming_msg"><div class="incoming_msg_img"><img src="/img/blockchain_icon.png" alt="unknown"> </div><div class="received_msg"><div class="received_withd_msg"><p> <font size="2">' + message.from + '</font> <br/>' + finalMsg + '</p><span class="time_date">' + moment(new Date(message.time)).fromNow() + ' | <a href="#" onClick="deleteMe(\'' + message._id + '\')">Delete</a></span></div></div></div>';
            }
            else if (message.from == to) {
                finalMsg = message.message;
                html = '<div name ="receivedMsg" class="incoming_msg"><div class="incoming_msg_img"><img src="/img/blockchain_icon.png" alt="unknown"> </div><div class="received_msg"><div class="received_withd_msg"><p>' + finalMsg + '</p><span class="time_date">' + moment(new Date(message.time)).fromNow() + ' | <a href="#" onClick="deleteMe(\'' + message._id + '\')">Delete</a></span></div></div></div>'
            }
            else {
                if (messageValidation1.length > 1 && messageValidation2.length > 1) {
                    finalMsg = message.message.split('<br/>')[0] + '<br/>' + message.message.split('<br/>')[1] + '<br/>' + message.message.split('<br/>')[2];
                }
                else {
                    finalMsg = message.message;
                }
                html = '<div id="' + message._id + '" name="sentMessage" class="outgoing_msg"><div class="sent_msg"><p>' + finalMsg + '</p><span class="time_date">' + moment(new Date(message.time)).fromNow() + ' | <a href="#" onClick="deleteMe(\'' + message._id + '\')">Delete</a></span></div></div>'
            }
        }
    return html;
};


