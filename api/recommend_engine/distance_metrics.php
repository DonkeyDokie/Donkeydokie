<?php

function get_cosine_similarity($feature1, $feature2) {
    $dot = _dot_product($feature1, $feature2);
    $normalize = (sqrt(_dot_product($feature1, $feature1))) 
                    * (sqrt(_dot_product($feature2, $feature2)));          
    return $dot / $normalize;
}

function _dot_product($arr1, $arr2) {
    return array_sum(array_map(
                        function($a, $b) {return $a * $b; }, 
                        $arr1, $arr2));   
}

?>