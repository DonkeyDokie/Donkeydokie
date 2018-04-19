Vue.config.devtools = true;

var app = new Vue({
    el: '#app',
    data: function() {
        return {
            sign_in_email: "",
            sign_in_password: "",
            sign_up_login_name: "",
            sign_up_name: "",
            sign_up_remarks: "",
            sign_up_password: "",
            sign_up_confirmed_password: "",
            sign_up_email: "",
            active_user_number: 0,
            message: ""
        }
    }, 
    ready: function() {
        $('.modal').modal();
        console.log("Index html loaded successfully!");
        this.getActiveUserNumber();
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
        onSignUpSubmit: function(){
            var _this = this;
            _this.message = "";
            // ajax 
            var xhr = $.ajax({
                method: 'POST',
                url: 'api/sign_up.php',
                datatype:'json',
                data: {
                    email: this.sign_up_email,
                    password: this.sign_up_password,
                    login_name: this.sign_up_login_name,
                    confirmed_password: this.sign_up_confirmed_password
                },
                success: function(resp) {
                    if (!resp || resp.status !== "success") {
                        console.log(resp);
                        _this.message = resp.message;
                        return;
                    }
                    document.cookie = 'DonkeyDokieAUTH=' + xhr.getResponseHeader('Session-Key') + '; expires='+ new Date(xhr.getResponseHeader('Session-Key')*1000); 
                    location.href = 'setting.html'; 
                },
                error: function() { 
                    console.log(resp);
                }
            });
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
        }

    }
})
