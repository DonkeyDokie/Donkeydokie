Vue.config.devtools = true;

Vue.component('dd-search', {
    template: `
        <nav class="search_nav">
        <div class="nav-wrapper search white">
        <form>
            <div class="input-field">
                <input id="search" type="search" required>
                <label class="label-icon" for="search"><i class="material-icons" style="color:grey">search</i></label>
                <i class="material-icons">close</i>
            </div>
        </form>
        </div>
    </nav>
    `,
    data: function() {
      return {
        user: {}
      }
    }
})


