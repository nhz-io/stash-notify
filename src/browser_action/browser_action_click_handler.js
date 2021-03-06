/**
 * Created by Nitai J. Perez
 * nitai.perez@ironsrc.com
 * 16/07/2015.
 */

var bg = chrome.extension.getBackgroundPage();

document.addEventListener('DOMContentLoaded', function () {

    var clickMap = [
        {
            select: 'stash',
            action: function () {
                chrome.tabs.create({
                    url: bg.host()
                });
            }
        },
        {
            select: 'refresh',
            action: function () {
                bg.go(true, false);
            }
        },
        {
            select: 'snooze',
            action: function () {
                localStorage['snooze_all'] = Date.now() + Number(localStorage["_snooze_duration"].replace(/"/g, ''));
                bg.dismissAllNotifications();
            }
        },
        {
            select: 'options',
            action: function () {
                chrome.tabs.create({
                    url: "/src/options_custom/index.html"
                });
            }
        }
    ];

    clickMap.forEach(function (btn) {
        if (document.getElementById(btn.select)) {
            document.getElementById(btn.select).addEventListener('click', btn.action);
        }
    });
});
