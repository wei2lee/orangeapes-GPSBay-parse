
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

var Tracking = Parse.Object.extend("Tracking");

Parse.Cloud.define("updateMyTracking", function(request, response) {
	if(Parse.User.current() == null) {
		response.error("User not login");
		return;
	}

	var findCurrentTracking = new Parse.Query(Tracking);
	findCurrentTracking.equalTo('user', Parse.User.current()); 
	findCurrentTracking.find().done(function(results){
		var currentTracking = results.length == 0 ? new Tracking() : results[0];
		if(request.params.type != undefined && request.params.location != undefined) {
			currentTracking.set('type', request.params.type);
			currentTracking.set('location', request.params.location);
		}
		currentTracking.set('user', Parse.User.current());
		return currentTracking.save();
	}).then(function(result){
		if(result.get('type') == 0) {
			//user is a driver, return cyclist and self
			var findOtherTrackings = new Parse.Query(Tracking);
			var periodAgo = new Date(new Date().getTime() - 30*1000);
			findOtherTrackings.greaterThan('updatedAt', periodAgo);
			findOtherTrackings.notEqualTo('user', null);
			findOtherTrackings.notEqualTo('location', null);
			findOtherTrackings.notEqualTo('type', null);
			return findOtherTrackings.find();
		}else{
			//user is a cyclist, return self
			return [result]; 
		}
	}).then(function(result){
		response.success(result);
	}).fail(function(error){
		response.error(error);
	});
});

