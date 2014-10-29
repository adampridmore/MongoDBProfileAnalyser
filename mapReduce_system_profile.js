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
		queryKeys: queryKeys
	};

	emit(key, {
		count: 1,
		millis: this.millis,
		nscanned: this.nscanned,
		nreturned: this.nreturned,
	});
};

var reduce = function(key, values) {
	var aggregate = {
		count: 0,
		millis: 0,
		nscanned: 0,
		nreturned: 0
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
	return value;
}

function main(){
	doProcessing();

	printTopQueries();
}

function doProcessing(){
	var namespaceAndCount = getTopCollectionNamespaces();

	printjson(namespaceAndCount);

	db.mr_systemProfile.drop();

	namespaceAndCount.forEach(runMapReduce);
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

function getTopCollectionNamespaces(){
	var p = [{
		$match: {
			op : "query"
		}
	},{
		$group: {
			_id: "$ns",
			count: {$sum: 1}
		}
	},{
		$project:{
			_id: 0,
			namespace : "$_id",
			queryCount: "$count"
		}
	},{
		$sort: {
			queryCount : -1
		}
	},{
		$limit: 10
	}];

	var r = db.system_profile.aggregate(p);
	
	return r.result;
}

function runMapReduce(setting){
	printjson({
		starting: true,
		timestamp: new Date(),
		setting: setting
	});

	var query = {
		op: 'query',
		ns : setting.namespace
	};

	var options = {
		out: {
			merge: 'mr_systemProfile'
		},
		scope: {
			namespace : setting.namespace
		},
		query: query,
		finalize: finalize
	};

	db.system_profile.mapReduce(map, reduce, options);
	
	printjson({
		done: true,
		timestamp: new Date(),
		setting: setting
	});
}

main();