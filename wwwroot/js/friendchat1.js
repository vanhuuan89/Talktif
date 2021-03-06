("use strict");
var connection = new signalR.HubConnectionBuilder().withUrl("/chathub").build();
var userCnnID;

function AddMessage(user, room, msg, token) {
  var xhr = new XMLHttpRequest();
  xhr.open(
    "POST",
    "https://talktifapi.azurewebsites.net/api/Chat/AddMessage",
    true
  );
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + token);
  xhr.send(`{"Message":"${msg}","IdSender":"${user}","idChatRoom":"${room}"}`);
}

function ReportUser(user, sus, reason, note, token) {
  var xhr = new XMLHttpRequest();
  xhr.open(
    "POST",
    "https://talktifapi.azurewebsites.net/api/Users/Report",
    true
  );
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + token);
  xhr.send(
    `{"Reporter":"${user}","Suspect":"${sus}","Reason":"${reason}","Note":"${note}"}`
  );
}

//Disable send button until connection is established
document.getElementById("sendButton").disabled = true;

connection.on("ReceiveMessage", function (user, message) {
  var msg = message;
  var div = document.createElement("div");
  div.className =
    user != userCnnID
      ? "message-row other-message"
      : "message-row your-message";
  var divContent = document.createElement("div");
  divContent.className = "message-text";
  divContent.textContent = msg;
  div.appendChild(divContent);
  document.getElementsByClassName("message-box-content")[0].appendChild(div);
  if (user != userCnnID) {
    var messAudio = new Audio("/message.mp3");
    messAudio.play();
  }
  document
    .getElementsByClassName("message-box-content")[0]
    .scrollTo(
      0,
      document.getElementsByClassName("message-box-content")[0].scrollHeight
    );
});

connection
  .start()
  .then(function () {
    if (!userCnnID) userCnnID = connection.connectionId;
    document.getElementById("sendButton").disabled = false;
    connection.invoke("JoinFriendChat", String(roomID)).catch((err) => {
      return console.error(err.toString());
    });
  })
  .catch(function (err) {
    return console.error(err.toString());
  });

window.onbeforeunload = function () {
  connection.invoke("LeaveFriendChat", String(roomID)).catch((err) => {
    return console.error(err.toString());
  });
};

document
  .getElementsByTagName("form")[0]
  .addEventListener("submit", function (event) {
    event.preventDefault();

    // Send msg real-time
    var message = document.getElementById("message").value;
    document.getElementById("message").value = "";
    connection
      .invoke("SendFriendMessage", String(roomID), message)
      .catch(function (err) {
        return console.error(err.toString());
      });

    // Call API add message
    AddMessage(String(userID), String(roomID), message, token);
  });

document
  .getElementById("reportBtn")
  .addEventListener("click", function (event) {

    var reason = document.getElementById("reportReason").value;
    var note = document.getElementById("reportNote").value;
    
    ReportUser(String(userID), String(friendID), reason, note, token)
  });
