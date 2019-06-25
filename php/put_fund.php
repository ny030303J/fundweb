<?php
    require("db.php");

    header('Content-Type: application/json');
    
    $content = file_get_contents("php://input");
    error_log("fund: {$content}\n", 3, "d:/php_debug.log");
    $jsBody = json_decode($content);
    
    $qryParams = [
       $jsBody->number, $jsBody->name, $jsBody->endDate,
       $jsBody->total, $jsBody->current, $jsBody->image
    ];

    $sql = "insert into funds (number, name, enddate, total, current, image)
            values (?, ?, ?, ?, ?, ?)
            on duplicate key update
              name = values(name),
              enddate = values(enddate),
              total = values(total),
              current = values(current),
              image = values(image)";
     
    fetch($con, $sql, $qryParams);
    $json = json_encode(array('result' => 1, 'msg' => 'insert ok'));
    echo $json;
