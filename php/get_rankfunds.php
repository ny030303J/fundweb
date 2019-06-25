<?php
    require("db.php");

    header('Content-Type: application/json');

/*
     if(trim($email) == "" || trim($password) == ""){
        $json = json_encode(array('result' => 0, 'msg' => '필수값이 비어있습니다.'));
        echo $json;
        exit;
    }
*/
    $sql = "SELECT number, name, enddate, total, current, (current * 100 / total) as ratio, image FROM test.funds ";
    $sql .= "where enddate > now() order by ratio desc limit 4";
    $investors = fetchAll($con, $sql, []);
    if(!$investors){
         $json = json_encode(array('result' => 0, 'msg' => 'investors not found.'));
         echo $json;
         exit;
    }
    $json = json_encode(array('result' => 1, 'data' => $investors));
    echo $json;
