<?php

error_reporting(E_ALL);

$out = array();

 for($i=3; $i<=6; $i++){
    $data = date('Y-m-d', strtotime("+".$i." days"));
    $out[] = array(
        'id' => $i,
        'title' => 'Hurry up and wait '.$i,
        'url' => '/missions/details.html?sad=123-2456',
        'class' => 'event-important',
        'start' => strtotime($data).'000'
    );
}

echo json_encode(array('success' => 1, 'result' => $out));
exit;
