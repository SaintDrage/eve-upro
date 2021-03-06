var defaultCss = "position:absolute;z-index:100;-moz-user-focus:none;font-family:Arial,Helvetica,sans-serif;color:'#FFFFFF';";

function getBackgroundCss(opacity)
{
   // return '#423f22;opacity:0.' + opacity + ';';
   return '#423f22;'
         + ((uki.browser.cssFilter() && uki.image.needAlphaFix) ? 'filter:Alpha(opacity=' + opacity + '0);'
               : 'opacity:0.' + opacity + ';');
}

var T = '';

uki.theme.upro = uki
      .extend(
            {},
            uki.theme.Base,
            {
               backgrounds:
               {
                  'box': function()
                  {
                     return new uki.background.CssBox(defaultCss
                           + 'border:2px solid #704010;background:#423f22;'
                           + (uki.browser.cssFilter() && uki.image.needAlphaFix ? 'filter:Alpha(opacity=70);'
                                 : 'opacity:0.7;'));
                  },
                  // basic button
                  'button-normal': function()
                  {
                     return new uki.background.CssBox(defaultCss
                           + 'border:2px solid #704010;background:#423f22;'
                           + (uki.browser.cssFilter() && uki.image.needAlphaFix ? 'filter:Alpha(opacity=90);'
                                 : 'opacity:0.9;')// ,
                     // { inset: '-2 -2', zIndex: -2 }
                     );
                  },
                  list: function(rowHeight)
                  {
                     return new uki.background.Rows(rowHeight, getBackgroundCss(9) + ' ' + getBackgroundCss(8));
                  }
               },
               templates:
               {
                  'route-render': function()
                  {
                     return [
                           '<div style="height:35px;text-align:left;font-size:13px;line-height:16px;margin:2px 0;position:relative;border-bottom:1px solid #EEE;color:#333">'
                                 + '<img style="position:absolute;left:7px;top:2px;border:1px solid #CCC;width:27px;height:27px;" src="',
                           T, '" />' + '<div style="margin:0 116px 0 104px;height:32px;overflow:hidden;">', T,
                           ' &ndash; <span style="color:#999">', T,
                           '</span></div>' + '<div style="position:absolute;right:0;width:88px;top:0;">', T,
                           '<div style="color:#999">', T, '</div></div></div>' ];
                  }
               },
               styles:
               {
                  base: function()
                  {
                     return 'font-family:Arial,Helvetica,sans-serif;color:#FFFFFF;';
                  },
                  'label': function()
                  {
                     return 'font-size:12px;';
                  },
                  'button': function()
                  {
                     return 'color:#FFFFFF;text-align:center;font-weight:bold;text-shadow:0 1px 0 rgba(255,255,255,0.1);';
                  }
               }
            });
uki.theme.register(uki.theme.upro);
