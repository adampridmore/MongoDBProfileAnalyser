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
	
	
}


var mapReduceSettings = [{
	namespace : "customers_shared.hierarchy"
},{
	namespace : "customers_shared.asset"
},{
	namespace : "customers_shared.person"
},{
	namespace : "customers_shared.currentPositionResult"
},{
	namespace : "customers_shared.assetUtilisation"
},{
	namespace : "customers_shared.input"
},{
	namespace : "customers_shared.personUtilisation"
}];

mapReduceSettings.forEach(runMapReduce);

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
}





main();