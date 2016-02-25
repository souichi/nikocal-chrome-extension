(() => {
  const CHECK_INTERVAL = 5;
  const KEY_NIKOCAL_DATE = 'nikocal_date'
  const NOTIFY_NIKOCAL_HOUR = 18;
  const NOTIFY_NIKOCAL_MINUTE = 50;
  const NOTIFY_NIKOCAL_SECOND = 0;

  const NOTIFY_TIMEPRO_WEEK = 1;
  const NOTIFY_TIMEPRO_HOUR = 10;
  const NOTIFY_TIMEPRO_MINUTE = 0;
  const NOTIFY_TIMEPRO_SECOND = 0;
  
  interface INikonikoData {
    notifyDate: number;
    isNotify: boolean;
  }
  
  function show() {
    chrome.browserAction.setIcon({ path: 'icon1.png' });
    chrome.browserAction.setBadgeText({ text: 'open' });
    chrome.browserAction.setBadgeBackgroundColor({ color: [200, 0, 0, 255] });
  }

  function hide() {
    chrome.browserAction.setIcon({ path: 'icon2.png' });
    chrome.browserAction.setBadgeText({ text: '' });
  }
  
  /**
   * 取得した日で新しいデータ作成
   */
  function getNewNicoCalData(): INikonikoData {
    var date = new Date();
    date.setHours(NOTIFY_NIKOCAL_HOUR);
    date.setMinutes(NOTIFY_NIKOCAL_MINUTE);
    date.setSeconds(NOTIFY_NIKOCAL_SECOND);
    return {
      notifyDate: date.getTime(),
      isNotify: false
    };
  } 
  
  function getNikoCalDataAsyc(): Promise<INikonikoData> {
    return new Promise<INikonikoData>((resolve: (nikocalData: INikonikoData) => void) => {
      chrome.storage.local.get('nikocal_date', (items: { [key: string]: any }) => {
        var nikocalData = items['nikocal_date'];
        if(!nikocalData) {
          nikocalData = getNewNicoCalData();
          setNikoCalDataAsyc(nikocalData);
        }
        resolve(nikocalData);
      });
    });
  }
  
  function setNikoCalDataAsyc(nikocalData: INikonikoData): void {
    chrome.storage.local.set({
      'nikocal_date': nikocalData
    });
  }

  function showNikocalNotification() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon2.png',
      title: 'ニコニコカレンダーよりお知らせ',
      message: 'そろそろ入力したら？'
    });
    chrome.notifications.onClicked.addListener((notificationId: string) => {
      chrome.tabs.create({
        url: 'http://172.24.212.83:3001/'
      });
      chrome.notifications.clear(notificationId);
      getNikoCalDataAsyc().
        then((nikocalData: INikonikoData) => {
          nikocalData.isNotify = true;
          setNikoCalDataAsyc(nikocalData);
        });
    });
  }

  function showWBSNotification() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon2.png',
      title: 'ニコニコカレンダーよりお知らせ',
      message: 'TimeProとWBSの入力はした？'
    });
    chrome.notifications.onClicked.addListener((notificationId: string) => {
      chrome.tabs.create({
        url: 'http://timepro/xgweb/login.asp/'
      });
      chrome.notifications.clear(notificationId);
    });
  }

  function check() {
    getNikoCalDataAsyc().
      then((nikocalData: INikonikoData) => {
        var notifyDate = new Date(nikocalData.notifyDate);
        var notifyMonth = notifyDate.getMonth();
        var notifyDay = notifyDate.getDate();
        var currentDate = new Date();
        var currentMonth = currentDate.getMonth();
        var currentDay = currentDate.getDate();
        if(notifyMonth != currentMonth || notifyDay < currentDay) {
          nikocalData = getNewNicoCalData();
          setNikoCalDataAsyc(nikocalData);
          hide();
        } else if(notifyDate < currentDate) {
          show();
          if(!nikocalData.isNotify) {
            showNikocalNotification();
          }
        } else {
          hide();
        }
      });
  }
  chrome.alarms.create('nikocal', { periodInMinutes: CHECK_INTERVAL });
  chrome.alarms.onAlarm.addListener(function(alarm: chrome.alarms.Alarm) {
    if (alarm.name === 'nikocal') {
      check();
    }
  });
  check();
})();

