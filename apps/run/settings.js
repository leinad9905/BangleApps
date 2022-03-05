(function(back) {
  const SETTINGS_FILE = "run.json";
  var ExStats = require("exstats");
  var statsList = ExStats.getList();
  statsList.unshift({name:"-",id:""}); // add blank menu item
  var statsIDs = statsList.map(s=>s.id);

  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage')
  let settings = Object.assign({
    record: true,
    B1: "dist",
    B2: "time",
    B3: "pacea",
    B4: "bpm",
    B5: "step",
    B6: "caden",
    paceLength: 1000, // TODO: Default to either 1km or 1mi based on locale
    notify: {
      dist: {
        increment: 0,
        notification: [],
      },
      steps: {
        increment: 0,
        notification: [],
      },
      time: {
        increment: 0,
        notification: [],
      },
    },
  }, storage.readJSON(SETTINGS_FILE, 1) || {});
  function saveSettings() {
    storage.write(SETTINGS_FILE, settings)
  }

  function getBoxChooser(boxID) {
    return {
      min: 0, max: statsIDs.length-1,
      value: Math.max(statsIDs.indexOf(settings[boxID]),0),
      format: v => statsList[v].name,
      onchange: v => {
        settings[boxID] = statsIDs[v];
        saveSettings();
      },
    }
  }

  var menu = {
    '': { 'title': 'Run' },
    '< Back': back,
  };
  if (WIDGETS["recorder"])
    menu[/*LANG*/"Record Run"] = {
      value : !!settings.record,
      format : v => v?/*LANG*/"Yes":/*LANG*/"No",
      onchange : v => {
        settings.record = v;
        saveSettings();
      }
    };
  var vibPatterns = [/*LANG*/"Off", ".", "-", "--", "-.-", "---"];
  var vibTimes = [[], [100], [500],[500,500],[500,100,500],[500,500,500]];
  menu[/*LANG*/"Time Notifctn"] = {
    value: Math.max(0,vibPatterns.indexOf(settings.timeNotification)),
      min: 0, max: vibPatterns.length,
      format: v => vibPatterns[v]||"Off",
      onchange: v => {
        settings.notify.time.notification = vibTimes[v];
        saveSettings();
      }
  }
  menu[/*LANG*/"Dist Notifctn"] = {
    value: Math.max(0,vibPatterns.indexOf(settings.distNotification)),
      min: 0, max: vibPatterns.length,
      format: v => vibPatterns[v]||"Off",
      onchange: v => {
        settings.notify.dist.notification = vibTimes[v];
        saveSettings();
      }
  }
  menu[/*LANG*/"Step Notifctn"] = {
    value: Math.max(0,vibPatterns.indexOf(settings.stepNotification)),
      min: 0, max: vibPatterns.length,
      format: v => vibPatterns[v]||"Off",
      onchange: v => {
        settings.notify.steps.notification = vibTimes[v];
        saveSettings();
      }
  }
  ExStats.appendMenuItems(menu, settings, saveSettings);
  Object.assign(menu,{
    'Box 1': getBoxChooser("B1"),
    'Box 2': getBoxChooser("B2"),
    'Box 3': getBoxChooser("B3"),
    'Box 4': getBoxChooser("B4"),
    'Box 5': getBoxChooser("B5"),
    'Box 6': getBoxChooser("B6"),
  });
  E.showMenu(menu);
})
