Vue.config.devtools = true;
var PAGE_LIMIT = 10;

var profile_app = new Vue({
    el: '#applications_app',
    data: function() {
        return {
            user_id: "",
            userInfo: {},
            message: "",
            personal_applications: [],
            current_trip_id: "",
            url: "applications",
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

          _this.updateApplications();
        }

    },
    methods: {
        
      fetchUserID: function() {
        this.ajaxCall('api/get_user_id_from_cookie.php', 'POST', null, function callback(resp, me){
          me.user_id = resp.data.user_id;
          me.message = resp.message;
        });
      },
      updateApplications: function() {

        this.ajaxCall('api/get_personal_application.php', 'POST', null, function callback(resp, me){
          console.log(resp)
          me.personal_applications = resp.data;
          for (i in me.personal_applications){
             if (me.personal_applications[i].ApplyStatus === "Pending"){
                me.personal_applications[i].statusIcon = "widgets";
                me.personal_applications[i].color = "#4facf7";
             } else if (me.personal_applications[i].ApplyStatus === "Expired"){
                me.personal_applications[i].statusIcon = "access_alarm";
                me.personal_applications[i].color = "#f9d857";
             } else if (me.personal_applications[i].ApplyStatus === "Approved"){
                me.personal_applications[i].statusIcon = "assignment_turned_in";
                me.personal_applications[i].color = "#85b97c";
                me.personal_applications[i].buttonStatus = "disabled";
             } else if (me.personal_applications[i].ApplyStatus === "Denied"){
                me.personal_applications[i].statusIcon = "do_not_disturb_on";
                me.personal_applications[i].color = "#e24e3e";
             } else if (me.personal_applications[i].ApplyStatus === "Closed"){
                me.personal_applications[i].statusIcon = "pause_circle_filled";
                me.personal_applications[i].color = "grey";
             }
          }
        });

        this.$data.personal_applications = Object.assign({}, this.$data.personal_applications);

      },
      onDeleteOpen: function(tripID){
        this.current_trip_id = tripID;
        $('#modal-delete').modal('open');
      },
      onDeleteClose: function(){
        $('#modal-delete').modal('close');
      },
      deleteApplication: function() {

        var _this = this;

        var data = {
          trip_id: this.current_trip_id,
          user_id: this.userInfo.user_id
        };

        this.ajaxCall('api/delete_application.php', 'POST', data, function callback(resp, me){
          me.message = resp.message;
          $('#modal-delete').modal('close');
          $('#modal-message').modal('open');
          me.updateApplications();
        });

      },
      onCloseMessage: function(){
        $('#modal-message').modal('close');
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
        while(i < PAGE_LIMIT && this.personal_applications[i + (newVal - 1) * PAGE_LIMIT]){
          this.showingTrips.push(this.personal_applications[i + (newVal - 1) * PAGE_LIMIT]);
          i++;
        }
      }
  }
})

