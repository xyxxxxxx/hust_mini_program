// map.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    origin:'',
    destination:'',
    latitude: 0.0,
    longitude: 0.0,
    distance:0,
    markers: [],  // 地图上的标记点
  },

  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },

  buttonSearch(origin,destination){
    let x1=0,x2=0,y1=0,y2=0
    let this1=this
    //通过wx.request发起HTTPS接口请求
    wx.request({
      //地图WebserviceAPI地点搜索接口请求路径及参数（具体使用方法请参考开发文档）
      url: `https://apis.map.qq.com/ws/place/v1/search?boundary=region(武汉,0)&keyword=${origin}&page_size=20&page_index=1&key=7XHBZ-OC7CW-DVNRE-RJOMF-QSD23-JYBA4`,
      success(res){
        let result = res.data
        let pois = result.data
        for(let i = 0; i< pois.length; i++){
          console.log(pois[i].title+","+pois[i].location.lat+","+pois[i].location.lng)
        }
        let currentMarkers=this1.data.markers
        currentMarkers.push({
          id:0,
          latitude: pois[0].location.lat,
          longitude: pois[0].location.lng,
          width: 30,
          height: 30,
          label: {
            content: "出发地",
            color: "#2447f6",
            fontSize: 14,
            anchor: { x: 0, y: -20 }
          }
        })
        this1.setData({
          markers: currentMarkers
        })
        x1=pois[0].location.lat,
        y1=pois[0].location.lng
        let this2=this1
        //通过wx.request发起HTTPS接口请求
        wx.request({
          //地图WebserviceAPI地点搜索接口请求路径及参数（具体使用方法请参考开发文档）
          url: `https://apis.map.qq.com/ws/place/v1/search?boundary=region(武汉,0)&keyword=${destination}&page_size=20&page_index=1&key=7XHBZ-OC7CW-DVNRE-RJOMF-QSD23-JYBA4`,
          success(res){
            let result = res.data
            let pois = result.data
            for(let i = 0; i< pois.length; i++){
              console.log(pois[i].title+","+pois[i].location.lat+","+pois[i].location.lng)
            }
            let currentMarkers=this2.data.markers
            currentMarkers.push({
              id:1,
              latitude: pois[0].location.lat,
              longitude: pois[0].location.lng,
              width: 30,
              height: 30,
              label: {
                content: "目的地",
                color: "#2447f6",
                fontSize: 14,
                anchor: { x: 0, y: -20 }
              }
            })
            this2.setData({
              markers: currentMarkers
            })
            x2=pois[0].location.lat
            y2=pois[0].location.lng
            this2.buttonDriving(x1,y1,x2,y2)
          },
        })
        
      },
    })
    
  },
  
  buttonDriving(lat1,lon1,lat2,lon2){
    console.log(lat1)
    console.log(lon1)
    console.log(lat2)
    console.log(lon2)
    let _this = this
    //通过wx.request发起HTTPS接口请求
    wx.request({
      //地图WebserviceAPI驾车路线规划接口 请求路径及参数（具体使用方法请参考开发文档）
      url: `https://apis.map.qq.com/ws/direction/v1/driving/?from=${lat1},${lon1}&to=${lat2},${lon2}&key=7XHBZ-OC7CW-DVNRE-RJOMF-QSD23-JYBA4&get_speed=1`,
      success(res){
        let result = res.data.result
        let route = result.routes[0]
        
        let coors = route.polyline, pl = [];
        let sp=route.speed;
        let sum=0;
        for(let i=0;i<sp.length;i++){
          sum+=sp[i].distance;
        }
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        let kr = 1000000;
        for (let i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (let i = 0; i < coors.length; i += 2) {
          pl.push({ latitude: coors[i], longitude: coors[i + 1] })
        }
        _this.setData({
          // 将路线的起点设置为地图中心点
          latitude:pl[0].latitude,
          longitude:pl[0].longitude,
          distance:sum,
          // 绘制路线
          polyline: [{
            points: pl,
            color: '#58c16c',
            width: 6,
            borderColor: '#2f693c',
            borderWidth: 1
          }]
        })
      }
    })
  },

  return_to(){
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },

  onLoad: function () {
    this.setData({
      origin: wx.getStorageSync('origin'),
      destination: wx.getStorageSync('destination')
    })
    console.log(this.data.origin)
    console.log(this.data.destination)
    this.buttonSearch(this.data.origin,this.data.destination)
  }

})
