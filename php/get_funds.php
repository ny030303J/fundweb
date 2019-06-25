<?php
    require("db.php");

    header('Content-Type: application/json');

    $page = "0";
    if (isset($_GET['page'])) {
       $page = $_GET['page'];
    }
    $count = fetch($con, "select count(number) count from test.funds");

//    $sql = "select number, name, enddate, total, current, image, (current * 100 / total) as ratio from test.funds ";
//    $sql .= "order by createtm limit {$page}, 10";

    $sql  = "select a.number, a.name, a.enddate, a.total, ";
    $sql .= "  @investSum := ifnull((select sum(b.money) from investors b where a.number = b.number), 0) as current, ";
    $sql .= "  (select count(c.number) from investors c where a.number = c.number) count, ";
    $sql .= "  round((@investSum * 100 / a.total), 1) as ratio, image ";
    $sql .= "from funds a limit {$page}, 10 ";
    $investors = fetchAll($con, $sql);
    if(!$investors){
         $json = json_encode(array('result' => 0, 'msg' => 'investors not found.'));
         echo $json;
         exit;
    }
    $json = json_encode(array('result' => 1, 'page' => $page, 'count' => $count->count, 'data' => $investors));
    echo $json;
?>