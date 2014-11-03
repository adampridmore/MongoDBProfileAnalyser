load('./Helpers/EcmaUnit.js');
load('toQueryKeys.js');

var fixture = {
	simpleQuery: function(){
		var query = {
    		"$query" : {
        		"_id" : ObjectId("5457508484ae4211a9e3402d")
    		},
    		"$readPreference" : {
        		"mode" : "secondary"
    		}
		};

		var actualKeys = toQueryKeys(query);
		var expectedKeys = {
		    "$query" : {
	        	_id: 1
	    	}, 
	    	"$readPreference" : {
			"mode" : 1
	    	}
		};

		assertKeys(expectedKeys, actualKeys);
	},

	ISODateTest : function(){
		var query = {
    		"$query" : {
        		"name" : new ISODate('2014-01-01T00:00:00Z')
    		},
		};

		var actualKeys = toQueryKeys(query);
		var expectedKeys = {
		    "$query" : {
	        	name: 1
	    	}
		};

		assertKeys(expectedKeys, actualKeys);
	},

	arrayTest : function(){
		var query = {
    		"$query" : {
        		"name" : {
        			$in: ['a', 'b']
        		}
    		},
		};

		var actualKeys = toQueryKeys(query);
		var expectedKeys = {
		    "$query" : {
	        	name: {
	        		$in: 1
	        	}
	    	}
		};

		assertKeys(expectedKeys, actualKeys);
	},
}

var assertKeys = function(expectedKeys, actualKeys){
	var expected = tojsonObject(expectedKeys);
	var actual = tojsonObject(actualKeys);
	assert.areEqual(tojsonObject(expectedKeys), tojsonObject(actualKeys));
}

var runner = new ecmaUnit.Runner();
var result = runner.run(fixture);

print(result.stringify());
