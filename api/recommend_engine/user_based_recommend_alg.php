<?php

class userBasedRecommend {

    private function get_user_similarity($preferences, $user_1, $user_2) {
        $common_trip = array();
        $dist = 0;
        $similarity = 0;

        foreach ($preferences[$user_1] as $trip=>$score) {
            if (array_key_exists($trip, $preferences[$user_2])) {
                $common_trip[$trip] = 1;
            }
        }

        if (count($common_trip) == 0) {
            return 0;
        }

        foreach ($preferences[$user_1] as $trip=>$score) {
            if (array_key_exists($trip, $preferences[$user_2])) {
                $dist += pow($score - $preferences[$user_2][$trip], 2);
            }
        }

        return $similarity = 1 / (1 + sqrt($dist)); 
    }

    public function get_recommendations($preferences, $target_user) {
        $candidate_scores = array();
        $sum_similarity = array();
        $ranks = array();
        $curr_similarity = 0;

        foreach ($preferences as $other_user=>$info) {
            if ($other_user != $target_user) {
                $curr_similarity = $this->get_user_similarity($preferences, $target_user, $other_user);

            }

            if ($curr_similarity > 0) {
                foreach($preferences[$other_user] as $trip=>$score) {
                    if (!array_key_exists($trip, $preferences[$target_user])) {
                        if (!array_key_exists($trip, $candidate_scores)) {
                            $candidate_scores[$trip] = 0;
                        }
                        $candidate_scores[$trip] += $preferences[$other_user][$trip] * $curr_similarity;
    
                        if (!array_key_exists($trip, $sum_similarity)) {
                            $sum_similarity[$trip] = 0;
                        }
                        $sum_similarity[$trip] += $curr_similarity;
                    }
                }
            }

        }

        foreach ($candidate_scores as $trip=>$score) {
            $ranks[$trip] = $score / $sum_similarity[$trip];
        }
        
        arsort($ranks);
        return $ranks;
    }
}

?>