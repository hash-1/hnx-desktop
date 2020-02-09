$(document).ready(function () {
    var request = {}
    $.ajax({
        type: "POST",
        url: localStorage['endpoint'] +'wallet/getTransactions',
        headers: {
            'token': localStorage['token']
        },
        data: request
    }).then(function (response) {
        $.each(response, function (i, item) {
            var log = JSON.parse(item.log);
            if(log.json){
                $('#tnx').append('<div class="card text-white bg-dark mb-3" style="max-width: 18rem;"><div class="card-header">'+ item.time+ '</div><div class="card-body"><h5lass="card-title">'+log.json.message+ '</h5><p class="card-text">Sender: '+item.from+'<br/>Receiver: '+ item.to+'<br/>Message: '+log.json.error.details[0].message+'<br/> Error code: '+log.json.error.code+'</p></div></div>');
            }
            else
            $('#tnx').append('<div class="card text-white bg-dark mb-3" style="max-width: 18rem;"><div class="card-header">'+ log.processed.block_time+ '</div><div class="card-body"><h5lass="card-title">'+log.processed.action_traces[0].act.data.quantity+ '</h5><p class="card-text">Sender: '+log.processed.action_traces[0].act.data.from+'<br/>Receiver: '+ log.processed.action_traces[0].act.data.to+'<br/>TnxId: '+log.transaction_id+'<br/>Block_Num: '+log.processed.block_num+'</p></div></div>');
        });
    })
})