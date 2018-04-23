Vue.config.devtools = true;

var app = new Vue({
    el: '#setting_app',
    data: function() {
        return {
            user_id: "",
            userInfo: {},
            userVis: {},
            approvePercentage: 0,
            denyPercentage: 0,
            pendingPercentage: 0,
            favorityStyle: ""
        }
    }, 
    ready: function() {

        $('.modal').modal();

        this.fetchUserID();
        var cookies = document.cookie.split('; ');
        var cookieObj = {};
        cookies.forEach(function(cookieStr) {
          var cookieName = cookieStr.split('=')[0];
          var cookieContent = cookieStr.split('=')[1];
          if(cookieName === 'DonkeyDokieAUTH') {
            cookieObj[cookieName] = cookieContent;
          }
        });

        var _this = this;
        if (cookieObj.hasOwnProperty('DonkeyDokieAUTH')) {
            // display personal info
            _this.ajaxCall('api/auto_signin.php', 'POST', null, function callback(resp, me){
              me.userInfo = resp.data;
              var img_box = document.getElementById("avatar");
              img_box.style.backgroundPosition = 'center';
              img_box.style.backgroundSize = '100%';
              
              
              var url =  "\././" + me.userInfo.img.substring(1, me.userInfo.img.length);
              img_box.style.backgroundImage = 'url(' + url + ')';
              console.log(url)

              _this.ajaxCall('api/get_user_stat.php', 'POST', null, function callback(resp, me){
                  _this.userVis = resp;
                  var max = 0;
                  for (var i in resp.travel_style){
                      if (parseInt(resp.travel_style[i]) > max){
                        max = parseInt(resp.travel_style[i]);
                        _this.favorityStyle = i;
                      } 
                  }
                  var total = parseInt(resp.application.Approved) + parseInt(resp.application.Denied) + parseInt(resp.application.Pending);
                  if (total != 0 && !isNaN(total)){
                    _this.approvePercentage = (parseInt(resp.application.Approved) / total).toFixed(2) * 100;
                    _this.denyPercentage = (parseInt(resp.application.Denied) / total).toFixed(2) * 100;
                    _this.pendingPercentage = (parseInt(resp.application.Pending) / total).toFixed(2) * 100;
                  } else {
                    _this.approvePercentage = 0;
                    _this.denyPercentage = 0;
                    _this.pendingPercentage = 0;
                  }
                  _this.visualize(resp);
              });

            });
        }

    },

    methods: {

        fetchUserID: function() {
            this.ajaxCall('api/get_user_id_from_cookie.php', 'POST', null, function callback(resp, me){
                me.user_id = resp.data.user_id;
            });
        },
        visualize: function(data) {

            var tripVis = document.getElementById("tripVis");
            var applicationVis = document.getElementById("applicationVis");
            var styleVis = document.getElementById("styleVis");

            var style = [],
            styleValue = [],
            color = [
                'rgba(209, 196, 233, 1)',
                'rgba(255, 224, 130, 1)',
                'rgba(76, 183, 173, 1)',
                'rgba(179, 229, 253, 1)',      
                'rgba(244, 142, 117, 1)',
                'rgba(255, 137, 100, 1)',
                'rgba(189, 189, 189, 1)'      
            ];

            for (var i in data.travel_style){
                style.push(i);
                styleValue.push(parseInt(data.travel_style[i]));
            }

            var tripData = {
                datasets: [{
                    data: [data.apply, data.create, data.participate],
                    backgroundColor: color,
                    borderColor: '#fff',
                }],
                labels: [
                    'Apply',
                    'Create',
                    'Participate'
                ]
            };

            var applicationData = {
                datasets: [{
                    data: [data.application.Approved, data.application.Denied, data.application.Pending],
                    backgroundColor: color,
                    borderColor: '#fff',
                }],
                labels: [
                    'Approved',
                    'Denied',
                    'Pending'
                ]
            };

            var styleData = {
                labels: style,
                datasets: [{
                    label: 'number of styles',
                    data: styleValue,
                    backgroundColor: color,
                    borderColor:'#fff',
                    borderWidth: 1
                }]
            }

            new Chart(tripVis,{
                type: 'pie',
                data: tripData,
                options: {
                    title: {
                        display: true,
                        text: 'My Actions'
                    }
                }
            });

            new Chart(applicationVis,{
                type: 'doughnut',
                data: applicationData,
                options: {
                    title: {
                        display: true,
                        text: 'My Applications Status'
                    }
                }
            });

            new Chart(styleVis, {
                type: 'bar',
                data: styleData,
                options: {
                    title: {
                        display: true,
                        text: 'My favorite travel style'
                    }
                }
            });

        },
        ajaxCall: function(url, method, data, callback){

            var _this = this;
        
            $.ajax({
              method: method,
              url: url,
              datatype:'json',
              data: data,
              success: function(resp) {
                if (!resp.status) resp = JSON.parse(resp);
                if (!resp || resp.status !== 'success') {
                  return;
                }
                callback(resp, _this);
              },
              error: function() { 
                console.log(resp.message);
              }
            });
        },
    }
})
