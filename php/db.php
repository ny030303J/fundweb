<?php
session_start();
$dsn = "mysql:host=localhost;port=3307;dbname=test;charset=utf8";
$con = new PDO($dsn);
//$dsn = "mysql:host=gondr.asuscomm.com;dbname=yy_10125;charset=utf8mb4";
//$con = new PDO($dsn, "yy_10125", "1234");

function query($con, $sql, $param = []){
    $q = $con->prepare($sql);
    $cnt = $q->execute($param);
    return $cnt;
}

function fetch($con, $sql, $param = []){
    $q = $con->prepare($sql);
    $q->execute($param);
    return $q->fetch(PDO::FETCH_OBJ);
}

function fetchAll($con, $sql, $param = []){
    $q = $con->prepare($sql);
    $q->execute($param);
    return $q->fetchAll(PDO::FETCH_OBJ);
}

//function msgAndGo($msg, $link){
//    echo "<script>";
//    echo "alert('$msg');";
//    echo "location.href='$link';";
//    echo "</script>";
//}
//
//function msgAndBack($msg){
//    echo "<script>";
//    echo "alert('$msg');";
//    echo "history.back();";
//    echo "</script>";
//}