var map = function() {
	var queryKeys = {};
	if (this.query){
		for(var queryKey in this.query.query){
			queryKeys[queryKey] = true;
		}
	}else{
		queryKeys = "none";
	}

	var key = {
		ns: this.ns,
		op: this.op,
		queryKeys: queryKeys,
	};

	emit(key, {
		count: 1,
		millis: this.millis,
		nscanned: this.nscanned,
		nreturned: this.nreturned,
		exampleQuery: this.query,
	});
};

var reduce = function(key, values) {
	var aggregate = {
		count: 0,
		millis: 0,
		nscanned: 0,
		nreturned: 0,
		exampleQuery: values[0].exampleQuery,
	}

	values.forEach(function(value){
		aggregate.count+=value.count;
		aggregate.millis+=value.millis;
		aggregate.nscanned+=value.nscanned;
		aggregate.nreturned+=value.nreturned;
	});

	return aggregate;
};

var finalize = function(key, value){
	value.nscanned_nreturned_diff = value.nscanned - value.nreturned;
	value.sampleDurationMs = durationMs;
	value.queriesPerSecond = (value.count / (durationMs / 1000)).toFixed(0);
	value.nreturned_nscanned_ratio = (value.nreturned / value.nscanned).toFixed(3);

	return value;
}

function main(){
	runMapReduce();

	printTopQueries();
}

function printTopQueries(){
	printTopBy({"value.count": -1}, "Top queries by query count");
	printTopBy({"value.millis": -1}, "Top queries by query millis");
	printTopBy({"value.nscanned_nreturned_diff": -1}, "Top queries by nscanned_nreturned_diff");
}

function printTopBy(sortKey, title){
	var p = [{
  		$sort:sortKey
	},{
  		$limit: 3
	}];
	var r = db.mr_systemProfile.aggregate(p);
	printjson({
		type: title,
		result: r
	});
}

function runMapReduce(setting){
	var durationMs = getSampleDurationMs();

	printjson({
		starting: true,
		timestamp: new Date(),
	});

	var query = {
		op: 'query'
	};

	var options = {
		out: {
			replace: 'mr_systemProfile'
		},
		query: query,
		scope : {
			durationMs: durationMs
		},
		finalize: finalize
	};

	db.system_profile.mapReduce(map, reduce, options);
	
	printjson({
		done: true,
		timestamp: new Date(),
	});
}

function getSampleDurationMs(){
	var r = db.system_profile.aggregate([{
	    $group:{
        	_id: null,
        	min: {$min: "$ts"},
        	max: {$max: "$ts"}
    	}
	}]);

	var value = r.result[0];

	return value.max.getTime() - value.min.getTime();
}

main();