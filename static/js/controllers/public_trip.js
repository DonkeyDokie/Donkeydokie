Vue.config.devtools  = true;

var public_trip_app = new Vue({
    el: '#public_trip_app',
    data: function() {
        return {
            public_trip: [],
            trip_id: 0,
            trip_title: "",
            apply_message: "",
            post_title: "",
            post_start_day: "",
            post_length: "",
            post_style: "",
            post_loaction: "",
            post_description: "",
            post_remarks: "",
            post_requirement: "",
            post_budget: "",
            post_travel_style: 0,
            post_pp: "public",
            user_id: "",
            user_login_name: "",
            popularity: [],
            locationList: [],
            message: "",
            url: "public_trip",
            tripDetail: "",
            travelStyleList: []
        }
    }, 
    ready: function() {

        var _this = this;
        this.fetchUserID();
        this.updateTripList();

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
        var cookies = document.cookie.split('; ');
        var cookieObj = {};
        cookies.forEach(function(cookieStr) {
          var cookieName = cookieStr.split('=')[0];
          var cookieContent = cookieStr.split('=')[1];
          if(cookieName === 'DonkeyDokieAUTH') {
            cookieObj[cookieName] = cookieContent;
          }
        });

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
            },
            error: function() { 
              console.log("personal info display fail");
              // location.href = '/'; 
            }
          });
        }

        $.ajax({
            method: 'POST',
            url: 'api/get_travel_style.php',
            timeout: 30000,
            success: function(resp) {
              console.log("success auto login!");
              if (!resp || resp.status !== 'success') {
                location.href = '/';
                return;
              }
              _this.travelStyleList = resp.data;
              for (ts in _this.travelStyleList){
                 _this.travelStyleList[ts].isCheck = false;
              }
            },
            error: function() { 
              console.log("personal info display fail");
              // location.href = '/'; 
            }
          });

          $.ajax({
            method: 'POST',
            url: 'api/get_locations.php',
            timeout: 30000,
            success: function(resp) {
              console.log("success auto login!");
              if (!resp || resp.status !== 'success') {
                location.href = '/';
                return;
              }
              _this.locationList = resp.data;
            },
            error: function() { 
              console.log("personal info display fail");
              // location.href = '/'; 
            }
          });
          $('select').material_select();
          this.initialMap();

    },
    methods: {
        updateTripList: function() {
            var _this = this;
            // ajax 
            $.ajax({
                // method: 'GET',
                url: 'api/get_public_trip.php',
                datatype:'json',
                success: function(resp) {

                    if (!resp || JSON.parse(resp).status !== "success") {
                        _this.message = resp.message;
                        return;
                    }
                    _this.public_trip = JSON.parse(resp).data;
                    
                    for (index in _this.public_trip){
                        var url = _this.public_trip[index].ImgUrl;
                        if (url[0] == "\""){
                            _this.public_trip[index].ImgUrl = "\././" + url.substring(2, url.length - 1);
                        } else if (url[0] == "."){
                            _this.public_trip[index].ImgUrl = "\././" + url.substring(1, url.length);
                        }
                    }
                },
                error: function() { 
                    console.log(resp);
                }
            });
        },
        onApplyClick: function(id){
            var _this = this;
            _this.trip_id = id;
            $('#modal-apply').modal('open');
        },
        onApplyCancel: function(){
            var _this = this;
            _this.message = " ";
            $('#modal-apply').modal('close');
        },
        onApplySubmit: function(){
            $('#modal-apply-confirmed').modal('open');
        },
        onApplySubmitConfirmed: function(){
            var _this = this;
            // ajax 
            $.ajax({
                method: 'POST',
                url: 'api/apply_trip.php',
                datatype:'json',
                data: {
                    // Not sure where to retrieve user and trip id
                    userID: _this.user_id,
                    tripID: _this.trip_id,
                    message: _this.apply_message
                },
                success: function(resp) {
                    console.log(resp);
                    if (!resp || resp.status !== "success") {
                        _this.message = resp.message;
                        return;
                    }
                    _this.message = resp.message;
                    _this.apply_status = resp.data.apply_status;
                    $('#modal-apply').modal('close');
                },
                error: function() {      
                    console.log(resp);
                }
            });
            $('#modal-apply-confirmed').modal('close');
            $('#modal-message').modal('open');
        },
        onApplySubmitCancel: function(){
            $('#modal-apply-confirmed').modal('close');
        },
        onPostTrip: function() {
            $('#modal-public').modal('open');
        },
        onPostSubmit: function() {
            $('#modal-post-confirmed').modal('open');
        },
        onPostCancel: function() {
            $('#modal-public').modal('close');
        },
        onPostSubmitConfirmed: function() {

            var _this = this;
            var image = $(_this.$el).find('#postImage')[0].files[0];

            var fd = new FormData();
            fd.append('file',image);

            // check form
            if (_this.post_title == ""){
                _this.message = "Please enter trip title!";
                $('#modal-message').modal('open');
                $('#modal-post-confirmed').modal('close');
                return;
            }

            if (_this.post_start_day == ""){
                _this.message = "Please choose your start day!";
                $('#modal-message').modal('open');
                $('#modal-post-confirmed').modal('close');
                return;
            }

            if (_this.post_travel_style == ""){
                _this.message = "Please choose travel style!";
                $('#modal-message').modal('open');
                $('#modal-post-confirmed').modal('close');
                return;
            }

            if (_this.post_location == ""){
                _this.message = "Please choose your location!";
                $('#modal-message').modal('open');
                $('#modal-post-confirmed').modal('close');
                return;
            }

            var imgUrl = null;
            
            $.ajax({
                url: 'api/post_images.php',
                method: 'POST',
                processData:false,
                contentType:false,
                data: fd,
                success: function(resp) {
                    if (resp.status == "fail"){
                        _this.upload_message = resp.message;
                    } else {
                        imgUrl = resp.data;
                    }
                    $.ajax({
                        url: 'api/post_trip.php',
                        method: 'POST',
                        datatype: 'json',
                        data: {
                            title: _this.post_title,
                            start_day: _this.post_start_day,
                            length: _this.post_length,
                            travel_style_id: _this.post_travel_style,
                            travel_description: _this.post_description,
                            remarks: _this.post_remarks,
                            requirements: _this.post_requirement,
                            budget: _this.post_budget,
                            if_public: !_this.post_pp,
                            location: _this.post_location,
                            img: JSON.stringify(imgUrl)
                        },
                        success: function(resp) {
                            _this.updateTripList();
                            _this.post_title = "";
                            _this.post_start_day = "";
                            _this.post_length = "";
                            _this.post_style = "";
                            _this.post_loaction = "";
                            _this.post_description = "";
                            _this.post_remarks = "";
                            _this.post_requirement = "";
                            _this.post_budget = "";
                            _this.post_travel_style = 0;
                            _this.post_pp = "public";
                            if (!resp || JSON.parse(resp).status != "success") {
                                _this.message = "Something wrong...";
                                $('#modal-post-confirmed').modal('close');
                                $('#modal-message').modal('open');
                                return;
                            }
                            _this.message = "Create Trip Success!";
                            $('#modal-public').modal('close');
                            $('#modal-post-confirmed').modal('close');
                            $('#modal-message').modal('open');
                        },
                        error: function(resp) {
                            _this.message = "Server error";
                            $('#modal-post-confirmed').modal('close');
                            $('#modal-message').modal('open');
                        }
                    });
                },
                error: function(resp) {
                }
            });
        },
        onPostSubmitCancel: function() {
            $('#modal-post-confirmed').modal('close');
        },
        onCloseMessage: function() {
            $('#modal-message').modal('close');
        },
        fetchUserID: function() {
          var _this = this;
          $.ajax({
              url: 'api/get_user_id_from_cookie.php',
              method: 'POST',
              datatype: 'json',
              success: function(resp) {
                  console.log("fetch user succeed\n");
                  if (!resp || resp.status !== "success") {
                      _this.title = "Error";
                      return;
                  }
                  _this.user_id = resp.data.user_id;
                  _this.user_login_name = resp.data.user_login_name;
              },
              error: function() {
                  console.log("fetch user fail\n");
              }
          });
        },
        initialMap: function(){

            var _this = this;

            $.ajax({
                // method: 'GET',
                url: 'api/get_location_popularity.php',
                datatype:'json',
                success: function(resp) {

                    if (!resp || resp.status !== "success") {
                        _this.message = resp.message;
                        return;
                    }
                    _this.popularity = resp.data;

                    var data = [];

                    for (i in _this.popularity){
                        var name = null, color = null;
                        for (item in mapData){
                            if (mapData[item].code == _this.popularity[i].Nation){
                                name = mapData[item].name;
                                color = mapData[item].color;
                            }
                        }
                        var location = {
                            code : _this.popularity[i].Nation,
                            value : parseInt(_this.popularity[i].count),
                            name : name,
                            color : color
                        }
                        data.push(location);
                    }
                    
                    // get min and max values
                    var minBulletSize = 3;
                    var maxBulletSize = 70;
                    var min = Infinity;
                    var max = -Infinity;
                    for ( var i = 0; i < data.length; i++ ) {
                        var value = data[ i ].value;
                        if ( value < min ) {
                            min = value;
                        }
                        if ( value > max ) {
                            max = value;
                        }
                    }

                    // it's better to use circle square to show difference between values, not a radius
                    var maxSquare = maxBulletSize * maxBulletSize * 2 * Math.PI;
                    var minSquare = minBulletSize * minBulletSize * 2 * Math.PI;

                    // create circle for each country
                    var images = [];
                    for ( var i = 0; i < data.length; i++ ) {
                        var dataItem = data[ i ];
                        var value = dataItem.value;
                        // calculate size of a bubble
                        var square = ( value - min ) / ( max - min ) * ( maxSquare - minSquare ) + minSquare;
                        if ( square < minSquare ) {
                            square = minSquare;
                        }
                        var size = Math.sqrt( square / ( Math.PI * 2 ) );
                        var id = dataItem.code;

                        images.push( {
                            "type": "circle",
                            "theme": "dark",
                            "width": size,
                            "height": size,
                            "color": dataItem.color,
                            "longitude": latlong[ id ].longitude,
                            "latitude": latlong[ id ].latitude,
                            "title": dataItem.name,
                            "value": value
                        } );
                    }

                    // build map
                    var map = AmCharts.makeChart( "map", {
                        "type": "map",
                        "projection": "eckert6",
                        "titles": [ {
                            "text": "The Most Popular Destination",
                            "size": 14
                        }],
                        "areasSettings": {
                            // "unlistedAreasColor": "#000000",
                            // "unlistedAreasAlpha": 0.1
                        },
                        "dataProvider": {
                            "map": "worldLow",
                            "images": images
                        },
                        "export": {
                            "enabled": false
                        }
                    });
                        
                },
                error: function() { 
                    console.log(resp);
                }
            });
        },
        openTripDetails: function(trip){
            this.tripDetail = trip;
            console.log(this.tripDetail);
            $('#modal-detail').modal('open');
        },
        closeTripDetails: function(){
            $('#modal-detail').modal('close');
        },
        logOut: function() {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
    }
})
