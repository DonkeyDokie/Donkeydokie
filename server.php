#!/usr/bin/env php
<?php

require_once('./websockets.php');

class DonkieDokieChatServer extends WebSocketServer {
  var $sockets_dict = array();
  var $userID2socketID= array();
  
  protected function process ($user, $message) {

    $json = json_decode($message);
    if (is_null($json)) { return; }
    $server_name = $_SERVER["server_name"];
    $db_username = $_SERVER["db_username"];
    $db_password = $_SERVER["db_password"];
    $db_name = $_SERVER["db_name"];

    $this->dd_log($message);
    $this->storeMessage($message);

    $socket_id = $user->id;
    $sender_id = $json->{'user_id'};
    $receiver_id = $json->{'receiver_id'};
    $message = $json->{'msg'};
    $this->sockets_dict[$sender_id] = $user;
    if ($message == "[OPEN]") {
        fwrite(STDOUT, "Sender ");
        fwrite(STDOUT, $sender_id);
        fwrite(STDOUT, " is Online!\n");
        $this->takeUserOnline($sender_id);
        $this->userID2socketID[$sender_id] = $socket_id;
    } elseif (array_key_exists($receiver_id, $this->sockets_dict)) {
        $receiver_socket = $this->sockets_dict[$receiver_id];
        $message_obj = [
          'sender_id' => $sender_id,
          'message' => $message,
          'status' => 'message'
        ];

        fwrite(STDOUT, "Send From Server!\n");
        $this->send($receiver_socket, json_encode($message_obj));
    }

    $this->ack($sender_id);
  }

  protected function ack($sender_id) {
    $message_obj = [
      'sender_id' => $sender_id,
      'status' => 'ack'
    ];
    $sender_socket = $this->sockets_dict[$sender_id];
    $this->send($sender_socket, json_encode($message_obj));
  }

  protected function dd_log($message) {
    $json = json_decode($message);
    if (is_null($json)) { return; }

    $sender_id = $json->{'user_id'};
    $receiver_id = $json->{'receiver_id'};

    fwrite(STDOUT, "****** Receive New Message ******\n");
    fwrite(STDOUT, "Receive a message from: \n");
    fwrite(STDOUT, $sender_id);
    fwrite(STDOUT, "\n");
    fwrite(STDOUT, "Message sent to: \n");
    fwrite(STDOUT, $receiver_id);
    fwrite(STDOUT, "\n");
  }
  
  protected function connected ($user) {
    // Do nothing: This is just an echo server, there's no need to track the user.
    // However, if we did care about the users, we would probably have a cookie to
    // parse at this step, would be looking them up in permanent storage, etc.
    fwrite(STDOUT, "****** A user connected ******\n");
  }
  
  protected function closed ($user) {
    // Do nothing: This is where cleanup would go, in case the user had any sort of
    // open files or other objects associated with them.  This runs after the socket 
    // has been closed, so there is no need to clean up the socket itself here.
    fwrite(STDOUT, "****** A user disconnected ******\n");

    $socket_id = $user->id;
    foreach ($this->userID2socketID as $key => $value) {
        if($value == $socket_id) {
            $this->takeUserOffline($key); 
            unset($sockets_dict[$key]);
        }
    }
  }

  protected function takeUserOnline($user_id) {
    $server_name = $_SERVER["server_name"];
    $db_username = $_SERVER["db_username"];
    $db_password = $_SERVER["db_password"];
    $db_name = $_SERVER["db_name"];
    $conn = new mysqli($server_name, $db_username, $db_password, $db_name);
    if ($conn->connect_error) {
      die('Connection failed: ' . $conn->connect_error);
    }

    $sql = "DELETE FROM OnlineStatus WHERE UserID = ('$user_id')";

    if (!$conn->query($sql)) {
      die('Database write failed: ' . $conn->connect_error);
    }

    $sql = "INSERT INTO OnlineStatus (UserID) VALUES ('$user_id')";

    if (!$conn->query($sql)) {
      die('Database write failed: ' . $conn->connect_error);
    }
    $conn->close();
  }

  protected function takeUserOffline($user_id) {
    $server_name = $_SERVER["server_name"];
    $db_username = $_SERVER["db_username"];
    $db_password = $_SERVER["db_password"];
    $db_name = $_SERVER["db_name"];
    $conn = new mysqli($server_name, $db_username, $db_password, $db_name);
    if ($conn->connect_error) {
      die('Connection failed: ' . $conn->connect_error);
    }

    $sql = "DELETE FROM OnlineStatus WHERE UserID = ('$user_id')";

    if (!$conn->query($sql)) {
      die('Database write failed: ' . $conn->connect_error);
    }
    $conn->close();
  }

  protected function storeMessage($message) {
    $json = json_decode($message);
    if (is_null($json)) { return; }

    $server_name = $_SERVER["server_name"];
    $db_username = $_SERVER["db_username"];
    $db_password = $_SERVER["db_password"];
    $db_name = $_SERVER["db_name"];
    $conn = new mysqli($server_name, $db_username, $db_password, $db_name);

    if ($conn->connect_error) {
        die('Connection failed: ' . $conn->connect_error);
    }

    $sender_id = $json->{'user_id'};
    $receiver_id = $json->{'receiver_id'};
    $message = $json->{'msg'};

    $stmt_find_location = $conn->prepare("INSERT INTO Message (sender_id, receiver_id, message) VALUES (?, ?, ?)");
    $stmt_find_location->bind_param("sss", $sender_id, $receiver_id, $message); 
    $stmt_find_location->execute();
    $result = $stmt_find_location->get_result();

    $conn->close();
  }
}

$server = new DonkieDokieChatServer("0.0.0.0","9000");

try {
  $server->run();
}
catch (Exception $e) {
  $server->stdout($e->getMessage());
}
