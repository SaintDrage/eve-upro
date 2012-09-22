var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var busMessages = require('../model/BusMessages.js');

var StandardDataBroadcaster = require('../abstract-sharing-component/StandardDataBroadcaster.js');

/**
 * The state factory for group specific tasks
 */
function GroupDataBroadcaster(broadcaster, dataName)
{
   GroupDataBroadcaster.super_.call(this, broadcaster, dataName);

   /**
    * Broadcasts destroyed status of a group
    * 
    * @param groupId the ID of the group
    */
   this.broadcastGroupDestroyed = function(groupId)
   {
      var header =
      {
         type: busMessages.Broadcasts.GroupDestroyed.name,
      };
      var body =
      {
         groupId: groupId
      };

      this.broadcaster.broadcast(header, body);
   };

   this.broadcastGroupMembership = function(dataObject, addedMembers, removedMembers, interest, queueName)
   {
      var header =
      {
         type: busMessages.Broadcasts.GroupMembership.name,
         interest: interest || [
         {
            scope: 'Group',
            id: dataObject.getDocumentId()
         } ]
      };
      var body =
      {
         groupId: dataObject.getDocumentId(),
         removed:
         {
            members: removedMembers
         },
         added:
         {
            members: addedMembers
         }
      };

      this.broadcaster.broadcast(header, body, queueName);
   };
}
util.inherits(GroupDataBroadcaster, StandardDataBroadcaster);

module.exports = GroupDataBroadcaster;