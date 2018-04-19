Vue.config.devtools = true;

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
            applicants: [],
            current_trip_id: "",
            message: "",
            content: "future",
            url: "trips"
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
          $.ajax({
            method: 'POST',
            url: 'api/auto_signin.php',
            timeout: 30000,
            success: function(resp) {
              console.log("success auto login!");
              if (!resp || resp.status !== 'success') {
                location.href = '/';
                return;
              }
              _this.userInfo = resp.data;
            },
            error: function() { 
              console.log("personal info display fail");
              // location.href = '/'; 
            }
          });

          _this.updateTrips();

        }
    },
    methods: {
        fetchUserID: function() {
            var _this = this;
                $.ajax({
                    url: 'api/get_user_id_from_cookie.php',
                    method: 'POST',
                    datatype: 'json',
                    success: function(resp) {
                        _this = this;
                        console.log("fetch user succeed\n");
                        if (!resp || resp.status !== "success") {
                            _this.title = "Error";
                            return;
                        }
                        _this.user_id = resp.data.user_id;
                    },
                    error: function() {
                        console.log("fetch user fail\n");
                    }
                });
        },
        updateTrips: function() {
            var _this = this;

            //get 
            $.ajax({
                method: 'POST',
                url: 'api/get_personal_trip.php',
                timeout: 30000,
                success: function(resp) {
                    console.log("get personal trips info");
                    if (!resp || resp.status !== 'success') {
                    console.log(resp);
                    location.href = '/';
                    return;
                    }
                    _this.future_trips = resp.data;
                    _this.changeContent();
                    for (index in _this.future_trips){
                        var url = _this.future_trips[index].ImgUrl;
                        if (url[0] == "\""){
                            _this.future_trips[index].ImgUrl = "\././" + url.substring(2, url.length - 1);
                        } else if (url[0] == "."){
                            _this.future_trips[index].ImgUrl = "\././" + url.substring(1, url.length);
                        }
                    }
                },
                error: function() { 
                    console.log("personal trips display fail");
                //   location.href = '/'; 
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
        },
        logOut: function() {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
    }
})

