var client;

// An ID to identify this user.  Normally we'd probably ask the server for one but for demo purposes we'll leave it hardcoded.
var client_id = 'this_is_a_client_id';

function registerPageView() {
    client.addEvent('pageviews',
        {
            client_id: client_id,
            keen: {
              timestamp: new Date().toISOString()
            }
        },
        function(err, res){
            if (err) console.log(err);
        });
};

function createKeenObject() {
    client = new Keen({
        projectId: $('#project_id').val(),   // String (required always)
        writeKey: $('#write_key').val(),
        protocol: "https",              // String (optional: https | http | auto)
        host: "api.keen.io/3.0",        // String (optional)
        requestType: "jsonp"            // String (optional: jsonp, xhr, beacon)
      });
};

function keenCall(event_name) {
    client.addEvent(event_name,
        {
            client_id: client_id,
            item: 'widget',
            name: $("#name").val(),
            email: $("#email").val(),
            widgets: parseInt($("#num_widgets").val(), 10),
            keen: {
              timestamp: new Date().toISOString()
            }
        },
        function(err, res){
              if (err) return console.log(err);
        });
};

$(function () {
    // Only create keen object after we have a write key and project id entered
    // There is no error checking here, so be careful!
    $('#project_id').change(function(){
        if ($('#write_key').val().length > 0) {
            createKeenObject();
            registerPageView();
        }
    });

    $('#write_key').change(function(){
        if ($('#project_id').val().length > 0) {
            createKeenObject();
            registerPageView();
        }
    });

    var timeout = 2000;

    // Apologies for the copypasta, if this were something to be maintained long-term this would be much prettier.
    $('#label_name')
        .popover({
            title: 'Another Event sent!',
            content: 'You clicked out of the name field, so we let Keen know.',
            placement: 'top',
            trigger: 'manual'
        });

    $('#name')
        .focus(function(){
            keenCall('focus_name');
        })
        .popover(
                {
                    title: 'Event sent!',
                    content: 'We just told Keen that you clicked in the name field.',
                    placement: 'top',
                    trigger: 'focus'
                }
        )
        .blur(function () {
            $(this).popover('hide');
            $('#label_name').popover('show');
            keenCall('blur_name');

            setTimeout(function(){
                $('#label_name').popover('hide');
            }, timeout);
        });

    $('#label_email')
        .popover({
            title: 'Event sent!  Wahoo!',
            content: 'Done with email, so we kept Keen in the loop.',
            placement: 'top',
            trigger: 'focus'
    });

    $('#email')
        .focus(function() {
            keenCall('focus_email');
        })
        .popover({
            title: 'Another event sent!',
            content: 'We let keen know you are starting to enter an email address.',
            placement: 'top',
            trigger: 'focus'
        })
        .blur(function () {
            $(this).popover('hide');
            $('#label_email').popover('show');
            keenCall('blur_email');

            setTimeout(function(){
                $('#label_email').popover('hide');
            }, timeout);
        });

    $('#label_num_widgets')
        .popover({
            title: 'Guess what?  Event sent!',
            content: 'You are choosing the number of widgets to buy, so we updated Keen.',
            placement: 'top',
            trigger: 'manual'
        })

    $('#num_widgets')
        .focus(function(){
            keenCall('focus_widgets');
        })
        .popover({
            title: 'Event sent!  Tired of these yet?',
            content: 'We told Keen know how many widgets you selected.',
            placement: 'top',
            trigger: 'focus'
        })
        .change(function () {
            $(this).popover('hide');
            $('#label_num_widgets').popover('show');
            keenCall('blur_widgets');

            setTimeout(function(){
                $('#label_num_widgets').popover('hide');
            }, timeout);
        });
});

function buyWidget() {
    $('#widget_form_initial').addClass('hidden');
    $('#buying_widget_spinner').removeClass('hidden');

    client.addEvent("purchases",
        {
            item: 'widget',
            name: $("#name").val(),
            email: $("#email").val(),
            widgets: parseInt($("#num_widgets").val(), 10),
            keen: {
              timestamp: new Date().toISOString()
            }
        },
        function(err, res){
              if (err) return console.log(err);

              // see sample response below
              console.log(res);
              $('#buying_widget_spinner').addClass('hidden');
              $('#widget_buy_success').removeClass('hidden').show();
              $('#widget_form_initial').hide();
        });
};

function simulateVisitors(buy_success_rate) {
    var spinner;
    var success_message;
    var button;

    // yes, hard-coded for now :(
    if (buy_success_rate === 1) {
        button = $('#simulate_visitors_button');
        spinner = $('#simulate_one_spinner');
        success_message = $('#simulate_one_success');
    }

    if (buy_success_rate === 2) {
        button = $('#simulate_two_button');
        spinner = $('#simulate_two_spinner');
        success_message = $('#simulate_two_success');
    }

    button.addClass('hidden');
    spinner.removeClass('hidden');

    $.post(
        '/simulate',
        {
            write_key: $('#write_key').val(),
            project_id: $('#project_id').val(),
            buy_success_rate: buy_success_rate // buy_success_rate/10 = % of people who buy
        },
        function(data, status) {
            spinner.addClass('hidden');
            success_message.removeClass('hidden');
        },
        'json'
    );
};
