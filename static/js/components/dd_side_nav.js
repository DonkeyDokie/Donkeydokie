Vue.config.devtools = true;

Vue.component('dd-side-nav', {
    props: ["user"],
    data: function(){
        return {
            talkingTo: "",
            socket: null,
            currentUser: this.user,
            history: [],
            historyMessage: {},
            offlineUsers: [],
            onlineUsers: [],
            sendMessage : ""
        }
    },
    template: `
        <ul id="slide-out" class="side-nav">
            <li>
                <div class="user-view">
                    <div class="background"><img style="width:100%" src="static/images/background12.jpg" alt="Unsplashed background img 2"></div>
                    <a href="#!user"><img class="circle header" src={{user.img}}></a>
                    <a href="#!login_name"><span class="white-text login_name">{{user.login_name}}</span></a>
                    <a href="#!email"><span class="white-text email">{{user.email}}</span></a>
                </div>
            </li>
            <li><a href="setting.html"><i class="material-icons">account_box</i>Setting</a></li>
            <span class="white-text">{{user.remarks}}</span>
            <li><a class="subheader" style="background-color:#d6f0ff">Online Users</a></li>
            <ul v-for="user in onlineUsers">
                <li><a class="waves-effect" href="#!" style="color:#415965" href="javascript:void(0)" @click="openChat(user)">{{user.LoginName}}<i class="material-icons prefix" style="visibility:{{user.hasMsg}}; color:#ffcc00; width:2px; font-size:12px">brightness_1</i></a></li>
            </ul>
            <li><a class="subheader" style="background-color:#d6f0ff">Offline Users</a></li>
            <ul v-for="user in offlineUsers">
                <li><a class="waves-effect" href="#!" style="color:#415965" href="javascript:void(0)" @click="openChat(user)">{{user.LoginName}}<i class="material-icons prefix" style="visibility:{{user.hasMsg}}; color:#ffcc00; width:2px; font-size:12px">brightness_1</i></a></li>
            </ul>
        </ul>
        <a href="#" data-activates="slide-out" class="button-collapse pulse" style="width:50px" @click="initialChat()"><i class="small material-icons">menu</i></a>
        
        <div id="modal-chat" class="modal" style="border: 5px solid #64b6f7; border-radius: 10px">
            <div class="modal-content">
                <div class="row">
                    <span style="font-size:20px;font-family:fantasy">Talking to </span><span style="font-size:20px;font-family:fantasy;color:#47b0ff;font-weight: bold;">{{talkingTo.LoginName}}</span><span>...</span>
                    <form class="col s12">
                    <div class="row">
                        <div class="input-field col s12" style="width:100% !important">
                            <div id="msgWindow" style="height: 400px; overflow:auto; border: 2px dashed #64b6f7;border-radius: 10px;">
                                <ul v-for="msg in historyMessage[parseInt(talkingTo.UserID)].message" style="margin:20px; margin-bottom:50px">
                                    <img v-if="msg.status == 'sender'" class="circle header avatar {{msg.status}}-img" src="{{user.img}}">
                                    <img v-if="msg.status == 'receiver'" class="circle header avatar {{msg.status}}-img" src="{{talkingTo.ImgUrl}}">
                                    <li class="{{msg.status}}">{{msg.msg}}</li>
                                    <br>
                                </ul>
                            </div>
                            <br>
                            <span style="font-size: 20px;font-family: fantasy;">Input text:</span>
                            <textarea id="icon_prefix2" class="materialize-textarea" v-model="sendMessage" style="border: 1px dashed #64b6f7;border-radius: 10px;margin-top: 20px;"></textarea>
                            </div>
                        </div>

                    </form>
                </div>
            </div>

            <div class="modal-footer">
                <a href="javascript:void(0)" class="btn-flat blue lighten-2" @click="sendChat">Send</a>
                <a href="javascript:void(0)" class="btn-flat blue lighten-2" @click="closeChat">Close</a>
            </div>
        </div>
        `, 
    ready: function(){
        
    },
    methods: {

        initialChat: function(){

            var _this = this;
            _this.initialSocket();

            $.ajax({
                method: 'POST',
                url: 'api/get_chat_messages.php',
                data: {
                    sender_id : -1,
                    user_id: _this.user.user_id
                },
                success: function(resp) {
                  if (!resp || resp.status !== 'success') {
                    return;
                  }
                  _this.history = resp.data;
                  _this.updateMsg();
                  $.ajax({
                        method: 'POST',
                        url: 'api/get_user_online_status.php',
                        success: function(resp) {
                        if (!resp || resp.status !== 'success') {
                            return;
                        }
                        _this.offlineUsers = resp.offline;
                        _this.onlineUsers = resp.online;
                        _this.showMsg();
                        },
                        error: function() { 
                        console.log("get participants fail");
                        }
                    });
                },
                error: function() { 
                }
            });
        },
        updateMsg(){
            var _this = this;
            _this.historyMessage = [];
            
            for (index in _this.history){
                if (_this.history[index].sender_id == this.currentUser.user_id){
                    if (!_this.historyMessage[_this.history[index].receiver_id]){
                        _this.historyMessage[_this.history[index].receiver_id] = {
                            read : _this.history[index].read,
                            message : []
                        };
                    }
                    _this.historyMessage[_this.history[index].receiver_id].read = _this.history[index].read;
                    _this.historyMessage[_this.history[index].receiver_id].message.push({
                        status: "sender",
                        msg: _this.history[index].message
                    });
                }
                if (_this.history[index].receiver_id == this.currentUser.user_id){
                    if (!_this.historyMessage[_this.history[index].sender_id]){
                        _this.historyMessage[_this.history[index].sender_id] = {
                            read : _this.history[index].read,
                            message : []
                        };
                    }
                    _this.historyMessage[_this.history[index].sender_id].read = _this.history[index].read;
                    _this.historyMessage[_this.history[index].sender_id].message.push({
                        status: "receiver",
                        msg: _this.history[index].message
                    });
                }
            }
        },
        showMsg(){
            var _this = this;
            for (index in _this.onlineUsers){
                _this.onlineUsers[index].hasMsg = "hidden";
                _this.onlineUsers[index].msg = "";
            }
            for (index in _this.offlineUsers){
                _this.offlineUsers[index].hasMsg = "hidden";
                _this.offlineUsers[index].msg = "";
            }
            for (index in _this.onlineUsers){
                var uid = _this.onlineUsers[index].UserID;
                if (_this.historyMessage[uid] && _this.historyMessage[uid].read == "0"){
                    _this.onlineUsers[index].hasMsg = "visible";
                    _this.onlineUsers[index].msg = _this.historyMessage[uid];
                }
            }
            for (index in _this.offlineUsers){
                var uid = _this.offlineUsers[index].UserID;
                if (_this.historyMessage[uid] && _this.historyMessage[uid].read == "0"){
                    _this.offlineUsers[index].hasMsg = "visible";
                    _this.offlineUsers[index].msg = _this.historyMessage[uid];
                }
            }

        },
        initialSocket: function(){
            var _this = this;

            if (_this.socket) return;
            var host = "ws://donkeydokie.gcsenyan.com:9000";
            var socket = new WebSocket(host);
            
            _this.socket = socket;
            _this.socket.onopen = function(msg) 
            { 
                if(this.readyState == 1)
                {
                    socket.send(JSON.stringify({
                      user_id: _this.user.user_id,
                      receiver_id: -1,
                      msg: "[OPEN]"
                    }));
                }
            };

            //Message received from websocket server
            _this.socket.onmessage = function(msg) 
            { 
                if (JSON.parse(msg.data).status === "ack"){
                    $.ajax({
                        method: 'POST',
                        url: 'api/get_chat_messages.php',
                        data: {
                            sender_id : _this.talkingTo.UserID,
                            user_id: _this.user.user_id
                        },
                        success: function(resp) {
                        if (!resp || resp.status !== 'success') {
                            return;
                        }
                        _this.history = resp.data;
                        _this.updateMsg();
                        _this.showMsg();
                        _this.$data.historyMessage = Object.assign({}, _this.$data.historyMessage);
                        },
                        error: function() { 
                        }
                    });
                } else if (JSON.parse(msg.data).status === "message"){
                    var data = JSON.parse(msg.data);
                    if (_this.historyMessage[data.sender_id]){
                        _this.historyMessage[data.sender_id].message.push({
                            msg : data.message,
                            status : "receiver"
                        });
                    }
                    _this.$data.historyMessage = Object.assign({}, _this.$data.historyMessage);
                    var div = document.getElementById('msgWindow');
                    div.scrollTop = div.scrollHeight;
                }
            };
            
            //Connection closed
            _this.socket.onclose = function(msg) 
                { 
                    socket.send(JSON.stringify({
                    user_id: _this.user.user_id,
                    receiver_id: -1,
                    msg: "[CLOSE]"
                }));
            };
                         
            _this.socket.onerror = function()
            {
            }
        },
        openChat: function(receiver){
            var _this = this;
            _this.talkingTo = receiver;

            $.ajax({
                method: 'POST',
                url: 'api/get_chat_messages.php',
                data: {
                    sender_id : _this.talkingTo.UserID,
                    user_id: _this.user.user_id
                },
                success: function(resp) {
                    if (!resp || resp.status !== 'success') {
                        return;
                    }
                },
                error: function() { 
                }
            });

            var url = _this.talkingTo.ImgUrl;
            if (url[0] == "\""){
                _this.talkingTo.ImgUrl = "\././" + url.substring(2, url.length - 1);
            } else if (url[0] == "."){
                _this.talkingTo.ImgUrl = "\././" + url.substring(1, url.length);
            }

            $('#modal-chat').modal('open');
        },
        closeChat: function(){
            $('#modal-chat').modal('close');
        },
        sendChat: function(){

            var _this = this;

            try
            { 
                _this.socket.send(JSON.stringify({
                    user_id: _this.currentUser.user_id,
                    receiver_id: _this.talkingTo.UserID,
                    msg: _this.sendMessage
                }));
            } 
            catch(ex) 
            { 
            }
            
        }
    },
    watch: {
        user() {
            this.currentUser = this.user;
        },
        offlineUser() {
            this.offlineUsers = this.offline;
        },
        onlineUser() {
            this.onlineUsers = this.online;
        },
        talkingTo() {
            this.talkingTo = this.talkingTo;
        }
    }
})


