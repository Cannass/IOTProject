load('api_config.js');
load('api_shadow.js');
load('api_esp8266.js');
load('api_timer.js');
load('api_sys.js');
load('api_events.js');
load('api_mqtt.js');
load('api_net.js');


let state = {state: true};                                  //Se il device è acceso o spento
let waterUse = {water: false};                              //Se il device sta irrigando 
let water = {waterTime: 10000};                             //Tempo di irrigazione in ms
let temperature = {temperature: 10000};           
let operator = {operator: "gt"};                            //Operatore condizionale per la temperatura
let condition = {condition: 7.6};                           //Condizione Temperatura impostata da Web
let measure_send_on_awake= {measure_send_on_awake: true};   //Se il device deve inviare al risveglio
let battery = {Battery:10};                                 //Stato batteria
let sleep = {SleepTime:30000};                              //Tempo di deepSleep

let topic = '/devices';                                     //Topic in cui il device deve inviare i dati

//Shadow handler per gestire gli eventi di AWS
 Shadow.addHandler(function(event, obj) {
   if (event === 'CONNECTED') {               //Device Connesso allo shadow
   //Eseguo il report dei dati nel momento in cui si connette
    Shadow.update(0, water);
    Shadow.update(0, battery);
    Shadow.update(0, sleep);
    Shadow.update(0, state);
    Shadow.update(0, waterUse);
    Shadow.update(0, temperature);
    Shadow.update(0, operator);
    Shadow.update(0, condition);
    Shadow.update(0, measure_send_on_awake);
        
  } else if (event === 'UPDATE_DELTA') {  //AWS invia un aggiornamento dello shadow
      //Scorro gli oggetti per chiave diretta e aggiorno il loro valore, è possibile anche gestire chiavi non registrate
      //for (let key in obj) ...
      if(obj.waterTime){
         water.waterTime = obj.waterTime;
         Shadow.update(0, water);
      }
      if(obj.Battery){
        battery.Battery = obj.Battery;
        Shadow.update(0, battery);
      }
      if(obj.SleepTime){
        sleep.SleepTime = obj.SleepTime;
        Shadow.update(0, sleep);
      }
      if(obj.state){
        state.state = obj.state;
        Shadow.update(0, state);
      }
      if(obj.water){
        waterUse.water = obj.water;
        Shadow.update(0, waterUse);
      }
      if(obj.temperature){
        temperature.temperature = obj.temperature;
        Shadow.update(0, temperature);
      }
      if(obj.operator){
        operator.operator = obj.operator;
        Shadow.update(0, operator);
      }
      if(obj.condition){
        condition.condition = obj.condition;
        Shadow.update(0, condition);
      }
      if(obj.measure_send_on_awake){        
          measure_send_on_awake.measure_send_on_awake = obj.measure_send_on_awake;
        Shadow.update(0,measure_send_on_awake);
      }
      if(obj.measure_send_on_awake){        
          measure_send_on_awake.measure_send_on_awake = obj.measure_send_on_awake;
        Shadow.update(0,measure_send_on_awake);
      }
  }
});

//Funzione per generare dati costanti per il testing, i dati sono identici a quelli che restituirebbe il device sul terreno
let getInfo = function() {
    return JSON.stringify({
    device_id: "ASOAMA7", model: "NODE MCU", description: 'prova',temperature: 45, umidity: 40, soil_moisture: 59, light_level: 27,
  code: 11, type: "wake", time: Timer.now()});
};
//Funzione di supporto per la gestione del device senza mandarlo in deepSleep (è difficile capire cosa stia facendo il device)
//Timer in millisecondi
Timer.set(sleep.SleepTime, Timer.REPEAT, function() {
  //Invio dei dati ad AWS IOT
  let message = getInfo();
  let ok = MQTT.pub(topic, message, 1);
 }, null);
 
 //Invio dei dati ad AWS IOT 
 let message = getInfo();
 let ok = MQTT.pub(topic, message, 1);
 //Gestione del deepSleep in microsecondi
 ESP8266.deepSleep(300000);
 
