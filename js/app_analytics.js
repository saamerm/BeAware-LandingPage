
/* ---------------------------------------------
 Custom Analytics
 --------------------------------------------- */
 (function($){
    "use strict"; // Start of use strict    
    $(document).ready(function(){
        // pageViewed(); doesnt work with both, so prefer the second
        // test() for testing purposes
        requestReferrerAndLocation();  
    });
})(jQuery); // End of use strict


/* ---------------------------------------------
 Custom GDPR compliant analytics
 --------------------------------------------- */
 
  function pageViewed() {
    var url = "https://script.google.com/macros/s/AKfycbxzEJVBRmE-z7ZY4C6FRzxPn28TKW6mozP73FfPuVgXYgauG3_MnhroSoe5wVyE8eUkMg/exec";
    var myJSObject='{"Event": "' + "PageView: BeAware" + '"}';    
    postCall(url, myJSObject);
  }

  function test() {
    console.log(navigator)
    console.log(navigator.vendor)
    console.log(navigator.userAgent.includes("Safari"))
  }

 function submitMessage()
 {
   var Name = document.getElementById('contact_name').value;
   var Email = document.getElementById('contact_email').value;      
   var Message = document.getElementById('contact_message').value;      
   postFeedbackAPI(Name, Email, Message)
 }
 
 function requestReferrerAndLocation()
 {
   $.getJSON("https://ipinfo.io/json", function (data) {
     console.log("data: " + data);
     var str = data.city + ", " + data.region + ", " + data.country;
     console.log("IP: " + str);
     sendLocationRequest(str);
   });
 }  
 
 function sendLocationRequest(str)
 {
   var Name = str;
   var Email = document.URL;      
   var Message = document.referrer; 
   postFeedbackAPI(Name, Email, Message)
 }
  
 function postFeedbackAPI(Name, Email, Message)
 {
   var platform = ""
   if (navigator.vendor.includes("Apple") || navigator.userAgent.includes("Safari")){
      platform = "Apple"
   }
   else {
      platform = navigator.vendor
   }

   var url = "https://script.google.com/macros/s/AKfycbz42xFl_59V36k5VJgldCLFRBv9Gw1n2Z6XapMt1V9d_G-deUaoaOYbkqHddM3HnzA/exec";
   var myJSObject='{"Name": "' + Name + '", "Email" : "' + Email + '", "Message" : "' + Message + ", " + platform + '"}';    
   postCall(url, myJSObject);
 }
 
 function postCall(url, myJSObject) {
     $.ajax({
     type: "POST",
     url: url,
     data: myJSObject,
     success: function (response) {
       console.log(response);
     },
     error: function (error) {
       console.log(error.responseText);
     },
     complete: function(data) {
      console.log("Done");
      if (navigator.vendor.includes("Apple") || navigator.userAgent.includes("Safari")){
        window.location.href = "https://apps.apple.com/app/beaware-deaf-hard-of-hearing/id1609670787"
      }
      else {
        window.location.href = "https://play.google.com/store/apps/details?id=com.beaware.deafassistant"
      }
     }

   });
 }