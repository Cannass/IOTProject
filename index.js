// Currently, Lambda only supports node v6, so no native async/await.
const mongoose = require('mongoose');

let conn = null;
//inserire indirizzo ip della macchina EC2
const uri = 'mongodb://x.x.x.x:27017/Devices';

exports.handler = function(event, context, callback) {
  // Vedi https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas

  //Permette alle funzioni lambda di utilizzare la connessione utilizzata da un'altra funzione per la connessione al database
  context.callbackWaitsForEmptyEventLoop = false;
  
  var time= new Date();
  mongoose.connect(uri);
  mongoose.Promise = global.Promise;
  
  var db = mongoose.connection;

  //Gestione dell'errore
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  
  db.once('open', function () {
    //Connessione alla collection Device
    db.db.collection("Device", function(err, collection){
      if(err){
       var error = new Error("Connessione alla collection Device fallita.");
        callback(error);
      }
      //Inserimento dati
      collection.insert({"device_id": event.device_id,"model": event.model,"description": event.description});
    });
    
    //Connessione alla collection Actions
    db.db.collection("Actions", function(err, collection){
      if(err){
       var error = new Error("Connessione alla collection Actions fallita.");
        callback(error);
     }
     //Inserimento dati
      collection.insert({"device_id": event.device_id,"timestamp":time.setUTCSeconds(event.time),"code": event.code,"type": event.type});
    });
    
    //Connessione alla collection Measurements
    db.db.collection("Measurements", function(err, collection){
      if(err){
       var error = new Error("Connessione alla collection Measurements fallita.");
        callback(error);
     }
     //Inserimento dati
      collection.insert({"device_id": event.device_id,"timestamp":time,"temperature": event.temperature,"umidity": event.umidity,"soil_moisture": event.soil_moisture,"light_level": event.light_level});
    });
  
  
  });
  db.close();
  
};