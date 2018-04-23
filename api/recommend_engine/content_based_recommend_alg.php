<?php

class contentBasedRecommend {

    public function get_recommendations($trip_features, $user_feature) {
        /**
         * Recommend trips similar to user specified features according to 
         * cosine similarity.
         * Args: 
         *      $trip_features: Feature array for all trips in database.
         *      $user_feature: User selected feature upon registeration.
         * Return:
         *      $ranks: Ranking array (trip_id => score, ...)
         */
        require_once("distance_metrics.php");
        $score = 0;
        $ranks = array();
        
        foreach($trip_features as $trip_id=>$trip_feature) {
            $score = get_cosine_similarity($trip_feature, $user_feature);
            $ranks[$trip_id] = $score;
        }

        arsort($ranks);
        return $ranks;
    }


}




?>