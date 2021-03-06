/**
 * This panel shows the group member list
 */
upro.view.mediators.GroupMemberListPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath, menuIndex)
   {
      $super(upro.view.mediators.GroupMemberListPanelMediator.NAME, null);

      this.panelId = panelId;
      this.menuPath = menuPath;
      this.menuIndex = menuIndex;

      this.memberList = null;
      this.banButton = null;

      this.selectionTimer = upro.sys.Timer.getSingleTimer(this.onSelectionTimer.bind(this));
   },

   onRegister: function()
   {
      var uiMediator = this.facade().retrieveMediator(upro.view.mediators.UiMediator.NAME);
      var panel = $(this.panelId);
      var dimension = panel.getDimensions();

      this.uiBase = uki(
      {
         view: 'Box',
         rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
         anchors: 'left top right bottom',
         id: 'groupMemberListPanel_base',
         childViews: [
         {
            view: 'Button',
            rect: '0 0 ' + (dimension.width) + ' 25',
            anchors: 'left top right',
            text: upro.res.text.Lang.format("panels.group.members.ban.command"),
            id: 'groupMemberList_ban'
         },
         {
            view: 'ScrollPane',
            rect: '0 30 ' + (dimension.width) + ' ' + (dimension.height - 30),
            anchors: 'left top right bottom',
            textSelectable: false,
            style:
            {
               'border-style': 'solid',
               'border-width': '2px',
               'border-color': '#704010'
            },
            childViews: [
            {
               view: 'List',
               rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height - 30),
               anchors: 'top left right bottom',
               id: 'groupMemberList_list',
               rowHeight: 36,
               multiselect: true,
               style:
               {
                  fontSize: '12px'
               },
               render:
               {
                  render: this.listRenderer.bind(this),
                  setSelected: this.setSelected.bind(this)
               }
            } ]
         } ]
      });
      this.uiBase.attachTo(panel);

      var base = uki('#groupMemberListPanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, this.menuIndex, upro.res.menu.IconData.GroupMembers,
            upro.res.text.Lang.format("panels.group.member.list.menuLabel"), "groupMemberList", base);

      this.memberList = uki('#groupMemberList_list')[0];
      this.banButton = uki('#groupMemberList_ban')[0];
      this.banButton.disabled(true);
      this.banButton.bind('click', this.onBanButton.bind(this));
   },

   getImageForBody: function(listEntry)
   {
      var link = "https://image.eveonline.com/Character/" + listEntry.bodyName.getId() + "_32.jpg";

      return link;
   },

   getImageForOwnership: function(isOwner)
   {
      var image = upro.res.ImageData.Transparent;

      if (isOwner)
      {
         image = upro.res.ImageData.Owner;
      }

      return image;
   },

   listRenderer: function(data, rect, index)
   {
      var result = '';

      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:32px;">' + '<div style="height:32px;">' + '<img style="height:32px;" src="'
            + this.getImageForBody(data) + '">' + '</img></div>' + '</td>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">' + '<img style="height:16px;" src="'
            + this.getImageForOwnership(data.isOwner) + '">' + '</img></div>' + '</td>';
      result += '<td>' + data.bodyName.getName() + '</td>';
      result += '</tr></table>';

      return result;
   },

   setSelected: function(container, data, state, hasFocus)
   {
      container.style['font-weight'] = state ? 'bold' : 'normal';
      container.style['background'] = state ? '#704010' : '';

      this.selectionTimer.start(50);
   },

   refillMemberList: function()
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);
      var group = groupProxy.getSelectedGroup();
      var data = [];
      var selectedIds = this.getSelectedIds();
      var i = 0;
      var toSelect = [];

      if (group)
      {
         var bodyRegisterProxy = this.facade().retrieveProxy(upro.model.proxies.BodyRegisterProxy.NAME);

         group.forEachMember(function(characterId)
         {
            var interest =
            {
               scope: "Character",
               id: characterId
            };
            var listEntry =
            {
               isOwner: group.isInterestAllowedControl(interest),
               bodyName: bodyRegisterProxy.getBodyName("Character", characterId)
            };

            data.push(listEntry);
         });
         data.sort(function(listEntryA, listEntryB)
         {
            return listEntryA.bodyName.getName().localeCompare(listEntryB.bodyName.getName());
         });
      }

      data.forEach(function(entry)
      {
         if (selectedIds.indexOf(entry.bodyName.getId()) >= 0)
         {
            toSelect.push(i);
         }
         i++;
      });

      this.memberList.data(data);
      this.memberList.selectedIndexes(toSelect);
      this.memberList.parent().layout();
   },

   onBanButton: function()
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);

      if (!this.banButton.disabled())
      {
         var notifyBody =
         {
            id: groupProxy.getSelectedGroupId(),
            characters: this.getSelectedIds()
         };

         this.facade().sendNotification(upro.app.Notifications.BanGroupMembersRequest, notifyBody);
      }
   },

   getSelectedIds: function()
   {
      return this.memberList.selectedRows().map(function(entry)
      {
         return entry.bodyName.getId();
      });
   },

   onNotifyGroupSelected: function(group)
   {
      this.refillMemberList();
   },

   onNotifyKnownCharactersChanged: function()
   {
      // this could be made better: only refill if a character changed that is currently displayed...
      this.refillMemberList();
   },

   onSelectionTimer: function()
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);
      var group = groupProxy.getSelectedGroup();
      var selectionEmpty = this.memberList.selectedRows().length == 0;

      this.banButton.disabled(selectionEmpty || !group || !group.isClientAllowedControl());
   }
});

upro.view.mediators.GroupMemberListPanelMediator.NAME = "GroupMemberListPanel";
