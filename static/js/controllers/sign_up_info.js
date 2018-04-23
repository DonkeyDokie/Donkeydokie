Vue.config.devtools = true;
var PAGE_LIMIT = 10;

var profile_app = new Vue({
    el: '#sign_up_info',
    data: function() {
        return {
            user_id: "",
            userInfo: {},
            message: "",
            count: 0
        }
    }, 
    ready: function() {

        $('.modal').modal();
        $('.carousel.carousel-slider').carousel({fullWidth: true});
        $('.tap-target').tapTarget();

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
          });

        }
    },
    methods: {
        fetchUserID: function() {

            this.ajaxCall('api/get_user_id_from_cookie.php', 'POST', null, function callback(resp, me){
                me.user_id = resp.data.user_id;
            });

        },
        openTags: function(){
            this.count++;
            if (this.count % 2 == 1) {
                $('.tap-target').tapTarget('open');
            } else{
                $('.tap-target').tapTarget('close');
            }
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
        logOut: function() {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
    }
})

