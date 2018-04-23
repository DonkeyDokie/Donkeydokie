Vue.config.devtools = true;
var PAGE_LIMIT = 10;

var post_app = new Vue({
    el: '#posts_app',
    data: function() {
        return {
            user_id: "",
            userInfo: "",
            created_open_trips: {},
            created_closed_trips: {},
            showing_trips: {},
            applicants: {},
            current_trip_id: "",
            current_applicant: "",
            on_delete_trip: "",
            on_edit_trip_id: "",
            on_edit_trip: {},
            message: "",
            offlineUserList: [],
            onlineUserList: [],
            showing : "open",
            url: "posts",
            curPage : 1,
            totalPageNumber : 1,
            pageList : [1]
        }
    }, 
    ready: function() {

        $('.modal').modal();
        $('select').material_select();

        $('.datepicker').pickadate({
          format: 'yyyy-mm-dd',
          selectMonths: true, // Creates a dropdown to control month
          selectYears: 15, // Creates a dropdown of 15 years to control year,
          today: 'Today',
          clear: 'Clear',
          close: 'Ok',
          closeOnSelect: false // Close upon selecting a date,
        });

        this.fetchUserID();
        this.fetchUserList();

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

        }

        var _this = this;

        this.ajaxCall('api/get_personal_created_all_trips.php', 'POST', null, function callback(resp, me){

          for (var i in resp.data.close){
            me.created_closed_trips[resp.data.close[i].TripID] = resp.data.close[i];
            me.created_closed_trips[resp.data.close[i].TripID].display_open = 'none';
            me.created_closed_trips[resp.data.close[i].TripID].display_close = 'inline-block';
            var url = me.created_closed_trips[resp.data.close[i].TripID].ImgUrl;
            me.created_closed_trips[resp.data.close[i].TripID].ImgUrl = "\././" + url.substring(1, url.length);
          }

          for (var i in resp.data.open){
            me.created_open_trips[resp.data.open[i].TripID] = resp.data.open[i];
            me.created_open_trips[resp.data.open[i].TripID].display_open = 'inline-block';
            me.created_open_trips[resp.data.open[i].TripID].display_close = 'none';
            var url = me.created_open_trips[resp.data.open[i].TripID].ImgUrl;
            me.created_open_trips[resp.data.open[i].TripID].ImgUrl = "\././" + url.substring(1, url.length);
          }

          me.showing_trips = me.created_open_trips;

        });

    },
    methods: {

      fetchUserID: function() {

        this.ajaxCall('api/get_user_id_from_cookie.php', 'POST', null, function callback(resp, me){
          me.user_id = resp.data.user_id;
          me.message = resp.message;
        });

      },
      showApplicants: function(trip_id) {

        this.current_trip_id = trip_id;

        var data = {
            trip_id: trip_id
        }

        this.ajaxCall('api/get_trip_applicants.php', 'POST', data, function callback(resp, me){
          me.applicants = resp.data; 
          me.message = resp.message;
          $('#modal-applicants').modal('open');
        });

      },
      onApplicantsClose: function(){
        $('#modal-applicants').modal('close');
      },
      onAcceptOpen: function(id) {
        this.current_applicant = id;
        $('#modal-accept').modal('open');
      },
      onAcceptCancel: function(id) {
        $('#modal-accept').modal('close');
      },
      acceptApplicant: function(){

        var data = {
            trip_id: this.current_trip_id,
            user_id: this.current_applicant,
            status: "Approved"
        }

        this.ajaxCall('api/update_application.php', 'POST', data, function callback(resp, me){
          me.message = resp.message;
          $('#modal-message').modal('open');
          $('#modal-accept').modal('close');
        });

      },
      onDenyOpen: function(id) {
        this.current_applicant = id;
        $('#modal-deny').modal('open');
      },
      onDenyCancel: function(id) {
        $('#modal-deny').modal('close');
      },
      denyApplicant: function() {

        var data = {
          trip_id: this.current_trip_id,
          user_id: this.current_applicant,
          status: "Denied"
        }

        this.ajaxCall('api/update_application.php', 'POST', data, function callback(resp, me){
          me.message = resp.message;
          $('#modal-message').modal('open');
          $('#modal-deny').modal('close');
        });

      },
      onDeleteOpen: function(tripID){
        this.on_delete_trip = tripID;
        $('#modal-delete').modal('open');
      },
      onDeleteCancel: function(){
        $('#modal-delete').modal('close');
      },
      deleteTrip: function(tripID){

        var data = {
          tripID: this.on_delete_trip
        }

        this.ajaxCall('api/delete_trip.php', 'POST', data,function callback(resp, me){
          me.message = resp.message;
          $('#modal-delete').modal('close');
          $('#modal-message').modal('open');
          me.updateCreateTrips();
        });

      },
      onCloseMessage: function() {
        $('#modal-message').modal('close');
      },
      onEditOpen: function(tripID){
        this.on_edit_trip_id = tripID;

        var data = {
          tripID : this.on_edit_trip_id
        }

        this.ajaxCall('api/get_trip_info.php', 'POST', data,function callback(resp, me){
          me.on_edit_trip = resp.data[0];
        });

        $('#modal-edit').modal('open');
        
      },
      onEditCancel: function(){
        $('#modal-edit').modal('close');
      },
      editTrip: function(){

        var _this = this;

        var image = $(_this.$el).find('#postImage')[0].files[0];
        var fd = new FormData();
        fd.append('file',image);
        _this.on_edit_trip.imgUrl = null;

        var data = {
          trip_info : _this.on_edit_trip
        }

        if($('li.active.selected')[0]){
          _this.on_edit_trip.Location = $('li.active.selected')[0].children[0].innerHTML;
        }

        if (!image){
          this.ajaxCall('api/update_trip.php', 'POST', data, function callback(resp, me){
            me.message = resp.message;
            $('#modal-message').modal('open');
            $('#modal-edit').modal('close');
            me.updateCreateTrips();
          });
        } else {
          $.ajax({
            url: 'api/post_images.php',
            method: 'POST',
            processData:false,
            contentType:false,
            data: fd,
            success: function(resp) {
                resp = JSON.parse(resp);
                if (resp.status == "fail"){
                    _this.message = resp.message;
                    $('#modal-message').modal('open');
                } else {
                    data.trip_info.imgUrl = resp.data;
                    _this.ajaxCall('api/update_trip.php', 'POST', data, function callback(resp, me){
                      me.message = resp.message;
                      $('#modal-message').modal('open');
                      $('#modal-edit').modal('close');
                      me.updateCreateTrips();
                    });
                }
            },
            error: function(resp) {
              _this.message = resp.message;
              $('#modal-message').modal('open');
            }
          });
        }

      },
      onCloseOpen: function(tripID){

        var _this = this;
        _this.on_edit_trip_id = tripID;

        $('#modal-close').modal('open');

      },
      onCloseCancel: function(){

        $('#modal-close').modal('close');

      },
      onOpenOpen: function(tripID){

        var _this = this;
        _this.on_edit_trip_id = tripID;

        $('#modal-open').modal('open');

      },
      onOpenCancel: function(){

        $('#modal-open').modal('close');

      },
      closeTrip: function(){   

        var data = {
          trip_id : this.on_edit_trip_id,
          status :0
        }

        this.ajaxCall('api/update_trip_status.php', 'POST', data,function callback(resp, me){
          me.message = resp.message;
          me.updateCreateTrips();
          $('#modal-close').modal('close');
        });

      },
      openTrip: function(){
        
        var data = {
          trip_id : this.on_edit_trip_id,
          status :1
        }

        this.ajaxCall('api/update_trip_status.php', 'POST', data,function callback(resp, me){
          me.message = resp.message;
          me.updateCreateTrips();
          $('#modal-open').modal('close');
        });
        
      },
      updateCreateTrips: function() {


        this.ajaxCall('api/get_personal_created_all_trips.php', 'POST', null, function callback(resp, me){

          me.created_closed_trips = {};
          me.created_open_trips = {};

          for (var i in resp.data.close){
            me.created_closed_trips[resp.data.close[i].TripID] = resp.data.close[i];
            me.created_closed_trips[resp.data.close[i].TripID].display_open = 'none';
            me.created_closed_trips[resp.data.close[i].TripID].display_close = 'inline-block';
            var url = me.created_closed_trips[resp.data.close[i].TripID].ImgUrl;
            me.created_closed_trips[resp.data.close[i].TripID].ImgUrl = "\././" + url.substring(1, url.length);
            if (me.showing == "closed"){
              me.$data.created_closed_trips = Object.assign({}, me.$data.created_closed_trips);
              me.$data.showing_trips = me.created_closed_trips;
              me.$data.showing_trips = Object.assign({}, me.$data.showing_trips);
              var count = 0;
              for (index in me.showing_trips){
                  count++;
              }
              me.totalPageNumber = Math.ceil(count / PAGE_LIMIT);
              me.pageList = [];
              for (i = 1; i <= me.totalPageNumber; i++){
                  me.pageList.push(i);
              }
              me.$data.pageList = Object.assign({}, me.$data.pageList);
            }
          }

          for (var i in resp.data.open){
            me.created_open_trips[resp.data.open[i].TripID] = resp.data.open[i];
            me.created_open_trips[resp.data.open[i].TripID].display_open = 'inline-block';
            me.created_open_trips[resp.data.open[i].TripID].display_close = 'none';
            var url = me.created_open_trips[resp.data.open[i].TripID].ImgUrl;
            me.created_open_trips[resp.data.open[i].TripID].ImgUrl = "\././" + url.substring(1, url.length);
            if (me.showing == "open"){
              me.$data.created_open_trips = Object.assign({}, me.$data.created_open_trips);
              me.showing_trips = me.created_open_trips;
              me.$data.showing_trips = Object.assign({}, me.$data.showing_trips);
              var count = 0;
              for (index in me.showing_trips){
                  count++;
              }
              me.totalPageNumber = Math.ceil(count / PAGE_LIMIT);
              me.pageList = [];
              for (i = 1; i <= me.totalPageNumber; i++){
                  me.pageList.push(i);
              }
              me.$data.pageList = Object.assign({}, me.$data.pageList);
            } 
          }
        });

      },
      changeStatus: function(status){

        if (status == 1){
          this.showing = "open";
          this.showing_trips = this.created_open_trips;
        } else {
          this.showing = "closed";
          this.showing_trips = this.created_closed_trips;
        }
      },
      fetchUserList: function(){

        this.ajaxCall('api/get_user_online_status.php', 'POST', null, function callback(resp, me){
          me.offlineUserList = resp.offline;
          me.onlineUserList = resp.online;
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



