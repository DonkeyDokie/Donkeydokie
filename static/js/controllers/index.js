Vue.config.devtools = true;

var app = new Vue({
    el: '#app',
    data: function() {
        return {
            sign_in_email: "",
            sign_in_password: "",
            sign_up_info: {},
            sign_up_recommend: {
                budget_idx: 5000,
                travel_len_idx: 15,
                travel_style_vec: [5, 5, 5, 5, 5, 5, 5]
            },
            active_user_number: 0,
            message: ""
        }
    }, 
    ready: function() {

        $('.modal').modal();
        $('.carousel.carousel-slider').carousel({fullWidth: true});
        $('.carousel').carousel({
            swipeable: false
        });
    
        this.getActiveUserNumber();

        var $_file = document.getElementById("avatar");
        var img_box = document.getElementById("previewAvatar");
        img_box.style.backgroundImage = 'url("uploadfile/avatar.png")';
        img_box.style.backgroundPosition = 'center';
        img_box.style.backgroundSize = '100%';
        img_box.style.backgroundRepeat = 'no-repeat';

        $_file.addEventListener('change',function () {
            var file = $_file.files[0];
            var readerFile = new FileReader();
            readerFile.onload = function (ev) {
            var data = ev.target.result;
            img_box.style.backgroundImage = 'url(' +data+ ')';
            }
            readerFile.readAsDataURL(file);
        })

    },
    methods: {
        onSignInSubmit: function(){
            var _this = this;
            _this.message = "";
            var xhr = $.ajax({
                method: 'POST',
                url: 'api/sign_in.php',
                datatype:'json',
                data: {
                    email: this.sign_in_email,
                    password: this.sign_in_password
                },
                success: function(resp) {
                    if (!resp || resp.status !== "success") {
                        _this.message = resp.message;
                        return;
                    }
                    document.cookie = 'DonkeyDokieAUTH=' + xhr.getResponseHeader('Session-Key') + '; expires='+ new Date(xhr.getResponseHeader('Session-Key')*1000); 
                    location.href = 'public_trip.html'; 
                },
                error: function() { 
                    console.log(resp);
                }
            });
        },
        onSignUpOpen: function(){
            var _this = this;
            _this.message = "";
            // ajax 

            if (!_this.sign_up_info.login_name){
                _this.message = "Please enter login name!"
                $('#modal-message').modal('open');
                return;
            }

            if (!_this.sign_up_info.password){
                _this.message = "Please enter password!"
                $('#modal-message').modal('open');
                return;
            }

            if (!_this.sign_up_info.confirmed_password){
                _this.message = "Please enter password again!"
                $('#modal-message').modal('open');
                return;
            }

            if (!_this.sign_up_info.email){
                _this.message = "Please enter email!"
                $('#modal-message').modal('open');
                return;
            }

            if (_this.sign_up_info.confirmed_password != _this.sign_up_info.password){
                _this.message = "Password do not match"
                $('#modal-message').modal('open');
                return;
            }

            $('#modal-signup').modal('open');

        },
        onSignUpSubmit: function(){
            
            var budget = this.sign_up_recommend.budget_idx;
            var length = this.sign_up_recommend.travel_len_idx;
            var _this = this;

            if (budget < 100) this.sign_up_recommend.budget_idx = 0;
            else if (budget < 1000) this.sign_up_recommend.budget_idx = 1;
            else if (budget < 5000) this.sign_up_recommend.budget_idx = 2;
            else if (budget < 10000) this.sign_up_recommend.budget_idx = 3;
            else this.sign_up_recommend.budget_idx = 4;

            if (budget < 3) this.sign_up_recommend.travel_len_idx = 0;
            else if (budget < 7) this.sign_up_recommend.travel_len_idx = 1;
            else if (budget < 15) this.sign_up_recommend.travel_len_idx = 2;
            else if (budget < 30) this.sign_up_recommend.travel_len_idx = 3;
            else this.sign_up_recommend.travel_len_idx = 4;

            var image = $(_this.$el).find('#avatar')[0].files[0];
            var fd = new FormData();
            fd.append('file',image);
            _this.sign_up_info.imgUrl = '../uploadfile/portraits/default.jpg';

            if (!image){
                this.ajaxCall('api/sign_up.php', 'POST', _this.sign_up_info, function callback(resp, me, xhr){
                  me.message = resp.message;
                  document.cookie = 'DonkeyDokieAUTH=' + xhr.getResponseHeader('Session-Key') + '; expires='+ new Date(xhr.getResponseHeader('Session-Key')*1000);
                    var data = {
                        user_id: resp.data.user_id,
                        budget_idx: _this.sign_up_recommend.budget_idx,
                        travel_len_idx: _this.sign_up_recommend.travel_len_idx,
                        travel_style_vec: _this.sign_up_recommend.travel_style_vec
                    }
                    _this.ajaxCall('api/recommend_engine/get_content_based_recom_trip.php', 'POST', data, function callback(resp, me){
                        location.href = 'public_trip.html'; 
                    });
                });
              } else {
                $.ajax({
                  url: 'api/post_avatar.php',
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
                            _this.sign_up_info.imgUrl = resp.data;
                            
                            _this.ajaxCall('api/sign_up.php', 'POST', _this.sign_up_info, function callback(resp, me, xhr){
                                me.message = resp.message;
                                document.cookie = 'DonkeyDokieAUTH=' + xhr.getResponseHeader('Session-Key') + '; expires='+ new Date(xhr.getResponseHeader('Session-Key')*1000);
                                var data = {
                                    user_id: resp.data.user_id,
                                    budget_idx: _this.sign_up_recommend.budget_idx,
                                    travel_len_idx: _this.sign_up_recommend.travel_len_idx,
                                    travel_style_vec: _this.sign_up_recommend.travel_style_vec
                                }
                                _this.ajaxCall('api/recommend_engine/get_content_based_recom_trip.php', 'POST', data, function callback(resp, me){
                                    console.log(resp);
                                });
                                location.href = 'public_trip.html'; 
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
        onChangeToSignIn: function(){
            var _this = this;
            _this.message = "";
            $('#modal-login').modal('open');
        },
        onSignInCancel: function(){
            var _this = this;
            _this.message = "";
            $('#modal-login').modal('close');
        },
        nextPage: function(){
            $('.carousel').carousel('next');
        },
        prevPage: function(){
            $('.carousel').carousel('prev');
        },
        getActiveUserNumber: function() {
            var _this = this;
            $.ajax({
                method: 'GET',
                url: 'api/get_active_user.php',
                success: function(resp) {
                    if (!resp || resp.status !== "success") {
                        console.log(resp);
                        _this.message = resp.message;
                        return;
                    }
                    _this.active_user_number = resp.data.length;
                    console.log(resp.data);
                },
                error: function() { 
                    console.log(resp);
                }
            });
        },
        onCloseMessage: function() {
            $('#modal-message').modal('close');
        },
        ajaxCall: function(url, method, data, callback){

            var _this = this;
        
            var aj = $.ajax({
              method: method,
              url: url,
              datatype:'json',
              data: data,
              success: function(resp) {
                if (!resp.status) resp = JSON.parse(resp);
                if (!resp || resp.status !== 'success') {
                  return;
                }
                callback(resp, _this, aj);
              },
              error: function() { 
                console.log(resp.message);
              }
            });
          }
    }
})
