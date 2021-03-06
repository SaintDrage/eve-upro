upro.model.proxies.UserSettingsProxy = Class.create(upro.model.proxies.AbstractProxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.UserSettingsProxy.NAME);

      this.activeGalaxy = null;

      this.ignoredSolarSystems = [ 30000142 ]; // Jita

      this.routingCapabilities =
      {
         jumpBridges:
         {
            inUse: false
         },
         jumpGates:
         {
            inUse: false
         },
         jumpDrive:
         {
            inUse: false,
            range: 0.0
         },
         wormholes:
         {
            inUse: false
         }
      };

      this.routingRules = {};

      this.registerRoutingRule("minSecurity", upro.nav.finder.PathFinderCostRuleMinSecurity);
      this.registerRoutingRule("maxSecurity", upro.nav.finder.PathFinderCostRuleMaxSecurity);
      this.registerRoutingRule("jumps", upro.nav.finder.PathFinderCostRuleJumps);
      this.registerRoutingRule("jumpFuel", upro.nav.finder.PathFinderCostRuleJumpFuel);
   },

   registerRoutingRule: function(ruleType, pathFinderConstructor)
   {
      this.routingRules[ruleType] = new upro.model.UserRoutingRule(ruleType, pathFinderConstructor);
   },

   onRegister: function()
   {
      this.registerBroadcast(upro.data.clientBroadcastEvents.CharacterActiveGalaxy.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.CharacterIgnoredSolarSystems.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.CharacterRoutingCapabilities.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.CharacterRoutingRules.name);
   },

   onRemove: function()
   {
      this.notifyActiveGalaxyChanged(undefined);
   },

   getActiveGalaxy: function()
   {
      return this.activeGalaxy;
   },

   setActiveGalaxy: function(galaxyId)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.SetActiveGalaxy.name,
      {
         galaxyId: +galaxyId
      });
   },

   onCharacterActiveGalaxy: function(broadcastBody)
   {
      this.activeGalaxy = broadcastBody.galaxyId;
      this.notifyActiveGalaxyChanged(this.activeGalaxy);
   },

   notifyActiveGalaxyChanged: function(galaxyId)
   {
      this.facade().sendNotification(upro.app.Notifications.ActiveGalaxyChanged, galaxyId);
   },

   onCharacterRoutingCapabilities: function(broadcastBody)
   {
      this.routingCapabilities = broadcastBody;
      this.onRoutingCapabilitiesChanged();
   },

   onRoutingCapabilitiesChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.UserRoutingCapabilitiesChanged);
   },

   getRoutingCapJumpBridgesInUse: function()
   {
      return this.routingCapabilities.jumpBridges.inUse;
   },

   toggleRoutingCapJumpBridges: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.SetRoutingCapabilityJumpBridges.name,
      {
         inUse: !this.getRoutingCapJumpBridgesInUse()
      });
   },

   getRoutingCapJumpGatesInUse: function()
   {
      return this.routingCapabilities.jumpGates.inUse;
   },

   toggleRoutingCapJumpGates: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.SetRoutingCapabilityJumpGates.name,
      {
         inUse: !this.getRoutingCapJumpGatesInUse()
      });
   },

   getRoutingCapJumpDriveInUse: function()
   {
      return this.routingCapabilities.jumpDrive.inUse;
   },

   toggleRoutingCapJumpDrive: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.SetRoutingCapabilityJumpDrive.name,
      {
         inUse: !this.getRoutingCapJumpDriveInUse()
      });
   },

   getRoutingCapWormholesInUse: function()
   {
      return this.routingCapabilities.wormholes.inUse;
   },

   toggleRoutingCapWormholes: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.SetRoutingCapabilityWormholes.name,
      {
         inUse: !this.getRoutingCapWormholesInUse()
      });
   },

   getRoutingCapJumpDriveRange: function()
   {
      return this.routingCapabilities.jumpDrive.range;
   },

   /**
    * Steps the range of the jump drive capability
    * 
    * @param increment whether to increment
    */
   stepRoutingCapJumpDriveRange: function(increment)
   {
      var rangeStep = upro.model.RoutingCapabilities.jumpDrive.rangeStep;
      var value = this.getRoutingCapJumpDriveRange() + (increment ? rangeStep : -rangeStep);
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.SetRoutingCapabilityJumpDrive.name,
      {
         range: value
      });
   },

   onCharacterIgnoredSolarSystems: function(broadcastBody)
   {
      this.ignoredSolarSystems = broadcastBody.ignoredSolarSystems;
      this.onIgnoredSolarSystemsChanged();
   },

   onIgnoredSolarSystemsChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.UserIgnoredSolarSystemsChanged,
            this.getIgnoredSolarSystemIds());
   },

   toggleIgnoredSolarSystem: function(solarSystemId)
   {
      this.setIgnoredSolarSystemsIgnoreState(!this.isSolarSystemIgnored(solarSystemId), [ solarSystemId ]);
   },

   setIgnoredSolarSystemsIgnoreState: function(ignore, solarSystemIdList)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.SetIgnoredSolarSystem.name,
      {
         solarSystemIds: solarSystemIdList,
         ignore: ignore
      });
   },

   /**
    * Returns an array of solar system id entries that should be ignored
    * 
    * @return an array of solar system id entries
    */
   getIgnoredSolarSystemIds: function()
   {
      return this.ignoredSolarSystems;
   },

   /**
    * @param solarSystemId the ID to look for
    * @returns {Boolean} true if ignored
    */
   isSolarSystemIgnored: function(solarSystemId)
   {
      return this.ignoredSolarSystems.indexOf(solarSystemId) >= 0;
   },

   onCharacterRoutingRules: function(broadcastBody)
   {
      for ( var ruleName in broadcastBody)
      {
         var rawData = broadcastBody[ruleName];
         var rule = this.routingRules[ruleName];

         rule.index = rawData.index;
         rule.inUse = rawData.inUse;
         rule.parameter = rawData.parameter;
      }
      this.onRoutingRulesChanged();
   },

   /**
    * Callback on changed routing rules
    */
   onRoutingRulesChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.UserRoutingRulesChanged, this.getRoutingRules());
   },

   /**
    * Returns the routing rules
    * 
    * @return the routing rules
    */
   getRoutingRules: function()
   {
      var result = [];

      for ( var ruleType in this.routingRules)
      {
         result.push(this.routingRules[ruleType]);
      }
      result.sort(function sortByIndex(a, b)
      {
         return a.getIndex() - b.getIndex();
      });

      return result;
   },

   /**
    * Toggles the InUse parameter of the routing rule identified by ruleType
    * 
    * @param ruleType to modify
    */
   toggleRoutingRule: function(ruleType)
   {
      var rule = this.routingRules[ruleType];

      if (rule)
      {
         var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

         sessionProxy.sendRequest(upro.data.clientRequests.SetRoutingRuleData.name,
         {
            name: ruleType,
            inUse: !rule.inUse
         });
      }
   },

   /**
    * Steps the parameter value of the routing rule identified by ruleType
    * 
    * @param ruleType to modify
    * @param increment whether to increment
    */
   stepRoutingRuleParameter: function(ruleType, increment)
   {
      var rule = this.routingRules[ruleType];

      if (rule)
      {
         var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

         sessionProxy.sendRequest(upro.data.clientRequests.SetRoutingRuleData.name,
         {
            name: ruleType,
            parameter: rule.parameter + (increment ? rule.template.increment : -rule.template.increment)
         });
      }
   },

   /**
    * Moves the routing rule identified by ruleType
    * 
    * @param ruleType to modify
    * @param up whether it should be ordered up
    */
   moveRoutingRule: function(ruleType, up)
   {
      var rule = this.routingRules[ruleType];

      if (rule)
      {
         var oldIndex = rule.getIndex();
         var newIndex = oldIndex + (up ? -1 : 1);

         if (newIndex >= 0)
         {
            var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

            sessionProxy.sendRequest(upro.data.clientRequests.SetRoutingRuleIndex.name,
            {
               name: ruleType,
               index: newIndex
            });
         }
      }
   }

});

upro.model.proxies.UserSettingsProxy.NAME = "UserSettings";
