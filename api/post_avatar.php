<?php

  $image = $_FILES['file'];
  $file_path = "../uploadfile/portraits/";
  $msg = "";

  $file = $_FILES["file"];
  if ($file["error"] == 0) {

  $typeArr = explode("/", $file["type"]);

  if($typeArr[0]== "image"){
    $imgType = array("png","jpg","jpeg");

    if(in_array($typeArr[1], $imgType)){
      $imgname = $file_path.time().".".$typeArr[1];
      $bol = move_uploaded_file($file["tmp_name"], $imgname);

      if($bol){
        $resp = [
          'status' => 'success',
          'data' => $imgname,
          'message' => "Upload Success！"
        ];
       } else {
        $resp = [
          'status' => 'fail',
          'data' => [],
          'message' => "Upload Fail！"
        ];
       };
      };
    } else {
      $resp = [
        'status' => 'fail',
        'data' => [],
        'message' => "No image, check again!"
      ];
    };
   } else {
      $resp = [
        'status' => 'fail',
        'data' => [],
        'message' => "Update fail. Image size too large!"
      ];;
   };

  //  header('Content-Type: application/json');
   echo json_encode($resp);

?>
