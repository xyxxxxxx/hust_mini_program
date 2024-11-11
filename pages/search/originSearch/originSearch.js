Page({
  data: {
    origin: "", // 目的地名称
    originResults: [], // 用于存储目的地搜索结果
    currentLocation: "",
    key: "XFLBZ-4BZK4-ONVUC-K3GGI-3OYJ5-IRF52",
    latitude: '30.873496',
    longitude: '120.131063',
    // 其他数据
  },

  // 处理目的地搜索按钮点击事件
  onSearchorigin() {
    if (this.data.origin) {
      wx.showToast({
        title: `搜索出发地: ${this.data.origin}`,
        icon: 'none'
      });
      // 这里可以添加进一步的搜索逻辑
    } else {
      wx.showToast({
        title: '请输入出发地',
        icon: 'none'
      });
    }
  },
  // 目的地输入事件
  onOriginInput(e) {
    const origin = e.detail.value;
    this.setData({ origin }); // 更新输入框的值

    // 调用搜索函数
    if (origin) {
      this.searchLocation(origin, "origin");
    } else {
      this.setData({ originResults: [] }); // 如果输入为空，清空结果
    }
  },

  // 搜索地址
  searchLocation(query, type) {
    wx.request({
      url: `https://apis.map.qq.com/ws/place/v1/suggestion/?keyword${this.data.keyword}=&key=${this.data.key}`,
      method: 'GET',
      data: {
        key: this.data.key, // 确保这是有效的 API 密钥
        keyword: query,
        page_size: 5,
        output: 'json'
      },
      success: (res) => {
        console.log(res); // 打印响应，检查返回的数据
        if (res.data.status === 0) {
          if (type === "origin") {
            this.setData({ originResults: res.data.data });
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
  onOriginButtonTap(e) {
    wx.navigateTo({
      url: '/pages/search/search', // 确保路径正确
      
      events: {
        // 监听目标页面的事件
        acceptDataFromOriginPage: (data) => {
          console.log(data) // 打印接收到的数据
        }
      },
      success: (res) => {
        // 向目标页面发送数据
        const selectedLocation = e.currentTarget.dataset.location;
        res.eventChannel.emit('acceptDataWhere', { where: "origin"});
        res.eventChannel.emit('acceptDataFromOriginPage', { origin: selectedLocation.title });
        wx.setStorageSync('origin', this.data.origin);
      }
    });
  },



   // 选择历史位置
   onSelectLocation(e) {
    const location = e.currentTarget.dataset.location;
    this.setData({ origin: location });
    this.searchDestination(location); // 可以触发搜索
  },

  onShow() {
    // 在这里获取当前位置信息并更新到数据中
    this.getCurrentLocation();
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
