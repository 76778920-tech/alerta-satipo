#include <Arduino.h>
#include <Wire.h>
#include <LittleFS.h>
#include <ArduinoJson.h>
#include <Adafruit_BME280.h>
#include <Adafruit_PM25AQI.h>
#include "config.h"
#include "generated_model.h"
#include "mobile_ble.h"
#ifdef PMV1_EDGE_HEADER
#include PMV1_EDGE_HEADER
static_assert(EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE == 5, "El modelo debe recibir cinco valores por registro");
static_assert(EI_CLASSIFIER_LABEL_COUNT == 3, "Se requieren tres clases");
#endif

Adafruit_BME280 climate;
Adafruit_PM25AQI particulate;
const char* levels[]={"Normal","Advertencia","Emergencia"};
bool ready=false;
uint32_t lastRead=0,sequence=0;

void error(const char* message){JsonDocument d;d["error"]=message;serializeJson(d,Serial);Serial.println();}
void uuid(char result[37]){
  uint32_t a=esp_random(),b=esp_random(),c=esp_random(),d=esp_random();
  snprintf(result,37,"%08lx-%04x-%04x-%04x-%04x%08lx",(unsigned long)a,(unsigned)(b>>16),(unsigned)((b&0xfff)|0x4000),(unsigned)((c>>16&0x3fff)|0x8000),(unsigned)(c&0xffff),(unsigned long)d);
}
bool valid(const float x[5]){
 const float low[]={-20,0,0,0,0},high[]={80,100,100,100,1000};
 for(int i=0;i<5;i++)if(!isfinite(x[i])||x[i]<low[i]||x[i]>high[i])return false;
 return true;
}
bool acquire(float x[5]){
#if PMV1_SIMULATION
 const float fixtures[3][5]={{25,70,10,12,15},{34,48,45,42,90},{52,25,85,82,260}};
 for(int i=0;i<5;i++)x[i]=fixtures[sequence%3][i];
 return true;
#else
 if(!PMV1_CALIBRATED||PMV1_WARMUP_MS==0||PMV1_SMOKE_MAX_MV<=PMV1_SMOKE_MIN_MV||PMV1_GAS_MAX_MV<=PMV1_GAS_MIN_MV){error("calibracion_requerida");return false;}
 if(millis()<PMV1_WARMUP_MS){error("calentamiento");return false;}
 PM25_AQI_Data dust;
 if(!particulate.read(&dust)){error("particulas_no_disponibles");return false;}
 x[0]=climate.readTemperature();x[1]=climate.readHumidity();
 const float smoke=analogReadMilliVolts(PMV1_SMOKE_ADC),gas=analogReadMilliVolts(PMV1_GAS_ADC);
 // Saturación o señal fuera de calibración se rechaza; no se recorta a cero.
 if(smoke<=PMV1_SMOKE_MIN_MV||smoke>=PMV1_SMOKE_MAX_MV||gas<=PMV1_GAS_MIN_MV||gas>=PMV1_GAS_MAX_MV){error("senal_fuera_calibracion");return false;}
 x[2]=100*(smoke-PMV1_SMOKE_MIN_MV)/(PMV1_SMOKE_MAX_MV-PMV1_SMOKE_MIN_MV);
 x[3]=100*(gas-PMV1_GAS_MIN_MV)/(PMV1_GAS_MAX_MV-PMV1_GAS_MIN_MV);
 x[4]=dust.pm25_env;
 return true;
#endif
}
int infer(float x[5]){
#ifdef PMV1_EDGE_HEADER
 signal_t signal;ei_impulse_result_t result={0};
 if(numpy::signal_from_buffer(x,5,&signal)!=0||run_classifier(&signal,&result,false)!=EI_IMPULSE_OK)return -1;
 size_t winner=0;for(size_t i=1;i<EI_CLASSIFIER_LABEL_COUNT;i++)if(result.classification[i].value>result.classification[winner].value)winner=i;
 for(int i=0;i<3;i++)if(strcmp(result.classification[winner].label,levels[i])==0)return i;
 return -1;
#else
 return pmv1_predict(x);
#endif
}
void setup(){
 Serial.begin(115200);
 // No se inicializa WiFi: adquisición, inferencia y archivo son locales.
 if(!LittleFS.begin(false)){error("littlefs_no_montado_no_se_formatea_automaticamente");return;}
#if !PMV1_SIMULATION
 Wire.begin(PMV1_I2C_SDA,PMV1_I2C_SCL);
 if(!climate.begin(0x76)&&!climate.begin(0x77)){error("bme280_no_disponible");return;}
 Serial1.begin(9600,SERIAL_8N1,PMV1_PM_RX,PMV1_PM_TX);
 if(!particulate.begin_UART(&Serial1)){error("pms_no_disponible");return;}
 analogReadResolution(12);analogSetAttenuation(ADC_11db);
#endif
 mobileBegin();ready=true;
}
void loop(){
 if(!ready||millis()-lastRead<PMV1_INTERVAL_MS){delay(10);return;}lastRead=millis();
 float x[5];if(!acquire(x))return;if(!valid(x)){error("registro_incompleto_o_fuera_rango");return;}
 uint32_t started=micros();int prediction=infer(x);uint32_t elapsed=micros()-started;
 if(prediction<0||prediction>2){error("inferencia_fallida");return;}
 char id[37];uuid(id);JsonDocument row;row["id"]=id;row["node_id"]=PMV1_NODE_ID;
 row["source"]=PMV1_SIMULATION?"simulation":"sensor";
 row["device_uptime_ms"]=millis();row["sequence"]=sequence++;
 const char* names[]={"temperature_c","humidity_pct","smoke_index","gas_index","dust_ugm3"};
 for(int i=0;i<5;i++)row["values"][names[i]]=x[i];
 row["device_prediction"]["level"]=levels[prediction];row["device_prediction"]["latency_us"]=elapsed;
#ifdef PMV1_EDGE_HEADER
 row["device_prediction"]["model_version"]="edge-impulse-user-export";
#else
 row["device_prediction"]["model_version"]=PMV1_MODEL_VERSION;
#endif
 row["device_prediction"]["experimental"]=true;
 File log=LittleFS.open("/readings.ndjson",FILE_APPEND);
 if(!log||log.size()>200000){error("almacenamiento_lleno_o_no_disponible");ready=false;return;}
 const size_t expected=measureJson(row),written=serializeJson(row,log);const size_t newline=log.println();log.flush();log.close();
 if(written!=expected||!newline){error("escritura_incompleta");ready=false;return;}
 serializeJson(row,Serial);Serial.println();
 String payload;serializeJson(row,payload);mobileSend(payload);
}
