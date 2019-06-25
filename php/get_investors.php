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
    $sql = "select a.number, b.name, c.nickname, b.total, a.money, ";
    $sql .= "  (a.money * 100 / b.total) as ratio, a.sign from test.investors a ";
    $sql .= "inner join test.funds b on a.number = b.number ";
    $sql .= "inner join test.users c on a.email = c.email ";
    $sql .= "order by a.investtm desc";
    $investors = fetchAll($con, $sql, []);
    if(!$investors){
         $json = json_encode(array('result' => 0, 'msg' => 'investors not found.'));
         echo $json;
         exit;
    }
    $json = json_encode(array('result' => 1, 'data' => $investors));
    echo $json;
