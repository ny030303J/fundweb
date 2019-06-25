<?php
    require("db.php");

    header('Content-Type: application/json');

    $email = $_POST['email'];
    $password = $_POST['password'];

    error_log("email: '$email'\n", 3, "d:/php_debug.log");
    error_log("password: '$password'\n", 3, "d:/php_debug.log");

    if(trim($email) == "" || trim($password) == ""){
        $json = json_encode(array('result' => 0, 'msg' => '필수값이 비어있습니다.'));
        echo $json;
        exit;
    }

    $sql = "select * from users where email = ? and password = password(?)";
    $user = fetch($con, $sql, [$email, $password]);
    if(!$user){
         $json = json_encode(array('result' => 0, 'msg' => '아이디나 비밀번호가 잘못되었습니다.'));
         echo $json;
         exit;
    }
    error_log("user: {$user->nickname}\n", 3, "d:/php_debug.log");

    $_SESSION['user'] = $user;
    $json = json_encode(array('result' => 1, 'user' => $user->nickname));
    echo $json;
