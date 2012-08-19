var schema = require('js-schema');

var commonSchemata = require('./CommonSchemata.js');
var clientRequests = require('./ClientRequests.js').clientRequests;
var clientBroadcastEvents = require('./ClientBroadcastEvents.js').clientBroadcastEvents;

var interestSchema = [
{
   scope: 'Session',
   id: String
},
{
   scope: 'Character',
   id: Number
} ];

var broadcasts =
{
   /**
    * Sent for each new client connection
    */
   ClientConnected:
   {
      name: 0,
      header:
      {
         schema:
         {
            type: String
         },
         isValid: null
      },
      body:
      {
         schema:
         {
            sessionId: String,
            responseQueue: String,
            user: commonSchemata.userSchema
         },
         isValid: null
      }
   },

   /**
    * Sent for each lost client connection
    */
   ClientDisconnected:
   {
      name: 0,
      header:
      {
         schema:
         {
            type: String
         },
         isValid: null
      },
      body:
      {
         schema:
         {
            sessionId: String,
            user: commonSchemata.userSchema
         },
         isValid: null
      }
   },

   /**
    * Caused periodically by EVE data related clients, based on IGB header data. Can come more than once with the same
    * data when there are several IGB tabs open.
    */
   EveStatusUpdateRequest:
   {
      name: 0,
      header:
      {
         schema:
         {
            type: String,
            sessionId: String
         },
         isValid: null
      },
      body:
      {
         schema:
         {
            eveInfo:
            {
               trusted: Boolean,
               characterId: Number,
               characterName: String,
               corporationId: Number,
               corporationName: String,
               solarSystemId: Number
            }
         },
         isValid: null
      }
   }
};

var standardClientRequestHeader =
{
   schema:
   {
      type: String,
      sessionId: String
   },
   isValid: null
};

// Register all client requests.
for ( var name in clientRequests)
{
   var request = clientRequests[name];
   var requestBroadcastName = 'ClientRequest' + name;

   broadcasts[requestBroadcastName] =
   {
      name: 0,
      header: standardClientRequestHeader,
      body: request.body
   };
}

var standardBroadcastEventHeader =
{
   schema:
   {
      type: String,
      interest: Array.of(interestSchema)
   },
   isValid: null
};

// Register all broadcast events.
for ( var name in clientBroadcastEvents)
{
   var event = clientBroadcastEvents[name];

   broadcasts[name] =
   {
      name: 0,
      header: standardBroadcastEventHeader,
      body: event.body
   };
}

// now iterate through all broadcasts and fill any missing data
for ( var name in broadcasts)
{
   var broadcast = broadcasts[name];

   if (broadcast.name == 0)
   {
      broadcast.name = name;
   }
   if (!broadcast.header.isValid)
   {
      broadcast.header.isValid = schema(broadcast.header.schema);
   }
   if (!broadcast.body.isValid)
   {
      broadcast.body.isValid = schema(broadcast.body.schema);
   }
}

module.exports.Broadcasts = broadcasts;
