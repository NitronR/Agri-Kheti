$(document).ready(function(){
  $.post('/get_my_posts',function(res){
    if(res.error){
      alert(res.error)
    }else{
      if(res.length==0){
        $('#my_posts').html('No posts added by you.')
      }else{
        $('#my_posts').html('<ul class="list-group">')
        res.forEach(function(e){
          $('#my_posts').append(`
            <li class="list-group-item">Crop type : `+e['crop-type']+`,
             Crop quantity : `+e['crop-quantity']+` Kg, Contact number : `+e.mobilenumber+`</li>
            `);
        });
        $('#my_posts').append('</ul>')
      }
    }
  })
})

function formEntry(elementSel,regex,isTitleCase){
  var element=$(elementSel)
  if(element.length==0)
    this.val='undef'
  else
    if(elementSel=='#passwd')
      this.val=element.val()
    else
      this.val=element.val().trim()

  if(isTitleCase)
    this.val=titleCase(this.val)

  this.regex=regex;
  this.elementSel=elementSel;
  this.valid=function(){
    var t=this.val.match(this.regex);
    if(t){
      $(elementSel).parent().css("color","white");
    }else{
      $(elementSel).parent().css("color","red");
    }
    return t;
  }
}

$(document).on('click','#add_post',function(){
  $('#modal-add-post').modal()
})

$(document).on('click','#confirm-add-post',function(){
  var nameReg=/^[\sa-zA-Z]{2,}$/,
      numberReg=/^\d{1,10}$/;

  var formEntries=[];

  formEntries.push(new formEntry("#crop-type",nameReg,true))
  formEntries.push(new formEntry("#crop-quantity",numberReg,false))

  var error=false;
  formEntries.forEach(function(e){
    if(!e.valid())
      error=true;
  });

  $.post('/add_post',
  {
    'crop-type':formEntries[0].val,
    'crop-quantity':formEntries[1].val
  },function(res){
    if(res.error){
      alert(res.error)
    }else{
      alert('Success')
      location.reload()
    }
  })
})

//--------------------Functions--------------------
function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
}
