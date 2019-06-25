<?php
  require("db.php");

  $sql1 = "create table if not exists `funds` (
      `number` varchar(20) not null,
      `name` varchar(120) default null,
      `enddate` datetime default null,
      `total` int(11) default null,
      `current` int(11) default null,
      `image` mediumtext default null,
      `createtm` datetime default current_timestamp,
      primary key (`number`)
    ) engine=innodb default charset=utf8";
  fetch($con, $sql1);

  $sql2 = "create table if not exists `investors` (
      `number` varchar(8) not null,
      `name` varchar(120) default null,
      `total` int(11) default null,
      `email` varchar(120) not null,
      `money` int(11) default null,
      `sign` mediumtext,
      `investtm` datetime default current_timestamp,
      primary key (`number`)
    ) engine=innodb default charset=utf8";
  fetch($con, $sql2);

  $sql3 = "create table  if not exists `users` (
      `email` varchar(120) not null,
      `nickname` varchar(120) not null,
      `password` varchar(120) not null,
      `level` int(11) not null,
      primary key (`email`)
    ) engine=innodb default charset=utf8";
  fetch($con, $sql3);

  $json = json_encode(array('result' => 1, 'msg' => 'success.'));
  echo $json;
