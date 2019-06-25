<?php
    require("db.php");

    header('Content-Type: application/json');

    $content = file_get_contents("php://input");
    error_log("investor: {$content}\n", 3, "d:/php_debug.log");
    $jsBody = json_decode($content);

    $qryParams = [
       $jsBody->number, $jsBody->name, $jsBody->total,
       $jsBody->email, $jsBody->myMoney, $jsBody->mySign
    ];

    $sql =  "insert into investors (number,email,name,total,money,sign,investtm)";
    $sql .= "  values (?,?,?,?,?,?,now())";
    $sql .= "  on duplicate key update money = money + values(money)";

    $sql = "insert into investors (number, name, total, email, money, sign)
            values (?, ?, ?, ?, ?, ?)
            on duplicate key update
              name = values(name),
              total = values(total),
              email = values(email),
              money = values(money),
              sign = values(sign)";

   fetch($con, $sql, $qryParams);
   $json = json_encode(array('result' => 1, 'msg' => 'insert ok'));
   echo $json;
