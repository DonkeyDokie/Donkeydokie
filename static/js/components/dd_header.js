Vue.config.devtools = true;

Vue.component('dd-header', {
    props: ["url"],
    template: `
        <ul id="dropdown1" class="dropdown-content" style="none">
            <li>
                <a v-if="url==='public_trip'" class="amber lighten-3 grey-text text-darken-2" href="public_trip.html"><i class="material-icons">home
                </i>Home</a>
                <a v-else class="grey-text text-darken-2" href="public_trip.html"><i class="material-icons">home
                </i>Home</a></li>
            <li class="divider"></li>
            <li>
                <a v-if="url==='posts'" class="amber lighten-3 grey-text text-darken-2" href="posts.html">
                <i class="material-icons">card_travel</i>My posts</a>
                <a v-else class="grey-text text-darken-2" href="posts.html">
                <i class="material-icons">card_travel</i>My posts</a></li>
            <li>
                <a v-if="url==='trips'" class="amber lighten-3 grey-text text-darken-2" href="trips.html"><i class="material-icons">terrain
                </i>My trips</a>
                <a v-else class="grey-text text-darken-2" href="trips.html"><i class="material-icons">terrain
                </i>My trips</a></li>
            <li>
                <a v-if="url==='applications'" class="amber lighten-3 grey-text text-darken-2" href="applications.html">
                <i class="material-icons">storage</i>My applications</a>
                <a v-else class="grey-text text-darken-2" href="applications.html">
                <i class="material-icons">storage</i>My applications</a>
            </li>
            <li class="divider"></li>
            <li>
                <a v-if="url==='setting'" class="amber lighten-3 grey-text text-darken-2" href="setting.html">
                <i class="material-icons">Profile</i></a>
                <a v-else class="grey-text text-darken-2" href="setting.html">
                <i class="material-icons">settings</i>Profile</a></li>
            <li><a class="grey-text text-darken-2" href="."><i class="material-icons">input</i>Log out</a></li>
        </ul>
        <nav>
            <div class="nav-wrapper grey darken-3">
            <a href="javascript:void(0)" class="brand-logo" style="height:75px"><img height="75px" style="padding:5px" src="./static/logo.png"></a>
                <ul id="nav-mobile" class="right hide-on-med-and-down grey darken-2">
                    <li>
                        <a class="dropdown-button" href="#!" data-activates="dropdown1">Menu
                            <i class="material-icons right">arrow_drop_down</i>
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    `
})


