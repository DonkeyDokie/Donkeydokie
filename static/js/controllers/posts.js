Vue.config.devtools = true;

var post_app = new Vue({
    el: '#posts_app',
    data: function() {
        return {
            user_id: "",
            userInfo: "",
            message: "",
            personal_applications: [],
            personal_trips: [],
            created_open_trips: [],
            created_closed_trips: [],
            showing_trips: [],
            applicants: [],
            current_trip_id: "",
            on_delete_trip: "",
            on_edit_trip_id: "",
            on_edit_trip: {},
            message: "",
            offlineUserList: [],
            onlineUserList: [],
            sendMessage: "",
            url: "posts"
        }
    }, 
    ready: function() {

        $('.modal').modal();

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
        }

        $.ajax({
          method: 'POST',
          url: 'api/get_personal_created_open_trips.php',
          success: function(resp) {
            if (!resp || resp.status != 'success') {
              console.log(resp)
              return;
            }
            _this.created_open_trips = resp.data;
            for(index in _this.created_open_trips){
              _this.created_open_trips[index].display_open = 'inline-block';
              _this.created_open_trips[index].display_close = 'none';
              var url = _this.created_open_trips[index].ImgUrl;
              if (url && url[0] == "\""){
                _this.created_open_trips[index].ImgUrl = "\././" + url.substring(2, url.length - 1);
              } else if (url && url[0] == "."){
                _this.created_open_trips[index].ImgUrl = "\././" + url.substring(1, url.length);
              }
            }
            _this.showing_trips = _this.created_open_trips;
            for (var i in _this.showing_trips){
                _this.showParticipants(_this.showing_trips[i], i);
            }
          },
          error: function() { 
            console.log("personal created trips display fail");
            // location.href = '/'; 
          }
        });

        $.ajax({
          method: 'POST',
          url: 'api/get_personal_created_closed_trips.php',
          success: function(resp) {
            if (!resp || resp.status != 'success') {
              return;
            }
            _this.created_closed_trips = resp.data;
            for(index in _this.created_closed_trips){
              _this.created_closed_trips[index].display_open = 'none';
              _this.created_closed_trips[index].display_close = 'inline-block';
              var url = _this.created_closed_trips[index].ImgUrl;
              if (url[0] == "\""){
                _this.created_closed_trips[index].ImgUrl = "\././" + url.substring(2, url.length - 1);
              } else if (url[0] == "."){
                _this.created_closed_trips[index].ImgUrl = "\././" + url.substring(1, url.length);
              }
            }
          },
          error: function() { 
            console.log("personal created trips display fail");
            // location.href = '/'; 
          }
        });

    },
    methods: {
      showApplicants: function(trip_id) {
        var _this = this;
        $.ajax({
            url: 'api/get_trip_applicants.php',
            method: 'POST',
            datatype: 'json',
            data: {
              trip_id: trip_id
            },
            success: function(resp) {
                console.log(resp);
                if (!resp || resp.status !== "success") {
                    _this.title = "Error";
                    return;
                }
                _this.applicants = resp.data;
                _this.current_trip_id = trip_id;
                $('#modal-applicants').modal('open');
            },
            error: function() {
                console.log(resp);
            }
        });
      },
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
      acceptApplicant: function(id){
        $.ajax({
          method: 'POST',
          url: 'api/update_application.php',
          datatype:'json',
          data: {
              trip_id: this.current_trip_id,
              user_id: id,
              status: "Approved"
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
        $.ajax({
          method: 'POST',
          url: 'api/approve_application.php',
          datatype:'json',
          data: {
              trip_id: this.current_trip_id,
              user_id: id
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
      denyApplicant: function(id) {
        $.ajax({
          method: 'POST',
          url: 'api/update_application.php',
          datatype:'json',
          data: {
              trip_id: this.current_trip_id,
              user_id: id,
              status: "Denied"
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
      onApplicantsClose: function(){
        $('#modal-applicants').modal('close');
      },
      onDeleteOpen: function(tripID){
        var _this = this;
        _this.on_delete_trip = tripID;
        $('#modal-delete').modal('open');
      },
      onDeleteCancel: function(){
        $('#modal-delete').modal('close');
      },
      deleteTrip: function(tripID){
        var _this = this;
        $.ajax({
          method: 'POST',
          url: 'api/delete_trip.php',
          datatype:'json',
          data: {
              tripID: _this.on_delete_trip
          },
          success: function(resp) {
              console.log(resp);
              if (!resp || resp.status !== "success") {
                  console.log("Failed");
                  return;
              }
              console.log("Delete");
          },
          error: function() { 
              console.log(resp);
          }
        });
        _this.message = "Success delete!";
        $('#modal-delete').modal('close');
        $('#modal-message').modal('open');
        _this.updateCreateTrips();
      },
      onCloseMessage: function() {
        $('#modal-message').modal('close');
      },
      onEditOpen: function(tripID){

        var _this = this;
        _this.on_edit_trip_id = tripID;

        $.ajax({
          method: 'POST',
          url: 'api/get_trip_info.php',
          datatype:'json',
          data: {
            tripID : _this.on_edit_trip_id
          },
          success: function(resp) {
            console.log(resp);
            if (!resp || resp.status !== "success") {
                console.log("Failed");
                return;
            }
            _this.on_edit_trip = resp.data[0];
            console.log(_this.on_edit_trip)
          },
          error: function() { 
              console.log(resp);
          }
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
                  _this.on_edit_trip.imgUrl = resp.data;
              }
              if (resp.status != "fail"){
                $.ajax({
                  method: 'POST',
                  url: 'api/update_trip.php',
                  datatype:'json',
                  data: {
                    trip_info : _this.on_edit_trip
                  },
                  success: function(resp) {
                      resp = JSON.parse(resp);
                      if (!resp || resp.status !== "success") {
                          _this.message = resp.message;
                          $('#modal-message').modal('open');
                          return;
                      }
                      _this.message = resp.message;
                      $('#modal-message').modal('open');
                      $('#modal-edit').modal('close');
                      _this.updateCreateTrips();
                  },
                  error: function() { 
                      _this.message = resp.message;
                      $('#modal-message').modal('open');
                  }
                });
            }
          },
          error: function(resp) {
            _this.message = resp.message;
            $('#modal-message').modal('open');
          }
        });
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
        var _this = this;
        console.log(_this.on_edit_trip_id);
        $.ajax({
          method: 'POST',
          url: 'api/update_trip_status.php',
          datatype:'json',
          data: {
            trip_id : _this.on_edit_trip_id,
            status :0
          },
          success: function(resp) {
              console.log(resp);
              if (!resp || resp.status !== "success") {
                  console.log("Failed");
                  return;
              }
              _this.message = resp.message;
              _this.updateCreateTrips();
              $('#modal-close').modal('close');
          },
          error: function() { 
              console.log(resp);
          }
        });
        _this.updateCreateTrips();
        $('#modal-close').modal('close');
        
      },
      openTrip: function(){
        var _this = this;
        console.log(_this.on_edit_trip_id);
        $.ajax({
          method: 'POST',
          url: 'api/update_trip_status.php',
          datatype:'json',
          data: {
            trip_id : _this.on_edit_trip_id,
            status :1
          },
          success: function(resp) {
              console.log(resp);
              if (!resp || resp.status !== "success") {
                  console.log("Failed");
                  return;
              }
              _this.message = resp.message;
              _this.updateCreateTrips();
              $('#modal-open').modal('close');
          },
          error: function() { 
              console.log(resp);
          }
        });
        $('#modal-open').modal('close');
        _this.updateCreateTrips();
        
      },
      updateCreateTrips: function() {

        var _this = this;

          $.ajax({
            method: 'POST',
            url: 'api/get_personal_created_open_trips.php',
            success: function(resp) {
              if (!resp || resp.status !== 'success') {
                return;
              }
              _this.created_open_trips = resp.data;
              for(i in _this.created_open_trips){
                _this.created_open_trips[i].display_open = 'inline-block';
                _this.created_open_trips[i].display_close = 'none';
                var url = _this.created_open_trips[index].ImgUrl;
                if (url[0] == "\""){
                  _this.created_open_trips[index].ImgUrl = "\././" + url.substring(2, url.length - 1);
                } else if (url[0] == "."){
                  _this.created_open_trips[index].ImgUrl = "\././" + url.substring(1, url.length);
                }
              }
            },
            error: function() { 
              console.log("personal created trips display fail");
            }
          });

          $.ajax({
            method: 'POST',
            url: 'api/get_personal_created_closed_trips.php',
            success: function(resp) {
              
              if (!resp || resp.status !== 'success') {
                return;
              }
              _this.created_closed_trips = resp.data;
              for(i in _this.created_closed_trips){
                _this.created_closed_trips[i].display_open = 'inline-block';
                _this.created_closed_trips[i].display_close = 'none';
                var url = _this.created_closed_trips[index].ImgUrl;
                if (url[0] == "\""){
                  _this.created_closed_trips[index].ImgUrl = "\././" + url.substring(2, url.length - 1);
                } else if (url[0] == "."){
                  _this.created_closed_trips[index].ImgUrl = "\././" + url.substring(1, url.length);
                }
              }
              
            },
            error: function() { 
              console.log("personal created trips display fail");
            }
          });

      },
      showParticipants: function(trip, index){
        var _this = this;
        $.ajax({
          method: 'POST',
          url: 'api/get_participants.php',
          data: {
            trip_id : trip.TripID
          },
          success: function(resp) {
            if (!resp || resp.status !== 'success') {
              return;
            }
            trip.participants = [];
            for (i in resp.data){
              trip.participants.push(resp.data[i]);
            }
            if (_this.$data.showing_trips[index]){
              _this.$data.showing_trips[index].participants = trip.participants;
              _this.$data.showing_trips = Object.assign({}, _this.$data.showing_trips);
            }
          },
          error: function() { 
            console.log("get participants fail");
          }
        });
      },
      changeStatus: function(status){
        var _this = this;
        if (status == 1){
          _this.showing_trips = _this.created_open_trips;
        } else {
          _this.showing_trips = _this.created_closed_trips;
        }
        for (var i in _this.showing_trips){
          _this.showParticipants(_this.showing_trips[i], i);
        }
      },
      fetchUserList: function(){
        var _this = this;
        $.ajax({
          method: 'POST',
          url: 'api/get_user_online_status.php',
          success: function(resp) {
            if (!resp || resp.status !== 'success') {
              return;
            }
            _this.offlineUserList = resp.offline;
            _this.onlineUserList = resp.online;
          },
          error: function() { 
            console.log("get participants fail");
          }
        });
      },
      logOut: function() {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    }
})

