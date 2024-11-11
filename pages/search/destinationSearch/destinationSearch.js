Page({
  data: {
    destination: "", // 目的地名称
    destinationResults: [], // 用于存储目的地搜索结果
    currentLocation: "",
    historyLocations: [], // 历史位置数组
    key: "XFLBZ-4BZK4-ONVUC-K3GGI-3OYJ5-IRF52",

    latitude: '30.873496',
    longitude: '120.131063',
    // 其他数据
  },

  // 处理目的地搜索按钮点击事件
  onSearchDestination() {
    if (this.data.destination) {
      wx.showToast({
        title: `搜索目的地: ${this.data.destination}`,
        icon: 'none'
      });
      // 这里可以添加进一步的搜索逻辑
    } else {
      wx.showToast({
        title: '请输入目的地',
        icon: 'none'
      });
    }
  },
  // 目的地输入事件
  onDestinationInput(e) {
    const destination = e.detail.value;
    this.setData({ destination }); // 更新输入框的值

    // 调用搜索函数
    if (destination) {
      this.searchLocation(destination, "destination");
    } else {
      this.setData({ destinationResults: [] }); // 如果输入为空，清空结果
    }
  },

  // 搜索地址
  searchLocation(query, type) {
    wx.request({
      url: `https://apis.map.qq.com/ws/place/v1/suggestion/?location=${this.data.latitude},${this.data.longitude}&keyword=${this.data.keyword}&key=${this.data.key}&region_fix=1&get_subpois=1&policy=1`,
      method: 'GET',
      data: {
        key: this.data.key, // 确保这是有效的 API 密钥
        keyword: query,
        page_size: 15,
        output: 'json'
      },
      success: (res) => {
        console.log(res); // 打印响应，检查返回的数据
        if (res.data.status === 0) {
          if (type === "destination") {
            this.setData({ destinationResults: res.data.data });
          }
        } else {
          console.error("搜索失败:", res.data.message); // 输出错误信息
        }
      },
      fail: (error) => {
        console.error("请求失败:", error); // 输出请求失败信息
      }
    });
  },
    // 目的地按钮点击事件,选择目的地
  onDestinationButtonTap(e) {
    wx.navigateTo({
      url: '/pages/search/search', // 确保路径正确
      success: (res) => {
        // 向目标页面发送数据
        const selectedLocation = e.currentTarget.dataset.location;
        res.eventChannel.emit('acceptDataWhere', { where: "destination"});
        res.eventChannel.emit('acceptDataFromDestinationPage', { destination: selectedLocation.title });
        wx.setStorageSync('destination', selectedLocation.title);
      }
    });
    this.updateHistoryLocations(this.data.destination);
    this.saveHistoryLocations();
  },

  onCurrentButtonTap(e) {
    wx.navigateTo({
      url: '/pages/search/search', // 确保路径正确
      success: (res) => {
        // 向目标页面发送数据
        res.eventChannel.emit('acceptDataWhere', { where: "destination"});
        res.eventChannel.emit('acceptDataFromDestinationPage', { destination: this.data.currentLocation });
      }
    });
    this.updateHistoryLocations(this.data.destination);
    this.saveHistoryLocations();
  },
  onHistoryLocationTap(e) {
    const selectedLocation = e.currentTarget.dataset.location;
    // 处理点击历史位置的逻辑，比如设置为当前目的地
    this.setData({
      destination: selectedLocation
    });
    this.saveHistoryLocations();
  },

  updateHistoryLocations(location) {
    const { historyLocations } = this.data;

    // 判断是否已存在历史位置
    if (!historyLocations.includes(location)) {
      historyLocations.push(location);
      this.setData({
        historyLocations: historyLocations
      });
    }
  },
   // 选择历史位置
   onSelectLocation(e) {
    const location = e.currentTarget.dataset.location;
    this.setData({ destination: location });
    this.searchDestination(location); // 可以触发搜索
  },

  onShow() {
    // 在这里获取当前位置信息并更新到数据中
    this.getCurrentLocation();
    this.loadHistoryLocations();
  },
  //保存历史搜索信息
  saveHistoryLocations(){
    wx.setStorageSync('historyLocations', this.data.historyLocations);
  },
  //读取历史搜索信息
  loadHistoryLocations(){
    this.setData({
      historyLocations: wx.getStorageSync('historyLocations')
    });
  },

  // 获取当前位置信息（示例）
  getCurrentLocation() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          console.log('**************');
          wx.getLocation({
            type: 'gcj02', // 使用 gcj02 类型
            success: (res) => {
              const { latitude, longitude } = res;
              this.setData({
                latitude,
                longitude,
              });
              console.log('**************');
              wx.request({
                url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${this.data.latitude},${this.data.longitude}&key=${this.data.key}&get_poi=1`,
                method: 'GET',
                success: (response) => {
                  if (response.data.status === 0) {
                    const location = response.data.result.address; // 获取地址
                    const pois = response.data.result.pois; // 获取兴趣点列表
                    let detailedAddress = location;
                    // 如果有兴趣点，选择第一个兴趣点的名称
                    console.log('获取成功');
                    if (pois.length > 0) {
                      detailedAddress += ` (${pois[0].title})`;
                    }
                    this.setData({
                      currentLocation: detailedAddress // 更新当前位置信息
                    });
                  } else {
                    wx.showToast({
                      title: '获取地址失败',
                      icon: 'none'
                    });
                  }
                },
                fail: () => {
                  wx.showToast({
                    title: '请求失败',
                    icon: 'none'
                  });
                }
              });
              // 如果需要，可以在这里进一步处理位置信息，例如调用地图更新等
            },
            fail: () => {
              wx.showToast({
                title: '获取当前位置失败',
                icon: 'none'
              });
              console.log('**************');
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
  }
  
  
  
  // 其他方法
});
