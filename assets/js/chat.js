var onlineusers = [];
var users = [];
var messages = [];
$(document).ready(function () {
    $('#currentUser').text('Public');
    var status = false;
    function getOnlineUsers() {
        var request = {
            user: localStorage['account_name']
        }
        $.ajax({
            method: "POST",
            url: localStorage['endpoint'] + "user/getOneOnlineUser",
            data: request,
            json: true
        })
            .done(function (response) {
                var is_same = (response.length == onlineusers.length) && response.every(function(element, index) {
                    return element === onlineusers[index]; 
                });
                if (is_same == false) {
                    $('#chat_list').html("");
                    onlineusers = response;
                    $.each(onlineusers, function (i, item) {
                        if (item != localStorage['account_name'])
                            $('#chat_list').append('<div class="chat_list" id="chat_list_' + item + '"><div class="chat_people"><div class="chat_img"><img src="../assets/img/blockchain_icon.png" alt="' + item + '"></div><div class="chat_ib"><a href="#" onClick=\'chatSelector("' + item + '")\' class="chatname">' + item + '</br><span id="' + item + '" style="font-size: 12px;"></span></a></div></div></div>');
                    })
                    status =false;
                }
                setTimeout(function () { getOnlineUsers(); }, 5000);
            })

    }

    setTimeout(function () { getOnlineUsers(); }, 3000);

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
                    newMessage = '<span id="deleteMessage"> Request<br/> To: ' + localStorage['account_name'] + '<br/> Amount: ' + checkPaymentSignal[1] + ' ' + checkPaymentSignal[2] + ' <br/> <a onClick="makePayment(\'' + checkPaymentSignal[1] + ' ' + checkPaymentSignal[2] + ' ' + localStorage['account_name'] + '\') href="#">Send</a></span>'
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
        user2: $('#currentUser').text(),
        message: JSON.stringify(messages)
    };
    $.ajax({
        type: "POST",
        url: localStorage['endpoint'] + "chat/getAllMessagesForUser",
        data: request,
        json: true,
        accept: "application/json"
    }).then(function (response) {
        $.each(response, function (i, msg) {
            messages.push(msg);
        })
        var messageCount = parseInt($("#messageCount").text());
        messages.sort(function (a, b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(a.time) - new Date(b.time);
        });
        if (messageCount == 0 || $('#messages').html() == '') {
            $.each(messages, function (i, el) {
                var newChat = getHtmlMessage(localStorage['account_name'], $('#currentUser').text(), el);
                $('#messages').append(newChat);
            });
            $('#messages').animate({
                scrollTop: $('#messages')[0].scrollHeight
            });
        }
        if ((messageCount < messages.length) && (messageCount != 0)) {
            var newChat = getHtmlMessage(localStorage['account_name'], $('#currentUser').text(), messages[messages.length - 1]);
            $('#messages').append(newChat);
            $('#tempSent').remove();
            $('#messages').animate({
                scrollTop: $('#messages')[0].scrollHeight
            });
        }
        $.each(messages, function (key, message) {
            if (message.message.split(" ").length > 10 || message.message.split("<i").length > 0) {
                $('#' + message.to).text('conversation ' + moment(new Date(message.time)).fromNow());
            }
            else {
                $('#' + message.to).text(message.message + ' (' + moment(new Date(message.time)).fromNow() + ')');
            }
            var foundTo = users.filter(function (item) {
                return item == message.to || item == message.from;
            });
            foundTo = foundTo.filter(function (item) {
                return item != localStorage['account_name'];
            })
        })
        setTimeout(function () {
            loadMessages();
        }, 2000);
        $("#messageCount").html(messages.length);
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
            html = '<div name ="receivedMsg" class="incoming_msg"><div class="incoming_msg_img"><img src="../assets/img/blockchain_icon.png" alt="unknown"> </div><div class="received_msg"><div class="received_withd_msg"><p> <font size="2">' + message.from + '</font> <br/>' + finalMsg + '</p><span class="time_date">' + moment(new Date(message.time)).fromNow() + ' | <a href="#" onClick="deleteMe(\'' + message._id + '\')">Delete</a></span></div></div></div>';
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

function makePayment(message) {
    var val = message.split(" ");
    var request = {
        from: localStorage['account_name'],
        to: val[2],
        quantity: parseFloat(val[0]).toFixed(4) + ' ' + val[1],
        from_private_key: localStorage['private_key'],
        memo: 'Chat payment at ' + new Date()
    };
    $.ajax({
        method: "POST",
        url: localStorage['endpoint'] + "wallet/sendCoin",
        data: request,
        headers: {
            'token': localStorage['token']
        }
    })
        .then(function (response) {
            if (response.transaction_id == undefined) {
                alert('Payment failed');
            }
            else {
                alert('Payment Success, transactionId: ' + response.transaction_id);
                var request = {
                    to: val[2],
                    from: localStorage['account_name'],
                    message: 'Transaction <br/><br/>' + val[1] + '  ' + '<font size="16" face="verdana" color="black">' + parseFloat(val[0]).toFixed(4) + '</font><br/><br/> <a href="/getPaymentDetails/' + localStorage['account_name'] + '/' + val[2] + '/' + parseFloat(val[0]).toFixed(4) + '/' + val[1] + '/' + response.transaction_id + '">Know More</a>',
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
            }
        })
        .catch(function (err) {
            console.log(err);
        })
}