Vue.config.devtools = true;
var PAGE_LIMIT = 10;

var profile_app = new Vue({
    el: '#trips_app',
    data: function() {
        return {
            user_id: "",
            userInfo: {},
            message: "",
            future_trips: [],
            current_trips: [],
            past_trips: [],
            showing_trips: [],
            current_trip_id: "",
            content: "future",
            url: "trips",
            curPage : 1,
            totalPageNumber : 1,
            pageList : [1]
        }
    }, 
    ready: function() {

        $('.modal').modal();

        $('.datepicker').pickadate({
          format: 'mm/dd/yyyy',
          selectMonths: true, // Creates a dropdown to control month
          selectYears: 15, // Creates a dropdown of 15 years to control year,
          today: 'Today',
          clear: 'Clear',
          close: 'Ok',
          closeOnSelect: false // Close upon selecting a date,
        });

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

          this.ajaxCall('api/auto_signin.php', 'POST', null, function callback(resp, me){
            me.userInfo = resp.data;
            var url = me.userInfo.img;
            me.userInfo.img = "\././" + url.substring(1, url.length);
          });
          _this.updateTrips();

        }
    },
    methods: {
        fetchUserID: function() {

            this.ajaxCall('api/get_user_id_from_cookie.php', 'POST', null, function callback(resp, me){
                me.user_id = resp.data.user_id;
            });

        },
        updateTrips: function() {

            var myDate = new Date();
            var data = {
                today_date: myDate.getFullYear().toString() + '-' + (myDate.getMonth() + 1).toString() + '-' + myDate.getDate().toString()
            }

            this.ajaxCall('api/get_personal_trip.php', 'POST', data, function callback(resp, me){
                me.future_trips = resp.data.future;
                me.current_trips = resp.data.current;
                me.past_trips = resp.data.past;
                me.changeContent();
                for (index in me.future_trips){
                    var url = me.future_trips[index].ImgUrl;
                    if (url[0] == "\""){
                        me.future_trips[index].ImgUrl = "\././" + url.substring(2, url.length - 1);
                    } else if (url[0] == "."){
                        me.future_trips[index].ImgUrl = "\././" + url.substring(1, url.length);
                    }
                    var url = me.current_trips[index].ImgUrl;
                    if (url[0] == "\""){
                        me.current_trips[index].ImgUrl = "\././" + url.substring(2, url.length - 1);
                    } else if (url[0] == "."){
                        me.current_trips[index].ImgUrl = "\././" + url.substring(1, url.length);
                    }
                    var url = me.past_trips[index].ImgUrl;
                    if (url[0] == "\""){
                        me.past_trips[index].ImgUrl = "\././" + url.substring(2, url.length - 1);
                    } else if (url[0] == "."){
                        me.past_trips[index].ImgUrl = "\././" + url.substring(1, url.length);
                    }
                }
            });

        },
        changeContent: function(contentId){
            var _this = this;
            if (contentId == 2) {
                _this.content = 'past';
                _this.showing_trips = _this.past_trips;
            }
            else if (contentId == 1) {
                _this.content = 'current';
                _this.showing_trips = _this.current_trips;
            }
            else {
                _this.content = 'future';
                _this.showing_trips = _this.future_trips;
            }
            var count = 0;
            for (index in _this.showing_trips){
                count++;
            }
            _this.totalPageNumber = Math.ceil(count / PAGE_LIMIT);
            _this.pageList = [];
            for (i = 1; i <= _this.totalPageNumber; i++){
                _this.pageList.push(i);
            }
            _this.$data.pageList = Object.assign({}, _this.$data.pageList);
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
        changePage: function(pageNum) {
            this.curPage = pageNum;
        },
        logOut: function() {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
    },
    watch: {
        curPage: function(newVal) {
          this.showingTrips = [];
          var i = 0;
          if (newVal < 1) newVal = 1;
          if (newVal > this.totalPageNumber) newVal = this.totalPageNumber;
          this.curPage = newVal;
          while(i < PAGE_LIMIT && this.showing_trips[i + (newVal - 1) * PAGE_LIMIT]){
            this.showingTrips.push(this.showing_trips[i + (newVal - 1) * PAGE_LIMIT]);
            i++;
          }
        }
    }
})

