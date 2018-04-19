Vue.config.devtools = true;

var app = new Vue({
    el: '#chat',
    data: function() {
        return {
            user_id: "",
            login_name: "",
            name: "",
            remarks: "",
            message: ""
        }
    }, 
    ready: function() {

        $('.modal').modal();

        $('.slide-out').sideNav({
            menuWidth: 400, 
            edge: 'right', 
            draggable: true
        });

        console.log("ready!");
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
              _this.login_name = resp.data.login_name;
              _this.remakrs = resp.data.remarks;
              _this.email = resp.data.email;
              _this.name = resp.data.name;
              console.log(_this)
            },
            error: function() { 
              console.log("personal info display fail");
              // location.href = '/'; 
            }
          });
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
        }
    }
})
