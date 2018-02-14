$(document).ready(function(){
  $.post('/get_supply_posts',function(res){
    if(res.error){
      alert(res.error)
    }else{
      if(res.length==0){
        $('#supply').html('No posts');
      }else{
        $('#supply').html('<ul class="list-group">')
        res.forEach(function(e){
          $('#supply').append(`
            <li class="list-group-item">Crop type : `+e['crop-type']+`,
             Crop quantity : `+e['crop-quantity']+` Kg, Contact number : `+e.mobilenumber+`</li>
          `);
        });
        $('#supply').append('</ul>')
      }
    }
  })


  $.post('/get_demand_posts',function(res){
    if(res.error){
      alert(res.error)
    }else{
      if(res.length==0){
        $('#demand').html('No posts');
      }else{
        $('#demand').html('<ul class="list-group">')
        res.forEach(function(e){
          $('#demand').append(`
            <li class="list-group-item">Crop type : `+e['crop-type']+`
            , Crop quantity : `+e['crop-quantity']+` Kg, Contact number : `+e.mobilenumber+`</li>
          `);
        });
        $('#demand').append('</ul>')
      }
    }
  })
})

$(document).on('click', '#login_register', function (event) {
  $("#modal-login-register").modal();
});

let login=true;
$(document).on('click','#login-tab',function(){
  login=true;
  $('#login-tab').addClass('active')
  $('#register-tab').removeClass('active')
  $("#login-form").css('display','block');
  $("#register-form").css('display','none');
})

$(document).on('click','#register-tab',function(){
  login=false;
  $('#login-tab').removeClass('active')
  $('#register-tab').addClass('active')
  $("#login-form").css('display','none');
  $("#register-form").css('display','block');
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

$(document).on('click','#ok-login-register',function(){
  $("#invalid_error").css("display","none")
  $(".form-group").css('color','white');
  var formEntries=[];
  if(login){
    var mnumberReg=/^[+]\d{10,13}$/,
        addressReg=/.{5,}/;

    formEntries.push(new formEntry("#login_mnumber",mnumberReg,false))
    formEntries.push(new formEntry("#login_passwd",addressReg,false))

    var error=false;
    formEntries.forEach(function(e){
      if(!e.valid())
        error=true;
    });

    if(error){
      $("#invalid_error").css("display","block");
      formEntries=[];
      return;
    }

    $.post('/user_login',
    {
      mobilenumber:formEntries[0].val,
      password:formEntries[1].val
    },function(res){
      if(res.error){
        alert(res.error)
      }else{
        location.reload()
      }
    })
  }else{
    var formEntries=[];

    var nameReg=/^[\sa-zA-Z]{2,}$/,
        typeReg=/^(farmer|wholesaler)$/,
        mnumberReg=/^\d{10,13}$/,
        addressReg=/.{5,}/;

    formEntries.push(new formEntry("input[name='user-type']:checked",typeReg,false))
    formEntries.push(new formEntry("#name",nameReg,true))
    formEntries.push(new formEntry("#register_mnumber",mnumberReg,false))
    formEntries.push(new formEntry("#register_passwd",addressReg,false))
    formEntries.push(new formEntry("#address",addressReg,false))
    formEntries.push(new formEntry("#district",nameReg,true))
    formEntries.push(new formEntry("#state",nameReg,true))

    var error=false;
    formEntries.forEach(function(e){
      if(!e.valid())
        error=true;
    });

    if($('#cpasswd').val()!=formEntries[3].val){
      error=true;
      $('#cpasswd').parent().css('color','red')
    }

    if(error){
      $("#invalid_error").css("display","block");
      formEntries=[];
      return;
    }

    $.post('/register',
    {
      usertype:formEntries[0].val,
      name:formEntries[1].val,
      mobilenumber:formEntries[2].val,
      password:formEntries[3].val,
      address:formEntries[4].val,
      district:formEntries[5].val,
      state:formEntries[6].val,
    },function(res){
      if(res.error){
        alert(res.error)
      }else{
        alert('Success')
        location.reload()
      }
    })
  }
})

$(document).on('click','#logout',function(){
  $.post('/user_logout',function(res){
    location.reload()
  })
})

$(document).on('click','#supply-tab',function(){
  $('#supply').css('display','block')
  $('#demand').css('display','none')

  $('#supply-tab').addClass('active')
  $('#demand-tab').removeClass('active')
})

$(document).on('click','#demand-tab',function(){
  $('#supply').css('display','none')
  $('#demand').css('display','block')

  $('#supply-tab').removeClass('active')
  $('#demand-tab').addClass('active')
})

//--------------------Functions--------------------
function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
}
