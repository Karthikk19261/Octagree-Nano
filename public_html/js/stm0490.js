function stmsender(){
   var fname=$("#p_name").val();
   var femail=$("#p_email").val();
   var subject=$("#p_subject").val();
   var message=$("#p_message").val();
  $.post("ex_feedback.php",
  {
	name: fname,
    email: femail,
	subject: subject,
	message: message
  },
  function(data, status){
   // alert("Data: " + data + "\nStatus: " + status);
   $("#success").html(data);
  });
}

function contactquote(){
   var fname=$("#p_name").val();
   var quotefor=$("#quotefor").val();
   var email=$("#p_email").val();
   var subject=$("#p_subject").val();
   var message=$("#p_message").val();
  $.post("ex_contactquote.php",
  {
	name: fname,
	quotefor:quotefor,
    email: email,
	subject: subject,
	message: message
  },
  function(data, status){
   // alert("Data: " + data + "\nStatus: " + status);
   $("#success").html(data);
  });
}

function contactus(){
   var fname=$("#p_name").val();
   var femail=$("#p_email").val();
   var subject=$("#p_subject").val();
   var message=$("#p_message").val();
  $.post("ex_contactus.php",
  {
	name: fname,
    email: femail,
	subject: subject,
	message: message
  },
  function(data, status){
   // alert("Data: " + data + "\nStatus: " + status);
   $("#success").html(data);
  });
}
