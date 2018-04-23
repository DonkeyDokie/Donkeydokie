Vue.config.devtools  = true;

var PAGE_LIMIT = 18;

var public_trip_app = new Vue({
    el: '#public_trip_app',
    data: function() {
        return {
            public_trip: [],
            apply_message: "",
            newTrip: {},
            user_id: "",
            user_login_name: "",
            popularity: [],
            locationList: [],
            showingTrips: [],
            message: "",
            url: "public_trip",
            tripDetail: "",
            travelStyleList: [],
            showStyle: "Small",
            curPage : 1,
            totalPageNumber : 1,
            pageList : [1],
            recommendation: []
        }
    }, 
    ready: function() {

        this.fetchUserID();
        this.initailNewTrip();
    
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
                me.login_name = resp.data.login_name;
                me.remakrs = resp.data.remarks;
                me.email = resp.data.email;
                me.name = resp.data.name;
            });

        }

        this.ajaxCall('api/get_travel_style.php', 'POST', null, function callback(resp, me){
            me.travelStyleList = resp.data;
            for (ts in me.travelStyleList){
               me.travelStyleList[ts].isCheck = false;
            }
        });

        this.ajaxCall('api/get_locations.php', 'POST', null, 
            function callback(resp, me){
                me.locationList = resp.data;
            });

        $('select').material_select();
        this.initialMap();
        this.initialChart();
    },
    methods: {

        updateTripList: function() {

            var data = {
                user_id : this.user_id
            }

            this.ajaxCall('api/get_public_trip.php', 'POST', data, function callback(resp, me){
                
                if (resp.data.acceptable.length == 0 && resp.data.unAcceptable.length == 0) return;

                me.public_trip = [];

                for (var trip in resp.data.acceptable){
                    resp.data.acceptable[trip].acceptable = true;
                    me.public_trip.push(resp.data.acceptable[trip]);
                }
                for (var trip in resp.data.unAcceptable){
                    resp.data.unAcceptable[trip].acceptable = false;
                    me.public_trip.push(resp.data.unAcceptable[trip]);
                }
                
                me.showingTrips = [];

                var count = 0;
                for (index in me.public_trip){
                    var url = me.public_trip[index].ImgUrl;
                    me.public_trip[index].ImgUrl = "\././" + url.substring(1, url.length);
                    count++;
                }

                me.totalPageNumber = Math.ceil(count / PAGE_LIMIT);
                me.pageList = [];

                for (i = 1; i <= me.totalPageNumber; i++){
                    me.pageList.push(i);
                }

                me.$data.pageList = Object.assign({}, me.$data.pageList);
                me.$data.public_trip = Object.assign({}, me.$data.public_trip);

                for (var i = 0; i < PAGE_LIMIT; i++) {
                    if (me.public_trip[i + (me.curPage - 1) * PAGE_LIMIT])
                    me.showingTrips.push(me.public_trip[i + (me.curPage - 1) * PAGE_LIMIT]);
                }
                console.log(me.showingTrips)
            });
        },
        onApplyClick: function(id){
            this.trip_id = id;
            $('#modal-apply').modal('open');
        },
        onApplyCancel: function(){
            this.message = " ";
            $('#modal-apply').modal('close');
        },
        onApplySubmit: function(){
            $('#modal-apply-confirmed').modal('open');
        },
        onApplySubmitConfirmed: function(){
            var data = {
                userID: this.user_id,
                tripID: this.trip_id,
                message: this.apply_message
            }
            this.ajaxCall('api/apply_trip.php', 'POST', data, function callback(resp, me){
                me.message = resp.message;
                me.apply_status = resp.data.apply_status;
                $('#modal-message').modal('open');
                $('#modal-apply-confirmed').modal('close');
                $('#modal-apply').modal('close');
            });
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
            
            // check form
            if (_this.newTrip.title == ""){
                _this.message = "Please enter trip title!";
                $('#modal-message').modal('open');
                $('#modal-post-confirmed').modal('close');
                return;
            }
            if (_this.newTrip.startDay == ""){
                _this.message = "Please choose your start day!";
                $('#modal-message').modal('open');
                $('#modal-post-confirmed').modal('close');
                return;
            }
            if (_this.newTrip.travelStyle == ""){
                _this.message = "Please choose travel style!";
                $('#modal-message').modal('open');
                $('#modal-post-confirmed').modal('close');
                return;
            }

            if($('li.active.selected')[0]){
                _this.newTrip.location = $('li.active.selected')[0].children[0].innerHTML;
            } else {
                _this.message = "Please choose your location!";
                $('#modal-message').modal('open');
                $('#modal-post-confirmed').modal('close');
                return;
            }
            
            // generate image
            var _this = this;
            var image = $(_this.$el).find('#postImage')[0].files[0];
            var fd = new FormData();
            fd.append('file',image);
            function callback(resp, me){
                me.updateTripList();
                // me.initailNewTrip();
                me.message = resp.message;
                $('#modal-public').modal('close');
                $('#modal-post-confirmed').modal('close');
                $('#modal-message').modal('open');
            }
            // post image and trip info
            if (!image) {
                _this.ajaxCall('api/post_trip.php', 'POST', _this.newTrip, callback);
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
                            _this.newTrip.imgUrl = resp.data;
                            _this.ajaxCall('api/post_trip.php', 'POST', _this.newTrip, callback);
                        }
                    },
                    error: function(resp) {
                        _this.message = resp.message;
                        $('#modal-message').modal('open');
                    }
                });
            }

        },
        onPostSubmitCancel: function() {
            $('#modal-post-confirmed').modal('close');
        },
        onCloseMessage: function() {
            $('#modal-message').modal('close');
        },
        fetchUserID: function() {

            var _this = this;

            this.ajaxCall('api/get_user_id_from_cookie.php', 'POST', null, function callback(resp, me){
                me.user_id = resp.data.user_id;
                me.user_login_name = resp.data.user_login_name;

                var data = {
                    user_id: resp.data.user_id
                }

                _this.ajaxCall('api/recommend_engine/get_user_based_recom_trip.php', 'POST', data, function callback(resp, me){
                    me.recommendation = resp.data;
                    for (var trip in me.recommendation){
                        var url = me.recommendation[trip].ImgUrl;
                        me.recommendation[trip].ImgUrl = "\././" + url.substring(1, url.length);
                    }
                    me.$data.recommendation = Object.assign({}, me.$data.recommendation);
                });

                me.updateTripList();
            });

        },
        initialMap: function(){

            var _this = this;

            function drawMap(resp, me){

                    me.popularity = resp.data;

                    var data = [];

                    for (i in me.popularity){
                        var name = null, color = null;
                        for (item in mapData){
                            if (mapData[item].code == me.popularity[i].Nation){
                                name = mapData[item].name;
                                color = mapData[item].color;
                            }
                        }
                        var location = {
                            code : me.popularity[i].Nation,
                            value : parseInt(me.popularity[i].count),
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
            }

            this.ajaxCall('api/get_location_popularity.php', 'POST', null, drawMap);
                        
        },
        initialChart: function(){
            this.ajaxCall('api/get_trip_popularity.php', 'POST', null, function callback(resp, me){
                for (var trip in resp.data){
                    resp.data[trip].count = parseInt(resp.data[trip].count);
                }
                resp.data.sort(function(a,b){return b.count - a.count});
                var count = 0,
                    sorted = [],
                    labels = [];

                while (count < 10 && resp.data[count] && resp.data[count].count > 0){
                    sorted.push(resp.data[count].count);
                    labels.push(resp.data[count].Trip);
                    count++;
                }

                var tripVis = document.getElementById("tripPopularVis");
                var heightTotal = document.getElementById('recommendation').offsetHeight;
                var heightMap = document.getElementById('map').offsetHeight;
                $("#chart").height(heightTotal - heightMap);
                document.getElementById("tripPopularVis").setAttribute("height",0);

                var color = [
                    '#cbe7fd'
                ];

                var tripData = {
                    labels: labels,
                    datasets: [{
                        label: 'number of applicants',
                        data: sorted,
                        backgroundColor: color,
                        borderColor:'#fff',
                        borderWidth: 1
                    }],
                    scaleShowGridLines: false,
                    scaleStepWidth : 0
                }
                
                new Chart(tripVis, {
                    type: 'horizontalBar',
                    data: tripData,
                    options: {
                        title: {
                            display: true,
                            text: 'The most popular trips'
                        },
                        scales: {
                            xAxes: [{
                                ticks: {
                                    min: 0
                                },
                                display: false
                            }],
                            yAxes: [{
                                lineWidth: 0
                            }]
                        }
                    }
                });
            });
        },
        openTripDetails: function(trip){
            this.tripDetail = trip;
            $('#modal-detail').modal('open');
        },
        closeTripDetails: function(){
            $('#modal-detail').modal('close');
        },
        initailNewTrip: function(){
            this.newTrip = {
                title: "",
                startDay: "",
                length: "1",
                location: "",
                description: "",
                remarks: "",
                requirement: "",
                budget: "",
                travelStyle: "",
                isPublic: true,
                imgUrl: "../uploadfile/images/default.jpg"
            }
        },
        changePage: function(pageNum) {
            this.curPage = pageNum;
        },
        onChangeShowStyle: function(style){
            this.showStyle = style;
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
    },
    watch: {
        curPage: function(newVal) {
          this.showingTrips = [];
          var i = 0;
          if (newVal < 1) newVal = 1;
          if (newVal > this.totalPageNumber) newVal = this.totalPageNumber;
          this.curPage = newVal;
          while(i < PAGE_LIMIT && this.public_trip[i + (newVal - 1) * PAGE_LIMIT]){
            this.showingTrips.push(this.public_trip[i + (newVal - 1) * PAGE_LIMIT]);
            i++;
          }
        }
      }
})
