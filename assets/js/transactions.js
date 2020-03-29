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
                $('#tnx').append('<div class="row_"> <div class="cell" data-title="Transaction ID">item.from</div><div class="cell" data-title="Output"><span>Error code: log.json.error.code <span></span></div><div class="cell" data-title="Action"><a href="#/" class="a_">View details</a></div></div>');
            }
            else
            $('#tnx').append('<div class="row_"> <div class="cell" data-title="Transaction ID">'+item.from+'</div><div class="cell" data-title="Output"><span>'+log.processed.action_traces[0].act.data.quantity+'<span></span></div><div class="cell" data-title="Action"><a href="#/" class="a_">View details</a></div></div>');
        });
    })
})