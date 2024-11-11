// pages/login/login.js
const db=wx.cloud.database();
const _=db.command;

Page({
    data: {
      current: 1, // 1表示登录，0表示注册
      studentid: '', // 学号
      nickname: '', // 用户名
      password: '', // 密码
      studentidText: '', //存放输入的学号
      nicknameText: '', //存放输入的用户名
      passwdText: '', //存放输入的密码
    },
    
    click(e) {
      let index = e.currentTarget.dataset.code;
      this.setData({
        current: index
      });
    },
  
    // 获取学号，用户名，密码
    getinput (e) {
        let that = this;
        let type = e.currentTarget.dataset.id;
        let value = e.detail.value;
        
        if(type=='studentid')
        {
            that.setData({studentidText:value});
        }
        else if(type=='nickname')
        {
            that.setData({nicknameText:value});
        }
        else if(type=='password')
        {
            that.setData({passwdText:value});
        }
    },
    
    // 登录操作
    login() {
        let that = this;
        let type = that.data.current;
        if (type == 1){
            wx.showLoading({
                title: '正在登录',
              })
            db.collection('login').where({
                studentid:that.data.studentidText
            }).get({
                success(res) {
                    // 如果查询结果不为空，即找到了用户名
                    console.log('用户名存在');
                    if (res.data.length > 0) {
                      // 取出第一条记录，假设密码字段为password
                      const user = res.data[0];
                      if (user.password === that.data.passwdText) {
                        // 密码匹配，登录成功
                        wx.hideLoading()
                        console.log('登录成功');
                        //存储到本地
                         let data={
                            studentid:that.data.studentidText,
                            nickname:that.data.nicknameText,
                            password:that.data.passwdText
                        }
                        wx.setStorageSync('userinfo', data)

                        //返回到跳转页面
                        wx.redirectTo({
                          url:`/pages/search/search`,
                        })

                      } else {
                        // 密码不匹配，登录失败
                        wx.hideLoading()
                        console.log('密码错误');
                        wx.showToast({
                          title: '密码错误',
                          icon: 'none',
                        });
                        this.setData({
                            studentid: '',  // 清空学号
                            password: '',    // 清空密码
                            studentidText:'',
                            nicknameText: '',
                            passwdText: ''
                          });
                      }
                    } else {
                      // studentid不存在，登录失败
                      wx.hideLoading()
                      console.log('用户不存在');
                      wx.showToast({
                        title: '用户不存在',
                        icon: 'none',
                      });
                      this.setData({
                        studentid: '',  // 清空学号
                        password: '',    // 清空密码
                        studentidText:'',
                        nicknameText: '',
                        passwdText: ''
                      });
                    }
                  },
                  fail(err) {
                    // 数据库查询失败
                    wx.hideLoading()
                    console.error('查询失败', err);
                    wx.showToast({
                      title: '查询失败',
                      icon: 'none',
                    });
                    this.setData({
                        studentid: '',  // 清空学号
                        password: '',    // 清空密码
                        studentidText:'',
                        nicknameText: '',
                        passwdText: ''
                      });
                  }  
            })
        }
        else {
            wx.showToast({
                title: '出现错误，请重试',
                icon: 'none', // 使用'none'图标，表示错误
                duration: 2000 // 提示的延迟时间，单位毫秒
              });
            this.setData({
                studentid: '',  // 清空学号
                password: '',    // 清空密码
                studentidText:'',
                nicknameText: '',
                passwdText: ''
              });
        }
    },
    //注册操作
    register() {
        let that = this;
        let type = that.data.current;
        if (type == 0) {
            wx.showLoading({
              title: '正在注册',
            })
            db.collection('login').add({
                data:{
                    studentid:that.data.studentidText,
                    nickname:that.data.nicknameText,
                    password:that.data.passwdText
                }
            }).then(res=>{
                wx.hideLoading()
                console.log('注册成功',res);
            })

            .catch(err=>{
                wx.hideLoading()
                console.log('注册失败',err);
                wx.showToast({
                  title: '注册失败',
                  icon: 'error',
                  duration:1000
                })
            })
        }
        else {
            wx.showToast({
                title: '出现错误，请重试',
                icon: 'none', // 使用'none'图标，表示错误
                duration: 2000 // 提示的延迟时间，单位毫秒
              });
            this.setData({
                studentid: '',  // 清空学号
                nickname: '',   // 清空用户名
                password: '',   // 清空密码
                studentidText:'',
                nicknameText: '',
                passwdText: ''
              });
        }
    },

    handleSubmit() {
      if (this.data.current === 1) {
        // 处理登录逻辑
        this.login();
      } else {
        // 处理注册逻辑
        this.register();
        wx.showToast({
          title: '注册成功',
          icon: 'success',
          duration: 2000
        });
        
        // 清空输入框
        this.setData({
          studentid: '',  // 清空学号
          nickname: '',   // 清空用户名
          password: ''    // 清空密码
        });
  
        // 注册成功后跳转回登录页面
        wx.redirectTo({
          url: '/pages/index/index' // 替换为你的登录页面路径
        });
  
        this.setData({ current: 1 });
      }
    },
    
    
    onLoad() {
      // wx.navigateTo({
      //   url: '/pages/map/map',
      // })
    }
  });
  