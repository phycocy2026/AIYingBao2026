App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        traceUser: true
      });
    }
  },
  globalData: {
    appName: "AI智营宝"
  }
});
