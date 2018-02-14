let express=require('express')
let mongodb=require('mongodb')
let app=express()
var session=require('express-session');
var bodyParser = require('body-parser');
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true}));

var port = process.env.PORT || 3000;

app.use(express.static('public'));

//==================User page requests==================
app.get('/',function(req,res){
  let user=req.session.user;

  res.render(__dirname+"\\pages\\index.ejs",{user:user});
})

app.get('/user_posts',function(req,res){
  let user=req.session.user;
  if(user){
    res.render(__dirname+"\\pages\\user_posts.ejs",{user:user});
  }else{
    res.render(__dirname+"\\pages\\index.ejs",{user:user});
  }
})

app.get('/products',function(req,res){
  let user=req.session.user;
  res.render(__dirname+"\\pages\\products.ejs",{user:user})
})

app.get('/tutorials',function(req,res){
  let user=req.session.user;
  res.render(__dirname+"\\pages\\tutorials.ejs",{user:user})
})

app.get('/contact_us',function(req,res){
  let user=req.session.user;
  res.render(__dirname+"\\pages\\contact_us.ejs",{user:user})
})

//===================User post calls===================
app.post('/register',function(req,res){
  let form=req.body;

  if(!validateRegister(form)){
    res.send({error:"Invalid details."});
    return;
  }

  form.mobilenumber='+'+form.mobilenumber;
  form.posts=[];
  mongodb.connect(process.env.DB_URL,function(err,db){
    if(err){
      res.send({error:"Error"});
    }else{
      db.collection('users').updateOne({mobilenumber:form.mobilenumber},form,{upsert:true},function(err,results){
        if(err){
          res.send({error:"Error"});
        }else{
          res.send("Success");
        }
      });
    }
  })
})

function validateRegister(form){
  var keyArray=['usertype','name','mobilenumber','password','address','district','state' ];
  if(!arrayEqual(Object.keys(form),keyArray)){
    return false;
  }

  var nameReg=/^[\sa-zA-Z]{2,}$/,
      typeReg=/^(farmer|wholesaler)$/,
      mnumberReg=/^\d{10,13}$/,
      addressReg=/.{5,}/;

  return form.usertype.match(typeReg) && form.name.match(nameReg) && form.password.match(addressReg)
      && form.mobilenumber.match(mnumberReg) && form.address.match(addressReg)
      && form.district.match(nameReg) && form.state.match(nameReg);
}

function arrayEqual(ar1,ar2){
  if(ar1.length!=ar2.length)
    return false;
  for(var i=0;i<ar1.length;i++)
    if(ar1[i]!=ar2[i])
      return false;
  return true;
}

//--------------------User login--------------------
app.post('/user_login',function(req,res){
  if(req.session.user){
    res.send({error:"Already logged in."});
    return;
  }

  let form=req.body;

  if(!validateLogin(form)){
    res.send({error:"Invalid details."});
    return;
  }

  mongodb.connect(process.env.DB_URL,function(err,db){
    if(err){
      res.send({error:"Error"});
    }else{
      db.collection('users').findOne({mobilenumber:form.mobilenumber},function(err,doc){
        if(err){
          res.send({error:"Error"});
        }else{
          if(doc){
            if(doc.password==form.password){
              console.log(doc);
              req.session.user=doc;
              res.send("Success");
            }else{
              res.send({error:"Wrong password."});
            }
          }else{
            res.send({error:"Mobile number not registered"});
          }
        }
      });
    }
  })
})

function validateLogin(form) {
  var keyArray=['mobilenumber','password'];

  if(!arrayEqual(Object.keys(form),keyArray)){
    return false;
  }

  var mnumberReg=/^[+]\d{10,13}$/,
      addressReg=/.{5,}/;

  return form.password.match(addressReg) && form.mobilenumber.match(mnumberReg);
}

app.post('/user_logout',function(req,res){
  req.session.user=null;
  res.send('Success')
});

app.post('/get_my_posts',function(req,res){
  let user=req.session.user;
  if(user){
    mongodb.connect(process.env.DB_URL,function(err,db){
      if(err){
        res.send({error:"Error"});
      }else{
        db.collection('yield-posts').find({mobilenumber:user.mobilenumber}).toArray(function(err,doc){
          if(err){
            res.send({error:"Error"});
          }else{
            if(doc){
              res.send(doc)
            }else{
              res.send({error:"Mobile number not registered"});
            }
          }
        });
      }
    })
  }else{
    res.send({error:"Login required"})
  }
})

//--------------------Add post--------------------
app.post('/add_post',function(req,res){
  let user=req.session.user;

  if(user){
    mongodb.connect(process.env.DB_URL,function(err,db){
      if(err){
        res.send({error:'Error'})
      }else{
        req.body.mobilenumber=user.mobilenumber;
        req.body.usertype=user.usertype;
        db.collection('yield-posts').insert(req.body,function(err,doc){
          if(err){
            res.send({error:'Error'})
          }else{
            res.send('Success')
          }
        })
      }
    })
  }else{
    res.send({error:'Access denied'})
  }
});
//--------------------Get posts--------------------
app.post('/get_supply_posts',function(req,res){
  mongodb.connect(process.env.DB_URL,function(err,db){
    if(err){
      res.send({error:'Error'})
    }else{
      db.collection('yield-posts').find({usertype:'farmer'}).toArray(function(err,doc){
        if(err){
          res.send({error:'Error'})
        }else{
          if(doc){
            res.send(doc)
          }else{
            res.send([])
          }
        }
      })
    }
  })
});

app.post('/get_demand_posts',function(req,res){
  mongodb.connect(process.env.DB_URL,function(err,db){
    if(err){
      res.send({error:'Error'})
    }else{
      db.collection('yield-posts').find({usertype:'wholesaler'}).toArray(function(err,doc){
        if(err){
          res.send({error:'Error'})
        }else{
          if(doc){
            res.send(doc)
          }else{
            res.send([])
          }
        }
      })
    }
  })
});
//--------------------Listener--------------------
let listener=app.listen(3000,function(req,res){
  console.log("Listening...");
});
