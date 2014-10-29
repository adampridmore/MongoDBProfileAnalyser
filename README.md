#MongoDBProfileAnalyser

Helps query the system.profile collection in MongoDB to find the slowest / most expensive queries.

# Beta
This is very much a work in progress. It's not complete, and subject to change. 

## Getting Started

 - Grab a system profile backup with mongodump.
 - Rename the backup to system_profile.bson.
 - Restore to a local database.
 - Run the script via the mongo shell

```
mongo <hostname:port>/<databasename> mapReduce_system_profile.js
```

This will print a set of slow queries, and the query summary, as well a produce a collection called *mr_systemProfile* With one row per query type per collection.

 

