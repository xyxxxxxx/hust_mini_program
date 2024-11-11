Page({
  data: {
    origin: "",
    destination: "",
    currentLocation: "",
    acceptDataWhere: "",

    originResults: [],
    destinationResults: [],
    focusOrigin: false,
    focusDestination: false,
    key: "XFLBZ-4BZK4-ONVUC-K3GGI-3OYJ5-IRF52",
 
    searchTop: 0,
    searchLeft: 20,
    containerHeight: 0,
    startY: 0,
    debounceTimer: null,

    enable3d: false,
    showLocation: true,
    showCompass: false,
    enableOverlooking: false,
    enableZoom: true,
    enableScroll: true,
    enableRotate: false,
    drawPolygon: false,
    enableSatellite: false,
    enableTraffic: false,
    latitude: '30.873496',
    longitude: '120.131063',
    markers: [],
    circles: [],
    polylines: [],
    polygons: [],
    showDialog: false,
    currentMarker: null
  },

  onLoad: function() {
    const systemInfo = wx.getWindowInfo();
    const windowHeight = systemInfo.windowHeight;
    this.getCurrentLocation(); // 获取当前位置并设置地图
    this.setData({
      searchTop: windowHeight / 2 // 设置搜索容器的顶部位置为窗口高度的一半
    });
  },

  onReady: function() {
    const map = wx.createMapContext("map");
    map.moveToLocation();
  },

  onShow() {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.once('acceptDataWhere', (data) => {
      this.setData({
        acceptDataWhere: data.where
      }, () => {
          // 保存当前的 destination 和 origin
          let tempDestination = wx.getStorageSync('destination') || '';
          let tempOrigin = wx.getStorageSync('origin') || '';
        // 在这里判断可以确保使用的是最新的数据
        if (this.data.acceptDataWhere === "destination") {
          eventChannel.once('acceptDataFromDestinationPage', (data) => {
            this.setData({
              destination: data.destination, // 更新目的地数据
              origin: tempOrigin // 确保 origin 保持上次的值
            });
          });
        } 
        else {
          eventChannel.once('acceptDataFromOriginPage', (data) => {
            this.setData({
              origin: data.origin, // 更新出发地数据
              destination: tempDestination // 确保 destination 保持上次的值
            });
          });
        }
      });
    });
  },
  onTouchStart(e) {
    const startY = e.touches[0].clientY;
    this.setData({
      startY: startY
    });
  },

  onTouchMove(e) {
    const moveY = e.touches[0].clientY;
    const deltaY = moveY - this.data.startY;
  
    // 获取屏幕高度
    const windowHeight = wx.getWindowInfo().windowHeight;
  
    // 计算新的位置
    const newTop = this.data.searchTop + deltaY;
  
    // 限制搜索容器只在屏幕下半部分拖动
    if (newTop >= windowHeight / 2 && newTop <= windowHeight - this.data.containerHeight) {
      this.setData({
        searchTop: newTop,
        startY: moveY
      });
    }
    // 限制搜索容器的最下位置
    if (newTop < this.data.containerHeight - 100) {
      this.setData({
        searchTop: this.data.containerHeight - 100
      });
    }
  },
   
  onTouchEnd(e) {
    // 这里可以添加处理触摸结束的逻辑
    console.log("触摸结束");
  },
  
  getCurrentLocation() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          wx.getLocation({
            type: 'gcj02', // 使用 gcj02 类型
            success: (res) => {
              const { latitude, longitude } = res;
              this.setData({
                latitude,
                longitude,
                markers: [{
                  latitude,
                  longitude,
                  iconPath: '/path/to/icon.png', // 替换为实际图标路径
                  width: 30,
                  height: 30
                }]
              });
              // 如果需要，可以在这里进一步处理位置信息，例如调用地图更新等
            },
            fail: () => {
              wx.showToast({
                title: '获取当前位置失败',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showModal({
            title: '权限请求',
            content: '需要获取位置信息的权限，是否允许？',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        }
      }
    });
  },
  
  


  // 处理出发地按钮点击事件
  onOriginButtonTap() {
    wx.navigateTo({
      url: '/pages/search/originSearch/originSearch', // 替换为你的出发地页面路径
      // success: (res) => {
      //   // 向目标页面发送数据
        
      //   res.eventChannel.emit('currentLocation', { location: currentLocation });
      // }
      
    });
    console.log(this.data.destination)
    wx.setStorageSync('destination', this.data.destination);
  },
  // 处理目的地按钮点击事件
  onDestinationButtonTap() {
    wx.navigateTo({
      url: '/pages/search/destinationSearch/destinationSearch', // 替换为你的目的地页面路径
      // success: (res) => {
      //   // 向目标页面发送数据
        
      //   res.eventChannel.emit('currentLocation', { location: this.currentLocation });
      // }
    });
    console.log(this.data.origin)
    wx.setStorageSync('origin', this.data.origin);
  },

  //处理搜索按钮点击事件
  onSearch(){
    wx.navigateTo({
      url: '/pages/map/map',
      success: function (res) {
        // 使用 eventChannel 传递数据
        
      }
    })
  }
});

