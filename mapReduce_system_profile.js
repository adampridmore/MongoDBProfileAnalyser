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
		ntoreturn: this.ntoreturn
	});
};

var reduce = function(key, values) {
	var aggregate = {
		count: 0,
		millis: 0,
		nscanned: 0,
		ntoreturn: 0
	}

	values.forEach(function(value){
		aggregate.count+=value.count;
		aggregate.millis+=value.millis;
		aggregate.nscanned+=value.nscanned;
		aggregate.ntoreturn+=value.ntoreturn;
	});
	
	return aggregate;
};

function main(){
	var namespaceAndCount = getTopCollectionNamespaces();

	printjson(namespaceAndCount);
	
	namespaceAndCount.forEach(runMapReduce);
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
	var query = {
		op: 'query',
		ns : setting.namespace
	};

	var options = {
		out: {
			replace: 'mr_systemProfile_' + setting.namespace.split('.')[1]
		},
		query: query
	};

	db.system_profile.mapReduce(map, reduce, options);
	
	print(setting.namespace + ' done');
}

main();