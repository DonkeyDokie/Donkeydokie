Vue.config.devtools = true;

var profile_app = new Vue({
    el: '#applications_app',
    data: function() {
        return {
            user_id: "",
            userInfo: {},
            message: "",
            personal_applications: [],
            current_trip_id: "",
            message: "",
            url: "applications"
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

          _this.updateApplications();
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
      updateApplications: function() {
        var _this = this;
        $.ajax({
          method: 'POST',
          url: 'api/get_personal_application.php',
          timeout: 30000,
          success: function(resp) {
            console.log("get personal application info");
            if (!resp || resp.status !== 'success') {
              console.log(resp);
              location.href = '/';
              return;
            }
            _this.personal_applications = resp.data;
            for (i in _this.personal_applications){
               if (_this.personal_applications[i].ApplyStatus === "Pending"){
                  _this.personal_applications[i].statusIcon = "widgets";
                  _this.personal_applications[i].color = "#4facf7";
               } else if (_this.personal_applications[i].ApplyStatus === "Expired"){
                  _this.personal_applications[i].statusIcon = "access_alarm";
                  _this.personal_applications[i].color = "#f9d857";
               } else if (_this.personal_applications[i].ApplyStatus === "Approved"){
                  _this.personal_applications[i].statusIcon = "assignment_turned_in";
                  _this.personal_applications[i].color = "#85b97c";
                  _this.personal_applications[i].buttonStatus = "disabled";
               } else if (_this.personal_applications[i].ApplyStatus === "Denied"){
                  _this.personal_applications[i].statusIcon = "do_not_disturb_on";
                  _this.personal_applications[i].color = "#e24e3e";
               } else if (_this.personal_applications[i].ApplyStatus === "Closed"){
                _this.personal_applications[i].statusIcon = "pause_circle_filled";
                _this.personal_applications[i].color = "grey";
               }
            }
            console.log(_this.personal_applications)
          },
          error: function() { 
            console.log("personal application display fail");
            // location.href = '/'; 
          }
        });
      },
      onDeleteOpen: function(tripID){
        var _this = this;
        _this.current_trip_id = tripID;
        $('#modal-delete').modal('open');
      },
      onDeleteClose: function(){
        $('#modal-delete').modal('close');
      },
      deleteApplication: function() {

        var _this = this;

          $.ajax({
            method: 'POST',
            url: 'api/delete_application.php',
            datatype:'json',
            data: {
                trip_id: _this.current_trip_id,
                user_id: _this.userInfo.user_id
            },
            success: function(resp) {
                console.log(resp);
                if (!resp || resp.status !== "success") {
                    alert("Failed");
                    return;
                }
                alert("Succeed");
            },
            error: function() { 
                console.log(resp);
            }
          });
      },
      logOut: function() {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    }
})

