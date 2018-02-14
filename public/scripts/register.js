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
      $(elementSel).parent().css("color","black");
    }else{
      $(elementSel).parent().css("color","red");
    }
    return t;
  }
}

$(document).on('click','#register',function(){
    $("#invalid_error").css("display","none")
    $(".form-group").css('color','black');

    var formEntries=[];

    var nameReg=/^[\sa-zA-Z]{2,}$/,
        typeReg=/^(farmer|wholesaler)$/,
        mnumberReg=/^\d{10,13}$/,
        addressReg=/.{5,}/;

    console.log($("input[name='user-type']:checked").val());
    formEntries.push(new formEntry("input[name='user-type']:checked",typeReg,false))
    formEntries.push(new formEntry("#name",nameReg,true))
    formEntries.push(new formEntry("#mnumber",mnumberReg,false))
    formEntries.push(new formEntry("#passwd",addressReg,false))
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
});

//--------------------Functions--------------------

function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
}
