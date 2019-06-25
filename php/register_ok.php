<?php
    header('Content-Type: application/json');

    $email = $_POST['email'];
    $nick = $_POST['nick'];
    $password = $_POST['password'];
    $password2 = $_POST['password2'];

    if(trim($email) == "" || trim($nick) == "" || trim($password) == ""){
        echo json_encode(array('result' => 0, 'msg' => '필수 값이 누락되었습니다.'));
        exit;
    }

    if($password != $password2) {
        echo json_encode(array('result' => 0, 'msg' => '비밀번호와 비밀번호 확인이 다릅니다.'));
        exit;
    }

    require("db.php");

    $sql = "insert into users(`email`, `nickname`, `password`, `level`) values (?, ?, password(?), 1)";
    $cnt = query($con, $sql, [$email, $nick, $password]);

    if($cnt == 1){
        echo json_encode(array('result' => 1, '회원가입 성공'));
        exit;
    }else{
        echo json_encode(array('result' => 0, '회원가입 실패, DB오류'));
        exit;
    }