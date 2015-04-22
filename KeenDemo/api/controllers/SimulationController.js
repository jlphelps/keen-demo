var Keen = require('keen-js');
var async = require('async');
var Random = require('random-js');

module.exports = {
    getKeenClient: function(project_id, write_key) {
        var client = new Keen({
            projectId: project_id,   // String (required always)
            writeKey: write_key,     // String (required for sending data)
            protocol: "https",              // String (optional: https | http | auto)
            host: "api.keen.io/3.0",        // String (optional)
            requestType: "jsonp"            // String (optional: jsonp, xhr, beacon)
        });

        return client;
    },
    postSimulate: function(req, res){
        var keen_client = this.getKeenClient(req.body.project_id, req.body.write_key);
        var buy_success_rate = req.body.buy_success_rate; // buy_success_rate/10 = % of people who buy

        async.times(1000, function(n, next) {
            var engine = Random.engines.nativeMath; // because readbility
            var client_id = Random.string()(engine, 10);

            // I realize this is all hard-coded and timestamps will make no sense, but for demo purposes this is fine
            var object_to_send = {
                item: 'widget',
                name: Random.string()(engine, 6),
                email: Random.string()(engine, 6) + '@' + Random.string()(engine, 6) + '.com',
                widgets: Random.integer(1, 5)(engine),
                keen: {
                  timestamp: new Date().toISOString()
                }
            };

            async.parallel([
                function(parallel_done) {
                    keen_client.addEvents({
                        pageviews: [
                            {
                                client_id: client_id,
                                keen: {
                                  timestamp: new Date().toISOString()
                                }
                            }
                        ],
                    }, function(err, res){
                        if (err) console.log(err);
                    });
                    
                    parallel_done();
                },
                function(parallel_done) { // register their pageview and name & email focus/blurs
                    if (Random.integer(1, 10)(engine) <= buy_success_rate + 4) return parallel_done(); // eh

                    keen_client.addEvents(
                        {
                            focus_name: [object_to_send],
                            blur_name: [object_to_send],
                            focus_email: [object_to_send],
                            blur_email: [object_to_send],
                        },
                        function(err, res){
                            if (err) console.log(err);

                        });

                    parallel_done();
                },
                function(parallel_done) { // did they buy?  if so, register widget focus/blur and purchase
                    if (Random.integer(1, 10)(engine) <= buy_success_rate) return parallel_done();

                    keen_client.addEvents(
                        {
                            focus_widgets: [object_to_send],
                            blur_widgets: [object_to_send],
                            purchases: [object_to_send]
                        },
                        function(err, res) {
                            if (err) console.log(err);
                        });

                        parallel_done();
                },
            ], function(err){ // done with this batch
                next(err);
            });

        }, function(err){ //finally, all done
            if (err) console.log(err);
            res.send(
                {
                    error: err,
                    success: true
                }
            );
        });
    }
}
