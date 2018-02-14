var links=[
  "https://www.youtube.com/embed/1RoOVru3o3k",
  "https://www.youtube.com/embed/U-SEZlo8Oi8",
  "https://www.youtube.com/embed/8IVImBhrTaE",
  "https://www.youtube.com/embed/k18x_ZER5h8"
]

$(document).on('click','.list-group-item',function(){
  var ind=$(this).index();
  console.log(ind);
  $('#tutorial-frame').attr('src',links[ind])
});
