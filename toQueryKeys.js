var toQueryKeys = function(query){
    var keys = {};

    for(var keyName in query){
        var keyValue = query[keyName];

        if (keyName === "$in"){
            return {$in: 1};
        } else if (keyValue instanceof ObjectId || keyValue instanceof Date){
            keys[keyName] = 1;
        } else if (typeof(keyValue) === 'object'){
            keys[keyName] = toQueryKeys(keyValue);
        } else {
            keys[keyName] = 1;
        }
    }

    return keys;
};
