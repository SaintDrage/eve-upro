/**
 * Abstract implementation of a proxy with some helper
 */
upro.model.proxies.AbstractProxy = Class.create(Proxy,
{
   initialize: function($super, name, data)
   {
      $super(name, data);
   },

   registerBroadcast: function(type)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.addBroadcastHandler(type, this['on' + type].bind(this));
   }

});
