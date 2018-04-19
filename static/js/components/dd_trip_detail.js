Vue.config.devtools = true;

Vue.component('dd-detail', {
    props: ['trip'],
    template: `
    <div class="row">
        <div class="col s3">
            <img class="materialboxed" style="width:100%; -webkit-box-shadow:3px 3px 5px rgba(33,33,33,0.7); box-shadow:3px 3px 5px rgba(33,33,33,0.7); border-radius:5px; border:5px solid #fff" src="{{trip.ImgUrl}}">
            <br>
        </div>
        <div class="col s9" style="border:2px dashed #dedada; border-radius:5px">
            <span class="detail">Travel Style: </span><i class="material-icons">{{trip.TravelStyleIcon}}</i>
            <br>
            <span class="detail">Start Date: </span><span>{{trip.StartDate}}</span>
            <br>
            <span class="detail">Days: </span><span>{{trip.Length}}</span>
            <br>
            <span class="detail">Location: </span><span>{{trip.Location}}</span>
            <br>
            <span class="detail">Description: </span><span>{{trip.TripDescription}}</span>
            <br>
            <span class="detail">Notes: </span><span>{{trip.Remarks}}</span>
            <br>
            <span class="detail">Requirements: </span><span>{{trip.Requirements}}</span>
            <br>
            <span class="detail">Budget: </span><span>{{trip.Budget}}</span>
            <br>
            <span class="detail">Participants: </span>
            <ul>
                <li v-for="i in trip.participants">
                    <span>{{i.Name}}</span>
                </li>
            </ul>
        </div>
    </div>
    `
})


