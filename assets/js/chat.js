$(document).ready(function () {
    //var socketUrl;
    var server = $('#httpServer').val();
    var from = $('#accountname').val();
    var to = $('#user').val();
    var clients = [];
    var onlineUsers = [];
    /*
    * When user submit chat below operation happens:
    * 1. Submit the chat to server
    * 2. Add chat to user 
    * */
    $('form').submit(function () {
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
                    newMessage = '<span id="deleteMessage"> Request<br/> To: ' + from + '<br/> Amount: ' + checkPaymentSignal[1] + ' ' + checkPaymentSignal[2] + ' <br/> <a onClick="makePayment(\'' + checkPaymentSignal[1] + ' ' + checkPaymentSignal[2] + ' ' + from + '\')">Send</a> | <a href="#" onClick="deleteMessage()">Cancel</a></span>'
                    msgto = checkPaymentSignal[4];
                }

            }
            //Logic for send payment through wildcard
            else if (checkPaymentSignal.length == 5 && checkPaymentSignal[0] == "send" && checkPaymentSignal[3] == "to") {
                if (confirm("Do you want to make payment and send " + checkPaymentSignal[1] + " " + checkPaymentSignal[2] + " to " + checkPaymentSignal[4] + " ?")) {
                    var request = {
                        account: checkPaymentSignal[4],
                        amount: checkPaymentSignal[1],
                        currency: checkPaymentSignal[2]
                    };
                    $.ajax({
                        method: "POST",
                        url: '/walletSend',
                        data: request
                    })
                        .then(function () {
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
            var request = {
                to: to,
                from: from,
                message: newMessage,
                time: new Date()
            };
            if (msgto != '') {
                request.to = msgto;
            }
            $.ajax({
                method: "POST",
                url: server + 'addMessage',
                data: request
            })
                .then(function (response) {
                    return false;
                })
        }
    });

    /*
    * Messages will be retrived with below conditions:
    * 1. Every 5 seconds, client DB synchronisation will be performed
    * 2. Messages addition will be done to clientDB
    * */
    function synchroniseMessages() {
        var dbMessages = [];
        var clientMessages = [];
        var request = {
            user: from
        };
        $.ajax({
            type: "POST",
            url: '/synchroniseDB',
            data: request,
            json: true
        }).then(function (response) {
            setTimeout(function () { synchroniseMessages(); }, 2000);
        })
            .catch(function (error) {
                console.log(error);
            })
    };

    synchroniseMessages();

    /*
    * Load chat to chat message:
    * 1. get messages from server
    * 2. if messages are not there, then try to get it from local
    */

    function loadMessages() {
        var request = {
            user1: to,
            user2: from
        };
        $.ajax({
            type: "POST",
            url: "/chat",
            data: request,
            json: true
        }).then(function (response) {
            var messageCount = parseInt($("#messageCount").text());
            if (messageCount == 0) {
                $.each(response, function (i, el) {
                    var newChat = getHtmlMessage(from, to, el);
                    $('#messages').append(newChat);
                });
                $('#messages').animate({
                    scrollTop: $('#messages')[0].scrollHeight
                });
            }
            if ((messageCount < response.length) && (messageCount != 0)) {
                var newChat = getHtmlMessage(from, to, response[response.length - 1]);
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
    loadMessages();
    /*
    * Get HTML message format for sender and receiver
    */

    function getHtmlMessage(from, to, message) {
        var html;
        if (message.to == 'Public' && to == 'Public') {
            console.log(message.from);
            console.log(message.to);
            console.log(to);
            console.log(from);
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
                html = '<div name ="receivedMsg" class="incoming_msg"><div class="incoming_msg_img"><img src="/img/blockchain_icon.png" alt="unknown"> </div><div class="received_msg"><div class="received_withd_msg"><p> <font size="2">'+ message.from + '</font> <br/>' + finalMsg + '</p><span class="time_date">' +  moment(new Date(message.time)).fromNow() + ' | <a href="#" onClick="deleteMe(\'' + message._id + '\')">Delete</a></span></div></div></div>';
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

    /*
    * Get Online users
    */
    function getOnlineUsers() {
        $.ajax({
            type: "GET",
            url: '/getOnlineUsers',
            async: false
        }).then(function (response) {
            var onlineSystemUsers = parseInt($("#onlineUsers").text());
            if (onlineSystemUsers == 0) {
                $.each(response, function (i, item) {
                    if (item.user != from) {
                        if (item.user != undefined) {

                            if (item.online == true) {
                                $('#userProfile').append($('<div class="chat_list active_chat"> <div class="chat_people"><div class="chat_img"><img src="/img/blockchain_icon.png" alt="' + item.user + '"> </div><div class="chat_ib"><a href="/messages/' + item.user + '"<h5>' + item.user + '<span class="online"></span></h5></a></div></div></div>'));
                            }
                            else {
                                $('#userProfile').append($('<div class="chat_list active_chat"> <div class="chat_people"><div class="chat_img"><img src="/img/blockchain_icon.png" alt="' + item.user + '"> </div><div class="chat_ib"><a href="/messages/' + item.user + '"<h5>' + item.user + '<span class="offline"></span></h5></a></div></div></div>'));
                            }
                        }
                    }
                });
                $("#onlineUsers").html(response.length + 1);
            }
            onlineSystemUsers = parseInt($("#onlineUsers").text()) + 1;
            if (onlineSystemUsers < (response.length + 1)) {
                for (var i = 0; i < (response.length - onlineSystemUsers); i++) {
                    $('#userProfile').append($('<div class="chat_list active_chat"> <div class="chat_people"><div class="chat_img"><img src="/img/blockchain_icon.png" alt="' + response[response.length - i - 1] + '"> </div><div class="chat_ib"><a href="/messages/' + response[response.length - i - 1] + '"<h5>' + response[response.length - i - 1] + '</h5></a></div></div></div>'));
                }
            }
            setTimeout(function () { getOnlineUsers(); }, 2000);
        })
            .catch(function (error) {
                console.log(error);
            })
    };
    getOnlineUsers();



    /*
    
        socket.on('connect', function (client) {
            socket.emit('username', accountName);
            var finalMessage = [];
            $.getJSON("/chatdb.json", function (data) {
                finalMessage = data;
                var items = [];
                var status = false;
                //synchronise messages
                var serverMessages = [];
                var request = {
                    user1: accountName,
                    user2: $('#user').val()
                };
                $.ajax({
                    method: "POST",
                    url: $('#httpServer').val() + '/getMessage',
                    data: request
                })
                    .done(function (response) {
                        serverMessages = JSON.parse(response);
                        $.each(serverMessages, function (i, item) {
                            var obj = item;
                            for (j in finalMessage) {
                                if (j.time == obj.time) {
                                    status = true;
                                }
                            }
                            if (status == false) {
                                var m = {
                                    from: obj.from,
                                    to: obj.to,
                                    message: obj.message,
                                    time: obj.time
                                }
                                console.log(m);
                                finalMessage.push(m);
                                $.ajax({
                                    method: "POST",
                                    url: '/JSON_MSG',
                                    data: m
                                })
                                    .done(function (response) {
                                    })
                                    .catch(function (err) {
                                        console.log(err);
                                    });
                            }
                            else { }
                        });
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            })
                .then(function () {
                    $.each(finalMessage, function (key, item) {
                        if (((item.to == accountName && item.from == $('#user').val()) || (item.to == $('#user').val() && item.from == accountName)) && (item.to != 'Public')) {
                            if (item.from == accountName) {
                                $('#messages').append($('<div class="outgoing_msg"><div class="sent_msg"><p>' + item.message + '</p><span class="time_date">' + dateFormat(item.time, "h:MM TT") + '</span></div></div>'));
                            }
                            else {
                                $('#messages').append($('<div class="incoming_msg"><div class="incoming_msg_img"><img src="https://ptetutorials.com/images/user-profile.png" alt="unknown"> </div><div class="received_msg"><div class="received_withd_msg"><p>' + item.message + '</p><span class="time_date">' + item.from + ' - ' + dateFormat(item.time, "h:MM TT") + '</span></div></div></div>'));
                            }
                        }
                        else if (item.to == 'Public' && $('#user').val() == 'Public') {
                            if (item.from == accountName) {
                                $('#messages').append($('<div class="outgoing_msg"><div class="sent_msg"><p>' + item.message + '</p><span class="time_date">' + dateFormat(item.time, "h:MM TT") + '</span></div></div>'));
                            }
                            else {
                                $('#messages').append($('<div class="incoming_msg"><div class="incoming_msg_img"><img src="https://ptetutorials.com/images/user-profile.png" alt="unknown"> </div><div class="received_msg"><div class="received_withd_msg"><p>' + item.message + '</p><span class="time_date">' + item.from + ' - ' + dateFormat(item.time, "h:MM TT") + '</span></div></div></div>'));
                            }
                        }
                        $('#messages').animate({
                            scrollTop: $('#messages')[0].scrollHeight
                        });
                    });
                })
        });
    
        socket.on('chat message', function (msg) {
            var message = JSON.parse(msg);
            if (message.from == $('#user').val() && message.to == accountName) {
                console.log('chhat asklfhasklfha');
                $('#messages').append($('<div class="incoming_msg"><div class="incoming_msg_img"><img src="https://ptetutorials.com/images/user-profile.png" alt="unknown"> </div><div class="received_msg"><div class="received_withd_msg"><p>' + message.message + '</p><span class="time_date">' + message.from + ' - ' + dateFormat(message.time, "h:MM TT") + '</span></div></div></div>'));
                $('#messages').animate({
                    scrollTop: $('#messages')[0].scrollHeight
                });
            }
            $.ajax({
                method: "POST",
                url: '/JSON_MSG',
                data: message
            })
                .done(function (response) {
                    console.log('Message added using chat message');
                })
                .catch(function (err) {
                    console.log(err);
                });
        });
    
        socket.on('connectedUsers', function (users) {
            $('#userProfile').html($(''));
            onlineUsers = [];
            var uniqueNames = [];
            $.each(users, function (i, el) {
                if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
            });
            onlineUsers = uniqueNames;
            $.each(onlineUsers, function (i, item) {
                if (item != accountName) {
                    if (item != "") {
                        $('#userProfile').append($('<div class="chat_list active_chat"> <div class="chat_people"><div class="chat_img"><img src="https://ptetutorials.com/images/user-profile.png" alt="' + item + '"> </div><div class="chat_ib"><a href="/messages/' + item + '"<h5>' + item + '</h5></a></div></div></div>'));
                    }
                }
            })
        });
    
        $('form').submit(function () {
            var message = {
                from: accountName,
                to: $('#user').val(),
                message: $('#m').val(),
                time: new Date()
            };
            $('#messages').append($('<div class="outgoing_msg"><div class="sent_msg"><p>' + $('#m').val() + '</p><span class="time_date">' + dateFormat(new Date(), "h:MM TT") + '</span></div></div>'));
            socket.emit('chat message', JSON.stringify(message));
            $('#m').val('');
            $('#messages').animate({
                scrollTop: $('#messages')[0].scrollHeight
            });
            return false;
        });
        var uniqueNames = [];
        $.getJSON("/chatdb.json", function (data) {
            var items = [];
            $.each(data, function (i, el) {
                if ($.inArray(el.from, uniqueNames) === -1) uniqueNames.push(el.from);
            });
            $.each(uniqueNames, function (key, item) {
                if (item != accountName) {
                    if (item != "" && item != undefined) {
                        $('#userProfile').append($('<div class="chat_list active_chat"> <div class="chat_people"><div class="chat_img"><img src="https://ptetutorials.com/images/user-profile.png" alt="' + item + '"> </div><div class="chat_ib"><a href="/messages/' + item + '"<h5>' + item + '</h5></a></div></div></div>'));
                    }
                }
            });
        });
        */



});
function makePayment(amount) {
    var amountValues = amount.split(" ");
    if (amountValues[2] != $('#user').val()) {
        alert('This payment request is not for you and you can not make this payment');
    } else {
        var request = {
            account: $('#user').val(),
            amount: amountValues[0],
            currency: amountValues[1]
        };
        $.ajax({
            method: "POST",
            url: '/walletSend',
            data: request
        })
            .then(function (response) {
                return false;
            })
    }
}


function deleteMessage() {
    $("#deleteMessage").hide();
    alert('This feature do not hide this message?');
};

function deleteMe(id) {
    if (confirm("Do you want to delete this message? It will delete only for unseen messages.")) {
        var request = {
            id: id
        };
        $.ajax({
            method: "POST",
            url: $('#httpServer').val() + 'deleteMessage',
            data: request
        })
            .then(function (response) {
                return false;
            })
    }

}

