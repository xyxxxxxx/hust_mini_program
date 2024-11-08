// app.js
App({
    onLaunch:function () {
        if (!wx.cloud) {
            console.error("缺少云开发环境");
        } else {
            wx.cloud.init({
                env: 'cloudprogram-6gp4o24r5950f76c',
                traceUser: true,
            });
        }
        this.globaData = {};
    }
})
