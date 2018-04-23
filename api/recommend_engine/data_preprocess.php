<?php


// --------------------------- For user based. ---------------------------

function get_preferences($sql_user_trip, $user_features, $trip_features) {
    /** 
     * Create preferences array from database: user_id => trip_id => score.
     * Args: 
     *      $sql_user_trip: Result of sql query. Each row has user_id, trip_id.
     *      $user_features: Array (user_id => user_feature, ..).
     *      $trip_features: Features of all trips, array (trip_id => feature_vec, ..).
     * 
     * Return type:
     * Example (replace id with names, values represents for scores):
     * array (
     *      "user_1" => array("trip_1" => 2.5, "trip_2" => 3.5, ...),
     *      "user_2" => array("trip_4" => 5, "trip_1" => 1, ...),
     *      ...
     * );
     * 
     * Might then passed to get_recommendations() to get trip rankings.
     */

    $user_trips = array();
    $score = 0;

    while ($row = $sql_user_trip->fetch_assoc()) {
        $tmp_uid = $row["UserID"];
        $tmp_tid = $row["TripID"];
        $trip_feature = $trip_features[$tmp_tid]; // Trip feature must exist.

        if (!array_key_exists($tmp_uid, $user_trips)) {
            $user_trips[$tmp_uid] = array();
        }

        // Compute score of each trip of this user.
        // If user feature exist, score = cosine_sim(user_feature, trip_festure).
        // Otherwise set score = -1, then finally to 1/n, n = #trips_this_user_has (might need tuning).
        if (!array_key_exists($tmp_tid, $user_trips[$tmp_uid])) {

            if (array_key_exists($tmp_uid, $user_features)) {
                $user_feature = $user_features[$tmp_uid];
                $score = _get_single_score($trip_feature, $user_feature);
            } else {
                $score = -1;
            }
            
            $user_trips[$tmp_uid][$tmp_tid] = $score;
        }
    }

    // Convert score = -1 to 1/n for no user_feature users.
    foreach($user_trips as $user_id=>$trip_scores_arr) {
        if (array_values($trip_scores_arr)[0] == -1) {
            $count = count($trip_scores_arr);
            foreach($trip_scores_arr as $trip_id=>$score) {
                $score = 1 / $count;
                $user_trips[$user_id][$trip_id] = $score;
            }
        }  
    }

    return $user_trips;
}


function _get_single_score($trip_feature, $user_feature) {
    require_once("distance_metrics.php");
    // May need to multiply by some scaling factor.
    return get_cosine_similarity($trip_feature, $user_feature);
}



// --------------------------- For content based. ---------------------------

function get_all_features($sql_result, $budget_range = null, $travel_len_range = null) {
    /**
     * Get features for all selected trips in database.
     * Returns: 
     *      $features: array( trip_id => feature vector, ... )
     */

    // Set default budget and travel length range.
    if (null === $budget_range) {
        $budget_range = array(100, 1000, 5000, 10000);
    }
    if (null === $travel_len_range) {
        $travel_len_range = array(3, 7, 15, 30);
    }

    $features = array();

    while ($row = $sql_result->fetch_assoc()) {
        // Retrieve data.
        $trip_id = $row["TripID"];
        $travel_style_vec = _get_travel_style_vec($row["TravelStyleID"]);
        $budget_idx = _get_idx_from_range($row["Budget"], $budget_range);
        $travel_len_idx = _get_idx_from_range($row["Length"], $travel_len_range);
        
        // Create feature vector for one trip.
        $feature_vec = get_single_feature_vec($travel_style_vec, $budget_idx, $travel_len_idx);

        // Add the vector to final array. (Note that trip_id is unique)
        $features[$trip_id] = $feature_vec; 
    }

    return $features;
}


function get_single_feature_vec($travel_style_vec, $budget_idx, $travel_len_idx) {
    /**
     * Create feature representation for a single trip (or from a new user's choice) 
     * for content-based recommmendation.
     * Args: 
     *      $travel_style_vec: 1d vector in shape (7,), with each entry being a 0~5
     *          score of a travel style set by a user. 
     *      $budget_idx: Scalar index of budget range. Default range:
     *          index: range
     *              0: [0, 100)
     *              1: [100, 1000)
     *              2: [1000, 5000)
     *              3: [5000, 10000)
     *              4: [10000, ...)
     *      $travel_len_idx: Scalar index of travel length range. Default range:
     *          index: range
     *              0: [0, 3) days
     *              1: [3, 7) days (1 week)
     *              2: [7, 15) days (half month)
     *              3: [15, 30) days (1 month)
     *              4: [30, ...) 
     * Returns:
     *      $feature_vec: 1d vector in shape (17,), with key being numeric indexes.             
     */

    // Normalize the travel_style_vec to ensure numeric stability.
    $norm = array_sum($travel_style_vec);
    if ($norm != 0) {
        $travel_style_vec = array_map(
                                function($val, $factor) {return $val/$factor; }, 
                                $travel_style_vec, 
                                array_fill(0, count($travel_style_vec), $norm));
    }
    
    // One-hot representation for budget range.
    $budget_vec = array_fill(0, 5, 0);
    $budget_vec[$budget_idx] = 1;

    // One-hot representation for travel length range.
    $travel_len_vec = array_fill(0, 5, 0);
    $travel_len_vec[$travel_len_idx] = 1;

    // Concatenate above vectors.
    $feature_vec = array_merge($travel_style_vec, $budget_vec, $travel_len_vec);
    $feature_vec = array_values($feature_vec);

    return $feature_vec;
}


function _get_travel_style_vec($idx) {
    /**
     * Get travel style vector (one-hot) for a single trip in database.
     */
    $travel_style_vec = array_fill(0, 7, 0);
    $travel_style_vec[$idx-1] = 1;

    return $travel_style_vec;
}


function _get_idx_from_range($attribute, $range) {
    /**
     * Get budget/travel_len index according to their ranges specified in 
     * get_single_feature_vec() (the range can also be set later).
     */    
    $idx = -1;
    // Set index of attribute smaller than the largest element in $range.
    for ($i = 0; $i < count($range); $i++) {
        if ($attribute < $range[$i]) {
            $idx = $i;
            break;
        }
    }
    // Set index of attribute larger than the largest element in $range.
    if ($idx == -1) {
        $idx = count($range);
    }

    return $idx;
}

?>